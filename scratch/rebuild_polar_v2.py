import sys

FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

START = 7300   # 0-based index of  case "scientific": {
END   = 7508   # 0-based index of  }  (closing brace of case block)

print(f"Replacing lines {START+1}-{END+1}")
print("Start line:", repr(lines[START]))
print("End line  :", repr(lines[END]))

NEW_CASE = r'''                                  case "scientific": {
                                    // ── DATA PREP ──────────────────────────────────────────
                                    const sciData = comparisonChartAlternatives.map((alt, altIdx) => {
                                      const item: any = { alternative: alt };
                                      comparisonResults.forEach(res => {
                                        const rankItem = res.ranking?.find(r => r.alternativeName === alt);
                                        item[res.label] = rankItem ? rankItem.rank : comparisonChartAlternatives.length;
                                      });
                                      return item;
                                    });

                                    // ── LAYOUT CONSTANTS ───────────────────────────────────
                                    const svgSize   = 820;
                                    const cx        = svgSize / 2;
                                    const cy        = svgSize / 2 + 10;
                                    const outerR    = 310;
                                    const nAlts     = comparisonChartAlternatives.length || 1;
                                    const nMethods  = comparisonResults.length || 1;
                                    const maxRank   = nAlts; // ranking goes 1 … nAlts

                                    // Sub-grid divisions between each rank ring
                                    const subDivs   = 3;
                                    const totalRings = maxRank * subDivs;

                                    // ── HELPER: rank → radius  (rank 1 = outer edge) ───────
                                    const rankToR = (rank: number) =>
                                      ((maxRank - rank + 1) / maxRank) * outerR;

                                    // ── HELPER: polar → cartesian ──────────────────────────
                                    const polar = (r: number, idx: number) => {
                                      const angle = (idx / nAlts) * 2 * Math.PI - Math.PI / 2;
                                      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
                                    };

                                    // ── METHOD FILL COLORS (light tints) ──────────────────
                                    const hexAlpha = (hex: string, a: number) => {
                                      const c = hex.replace('#', '');
                                      const r = parseInt(c.substring(0,2), 16);
                                      const g = parseInt(c.substring(2,4), 16);
                                      const b = parseInt(c.substring(4,6), 16);
                                      return `rgba(${r},${g},${b},${a})`;
                                    };
                                    const tintColor = (color: string, a: number) =>
                                      color.startsWith('#') ? hexAlpha(color, a)
                                        : color.replace(/[\d.]+\)$/, `${a})`);

                                    chartElement = (
                                      <div
                                        ref={comparisonChartRef}
                                        className="w-full h-full flex flex-col items-center justify-start relative select-none overflow-hidden"
                                        style={{ backgroundColor: themeColors.bg }}
                                      >
                                        {/* ── LEGEND ─────────────────────────────────────── */}
                                        <div className="w-full flex-shrink-0 bg-white border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] p-1 mb-1" style={{ maxWidth: '96%', margin: '8px auto 4px' }}>
                                          {/* Row 1: alternatives */}
                                          <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 border-b border-gray-200 pb-1 mb-1">
                                            {comparisonChartAlternatives.map((alt, i) => (
                                              <div key={alt} className="flex items-center gap-1">
                                                <div className="w-6 h-2.5 border border-gray-400" style={{ backgroundColor: activeColors[i % activeColors.length] }} />
                                                <span className="text-[9px] font-bold uppercase">{alt}</span>
                                              </div>
                                            ))}
                                          </div>
                                          {/* Row 2: methods */}
                                          <div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5">
                                            {comparisonResults.map((res, i) => (
                                              <div key={res.label} className="flex items-center gap-1.5">
                                                <div className="w-5 h-3 border border-gray-300 opacity-60" style={{ backgroundColor: activeColors[i % activeColors.length] }} />
                                                <span className="text-[10px] font-black italic text-gray-800">{res.label}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* ── SVG CHART ──────────────────────────────────── */}
                                        <svg
                                          viewBox={`0 0 ${svgSize} ${svgSize + 20}`}
                                          className="w-auto flex-1 max-h-full"
                                          style={{ overflow: 'visible' }}
                                        >
                                          {/* ── 1. FINE CONCENTRIC GRID RINGS ───────────── */}
                                          {Array.from({ length: totalRings }, (_, i) => {
                                            const r = ((i + 1) / totalRings) * outerR;
                                            const isMajor = (i + 1) % subDivs === 0;
                                            return (
                                              <circle
                                                key={`grid-ring-${i}`}
                                                cx={cx} cy={cy} r={r}
                                                fill="none"
                                                stroke={themeColors.text}
                                                strokeWidth={isMajor ? 0.6 : 0.25}
                                                opacity={isMajor ? 0.35 : 0.15}
                                              />
                                            );
                                          })}

                                          {/* ── 2. RADIAL SPOKE LINES ───────────────────── */}
                                          {comparisonChartAlternatives.map((alt, i) => {
                                            const inner = polar(8, i);
                                            const outer = polar(outerR + 5, i);
                                            return (
                                              <line
                                                key={`spoke-${alt}`}
                                                x1={inner.x} y1={inner.y}
                                                x2={outer.x} y2={outer.y}
                                                stroke={themeColors.text}
                                                strokeWidth="0.5"
                                                opacity="0.3"
                                              />
                                            );
                                          })}

                                          {/* ── 3. METHOD FILLED POLYGONS (back → front) ── */}
                                          {comparisonResults.slice().reverse().map((res, revIdx) => {
                                            const mIdx = nMethods - 1 - revIdx;
                                            const color = activeColors[mIdx % activeColors.length];
                                            const points = comparisonChartAlternatives.map((alt, i) => {
                                              const rank = sciData[i]?.[res.label] ?? maxRank;
                                              const r    = rankToR(rank);
                                              return polar(r, i);
                                            });
                                            const d = points
                                              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
                                              .join(' ') + ' Z';
                                            return (
                                              <path
                                                key={`poly-fill-${res.label}`}
                                                d={d}
                                                fill={tintColor(color, 0.18)}
                                                stroke="none"
                                              />
                                            );
                                          })}

                                          {/* ── 4. METHOD BORDER LINES (on top of fills) ── */}
                                          {comparisonResults.map((res, mIdx) => {
                                            const color = activeColors[mIdx % activeColors.length];
                                            const points = comparisonChartAlternatives.map((alt, i) => {
                                              const rank = sciData[i]?.[res.label] ?? maxRank;
                                              const r    = rankToR(rank);
                                              return polar(r, i);
                                            });
                                            const d = points
                                              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
                                              .join(' ') + ' Z';
                                            return (
                                              <path
                                                key={`poly-border-${res.label}`}
                                                d={d}
                                                fill="none"
                                                stroke={color}
                                                strokeWidth={chartSettings.borderWidth + 1.2}
                                                strokeLinejoin="round"
                                                strokeLinecap="round"
                                                opacity="0.92"
                                              />
                                            );
                                          })}

                                          {/* ── 5. OUTER BOUNDARY CIRCLE ─────────────────── */}
                                          <circle
                                            cx={cx} cy={cy} r={outerR}
                                            fill="none"
                                            stroke={themeColors.border}
                                            strokeWidth={chartSettings.borderWidth}
                                            opacity="0.6"
                                          />

                                          {/* ── 6. RANK LABELS on right side ─────────────── */}
                                          {Array.from({ length: maxRank }, (_, i) => {
                                            const rank = i + 1;
                                            const r    = rankToR(rank);
                                            // Place label at ~20deg from top-right (same as screenshot)
                                            const labelAngle = -Math.PI / 2 + Math.PI / 9;
                                            const lx = cx + r * Math.cos(labelAngle) + 4;
                                            const ly = cy + r * Math.sin(labelAngle) - 3;
                                            return (
                                              <text
                                                key={`rank-lbl-${rank}`}
                                                x={lx} y={ly}
                                                fontSize={chartSettings.fontSize - 1}
                                                fontWeight="900"
                                                fill="#dc2626"
                                                textAnchor="start"
                                                style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: 2.5 } as React.CSSProperties}
                                              >
                                                {rank}
                                              </text>
                                            );
                                          })}

                                          {/* ── 7. ALTERNATIVE LABELS at outer edge ──────── */}
                                          {comparisonChartAlternatives.map((alt, i) => {
                                            const angle = (i / nAlts) * 2 * Math.PI - Math.PI / 2;
                                            const labelR = outerR + 28;
                                            const lx = cx + labelR * Math.cos(angle);
                                            const ly = cy + labelR * Math.sin(angle);
                                            const cosA = Math.cos(angle);
                                            const anchor = Math.abs(cosA) < 0.15 ? 'middle' : cosA > 0 ? 'start' : 'end';
                                            return (
                                              <text
                                                key={`alt-lbl-${alt}`}
                                                x={lx} y={ly}
                                                fontSize={chartSettings.fontSize}
                                                fontWeight="700"
                                                fill={themeColors.text}
                                                textAnchor={anchor}
                                                alignmentBaseline="middle"
                                              >
                                                {alt}
                                              </text>
                                            );
                                          })}

                                          {/* ── 8. CENTER DOT ─────────────────────────────── */}
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

with open(FILE, encoding='utf-8') as f:
    verify = f.readlines()

print(f"Done. Old lines {START+1}-{END+1} replaced.")
print(f"New total lines: {len(verify)}")
print("New block starts:", repr(verify[START]))
