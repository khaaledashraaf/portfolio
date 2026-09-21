"""Three hunches checked against the data: lit = confirmed, dim = killed.
Looping APNG: the light around the lit bulbs breathes in and out."""
from pix import *

RAYS = ((-4, 8), (20, 8), (8, -4), (-2, -1), (18, -1))  # relative to bulb top-left, centre is (8, 8)

def frame(spread):
    c = Canvas(124, 42)
    d = c.d

    def bulb(x, y, lit):
        glass = AMBER if lit else GRAY
        d.ellipse([x, y, x + 16, y + 16], fill=glass)
        d.rectangle([x + 5, y + 15, x + 11, y + 19], fill=glass)
        d.rectangle([x + 4, y + 19, x + 12, y + 24], fill=GRAY_D)
        d.rectangle([x + 4, y + 21, x + 12, y + 21], fill=GRAY_DD)
        if lit:
            d.rectangle([x + 4, y + 4, x + 6, y + 6], fill=WHITE)
            for dx, dy in RAYS:
                sx = (dx > 8) - (dx < 8)  # push each ray outward from the centre
                sy = (dy > 8) - (dy < 8)
                px, py = x + dx + sx * spread, y + dy + sy * spread
                d.rectangle([px, py, px + 1, py + 1], fill=AMBER)

    bulb(20, 8, True)
    bulb(54, 8, False)
    bulb(88, 8, True)
    c.outline()
    return c.render()

save_apng([frame(s) for s in (0, 1, 2, 1)], "public/blog/life-after-bigquery-hunches.apng", duration=200)
