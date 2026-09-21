"""Top row: designer hears about the problem through PM and stakeholders. Bottom row: designer looks straight at the data."""
from pix import *

c = Canvas(124, 58)
# before
y = 4
c.figure(6, y, BLUE)
c.figure(38, y, GREEN)
c.figure(70, y, VIOLET)
c.db(102, y + 3)
# after
y = 34
c.figure(6, y, BLUE)
c.db(102, y + 3)
c.sparkle(96, y + 2, 2)
c.sparkle(88, y + 18, 2)
c.outline()
for x in (20, 52, 84):
    c.arrow(x, 12, 14)
c.arrow(20, 42, 78)
c.save("public/blog/life-after-bigquery-brief.png")
