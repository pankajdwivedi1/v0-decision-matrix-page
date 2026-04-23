FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

# 1. Update Method Sector Fills opacity
for i in range(7470, 7485):
    if 'fill={withAlpha(color,' in lines[i]:
        lines[i] = lines[i].replace('0.22 : 0.08', '0.30 : 0.15')

# 2. Remove Alternative Polygon Fills
START = -1
END   = -1
for i in range(7500, 7550):
    if '{/* 5. ALTERNATIVE POLYGONS: fills' in lines[i]:
        START = i
    if START != -1 and '})' in lines[i] and i > START + 5:
        END = i
        break

if START != -1 and END != -1:
    print(f"Removing alternative fills from {START+1} to {END+1}")
    del lines[START : END + 1]

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(lines)
