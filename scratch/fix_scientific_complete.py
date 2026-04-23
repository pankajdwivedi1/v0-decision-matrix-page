FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

START = 7300
END   = 7593

NEW_CASE = r'''                                  case "scientific": {
                                    // DATA PREP
                                    const nAlts    = comparisonChartAlternatives.length || 1;
                                    const nMethods = comparisonResults.length || 1;
                                    const maxRank  = nAlts;

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

                                    const totalPos   = nMethods * nAlts;
                                    const stepAngle  = (2 * Math.PI) / totalPos;
                                    const startAngle = -Math.PI / 2;

                                    const rankToR = (rank: number) =>
                                      ((maxRank - rank + 1) / maxRank) * outerR;

                                    const pol = (r: number, angle: number) => ({
                                      x: cx + r * Math.cos(angle),
                                      y: cy + r * Math.sin(angle),
                                    });

                                    const withAlpha = (color: string, a: number) => {
                                      if (color.startsWith('#')) {
                                        const r = parseInt(color.slice(1,3),16);
                                        const g = parseInt(color.slice(3,5),16);
                                        const b = parseInt(color.slice(5,7),16);
                                        return `rgba(${r},${g},${b},${a})`;
                                      }
                                      return color.replace(/[\d.]+\)$/, `${a})`);
                                    };

                                    // Build straight-step path for each ALTERNATIVE
                                    const buildAltPath = (altName: string) => {
                                      const segs: string[] = [];
                                      const gapAngle = stepAngle * 0.42;

                                      for (let mIdx = 0; mIdx < nMethods; mIdx++) {
                                        const label     = comparisonResults[mIdx].label;
                                        const nextLabel = comparisonResults[(mIdx + 1) % nMethods].label;
                                        const r     = rankToR(rankMap[label]?.[altName]     ?? maxRank);
                                        const rNext = rankToR(rankMap[nextLabel]?.[altName] ?? maxRank);

                                        const sectorStart = startAngle + mIdx * nAlts * stepAngle;
                                        const sectorEnd   = startAngle + (mIdx + 1) * nAlts * stepAngle;

                                        const arcStartAngle = sectorStart + gapAngle;
                                        const arcEndAngle   = sectorEnd   - gapAngle;

                                        const arcS     = pol(r, arcStartAngle);
                                        const arcE     = pol(r, arcEndAngle);
                                        const arcSpan  = arcEndAngle - arcStartAngle;
                                        const largeArc = arcSpan > Math.PI ? 1 : 0;

                                        if (mIdx === 0) {
                                          segs.push(`M ${arcS.x.toFixed(2)} ${arcS.y.toFixed(2)}`);
                                        }

                                        segs.push(`A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} 1 ${arcE.x.toFixed(2)} ${arcE.y.toFixed(2)}`);

                                        const nextArcStartAngle = sectorEnd + gapAngle;
                                        const nextArcS = pol(rNext, nextArcStartAngle);
                                        segs.push(`L ${nextArcS.x.toFixed(2)} ${nextArcS.y.toFixed(2)}`);
                                      }

                                      segs.push('Z');
                                      return segs.join(' ');
                                    };

                                    const subDivs  = 3;
                                    const nRings   = maxRank * subDivs;

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

                                          {/* 1. METHOD SECTOR FILLS */}
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

                                          {/* 3. WHITE GAP WEDGES - Moved here to mask the grid rings too */}
                                          {comparisonResults.map((_, mIdx) => {
                                            const gapAngle    = stepAngle * 0.42;
                                            const boundaryAng = startAngle + (mIdx + 1) * nAlts * stepAngle;
                                            const gapStart    = boundaryAng - gapAngle;
                                            const gapEnd      = boundaryAng + gapAngle;
                                            const nSamp       = 12;
                                            const wpts: string[] = [];
                                            wpts.push(`M ${cx.toFixed(2)} ${cy.toFixed(2)}`);
                                            for (let s = 0; s <= nSamp; s++) {
                                              const ang = gapStart + (s / nSamp) * (gapEnd - gapStart);
                                              const p   = pol(outerR + 10, ang);
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

                                          {/* 4. RADIAL SPOKE LINES */}
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

                                          {/* 5. ALTERNATIVE POLYGONS: fills (back to front) */}
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

                                          {/* 6. ALTERNATIVE POLYGONS: border lines */}
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

                                          {/* 7. OUTER BOUNDARY */}
                                          <circle
                                            cx={cx} cy={cy} r={outerR}
                                            fill="none"
                                            stroke={themeColors.border}
                                            strokeWidth={chartSettings.borderWidth}
                                            opacity="0.5"
                                          />

                                          {/* 8. RANK LABELS */}
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

                                          {/* 9. CENTER DOT */}
                                          <circle cx={cx} cy={cy} r="4" fill={themeColors.border} opacity="0.8" />
                                        </svg>
                                      </div>
                                    );
                                    break;
                                  }
'''

before = lines[:START]
after  = lines[END + 1:]
new_lines = before + [NEW_CASE] + after

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
