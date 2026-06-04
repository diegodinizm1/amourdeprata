#!/usr/bin/env python3
"""Gera a imagem Open Graph (1200x630) da Amour de Prata."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
PAPER = (246, 242, 236)
INK   = (12, 12, 12)
CYAN  = (42, 141, 177)
MUTED = (110, 104, 96)
WHITE = (255, 255, 255)

AVENIR = "/System/Library/Fonts/Avenir.ttc"
GEORGIA_BI = "/System/Library/Fonts/Supplemental/Georgia Bold Italic.ttf"

def avenir(size, want):
    """Carrega Avenir.ttc escolhendo a face pelo nome (Heavy/Medium/Book)."""
    for idx in range(12):
        try:
            f = ImageFont.truetype(AVENIR, size=size, index=idx)
        except Exception:
            break
        name = " ".join(f.getname()).lower()
        if want.lower() in name:
            return f
    return ImageFont.truetype(AVENIR, size=size, index=0)

def tracked(draw, xy, text, font, fill, spacing):
    """Desenha texto com espaçamento entre letras (tracking)."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + spacing
    return x

def tracked_width(draw, text, font, spacing):
    return sum(draw.textlength(c, font=font) + spacing for c in text) - spacing

img = Image.new("RGB", (W, H), PAPER)
draw = ImageDraw.Draw(img)

# ---- Foto à direita (cover-crop) ----
PHOTO_X = 772
pw, ph = W - PHOTO_X, H
photo = Image.open("assets/photos/image.jpg").convert("RGB")
scale = max(pw / photo.width, ph / photo.height)
nw, nh = int(photo.width * scale), int(photo.height * scale)
photo = photo.resize((nw, nh), Image.LANCZOS)
left = (nw - pw) // 2
top = (nh - ph) // 2
photo = photo.crop((left, top, left + pw, top + ph))
img.paste(photo, (PHOTO_X, 0))

# leve sombra/borda do lado esquerdo da foto
for i, a in enumerate([60, 38, 22, 12, 6]):
    draw.line([(PHOTO_X + i, 0), (PHOTO_X + i, H)], fill=(0, 0, 0), width=1)

# ---- Fontes ----
f_eyebrow = avenir(21, "Heavy")
f_word    = avenir(30, "Heavy")
f_store   = avenir(15, "Medium")
f_head    = ImageFont.truetype(GEORGIA_BI, size=60)
f_sub     = avenir(22, "Book")
f_cta     = avenir(22, "Heavy")
f_url     = avenir(18, "Medium")

MX = 72  # margem esquerda

# ---- Eyebrow ----
tracked(draw, (MX, 70), "PRATA 925 · CERTIFICADA", f_eyebrow, CYAN, 3)

# ---- Wordmark ----
tracked(draw, (MX, 112), "AMOUR DE PRATA", f_word, INK, 4)
tracked(draw, (MX, 150), "SILVER STORE", f_store, CYAN, 6)

# ---- Headline (serifada itálica) ----
draw.text((MX - 2, 232), "Joias que combinam", font=f_head, fill=INK)
draw.text((MX - 2, 308), "com ", font=f_head, fill=INK)
w_com = draw.textlength("com ", font=f_head)
draw.text((MX - 2 + w_com, 308), "você.", font=f_head, fill=CYAN)

# ---- Subtexto ----
draw.text((MX, 408), "Peças autorais escolhidas a dedo pela Maria Eduarda.", font=f_sub, fill=MUTED)

# ---- CTA pill ----
cta_text = "Peça pelo WhatsApp"
pad_x, pad_y = 30, 16
tw = tracked_width(draw, cta_text, f_cta, 1)
th = f_cta.getbbox("Ag")[3]
bx, by = MX, 478
bw, bh = tw + pad_x * 2, th + pad_y * 2
draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=bh // 2, fill=CYAN)
tracked(draw, (bx + pad_x, by + pad_y - 2), cta_text, f_cta, WHITE, 1)

# ---- URL ----
draw.text((MX, 568), "amourdeprata.vercel.app", font=f_url, fill=MUTED)

img.save("assets/og-image.jpg", quality=88)
print(f"og-image.jpg salvo: {img.size[0]}x{img.size[1]}")
