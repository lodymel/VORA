"""One-off: make the black background of the mirror frame transparent.

Flood-fills the dark exterior (from the corners) and the dark oval interior
(from the center), so the frame itself keeps its original pearl shading —
including dark engraved crevices. Edge pixels get brightness-based alpha for
a soft rim.
"""

from collections import deque

from PIL import Image

SRC = 'public/mirror-frame-src.png'
DST = 'public/mirror-frame.png'

DARK = 34  # at/below this brightness a pixel can belong to the background

im = Image.open(SRC).convert('RGB')
w, h = im.size
src = im.load()

is_dark = [[max(src[x, y]) <= DARK for x in range(w)] for y in range(h)]
clear = [[False] * w for _ in range(h)]

def flood(seeds):
    q = deque(s for s in seeds if is_dark[s[1]][s[0]] and not clear[s[1]][s[0]])
    for x, y in q:
        clear[y][x] = True
    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and is_dark[ny][nx] and not clear[ny][nx]:
                clear[ny][nx] = True
                q.append((nx, ny))

# exterior from the four corners, interior from the center
flood([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, h // 2)])

out = Image.new('RGBA', im.size)
dst = out.load()
for y in range(h):
    for x in range(w):
        r, g, b = src[x, y]
        if clear[y][x]:
            # soften the rim: keep faint glow where the background isn't pure black
            m = max(r, g, b)
            if m > 8:
                dst[x, y] = (min(255, r * 255 // m), min(255, g * 255 // m), min(255, b * 255 // m), m)
            else:
                dst[x, y] = (0, 0, 0, 0)
        else:
            dst[x, y] = (r, g, b, 255)

out.save(DST)
print(f'wrote {DST} ({w}x{h})')
