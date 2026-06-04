#!/usr/bin/env python3
"""Injeta width/height reais em cada <img> do index.html (anti-CLS)."""
import re
from PIL import Image

html = open("index.html", encoding="utf-8").read()

def add_dims(m):
    tag = m.group(0)
    if "width=" in tag or "height=" in tag:
        return tag
    src_m = re.search(r'src="([^"]+)"', tag)
    if not src_m:
        return tag
    src = src_m.group(1)
    if src.startswith("http"):
        return tag
    try:
        w, h = Image.open(src).size
    except Exception as e:
        print(f"  skip {src}: {e}")
        return tag
    # insere antes do fechamento (suporta '/>' ou '>')
    new = re.sub(r"\s*/?>\s*$", f' width="{w}" height="{h}" />', tag)
    print(f"  {src} -> {w}x{h}")
    return new

new_html = re.sub(r"<img\b[^>]*?/?>", add_dims, html)
open("index.html", "w", encoding="utf-8").write(new_html)
print("ok")
