FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

# Lines 7354-7378 (0-based: 7353-7377)
START = 7353
END   = 7377

print("Start:", repr(lines[START]))
print("End  :", repr(lines[END]))

NEW = r'''                                     // Build smooth path for each ALTERNATIVE:
                                     // - Within each method sector: real SVG arc (perfect circle arc)
                                     // - At sector boundaries: cubic Bezier for smooth curved transitions
                                     const buildAltPath = (altName: string) => {
                                       const segs: string[] = [];

                                       for (let mIdx = 0; mIdx < nMethods; mIdx++) {
                                         const label     = comparisonResults[mIdx].label;
                                         const nextLabel = comparisonResults[(mIdx + 1) % nMethods].label;
                                         const r         = rankToR(rankMap[label]?.[altName] ?? maxRank);
                                         const rNext     = rankToR(rankMap[nextLabel]?.[altName] ?? maxRank);

                                         const sectorStart   = startAngle + mIdx * nAlts * stepAngle;
                                         const sectorEnd     = startAngle + (mIdx + 1) * nAlts * stepAngle;

                                         const arcS      = pol(r, sectorStart);
                                         const arcE      = pol(r, sectorEnd);
                                         const arcSpan   = sectorEnd - sectorStart;
                                         const largeArc  = arcSpan > Math.PI ? 1 : 0;

                                         if (mIdx === 0) {
                                           segs.push(`M ${arcS.x.toFixed(2)} ${arcS.y.toFixed(2)}`);
                                         }

                                         // Perfect circular arc within this method sector
                                         segs.push(`A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} 1 ${arcE.x.toFixed(2)} ${arcE.y.toFixed(2)}`);

                                         // Cubic Bezier at boundary to smoothly transition to next sector radius
                                         // Tangent direction (clockwise) at boundary angle = (sin angle, -cos angle)
                                         const boundaryAngle = sectorEnd;
                                         const tx = Math.sin(boundaryAngle);
                                         const ty = -Math.cos(boundaryAngle);
                                         const ctrlDist = Math.abs(r - rNext) * 0.55 + outerR * 0.04;

                                         const cp1x = arcE.x + tx * ctrlDist;
                                         const cp1y = arcE.y + ty * ctrlDist;

                                         const nextArcS = pol(rNext, boundaryAngle);
                                         const cp2x = nextArcS.x - tx * ctrlDist;
                                         const cp2y = nextArcS.y - ty * ctrlDist;

                                         segs.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${nextArcS.x.toFixed(2)} ${nextArcS.y.toFixed(2)}`);
                                       }

                                       segs.push('Z');
                                       return segs.join(' ');
                                     };
'''

before = lines[:START]
after  = lines[END + 1:]
new_lines = before + [NEW] + after

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

with open(FILE, encoding='utf-8') as f:
    verify = f.readlines()

print(f"Done. New total lines: {len(verify)}")
print("New start:", repr(verify[START]))
