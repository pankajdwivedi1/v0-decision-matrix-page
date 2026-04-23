FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

# Find the scientific case block
START = None
END = None
for i, line in enumerate(lines):
    if 'case "scientific": {' in line and START is None:
        START = i
    if START is not None and i > START + 5:
        if line.strip() == '}' and i + 1 < len(lines) and 'case "stackedBar"' in lines[i+1]:
            END = i
            break

print(f"Replacing lines {START+1} to {END+1}")
print("Start:", repr(lines[START]))
print("End  :", repr(lines[END]))

NEW_CASE = r'''                                  case "scientific": {
                                    // DATA PREP
                                    const nAlts    = comparisonChartAlternatives.length || 1;
                                    const nMethods = comparisonResults.length || 1;
                                    const maxRank  = nAlts;

                                    // Build rank lookup: rankMap[methodLabel][altName] = rank
                                    const rankMap: Record<string, Record<string, number>> = {};
                                    comparisonResults.forEach(res => {
                                      rankMap[res.label] = {};
                                      comparisonChartAlternatives.forEach(alt => {
                                        const ri = res.ranking?.find(r => r.alternativeName === alt);
                                        rankMap[res.label][alt] = ri ? ri.rank : maxRank;
                                      });
                                    });

                                    // LAYOUT
                                    const svgW   = 820;
                                    const svgH   = 860;
                                    const cx     = svgW / 2;
                                    const cy     = svgH / 2 + 20;
                                    const outerR = 310;

                                    // Total angular positions: nMethods sectors x nAlts sub-spokes
                                    const totalPos   = nMethods * nAlts;
                                    const stepAngle  = (2 * Math.PI) / totalPos;
                                    const startAngle = -Math.PI / 2; // top

                                    // rank -> radius: rank 1 = outerR, rank N = small
                                    const rankToR = (rank: number) =>
                                      ((maxRank - rank + 1) / maxRank) * outerR;

                                    // polar -> cartesian
                                    const pol = (r: number, angle: number) => ({
                                      x: cx + r * Math.cos(angle),
                                      y: cy + r * Math.sin(angle),
                                    });

                                    // hex or rgba -> rgba string with alpha
                                    const withAlpha = (color: string, a: number) => {
                                      if (color.startsWith('#')) {
                                        const r = parseInt(color.slice(1,3),16);
                                        const g = parseInt(color.slice(3,5),16);
                                        const b = parseInt(color.slice(5,7),16);
                                        return `rgba(${r},${g},${b},${a})`;
                                      }
                                      return color.replace(/[\d.]+\)$/, `${a})`);
                                    };

                                    // Sub-grid rings
                                    const subDivs  = 3;
                                    const nRings   = maxRank * subDivs;

                                    // Build polygon path for each ALTERNATIVE:
                                    // For each (method, alt_sub_position) cell, the alt's radius =
                                    // its rank in that method. Within a method sector the radius
                                    // is CONSTANT for that alt -> arcs step at method boundaries.
                                    const buildAltPath = (altName: string) => {
                                      // We build the polygon by going through all totalPos positions in order
                                      // Position index p = methodIdx * nAlts + altSubIdx
                                      // For each position p: angle = startAngle + p * stepAngle (mid-cell)
                                      // The radius = rankToR(rank of altName in method at methodIdx)
                                      const pts: {x: number; y: number}[] = [];
                                      for (let mIdx = 0; mIdx < nMethods; mIdx++) {
                                        const label = comparisonResults[mIdx].label;
                                        const r     = rankToR(rankMap[label]?.[altName] ?? maxRank);
                                        // This alt traces an ARC from start to end of this method sector
                                        const sectorStart = startAngle + mIdx * nAlts * stepAngle;
                                        const sectorEnd   = startAngle + (mIdx + 1) * nAlts * stepAngle;
                                        // Sample the arc with nAlts+1 points for smooth step
                                        const nSamples = nAlts * 2;
                                        for (let s = 0; s <= nSamples; s++) {
                                          const ang = sectorStart + (s / nSamples) * (sectorEnd - sectorStart);
                                          pts.push(pol(r, ang));
                                        }
                                      }
                                      return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z';
                                    };

                                    chartElement = (
                                      <div
                                        ref={comparisonChartRef}
                                        className="w-full flex flex-col items-center relative select-none"
                                        style={{ backgroundColor: themeColors.bg }}
                                      >
                                        {/* LEGEND */}
                                        <div
                                          className="bg-white border-2 border-black p-1 mb-2"
                                          style={{ width: '96%', margin: '8px auto 6px', boxShadow: '3px 3px 0 #000' }}
                                        >
                                          <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 border-b border-gray-200 pb-1 mb-1">
                                            {comparisonChartAlternatives.map((alt, i) => (
                                              <div key={alt} className="flex items-center gap-1">
                                                <div className="w-5 h-2" style={{ backgroundColor: activeColors[i % activeColors.length] }} />
                                                <span className="text-[9px] font-bold uppercase">{alt}</span>
                                              </div>
                                            ))}
                                          </div>
                                          <div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5">
                                            {comparisonResults.map((res, i) => (
                                              <div key={res.label} className="flex items-center gap-1.5">
                                                <div className="w-5 h-3 border border-gray-300 opacity-50" style={{ backgroundColor: activeColors[i % activeColors.length] }} />
                                                <span className="text-[10px] font-black italic text-gray-800">{res.label}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* SVG */}
                                        <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ display: 'block' }}>

                                          {/* 1. METHOD SECTOR FILLS (light background per method) */}
                                          {comparisonResults.map((res, mIdx) => {
                                            const color = activeColors[mIdx % activeColors.length];
                                            const sStart = startAngle + mIdx * nAlts * stepAngle;
                                            const sEnd   = startAngle + (mIdx + 1) * nAlts * stepAngle;
                                            const nSamples = 40;
                                            const arcPts: string[] = [];
                                            arcPts.push(`M ${cx.toFixed(2)} ${cy.toFixed(2)}`);
                                            for (let s = 0; s <= nSamples; s++) {
                                              const ang = sStart + (s / nSamples) * (sEnd - sStart);
                                              const p = pol(outerR, ang);
                                              arcPts.push(`L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
                                            }
                                            arcPts.push('Z');
                                            return (
                                              <path
                                                key={`sector-fill-${res.label}`}
                                                d={arcPts.join(' ')}
                                                fill={withAlpha(color, 0.08)}
                                                stroke="none"
                                              />
                                            );
                                          })}

                                          {/* 2. CONCENTRIC GRID RINGS */}
                                          {Array.from({ length: nRings }, (_, i) => {
                                            const r       = ((i + 1) / nRings) * outerR;
                                            const isMajor = (i + 1) % subDivs === 0;
                                            return (
                                              <circle
                                                key={`ring-${i}`}
                                                cx={cx} cy={cy} r={r}
                                                fill="none"
                                                stroke={themeColors.text}
                                                strokeWidth={isMajor ? 0.55 : 0.2}
                                                opacity={isMajor ? 0.3 : 0.12}
                                              />
                                            );
                                          })}

                                          {/* 3. RADIAL SPOKE LINES (sub-divisions per method) */}
                                          {Array.from({ length: totalPos }, (_, p) => {
                                            const angle = startAngle + p * stepAngle;
                                            const inner = pol(0, angle);
                                            const outer = pol(outerR + 3, angle);
                                            const isMethodBoundary = p % nAlts === 0;
                                            return (
                                              <line
                                                key={`spoke-${p}`}
                                                x1={inner.x} y1={inner.y}
                                                x2={outer.x} y2={outer.y}
                                                stroke={themeColors.text}
                                                strokeWidth={isMethodBoundary ? 0.8 : 0.3}
                                                opacity={isMethodBoundary ? 0.4 : 0.15}
                                              />
                                            );
                                          })}

                                          {/* 4. ALTERNATIVE POLYGONS: fills (back to front) */}
                                          {comparisonChartAlternatives.slice().reverse().map((alt, ri) => {
                                            const altIdx = nAlts - 1 - ri;
                                            const color  = activeColors[altIdx % activeColors.length];
                                            const d      = buildAltPath(alt);
                                            return (
                                              <path
                                                key={`alt-fill-${alt}`}
                                                d={d}
                                                fill={withAlpha(color, 0.12)}
                                                stroke="none"
                                              />
                                            );
                                          })}

                                          {/* 5. ALTERNATIVE POLYGONS: border lines */}
                                          {comparisonChartAlternatives.map((alt, altIdx) => {
                                            const color = activeColors[altIdx % activeColors.length];
                                            const d     = buildAltPath(alt);
                                            return (
                                              <path
                                                key={`alt-border-${alt}`}
                                                d={d}
                                                fill="none"
                                                stroke={color}
                                                strokeWidth={chartSettings.borderWidth + 1}
                                                strokeLinejoin="round"
                                                strokeLinecap="round"
                                                opacity="0.92"
                                              />
                                            );
                                          })}

                                          {/* 6. OUTER BOUNDARY */}
                                          <circle
                                            cx={cx} cy={cy} r={outerR}
                                            fill="none"
                                            stroke={themeColors.border}
                                            strokeWidth={chartSettings.borderWidth}
                                            opacity="0.5"
                                          />

                                          {/* 7. RANK LABELS (right side, on major rings) */}
                                          {Array.from({ length: maxRank }, (_, i) => {
                                            const rank  = i + 1;
                                            const r     = rankToR(rank);
                                            const angle = startAngle + Math.PI / 10;
                                            const p     = pol(r, angle);
                                            return (
                                              <text
                                                key={`rank-lbl-${rank}`}
                                                x={p.x + 4} y={p.y - 2}
                                                fontSize={chartSettings.fontSize - 1}
                                                fontWeight="900"
                                                fill="#dc2626"
                                                textAnchor="start"
                                                style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: 2 } as React.CSSProperties}
                                              >
                                                {rank}
                                              </text>
                                            );
                                          })}

                                          {/* 8. METHOD LABELS at sector midpoints (outer edge) */}
                                          {comparisonResults.map((res, mIdx) => {
                                            const midAng = startAngle + (mIdx + 0.5) * nAlts * stepAngle;
                                            const p      = pol(outerR + 32, midAng);
                                            const cosV   = Math.cos(midAng);
                                            const anchor = Math.abs(cosV) < 0.2 ? 'middle' : cosV > 0 ? 'start' : 'end';
                                            return (
                                              <text
                                                key={`method-lbl-${res.label}`}
                                                x={p.x} y={p.y}
                                                fontSize={chartSettings.fontSize + 1}
                                                fontWeight="800"
                                                fill={activeColors[mIdx % activeColors.length]}
                                                textAnchor={anchor}
                                                alignmentBaseline="middle"
                                              >
                                                {res.label}
                                              </text>
                                            );
                                          })}

                                          {/* 9. ALTERNATIVE LABELS at sub-spoke midpoints */}
                                          {comparisonChartAlternatives.map((alt, i) => {
                                            // Place label at first method sector's sub-spoke for that alt
                                            const subSpokeAngle = startAngle + (0 * nAlts + i + 0.5) * stepAngle;
                                            const p = pol(outerR + 16, subSpokeAngle);
                                            const cosV = Math.cos(subSpokeAngle);
                                            const anchor = Math.abs(cosV) < 0.15 ? 'middle' : cosV > 0 ? 'start' : 'end';
                                            return (
                                              <text
                                                key={`alt-sub-lbl-${alt}`}
                                                x={p.x} y={p.y}
                                                fontSize={chartSettings.fontSize - 2}
                                                fontWeight="600"
                                                fill={themeColors.text}
                                                textAnchor={anchor}
                                                alignmentBaseline="middle"
                                                opacity="0.7"
                                              >
                                                {alt}
                                              </text>
                                            );
                                          })}

                                          {/* 10. CENTER DOT */}
                                          <circle cx={cx} cy={cy} r="4" fill={themeColors.border} opacity="0.8" />
                                        </svg>
                                      </div>
                                    );
                                    break;
                                  }
'''

before    = lines[:START]
after     = lines[END + 1:]
new_lines = before + [NEW_CASE] + after

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

with open(FILE, encoding='utf-8') as f:
    verify = f.readlines()

print(f"Done. New total lines: {len(verify)}")
print("Block start:", repr(verify[START]))
# Check next case
for i in range(START, START + 250):
    if 'case "stackedBar"' in verify[i]:
        print(f"Next case at line {i+1}:", repr(verify[i]))
        print(f"Prev line {i}:", repr(verify[i-1]))
        print(f"Line {i-1}:", repr(verify[i-2]))
        break
