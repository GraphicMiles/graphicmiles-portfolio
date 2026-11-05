#!/usr/bin/env python3
"""Ship the Drop landing page.

`src/index.standalone.html` is the authoritative page: one file, every asset
already inlined as base64 (four Switzer weights, two photographs, the favicon),
so it makes no network requests. This script copies it to `../index.html`, the
file Vercel serves at /drop/, and refuses to ship it if anything would be
loaded remotely.

    cd src && python3 build.py
"""
import pathlib
import re

BUILD = pathlib.Path(__file__).resolve().parent
ROOT = BUILD.parent
SOURCE = BUILD / "index.standalone.html"
OUT = ROOT / "index.html"

html = SOURCE.read_text()

remote = [
    ref
    for ref in re.findall(r'(?:src|href)="(https?://[^"]+)"', html)
    if "designedbymiles.vercel.app" not in ref  # canonical / og URLs are metadata
]
if remote:
    raise SystemExit(f"page would load remote assets: {set(remote)}")

OUT.write_text(html)
print(f"built {OUT} ({len(html) / 1024:.1f} KB, self-contained)")
