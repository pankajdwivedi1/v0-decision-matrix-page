FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

# Find buildAltPath block
START = None
END   = None
for i, line in enumerate(lines):
    if '// Build smooth path for each ALTERNATIVE:' in line and START is None:
        START = i
    if START is not None and '};' in line and i > START + 5:
        END = i
        break

print(f"Found block: lines {START+1} to {END+1}")
print("Start:", repr(lines[START]))
print("End  :", repr(lines[END]))

NEW = r'''
                                     // Build straight-step path for each ALTERNATIVE:
                                     // Arc within each method sector, straight radial line at boundaries,
                                     // with a small angular gap on each side of the boundary.
                                     const buildAltPath = (altName: string) => {
                                       const segs: string[] = [];

                                       // Gap angle on each side of boundary (creates visible separation)
                                       const gapAngle = stepAngle * 0.38;

                                       for (let mIdx = 0; mIdx < nMethods; mIdx++) {
                                         const label     = comparisonResults[mIdx].label;
                                         const nextLabel = comparisonResults[(mIdx + 1) % nMethods].label;
                                         const r     = rankToR(rankMap[label]?.[altName]     ?? maxRank);
                                         const rNext = rankToR(rankMap[nextLabel]?.[altName] ?? maxRank);

                                         const sectorStart = startAngle + mIdx * nAlts * stepAngle;
                                         const sectorEnd   = startAngle + (mIdx + 1) * nAlts * stepAngle;

                                         // Arc spans the sector minus the gap on each side
                                         const arcStartAngle = sectorStart + gapAngle;
                                         const arcEndAngle   = sectorEnd   - gapAngle;

                                         const arcS     = pol(r, arcStartAngle);
                                         const arcE     = pol(r, arcEndAngle);
                                         const arcSpan  = arcEndAngle - arcStartAngle;
                                         const largeArc = arcSpan > Math.PI ? 1 : 0;

                                         if (mIdx === 0) {
                                           // Start at beginning of first arc
                                           segs.push(`M ${arcS.x.toFixed(2)} ${arcS.y.toFixed(2)}`);
                                         }
                                         // else: we arrived at arcS via previous straight-line connector

                                         // Perfect circular arc within this method sector
                                         segs.push(`A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} 1 ${arcE.x.toFixed(2)} ${arcE.y.toFixed(2)}`);

                                         // ── Straight radial connector across the gap ──────────────────
                                         // From pol(r, arcEndAngle) → pol(rNext, arcEndAngle + 2*gapAngle)
                                         // This is a straight line — no curve
                                         const nextArcStartAngle = sectorEnd + gapAngle;
                                         const nextArcS = pol(rNext, nextArcStartAngle);
                                         segs.push(`L ${nextArcS.x.toFixed(2)} ${nextArcS.y.toFixed(2)}`);
                                       }

                                       segs.push('Z');
                                       return segs.join(' ');
                                     };

'''

before    = lines[:START]
after     = lines[END + 1:]
new_lines = before + [NEW] + after

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

with open(FILE, encoding='utf-8') as f:
    verify = f.readlines()

print(f"Done. New total lines: {len(verify)}")

# Verify next case still intact
target = 'case "stackedBar"'
for i in range(7350, 7650):
    if target in verify[i]:
        print(f"Next case at line {i+1}:", repr(verify[i]))
        print(f"Prev:", repr(verify[i-1]))
        print(f"Prev-1:", repr(verify[i-2]))
        break
