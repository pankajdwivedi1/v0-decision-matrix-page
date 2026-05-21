import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ScatterChart, Scatter, Customized
} from 'recharts';

interface AdvancedRankChartProps {
  kSensResults: any;
  alternatives: any[];
  variationRange: number[];
  criterionName: string;
  colorsArr: string[];
  theme: any;
  chartSettings: any;
  isMobile: boolean;
  standaloneLegend?: React.ReactNode;
  chartAspectRatio?: number;
  labelStyle?: (value: string, isVertical?: boolean) => any;
}

const TopAndRightBorder = (props: any) => {
  const { offset, themeColor } = props;
  if (!offset || offset.width == null) return null;
  const { left, top, width, height } = offset;
  const right = left + width;
  const bottom = top + height;
  return (
    <g>
      <line x1={left} y1={top} x2={right} y2={top} stroke={themeColor || '#000'} strokeWidth={1.5} strokeLinecap="square" pointerEvents="none" />
      <line x1={right} y1={top} x2={right} y2={bottom} stroke={themeColor || '#000'} strokeWidth={1.5} strokeLinecap="square" pointerEvents="none" />
    </g>
  );
};

const RightFrameBorder = (props: any) => {
  const { offset, themeColor } = props;
  if (!offset || offset.width == null) return null;
  const { left, top, width, height } = offset;
  const right = left + width;
  const bottom = top + height;
  return <line x1={right} y1={top} x2={right} y2={bottom} stroke={themeColor || '#000'} strokeWidth={1.5} strokeLinecap="square" pointerEvents="none" />;
};

const getPatternId = (index: number) => `adv-pattern-${index}`;
const getPatternFill = (index: number) => `url(#${getPatternId(index)})`;

const renderPatternDefs = (colorsArr: string[], chartSettings: any) => {
  if (!chartSettings?.fillPattern || chartSettings.fillPattern === 'none') return null;

  return (
    <defs>
      {colorsArr.map((color: string, i: number) => {
        const patternId = getPatternId(i);
        const patternProps = {
          id: patternId,
          width: 10,
          height: 10,
          patternUnits: "userSpaceOnUse" as const,
        };
        const rectFill = <rect width="10" height="10" fill={color} fillOpacity={chartSettings.barOpacity || 1} />;
        
        let currentPattern = chartSettings.fillPattern;
        if (currentPattern === 'mixed') {
          const mixedPatterns = ['striped', 'crosshatch', 'grid', 'dots-dense', 'weave', 'horizontal'];
          currentPattern = mixedPatterns[i % mixedPatterns.length];
        }

        switch (currentPattern) {
          case 'striped':
            return (
              <pattern key={patternId} {...patternProps} width="8" height="8" patternTransform="rotate(45)">
                {rectFill}
                <line x1="0" y1="0" x2="0" y2="8" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
              </pattern>
            );
          case 'dotted':
            return (
              <pattern key={patternId} {...patternProps}>
                {rectFill}
                <circle cx="5" cy="5" r="2" fill="white" fillOpacity="0.4" />
              </pattern>
            );
          case 'grid':
            return (
              <pattern key={patternId} {...patternProps}>
                {rectFill}
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
              </pattern>
            );
          case 'weave':
            return (
              <pattern key={patternId} {...patternProps} width="4" height="4">
                {rectFill}
                <path d="M 0 2 L 4 2 M 2 0 L 2 4" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" />
                <path d="M 0 0 L 4 4 M 4 0 L 0 4" stroke="black" strokeWidth="0.5" strokeOpacity="0.3" />
              </pattern>
            );
          case 'hatch-right':
            return (
              <pattern key={patternId} {...patternProps} width="6" height="6" patternTransform="rotate(-45)">
                {rectFill}
                <line x1="0" y1="0" x2="0" y2="6" stroke="black" strokeWidth="1" strokeOpacity="0.5" />
              </pattern>
            );
          case 'crosshatch':
            return (
              <pattern key={patternId} {...patternProps} width="4" height="4">
                {rectFill}
                <path d="M 0 0 L 4 4 M 4 0 L 0 4" stroke="black" strokeWidth="0.6" strokeOpacity="0.5" />
              </pattern>
            );
          case 'dots-dense':
            return (
              <pattern key={patternId} {...patternProps} width="2.5" height="2.5">
                {rectFill}
                <circle cx="1.25" cy="1.25" r="0.6" fill="black" fillOpacity="0.4" />
              </pattern>
            );
          case 'horizontal':
            return (
              <pattern key={patternId} {...patternProps} width="6" height="6">
                {rectFill}
                <path d="M 0 3 L 6 3" stroke="black" strokeWidth="1" strokeOpacity="0.5" />
              </pattern>
            );
          case 'checkerboard':
            return (
              <pattern key={patternId} {...patternProps} width="10" height="10">
                {rectFill}
                <rect x="0" y="0" width="5" height="5" fill="black" fillOpacity="0.2" />
                <rect x="5" y="5" width="5" height="5" fill="black" fillOpacity="0.2" />
              </pattern>
            );
          case 'carbon':
            return (
              <pattern key={patternId} {...patternProps} width="12" height="12">
                {rectFill}
                <path d="M 0 0 L 6 6 M 6 12 L 12 6" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                <path d="M 6 0 L 12 6 M 0 6 L 6 12" stroke="black" strokeWidth="2" strokeOpacity="0.3" />
              </pattern>
            );
          default:
            return null;
        }
      })}
    </defs>
  );
};

const HeatmapCell = (props: any) => {
  const { cx, cy, payload, xAxis, yAxis, maxRank, colorsArr, alternatives, chartSettings, theme } = props;
  const width = xAxis?.scale?.bandwidth ? xAxis.scale.bandwidth() : 60;
  const height = yAxis?.scale?.bandwidth ? yAxis.scale.bandwidth() : 35;
  
  const rank = payload.rank;
  
  // Tie the color explicitly to the Rank value so it stays consistent across all rows!
  const rankIdx = (rank - 1) % colorsArr.length;
  const rankColor = colorsArr[rankIdx];
  const fill = (!chartSettings?.fillPattern || chartSettings.fillPattern === 'none') ? rankColor : getPatternFill(rankIdx);
  
  const userOpacity = chartSettings?.barOpacity || 1.0;
  
  // If the user sets the global theme opacity very low, make sure the text stays readable
  const isLowOpacity = userOpacity < 0.45;
  const textColor = isLowOpacity ? (theme?.text || '#000000') : '#ffffff';
  const textShadow = isLowOpacity ? 'none' : '0px 1px 3px rgba(0,0,0,0.8)';
  
  return (
    <g>
      <rect 
        x={cx - width / 2} 
        y={cy - height / 2} 
        width={width} 
        height={height} 
        fill={fill} 
        fillOpacity={userOpacity}
        stroke="#ffffff" 
        strokeWidth={1.5}
        rx={4}
        ry={4}
      />
      <text 
        x={cx} y={cy} 
        textAnchor="middle" dominantBaseline="central" 
        fill={textColor} fontSize={chartSettings?.fontSize || 12} fontWeight="bold"
        style={{ textShadow: textShadow }}
      >
        {rank}
      </text>
    </g>
  );
};

export const RankHeatmap: React.FC<AdvancedRankChartProps> = ({
  kSensResults, alternatives, variationRange, criterionName, colorsArr, theme, chartSettings, isMobile, standaloneLegend, chartAspectRatio, labelStyle
}) => {
  const maxRank = alternatives.length;
  const data: any[] = [];
  
  variationRange.forEach((v, vIdx) => {
    alternatives.forEach((alt) => {
      const rank = kSensResults?.[criterionName]?.[vIdx]?.rankings?.[alt.name]?.rank || maxRank;
      data.push({
        scenario: `${v}%`,
        altName: alt.name,
        rank: rank,
      });
    });
  });

  return (
    <div className={`max-w-7xl mx-auto relative transition-all duration-500`} style={{ backgroundColor: theme.bg, color: theme.text }}>
      {standaloneLegend}
      <ResponsiveContainer width="100%" height={chartAspectRatio ? undefined : (isMobile ? 480 : 600)} aspect={chartAspectRatio}>
        <ScatterChart margin={{ top: chartSettings.marginTop, right: chartSettings.marginRight, left: chartSettings.marginLeft, bottom: chartSettings.marginBottom }}>
          {renderPatternDefs(colorsArr, chartSettings)}
          {chartSettings.showGridLines && <CartesianGrid strokeDasharray="3 3" stroke={theme.border} opacity={chartSettings.gridOpacity} horizontal={false} vertical={false} />}
          
          <XAxis 
            type="category" dataKey="scenario" name="Perturbation" allowDuplicatedCategory={false}
            tick={{ fontSize: isMobile ? Math.max(7, chartSettings.fontSize - 2) : chartSettings.fontSize, fill: theme.text, fontWeight: 'bold' }} 
            axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            tickLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            padding={{ left: 10, right: 10 }}
            label={chartSettings.showAxisTitles && labelStyle ? (labelStyle('Perturbation Strength (%)') as any) : undefined}
          />
          <YAxis 
            type="category" dataKey="altName" name="Alternative" allowDuplicatedCategory={false}
            tick={{ fontSize: isMobile ? Math.max(7, chartSettings.fontSize - 2) : chartSettings.fontSize, fill: theme.text, fontWeight: 'bold' }} 
            axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            tickLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            label={chartSettings.showAxisTitles && labelStyle ? (labelStyle('Alternative', true) as any) : undefined}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3', stroke: theme.chartBorder, strokeWidth: 1 }}
            contentStyle={{ fontSize: `${chartSettings.fontSize}px`, backgroundColor: theme.tooltipBg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '4px', boxShadow: 'none' }}
            formatter={(value: any, name: string) => {
              if (name === 'rank') return [value, 'Rank'];
              return [value, name];
            }}
          />
          <Customized component={(props: any) => <TopAndRightBorder {...props} themeColor={theme.chartBorder} />} />
          
          <Scatter data={data} shape={<HeatmapCell maxRank={maxRank} colorsArr={colorsArr} alternatives={alternatives} chartSettings={chartSettings} theme={theme} />} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

const BubbleCell = (props: any) => {
  const { cx, cy, payload, xAxis, yAxis, maxRank, colorsArr, alternatives, chartSettings } = props;
  const maxWidth = xAxis?.scale?.bandwidth ? xAxis.scale.bandwidth() : 40;
  const maxHeight = yAxis?.scale?.bandwidth ? yAxis.scale.bandwidth() : 25;
  const maxRadius = Math.min(maxWidth, maxHeight) / 2 - 2;
  
  const rank = payload.rank;
  const minRadius = 4;
  const radius = maxRadius - ((rank - 1) / (maxRank - 1)) * (maxRadius - minRadius);
  
  const altIdx = alternatives.findIndex((a: any) => a.name === payload.altName);
  const colorIdx = altIdx !== -1 ? (altIdx % colorsArr.length) : 0;
  const baseColor = altIdx !== -1 ? colorsArr[colorIdx] : '#888';
  
  const fill = (!chartSettings?.fillPattern || chartSettings.fillPattern === 'none') ? baseColor : getPatternFill(colorIdx);
  
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={Math.max(2, radius)} 
      fill={fill} 
      opacity={0.7}
      stroke={baseColor} 
      strokeWidth={2}
    />
  );
};

export const RankBubbleChart: React.FC<AdvancedRankChartProps> = ({
  kSensResults, alternatives, variationRange, criterionName, colorsArr, theme, chartSettings, isMobile, standaloneLegend, chartAspectRatio, labelStyle
}) => {
  const maxRank = alternatives.length;
  const data: any[] = [];
  
  variationRange.forEach((v, vIdx) => {
    alternatives.forEach((alt) => {
      const rank = kSensResults?.[criterionName]?.[vIdx]?.rankings?.[alt.name]?.rank || maxRank;
      data.push({
        scenario: `${v}%`,
        altName: alt.name,
        rank: rank,
      });
    });
  });

  return (
    <div className={`max-w-7xl mx-auto relative transition-all duration-500`} style={{ backgroundColor: theme.bg, color: theme.text }}>
      {standaloneLegend}
      <ResponsiveContainer width="100%" height={chartAspectRatio ? undefined : (isMobile ? 480 : 600)} aspect={chartAspectRatio}>
        <ScatterChart margin={{ top: chartSettings.marginTop, right: chartSettings.marginRight, left: chartSettings.marginLeft, bottom: chartSettings.marginBottom }}>
          {renderPatternDefs(colorsArr, chartSettings)}
          {chartSettings.showGridLines && <CartesianGrid strokeDasharray="3 3" stroke={theme.border} opacity={chartSettings.gridOpacity} horizontal={true} vertical={true} />}
          
          <XAxis 
            type="category" dataKey="scenario" name="Perturbation" allowDuplicatedCategory={false}
            tick={{ fontSize: isMobile ? Math.max(7, chartSettings.fontSize - 2) : chartSettings.fontSize, fill: theme.text, fontWeight: 'bold' }} 
            axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            tickLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            padding={{ left: 10, right: 10 }}
            label={chartSettings.showAxisTitles && labelStyle ? (labelStyle('Perturbation Strength (%)') as any) : undefined}
          />
          <YAxis 
            type="category" dataKey="altName" name="Alternative" allowDuplicatedCategory={false}
            tick={{ fontSize: isMobile ? Math.max(7, chartSettings.fontSize - 2) : chartSettings.fontSize, fill: theme.text, fontWeight: 'bold' }} 
            axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            tickLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            label={chartSettings.showAxisTitles && labelStyle ? (labelStyle('Alternative', true) as any) : undefined}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3', stroke: theme.chartBorder, strokeWidth: 1 }}
            contentStyle={{ fontSize: `${chartSettings.fontSize}px`, backgroundColor: theme.tooltipBg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '4px', boxShadow: 'none' }}
            formatter={(value: any, name: string) => {
              if (name === 'rank') return [value, 'Rank'];
              return [value, name];
            }}
          />
          <Customized component={(props: any) => <TopAndRightBorder {...props} themeColor={theme.chartBorder} />} />
          
          <Scatter data={data} shape={<BubbleCell maxRank={maxRank} colorsArr={colorsArr} alternatives={alternatives} chartSettings={chartSettings} />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GroupedRankBarChart: React.FC<AdvancedRankChartProps> = ({
  kSensResults, alternatives, variationRange, criterionName, colorsArr, theme, chartSettings, isMobile, standaloneLegend, chartAspectRatio, labelStyle
}) => {
  const maxRank = alternatives.length;
  
  const data = variationRange.map((v, vIdx) => {
    const row: any = { scenario: `${v}%` };
    alternatives.forEach((alt) => {
      const rank = kSensResults?.[criterionName]?.[vIdx]?.rankings?.[alt.name]?.rank || maxRank;
      row[alt.name] = maxRank - rank + 1; // Invert so higher bar = better rank
    });
    return row;
  });

  return (
    <div className={`max-w-7xl mx-auto relative transition-all duration-500`} style={{ backgroundColor: theme.bg, color: theme.text }}>
      {standaloneLegend}
      <ResponsiveContainer width="100%" height={chartAspectRatio ? undefined : (isMobile ? 480 : 600)} aspect={chartAspectRatio}>
        <BarChart data={data} margin={{ top: chartSettings.marginTop, right: chartSettings.marginRight, left: chartSettings.marginLeft, bottom: chartSettings.marginBottom }}>
          {chartSettings.showGridLines && <CartesianGrid strokeDasharray="3 3" stroke={theme.border} opacity={chartSettings.gridOpacity} horizontal={true} vertical={false} />}
          
          <XAxis 
            dataKey="scenario" 
            tick={{ fontSize: isMobile ? Math.max(7, chartSettings.fontSize - 2) : chartSettings.fontSize, fill: theme.text, fontWeight: 'bold' }} 
            axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            tickLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            label={chartSettings.showAxisTitles && labelStyle ? (labelStyle('Perturbation Strength (%)') as any) : undefined}
          />
          <XAxis orientation="top" xAxisId="top_border" axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tick={false} tickLine={false} />
          
          <YAxis 
            domain={[0, maxRank]} 
            ticks={Array.from({ length: maxRank }, (_, i) => i + 1)}
            tick={{ fontSize: isMobile ? Math.max(7, chartSettings.fontSize - 2) : chartSettings.fontSize, fill: theme.text, fontWeight: 'bold' }} 
            axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            tickLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
            tickFormatter={(val) => (maxRank - val + 1).toString()}
            label={chartSettings.showAxisTitles && labelStyle ? (labelStyle('Alternative Rank', true) as any) : undefined}
          />
          <YAxis orientation="right" yAxisId="right_border" axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tick={false} tickLine={false} domain={[0, maxRank]} />
          
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{ fontSize: `${chartSettings.fontSize}px`, backgroundColor: theme.tooltipBg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: '4px', boxShadow: 'none' }}
            formatter={(value: any, name: string) => {
              const actualRank = maxRank - value + 1;
              return [actualRank, name];
            }}
          />
          
          <Customized component={(props: any) => <RightFrameBorder {...props} themeColor={theme.chartBorder} />} />
          
          {renderPatternDefs(colorsArr, chartSettings)}
          {alternatives.map((alt, idx) => {
            const colorIdx = idx % colorsArr.length;
            const fill = (!chartSettings?.fillPattern || chartSettings.fillPattern === 'none') ? colorsArr[colorIdx] : getPatternFill(colorIdx);
            return (
              <Bar 
                key={alt.name} 
                dataKey={alt.name} 
                fill={fill} 
                fillOpacity={chartSettings.barOpacity || 0.8}
                radius={[2, 2, 0, 0]}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
