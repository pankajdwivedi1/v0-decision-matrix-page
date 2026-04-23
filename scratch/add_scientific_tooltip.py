FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

# Find the start and end of the chartElement block within case scientific
# 7386: chartElement = (
# ...
# 7567: );
START = None
END   = None
for i in range(7300, 7600):
    if 'chartElement = (' in lines[i]:
        START = i
    if START is not None and 'break;' in lines[i] and i > START:
        END = i - 1
        break

print(f"Found block: {START+1} to {END+1}")

TOOLTIP_CODE = r'''                                    chartElement = (
                                      <div
                                        ref={comparisonChartRef}
                                        className="w-full flex flex-col items-center relative select-none"
                                        style={{ backgroundColor: themeColors.bg }}
                                      >
                                        {/* LEGEND */}
                                        <div
                                          className="bg-white border-2 border-black p-1 mb-0"
                                          style={{ width: '96%', margin: '4px auto 0', boxShadow: '3px 3px 0 #000' }}
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
                                        <svg 
                                          viewBox={`0 0 ${svgW} ${svgH}`} 
                                          width="100%" 
                                          style={{ display: 'block' }}
                                          onMouseMove={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const y = e.clientY - rect.top;
                                            
                                            // Scale to SVG coordinates
                                            const svgX = (x / rect.width) * svgW;
                                            const svgY = (y / rect.height) * svgH;
                                            
                                            // Polar math relative to chart center
                                            const dx = svgX - cx;
                                            const dy = svgY - cy;
                                            let angle = Math.atan2(dy, dx);
                                            
                                            // Normalize relative to startAngle
                                            let normAngle = (angle - startAngle) % (2 * Math.PI);
                                            if (normAngle < 0) normAngle += 2 * Math.PI;
                                            
                                            const mIdx = Math.floor(normAngle / (nAlts * stepAngle));
                                            if (mIdx >= 0 && mIdx < nMethods) {
                                              setScientificHoverInfo({ methodIdx: mIdx, x: e.clientX, y: e.clientY });
                                            } else {
                                              setScientificHoverInfo(null);
                                            }
                                          }}
                                          onMouseLeave={() => setScientificHoverInfo(null)}
                                        >

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
                                                fill={withAlpha(color, scientificHoverInfo?.methodIdx === mIdx ? 0.22 : 0.08)}
                                                stroke="none"
                                                className="transition-all duration-300"
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

                                          {/* 3. WHITE GAP WEDGES - Moved here to mask the grid rings and fills */}
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
                                                strokeWidth={chartSettings.borderWidth + 2.2}
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

                                        {/* FLOATING TOOLTIP */}
                                        {scientificHoverInfo && (
                                          <div
                                            className="fixed z-[100] bg-white border-2 border-black p-2 shadow-[4px_4px_0_rgba(0,0,0,1)] pointer-events-none"
                                            style={{
                                              left: scientificHoverInfo.x + 15,
                                              top: scientificHoverInfo.y + 15,
                                              transform: 'translate(0, 0)',
                                              minWidth: '160px'
                                            }}
                                          >
                                            <div className="text-center font-black border-b-2 border-black pb-1 mb-2 text-sm uppercase italic">
                                              {comparisonResults[scientificHoverInfo.methodIdx].label}
                                            </div>
                                            <div className="space-y-1">
                                              {comparisonChartAlternatives.map((alt, i) => {
                                                const rank = rankMap[comparisonResults[scientificHoverInfo.methodIdx].label]?.[alt];
                                                return (
                                                  <div key={alt} className="flex justify-between items-center gap-4">
                                                    <span className="text-[11px] font-bold" style={{ color: activeColors[i % activeColors.length] }}>
                                                      {alt}
                                                    </span>
                                                    <span className="text-[10px] font-black text-gray-500 uppercase">
                                                      Rank <span className="text-black text-sm">{rank}</span>
                                                    </span>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
'''

new_lines = lines[:START] + [TOOLTIP_CODE] + lines[END + 1:]

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
