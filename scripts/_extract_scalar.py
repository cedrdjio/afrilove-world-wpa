#!/usr/bin/env python3
"""Extract a single scalar field from row 0 of a persisted MCP tool-result and
write it verbatim to an output file. Keeps large SQL/data exports out of the
model context: result-file -> disk.

Usage: python3 scripts/_extract_scalar.py <persisted_result> <output_file> <json_key>
"""
import json
import re
import sys

persisted, out_path, key = sys.argv[1], sys.argv[2], sys.argv[3]
raw = open(persisted).read()

text = raw
try:
    outer = json.loads(raw)
    if isinstance(outer, list):
        for blk in outer:
            if isinstance(blk, dict) and blk.get("type") == "text":
                text = blk["text"]
                break
except Exception:
    pass

result = text
try:
    obj = json.loads(text)
    if isinstance(obj, dict) and "result" in obj:
        result = obj["result"]
except Exception:
    pass

m = re.search(r"<untrusted-data-[0-9a-f-]+>\n(.*)\n</untrusted-data-", result, re.DOTALL)
payload = m.group(1) if m else result
parsed = json.loads(payload)
value = parsed[0][key]
if value is None:
    value = ""
with open(out_path, "w") as f:
    f.write(value if value.endswith("\n") else value + "\n")
print(f"wrote {out_path} ({len(value)} bytes)")
