#!/usr/bin/env node
// Copies every Storage object from the SOURCE Supabase project to the TARGET,
// preserving bucket + object path exactly (so the public URLs stored in the
// database resolve identically after you also update the project ref in those
// URLs — see RESTORE.md, "Rewriting stored URLs").
//
// The binary files live in S3, not in Postgres, so they cannot travel in the
// SQL export — this script is how the clone gets its photos / KYC docs / brand
// assets. It reads export/storage/objects_manifest.json for the file list.
//
// Requires service_role keys for BOTH projects (they bypass RLS and can read
// private buckets). Never commit these — pass them as environment variables:
//
//   SRC_SUPABASE_URL=https://xhpwmondzarbnzciruis.supabase.co \
//   SRC_SERVICE_KEY=<source service_role key> \
//   DST_SUPABASE_URL=https://<new-ref>.supabase.co \
//   DST_SERVICE_KEY=<target service_role key> \
//   node scripts/migrate-storage-files.mjs
//
// Install the client first:  npm i @supabase/supabase-js
//
// Idempotent: re-running overwrites (upsert) so an interrupted copy can resume.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(here, '..', 'export', 'storage', 'objects_manifest.json');

const { SRC_SUPABASE_URL, SRC_SERVICE_KEY, DST_SUPABASE_URL, DST_SERVICE_KEY } = process.env;
for (const [k, v] of Object.entries({ SRC_SUPABASE_URL, SRC_SERVICE_KEY, DST_SUPABASE_URL, DST_SERVICE_KEY })) {
  if (!v) {
    console.error(`Missing required env var: ${k}`);
    process.exit(1);
  }
}

const src = createClient(SRC_SUPABASE_URL, SRC_SERVICE_KEY, { auth: { persistSession: false } });
const dst = createClient(DST_SUPABASE_URL, DST_SERVICE_KEY, { auth: { persistSession: false } });

const objects = JSON.parse(readFileSync(manifestPath, 'utf8'));
console.log(`Copying ${objects.length} object(s)…`);

let ok = 0;
let failed = 0;
for (const obj of objects) {
  const { bucket_id: bucket, name, mimetype } = obj;
  try {
    const { data, error: dErr } = await src.storage.from(bucket).download(name);
    if (dErr) throw dErr;
    const buffer = Buffer.from(await data.arrayBuffer());
    const { error: uErr } = await dst.storage.from(bucket).upload(name, buffer, {
      contentType: mimetype || 'application/octet-stream',
      upsert: true,
    });
    if (uErr) throw uErr;
    ok++;
    if (ok % 10 === 0) console.log(`  …${ok}/${objects.length}`);
  } catch (e) {
    failed++;
    console.error(`  FAILED ${bucket}/${name}: ${e.message || e}`);
  }
}

console.log(`Done. ${ok} copied, ${failed} failed.`);
process.exit(failed ? 1 : 0);
