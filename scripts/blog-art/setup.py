"""Designer asks Claude, Claude asks BigQuery, answers flow back."""
from pix import *

c = Canvas(124, 46)
d = c.d
c.figure(6, 14, BLUE)
# Claude: a chat bubble with a sparkle in it
d.rounded_rectangle([42, 8, 82, 34], radius=5, fill=WHITE)
d.rectangle([47, 33, 52, 35], fill=WHITE)  # tail
d.rectangle([47, 35, 49, 37], fill=WHITE)
c.sparkle(62, 21, 4, outlined=True)
c.sparkle(73, 14, 2, outlined=True)
c.db(100, 16)
c.outline()
c.arrow(20, 18, 18)            # question out
c.arrow(20, 27, 18, left=True) # answer back
c.arrow(85, 18, 12)
c.arrow(85, 27, 12, left=True)
c.save("public/blog/life-after-bigquery-setup.png")
