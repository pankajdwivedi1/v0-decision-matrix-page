lines = open('app/application/page.tsx', encoding='utf-8').readlines()

# 1. Identify the White Gap Wedges section
WEDGE_START = -1
WEDGE_END = -1
for i in range(7400, 7550):
    if '{/* 3. WHITE GAP WEDGES' in lines[i]:
        WEDGE_START = i
    if WEDGE_START != -1 and '})' in lines[i] and i > WEDGE_START + 5:
        WEDGE_END = i + 1
        break

if WEDGE_START == -1:
    print("Could not find white gap wedges section.")
    exit(1)

wedge_content = lines[WEDGE_START:WEDGE_END]
del lines[WEDGE_START:WEDGE_END]

# 2. Find the position after Alternative Polygon Fills (Section 5)
# Note: Section indices might have shifted due to previous edits.
INSERT_POS = -1
for i in range(WEDGE_START, len(lines)):
    if '{/* 6. ALTERNATIVE POLYGONS: border lines */}' in lines[i]:
        INSERT_POS = i
        break

if INSERT_POS != -1:
    print(f"Moving wedge from {WEDGE_START+1} to before {INSERT_POS+1}")
    for i, line in enumerate(wedge_content):
        lines.insert(INSERT_POS + i, line)
    
    with open('app/application/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully moved white gap wedges after alternative fills.")
else:
    print("Could not find insertion point (Section 6).")
