"""Tiny pixel-art helpers: draw flat shapes on a small canvas, auto-outline in black, upscale nearest-neighbour."""
from PIL import Image, ImageDraw

K = (26, 26, 26, 255)
WHITE = (255, 255, 255, 255)
AMBER, AMBER_D = (255, 193, 7, 255), (200, 140, 0, 255)
BLUE, BLUE_D, BLUE_L, BLUE_LL = (74, 138, 244, 255), (47, 107, 214, 255), (143, 184, 255, 255), (200, 222, 255, 255)
BOX, BOX_D, BOX_L = (217, 160, 102, 255), (181, 116, 46, 255), (235, 190, 140, 255)
GRAY, GRAY_D, GRAY_DD = (200, 200, 200, 255), (120, 120, 120, 255), (70, 70, 70, 255)
SKIN = (245, 200, 170, 255)
GREEN, VIOLET = (72, 187, 120, 255), (139, 92, 246, 255)


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def box(self, x, y, s=10, col=BOX):
        """Cardboard box with a tape stripe and a highlight."""
        d = self.d
        d.rectangle([x, y, x + s, y + s], fill=col)
        d.rectangle([x + s // 2 - 1, y, x + s // 2, y + s], fill=BOX_D if col == BOX else AMBER_D)
        d.rectangle([x + 1, y + 1, x + 2, y + s - 2], fill=BOX_L if col == BOX else col)

    def figure(self, x, y, shirt):
        """Bust: head + shoulders, ~10 wide x 16 tall."""
        d = self.d
        d.ellipse([x + 2, y, x + 8, y + 6], fill=SKIN)
        d.rounded_rectangle([x, y + 8, x + 10, y + 16], radius=3, fill=shirt)
        d.rectangle([x + 4, y + 7, x + 6, y + 9], fill=SKIN)

    def db(self, x, y, w=16, segs=2, seg_h=7):
        """Mini database cylinder."""
        d = self.d
        for i in range(segs):
            top = y + i * seg_h
            d.ellipse([x, top + seg_h - 3, x + w, top + seg_h + 3], fill=BLUE)
            d.rectangle([x, top, x + w, top + seg_h], fill=BLUE)
            d.rectangle([x + w - 4, top + 1, x + w, top + seg_h], fill=BLUE_D)
        d.ellipse([x, y - 3, x + w, y + 3], fill=BLUE_L)
        for i in range(segs - 1):
            top = y + i * seg_h
            d.arc([x, top + seg_h - 3, x + w, top + seg_h + 3], 0, 180, fill=K, width=1)

    def sparkle(self, x, y, arm, col=AMBER, outlined=False):
        d = self.d
        if outlined:
            d.rectangle([x - arm - 1, y - 1, x + arm + 1, y + 1], fill=K)
            d.rectangle([x - 1, y - arm - 1, x + 1, y + arm + 1], fill=K)
        d.rectangle([x - arm, y, x + arm, y], fill=col)
        d.rectangle([x, y - arm, x, y + arm], fill=col)
        d.rectangle([x - 1, y - 1, x + 1, y + 1], fill=WHITE)

    def outline(self):
        """1px black outline around every opaque region (matches sun/moon assets)."""
        px = self.img.load()
        out = self.img.copy()
        po = out.load()
        for y in range(self.h):
            for x in range(self.w):
                if px[x, y][3] == 0:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < self.w and 0 <= ny < self.h and px[nx, ny][3] != 0:
                            po[x, y] = K
                            break
        self.img = out
        self.d = ImageDraw.Draw(out)
        return self

    def arrow(self, x, y, length, col=K, left=False):
        """Drawn after outline(): 2px shaft + head. Points right unless left=True."""
        d = self.d
        d.rectangle([x, y, x + length, y + 1], fill=col)
        for i in range(4):
            hx = x + 3 - i if left else x + length - 3 + i
            d.rectangle([hx, y - 3 + i, hx, y + 4 - i], fill=col)

    def render(self, scale=8):
        return self.img.resize((self.w * scale, self.h * scale), Image.NEAREST)

    def save(self, path, scale=8):
        big = self.render(scale)
        big.save(path)
        print(path, big.size)


def save_apng(frames, path, duration=110):
    """frames: list of already-rendered RGBA images, looped forever."""
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=duration, loop=0)
    print(path, frames[0].size, len(frames), "frames")
