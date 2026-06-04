#!/usr/bin/env python3
"""Centraliza os ícones SVG repetidos (WhatsApp/Instagram) num sprite <symbol>."""
import re

ICONS = {
    "i-wa": r'<path d="M17\.472[^"]*"/>',
    "i-ig": r'<path d="M12 2\.163[^"]*"/>',
}

html = open("index.html", encoding="utf-8").read()

# 1) Extrai o 'd' de cada ícone (primeira ocorrência) para montar o sprite
symbols = {}
for sid, pat in ICONS.items():
    m = re.search(pat, html)
    if m:
        symbols[sid] = m.group(0)

# 2) Substitui todas as ocorrências do <path ...> pelo <use>
counts = {}
for sid, pat in ICONS.items():
    html, n = re.subn(pat, f'<use href="#{sid}"/>', html)
    counts[sid] = n

# 3) Insere o sprite logo após <body>
sprite = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">\n'
for sid, path in symbols.items():
    sprite += f'  <symbol id="{sid}" viewBox="0 0 24 24">{path}</symbol>\n'
sprite += '</svg>'
html = html.replace("<body>", "<body>\n" + sprite, 1)

open("index.html", "w", encoding="utf-8").write(html)

# 4) Mesma troca no main.js (WA_ICON do catálogo)
js = open("main.js", encoding="utf-8").read()
js, njs = re.subn(ICONS["i-wa"], '<use href="#i-wa"/>', js)
open("main.js", "w", encoding="utf-8").write(js)

print("index.html:", counts, "| main.js WA:", njs)
