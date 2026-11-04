#!/usr/bin/env python3
"""Build the Drop landing page into one self-contained index.html.

Inlines the four weights of Switzer, the two photographs and the Phosphor
icon SVGs as base64, so the page makes no network requests at all.
"""
import base64
import pathlib
import re

BUILD = pathlib.Path(__file__).resolve().parent
ROOT = BUILD.parent


def b64(path: pathlib.Path) -> str:
    return base64.b64encode(path.read_bytes()).decode("ascii")


def icon(name: str, weight: str = "regular") -> str:
    fname = f"{name}-{weight}.svg" if weight == "bold" else f"{name}.svg"
    path = BUILD / "icons" / fname
    if not path.exists():
        raise SystemExit(f"missing icon: {path}")
    svg = path.read_text().strip()
    body = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S)
    if not body:
        raise SystemExit(f"bad icon: {path}")
    return (
        '<svg class="ic" viewBox="0 0 256 256" fill="currentColor" '
        'aria-hidden="true" focusable="false">' + body.group(1) + "</svg>"
    )


html = (BUILD / "index.template.html").read_text()
css = (BUILD / "style.css").read_text()

css = css.replace("__SWITZER_400__", b64(BUILD / "Switzer-400.woff2"))
css = css.replace("__SWITZER_500__", b64(BUILD / "Switzer-500.woff2"))
css = css.replace("__SWITZER_700__", b64(BUILD / "Switzer-700.woff2"))
css = css.replace("__SWITZER_800__", b64(BUILD / "Switzer-800.woff2"))
html = html.replace("__CSS__", css)
html = html.replace("__PHOTO_SENDER__", b64(BUILD / "photo-sender-opt.jpg"))
html = html.replace("__PHOTO_RECIPIENT__", b64(BUILD / "photo-recipient-opt.jpg"))

html = re.sub(r"\[\[icb:([a-z0-9-]+)\]\]", lambda m: icon(m.group(1), "bold"), html)
html = re.sub(r"\[\[ic:([a-z0-9-]+)\]\]", lambda m: icon(m.group(1)), html)

leftover = re.findall(r"\[\[[^\]]+\]\]|__[A-Z]+__", html)
if leftover:
    raise SystemExit(f"unresolved tokens: {set(leftover)}")

out = ROOT / "index.html"
out.write_text(html)
print(f"built {out} ({len(html) / 1024:.1f} KB)")
