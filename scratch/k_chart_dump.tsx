const renderKSensChart = (criterionName: string) => {
    const isWeightView = kSensViewType === 'weight';
    const targetCrit = workingCriteria.find(c => c.name === criterionName);
    const data = isWeightView ? calculateWeightSensitivityData(targetCrit?.id || '') : generateKSensChartData(criterionName);

    // Show a themed loading state when analyzing
    if (isAnalyzing) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3 opacity-70" />
          <p className="text-sm text-gray-500 font-medium">Recalculating Analysis...</p>
          <p className="text-[10px] text-gray-400 mt-1">Updating variations and rankings</p>
        </div>
      );
    }
    const commonProps = {
      data,
      margin: isMobile
        ? { top: 10, right: 5, left: 30, bottom: 55 }
        : { top: 20, right: 50, left: 60, bottom: 60 }
    };

    if (kSensChartType === 'dual' && isWeightView) {
      return <div className="p-4 text-center text-gray-500 font-bold text-xs mt-10">Dual-Axis chart is not available for Weight Analysis. Please use another chart type.</div>;
    }

    if (kSensChartType === 'heatmap' && isWeightView) {
      return <div className="p-4 text-center text-gray-500 font-bold text-xs mt-10">Heatmap is not available for Weight Analysis. Please use another chart type.</div>;
    }

    if (kSensChartType === 'radar') {
      if (isWeightView) {
        // Radar for Weight Analysis: Axes are variations, Radar areas are Criteria weights.
        const radarData = kSensVariationRange.map((v, vIdx) => {
          const row: any = { scenario: `${v}%` };
          workingCriteria.forEach(crit => {
            row[crit.name] = data[vIdx] ? data[vIdx][crit.name] : 0;
          });
          return row;
        });

        return (
          <div ref={chartRef} className="bg-white max-w-7xl mx-auto p-10 border-2 border-black shadow-lg relative">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-black uppercase tracking-widest text-[#000]">Weight Stability Forensic Radar</h3>
              <p className="text-xs italic text-gray-600 mt-1">Axes = Perturbation Scenario | Lines = Criteria Weight</p>
            </div>
            <ResponsiveContainer width="100%" height={750}>
              <RadarChart data={radarData} outerRadius="85%" margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <PolarGrid gridType="polygon" stroke="#000" strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="scenario" tick={{ fontSize: 11, fontWeight: '900', fill: '#000' }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 'auto']} 
                  tick={{ fontSize: 10, fill: '#000', fontWeight: '900' }} 
                  tickFormatter={(val) => val.toFixed(2)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border-2 border-black p-2 shadow-xl text-[10px]">
                          <p className="font-black border-b border-black mb-1 pb-1">Scenario: {payload[0].payload.scenario}</p>
                          {payload.map((entry: any) => (
                            <div key={entry.dataKey} className="flex justify-between gap-4 py-0.5">
                              <span className="font-bold" style={{ color: entry.color }}>{entry.name}:</span>
                              <span className="font-black">{Number(entry.value).toFixed(4)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  layout="vertical"
                  wrapperStyle={{
                    fontSize: "9px",
                    color: '#000',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1.5px solid #000',
                    padding: '10px',
                    top: 60,
                    right: 150,
                    width: 'auto',
                    zIndex: 100,
                    boxShadow: '4px 4px 0px #000'
                  }}
                  iconSize={10}
                />
                {workingCriteria.map((crit, idx) => (
                  <Radar
                    key={crit.name}
                    name={crit.name}
                    dataKey={crit.name}
                    stroke={colors[idx % colors.length]}
                    fill="transparent"
                    strokeWidth={crit.id === selectedCriterionToVary ? 4 : 2}
                    strokeDasharray={crit.id === selectedCriterionToVary ? "" : "5 5"}
                    dot={{ r: 3, fill: colors[idx % colors.length] }}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      const maxRank = alternatives.length;
      const getScientificColor = (p: number) => {
        const stops = [
          { r: 43, g: 0, b: 81 },   // Deep Purple
          { r: 49, g: 71, b: 129 }, // Deep Blue
          { r: 35, g: 136, b: 142 }, // Teal
          { r: 91, g: 193, b: 101 },  // Green
          { r: 253, g: 231, b: 37 }  // Yellow
        ];
        const i = Math.min(stops.length - 2, Math.floor(p * (stops.length - 1)));
        const segmentP = (p * (stops.length - 1)) - i;
        const r = Math.round(stops[i].r + (stops[i + 1].r - stops[i].r) * segmentP);
        const g = Math.round(stops[i].g + (stops[i + 1].g - stops[i].g) * segmentP);
        const b = Math.round(stops[i].b + (stops[i + 1].b - stops[i].b) * segmentP);
        return `rgb(${r},${g},${b})`;
      };

      // TRANSPOSE DATA: Axes = Variation Scenarios
      const radarData = kSensVariationRange.map((v, vIdx) => {
        const row: any = { scenario: `${v}%` };
        alternatives.forEach(alt => {
          // Safety check: ensure the result exists for this variation index
          const resultAtStep = kSensResults[criterionName]?.[vIdx];
          const actualRank = resultAtStep?.rankings?.[alt.name]?.rank || maxRank;
          row[alt.name] = maxRank + 1 - actualRank; // Perimeter is Best
        });
        return row;
      });

      return (
        <div ref={chartRef} className="bg-white max-w-7xl mx-auto p-10 border-2 border-black shadow-lg relative">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-black uppercase tracking-widest text-[#000]">Alternative Stability Forensic Radar</h3>
            <p className="text-xs italic text-gray-600 mt-1">Each line represents an Alternative | Outer Perimeter = Rank 1 (Optimal Stability)</p>
          </div>
          <ResponsiveContainer width="100%" height={750}>
            <RadarChart data={radarData} outerRadius="85%" margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <PolarGrid gridType="polygon" stroke="#000" strokeOpacity={0.2} />
              <PolarAngleAxis
                dataKey="scenario"
                tick={{ fontSize: 11, fontWeight: '900', fill: '#000' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[1, maxRank]}
                tick={{ fontSize: 10, fill: '#000', fontWeight: '900' }}
                tickFormatter={(val) => {
                  const originalRank = Math.round(maxRank + 1 - val);
                  return originalRank > 0 ? originalRank.toString() : '';
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border-2 border-black p-2 shadow-xl text-[10px]">
                        <p className="font-black border-b border-black mb-1 pb-1">Scenario: {payload[0].payload.scenario}</p>
                        {payload.map((entry: any) => (
                          <div key={entry.dataKey} className="flex justify-between gap-4 py-0.5">
                            <span className="font-bold" style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-black">Rank {Math.round(maxRank + 1 - entry.value)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                layout="vertical"
                wrapperStyle={{
                  fontSize: "9px",
                  color: '#000',
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1.5px solid #000',
                  padding: '10px',
                  top: 60,
                  right: 150,
                  width: 'auto',
                  zIndex: 100,
                  boxShadow: '4px 4px 0px #000'
                }}
                iconSize={10}
              />
              {alternatives.map((alt, altIdx) => (
                <Radar
                  key={alt.name}
                  name={alt.name}
                  dataKey={alt.name}
                  stroke={getScientificColor(altIdx / (Math.max(1, alternatives.length - 1)))}
                  fill="transparent"
                  strokeWidth={altIdx % 2 === 0 ? 3 : 2}
                  strokeDasharray={altIdx % 3 === 0 ? "" : altIdx % 3 === 1 ? "5 5" : "3 1"}
                  dot={{ r: 3, fill: getScientificColor(altIdx / (Math.max(1, alternatives.length - 1))) }}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-6 p-4 bg-gray-50 border-t-2 border-black text-[10px] items-center flex gap-4">
            <div className="h-full bg-black text-white px-2 py-1 font-black uppercase text-[8px] vertical-text">VERIFIED</div>
            <div className="flex-1 leading-relaxed text-gray-800 font-bold">
              <span className="text-black uppercase block mb-1">TRANSPOSITIONAL FORENSIC ANALYSIS:</span>
              V2.5-STABILITY: Each unique line trace tracks an individual alternative. Overlapping lines indicate identical rank-sensitivity signatures.
              Different line weights and dash patterns distinguish tied alternatives.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={chartRef} className="bg-white max-w-7xl mx-auto">
        {['line', 'area', 'stackedArea'].includes(kSensChartType) ? (
          <ResponsiveContainer width="100%" height={600}>
            {['area', 'stackedArea'].includes(kSensChartType) ? (
              <AreaChart data={data} margin={{ top: 40, right: 100, left: 80, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="variation" tick={{ fontSize: 10, fill: '#000' }} axisLine={{ stroke: '#000' }} tickLine={{ stroke: '#000' }} interval={0} padding={{ left: 10, right: 10 }} label={{ value: 'Perturbation Strength (%)', position: 'insideBottom', offset: -10, style: { fontSize: 11, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' } }} />
                <XAxis orientation="top" xAxisId="top_border" axisLine={{ stroke: '#000' }} tick={false} tickLine={false} />
                <YAxis reversed={isWeightView ? false : true} tick={{ fontSize: 10, fill: '#000' }} axisLine={{ stroke: '#000' }} tickLine={{ stroke: '#000' }} domain={isWeightView ? (kSensChartType === 'stackedArea' ? [0, 1] : [0, 'auto']) : [1, alternatives.length]} allowDecimals={isWeightView} ticks={!isWeightView ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined} label={{ value: isWeightView ? 'Criterion Weight' : 'Alternative Rank', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 11, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' } }} />
                <YAxis orientation="right" yAxisId="right_border" width={1} axisLine={{ stroke: '#000' }} tick={false} tickLine={false} domain={isWeightView ? (kSensChartType === 'stackedArea' ? [0, 1] : [0, 'auto']) : [1, alternatives.length]} />
                <Tooltip />
                <Legend verticalAlign="top" align="right" layout="vertical" wrapperStyle={{ fontSize: "8px", color: '#000', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #333', padding: '4px', top: 73, right: 230, width: 'auto', zIndex: 50, boxShadow: '1px 1px 3px rgba(0,0,0,0.1)' }} iconSize={8} />
                {isWeightView ? (
                  workingCriteria.map((crit, idx) => (
                    <Area
                      key={crit.id}
                      type="monotone"
                      dataKey={crit.name}
                      name={crit.name}
                      stroke={colors[idx % colors.length]}
                      fill={colors[idx % colors.length]}
                      strokeWidth={1}
                      stackId={kSensChartType === 'stackedArea' ? "1" : undefined}
                      fillOpacity={kSensChartType === 'stackedArea' ? 0.8 : 0.3}
                      activeDot={{ r: 5 }}
                    />
                  ))
                ) : (
                  alternatives.map((alt, altIdx) => (
                    <Area
                      key={alt.name}
                      type="monotone"
                      dataKey={alt.name}
                      name={alt.name}
                      stroke={colors[altIdx % colors.length]}
                      fill={colors[altIdx % colors.length]}
                      strokeWidth={2}
                      stackId={kSensChartType === 'stackedArea' ? "1" : undefined}
                      fillOpacity={kSensChartType === 'stackedArea' ? 0.8 : 0.3}
                    />
                  ))
                )}
              </AreaChart>
            ) : (
            <LineChart
              data={data}
              margin={{ top: 40, right: 100, left: 80, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="variation"
                tick={{ fontSize: 10, fill: '#000' }}
                axisLine={{ stroke: '#000' }}
                tickLine={{ stroke: '#000' }}
                interval={0}
                padding={{ left: 10, right: 10 }}
                label={{ value: 'Perturbation Strength (%)', position: 'insideBottom', offset: -10, style: { fontSize: 11, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' } }}
              />
              <XAxis
                orientation="top"
                xAxisId="top_border"
                axisLine={{ stroke: '#000' }}
                tick={false}
                tickLine={false}
              />
              <YAxis
                reversed={isWeightView ? false : true}
                tick={{ fontSize: 10, fill: '#000' }}
                axisLine={{ stroke: '#000' }}
                tickLine={{ stroke: '#000' }}
                domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
                allowDecimals={isWeightView}
                ticks={!isWeightView ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined}
                label={{ value: isWeightView ? 'Criterion Weight' : 'Alternative Rank', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 11, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' } }}
              />
              <YAxis
                orientation="right"
                yAxisId="right_border"
                width={1}
                axisLine={{ stroke: '#000' }}
                tick={false}
                tickLine={false}
                domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
              />

              <Tooltip />
              <Legend
                verticalAlign="top"
                align="right"
                layout="vertical"
                wrapperStyle={{
                  fontSize: "8px",
                  color: '#000',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #333',
                  padding: '4px',
                  top: 73,
                  right: 230,
                  width: 'auto',
                  zIndex: 50,
                  boxShadow: '1px 1px 3px rgba(0,0,0,0.1)'
                }}
                iconSize={8}
              />
              {isWeightView ? (
                workingCriteria.map((crit, idx) => (
                  <Line
                    key={crit.id}
                    type="monotone"
                    dataKey={crit.name}
                    name={crit.name}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={crit.id === selectedCriterionToVary ? 3 : 1}
                    strokeDasharray={crit.id === selectedCriterionToVary ? '' : '5 5'}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))
              ) : (
                alternatives.map((alt, altIdx) => (
                  <Line
                    key={alt.name}
                    type="monotone"
                    dataKey={alt.name}
                    stroke={colors[altIdx % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                )))}
            </LineChart>
            )}
          </ResponsiveContainer>
        ) : kSensChartType === 'scatter' ? (
          <ResponsiveContainer width="100%" height={600}>
            <ScatterChart
              data={data}
              margin={{ top: 40, right: 100, left: 80, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Variation Index" 
                tick={{ fontSize: 10, fill: '#000' }} 
                axisLine={{ stroke: '#000' }}
                tickLine={{ stroke: '#000' }}
                domain={[0, kSensVariationRange.length - 1]}
                ticks={Array.from({ length: kSensVariationRange.length }, (_, i) => i)}
                tickFormatter={(val) => `${kSensVariationRange[val]}%`}
                interval={0}
                label={{ value: 'Perturbation Strength (%)', position: 'insideBottom', offset: -10, style: { fontSize: 11, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' } }}
              />
              <XAxis
                orientation="top"
                xAxisId="top_border"
                axisLine={{ stroke: '#000' }}
                tick={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={isWeightView ? "Weight" : "Rank"}
                reversed={!isWeightView}
                tick={{ fontSize: 10, fill: '#000' }}
                axisLine={{ stroke: '#000' }}
                tickLine={{ stroke: '#000' }}
                width={50}
                domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
                allowDecimals={isWeightView}
                ticks={!isWeightView ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined}
                label={{
                  value: isWeightView ? 'Criterion Weight' : 'Alternative Rank',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -5,
                  style: { fontSize: 11, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' }
                }}
              />
              <YAxis
                orientation="right"
                yAxisId="right_border"
                width={1}
                axisLine={{ stroke: '#000' }}
                tick={false}
                tickLine={false}
                domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend
                verticalAlign="top"
                align="right"
                layout="vertical"
                wrapperStyle={{
                  fontSize: "8px",
                  color: '#000',
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1.5px solid #000',
                  padding: '8px',
                  top: 73,
                  right: 165,
                  width: 'auto',
                  zIndex: 50,
                  boxShadow: '3px 3px 0px rgba(0,0,0,1)'
                }}
                iconSize={8}
              />
              {isWeightView ? (
                workingCriteria.map((crit, idx) => {
                  const scatterData = data.map((d: any, i: number) => ({ x: i, y: d[crit.name] }));
                  return <Scatter key={crit.name} name={crit.name} data={scatterData} fill={colors[idx % colors.length]} />;
                })
              ) : (
                alternatives.map((alt, altIdx) => {
                  const scatterData = data.map((d, idx) => ({ x: idx, y: d[alt.name] }));
                  return (<Scatter key={alt.name} name={alt.name} data={scatterData} fill={colors[altIdx % colors.length]} />);
                }))}
            </ScatterChart>
          </ResponsiveContainer>
        ) : kSensChartType === 'dual' ? (
          <ResponsiveContainer width="100%" height={600}>
            <ComposedChart
              {...commonProps}
              barGap={0}
              barCategoryGap="10%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="variation"
                tick={{ fontSize: 10, fill: '#374151' }}
                axisLine={{ stroke: '#000' }}
                tickLine={{ stroke: '#000' }}
                interval={0}
                padding={{ left: 10, right: 100 }}
                label={{ value: 'Perturbation Strength (%)', position: 'insideBottom', offset: -30, style: { fontSize: 11, fontStyle: 'italic', fill: '#000' } }}
              />
              <XAxis
                orientation="top"
                xAxisId="top_border"
                axisLine={{ stroke: '#000' }}
                tick={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: '#374151' }}
                axisLine={{ stroke: '#000' }}
                tickLine={{ stroke: '#000' }}
                /* Dynamic label for current ranking method */
                label={{ value: `${MCDM_METHODS.find(m => m.value === selectedRankingMethod)?.label || selectedRankingMethod.toUpperCase()} Score`, angle: -90, position: 'insideLeft', offset: -10, style: { fontSize: 11, fontStyle: 'italic', fill: '#000' } }}
                domain={[0, (max: number) => Math.ceil(max * 10) / 10]}
                tickFormatter={(val: number) => val.toFixed(1)}
                padding={{ top: 40 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: '#374151' }}
                axisLine={{ stroke: '#000' }}
                tickLine={{ stroke: '#000' }}
                label={{ value: 'Ranking (1 = Best)', angle: 90, position: 'insideRight', offset: 15, style: { fontSize: 11, fontStyle: 'italic', fill: '#000' } }}
                domain={[1, alternatives.length]}
                reversed
                padding={{ top: 40 }}
                interval={0}
                ticks={alternatives.length <= 20
                  ? Array.from({ length: alternatives.length }, (_, i) => i + 1)
                  : Array.from({ length: Math.floor(alternatives.length / 2) }, (_, i) => (i + 1) * 2)}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-gray-400 p-2 shadow-lg text-[10px] min-w-[150px]">
                        <p className="font-bold border-b mb-1 pb-1">{label} Variation</p>
                        {payload.map((entry: any, index: number) => {
                          const isRank = !entry.name.includes("Score");
                          return (
                            <p key={index} className="flex justify-between py-0.5">
                              <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
                              <span className="font-bold ml-4">
                                {isRank ? entry.value : Number(entry.value).toFixed(4)}
                              </span>
                            </p>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                layout="vertical"
                wrapperStyle={{
                  fontSize: "9px",
                  color: '#000',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #333',
                  padding: '8px',
                  top: 80,
                  right: 220,
                  width: 'auto',
                  zIndex: 50,
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
                }}
                iconSize={10}
              />

              {/* Matplotlib Colors Mapping for Alternatives */}
              {(() => {
                const mplColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
                return alternatives.map((alt, i) => {
                  return (
                    <Bar
                      key={`bar-${alt.name}`}
                      yAxisId="left"
                      dataKey={`${alt.name} Score`}
                      fill={mplColors[i % mplColors.length]}
                      name={`${alt.name} Score`}
                    />
                  );
                });
              })()}

              {/* Ranking Lines for Alternatives */}
              {(() => {
                const mplColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
                return alternatives.map((alt, i) => {
                  const isDashed = i % 2 !== 0;
                  const markerType = i % 2 === 0 ? "circle" : "square";
                  const seriesColor = mplColors[i % mplColors.length];

                  return (
                    <Line
                      key={`line-${alt.name}`}
                      yAxisId="right"
                      type="linear"
                      dataKey={alt.name}
                      stroke={seriesColor}
                      strokeWidth={3}
                      strokeDasharray={isDashed ? "5 5" : "0"}
                      name={`${alt.name} Rank`}
                      dot={(props: any) => {
                        const { cx, cy, index } = props;
                        if (markerType === "square") {
                          return <rect key={`dot-${alt.name}-${index}`} x={cx - 4.5} y={cy - 4.5} width={9} height={9} fill={seriesColor} />;
                        }
                        return <circle key={`dot-${alt.name}-${index}`} cx={cx} cy={cy} r={5} fill={seriesColor} />;
                      }}
                      legendType={isDashed ? "plainline" : "line"}
                    />
                  );
                });
              })()}
            </ComposedChart>
          </ResponsiveContainer>
        ) : kSensChartType === 'heatmap' ? (
          <div className="w-full h-full flex flex-col items-center">
            <h3 className="text-sm font-bold mb-4 opacity-70 italic whitespace-nowrap">Rank Sensitivity Heatmap</h3>
            <div className="flex w-full items-start px-4" style={{ height: '520px' }}>
              <div className="flex-grow h-full bg-white overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 60, left: 150 }}>
                    <XAxis
                      type="number"
                      dataKey="varIdx"
                      domain={[-0.5, data.length - 0.5]}
                      ticks={data.map((_, i) => i)}
                      tickFormatter={(i) => data[i]?.variation || ''}
                      axisLine={false}
                      tickLine={{ stroke: '#000' }}
                      interval={0}
                      tick={{ fontSize: 11, fill: '#000', fontWeight: 'bold' }}
                      label={{ value: 'Weight Variation (%)', position: 'insideBottom', offset: -10, style: { fontSize: 13, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' } }}
                    />
                    <YAxis
                      type="number"
                      dataKey="altIdx"
                      domain={[-0.5, alternatives.length - 0.5]}
                      ticks={alternatives.map((_, i) => i)}
                      tickFormatter={(i) => alternatives[alternatives.length - 1 - i]?.name || ''}
                      axisLine={false}
                      tickLine={{ stroke: '#000' }}
                      tick={{ fontSize: 11, fill: '#000', fontWeight: 'bold' }}
                      label={{ value: 'Alternatives', angle: -90, position: 'insideLeft', offset: -20, style: { fontSize: 13, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' } }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: '#333' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-white border-2 border-black p-2 shadow-xl text-[11px]">
                              <p className="font-bold border-b border-black mb-1 pb-1 text-blue-700">{item.altName}</p>
                              <p><span className="font-medium text-gray-600 font-bold">Variation:</span> <span className="font-bold text-black">{item.variation}</span></p>
                              <p><span className="font-medium text-gray-600 font-bold">Resulting Rank:</span> <span className="font-bold text-lg text-red-600">{item.rank}</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      data={(() => {
                        const pts: any[] = [];
                        data.forEach((d, vIdx) => {
                          alternatives.forEach((alt, aIdx) => {
                            pts.push({
                              varIdx: vIdx,
                              altIdx: alternatives.length - 1 - aIdx,
                              rank: d[alt.name],
                              variation: d.variation,
                              altName: alt.name
                            });
                          });
                        });
                        return pts;
                      })()}
                      shape={(props: any) => {
                        const { cx, cy } = props;
                        const payload = props.payload;
                        const numAlt = alternatives.length || 1;

                        // Advanced Color Interpolation for infinite uniqueness
                        const getScientificColor = (p: number) => {
                          const stops = [
                            { r: 68, g: 1, b: 84 },   // #440154 (Best)
                            { r: 59, g: 82, b: 139 }, // #3b528b
                            { r: 33, g: 145, b: 140 }, // #21918c
                            { r: 94, g: 201, b: 98 },  // #5ec962
                            { r: 253, g: 231, b: 37 }  // #fde725 (Worst)
                          ];
                          const i = Math.min(stops.length - 2, Math.floor(p * (stops.length - 1)));
                          const segmentP = (p * (stops.length - 1)) - i;
                          const r = Math.round(stops[i].r + (stops[i + 1].r - stops[i].r) * segmentP);
                          const g = Math.round(stops[i].g + (stops[i + 1].g - stops[i].g) * segmentP);
                          const b = Math.round(stops[i].b + (stops[i + 1].b - stops[i].b) * segmentP);
                          return `rgb(${r},${g},${b})`;
                        };

                        const w = (720 / data.length);
                        const h = (480 / numAlt);
                        const p = (payload.rank - 1) / (Math.max(1, numAlt - 1));
                        const fill = getScientificColor(p);
                        const isDark = payload.rank <= numAlt / 2;

                        return (
                          <g>
                            <rect
                              x={cx - w / 2}
                              y={cy - h / 2}
                              width={w - 1}
                              height={h - 1}
                              fill={fill}
                              stroke="#ffffff"
                              strokeWidth={0.3}
                              rx={1}
                            />
                            <text
                              x={cx}
                              y={cy}
                              dy=".35em"
                              textAnchor="middle"
                              fill={isDark ? "#ffffff" : "#000000"}
                              className="text-[10px] font-black pointer-events-none"
                            >
                              {payload.rank}
                            </text>
                          </g>
                        );
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              {/* Discrete Scientific Color Bar - Dynamic Alignment */}
              <div className="w-40 pl-8 h-full flex flex-col items-start justify-start pt-[12px]">
                {(() => {
                  const numAlt = alternatives.length || 1;
                  const step = 100 / numAlt;

                  const getScientificColor = (p: number) => {
                    const stops = [
                      { r: 68, g: 1, b: 84 },
                      { r: 59, g: 82, b: 139 },
                      { r: 33, g: 145, b: 140 },
                      { r: 94, g: 201, b: 98 },
                      { r: 253, g: 231, b: 37 }
                    ];
                    const i = Math.min(stops.length - 2, Math.floor(p * (stops.length - 1)));
                    const segmentP = (p * (stops.length - 1)) - i;
                    const r = Math.round(stops[i].r + (stops[i + 1].r - stops[i].r) * segmentP);
                    const g = Math.round(stops[i].g + (stops[i + 1].g - stops[i].g) * segmentP);
                    const b = Math.round(stops[i].b + (stops[i + 1].b - stops[i].b) * segmentP);
                    return `rgb(${r},${g},${b})`;
                  };

                  // Construct dynamic gradient string based on number of alternatives
                  const gradientStops = Array.from({ length: numAlt }).map((_, i) => {
                    const color = getScientificColor(i / (Math.max(1, numAlt - 1)));
                    return `${color} ${i * step}% ${(i + 1) * step}%`;
                  }).join(', ');

                  return (
                    <div
                      className="relative w-8 h-[420px] border border-black shadow-sm"
                      style={{ background: `linear-gradient(to top, ${gradientStops})` }}
                    >
                      {/* Rank Intensity Title */}
                      <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex items-center h-full">
                        <div className="text-[10px] font-black text-black whitespace-nowrap -rotate-90 tracking-[0.2em] uppercase opacity-80">
                          Rank Intensity
                        </div>
                      </div>

                      {/* Map all rank numbers along the bar - Perfectly Centered in each block */}
                      {Array.from({ length: numAlt }, (_, i) => i + 1).map((rank) => {
                        const bottomPercent = ((rank - 0.5) / numAlt) * 100;
                        return (
                          <div
                            key={rank}
                            className="absolute -right-10 text-[11px] font-black text-black flex items-center"
                            style={{ bottom: `${bottomPercent}%`, transform: 'translateY(50%)' }}
                          >
                            <span className="w-3 h-[1.5px] bg-black mr-2"></span>
                            {rank}
                          </div>
                        );
                      })}
                      <div className="absolute left-1/2 -top-6 -translate-x-1/2 text-[9px] text-black font-black uppercase tracking-widest whitespace-nowrap">Worst</div>
                      <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 text-[9px] text-black font-black uppercase tracking-widest whitespace-nowrap">Best</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={600}>
            {kSensChartType === 'stackedBar' || kSensChartType === 'bar' || kSensChartType === 'column' ? (
              <BarChart
                data={data}
                margin={{ top: 40, right: 80, left: 80, bottom: 80 }}
                barGap={0}
                barCategoryGap="10%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="variation"
                  tick={{ fontSize: 10, fill: '#000' }}
                  axisLine={{ stroke: '#000' }}
                  tickLine={{ stroke: '#000' }}
                  interval={0}
                  padding={{ left: 10, right: 85 }}
                  label={{ value: 'Perturbation Strength (%)', position: 'insideBottom', offset: -5, style: { fontSize: 11, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' } }}
                />
                <XAxis orientation="top" xAxisId="top_border" axisLine={{ stroke: '#000' }} tick={false} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: '#000' }}
                  axisLine={{ stroke: '#000' }}
                  tickLine={{ stroke: '#000' }}
                  label={{ value: isWeightView ? 'Criterion Weight' : `${MCDM_METHODS.find(m => m.value === selectedRankingMethod)?.label || selectedRankingMethod.toUpperCase()} Score`, angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 11, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' } }}
                  domain={isWeightView ? (kSensChartType === 'stackedBar' ? [0, 1] : [0, 'auto']) : [0, (max: number) => Math.ceil(max * 10) / 10]}
                  tickFormatter={(val: number) => val.toFixed(1)}
                />
                {!isWeightView && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#000' }}
                    axisLine={{ stroke: '#000' }}
                    tickLine={{ stroke: '#000' }}
                    label={{ value: 'Ranking (1 = Best)', angle: 90, position: 'insideRight', offset: 15, style: { fontSize: 11, fontStyle: 'italic', fill: '#000', fontWeight: 'bold' } }}
                    domain={[1, alternatives.length]}
                    reversed
                    interval={0}
                    ticks={alternatives.length <= 20
                      ? Array.from({ length: alternatives.length }, (_, i) => i + 1)
                      : Array.from({ length: Math.floor(alternatives.length / 2) }, (_, i) => (i + 1) * 2)}
                  />
                )}
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  layout="vertical"
                  wrapperStyle={{
                    fontSize: "8px",
                    color: '#000',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #333',
                    padding: '4px',
                    top: 73,
                    right: 230,
                    width: 'auto',
                    zIndex: 50,
                    boxShadow: '1px 1px 3px rgba(0,0,0,0.1)'
                  }}
                  iconSize={8}
                />
                {isWeightView ? (
                  workingCriteria.map((crit, idx) => (
                    <Bar key={crit.name} yAxisId="left" dataKey={crit.name} fill={colors[idx % colors.length]} name={`${crit.name} Weight`} stackId={kSensChartType === 'stackedBar' ? "a" : undefined} />
                  ))
                ) : (
                  alternatives.map((alt, altIdx) => (
                    <Bar
                      key={alt.name}
                      yAxisId="left"
                      dataKey={`${alt.name} Score`}
                      fill={colors[altIdx % colors.length]}
                      name={`${alt.name} Score`}
                      stackId={kSensChartType === 'stackedBar' ? "a" : undefined}
                    />
                  ))
                )}
              </BarChart>
            ) : null}
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  