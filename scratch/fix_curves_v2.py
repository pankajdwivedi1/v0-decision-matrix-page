FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

# buildAltPath function: lines 7354-7400 (0-based: 7353-7399)
START = 7353
END   = 7399

print("Start:", repr(lines[START]))
print("End  :", repr(lines[END]))

NEW = r'''
                                     // Build smooth path for each ALTERNATIVE:
                                     // Each sector = real SVG arc; boundaries = cubic Bezier with gap
                                     const buildAltPath = (altName: string) => {
                                       const segs: string[] = [];

                                       // Gap angle on each side of the sector boundary (creates visible gap)
                                       // 0.35 of one sub-spoke width gives a clean gap like Screenshot 2
                                       const gapAngle = stepAngle * 0.35;

                                       for (let mIdx = 0; mIdx < nMethods; mIdx++) {
                                         const label     = comparisonResults[mIdx].label;
                                         const nextLabel = comparisonResults[(mIdx + 1) % nMethods].label;
                                         const r     = rankToR(rankMap[label]?.[altName] ?? maxRank);
                                         const rNext = rankToR(rankMap[nextLabel]?.[altName] ?? maxRank);

                                         // Sector angles — the arc spans with gap cut off at each end
                                         const sectorStart = startAngle + mIdx * nAlts * stepAngle;
                                         const sectorEnd   = startAngle + (mIdx + 1) * nAlts * stepAngle;

                                         // Arc endpoints with gap
                                         const arcStartAngle = sectorStart + gapAngle;
                                         const arcEndAngle   = sectorEnd   - gapAngle;

                                         const arcS    = pol(r, arcStartAngle);
                                         const arcE    = pol(r, arcEndAngle);
                                         const arcSpan = arcEndAngle - arcStartAngle;
                                         const largeArc = arcSpan > Math.PI ? 1 : 0;

                                         if (mIdx === 0) {
                                           segs.push(`M ${arcS.x.toFixed(2)} ${arcS.y.toFixed(2)}`);
                                         }
                                         // else: we already arrived at arcS via the previous connector Bezier

                                         // Perfect circular arc within this method sector (excluding gap zones)
                                         segs.push(`A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} 1 ${arcE.x.toFixed(2)} ${arcE.y.toFixed(2)}`);

                                         // ── Cubic Bezier connector across the gap ───────────────────────
                                         // P0 = arcE = pol(r,    arcEndAngle)
                                         // P3 = nextArcS = pol(rNext, arcEndAngle + 2*gapAngle)
                                         //    = pol(rNext, sectorEnd + gapAngle)
                                         // Control points use the arc tangent at each endpoint
                                         // Tangent (clockwise) at angle θ = (sin θ, -cos θ)
                                         // Control distance: based on gap size + radial difference (capped)
                                         const nextArcStartAngle = sectorEnd + gapAngle;
                                         const nextArcS = pol(rNext, nextArcStartAngle);

                                         // Tangent at P0
                                         const t0x = Math.sin(arcEndAngle);
                                         const t0y = -Math.cos(arcEndAngle);

                                         // Tangent at P3
                                         const t3x = Math.sin(nextArcStartAngle);
                                         const t3y = -Math.cos(nextArcStartAngle);

                                         // Control distance — proportional to gap arc length for consistency
                                         // capped so curves never exceed outer boundary
                                         const midR = (r + rNext) / 2;
                                         const gapArcLen = midR * 2 * gapAngle;
                                         const radialDiff = Math.abs(r - rNext);
                                         const ctrlDist = Math.min(
                                           gapArcLen * 0.9 + radialDiff * 0.3,
                                           outerR * 0.12
                                         );

                                         const cp1x = arcE.x     + t0x * ctrlDist;
                                         const cp1y = arcE.y     + t0y * ctrlDist;
                                         const cp2x = nextArcS.x - t3x * ctrlDist;
                                         const cp2y = nextArcS.y - t3y * ctrlDist;

                                         segs.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${nextArcS.x.toFixed(2)} ${nextArcS.y.toFixed(2)}`);
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
print("New block start:", repr(verify[START + 1]))

# Verify block end still clean
target = 'case "stackedBar"'
for i in range(7350, 7650):
    if target in verify[i]:
        print(f"Next case at line {i+1}:", repr(verify[i]))
        print(f"Prev:", repr(verify[i-1]))
        print(f"Prev-1:", repr(verify[i-2]))
        break
