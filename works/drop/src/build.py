#!/usr/bin/env python3
"""Guard the Drop landing page before it ships.

`../index.html` is the page itself: one file, every asset already inlined as
base64 (four Switzer weights, two photographs, the favicon), so it makes no
network requests. This script checks that and refuses to ship it if anything
would be loaded remotely.

    cd src && python3 build.py
"""
import pathlib
import re

BUILD = pathlib.Path(__file__).resolve().parent
PAGE = BUILD.parent / "index.html"

html = PAGE.read_text()

remote = [
    ref
    for ref in re.findall(r'(?:src|href)="(https?://[^"]+)"', html)
    if "designedbymiles.vercel.app" not in ref  # canonical / og URLs are metadata
]
if remote:
    raise SystemExit(f"page would load remote assets: {set(remote)}")

print(f"checked {PAGE} ({len(html) / 1024:.1f} KB, self-contained)")
