"""Boxes ride a belt through the weekly-query gate; a couple drop through the gap beneath it.
Looping APNG: belt + boxes shift 2px/frame over a 14px cycle, leaked boxes fall 4px/frame."""
from pix import *

W, H = 124, 80
BELT_Y, SPACING, FRAMES, STEP = 38, 21, 7, 3
GATE_L, GATE_R = 56, 74

def frame(f):
    c = Canvas(W, H)
    d = c.d
    shift = f * STEP
    # belt, broken under the gate, stripes scrolling right
    for x0, x1 in ((0, GATE_L + 2), (GATE_R - 2, W - 1)):
        d.rectangle([x0, BELT_Y, x1, BELT_Y + 4], fill=GRAY_DD)
        for x in range(-7 + shift % 7, W, 7):
            if x0 + 1 <= x and x + 2 <= x1 - 1:
                d.rectangle([x, BELT_Y + 1, x + 2, BELT_Y + 1], fill=GRAY_D)
    # boxes flowing right (drawn beyond both edges so they enter/exit cleanly)
    for x in range(-SPACING + shift, W + SPACING, SPACING):
        c.box(x, BELT_Y - 11)
    # the gate (the weekly query) sits in front of the boxes
    d.rectangle([GATE_L, 12, GATE_R, 16], fill=GRAY)
    d.rectangle([GATE_L, 12, GATE_L + 3, BELT_Y - 1], fill=GRAY)
    d.rectangle([GATE_R - 3, 12, GATE_R, BELT_Y - 1], fill=GRAY)
    d.rectangle([62, 8, 68, 12], fill=GRAY_D)
    d.rectangle([64, 9, 66, 10], fill=BLUE_L if f % 2 == 0 else AMBER)  # scanner blinks
    # the leak: two boxes falling through the gap, half a cycle apart
    for x, phase in ((60, 0), (64, 4)):
        y = BELT_Y + 6 + ((f + phase) % FRAMES) * 4
        c.box(x, y, col=AMBER)
    c.outline()
    c.arrow(24, 4, 20)
    c.arrow(84, 4, 20)
    return c.render()

save_apng([frame(f) for f in range(FRAMES)], "public/blog/life-after-bigquery-leak.apng")
