#!/usr/bin/env python3
"""Extract the `batch` array from a persisted MCP tool-result file and write
each {version,name,sql} as a migration file. Lets large exports flow
result-file -> disk without passing through the model context.

Usage: python3 scripts/_process_tool_result.py <persisted_result.json>
"""
import json
import os
import re
import sys

MIG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "supabase", "migrations")
os.makedirs(MIG_DIR, exist_ok=True)


def extract_rows(path):
    outer = json.load(open(path))
    # tool result is a list of content blocks; find the text block
    text = None
    if isinstance(outer, list):
        for blk in outer:
            if isinstance(blk, dict) and blk.get("type") == "text":
                text = blk["text"]
                break
    else:
        text = outer
    obj = json.loads(text)
    result = obj["result"] if isinstance(obj, dict) and "result" in obj else text
    m = re.search(r"<untrusted-data-[0-9a-f-]+>\n(.*)\n</untrusted-data-", result, re.DOTALL)
    payload = m.group(1) if m else result
    parsed = json.loads(payload)
    return parsed[0]["batch"]


rows = extract_rows(sys.argv[1])
for r in rows:
    fname = f"{r['version']}_{r['name']}.sql"
    with open(os.path.join(MIG_DIR, fname), "w") as f:
        f.write(r["sql"].rstrip() + "\n")
    print(f"wrote {fname} ({len(r['sql'])} bytes)")
print(f"total {len(rows)} migration(s)")
