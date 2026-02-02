"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import AHPFormula from "./AHPFormula";
import PIPRECIAFormula from "./PIPRECIAFormula";
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { Check, ChevronRight, Download, RefreshCw, Loader2, Sparkles, Bot, FileText } from 'lucide-react';
import ExcelJS from 'exceljs';
import ReactMarkdown from 'react-markdown';
import { AIResearchAssistant } from './AIResearchAssistant';
import { toJpeg } from 'html-to-image';


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
  onAiAnalysis?: (data: any) => void;
  aiAnalysisResult?: string | null;
  isAiLoading?: boolean;
  showAiPanel?: boolean;
  onCloseAiPanel?: () => void;
}

export default function KSensitivityCalculator({
  criteria,
  alternatives,
  weightMethod = "Custom",
  onAiAnalysis,
  aiAnalysisResult,
  isAiLoading,
  showAiPanel,
  onCloseAiPanel
}: KSensitivityCalculatorProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [kSensVariationRange, setKSensVariationRange] = useState<number[]>([-30, -20, -10, 0, 10, 20, 30]);
  const [kSensChartType, setKSensChartType] = useState<string>('line');
  const [kSensResults, setKSensResults] = useState<any>(null);
  const [kSensActiveTab, setKSensActiveTab] = useState<'results' | 'tables'>('results');
  const [kSensTableDisplayStyle, setKSensTableDisplayStyle] = useState<'both' | 'rank' | 'score'>('both');
  const [showConfig, setShowConfig] = useState<boolean>(true);
  const [selectedCriterionToVary, setSelectedCriterionToVary] = useState<string>(''); // New state for criterion selection
  const [kSensViewType, setKSensViewType] = useState<'ranking' | 'weight'>('ranking'); // New state for view type

  // Separate AI Analysis States for Reports and Abstracts
  const [aiReportResult, setAiReportResult] = useState<string | null>(null);
  const [aiAbstractResult, setAiAbstractResult] = useState<string | null>(null);
  const [isAiReportLoading, setIsAiReportLoading] = useState<boolean>(false);
  const [isAiAbstractLoading, setIsAiAbstractLoading] = useState<boolean>(false);
  const [showAiReportPanel, setShowAiReportPanel] = useState<boolean>(false);
  const [showAiAbstractPanel, setShowAiAbstractPanel] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);


  // Weight method state
  const [selectedWeightMethod, setSelectedWeightMethod] = useState<string>('equal');
  const [workingCriteria, setWorkingCriteria] = useState<Criterion[]>(criteria);
  const [customWeights, setCustomWeights] = useState<{ [key: string]: number }>({});
  const [isCalculatingWeights, setIsCalculatingWeights] = useState<boolean>(false);
  const [selectedAltIds, setSelectedAltIds] = useState<string[]>(alternatives.map(a => a.id));

  // Ranking method state
  const [selectedRankingMethod, setSelectedRankingMethod] = useState<string>('topsis');
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

  // Data validation state
  const [showDataWarning, setShowDataWarning] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  // Helper function to check if valid data exists
  const hasValidData = (): boolean => {
    // Check if we have criteria and alternatives
    if (!criteria || criteria.length === 0 || !alternatives || alternatives.length === 0) {
      return false;
    }

    // Check if alternatives have actual score data (not empty)
    const hasScores = alternatives.some(alt => {
      const scores = Object.values(alt.scores);
      return scores.some(score => score !== "" && score !== null && score !== undefined);
    });

    return hasScores;
  };

  // Helper function to check if all values are greater than zero (for SWEI/SWI)
  const hasAllPositiveValues = (): { isValid: boolean; invalidCells: string[] } => {
    const invalidCells: string[] = [];

    alternatives.forEach((alt) => {
      criteria.forEach((crit) => {
        const value = alt.scores[crit.id];
        if (value === undefined || value === "" || Number(value) <= 0) {
          invalidCells.push(`${alt.name} - ${crit.name}`);
        }
      });
    });

    return { isValid: invalidCells.length === 0, invalidCells };
  };

  // Handler for AI Report generation
  const handleAiReportGeneration = async (data: any) => {
    setIsAiReportLoading(true);
    setShowAiReportPanel(true);

    try {
      // Compute ranking from K-sens results
      const criterionName = data.criterionName;
      const baseResults = data.kSensData?.results?.['0'] || {};
      const ranking = Object.entries(baseResults).map(([altName, score]: [string, any]) => ({
        alternativeName: altName,
        score: typeof score === 'number' ? score : 0
      })).sort((a, b) => b.score - a.score);

      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          alternatives,
          criteria: workingCriteria,
          method: selectedRankingMethod,
          ranking
        })
      });

      const result = await response.json();
      setAiReportResult(result.markdown || result.error);
    } catch (error) {
      setAiReportResult('Error generating AI report');
    } finally {
      setIsAiReportLoading(false);
    }
  };

  // Handler for Research Abstract generation
  const handleResearchAbstractGeneration = async (data: any) => {
    setIsAiAbstractLoading(true);
    setShowAiAbstractPanel(true);

    try {
      // Compute ranking from K-sens results
      const criterionName = data.criterionName;
      const baseResults = data.kSensData?.results?.['0'] || {};
      const ranking = Object.entries(baseResults).map(([altName, score]: [string, any]) => ({
        alternativeName: altName,
        score: typeof score === 'number' ? score : 0
      })).sort((a, b) => b.score - a.score);

      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          alternatives,
          criteria: workingCriteria,
          method: selectedRankingMethod,
          ranking
        })
      });

      const result = await response.json();
      setAiAbstractResult(result.markdown || result.error);
    } catch (error) {
      setAiAbstractResult('Error generating research abstract');
    } finally {
      setIsAiAbstractLoading(false);
    }
  };


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

  // Synchronize workingCriteria with criteria prop or apply selected weight method
  useEffect(() => {
    if (selectedWeightMethod === 'equal' && criteria.length > 0) {
      const equalWeight = 1 / criteria.length;
      setWorkingCriteria(criteria.map(c => ({ ...c, weight: equalWeight })));
    } else {
      setWorkingCriteria(criteria);
    }
  }, [criteria, selectedWeightMethod]);

  // Set default criterion to vary when criteria are loaded
  useEffect(() => {
    if (workingCriteria.length > 0 && !selectedCriterionToVary) {
      setSelectedCriterionToVary(workingCriteria[0].id);
    }
  }, [workingCriteria]);

  // Auto-calculate sensitivity analysis on load if data is valid
  useEffect(() => {
    if (hasValidData() && selectedCriterionToVary && !kSensResults && !isAnalyzing) {
      performKSensitivityAnalysis();
    }
  }, [selectedCriterionToVary, criteria, alternatives, selectedRankingMethod, selectedWeightMethod]);

  // Auto-recalculate when weight method or actual weight values change (in results view)
  useEffect(() => {
    if (kSensResults && hasValidData()) {
      setKSensResults(null); // Clear old results to prevent displaying stale data
      const timer = setTimeout(() => {
        performKSensitivityAnalysis();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedWeightMethod, JSON.stringify(workingCriteria.map(c => c.weight))]);

  // Auto-recalculate when ranking method changes (in results view)
  useEffect(() => {
    if (kSensResults && hasValidData()) {
      setKSensResults(null); // Clear old results
      performKSensitivityAnalysis();
    }
  }, [selectedRankingMethod]);

  // Auto-recalculate when criterion to vary changes (in results view)
  useEffect(() => {
    if (kSensResults && hasValidData() && selectedCriterionToVary) {
      setKSensResults(null); // Clear old results
      performKSensitivityAnalysis(undefined, undefined, selectedCriterionToVary);
    }
  }, [selectedCriterionToVary]);

  // Auto-recalculate when variation range changes (in results view)
  useEffect(() => {
    if (kSensResults && hasValidData()) {
      setKSensResults(null); // Clear old results
      const timer = setTimeout(() => {
        performKSensitivityAnalysis();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [JSON.stringify(kSensVariationRange)]);

  // Handle ranking method change
  const handleRankingMethodChange = (method: string) => {
    if (!hasValidData()) {
      setShowDataWarning(true);
      setTimeout(() => setShowDataWarning(false), 3000);
      return;
    }

    // Validate for SWEI/SWI methods
    if (method === 'swei' || method === 'swi') {
      const validation = hasAllPositiveValues();
      if (!validation.isValid) {
        const methodName = method.toUpperCase();
        setValidationError(`${methodName} method requires all values to be greater than zero. Please check your decision matrix.`);
        setTimeout(() => setValidationError(''), 5000);
        return;
      }
    }

    setSelectedRankingMethod(method);
    // Auto-recalculation is now handled by useEffect
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
    if (!hasValidData()) {
      setShowDataWarning(true);
      setTimeout(() => setShowDataWarning(false), 3000);
      return;
    }

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
      return;
    }

    // For objective methods, calculate automatically
    setSelectedWeightMethod(method);
    await calculateWeights(method);
    // Auto-recalculation is now handled by useEffect
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
    // Auto-recalculation is now handled by useEffect
  };

  // Handle ROC weight calculation from dialog
  const handleRocCalculation = async () => {
    setIsRocDialogOpen(false);
    await calculateWeights('roc');
    // Auto-recalculation is now handled by useEffect
  };

  // Handle RR weight calculation from dialog
  const handleRrCalculation = async () => {
    setIsRrDialogOpen(false);
    await calculateWeights('rr');
    // Auto-recalculation is now handled by useEffect
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
        // Auto-recalculation is now handled by useEffect
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

  const downloadChartAsJpeg = () => {
    if (!chartRef.current) return;

    // Use a slightly larger pixel ratio for better quality
    toJpeg(chartRef.current, {
      quality: 1.0,
      backgroundColor: "#ffffff",
      pixelRatio: 4,
      style: {
        padding: '20px'
      }
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        const criterionName = workingCriteria.find(c => c.id === selectedCriterionToVary)?.name || "Sensitivity";
        link.download = `sensitivity-analysis-${criterionName.replace(/\s+/g, '_').toLowerCase()}-${Date.now()}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        console.error("Error exporting chart", err);
        alert("Failed to export chart. Please try again.");
      });
  };

  const performKSensitivityAnalysis = async (altIdsOverride?: string[], rankingMethodOverride?: string, criterionIdOverride?: string) => {
    if (!hasValidData()) {
      setShowDataWarning(true);
      setTimeout(() => setShowDataWarning(false), 3000);
      return;
    }

    const currentRankingMethod = rankingMethodOverride || selectedRankingMethod;
    const currentCriterionId = criterionIdOverride || selectedCriterionToVary;

    // Validate criterion selection
    if (!currentCriterionId) {
      setValidationError('Please select a criterion to vary before running the analysis.');
      setTimeout(() => setValidationError(''), 5000);
      return;
    }

    // Validate for SWEI/SWI methods before starting analysis
    if (currentRankingMethod === 'swei' || currentRankingMethod === 'swi') {
      const validation = hasAllPositiveValues();
      if (!validation.isValid) {
        const methodName = currentRankingMethod.toUpperCase();
        setValidationError(`${methodName} method requires all values to be greater than zero. Please check your decision matrix.`);
        setTimeout(() => setValidationError(''), 5000);
        return;
      }
    }

    setIsAnalyzing(true);
    const targetAltIds = altIdsOverride || selectedAltIds;
    const targetAlts = alternatives.filter(a => targetAltIds.includes(a.id));

    try {
      // Prepare all analysis tasks for bulk processing - only for selected criterion
      const tasks: any[] = [];
      const selectedCriterion = workingCriteria.find(c => c.id === currentCriterionId);
      if (!selectedCriterion) {
        throw new Error('Selected criterion not found');
      }

      const critIdx = workingCriteria.findIndex(c => c.id === currentCriterionId);

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
          criterionName: selectedCriterion.name,
          variation,
          criteria: adjustedCriteria
        });
      });

      // Single high-speed bulk request
      const response = await fetch('/api/calculate-k-sens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: currentRankingMethod,
          alternatives: targetAlts,
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
        // Get error message from API response
        const errorData = await response.json();
        const errorMessage = errorData.error || 'KSens API failed';
        alert(errorMessage);
        // Don't throw - error already shown to user via alert
        return;
      }
    } catch (error) {
      // Only log unexpected errors (not validation errors which are shown via alert)
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateKSensChartData = (criterionName: string) => {
    if (!kSensResults || !kSensResults[criterionName]) return [];

    const chartData = kSensVariationRange.map(variation => {
      const dataPoint: any = { variation: `${variation}%` };
      const varData = (kSensResults[criterionName] || []).find((v: any) =>
        v.variation === variation || parseFloat(v.variation) === variation
      );

      // Track if we have complete data for this variation
      let hasCompleteData = !!varData;

      if (varData) {
        alternatives.forEach(alt => {
          if (varData.rankings && varData.rankings[alt.name]) {
            dataPoint[alt.name] = varData.rankings[alt.name].rank;
          } else {
            hasCompleteData = false;
          }
        });
      }

      // Mark data point as incomplete if missing any alternative data or variation not found
      dataPoint._incomplete = !hasCompleteData;
      return dataPoint;
    });

    // Filter out incomplete data points to prevent partial line rendering and empty points
    return chartData.filter(point => point._incomplete === false);
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

  const colors = [
    '#2563eb',
    '#3befecff',
    '#16a34a',
    '#9333ea',
    '#ea580c',
    '#1e3a8a',
    '#ca8a04',
    '#db2777'
  ];

  const calculateWeightSensitivityData = (criterionId: string) => {
    const critIdx = workingCriteria.findIndex(c => c.id === criterionId);
    if (critIdx === -1) return [];

    return kSensVariationRange.map(variation => {
      const adjustedWeights = [...workingCriteria.map(c => c.weight)];
      // Calculate adjusted weight for the varying criterion: w_p' = w_p * (1 + k/100)
      const variationFactor = 1 + (variation / 100);
      adjustedWeights[critIdx] = workingCriteria[critIdx].weight * variationFactor;

      // Logic: 
      // R = 1 - w_p' (remaining weight mass)
      // S = sum(w_j for j != p) (original remaining sum)
      // lambda = R / S (scaling factor)
      // w_j' = lambda * w_j (for j != p)

      let normalizedWeights = [...adjustedWeights];
      const newTargetWeight = adjustedWeights[critIdx];

      // Calculate sum of OTHER weights originally
      const otherWeightsSum = workingCriteria.reduce((sum, c, idx) => idx === critIdx ? sum : sum + c.weight, 0);

      if (otherWeightsSum > 0) {
        const remainingMass = 1 - newTargetWeight;
        const scalingFactor = remainingMass / otherWeightsSum;

        normalizedWeights = adjustedWeights.map((w, idx) => {
          if (idx === critIdx) return newTargetWeight;
          return workingCriteria[idx].weight * scalingFactor;
        });
      } else {
        // Edge case: only 1 criterion or others are 0
        normalizedWeights = adjustedWeights; // Fallback
      }

      // Safety normalization to ensure sum is exactly 1 (fix float precision)
      const totalSum = normalizedWeights.reduce((a, b) => a + b, 0);
      if (totalSum > 0) {
        normalizedWeights = normalizedWeights.map(w => w / totalSum);
      }

      const dataPoint: any = { variation: `${variation}%` };
      workingCriteria.forEach((c, idx) => {
        dataPoint[c.name] = normalizedWeights[idx];
      });
      return dataPoint;
    });
  };

  const renderWeightTable = (criterion: Criterion) => {
    const data = calculateWeightSensitivityData(criterion.id);
    if (!data.length) return null;

    return (
      <div key={`weight-table-${criterion.id}`} className="mb-8">
        <h3 className="text-[8px] sm:text-sm mb-3 text-black">
          Weight Sensitivity Analysis for {criterion.name} (Base Weight: {(criterion.weight * 100).toFixed(2)}%)
        </h3>
        <div className="table-responsive border border-gray-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="px-2 sm:px-3 py-2 text-xs font-semibold text-black text-center whitespace-nowrap border-r w-24">Variation</TableHead>
                {workingCriteria.map(c => (
                  <TableHead key={c.id} className="px-2 sm:px-3 py-2 text-xs font-semibold text-black text-center whitespace-nowrap border-r">{c.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row: any, rIdx: number) => (
                <TableRow key={rIdx} className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className={`px-2 sm:px-3 py-1.5 font-medium text-xs text-center border-r ${parseFloat(row.variation) < 0 ? 'bg-red-50 text-red-700' : parseFloat(row.variation) > 0 ? 'bg-green-50 text-green-700' : 'text-black'
                    }`}>
                    {parseFloat(row.variation) > 0 ? '+' : ''}{row.variation}
                  </TableCell>
                  {workingCriteria.map(c => (
                    <TableCell key={c.id} className="px-2 sm:px-3 py-1.5 text-xs text-center border-r">
                      {(row[c.name] * 100).toFixed(2)}%
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

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
      margin: { top: 20, right: 30, left: 60, bottom: 60 }
    };

    if (kSensChartType === 'heatmap') {
      if (isWeightView) return <div className="p-4 text-center text-gray-500 text-xs">Heatmap view not available for Weight Analysis.</div>;
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
      if (isWeightView) return <div className="p-4 text-center text-gray-500 text-xs">Radar chart not available for Weight Analysis.</div>;
      const radarData = alternatives.map(alt => ({
        alternative: alt.name,
        ...Object.fromEntries(
          kSensVariationRange.map((v, vIdx) => [
            `${v}%`,
            kSensResults[criterionName][vIdx].rankings[alt.name]?.rank || 0
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
      <div ref={chartRef} className="bg-white">
        <ResponsiveContainer width="100%" height={400}>
          {['line', 'area'].includes(kSensChartType) ? (
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="variation" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
              <YAxis
                reversed={false}
                tick={{ fontSize: 10, fill: '#333' }}
                width={50}
                domain={isWeightView ? [0, 'auto'] : [0, alternatives.length]}
                allowDecimals={isWeightView}
                tickCount={isWeightView ? undefined : alternatives.length + 1}
              >
                <Label
                  value={isWeightView ? 'Criterion Weight' : 'Alternative Rank'}
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: '#374151', fontSize: '11px', fontWeight: 700 }}
                  offset={-15}
                />
              </YAxis>

              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
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
                    fill={kSensChartType === 'area' ? colors[altIdx % colors.length] : undefined}
                    fillOpacity={kSensChartType === 'area' ? 0.3 : undefined}
                  />
                )))}
            </LineChart>
          ) : kSensChartType === 'scatter' ? (
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="Variation Index" tick={{ fontSize: 10 }} />
              <YAxis
                reversed={false}
                type="number"
                dataKey="y"
                name={isWeightView ? "Weight" : "Rank"}
                tick={{ fontSize: 10, fill: '#333' }}
                width={50}
                domain={isWeightView ? [0, 'auto'] : [0, alternatives.length]}
                allowDecimals={isWeightView}
                tickCount={isWeightView ? undefined : alternatives.length + 1}
              >
                <Label
                  value={isWeightView ? 'Criterion Weight' : 'Alternative Rank'}
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: '#374151', fontSize: '11px', fontWeight: 700 }}
                  offset={-15}
                />
              </YAxis>
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
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
                  <YAxis
                    tick={{ fontSize: 10, fill: '#333' }}
                    width={50}
                    domain={isWeightView ? [0, 'auto'] : [0, alternatives.length]}
                    allowDecimals={isWeightView}
                    tickCount={isWeightView ? undefined : alternatives.length + 1}
                  >
                    <Label
                      value={isWeightView ? 'Criterion Weight' : 'Alternative Rank'}
                      angle={-90}
                      position="insideLeft"
                      style={{ textAnchor: 'middle', fill: '#374151', fontSize: '11px', fontWeight: 700 }}
                      offset={-15}
                    />
                  </YAxis>

                </>
              )}
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              {isWeightView ? (
                workingCriteria.map((crit, idx) => (
                  <Bar key={crit.name} dataKey={crit.name} fill={colors[idx % colors.length]} />
                ))
              ) : (
                alternatives.map((alt, altIdx) => (
                  <Bar key={alt.name} dataKey={alt.name} fill={colors[altIdx % colors.length]} />
                )))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const downloadAllTables = async () => {
    if (!kSensResults) return;

    const workbook = new ExcelJS.Workbook();
    const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '/'); // DD/MM/YYYY

    // Loop through all working criteria to create sheets for each
    workingCriteria.forEach(selectedCrit => {
      const criterionName = selectedCrit.name;
      const data = kSensResults[criterionName];
      if (!data) return;

      const sheetName = criterionName.replace(/[\\/*?[\]]/g, '').substring(0, 31) || "Criterion";
      const worksheet = workbook.addWorksheet(sheetName);

      // Remove gridlines from the sheet
      worksheet.views = [
        { showGridLines: false }
      ];

      // Define columns with better widths to prevent clipping
      const cols = [
        { width: 30 }, // Column A - Weight Variation / Metadata labels
        { width: 20 }, // Column B - Metadata values (date, methods, etc.)
        ...alternatives.slice(1).map(() => ({ width: 15 })) // Remaining alternative columns
      ];
      worksheet.columns = cols;

      // Row 1: DECISION ALGO header with blue background
      const titleRow = worksheet.addRow(["DECISION ALGO"]);
      worksheet.mergeCells(`A1:${String.fromCharCode(64 + alternatives.length + 1)}1`);
      const titleCell = titleRow.getCell(1);
      titleCell.font = { name: 'Cambria', bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' } // Blue background
      };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      titleCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      titleRow.height = 25;

      // Row 2: Empty row
      worksheet.addRow([]);

      // Rows 3-8: Metadata section
      const metadataRows = [
        [`K% Sensitivity Analysis Report - ${criterionName}`, `Date: ${date}`],
        ["Weight Method", selectedWeightMethod.toUpperCase()],
        ["Ranking Method", selectedRankingMethod.toUpperCase()],
        ["Number of Alternatives", alternatives.length.toString()],
        ["Project Id:", "Test A"],
        ["User Id:", "Test B"]
      ];

      metadataRows.forEach((rowData) => {
        const row = worksheet.addRow(rowData);
        row.height = 25;

        const labelCell = row.getCell(1);
        labelCell.font = { name: 'Cambria', bold: true, size: 11 };
        labelCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        labelCell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };

        const valueCell = row.getCell(2);
        valueCell.font = { name: 'Cambria', size: 11 };
        valueCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        valueCell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });

      worksheet.addRow([]);

      // Table Header
      const tableHeader = ["Weight Variation", ...alternatives.map(alt => alt.name)];
      const headerRow = worksheet.addRow(tableHeader);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Cambria', bold: true, size: 11 };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });

      // Data Rows
      data.forEach((varData: any) => {
        const rowData = [
          `${varData.variation > 0 ? '+' : ''}${varData.variation}%`,
          ...alternatives.map(alt => {
            const rank = varData.rankings[alt.name]?.rank;
            const score = varData.rankings[alt.name]?.score ? varData.rankings[alt.name].score.toFixed(4) : "-";
            if (kSensTableDisplayStyle === 'rank') return rank;
            if (kSensTableDisplayStyle === 'score') return score;
            return `#${rank} (${score})`;
          })
        ];

        const dataRow = worksheet.addRow(rowData);
        dataRow.height = 20;
        dataRow.eachCell((cell, colNumber) => {
          cell.font = { name: 'Cambria', size: 11 };
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };

          if (colNumber === 1 && varData.variation < 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
          }
        });
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `K_Sensitivity_Results_All_Criteria_${selectedRankingMethod}_${selectedWeightMethod}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const renderKSensTable = (criterionName: string) => {
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

      {/* Data Validation Warning */}
      {showDataWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-white">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-sm">No Data Available!</p>
                <p className="text-xs mt-1">Upload data first, then proceed further</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SWEI/SWI Validation Error */}
      {validationError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-white max-w-md">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-sm">Validation Error!</p>
                <p className="text-xs mt-1">{validationError}</p>
              </div>
            </div>
          </div>
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

            {/* Horizontal Process Flow */}
            <div className="mb-6">
              <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 text-black px-2 sm:px-4">Follow the steps to get the sensitivity analysis:</h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3 sm:p-6 shadow-sm overflow-x-auto">
                <div className="flex items-center justify-between gap-0 min-w-max">
                  {/* Step 1: Select */}
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center justify-center flex-1 px-1 sm:px-3">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-1 sm:mb-2 shadow-md">
                        <span className="text-white text-sm sm:text-2xl">🚀</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-center text-gray-800 whitespace-nowrap">Select</span>
                    </div>
                    <div className="flex items-center justify-center px-1 sm:px-2 pb-3 sm:pb-6">
                      <span className="text-xl sm:text-4xl text-blue-400">→</span>
                    </div>
                  </div>

                  {/* Step 2: Weight Method */}
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center justify-center flex-1 px-1 sm:px-3">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-1 sm:mb-2 shadow-md">
                        <span className="text-white text-sm sm:text-xl font-bold">W</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-center text-gray-800 whitespace-nowrap">Weight Method</span>
                    </div>
                    <div className="flex items-center justify-center px-1 sm:px-2 pb-3 sm:pb-6">
                      <span className="text-xl sm:text-4xl text-blue-400">→</span>
                    </div>
                  </div>

                  {/* Step 3: Ranking Method */}
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center justify-center flex-1 px-1 sm:px-3">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-1 sm:mb-2 shadow-md">
                        <span className="text-white text-sm sm:text-xl font-bold">R</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-center text-gray-800 whitespace-nowrap">Ranking Method</span>
                    </div>
                    <div className="flex items-center justify-center px-1 sm:px-2 pb-3 sm:pb-6">
                      <span className="text-xl sm:text-4xl text-blue-400">→</span>
                    </div>
                  </div>

                  {/* Step 4: Criterion to Vary */}
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center justify-center flex-1 px-1 sm:px-3">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-1 sm:mb-2 shadow-md">
                        <span className="text-white text-sm sm:text-xl font-bold">C</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-center text-gray-800 whitespace-nowrap">Criterion to Vary</span>
                    </div>
                    <div className="flex items-center justify-center px-1 sm:px-2 pb-3 sm:pb-6">
                      <span className="text-xl sm:text-4xl text-blue-400">→</span>
                    </div>
                  </div>

                  {/* Step 5: Quick Presets */}
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center justify-center flex-1 px-1 sm:px-3">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-1 sm:mb-2 shadow-md">
                        <span className="text-white text-sm sm:text-xl font-bold">Q</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-center text-gray-800 whitespace-nowrap">Quick Presets</span>
                    </div>
                    <div className="flex items-center justify-center px-1 sm:px-2 pb-3 sm:pb-6">
                      <span className="text-xl sm:text-4xl text-blue-400">→</span>
                    </div>
                  </div>

                  {/* Step 6: Run Analysis */}
                  <div className="flex items-center flex-1">
                    <div className="flex flex-col items-center justify-center flex-1 px-1 sm:px-3">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center mb-1 sm:mb-2 shadow-md">
                        <span className="text-white text-sm sm:text-2xl">🔬</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-center text-gray-800 whitespace-nowrap">Run K% Sensitivity</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Section */}
            {showConfig && (
              <div className="space-y-4">

                {/* Weight & Ranking Method Selectors - Side by Side */}
                <div className="space-y-6">
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
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                    <h4 className="text-[12px] sm:text-xs font-semibold mb-1.5 sm:mb-3 text-gray-700">Current Weights</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {workingCriteria.map((crit) => (
                        <div key={crit.id} className="bg-white rounded p-1 sm:p-2.5 border border-gray-200 flex-shrink-0">
                          <div className="text-[9px] sm:text-xs font-medium text-gray-700 mb-0.5 sm:mb-1 whitespace-nowrap">{crit.name}</div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-[9px] sm:text-xs font-bold text-blue-600 whitespace-nowrap">{(crit.weight * 100).toFixed(2)}%</span>
                            <span className={`text-[9px] sm:text-xs ${crit.type === 'beneficial' ? 'text-green-600' : 'text-red-600'}`}>
                              {crit.type === 'beneficial' ? '↑' : '↓'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Criterion Selector for Variation */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
                    <label className="block text-xs font-semibold mb-2 text-gray-700">Select Criterion to Vary</label>
                    <Select value={selectedCriterionToVary} onValueChange={(value) => {
                      setSelectedCriterionToVary(value);
                      setKSensResults(null); // Reset results when criterion changes
                    }}>
                      <SelectTrigger className="w-full h-10 text-sm border-gray-300">
                        <SelectValue placeholder="Choose a criterion to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {workingCriteria.map((crit) => (
                          <SelectItem key={crit.id} value={crit.id} className="text-sm">
                            <div className="flex items-center justify-between w-full gap-3">
                              <span className="font-medium">{crit.name}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded ${crit.type === 'beneficial'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                                  }`}>
                                  {crit.type === 'beneficial' ? '↑ Max' : '↓ Min'}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>



                    {/* AI Report Generation Button - Moved here */}



                    {/* Quick Presets - directly below criterion selector */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                      <h4 className="text-[12px] sm:text-xs font-semibold mb-2 sm:mb-3 text-gray-700">Quick Presets</h4>
                      <div className="grid grid-cols-5 gap-1 sm:gap-2">
                        <button
                          onClick={() => setKSensVariationRange([-10, -5, 0, 5, 10])}
                          className={`w-full p-1.5 sm:p-2.5 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left h-[42px] sm:h-[60px] ${JSON.stringify(kSensVariationRange) === JSON.stringify([-10, -5, 0, 5, 10])
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        >
                          <div className="text-[8px] sm:text-sm font-semibold text-black">±10%</div>
                          <div className="text-[7px] sm:text-xs text-gray-600">Fine (5 pts)</div>
                        </button>
                        <button
                          onClick={() => setKSensVariationRange([-20, -10, 0, 10, 20])}
                          className={`w-full p-1.5 sm:p-2.5 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left h-[42px] sm:h-[60px] ${JSON.stringify(kSensVariationRange) === JSON.stringify([-20, -10, 0, 10, 20])
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        >
                          <div className="text-[8px] sm:text-sm font-semibold text-black">±20%</div>
                          <div className="text-[7px] sm:text-xs text-gray-600">Fine (5 pts)</div>
                        </button>
                        <button
                          onClick={() => setKSensVariationRange([-30, -20, -10, 0, 10, 20, 30])}
                          className={`w-full p-1.5 sm:p-2.5 border-2 rounded-lg hover:border-blue-600 transition-colors text-left h-[42px] sm:h-[60px] ${JSON.stringify(kSensVariationRange) === JSON.stringify([-30, -20, -10, 0, 10, 20, 30])
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-blue-500 bg-blue-50'
                            }`}
                        >
                          <div className="text-[8px] sm:text-sm font-semibold text-blue-600">±30% ★</div>
                          <div className="text-[7px] sm:text-xs text-gray-600">Standard (7)</div>
                        </button>
                        <button
                          onClick={() => setKSensVariationRange([-40, -30, -20, -10, 0, 10, 20, 30, 40])}
                          className={`w-full p-1.5 sm:p-2.5 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left h-[42px] sm:h-[60px] ${JSON.stringify(kSensVariationRange) === JSON.stringify([-40, -30, -20, -10, 0, 10, 20, 30, 40])
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        >
                          <div className="text-[8px] sm:text-sm font-semibold text-black">±40%</div>
                          <div className="text-[7px] sm:text-xs text-gray-600">Wide (9 pts)</div>
                        </button>
                        <button
                          onClick={() => setKSensVariationRange([-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50])}
                          className={`w-full p-1.5 sm:p-2.5 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left h-[42px] sm:h-[60px] ${JSON.stringify(kSensVariationRange) === JSON.stringify([-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50])
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        >
                          <div className="text-[8px] sm:text-sm font-semibold text-black">±50%</div>
                          <div className="text-[7px] sm:text-xs text-gray-600">Wide (11 pts)</div>
                        </button>
                        <button
                          onClick={() => setKSensVariationRange([-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60])}
                          className={`w-full p-1.5 sm:p-2.5 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left h-[42px] sm:h-[60px] ${JSON.stringify(kSensVariationRange) === JSON.stringify([-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60])
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        >
                          <div className="text-[8px] sm:text-sm font-semibold text-black">±60%</div>
                          <div className="text-[7px] sm:text-xs text-gray-600">Wide (13 pts)</div>
                        </button>
                        <button
                          onClick={() => setKSensVariationRange([-70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70])}
                          className={`w-full p-1.5 sm:p-2.5 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left h-[42px] sm:h-[60px] ${JSON.stringify(kSensVariationRange) === JSON.stringify([-70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70])
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        >
                          <div className="text-[8px] sm:text-sm font-semibold text-black">±70%</div>
                          <div className="text-[7px] sm:text-xs text-gray-600">Wide (15 pts)</div>
                        </button>
                        <button
                          onClick={() => setKSensVariationRange([-80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80])}
                          className={`w-full p-1.5 sm:p-2.5 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left h-[42px] sm:h-[60px] ${JSON.stringify(kSensVariationRange) === JSON.stringify([-80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80])
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        >
                          <div className="text-[8px] sm:text-sm font-semibold text-black">±80%</div>
                          <div className="text-[7px] sm:text-xs text-gray-600">Wide (17 pts)</div>
                        </button>
                        <button
                          onClick={() => setKSensVariationRange([-90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90])}
                          className={`w-full p-1.5 sm:p-2.5 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left h-[42px] sm:h-[60px] ${JSON.stringify(kSensVariationRange) === JSON.stringify([-90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90])
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        >
                          <div className="text-[8px] sm:text-sm font-semibold text-black">±90%</div>
                          <div className="text-[7px] sm:text-xs text-gray-600">Wide (19 pts)</div>
                        </button>
                        <button
                          onClick={() => setKSensVariationRange([-100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])}
                          className={`w-full p-1.5 sm:p-2.5 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left h-[42px] sm:h-[60px] ${JSON.stringify(kSensVariationRange) === JSON.stringify([-100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                            }`}
                        >
                          <div className="text-[8px] sm:text-sm font-semibold text-black">±100%</div>
                          <div className="text-[7px] sm:text-xs text-gray-600">Full (21 pts)</div>
                        </button>
                      </div>

                      {/* Or Enter Custom Variation Points */}
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <label className="block text-[12px] sm:text-xs font-medium mb-1.5 sm:mb-2 text-gray-700">
                          Or Enter Custom Variation Points
                        </label>
                        <input
                          type="text"
                          value={kSensVariationRange.join(', ')}
                          onChange={(e) => {
                            const values = e.target.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
                            if (values.length > 0) setKSensVariationRange(values.sort((a, b) => a - b));
                          }}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-[8px] sm:text-xs"
                          placeholder="e.g., -30, -20, -10, 0, 10, 20, 30"
                        />
                      </div>


                    </div>
                  </div>
                </div>

                {/* Alternatives Count */}
                <div className="rounded-lg p-4 bg-gray-50">
                  <h4 className="text-xs font-semibold mb-2 text-black flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px]">✓</span>
                    Alternatives to Analyze
                  </h4>
                  <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap">
                    {alternatives.map((alt) => (
                      <button
                        key={alt.id}
                        onClick={() => {
                          const newIds = selectedAltIds.includes(alt.id)
                            ? selectedAltIds.filter(id => id !== alt.id)
                            : [...selectedAltIds, alt.id];
                          setSelectedAltIds(newIds);
                          if (kSensResults) setKSensResults(null);
                        }}
                        className={`px-3 py-1 rounded text-xs transition-colors border ${selectedAltIds.includes(alt.id)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                          }`}
                      >
                        {alt.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Total: <strong>{selectedAltIds.length} alternatives</strong> will be analyzed across <strong>{criteria.length} criteria</strong>
                  </p>
                </div>

                {/* Ready to Analyze Card - Only show before first analysis */}
                {!kSensResults && (
                  <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl overflow-hidden shadow-sm">
                    <CardContent className="p-6 sm:p-10">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                          <RefreshCw className={`w-6 h-6 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        </div>
                        <h3 className="text-base sm:text-xl font-bold mb-2 text-gray-900 uppercase tracking-tight">Ready to Analyze</h3>
                        <p className="text-[10px] sm:text-sm text-gray-600 mb-8 max-w-xs mx-auto">
                          Total workload: <strong>{selectedAltIds.length} alternatives</strong> × <strong>{criteria.length} criteria</strong> × <strong>{kSensVariationRange.length} variations</strong>
                        </p>
                        <Button
                          onClick={() => {
                            if (!hasValidData()) {
                              setShowDataWarning(true);
                              setTimeout(() => setShowDataWarning(false), 3000);
                              return;
                            }
                            performKSensitivityAnalysis();
                            setKSensActiveTab('results');
                          }}
                          disabled={!hasValidData() || isAnalyzing}
                          className={`w-full sm:w-auto h-11 sm:h-14 text-xs sm:text-base px-6 sm:px-12 rounded font-bold shadow-lg transition-all duration-300 transform active:scale-95 ${hasValidData() && !isAnalyzing
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-green-200/50 hover:-translate-y-0.5'
                            : 'bg-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                        >
                          {isAnalyzing ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🚀</span>
                              <span>Run K% Sensitivity Analysis</span>
                            </div>
                          )}
                        </Button>
                        <p className="text-[9px] sm:text-[11px] text-gray-400 mt-5">
                          Analysis processes {selectedAltIds.length * criteria.length * kSensVariationRange.length} individual ranking computations
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}



            {/* Results Section */}
            {kSensResults && (
              <div className="space-y-4">

                {/* Show processing state */}
                {isAnalyzing && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2 text-black">Processing K% Sensitivity Analysis...</h3>
                    <p className="text-sm text-gray-600">Please wait while we analyze your data</p>
                  </div>
                )}

                {kSensResults && (
                  <div>
                    <div className="flex flex-col gap-4 mb-4 border-b pb-4">
                      {/* View Type Toggle */}
                      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
                        <button
                          onClick={() => setKSensViewType('ranking')}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${kSensViewType === 'ranking'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          Ranking Analysis
                        </button>
                        <button
                          onClick={() => setKSensViewType('weight')}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${kSensViewType === 'weight'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                          Weight Analysis
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                            <Button
                              onClick={downloadAllTables}
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] border-gray-200 bg-white hover:bg-gray-50 text-black ml-1"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download Excel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {kSensActiveTab === 'results' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
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
                          </div>
                          <Button
                            onClick={downloadChartAsJpeg}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            Download JPG
                          </Button>
                        </div>
                        {/* Display only selected criterion results */}
                        {selectedCriterionToVary && workingCriteria.find(c => c.id === selectedCriterionToVary) && (
                          <Card className="border-gray-200 bg-white shadow-sm">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm text-black">
                                {workingCriteria.find(c => c.id === selectedCriterionToVary)?.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                Base: {(workingCriteria.find(c => c.id === selectedCriterionToVary)!.weight * 100).toFixed(2)}% ({workingCriteria.find(c => c.id === selectedCriterionToVary)?.type === 'beneficial' ? 'Beneficial ↑' : 'Non-Beneficial ↓'})
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {renderKSensChart(workingCriteria.find(c => c.id === selectedCriterionToVary)!.name)}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {kSensActiveTab === 'tables' && (
                      <div className="space-y-6">
                        {/* Display table based on View Type for the selected criterion only */}
                        {(() => {
                          const selectedCrit = workingCriteria.find(c => c.id === selectedCriterionToVary);
                          if (!selectedCrit) return <div className="text-center py-8 text-gray-500 text-xs">Please select a criterion to vary.</div>;

                          return kSensViewType === 'weight'
                            ? renderWeightTable(selectedCrit)
                            : renderKSensTable(selectedCrit.name);
                        })()}
                      </div>
                    )}

                    <div className="flex justify-between gap-2 mt-6 pt-4 border-t items-center">
                      <div className="flex gap-2">
                        <Button onClick={() => { setKSensResults(null); setShowConfig(true); }} variant="outline" className="text-xs h-8">
                          ← Modify Config
                        </Button>
                        <Button onClick={() => { setKSensResults(null); setShowConfig(true); }} variant="outline" className="text-xs h-8">
                          🔄 Start Over
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        {selectedCriterionToVary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAIAssistant(true)}
                            disabled={!kSensResults || isAnalyzing}
                            className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 border-none h-8 text-xs gap-1.5 shadow-lg min-w-[180px]"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Research Assistant
                          </Button>
                        )}
                      </div>
                    </div>


                    {/* AI Research Assistant */}
                    {showAIAssistant && selectedCriterionToVary && (
                      <div className="mt-6">
                        <AIResearchAssistant
                          kSensData={kSensResults ? kSensResults[workingCriteria.find(c => c.id === selectedCriterionToVary)?.name || selectedCriterionToVary] : null}
                          criterionName={workingCriteria.find(c => c.id === selectedCriterionToVary)?.name || selectedCriterionToVary}
                          variationRange={kSensVariationRange.join(", ")}
                          alternatives={alternatives}
                          criteria={workingCriteria}
                          method={selectedRankingMethod}
                          onClose={() => setShowAIAssistant(false)}
                        />
                      </div>
                    )}
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
              if (!showConfig && kSensResults) {
                performKSensitivityAnalysis();
              } else {
                setKSensResults(null);
              }
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
              if (!showConfig && kSensResults) {
                performKSensitivityAnalysis();
              } else {
                setKSensResults(null);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
