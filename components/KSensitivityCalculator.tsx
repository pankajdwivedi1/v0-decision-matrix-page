"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Check, ChevronRight } from 'lucide-react';

interface Criterion {
  id: string;
  name: string;
  weight: number;
  type: "beneficial" | "non-beneficial";
}

interface Alternative {
  id: string;
  name: string;
  scores: Record<string, number | "">;
}

interface KSensitivityCalculatorProps {
  criteria: Criterion[];
  alternatives: Alternative[];
  weightMethod?: string;
}

export default function KSensitivityCalculator({ criteria, alternatives, weightMethod = "Custom" }: KSensitivityCalculatorProps) {
  const [kSensVariationRange, setKSensVariationRange] = useState<number[]>([-30, -20, -10, 0, 10, 20, 30]);
  const [kSensChartType, setKSensChartType] = useState<string>('line');
  const [kSensResults, setKSensResults] = useState<any>(null);
  const [kSensActiveTab, setKSensActiveTab] = useState<'results' | 'tables'>('results');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Weight method state
  const [selectedWeightMethod, setSelectedWeightMethod] = useState<string>('equal');
  const [workingCriteria, setWorkingCriteria] = useState<Criterion[]>(criteria);
  const [customWeights, setCustomWeights] = useState<{ [key: string]: number }>({});
  const [isCalculatingWeights, setIsCalculatingWeights] = useState<boolean>(false);

  // Ranking method state
  const [selectedRankingMethod, setSelectedRankingMethod] = useState<string>('swei');
  const [showFormula, setShowFormula] = useState<boolean>(false);

  // Trigger MathJax rendering when formulas are shown
  useEffect(() => {
    if (showFormula && typeof window !== 'undefined' && (window as any).MathJax) {
      (window as any).MathJax.typesetPromise?.();
    }
  }, [showFormula]);

  // Handle ranking method change
  const handleRankingMethodChange = (method: string) => {
    setSelectedRankingMethod(method);
    setKSensResults(null); // Reset results when ranking method changes
  };

  // Calculate weights based on selected method
  const calculateWeights = async (method: string) => {
    let newWeights: number[] = [];

    // Simple local methods
    if (method === 'equal') {
      newWeights = criteria.map(() => 1 / criteria.length);
    } else if (method === 'roc') {
      // Rank Order Centroid
      const n = criteria.length;
      newWeights = criteria.map((_, idx) => {
        let sum = 0;
        for (let j = idx; j < n; j++) {
          sum += 1 / (j + 1);
        }
        return sum / n;
      });
    } else if (method === 'rr') {
      // Rank Reciprocal
      const sumReciprocals = criteria.reduce((sum, _, idx) => sum + (1 / (idx + 1)), 0);
      newWeights = criteria.map((_, idx) => (1 / (idx + 1)) / sumReciprocals);
    } else if (method === 'custom') {
      newWeights = criteria.map(c => customWeights[c.id] || (1 / criteria.length));
    } else {
      // API-based objective methods
      try {
        setIsCalculatingWeights(true);

        // Prepare API data
        const criteriaData = criteria.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type
        }));

        const alternativesData = alternatives.map(alt => ({
          id: alt.id,
          name: alt.name,
          scores: alt.scores
        }));

        // Call weight calculation API
        const response = await fetch('/api/calculate-weights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: method,
            criteria: criteriaData,
            alternatives: alternativesData
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.weights) {
            newWeights = criteria.map(c => data.weights[c.id] || 0);
          } else {
            // Fallback to equal weights
            newWeights = criteria.map(() => 1 / criteria.length);
          }
        } else {
          console.warn('API failed, using equal weights');
          newWeights = criteria.map(() => 1 / criteria.length);
        }
      } catch (error) {
        console.error('Weight calculation error:', error);
        newWeights = criteria.map(() => 1 / criteria.length);
      } finally {
        setIsCalculatingWeights(false);
      }
    }

    // Normalize weights
    const sum = newWeights.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      newWeights = newWeights.map(w => w / sum);
    }

    // Update working criteria
    const updated = criteria.map((c, idx) => ({
      ...c,
      weight: newWeights[idx]
    }));

    setWorkingCriteria(updated);
  };

  // Handle weight method change
  const handleWeightMethodChange = async (method: string) => {
    setSelectedWeightMethod(method);
    await calculateWeights(method);
    setKSensResults(null);
  };

  // Handle custom weight input
  const handleCustomWeightChange = (criterionId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setCustomWeights(prev => ({
        ...prev,
        [criterionId]: numValue
      }));
    }
  };

  // Apply custom weights
  const applyCustomWeights = () => {
    calculateWeights('custom');
  };

  const kSensChartTypes = [
    { value: 'line', label: 'Line Chart', icon: '📈' },
    { value: 'bar', label: 'Bar Chart', icon: '📊' },
    { value: 'column', label: 'Column Chart', icon: '📊' },
    { value: 'scatter', label: 'Scatter Plot', icon: '⚫' },
    { value: 'area', label: 'Area Chart', icon: '📈' },
    { value: 'radar', label: 'Radar Chart', icon: '🎯' },
    { value: 'heatmap', label: 'Heatmap', icon: '🟨' },
  ];

  const calculateKSensScore = (altValues: number[], weights: number[], criteriaTypes: string[]) => {
    return altValues.reduce((sum, val, idx) => {
      const normalizedVal = criteriaTypes[idx] === 'non-beneficial' ? (1 - val) : val;
      return sum + (normalizedVal * weights[idx]);
    }, 0);
  };

  const performKSensitivityAnalysis = async () => {
    const analysisResults: any = {};

    for (const [critIdx, criterion] of workingCriteria.entries()) {
      const variationData = [];

      for (const variation of kSensVariationRange) {
        const adjustedWeights = [...workingCriteria.map(c => c.weight)];
        const variationFactor = 1 + (variation / 100);
        adjustedWeights[critIdx] = workingCriteria[critIdx].weight * variationFactor;

        const weightSum = adjustedWeights.reduce((a, b) => a + b, 0);
        const normalizedWeights = adjustedWeights.map(w => w / weightSum);

        // Prepare criteria with adjusted weights
        const adjustedCriteria = workingCriteria.map((c, idx) => ({
          id: c.id,
          name: c.name,
          weight: normalizedWeights[idx],
          type: c.type
        }));

        try {
          // Call ranking API with selected method
          const response = await fetch('/api/calculate-ranking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: selectedRankingMethod,
              criteria: adjustedCriteria,
              alternatives: alternatives
            })
          });

          if (response.ok) {
            const data = await response.json();

            // Extract rankings and scores from API response
            const rankings: any = {};
            const scores: any[] = [];

            if (data.ranking) {
              data.ranking.forEach((item: any) => {
                rankings[item.alternativeName] = {
                  rank: item.rank,
                  score: item.score || 0
                };
                scores.push({
                  name: item.alternativeName,
                  score: item.score || 0
                });
              });
            }

            variationData.push({
              variation,
              rankings,
              scores
            });
          } else {
            // Fallback to simple calculation if API fails
            const scores = alternatives.map((alt) => {
              const altValues = workingCriteria.map(c => {
                const score = alt.scores[c.id];
                return typeof score === 'number' ? score : 0;
              });
              return {
                name: alt.name,
                score: calculateKSensScore(altValues, normalizedWeights, workingCriteria.map(c => c.type)),
                originalIndex: alternatives.indexOf(alt)
              };
            });

            scores.sort((a, b) => b.score - a.score);

            const rankings: any = {};
            scores.forEach((item, rank) => {
              rankings[item.name] = {
                rank: rank + 1,
                score: item.score
              };
            });

            variationData.push({
              variation,
              rankings,
              scores: scores.map(s => ({ name: s.name, score: s.score }))
            });
          }
        } catch (error) {
          console.error('Ranking API error:', error);
          // Fallback to simple calculation
          const scores = alternatives.map((alt) => {
            const altValues = workingCriteria.map(c => {
              const score = alt.scores[c.id];
              return typeof score === 'number' ? score : 0;
            });
            return {
              name: alt.name,
              score: calculateKSensScore(altValues, normalizedWeights, workingCriteria.map(c => c.type)),
              originalIndex: alternatives.indexOf(alt)
            };
          });

          scores.sort((a, b) => b.score - a.score);

          const rankings: any = {};
          scores.forEach((item, rank) => {
            rankings[item.name] = {
              rank: rank + 1,
              score: item.score
            };
          });

          variationData.push({
            variation,
            rankings,
            scores: scores.map(s => ({ name: s.name, score: s.score }))
          });
        }
      }

      analysisResults[criterion.name] = variationData;
    }

    setKSensResults(analysisResults);
  };

  const generateKSensChartData = (criterionName: string) => {
    if (!kSensResults || !kSensResults[criterionName]) return [];

    const chartData = kSensVariationRange.map(variation => {
      const dataPoint: any = { variation: `${variation}%` };
      const varData = kSensResults[criterionName].find((v: any) => v.variation === variation);

      alternatives.forEach(alt => {
        if (varData && varData.rankings[alt.name]) {
          dataPoint[alt.name] = varData.rankings[alt.name].score;
        }
      });

      return dataPoint;
    });

    return chartData;
  };

  const generateKSensHeatmapData = (criterionName: string) => {
    if (!kSensResults || !kSensResults[criterionName]) return [];

    return kSensResults[criterionName].map((varData: any) => ({
      variation: `${varData.variation}%`,
      ...Object.fromEntries(
        alternatives.map(alt => [alt.name, varData.rankings[alt.name]?.score || 0])
      )
    }));
  };

  const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#ca8a04', '#db2777'];

  const renderKSensChart = (criterionName: string) => {
    const data = generateKSensChartData(criterionName);
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    if (kSensChartType === 'heatmap') {
      const heatmapData = generateKSensHeatmapData(criterionName);
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 px-3 py-2 bg-gray-100 text-xs">Variation</th>
                {alternatives.map(alt => (
                  <th key={alt.name} className="border border-gray-300 px-3 py-2 bg-gray-100 text-xs">{alt.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row: any, rIdx: number) => (
                <tr key={rIdx}>
                  <td className="border border-gray-300 px-3 py-2 font-semibold text-xs">{row.variation}</td>
                  {alternatives.map((alt) => {
                    const value = row[alt.name];
                    const allValues = Object.values(row).filter(v => typeof v === 'number') as number[];
                    const maxValue = Math.max(...allValues);
                    const intensity = Math.floor((value / maxValue) * 255);
                    return (
                      <td
                        key={alt.name}
                        className="border border-gray-300 px-3 py-2 text-center text-xs"
                        style={{
                          backgroundColor: `rgb(${255 - intensity}, ${255 - intensity / 2}, ${255})`,
                          color: intensity > 150 ? 'white' : 'black'
                        }}
                      >
                        {value.toFixed(4)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (kSensChartType === 'radar') {
      const radarData = alternatives.map(alt => ({
        alternative: alt.name,
        ...Object.fromEntries(
          kSensVariationRange.map((v, vIdx) => [
            `${v}%`,
            kSensResults[criterionName][vIdx].rankings[alt.name]?.score || 0
          ])
        )
      }));

      return (
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData} margin={commonProps.margin}>
            <PolarGrid />
            <PolarAngleAxis dataKey="alternative" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {kSensVariationRange.map((v, vIdx) => (
              <Radar
                key={v}
                name={`${v}%`}
                dataKey={`${v}%`}
                stroke={colors[vIdx % colors.length]}
                fill={colors[vIdx % colors.length]}
                fillOpacity={0.3}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        {['line', 'area'].includes(kSensChartType) ? (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="variation" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
            <YAxis label={{ value: 'Aggregated weights', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {alternatives.map((alt, altIdx) => (
              <Line
                key={alt.name}
                type="monotone"
                dataKey={alt.name}
                stroke={colors[altIdx % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                fill={kSensChartType === 'area' ? colors[altIdx % colors.length] : undefined}
                fillOpacity={kSensChartType === 'area' ? 0.3 : undefined}
              />
            ))}
          </LineChart>
        ) : kSensChartType === 'scatter' ? (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="Variation Index" tick={{ fontSize: 10 }} />
            <YAxis type="number" dataKey="y" name="Score" tick={{ fontSize: 10 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {alternatives.map((alt, altIdx) => {
              const scatterData = data.map((d, idx) => ({ x: idx, y: d[alt.name] }));
              return (<Scatter key={alt.name} name={alt.name} data={scatterData} fill={colors[altIdx % colors.length]} />);
            })}
          </ScatterChart>
        ) : (
          <BarChart {...commonProps} layout={kSensChartType === 'bar' ? 'vertical' : undefined}>
            <CartesianGrid strokeDasharray="3 3" />
            {kSensChartType === 'bar' ? (
              <>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="variation" type="category" tick={{ fontSize: 10 }} />
              </>
            ) : (
              <>
                <XAxis dataKey="variation" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
              </>
            )}
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {alternatives.map((alt, altIdx) => (
              <Bar key={alt.name} dataKey={alt.name} fill={colors[altIdx % colors.length]} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  const generateKSensRankingTable = (criterionName: string) => {
    if (!kSensResults || !kSensResults[criterionName]) return null;
    const criterionData = criteria.find(c => c.name === criterionName);

    return (
      <div className="overflow-x-auto mb-8">
        <h3 className="text-sm font-semibold mb-3 text-black">
          Sensitivity Analysis for {criterionName} (Base Weight: {((criterionData?.weight || 0) * 100).toFixed(2)}%)
        </h3>
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Variation (%)</th>
              {alternatives.map(alt => (<th key={alt.name} className="border border-gray-300 px-4 py-2">{alt.name}</th>))}
            </tr>
          </thead>
          <tbody>
            {kSensResults[criterionName].map((varData: any) => (
              <tr key={varData.variation}>
                <td className="border border-gray-300 px-4 py-2 font-semibold text-center text-black">
                  {varData.variation > 0 ? '+' : ''}{varData.variation}%
                </td>
                {alternatives.map(alt => (
                  <td key={alt.name} className="border border-gray-300 px-4 py-2 text-center text-black">
                    <div className="flex flex-col">
                      <span className="font-semibold">#{varData.rankings[alt.name]?.rank}</span>
                      <span className="text-xs text-gray-600">({varData.rankings[alt.name]?.score.toFixed(4)})</span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-black">K% Sensitivity Analysis Calculator</CardTitle>
        <CardDescription className="text-xs text-gray-700">
          Step-by-step guided sensitivity analysis with customizable variation ranges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Formula Section - Collapsible */}
          <div className="border rounded-lg bg-gray-50">
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="w-full p-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-black">K% SENSITIVITY ANALYSIS</span>
                <a
                  href="#"
                  className="text-xs text-blue-600 hover:underline"
                  onClick={(e) => { e.stopPropagation(); setShowFormula(!showFormula); }}
                >
                  General formula for Sensitivity analysis methodology
                </a>
              </div>
              <span className="text-gray-500">{showFormula ? '▼' : '▶'}</span>
            </button>

            {showFormula && (
              <div className="p-4 space-y-4 border-t">
                {/* Step 1: General Formula */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-semibold mb-3 text-blue-900">1. General Formula for sk% Sensitivity Analysis</div>
                  <div className="space-y-2 text-xs">
                    <div><strong>Let:</strong></div>
                    <div className="ml-4"><strong>Base weights:</strong></div>
                    <div className="ml-8 mathjax-formula">
                      {"\\(\\{w_i\\}_{i=1}^{i_2} \\quad \\text{where} \\; w_i \\in [0,1] \\; \\text{and} \\; \\sum_{i=1}^{i_1} w_i = 1\\}\\)"}
                    </div>
                    <div className="ml-4 mt-3"><strong>Suppose weight of criterion</strong></div>
                    <div className="ml-8 mathjax-formula">{"\\((C_p\\,)\\)"}</div>
                    <div className="ml-4 mt-2"><strong>is varied by sk%</strong></div>
                  </div>
                </div>

                {/* Step 2: Modify selected criterion */}
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-sm font-semibold mb-3 text-purple-900">Step 1: Modify selected criterion</div>
                  <div className="flex justify-center mathjax-formula text-base">
                    {"\\[\\{w_p'(k\\%) = w_p \\times \\left(1 + \\frac{k}{100}\\right) \\; \\text{for(+k)} \\; \\text{or} \\; \\left(1 - \\frac{k}{100}\\right) \\; \\text{for(-k)}\\}\\]"}
                  </div>
                </div>

                {/* Step 3: Compute remaining weight mass */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-semibold mb-3 text-green-900">Step 2: Compute remaining weight mass</div>
                  <div className="flex justify-center mathjax-formula text-base mb-3">
                    {"\\[\\{R = 1 - w_p'(k\\%)\\}\\]"}
                  </div>
                  <div className="text-xs text-center text-gray-600 mt-2"><em>Original remaining weights sum:</em></div>
                  <div className="flex justify-center mathjax-formula text-base mt-1">
                    {"\\[\\{S = \\sum_{i \\neq p} w_i\\}\\]"}
                  </div>
                </div>

                {/* Step 4: Proportional re-scaling factor */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm font-semibold mb-3 text-yellow-900">Step 3: Proportional re-scaling factor</div>
                  <div className="flex justify-center mathjax-formula text-base">
                    {"\\[\\{\\lambda = \\frac{R}{S}\\}\\]"}
                  </div>
                </div>

                {/* Step 5: Adjust remaining weights */}
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                  <div className="text-sm font-semibold mb-3 text-pink-900">Step 4: Adjust remaining weights</div>
                  <div className="flex justify-center mathjax-formula text-base">
                    {"\\[\\{w_i'(k\\%) = \\lambda \\times w_i \\quad \\forall i \\neq p\\}\\]"}
                  </div>
                </div>

                {/* Step 6: Validity check */}
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="text-sm font-semibold mb-3 text-teal-900">Step 5: Validity check</div>
                  <div className="flex justify-center mathjax-formula text-base">
                    {"\\[\\{\\sum_{i=1}^{i_1} w_i'(k\\%) = 1\\}\\]"}
                  </div>
                </div>

                {/* Success message */}
                <div className="p-3 bg-green-100 border border-green-300 rounded flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-xs text-green-800">This procedure is standard, reviewer-accepted, and avoids bias.</span>
                </div>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} text-xs font-semibold`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-xs font-medium ${currentStep >= 1 ? 'text-black' : 'text-gray-500'}`}>Verify Data</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} text-xs font-semibold`}>
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className={`text-xs font-medium ${currentStep >= 2 ? 'text-black' : 'text-gray-500'}`}>Configure</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} text-xs font-semibold`}>
                {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <span className={`text-xs font-medium ${currentStep >= 3 ? 'text-black' : 'text-gray-500'}`}>Results</span>
            </div>
          </div>

          {/* Step 1: Verify Data & Weights */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold mb-2 text-black">Step 1: Verify Your Data & Weights</h3>
                <p className="text-xs text-gray-700 mb-2">
                  The sensitivity analysis will use the data and weights shown below.
                </p>
              </div>

              {/* Weight & Ranking Method Selectors - Side by Side */}
              <div className="border rounded-lg p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Weight Method Selector */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                      WEIGHT METHOD
                    </label>
                    <Select value={selectedWeightMethod} onValueChange={handleWeightMethodChange}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300">
                        <SelectValue placeholder="Select weight method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equal" className="text-sm">Equal Weight</SelectItem>
                        <SelectItem value="entropy" className="text-sm">Entropy Weight</SelectItem>
                        <SelectItem value="critic" className="text-sm">CRITIC Weight</SelectItem>
                        <SelectItem value="ahp" className="text-sm">AHP Weight</SelectItem>
                        <SelectItem value="piprecia" className="text-sm">PIPRECIA Weight</SelectItem>
                        <SelectItem value="merec" className="text-sm">MEREC Weight</SelectItem>
                        <SelectItem value="swara" className="text-sm">SWARA Weight</SelectItem>
                        <SelectItem value="wenslo" className="text-sm">WENSLO Weight</SelectItem>
                        <SelectItem value="lopcow" className="text-sm">LOPCOW Weight</SelectItem>
                        <SelectItem value="dematel" className="text-sm">DEMATEL Weight</SelectItem>
                        <SelectItem value="sd" className="text-sm">SD Weight</SelectItem>
                        <SelectItem value="variance" className="text-sm">Variance Weight</SelectItem>
                        <SelectItem value="mad" className="text-sm">MAD Weight</SelectItem>
                        <SelectItem value="distance" className="text-sm">Distance-based Weight</SelectItem>
                        <SelectItem value="svp" className="text-sm">SVP Weight</SelectItem>
                        <SelectItem value="mdm" className="text-sm">MDM Weight</SelectItem>
                        <SelectItem value="lsw" className="text-sm">LSW Weight</SelectItem>
                        <SelectItem value="gpow" className="text-sm">GPOW Weight</SelectItem>
                        <SelectItem value="lpwm" className="text-sm">LPWM Weight</SelectItem>
                        <SelectItem value="pcwm" className="text-sm">PCWM Weight</SelectItem>
                        <SelectItem value="roc" className="text-sm">ROC Weight</SelectItem>
                        <SelectItem value="rr" className="text-sm">RR Weight</SelectItem>
                        <SelectItem value="custom" className="text-sm">Enter Own Weight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ranking Method Selector */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-gray-700 uppercase tracking-wide">
                      RANKING METHOD
                    </label>
                    <Select value={selectedRankingMethod} onValueChange={handleRankingMethodChange}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300">
                        <SelectValue placeholder="Select ranking method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="swei" className="text-sm">SWEI</SelectItem>
                        <SelectItem value="swi" className="text-sm">SWI</SelectItem>
                        <SelectItem value="topsis" className="text-sm">TOPSIS</SelectItem>
                        <SelectItem value="vikor" className="text-sm">VIKOR</SelectItem>
                        <SelectItem value="waspas" className="text-sm">WASPAS</SelectItem>
                        <SelectItem value="edas" className="text-sm">EDAS</SelectItem>
                        <SelectItem value="moora" className="text-sm">MOORA</SelectItem>
                        <SelectItem value="multimoora" className="text-sm">MULTIMOORA</SelectItem>
                        <SelectItem value="todim" className="text-sm">TODIM</SelectItem>
                        <SelectItem value="codas" className="text-sm">CODAS</SelectItem>
                        <SelectItem value="moosra" className="text-sm">MOOSRA</SelectItem>
                        <SelectItem value="mairca" className="text-sm">MAIRCA</SelectItem>
                        <SelectItem value="mabac" className="text-sm">MABAC</SelectItem>
                        <SelectItem value="marcos" className="text-sm">MARCOS</SelectItem>
                        <SelectItem value="cocoso" className="text-sm">COCOSO</SelectItem>
                        <SelectItem value="copras" className="text-sm">COPRAS</SelectItem>
                        <SelectItem value="promethee" className="text-sm">PROMETHEE</SelectItem>
                        <SelectItem value="promethee1" className="text-sm">PROMETHEE I</SelectItem>
                        <SelectItem value="promethee2" className="text-sm">PROMETHEE II</SelectItem>
                        <SelectItem value="electre" className="text-sm">ELECTRE</SelectItem>
                        <SelectItem value="electre1" className="text-sm">ELECTRE I</SelectItem>
                        <SelectItem value="electre2" className="text-sm">ELECTRE II</SelectItem>
                        <SelectItem value="gra" className="text-sm">GRA</SelectItem>
                        <SelectItem value="aras" className="text-sm">ARAS</SelectItem>
                        <SelectItem value="wsm" className="text-sm">WSM</SelectItem>
                        <SelectItem value="wpm" className="text-sm">WPM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Objective Weights Label */}
                {selectedWeightMethod !== 'equal' && selectedWeightMethod !== 'roc' && selectedWeightMethod !== 'rr' && selectedWeightMethod !== 'custom' && (
                  <div className="mb-4">
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      Objective Weights
                    </div>
                  </div>
                )}

                {/* Custom Weight Input */}
                {selectedWeightMethod === 'custom' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-xs font-semibold mb-3 text-black">Enter Custom Weights:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {criteria.map((crit) => (
                        <div key={crit.id}>
                          <label className="block text-xs font-medium mb-1 text-black">{crit.name}</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0.0"
                            value={customWeights[crit.id] || ''}
                            onChange={(e) => handleCustomWeightChange(crit.id, e.target.value)}
                            className="w-full px-2 py-1 border rounded text-xs"
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={applyCustomWeights}
                      className="mt-3 bg-blue-600 text-white hover:bg-blue-700 text-xs h-7"
                      size="sm"
                    >
                      Apply Custom Weights
                    </Button>
                  </div>
                )}

                {/* Current Weights Display - Compact Card Style */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="text-xs font-semibold mb-3 text-gray-700">Current Weights</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {workingCriteria.map((crit) => (
                      <div key={crit.id} className="bg-white rounded p-3 border border-gray-200">
                        <div className="text-xs font-medium text-gray-700 mb-1">{crit.name}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-blue-600">{(crit.weight * 100).toFixed(2)}%</span>
                          <span className={`text-sm ${crit.type === 'beneficial' ? 'text-green-600' : 'text-red-600'}`}>
                            {crit.type === 'beneficial' ? '↑' : '↓'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alternatives Count */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-xs font-semibold mb-2 text-black flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px]">✓</span>
                  Alternatives to Analyze
                </h4>
                <div className="flex flex-wrap gap-2">
                  {alternatives.map((alt) => (
                    <span key={alt.id} className="px-3 py-1 bg-white border rounded-full text-xs text-black">
                      {alt.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Total: <strong>{alternatives.length} alternatives</strong> will be analyzed across <strong>{criteria.length} criteria</strong>
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="bg-blue-600 text-white hover:bg-blue-700 text-xs h-8"
                >
                  Continue to Configuration →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Configure Analysis */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold mb-2 text-black">Step 2: Configure Sensitivity Analysis</h3>
                <p className="text-xs text-gray-700">
                  Choose how much variation (%) to apply to each criterion's weight.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-black">Quick Presets</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <button
                    onClick={() => setKSensVariationRange([-10, -5, 0, 5, 10])}
                    className="p-3 border-2 rounded-lg hover:border-blue -500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-sm font-semibold text-black">±10%</div>
                    <div className="text-xs text-gray-600">Fine (5 points)</div>
                  </button>
                  <button
                    onClick={() => setKSensVariationRange([-30, -20, -10, 0, 10, 20, 30])}
                    className="p-3 border-2 border-blue-500 bg-blue-50 rounded-lg hover:border-blue-600 transition-colors text-left"
                  >
                    <div className="text-sm font-semibold text-blue-600">±30%</div>
                    <div className="text-xs text-gray-600">Standard (7)</div>
                    <div className="text-[10px] text-blue-600 font-medium mt-1">Recommended</div>
                  </button>
                  <button
                    onClick={() => setKSensVariationRange([-50, -30, -10, 0, 10, 30, 50])}
                    className="p-3 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-sm font-semibold text-black">±50%</div>
                    <div className="text-xs text-gray-600">Wide (7 points)</div>
                  </button>
                  <button
                    onClick={() => setKSensVariationRange([-100, -75, -50, -25, 0, 25, 50, 75, 100])}
                    className="p-3 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-sm font-semibold text-black">±100%</div>
                    <div className="text-xs text-gray-600">Full (9 points)</div>
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-xs font-medium mb-2 text-black">
                  Or Enter Custom Variation Points
                </label>
                <input
                  type="text"
                  value={kSensVariationRange.join(', ')}
                  onChange={(e) => {
                    const values = e.target.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
                    if (values.length > 0) setKSensVariationRange(values.sort((a, b) => a - b));
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  placeholder="e.g., -25, -10, 0, 10, 25, 40"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-xs font-medium mb-2 text-black">Selected Variation Range:</p>
                <div className="flex flex-wrap gap-1">
                  {kSensVariationRange.map((val, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {val > 0 ? '+' : ''}{val}%
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Will test <strong>{kSensVariationRange.length} variations</strong> for each of <strong>{criteria.length} criteria</strong>
                </p>
              </div>

              <div className="flex justify-between gap-2">
                <Button onClick={() => setCurrentStep(1)} variant="outline" className="text-xs h-8">← Back</Button>
                <Button onClick={() => setCurrentStep(3)} className="bg-blue-600 text-white hover:bg-blue-700 text-xs h-8">Continue →</Button>
              </div>
            </div>
          )}

          {/* Step 3: Run & View Results */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold mb-2 text-black">Step 3: Run Analysis & View Results</h3>
                <p className="text-xs text-gray-700">
                  {kSensResults
                    ? "Analysis complete! Explore the results below."
                    : "Click the button to start the sensitivity analysis."
                  }
                </p>
              </div>

              {!kSensResults && (
                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg">
                  <div className="text-center mb-4">
                    <h4 className="text-sm font-semibold text-black mb-2">Ready to Analyze</h4>
                    <p className="text-xs text-gray-600 mb-4">
                      <strong>{alternatives.length} alternatives</strong> × <strong>{criteria.length} criteria</strong> × <strong>{kSensVariationRange.length} variations</strong>
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      performKSensitivityAnalysis();
                      setKSensActiveTab('results');
                    }}
                    className="bg-green-600 text-white hover:bg-green-700 text-xs h-10 px-6"
                  >
                    🚀 Run K% Sensitivity Analysis
                  </Button>
                </div>
              )}

              {kSensResults && (
                <div>
                  <div className="flex gap-2 mb-4 border-b">
                    <button
                      onClick={() => setKSensActiveTab('results')}
                      className={`px-4 py-2 font-semibold text-xs ${kSensActiveTab === 'results' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    >
                      📊 Charts
                    </button>
                    <button
                      onClick={() => setKSensActiveTab('tables')}
                      className={`px-4 py-2 font-semibold text-xs ${kSensActiveTab === 'tables' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    >
                      📋 Tables
                    </button>
                  </div>

                  {kSensActiveTab === 'results' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-xs font-semibold text-black">Chart Type:</h4>
                        <Select value={kSensChartType} onValueChange={setKSensChartType}>
                          <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {kSensChartTypes.map(ct => (
                              <SelectItem key={ct.value} value={ct.value} className="text-xs">
                                {ct.icon} {ct.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {criteria.map((crit) => (
                        <Card key={crit.id} className="border-gray-200 bg-white shadow-sm">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-black">{crit.name}</CardTitle>
                            <CardDescription className="text-xs">
                              Base: {(crit.weight * 100).toFixed(2)}% ({crit.type === 'beneficial' ? 'Beneficial ↑' : 'Non-Beneficial ↓'})
                            </CardDescription>
                          </CardHeader>
                          <CardContent>{renderKSensChart(crit.name)}</CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {kSensActiveTab === 'tables' && (
                    <div className="space-y-4">
                      {criteria.map((crit) => (
                        <Card key={crit.id} className="border-gray-200 bg-white shadow-sm">
                          <CardContent className="pt-6">{generateKSensRankingTable(crit.name)}</CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between gap-2 mt-6 pt-4 border-t">
                    <Button onClick={() => { setKSensResults(null); setCurrentStep(2); }} variant="outline" className="text-xs h-8">
                      ← Modify Config
                    </Button>
                    <Button onClick={() => setCurrentStep(1)} variant="outline" className="text-xs h-8">
                      🔄 Start Over
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
