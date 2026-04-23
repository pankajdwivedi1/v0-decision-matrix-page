lines = open('app/application/page.tsx', encoding='utf-8').readlines()

# 1. Remove the white wedges from their current position (approx 7462-7487)
# 2. Re-insert them after the grid rings section (approx 7500)

START_SEARCH = 7450
END_SEARCH = 7550

WEDGE_START = -1
WEDGE_END = -1
GRID_RINGS_END = -1

for i in range(START_SEARCH, END_SEARCH):
    if '{/* 1b. WHITE GAP WEDGES' in lines[i]:
        WEDGE_START = i
    if WEDGE_START != -1 and '})' in lines[i] and i > WEDGE_START + 10:
        WEDGE_END = i + 1 # include the blank line after
    if '{/* 2. CONCENTRIC GRID RINGS */}' in lines[i]:
        # Grid rings start. We need to find where they end.
        pass
    if 'key={`ring-${i}`}' in lines[i]:
        # Inside grid rings loop. The closing }) for grid rings is a few lines down.
        for j in range(i, i + 20):
            if '})' in lines[j]:
                GRID_RINGS_END = j + 1
                break

if WEDGE_START != -1 and WEDGE_END != -1 and GRID_RINGS_END != -1:
    print(f"Moving wedge from {WEDGE_START+1}-{WEDGE_END+1} to after {GRID_RINGS_END+1}")
    wedge_content = lines[WEDGE_START:WEDGE_END]
    
    # Remove wedge
    del lines[WEDGE_START:WEDGE_END]
    
    # Adjust GRID_RINGS_END because we deleted lines before it
    GRID_RINGS_END -= (WEDGE_END - WEDGE_START)
    
    # Insert wedge after grid rings
    # We want to insert it after the grid rings closing })
    # The grid rings section usually has a blank line after it.
    for k in range(GRID_RINGS_END, GRID_RINGS_END + 5):
        if lines[k].strip() == '':
            insert_pos = k + 1
            break
    else:
        insert_pos = GRID_RINGS_END + 1
        
    for i, line in enumerate(wedge_content):
        lines.insert(insert_pos + i, line)
    
    with open('app/application/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully moved white gap wedges after grid rings.")
else:
    print(f"Error finding markers: WEDGE_START={WEDGE_START}, WEDGE_END={WEDGE_END}, GRID_RINGS_END={GRID_RINGS_END}")
