import sys
from PIL import Image, ImageDraw
FRAME=int(sys.argv[1]) if len(sys.argv)>1 else 1
W, H, SCALE = 92, 62, 12
K=(26,26,26,255)
BLUE=(74,138,244,255); BLUE_D=(47,107,214,255); BLUE_L=(143,184,255,255); BLUE_LL=(200,222,255,255)
GRAY=(200,200,200,255); GRAY_D=(120,120,120,255); HANDLE=(70,70,70,255)
LENS=(228,244,255,255); ROW=(60,60,60,255); AMBER=(255,193,7,255); WHITE=(255,255,255,255)

img = Image.new("RGBA",(W,H),(0,0,0,0)); d = ImageDraw.Draw(img)

# --- database cylinder: 3 segments
x0,x1 = 12,46; cx=(x0+x1)//2
segs=[(8,20),(20,32),(32,44)]
for top,bot in segs:
    d.ellipse([x0,bot-5,x1,bot+5],fill=BLUE)
    d.rectangle([x0,top,x1,bot],fill=BLUE)
# shading band on right, highlight on left
for top,bot in segs:
    d.rectangle([x1-8,top+1,x1,bot],fill=BLUE_D)
    d.rectangle([x0+3,top+2,x0+5,bot-2],fill=BLUE_L)
# top lid
d.ellipse([x0,segs[0][0]-5,x1,segs[0][0]+5],fill=BLUE_L)
d.ellipse([x0+6,segs[0][0]-2,x1-6,segs[0][0]+2],fill=BLUE_LL)
# seams between segments (dark arcs)
for top,bot in segs[:-1]:
    d.arc([x0,bot-5,x1,bot+5],0,180,fill=K,width=1)

# --- magnifying glass
lc=(56,34); r=13
d.ellipse([lc[0]-r,lc[1]-r,lc[0]+r,lc[1]+r],fill=GRAY)
d.ellipse([lc[0]-r+2,lc[1]-r+2,lc[0]+r-2,lc[1]+r-2],fill=LENS)
# rows inside lens (the data)
for i,y in enumerate([28,33,38]):
    col = AMBER if i==1 else ROW
    d.rectangle([lc[0]-7,y,lc[0]+7,y+1],fill=col)
    d.rectangle([lc[0]-7,y,lc[0]-5,y+1],fill=BLUE if i!=1 else AMBER)
# lens glint
d.rectangle([lc[0]-6,lc[1]-8,lc[0]-4,lc[1]-7],fill=WHITE)
d.rectangle([lc[0]-8,lc[1]-6,lc[0]-7,lc[1]-4],fill=WHITE)
# handle: diagonal down-right
for t in range(14):
    hx=lc[0]+r-3+t; hy=lc[1]+r-3+t
    d.rectangle([hx,hy,hx+3,hy+3],fill=HANDLE)
d.rectangle([lc[0]+r-2,lc[1]+r-2,lc[0]+r+1,lc[1]+r+1],fill=GRAY_D)

# --- sparkles: 'eye-opening'
def sparkle(x,y,arm,col):
    d.rectangle([x-arm,y,x+arm,y],fill=col); d.rectangle([x,y-arm,x,y+arm],fill=col)
    d.rectangle([x-1,y-1,x+1,y+1],fill=WHITE)
if FRAME==1:
    sparkle(74,12,3,AMBER); sparkle(84,22,2,AMBER)
else:
    sparkle(74,12,2,AMBER); sparkle(84,22,3,AMBER); sparkle(66,6,2,AMBER)

# --- 1px black outline around every opaque region (sun/moon style)
px=img.load(); out=img.copy(); po=out.load()
for y in range(H):
    for x in range(W):
        if px[x,y][3]==0:
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                nx,ny=x+dx,y+dy
                if 0<=nx<W and 0<=ny<H and px[nx,ny][3]!=0:
                    po[x,y]=K; break
# outline the lens rim edge (inside) so glass reads as glass
d2=ImageDraw.Draw(out)
d2.ellipse([lc[0]-r,lc[1]-r,lc[0]+r,lc[1]+r],outline=K,width=1)
d2.ellipse([lc[0]-r+2,lc[1]-r+2,lc[0]+r-2,lc[1]+r-2],outline=GRAY_D,width=1)
# outline the cylinder against the glass overlap
d2.ellipse([x0,segs[0][0]-5,x1,segs[0][0]+5],outline=K,width=1)

big=out.resize((W*SCALE,H*SCALE),Image.NEAREST)
big.save("public/blog/life-after-bigquery%s.png" % ("" if FRAME==1 else "-2"))
print(big.size)
