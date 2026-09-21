"""1200x630 social preview: the cover art on an off-white card with the title underneath.
Usage: python3 scripts/blog-art/og.py <slug> "<title>"  (expects public/blog/<slug>.png rendered at 12x)"""
import sys
from PIL import Image, ImageDraw, ImageFont

slug, title = sys.argv[1], sys.argv[2]
art = Image.open(f"public/blog/{slug}.png").convert("RGBA")
small = art.resize((art.width // 12, art.height // 12), Image.NEAREST)  # back to 1x
art = small.resize((small.width * 6, small.height * 6), Image.NEAREST)  # crisp 6x

W, H = 1200, 630
og = Image.new("RGB", (W, H), (250, 250, 248))
og.paste(art, ((W - art.width) // 2, 56), art)
d = ImageDraw.Draw(og)
bold = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 52)
mono = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 24)
tw = d.textlength(title, font=bold)
d.text(((W - tw) // 2, 470), title, font=bold, fill=(26, 26, 26))
site = "khaledashraf.me"
sw = d.textlength(site, font=mono)
d.text(((W - sw) // 2, 545), site, font=mono, fill=(120, 120, 120))
out = f"public/blog/{slug}-og.png"
og.save(out, optimize=True)
print(out, og.size)
