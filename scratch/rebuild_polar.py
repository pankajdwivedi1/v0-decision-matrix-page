import re

FILE = 'app/application/page.tsx'

with open(FILE, encoding='utf-8') as f:
    lines = f.readlines()

# Lines are 1-indexed; 7301-7438 (inclusive) = indices 7300-7437
START = 7300  # 0-based, inclusive
END = 7437    # 0-based, inclusive

new_case = '''                                  case "scientific": {
                                     const scientificData = comparisonChartAlternatives.map(alt => {
                                       const item: any = { alternative: alt };
                                       comparisonResults.forEach(res => {
                                         const rankItem = res.ranking?.find(r => r.alternativeName === alt);
                                         item[res.label] = rankItem ? rankItem.rank : comparisonChartAlternatives.length;
                                       });
                                       return item;
                                     });

                                     const sideLen = 800;
                                     const centerX = sideLen / 2;
                                     const centerY = sideLen / 2 + 30;
                                     const maxRad = 300;

                                     const nAlts = comparisonChartAlternatives.length;
                                     const nMethods = comparisonResults.length;
                                     const sliceAngle = (2 * Math.PI) / Math.max(nAlts, 1);
                                     const gapAngle = 0.015;
                                     const dynMaxRank = Math.max(nAlts, 2);
                                     const methodRingStep = maxRad / Math.max(nMethods, 1);

                                     chartElement = (
                                       <div ref={comparisonChartRef} className="w-full h-full flex flex-col items-center justify-center relative select-none" style={{ backgroundColor: themeColors.bg }}>
                                         {/* Legend Header */}
                                         <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-1 z-10">
                                           <div className="flex border-b border-gray-200">
                                             {comparisonChartAlternatives.map((alt, i) => (
                                               <div key={alt} className="flex-1 text-[9px] font-bold py-1 px-2 text-center border-r last:border-r-0 flex items-center justify-center gap-1.5">
                                                 <div className="w-2 h-2 shrink-0 border border-black/20" style={{ backgroundColor: activeColors[i % activeColors.length] }}></div>
                                                 <span className="truncate uppercase">{alt}</span>
                                               </div>
                                             ))}
                                           </div>
                                           <div className="flex justify-center gap-6 py-1.5 bg-gray-50/50">
                                             {comparisonResults.map((res, i) => (
                                               <div key={res.label} className="flex items-center gap-2">
                                                 <div className="w-4 h-3 opacity-70 border border-gray-400" style={{ backgroundColor: activeColors[i % activeColors.length] }}></div>
                                                 <span className="text-[10px] font-black italic tracking-wider text-gray-800">{res.label}</span>
                                               </div>
                                             ))}
                                           </div>
                                         </div>

                                         <svg viewBox={`0 0 ${sideLen} ${sideLen + 100}`} className="w-auto h-full max-h-full">
                                           <defs>
                                             {comparisonChartAlternatives.map((alt, altIdx) => {
                                               const baseColor = activeColors[altIdx % activeColors.length];
                                               return (
                                                 <radialGradient key={`grad-${alt}`} id={`rgrad-${altIdx}`} cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse" fx={centerX} fy={centerY} r={maxRad}>
                                                   <stop offset="0%" stopColor={baseColor} stopOpacity="0.05" />
                                                   <stop offset="100%" stopColor={baseColor} stopOpacity="0.3" />
                                                 </radialGradient>
                                               );
                                             })}
                                           </defs>

                                           {/* Draw each alternative sector */}
                                           {comparisonChartAlternatives.map((alt, altIdx) => {
                                             const altColor = activeColors[altIdx % activeColors.length];
                                             const startAngle = altIdx * sliceAngle - Math.PI / 2 + gapAngle;
                                             const endAngle = (altIdx + 1) * sliceAngle - Math.PI / 2 - gapAngle;
                                             const arcSpan = endAngle - startAngle;
                                             const largeArc = arcSpan > Math.PI ? 1 : 0;

                                             return (
                                               <g key={`sector-${alt}`}>
                                                 {/* Background gradient sector */}
                                                 {(() => {
                                                   const ox1 = centerX + maxRad * Math.cos(startAngle);
                                                   const oy1 = centerY + maxRad * Math.sin(startAngle);
                                                   const ox2 = centerX + maxRad * Math.cos(endAngle);
                                                   const oy2 = centerY + maxRad * Math.sin(endAngle);
                                                   return (
                                                     <path
                                                       d={`M ${centerX} ${centerY} L ${ox1} ${oy1} A ${maxRad} ${maxRad} 0 ${largeArc} 1 ${ox2} ${oy2} Z`}
                                                       fill={`url(#rgrad-${altIdx})`}
                                                       stroke={altColor}
                                                       strokeWidth={chartSettings.borderWidth + 1.5}
                                                       strokeLinejoin="round"
                                                       strokeOpacity="0.9"
                                                     />
                                                   );
                                                 })()}

                                                 {/* Draw each method ring as filled arc within sector */}
                                                 {comparisonResults.map((res, mIdx) => {
                                                   const rank = scientificData[altIdx]?.[res.label] ?? dynMaxRank;
                                                   const outerR = (nMethods - mIdx) * methodRingStep;
                                                   const innerR = Math.max((nMethods - mIdx - 1) * methodRingStep, 0);
                                                   // Fill radius: rank 1 = full outerR, rank N = innerR
                                                   const fillR = outerR - ((rank - 1) / Math.max(dynMaxRank - 1, 1)) * (outerR - innerR);
                                                   if (fillR < 1) return null;

                                                   const fx1 = centerX + innerR * Math.cos(startAngle);
                                                   const fy1 = centerY + innerR * Math.sin(startAngle);
                                                   const fx2 = centerX + fillR * Math.cos(startAngle);
                                                   const fy2 = centerY + fillR * Math.sin(startAngle);
                                                   const fx3 = centerX + fillR * Math.cos(endAngle);
                                                   const fy3 = centerY + fillR * Math.sin(endAngle);
                                                   const fx4 = centerX + innerR * Math.cos(endAngle);
                                                   const fy4 = centerY + innerR * Math.sin(endAngle);

                                                   const pathD = innerR > 2
                                                     ? `M ${fx1} ${fy1} L ${fx2} ${fy2} A ${fillR} ${fillR} 0 ${largeArc} 1 ${fx3} ${fy3} L ${fx4} ${fy4} A ${innerR} ${innerR} 0 ${largeArc} 0 ${fx1} ${fy1} Z`
                                                     : `M ${centerX} ${centerY} L ${fx2} ${fy2} A ${fillR} ${fillR} 0 ${largeArc} 1 ${fx3} ${fy3} Z`;

                                                   const fillOpacity = 0.22 + (mIdx * 0.05);

                                                   return (
                                                     <path
                                                       key={`arc-${alt}-${res.label}`}
                                                       d={pathD}
                                                       fill={altColor}
                                                       fillOpacity={Math.min(fillOpacity, 0.55)}
                                                       stroke={altColor}
                                                       strokeWidth={0.8}
                                                       strokeOpacity="0.6"
                                                       strokeLinejoin="round"
                                                     />
                                                   );
                                                 })}
                                               </g>
                                             );
                                           })}

                                           {/* Concentric ring borders per method */}
                                           {comparisonResults.map((_res, mIdx) => {
                                             const r = (nMethods - mIdx) * methodRingStep;
                                             return (
                                               <circle
                                                 key={`ring-border-${mIdx}`}
                                                 cx={centerX} cy={centerY} r={r}
                                                 fill="none"
                                                 stroke={themeColors.text}
                                                 strokeWidth="0.7"
                                                 opacity="0.3"
                                                 strokeDasharray="3,5"
                                               />
                                             );
                                           })}

                                           {/* Sector dividers */}
                                           {comparisonChartAlternatives.map((alt, altIdx) => {
                                             const angle = altIdx * sliceAngle - Math.PI / 2;
                                             return (
                                               <line
                                                 key={`div-${alt}`}
                                                 x1={centerX} y1={centerY}
                                                 x2={centerX + (maxRad + 8) * Math.cos(angle)}
                                                 y2={centerY + (maxRad + 8) * Math.sin(angle)}
                                                 stroke={themeColors.text}
                                                 strokeWidth="0.6"
                                                 opacity="0.2"
                                               />
                                             );
                                           })}

                                           {/* Alternative labels */}
                                           {comparisonChartAlternatives.map((alt, altIdx) => {
                                             const midAngle = (altIdx + 0.5) * sliceAngle - Math.PI / 2;
                                             const labelR = maxRad + 44;
                                             const lx = centerX + labelR * Math.cos(midAngle);
                                             const ly = centerY + labelR * Math.sin(midAngle);
                                             const cosV = Math.cos(midAngle);
                                             const anchor = Math.abs(cosV) < 0.18 ? "middle" : (cosV > 0 ? "start" : "end");
                                             return (
                                               <text
                                                 key={`alt-label-${alt}`}
                                                 x={lx} y={ly}
                                                 fontSize="12"
                                                 fontWeight="700"
                                                 fill={themeColors.text}
                                                 textAnchor={anchor}
                                                 alignmentBaseline="middle"
                                               >
                                                 {alt}
                                               </text>
                                             );
                                           })}

                                           {/* Rank numbers on right side of each method ring */}
                                           {comparisonResults.map((_res, mIdx) => {
                                             const outerR = (nMethods - mIdx) * methodRingStep;
                                             const labelAngle = Math.PI / 9;
                                             const lx = centerX + outerR * Math.cos(labelAngle) + 3;
                                             const ly = centerY + outerR * Math.sin(labelAngle) - 3;
                                             return (
                                               <text
                                                 key={`rank-num-${mIdx}`}
                                                 x={lx} y={ly}
                                                 fontSize="12"
                                                 fontWeight="900"
                                                 fill="#dc2626"
                                                 textAnchor="start"
                                                 style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 3 } as React.CSSProperties}
                                               >
                                                 {mIdx + 1}
                                               </text>
                                             );
                                           })}

                                           {/* Center dot */}
                                           <circle cx={centerX} cy={centerY} r="5" fill={themeColors.border} />
                                         </svg>
                                       </div>
                                     );
                                     break;
                                   }
'''

before = lines[:START]
after = lines[END + 1:]
new_lines = before + [new_case] + after

with open(FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Done. Replaced lines {START+1}-{END+1}. New total: {len(new_lines)} lines.")
