FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

# Find the line after method sector fills closing })
# We know it's around line 7460-7462
# Look for "2. CONCENTRIC GRID RINGS"
INSERT_BEFORE = None
for i in range(7430, 7490):
    if '2. CONCENTRIC GRID RINGS' in lines[i]:
        INSERT_BEFORE = i
        break

print(f"Insert before line {INSERT_BEFORE+1}: {repr(lines[INSERT_BEFORE])}")

WHITE_WEDGE = r'''                                          {/* 1b. WHITE GAP WEDGES at each sector boundary
                                               Masks colored fills in the gap zones ->
                                               clean white separators between methods */}
                                          {comparisonResults.map((_, mIdx) => {
                                            const gapAngle    = stepAngle * 0.38;
                                            const boundaryAng = startAngle + (mIdx + 1) * nAlts * stepAngle;
                                            const gapStart    = boundaryAng - gapAngle;
                                            const gapEnd      = boundaryAng + gapAngle;
                                            const nSamp       = 12;
                                            const wpts: string[] = [];
                                            wpts.push(`M ${cx.toFixed(2)} ${cy.toFixed(2)}`);
                                            for (let s = 0; s <= nSamp; s++) {
                                              const ang = gapStart + (s / nSamp) * (gapEnd - gapStart);
                                              const p   = pol(outerR + 2, ang);
                                              wpts.push(`L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
                                            }
                                            wpts.push('Z');
                                            return (
                                              <path
                                                key={`gap-mask-${mIdx}`}
                                                d={wpts.join(' ')}
                                                fill="white"
                                                stroke="none"
                                              />
                                            );
                                          })}

'''

new_lines = lines[:INSERT_BEFORE] + [WHITE_WEDGE] + lines[INSERT_BEFORE:]

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

with open(FILE, encoding='utf-8') as f:
    verify = f.readlines()

print(f"Done. New total lines: {len(verify)}")
print("Line at insert:", repr(verify[INSERT_BEFORE]))
print("Line after insert:", repr(verify[INSERT_BEFORE + 1]))
