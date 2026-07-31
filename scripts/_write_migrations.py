#!/usr/bin/env python3
"""Reads a JSON array of {version, name, sql} from stdin and writes each as
supabase/migrations/<version>_<name>.sql. Used by the export process to
reconstruct the exact migration history from supabase_migrations.schema_migrations."""
import json
import os
import sys

MIG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "supabase", "migrations")
os.makedirs(MIG_DIR, exist_ok=True)

rows = json.load(sys.stdin)
for r in rows:
    fname = f"{r['version']}_{r['name']}.sql"
    path = os.path.join(MIG_DIR, fname)
    with open(path, "w") as f:
        f.write(r["sql"].rstrip() + "\n")
    print(f"wrote {fname} ({len(r['sql'])} bytes)")
print(f"total {len(rows)} migration(s)")
