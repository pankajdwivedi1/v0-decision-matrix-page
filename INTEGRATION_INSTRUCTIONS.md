I've reviewed your request to integrate a K% Sensitivity Analysis Calculator into your application. Due to the file's length and complexity (14,435 lines), I recommend creating this as a separate component rather than directly embedding it inline with useState hooks (which would cause issues with React's rules of hooks).

## Here's the integration approach:

### Option 1: Create a Separate Component (Recommended)

Create a new file `components/KSensitivityCalculator.tsx`:

```tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Criterion {
  id: string;
  name: string;
  weight: number;
  type: "beneficial" | "non-beneficial";
}

interface Alternative {
  id: string;
  name: string;
  scores: Record\u003cstring, number | ""\u003e;
}

interface KSensitivityCalculatorProps {
  criteria: Criterion[];
  alternatives: Alternative[];
}

export default function KSensitivityCalculator({ criteria, alternatives }: KSensitivityCalculatorProps) {
  const [kSensVariationRange, setKSensVariationRange] = useState\u003cnumber[]\u003e([-30, -20, -10, 0, 10, 20, 30]);
  const [kSensChartType, setKSensChartType] = useState\u003cstring\u003e('line');
  const [kSensResults, setKSensResults] = useState\u003cany\u003e(null);
  const [kSensActiveTab, setKSensActiveTab] = useState\u003c'input' | 'results' | 'tables'\u003e('input');

  const kSensChartTypes = [
    { value: 'line', label: 'Line Chart', icon: '📈' },
    { value: 'bar', label: 'Bar Chart', icon: '📊' },
    { value: 'column', label: 'Column Chart', icon: '📊' },
    { value: 'scatter', label: 'Scatter Plot', icon: '⚫' },
    { value: 'area', label: 'Area Chart', icon: '📈' },
    { value: 'radar', label: 'Radar Chart', icon: '🎯' },
    { value: 'heatmap', label: 'Heatmap', icon: '🟨' },
  ];

  const calculateKSensScore = (altValues: number[], weights: number[], criteriaTypes: string[]) =\u003e {
    return altValues.reduce((sum, val, idx) =\u003e {
      const normalizedVal = criteriaTypes[idx] === 'non-beneficial' ? (1 - val) : val;
      return sum + (normalizedVal * weights[idx]);
    }, 0);
  };

  const performKSensitivityAnalysis = () =\u003e {
    const analysisResults: any = {};
    
    criteria.forEach((criterion, critIdx) =\u003e {
      const variationData = kSensVariationRange.map(variation =\u003e {
        const adjustedWeights = [...criteria.map(c =\u003e c.weight)];
        const variationFactor = 1 + (variation / 100);
        adjustedWeights[critIdx] = criteria[critIdx].weight * variationFactor;
        
        const weightSum = adjustedWeights.reduce((a, b) =\u003e a + b, 0);
        const normalizedWeights = adjustedWeights.map(w =\u003e w / weightSum);
        
        const scores = alternatives.map((alt) =\u003e {
          const altValues = criteria.map(c =\u003e {
            const score = alt.scores[c.id];
            return typeof score === 'number' ? score : 0;
          });
          return {
            name: alt.name,
            score: calculateKSensScore(altValues, normalizedWeights, criteria.map(c =\u003e c.type)),
            originalIndex: alternatives.indexOf(alt)
          };
        });
        
        scores.sort((a, b) =\u003e b.score - a.score);
        
        const rankings: any = {};
        scores.forEach((item, rank) =\u003e {
          rankings[item.name] = {
            rank: rank + 1,
            score: item.score
          };
        });
        
        return {
          variation,
          rankings,
          scores: scores.map(s =\u003e ({ name: s.name, score: s.score }))
        };
      });
      
      analysisResults[criterion.name] = variationData;
    });
    
    setKSensResults(analysisResults);
    setKSensActiveTab('results');
  };

  const generateKSensChartData = (criterionName: string) =\u003e {
    if (!kSensResults || !kSensResults[criterionName]) return [];
    
    const chartData = kSensVariationRange.map(variation =\u003e {
      const dataPoint: any = { variation: `${variation}%` };
      const varData = kSensResults[criterionName].find((v: any) =\u003e v.variation === variation);
      
      alternatives.forEach(alt =\u003e {
        if (varData && varData.rankings[alt.name]) {
          dataPoint[alt.name] = varData.rankings[alt.name].score;
        }
      });
      
      return dataPoint;
    });
    
    return chartData;
  };

  const generateKSensHeatmapData = (criterionName: string) =\u003e {
    if (!kSensResults || !kSensResults[criterionName]) return [];
    
    return kSensResults[criterionName].map((varData: any) =\u003e ({
      variation: `${varData.variation}%`,
      ...Object.fromEntries(
        alternatives.map(alt =\u003e [alt.name, varData.rankings[alt.name]?.score || 0])
      )
    }));
  };

  const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#ca8a04', '#db2777'];

  const renderKSensChart = (criterionName: string) =\u003e {
    const data = generateKSensChartData(criterionName);
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    if (kSensChartType === 'heatmap') {
      const heatmapData = generateKSensHeatmapData(criterionName);
      return (
        \u003cdiv className=\"overflow-x-auto\"\u003e
          \u003ctable className=\"w-full border-collapse\"\u003e
            \u003cthead\u003e
              \u003ctr\u003e
                \u003cth className=\"border border-gray-300 px-3 py-2 bg-gray-100 text-xs\"\u003eVariation\u003c/th\u003e
                {alternatives.map(alt =\u003e (
                  \u003cth key={alt.name} className=\"border border-gray-300 px-3 py-2 bg-gray-100 text-xs\"\u003e
                    {alt.name}
                  \u003c/th\u003e
                ))}
              \u003c/tr\u003e
            \u003c/thead\u003e
            \u003ctbody\u003e
              {heatmapData.map((row: any, rIdx: number) =\u003e (
                \u003ctr key={rIdx}\u003e
                  \u003ctd className=\"border border-gray-300 px-3 py-2 font-semibold text-xs\"\u003e
                    {row.variation}
                  \u003c/td\u003e
                  {alternatives.map((alt) =\u003e {
                    const value = row[alt.name];
                    const allValues = Object.values(row).filter(v =\u003e typeof v === 'number') as number[];
                    const maxValue = Math.max(...allValues);
                    const intensity = Math.floor((value / maxValue) * 255);
                    return (
                      \u003ctd
                        key={alt.name}
                        className=\"border border-gray-300 px-3 py-2 text-center text-xs\"
                        style={{
                          backgroundColor: `rgb(${255 - intensity}, ${255 - intensity/2}, ${255})`,
                          color: intensity \u003e 150 ? 'white' : 'black'
                        }}
                      \u003e
                        {value.toFixed(4)}
                      \u003c/td\u003e
                    );
                  })}
                \u003c/tr\u003e
              ))}
            \u003c/tbody\u003e
          \u003c/table\u003e
        \u003c/div\u003e
      );
    }

    if (kSensChartType === 'radar') {
      const radarData = alternatives.map(alt =\u003e ({
        alternative: alt.name,
        ...Object.fromEntries(
          kSensVariationRange.map((v, vIdx) =\u003e [
            `${v}%`,
            kSensResults[criterionName][vIdx].rankings[alt.name]?.score || 0
          ])
        )
      }));
      
      return (
        \u003cResponsiveContainer width=\"100%\" height={400}\u003e
          \u003cRadarChart data={radarData} margin={commonProps.margin}\u003e
            \u003cPolarGrid /\u003e
            \u003cPolarAngleAxis dataKey=\"alternative\" tick={{ fontSize: 10 }} /\u003e
            \u003cPolarRadiusAxis tick={{ fontSize: 10 }} /\u003e
            \u003cTooltip /\u003e
            \u003cLegend wrapperStyle={{ fontSize: '10px' }} /\u003e
            {kSensVariationRange.map((v, vIdx) =\u003e (
              \u003cRadar
                key={v}
                name={`${v}%`}
                dataKey={`${v}%`}
                stroke={colors[vIdx % colors.length]}
                fill={colors[vIdx % colors.length]}
                fillOpacity={0.3}
              /\u003e
            ))}
          \u003c/RadarChart\u003e
        \u003c/ResponsiveContainer\u003e
      );
    }

    return (
      \u003cResponsiveContainer width=\"100%\" height={400}\u003e
        {['line', 'area'].includes(kSensChartType) ? (
          \u003cLineChart {...commonProps}\u003e
            \u003cCartesianGrid strokeDasharray=\"3 3\" /\u003e
            \u003cXAxis dataKey=\"variation\" angle={-45} textAnchor=\"end\" height={80} tick={{ fontSize: 10 }} /\u003e
            \u003cYAxis label={{ value: 'Aggregated weights', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 10 }} /\u003e
            \u003cTooltip /\u003e
            \u003cLegend wrapperStyle={{ fontSize: '10px' }} /\u003e
            {alternatives.map((alt, altIdx) =\u003e (
              \u003cLine
                key={alt.name}
                type=\"monotone\"
                dataKey={alt.name}
                stroke={colors[altIdx % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                fill={kSensChartType === 'area' ? colors[altIdx % colors.length] : undefined}
                fillOpacity={kSensChartType === 'area' ? 0.3 : undefined}
              /\u003e
            ))}
          \u003c/LineChart\u003e
        ) : kSensChartType === 'scatter' ? (
          \u003cScatterChart {...commonProps}\u003e
            \u003cCartesianGrid strokeDasharray=\"3 3\" /\u003e
            \u003cXAxis type=\"number\" dataKey=\"x\" name=\"Variation Index\" tick={{ fontSize: 10 }} /\u003e
            \u003cYAxis type=\"number\" dataKey=\"y\" name=\"Score\" tick={{ fontSize: 10 }} /\u003e
            \u003cTooltip cursor={{ strokeDasharray: '3 3' }} /\u003e
            \u003cLegend wrapperStyle={{ fontSize: '10px' }} /\u003e
            {alternatives.map((alt, altIdx) =\u003e {
              const scatterData = data.map((d, idx) =\u003e ({
                x: idx,
                y: d[alt.name]
              }));
              return (
                \u003cScatter
                  key={alt.name}
                  name={alt.name}
                  data={scatterData}
                  fill={colors[altIdx % colors.length]}
                /\u003e
              );
            })}
          \u003c/ScatterChart\u003e
        ) : (
          \u003cBarChart {...commonProps} layout={kSensChartType === 'bar' ? 'vertical' : undefined}\u003e
            \u003cCartesianGrid strokeDasharray=\"3 3\" /\u003e
            {kSensChartType === 'bar' ? (
              \u003c\u003e
                \u003cXAxis type=\"number\" tick={{ fontSize: 10 }} /\u003e
                \u003cYAxis dataKey=\"variation\" type=\"category\" tick={{ fontSize: 10 }} /\u003e
              \u003c/\u003e
            ) : (
              \u003c\u003e
                \u003cXAxis dataKey=\"variation\" angle={-45} textAnchor=\"end\" height={80} tick={{ fontSize: 10 }} /\u003e
                \u003cYAxis tick={{ fontSize: 10 }} /\u003e
              \u003c/\u003e
            )}
            \u003cTooltip /\u003e
            \u003cLegend wrapperStyle={{ fontSize: '10px' }} /\u003e
            {alternatives.map((alt, altIdx) =\u003e (
              \u003cBar 
                key={alt.name} 
                dataKey={alt.name} 
                fill={colors[altIdx % colors.length]}
              /\u003e
            ))}
          \u003c/BarChart\u003e
        )}
      \u003c/ResponsiveContainer\u003e
    );
  };

  const generateKSensRankingTable = (criterionName: string) =\u003e {
    if (!kSensResults || !kSensResults[criterionName]) return null;
    
    const criterionData = criteria.find(c =\u003e c.name === criterionName);
    
    return (
      \u003cdiv className=\"overflow-x-auto mb-8\"\u003e
        \u003ch3 className=\"text-sm font-semibold mb-3 text-black\"\u003e
          Sensitivity Analysis for {criterionName} (Weight: {((criterionData?.weight || 0) * 100).toFixed(2)}%)
        \u003c/h3\u003e
        \u003ctable className=\"w-full border-collapse border border-gray-300 text-xs\"\u003e
          \u003cthead\u003e
            \u003ctr className=\"bg-gray-100\"\u003e
              \u003cth className=\"border border-gray-300 px-4 py-2\"\u003eVariation (%)\u003c/th\u003e
              {alternatives.map(alt =\u003e (
                \u003cth key={alt.name} className=\"border border-gray-300 px-4 py-2\"\u003e{alt.name}\u003c/th\u003e
              ))}
            \u003c/tr\u003e
          \u003c/thead\u003e
          \u003ctbody\u003e
            {kSensResults[criterionName].map((varData: any) =\u003e (
              \u003ctr key={varData.variation}\u003e
                \u003ctd className=\"border border-gray-300 px-4 py-2 font-semibold text-center text-black\"\u003e
                  {varData.variation \u003e 0 ? '+' : ''}{varData.variation}
                \u003c/td\u003e
                {alternatives.map(alt =\u003e (
                  \u003ctd key={alt.name} className=\"border border-gray-300 px-4 py-2 text-center text-black\"\u003e
                    \u003cdiv className=\"flex flex-col\"\u003e
                      \u003cspan className=\"font-semibold\"\u003e#{varData.rankings[alt.name]?.rank}\u003c/span\u003e
                      \u003cspan className=\"text-xs text-gray-600\"\u003e
                        ({varData.rankings[alt.name]?.score.toFixed(4)})
                      \u003c/span\u003e
                    \u003c/div\u003e
                  \u003c/td\u003e
                ))}
              \u003c/tr\u003e
            ))}
          \u003c/tbody\u003e
        \u003c/table\u003e
      \u003c/div\u003e
    );
  };

  return (
    \u003cCard className=\"border-gray-200 bg-white shadow-none w-full mb-6\"\u003e
      \u003cCardHeader className=\"pb-3\"\u003e
        \u003cCardTitle className=\"text-sm text-black\"\u003eK% Sensitivity Analysis Calculator\u003c/CardTitle\u003e
        \u003cCardDescription className=\"text-xs text-gray-700\"\u003e
          Advanced sensitivity analysis with customizable variation ranges
        \u003c/CardDescription\u003e
      \u003c/CardHeader\u003e
      \u003cCardContent\u003e
        \u003cdiv className=\"space-y-4\"\u003e
          {/* Tab Navigation */}
          \u003cdiv className=\"flex gap-2 mb-4 border-b\"\u003e
            \u003cbutton
              onClick={() =\u003e setKSensActiveTab('input')}
              className={`px-4 py-2 font-semibold text-xs ${kSensActiveTab === 'input' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            \u003e
              Input Configuration
            \u003c/button\u003e
            \u003cbutton
              onClick={() =\u003e setKSensActiveTab('results')}
              className={`px-4 py-2 font-semibold text-xs ${kSensActiveTab === 'results' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              disabled={!kSensResults}
            \u003e
              Charts \u0026 Results
            \u003c/button\u003e
            \u003cbutton
              onClick={() =\u003e setKSensActiveTab('tables')}
              className={`px-4 py-2 font-semibold text-xs ${kSensActiveTab === 'tables' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              disabled={!kSensResults}
            \u003e
              Ranking Tables
            \u003c/button\u003e
          \u003c/div\u003e

          {/* Input Tab */}
          {kSensActiveTab === 'input' && (
            \u003cdiv className=\"space-y-4\"\u003e
              \u003cdiv\u003e
                \u003ch3 className=\"text-sm font-semibold mb-3 text-black\"\u003eVariation Range Configuration\u003c/h3\u003e
                \u003cp className=\"text-xs text-gray-600 mb-2\"\u003e
                  Customize variation percentages for sensitivity analysis
                \u003c/p\u003e
                
                \u003cdiv className=\"mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg\"\u003e
                  \u003cp className=\"text-xs font-semibold mb-2 text-black\"\u003eQuick Presets:\u003c/p\u003e
                  \u003cdiv className=\"flex flex-wrap gap-2\"\u003e
                    \u003cbutton
                      onClick={() =\u003e setKSensVariationRange([-30, -20, -10, 0, 10, 20, 30])}
                      className=\"px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs\"
                    \u003e
                      ±30% (7 points)
                    \u003c/button\u003e
                    \u003cbutton
                      onClick={() =\u003e setKSensVariationRange([-50, -30, -10, 0, 10, 30, 50])}
                      className=\"px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs\"
                    \u003e
                      ±50% (7 points)
                    \u003c/button\u003e
                    \u003cbutton
                      onClick={() =\u003e setKSensVariationRange([-100, -75, -50, -25, 0, 25, 50, 75, 100])}
                      className=\"px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs\"
                    \u003e
                      ±100% (9 points)
                    \u003c/button\u003e
                    \u003cbutton
                      onClick={() =\u003e setKSensVariationRange([-10, -5, 0, 5, 10])}
                      className=\"px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-xs\"
                    \u003e
                      ±10% (5 points)
                    \u003c/button\u003e
                  \u003c/div\u003e
                \u003c/div\u003e

                \u003cdiv className=\"mb-3\"\u003e
                  \u003clabel className=\"block text-xs font-medium mb-2 text-black\"\u003e
                    Custom Variation Points (comma-separated)
                  \u003c/label\u003e
                  \u003cinput
                    type=\"text\"
                    value={kSensVariationRange.join(', ')}
                    onChange={(e) =\u003e {
                      const values = e.target.value
                        .split(',')
                        .map(v =\u003e parseFloat(v.trim()))
                        .filter(v =\u003e !isNaN(v));
                      if (values.length \u003e 0) {
                        setKSensVariationRange(values.sort((a, b) =\u003e a - b));
                      }
                    }}
                    className=\"w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs\"
                    placeholder=\"Enter variation percentages separated by commas\"
                  /\u003e
                  \u003cp className=\"text-xs text-gray-500 mt-1\"\u003e
                    Tip: Include 0 for baseline comparison
                  \u003c/p\u003e
                \u003c/div\u003e

                \u003cdiv className=\"p-3 bg-gray-50 rounded border\"\u003e
                  \u003cp className=\"text-xs font-medium mb-1 text-black\"\u003eCurrent Variation Range:\u003c/p\u003e
                  \u003cdiv className=\"flex flex-wrap gap-1\"\u003e
                    {kSensVariationRange.map((val, idx) =\u003e (
                      \u003cspan
                        key={idx}
                        className=\"px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium\"
                      \u003e
                        {val \u003e 0 ? '+' : ''}{val}%
                      \u003c/span\u003e
                    ))}
                  \u003c/div\u003e
                \u003c/div\u003e
              \u003c/div\u003e

              \u003cdiv className=\"flex justify-end\"\u003e
                \u003cButton
                  onClick={performKSensitivityAnalysis}
                  className=\"bg-black text-white hover:bg-gray-800 text-xs h-8\"
                \u003e
                  Run K% Sensitivity Analysis
                \u003c/Button\u003e
              \u003c/div\u003e
            \u003c/div\u003e
          )}

          {/* Results Tab */}
          {kSensActiveTab === 'results' && kSensResults && (
            \u003cdiv className=\"space-y-4\"\u003e
              \u003cdiv className=\"flex items-center justify-between mb-4\"\u003e
                \u003ch3 className=\"text-sm font-semibold text-black\"\u003eVisualization Options\u003c/h3\u003e
                \u003cSelect value={kSensChartType} onValueChange={setKSensChartType}\u003e
                  \u003cSelectTrigger className=\"w-48 h-8 text-xs\"\u003e
                    \u003cSelectValue /\u003e
                  \u003c/SelectTrigger\u003e
                  \u003cSelectContent\u003e
                    {kSensChartTypes.map(ct =\u003e (
                      \u003cSelectItem key={ct.value} value={ct.value} className=\"text-xs\"\u003e
                        {ct.icon} {ct.label}
                      \u003c/SelectItem\u003e
                    ))}
                  \u003c/SelectContent\u003e
                \u003c/Select\u003e
              \u003c/div\u003e

              {criteria.map((crit) =\u003e (
                \u003cCard key={crit.id} className=\"border-gray-200 bg-white shadow-none mb-4\"\u003e
                  \u003cCardHeader className=\"pb-3\"\u003e
                    \u003cCardTitle className=\"text-sm text-black\"\u003e
                      {crit.name} - Sensitivity Chart (Weight: {(crit.weight * 100).toFixed(2)}%)
                    \u003c/CardTitle\u003e
                  \u003c/CardHeader\u003e
                  \u003cCardContent\u003e
                    {renderKSensChart(crit.name)}
                  \u003c/CardContent\u003e
                \u003c/Card\u003e
              ))}
            \u003c/div\u003e
          )}

          {/* Tables Tab */}
          {kSensActiveTab === 'tables' && kSensResults && (
            \u003cdiv className=\"space-y-4\"\u003e
              {criteria.map((crit) =\u003e (
                \u003cCard key={crit.id} className=\"border-gray-200 bg-white shadow-none mb-4\"\u003e
                  \u003cCardContent className=\"pt-6\"\u003e
                    {generateKSensRankingTable(crit.name)}
                  \u003c/CardContent\u003e
                \u003c/Card\u003e
              ))}
            \u003c/div\u003e
          )}
        \u003c/div\u003e
      \u003c/CardContent\u003e
    \u003c/Card\u003e
  );
}
```

Then in your `app/application/page.tsx`, add this component right after the existing sensitivity analysis section (around line 6580):

1. Add the import at the top:
```tsx
import KSensitivity Calculator from "@/components/KSensitivityCalculator"
```

2. Add the component after the existing sensitivity analysis (around line 6580):
```tsx
{homeTab === "sensitivityAnalysis" && (
  \u003cKSensitivityCalculator criteria={criteria} alternatives={alternatives} /\u003e
)}
```

This approach is cleaner and follows React best practices. Would you like me to create the component file for you?
