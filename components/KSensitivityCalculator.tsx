"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import AHPFormula from "./AHPFormula";
import PIPRECIAFormula from "./PIPRECIAFormula";
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
  const [kSensTableDisplayStyle, setKSensTableDisplayStyle] = useState<'both' | 'rank' | 'score'>('both');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Weight method state
  const [selectedWeightMethod, setSelectedWeightMethod] = useState<string>('equal');
  const [workingCriteria, setWorkingCriteria] = useState<Criterion[]>(criteria);
  const [customWeights, setCustomWeights] = useState<{ [key: string]: number }>({});
  const [isCalculatingWeights, setIsCalculatingWeights] = useState<boolean>(false);

  // Ranking method state
  const [selectedRankingMethod, setSelectedRankingMethod] = useState<string>('swei');
  const [showFormula, setShowFormula] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Dialog states for subjective weight methods
  const [isAhpDialogOpen, setIsAhpDialogOpen] = useState<boolean>(false);
  const [isPipreciaDialogOpen, setIsPipreciaDialogOpen] = useState<boolean>(false);
  const [isSwaraDialogOpen, setIsSwaraDialogOpen] = useState<boolean>(false);
  const [isRocDialogOpen, setIsRocDialogOpen] = useState<boolean>(false);
  const [isRrDialogOpen, setIsRrDialogOpen] = useState<boolean>(false);

  // AHP state
  const [ahpMatrix, setAhpMatrix] = useState<number[][]>([]);
  const [ahpWeights, setAhpWeights] = useState<number[]>([]);

  // PIPRECIA state
  const [pipreciaScores, setPipreciaScores] = useState<Record<number, string>>({});

  // SWARA state
  const [swaraCoefficients, setSwaraCoefficients] = useState<{ [key: string]: number }>({});

  // ROC/RR state
  const [rankValues, setRankValues] = useState<{ [key: string]: number }>({});

  // Robust MathJax loader
  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = document.querySelector('script[data-mathjax="loaded"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      script.setAttribute("data-mathjax", "loaded");
      document.head.appendChild(script);
      script.onload = () => {
        if ((window as any).MathJax) {
          (window as any).MathJax.startup = {
            ...(window as any).MathJax.startup,
            typeset: false,
          };
        }
        setTimeout(() => (window as any).MathJax?.typesetPromise?.(), 50);
      };
    } else {
      setTimeout(() => (window as any).MathJax?.typesetPromise?.(), 50);
    }
  }, []);

  // Re-run typeset on formula toggle
  useEffect(() => {
    if (showFormula) {
      setTimeout(() => (window as any).MathJax?.typesetPromise?.(), 50);
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
      // Rank Order Centroid - use ranks from dialog
      const ranks = criteria.map(c => rankValues[c.id] || 1);
      const n = criteria.length;
      newWeights = criteria.map((c, idx) => {
        const rank = rankValues[c.id] || (idx + 1);
        let sum = 0;
        for (let j = rank - 1; j < n; j++) {
          sum += 1 / (j + 1);
        }
        return sum / n;
      });
    } else if (method === 'rr') {
      // Rank Reciprocal - use ranks from dialog
      const ranks = criteria.map(c => rankValues[c.id] || 1);
      const sumReciprocals = ranks.reduce((sum, rank) => sum + (1 / rank), 0);
      newWeights = criteria.map(c => {
        const rank = rankValues[c.id] || 1;
        return (1 / rank) / sumReciprocals;
      });
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
    // Open respective dialogs for subjective methods
    if (method === 'ahp') {
      setSelectedWeightMethod(method);
      setIsAhpDialogOpen(true);
      return;
    }

    if (method === 'piprecia') {
      setSelectedWeightMethod(method);
      setIsPipreciaDialogOpen(true);
      return;
    }

    if (method === 'swara') {
      setSelectedWeightMethod(method);
      setIsSwaraDialogOpen(true);
      return;
    }

    if (method === 'roc') {
      setSelectedWeightMethod(method);
      setIsRocDialogOpen(true);
      return;
    }

    if (method === 'rr') {
      setSelectedWeightMethod(method);
      setIsRrDialogOpen(true);
      return;
    }

    // For custom method, just switch without dialog
    if (method === 'custom') {
      setSelectedWeightMethod(method);
      setKSensResults(null);
      return;
    }

    // For objective methods, calculate automatically
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

  // Handle ROC weight calculation from dialog
  const handleRocCalculation = async () => {
    setIsRocDialogOpen(false);
    await calculateWeights('roc');
    setKSensResults(null);
  };

  // Handle RR weight calculation from dialog
  const handleRrCalculation = async () => {
    setIsRrDialogOpen(false);
    await calculateWeights('rr');
    setKSensResults(null);
  };

  // Handle SWARA weight calculation from dialog
  const handleSwaraCalculation = async () => {
    setIsCalculatingWeights(true);
    try {
      const coeffs: Record<string, number> = {};
      criteria.forEach((crit, index) => {
        coeffs[crit.id] = index === 0 ? 0 : parseFloat(swaraCoefficients[crit.id] as any) || 0;
      });

      const response = await fetch("/api/swara-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria, coefficients: coeffs }),
      });

      if (response.ok) {
        const data = await response.json();
        const newWeights = criteria.map(c => data.weights[c.id] || 0);
        const updated = criteria.map((c, idx) => ({
          ...c,
          weight: newWeights[idx]
        }));
        setWorkingCriteria(updated);
        setIsSwaraDialogOpen(false);
        setKSensResults(null);
      } else {
        alert("Failed to calculate SWARA weights");
      }
    } catch (error) {
      console.error("SWARA calculation error:", error);
      alert("Error calculating SWARA weights");
    } finally {
      setIsCalculatingWeights(false);
    }
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
    setIsAnalyzing(true);
    const analysisResults: any = {};

    try {
      // Prepare all analysis tasks for bulk processing
      const tasks: any[] = [];
      workingCriteria.forEach((criterion, critIdx) => {
        kSensVariationRange.forEach(variation => {
          const adjustedWeights = [...workingCriteria.map(c => c.weight)];
          const variationFactor = 1 + (variation / 100);
          adjustedWeights[critIdx] = workingCriteria[critIdx].weight * variationFactor;

          const weightSum = adjustedWeights.reduce((a, b) => a + b, 0);
          const normalizedWeights = adjustedWeights.map(w => w / weightSum);

          const adjustedCriteria = workingCriteria.map((c, idx) => ({
            id: c.id,
            name: c.name,
            weight: normalizedWeights[idx],
            type: c.type
          }));

          tasks.push({
            criterionName: criterion.name,
            variation,
            criteria: adjustedCriteria
          });
        });
      });

      // Single high-speed bulk request
      const response = await fetch('/api/calculate-k-sens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: selectedRankingMethod,
          alternatives: alternatives,
          tasks: tasks
        })
      });

      if (response.ok) {
        const data = await response.json();
        const results = data.results || {};

        // Ensure variations are sorted within each criterion
        Object.keys(results).forEach(key => {
          if (Array.isArray(results[key])) {
            results[key].sort((a: any, b: any) => a.variation - b.variation);
          }
        });

        setKSensResults(results);
      } else {
        throw new Error('KSens API failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback or error handling
    } finally {
      setIsAnalyzing(false);
    }
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
        <div className="table-responsive border border-gray-200 rounded-lg overflow-hidden mt-4">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="px-2 sm:px-3 py-2 text-xs font-normal text-black text-center whitespace-nowrap">Variation</TableHead>
                {alternatives.map(alt => (
                  <TableHead key={alt.name} className="px-2 sm:px-3 py-2 text-xs font-normal text-black text-center whitespace-nowrap">{alt.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {heatmapData.map((row: any, rIdx: number) => (
                <TableRow key={rIdx} className={`${rIdx !== heatmapData.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <TableCell className="px-2 sm:px-3 py-1 sm:py-1.5 font-normal text-xs text-black text-center whitespace-nowrap">{row.variation}</TableCell>
                  {alternatives.map((alt) => {
                    const value = row[alt.name];
                    const allValues = Object.values(row).filter(v => typeof v === 'number') as number[];
                    const maxValue = Math.max(...allValues);
                    const intensity = Math.floor((value / maxValue) * 255);
                    return (
                      <TableCell
                        key={alt.name}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-center text-xs"
                        style={{
                          backgroundColor: `rgb(${255 - intensity}, ${255 - intensity / 2}, ${255})`,
                          color: intensity > 150 ? 'white' : 'black'
                        }}
                      >
                        {value.toFixed(4)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      <div className="mb-8">
        <h3 className="text-[8px] sm:text-sm mb-3 text-black">
          Sensitivity Analysis for {criterionName} (Base Weight: {((criterionData?.weight || 0) * 100).toFixed(2)}%)
        </h3>
        <div className="table-responsive border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-[7px] sm:text-xs">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-1 sm:px-3 py-1 sm:py-2 border-r border-gray-200 text-black font-semibold text-left">
                  Weight
                </th>
                {alternatives.map((alt) => (
                  <th key={alt.name} className="px-1 sm:px-3 py-1 sm:py-2 border-r border-gray-200 text-black font-semibold text-center">
                    {alt.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kSensResults[criterionName].map((varData: any, idx: number) => (
                <tr key={varData.variation} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-1 sm:px-3 py-1 sm:py-2 font-medium text-black border-r border-gray-200">
                    {varData.variation > 0 ? '+' : ''}{varData.variation}%
                  </td>
                  {alternatives.map((alt) => (
                    <td key={alt.name} className="px-1 sm:px-3 py-0.5 sm:py-1 text-center text-black border-r border-gray-200">
                      <div className="flex flex-col leading-tight">
                        {(kSensTableDisplayStyle === 'both' || kSensTableDisplayStyle === 'rank') && (
                          <span className="font-semibold text-[7px] sm:text-xs text-black">
                            {kSensTableDisplayStyle === 'both' ? '#' : ''}{varData.rankings[alt.name]?.rank}
                          </span>
                        )}
                        {(kSensTableDisplayStyle === 'both' || kSensTableDisplayStyle === 'score') && (
                          <span className={`${kSensTableDisplayStyle === 'both' ? 'text-[6px] sm:text-[10px] text-gray-500 font-normal' : 'text-[7px] sm:text-xs font-semibold text-black'}`}>
                            {kSensTableDisplayStyle === 'both' ? `(${varData.rankings[alt.name]?.score.toFixed(4)})` : varData.rankings[alt.name]?.score.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      {(isAnalyzing || isCalculatingWeights) && (
        <div className="processing-ring-overlay">
          <div className="processing-ring-container">
            <div className="premium-spinner">
              {[...Array(12)].map((_, i) => (
                <div key={i}></div>
              ))}
            </div>
          </div>
          <p className="processing-text">
            {isAnalyzing ? "Running K% Sensitivity Analysis..." : "Calculating Weights..."}
          </p>
        </div>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
          .latex {
            font-size: 0.875rem !important;
            line-height: 2 !important; 
            margin: 1rem 0;
            display: block;
            color: currentColor;
          }
          .latex mjx-container {
            font-size: 0.875rem !important;
            max-width: 100% !important;
            overflow-x: auto;
            overflow-y: hidden;
            
            margin: 0.75rem 0 !important;
            padding: 0.5rem 0 !important;
            text-align: center !important; 
          }
          .latex mjx-math {
            font-size: 0.875rem !important;
            outline: none !important;
          }
          /* Formula box styling */
          .formula-box {
            padding: 1.5rem !important;
            margin: 1rem 0 !important;
            display: block !important;
            width: 100% !important;
            overflow-x: auto;
            border-radius: 0.5rem;
          }

          /* Mobile adjustments */
          @media (max-width: 640px) {
            .formula-box {
              padding: 0.5rem !important;
              margin: 0.5rem 0 !important;
            }
            .latex {
              font-size: 0.75rem !important;
            }
            .latex mjx-container {
              margin: 0.25rem 0 !important;
              padding: 0.25rem 0 !important;
            }
          }
        `
      }} />
      <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-black">K% Sensitivity Analysis</CardTitle>
          <CardDescription className="text-xs text-gray-700 flex flex-wrap items-center gap-1">
            <span>Step-by-step guided sensitivity analysis with customizable variation ranges</span>
            <a
              href="#"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
              onClick={(e) => { e.preventDefault(); setShowFormula(!showFormula); }}
            >
              General formula for Sensitivity analysis methodology
              <span className="text-gray-500 text-[10px]">{showFormula ? '▼' : '▶'}</span>
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Formula Section Content */}
            {showFormula && (
              <div className="p-4 space-y-4 border rounded-lg bg-gray-50">
                {/* Step 1: General Formula */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-gray-900 mb-3">1. General Formula for sk% Sensitivity Analysis</h4>
                  <div className="space-y-3 text-xs text-gray-700">
                    <div>
                      <p className="font-semibold mb-2">Let:</p>
                      <div className="ml-4 space-y-2">
                        <div>
                          <strong>Base weights:</strong>
                          <div className="bg-gray-50 rounded-lg mt-1 p-2">
                            <div className="latex text-sm" dangerouslySetInnerHTML={{ __html: `\\[w_j, \\quad j = 1, 2, \\ldots, n, \\quad \\sum_{j=1}^{n} w_j = 1\\]` }} />
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <strong>Suppose weight of criterion </strong>
                            <span className="latex" dangerouslySetInnerHTML={{ __html: `\\(C_p\\)` }} />
                            <strong> is varied by ±k%</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Modify selected criterion */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-gray-900 mb-3">Step-1: Modify selected criterion</h4>
                  <div className="bg-white rounded p-4 border border-purple-100">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[w_p^{(k)} = w_p \\times \\left(1 \\pm \\frac{k}{100}\\right)\\]` }} />
                  </div>
                </div>

                {/* Step 3: Compute remaining weight mass */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-gray-900 mb-3">Step-2: Compute remaining weight mass</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-4 border border-green-100">
                      <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[R = 1 - w_p^{(k)}\\]` }} />
                    </div>
                    <p className="text-xs text-gray-600 italic text-center">Original remaining weights sum:</p>
                    <div className="bg-white rounded p-4 border border-green-100">
                      <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[S = \\sum_{j \\neq p} w_j\\]` }} />
                    </div>
                  </div>
                </div>

                {/* Step 4: Proportional re-scaling factor */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-gray-900 mb-3">Step-3: Proportional re-scaling factor</h4>
                  <div className="bg-white rounded p-4 border border-yellow-100">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[\\lambda = \\frac{R}{S}\\]` }} />
                  </div>
                </div>

                {/* Step 5: Adjust remaining weights */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-gray-900 mb-3">Step-4: Adjust remaining weights</h4>
                  <div className="bg-white rounded p-4 border border-red-100">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[w_j^{(k)} = \\lambda \\times w_j, \\quad \\forall j \\neq p\\]` }} />
                  </div>
                </div>

                {/* Step 6: Validity check */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-gray-900 mb-3">Step-5: Validity check</h4>
                  <div className="bg-white rounded p-4 border border-teal-100">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[\\sum_{j=1}^{n} w_j^{(k)} = 1\\]` }} />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-100 border border-green-300 rounded p-2">
                    <span className="text-lg">✓</span>
                    <p className="font-semibold">This procedure is standard, reviewer-accepted, and avoids bias.</p>
                  </div>
                </div>
              </div>
            )}

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
                        <SelectContent className="max-h-[300px]">
                          <SelectGroup>
                            <SelectLabel className="text-xs font-bold text-blue-600 px-2 py-1.5 bg-blue-50/50">Objective Weights</SelectLabel>
                            <SelectItem value="equal" className="text-sm pl-6">Equal Weight</SelectItem>
                            <SelectItem value="entropy" className="text-sm pl-6">Entropy Weight</SelectItem>
                            <SelectItem value="critic" className="text-sm pl-6">CRITIC Weight</SelectItem>
                            <SelectItem value="merec" className="text-sm pl-6">MEREC Weight</SelectItem>
                            <SelectItem value="wenslo" className="text-sm pl-6">WENSLO Weight</SelectItem>
                            <SelectItem value="lopcow" className="text-sm pl-6">LOPCOW Weight</SelectItem>
                            <SelectItem value="dematel" className="text-sm pl-6">DEMATEL Weight</SelectItem>
                            <SelectItem value="sd" className="text-sm pl-6">SD Weight</SelectItem>
                            <SelectItem value="variance" className="text-sm pl-6">Variance Weight</SelectItem>
                            <SelectItem value="mad" className="text-sm pl-6">MAD Weight</SelectItem>
                            <SelectItem value="distance" className="text-sm pl-6">Distance-based Weight</SelectItem>
                            <SelectItem value="svp" className="text-sm pl-6">SVP Weight</SelectItem>
                            <SelectItem value="mdm" className="text-sm pl-6">MDM Weight</SelectItem>
                            <SelectItem value="lsw" className="text-sm pl-6">LSW Weight</SelectItem>
                            <SelectItem value="gpow" className="text-sm pl-6">GPOW Weight</SelectItem>
                            <SelectItem value="lpwm" className="text-sm pl-6">LPWM Weight</SelectItem>
                            <SelectItem value="pcwm" className="text-sm pl-6">PCWM Weight</SelectItem>
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel className="text-xs font-bold text-purple-600 px-2 py-1.5 bg-purple-50/50 mt-1">Subjective Weights</SelectLabel>
                            <SelectItem value="ahp" className="text-sm pl-6">AHP Weight</SelectItem>
                            <SelectItem value="piprecia" className="text-sm pl-6">PIPRECIA Weight</SelectItem>
                            <SelectItem value="swara" className="text-sm pl-6">SWARA Weight</SelectItem>
                            <SelectItem value="roc" className="text-sm pl-6">ROC Weight</SelectItem>
                            <SelectItem value="rr" className="text-sm pl-6">RR Weight</SelectItem>
                            <SelectItem value="custom" className="text-sm pl-6">Enter Own Weight</SelectItem>
                          </SelectGroup>
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
                  {selectedWeightMethod !== 'equal' && !['ahp', 'piprecia', 'swara', 'roc', 'rr', 'custom'].includes(selectedWeightMethod) && (
                    <div className="mb-4">
                      <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        Objective Weights
                      </div>
                    </div>
                  )}

                  {/* Manual Weight Input for Subjective Methods */}
                  {['ahp', 'piprecia', 'swara', 'roc', 'rr', 'custom'].includes(selectedWeightMethod) && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                          Subjective Weights - {selectedWeightMethod.toUpperCase()}
                        </div>
                      </div>
                      <p className="text-xs font-semibold mb-3 text-black">Enter Weights Manually:</p>
                      <p className="text-xs text-gray-600 mb-3 italic">
                        Enter your preferred weights for each criterion below. The weights will be automatically normalized to sum to 1.
                      </p>
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
                        className="mt-3 bg-purple-600 text-white hover:bg-purple-700 text-xs h-7"
                        size="sm"
                      >
                        Apply Weights
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b">
                      <div className="flex gap-2">
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

                      {kSensActiveTab === 'tables' && (
                        <div className="flex items-center gap-2 pb-2 sm:pb-0">
                          <span className="text-[10px] font-medium text-gray-500">Display:</span>
                          <Select value={kSensTableDisplayStyle} onValueChange={(v: any) => setKSensTableDisplayStyle(v)}>
                            <SelectTrigger className="w-32 h-7 text-[10px] border-gray-200">
                              <SelectValue placeholder="Display Style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rank" className="text-[10px]">Rank Only</SelectItem>
                              <SelectItem value="score" className="text-[10px]">Score Only</SelectItem>
                              <SelectItem value="both" className="text-[10px]">Rank & Score</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
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
                      <div className="space-y-6">
                        {criteria.map((crit) => (
                          <div key={crit.id} className="pt-2">
                            {generateKSensRankingTable(crit.name)}
                          </div>
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

      {/* ROC Weight Calculator Dialog */}
      <Dialog open={isRocDialogOpen} onOpenChange={setIsRocDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>ROC Weight Calculator</DialogTitle>
            <DialogDescription className="text-xs">
              Enter the rank order for each criterion (1 = most important).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold">Criterion</TableHead>
                    <TableHead className="text-xs font-semibold text-center w-24">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criteria.map((crit) => (
                    <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell className="py-2 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                      <TableCell className="text-center py-2 px-4 text-xs text-black">
                        <Input
                          type="number"
                          min="1"
                          max={criteria.length}
                          className="w-16 h-7 text-xs text-center mx-auto"
                          value={rankValues[crit.id] || ""}
                          onChange={(e) => setRankValues(prev => ({ ...prev, [crit.id]: parseInt(e.target.value) || 0 }))}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 leading-tight">
                <strong>Note:</strong> Ranks should be between 1 and {criteria.length}. Different criteria can have the same rank if they are equally important.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsRocDialogOpen(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRocCalculation}
              className="bg-black text-white hover:bg-gray-800 text-xs h-8"
            >
              Calculate Weights
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RR Weight Calculator Dialog */}
      <Dialog open={isRrDialogOpen} onOpenChange={setIsRrDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>RR Weight Calculator</DialogTitle>
            <DialogDescription className="text-xs">
              Enter the rank order for each criterion (1 = most important).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold">Criterion</TableHead>
                    <TableHead className="text-xs font-semibold text-center w-24">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criteria.map((crit) => (
                    <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell className="py-2 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                      <TableCell className="text-center py-2 px-4 text-xs text-black">
                        <Input
                          type="number"
                          min="1"
                          max={criteria.length}
                          className="w-16 h-7 text-xs text-center mx-auto"
                          value={rankValues[crit.id] || ""}
                          onChange={(e) => setRankValues(prev => ({ ...prev, [crit.id]: parseInt(e.target.value) || 0 }))}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 leading-tight">
                <strong>Note:</strong> Ranks should be between 1 and {criteria.length}. Different criteria can have the same rank if they are equally important.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsRrDialogOpen(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRrCalculation}
              className="bg-black text-white hover:bg-gray-800 text-xs h-8"
            >
              Calculate Weights
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SWARA Weight Calculator Dialog */}
      <Dialog open={isSwaraDialogOpen} onOpenChange={setIsSwaraDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>SWARA Weight Calculator</DialogTitle>
            <DialogDescription className="text-xs">
              Enter comparative importance coefficients (sj) for each criterion. The first criterion is most important (s₁ = 0). Higher values indicate larger importance differences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold">Rank</TableHead>
                    <TableHead className="text-xs font-semibold">Criterion</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Coefficient (s_j)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criteria.map((crit, index) => (
                    <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell className="py-2 px-4 text-xs">{index + 1}</TableCell>
                      <TableCell className="py-2 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                      <TableCell className="text-center py-2 px-4 text-xs text-black">
                        {index === 0 ? (
                          <span className="text-gray-500 italic">0 (most important)</span>
                        ) : (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-20 h-7 mx-auto text-xs text-center"
                            value={swaraCoefficients[crit.id] || ""}
                            onChange={(e) => setSwaraCoefficients(prev => ({ ...prev, [crit.id]: parseFloat(e.target.value) || 0 }))}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 leading-tight">
                <strong>Note:</strong> Criteria are ordered by importance (top = most important). For each criterion j, enter how much less important it is compared to the previous criterion (j-1).
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsSwaraDialogOpen(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSwaraCalculation}
              className="bg-black text-white hover:bg-gray-800 text-xs h-8"
            >
              Calculate Weights
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Weights Dialog */}
      <Dialog open={selectedWeightMethod === 'custom' && isCalculatingWeights === false} onOpenChange={(open) => {
        if (!open) setSelectedWeightMethod('equal');
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Enter Custom Weights</DialogTitle>
            <DialogDescription className="text-xs">
              Enter a weight for each criterion. Weights will be automatically normalized to sum to 1.0.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold">Criterion</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criteria.map((crit) => (
                    <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell className="py-3 px-4 font-medium text-black text-sm">{crit.name}</TableCell>
                      <TableCell className="text-center py-3 px-4">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-32 h-9 text-sm text-center mx-auto"
                          placeholder="0.2"
                          value={customWeights[crit.id] || ""}
                          onChange={(e) => handleCustomWeightChange(crit.id, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900 leading-tight">
                <strong>Note:</strong> You can enter any positive numbers. The weights will be automatically normalized to sum to 1.0. For example, if you enter 3, 2, and 1, they will be normalized to 0.5, 0.33, and 0.17.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedWeightMethod('equal')}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                applyCustomWeights();
                setSelectedWeightMethod('equal'); // Close dialog
              }}
              className="bg-black text-white hover:bg-gray-800 text-xs h-8"
            >
              Apply Weights
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIPRECIA Weight Calculator Dialog */}
      <Dialog open={isPipreciaDialogOpen} onOpenChange={setIsPipreciaDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
          <DialogTitle>PIPRECIA Weight Calculator</DialogTitle>
          <PIPRECIAFormula
            criteria={criteria}
            initialScores={pipreciaScores}
            onScoresChange={setPipreciaScores}
            onWeightsCalculated={(weights) => {
              const newWeights = criteria.map(c => weights[c.id] || 0);
              const updated = criteria.map((c, idx) => ({
                ...c,
                weight: newWeights[idx]
              }));
              setWorkingCriteria(updated);
              setIsPipreciaDialogOpen(false);
              setKSensResults(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* AHP Weight Calculator Dialog */}
      <Dialog open={isAhpDialogOpen} onOpenChange={setIsAhpDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
          <DialogTitle>AHP Weight Calculator</DialogTitle>
          <AHPFormula
            criteria={criteria}
            initialMatrix={ahpMatrix}
            onMatrixChange={setAhpMatrix}
            onWeightsCalculated={(weights) => {
              setAhpWeights(criteria.map(c => weights[c.id] || 0));
              const newWeights = criteria.map(c => weights[c.id] || 0);
              const updated = criteria.map((c, idx) => ({
                ...c,
                weight: newWeights[idx]
              }));
              setWorkingCriteria(updated);
              setIsAhpDialogOpen(false);
              setKSensResults(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
