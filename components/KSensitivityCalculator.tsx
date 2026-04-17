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
import { ComposedChart, LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { Check, ChevronRight, Download, RefreshCw, Loader2, Sparkles, Bot, FileText, LayoutGrid } from 'lucide-react';
import ExcelJS from 'exceljs';
import ReactMarkdown from 'react-markdown';
import { AIResearchAssistant } from './AIResearchAssistant';
import { AssetLabel } from './AssetLabel';
import { ResearchAssetHeader } from './ResearchAssetHeader';
import { Tag } from 'lucide-react';
import { toJpeg, toPng, toSvg } from 'html-to-image';
import { MCDM_METHODS } from "@/constants/mcdm";
import { MCDMMethod } from "@/types/mcdm";


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
  assetLabels?: Record<string, string>;
  onCloseAiPanel?: () => void;
  onLabelChange?: (key: string, label: string) => void;
  onIncludeChange?: (key: string, included: boolean) => void;
  selectedAiAssets?: Set<string>;
  onCalculationComplete?: (hasResults: boolean, results?: any, usedRange?: number[]) => void;
  methodName?: string;
}

export default function KSensitivityCalculator({
  criteria,
  alternatives,
  weightMethod = "Custom",
  onAiAnalysis,
  aiAnalysisResult,
  isAiLoading,
  showAiPanel,
  assetLabels,
  onCloseAiPanel,
  onLabelChange,
  onIncludeChange,
  selectedAiAssets = new Set(),
  onCalculationComplete,
  methodName = "Method"
}: KSensitivityCalculatorProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  let tableCounter = 1;
  let figureCounter = 1;
  const [kSensVariationRange, setKSensVariationRange] = useState<number[]>([-30, -20, -10, 0, 10, 20, 30]);
  const [kSensChartType, setKSensChartType] = useState<string>('line');
  const [kSensResults, setKSensResults] = useState<any>(null);
  const [kSensTableDisplayStyle, setKSensTableDisplayStyle] = useState<'both' | 'rank' | 'score'>('both');
  const [showConfig, setShowConfig] = useState<boolean>(true);
  const [selectedCriterionToVary, setSelectedCriterionToVary] = useState<string>(''); // New state for criterion selection
  const [kSensViewType, setKSensViewType] = useState<'ranking' | 'weight'>('ranking'); // New state for view type
  const [kSensActiveTab, setKSensActiveTab] = useState<'config' | 'results'>('config');

  // Separate AI Analysis States for Reports and Abstracts
  const [aiReportResult, setAiReportResult] = useState<string | null>(null);
  const [aiAbstractResult, setAiAbstractResult] = useState<string | null>(null);
  const [isAiReportLoading, setIsAiReportLoading] = useState<boolean>(false);
  const [isAiAbstractLoading, setIsAiAbstractLoading] = useState<boolean>(false);
  const [showAiReportPanel, setShowAiReportPanel] = useState<boolean>(false);
  const [showAiAbstractPanel, setShowAiAbstractPanel] = useState<boolean>(false);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [kSensVariationInput, setKSensVariationInput] = useState<string>('-30, -20, -10, 0, 10, 20, 30');

  useEffect(() => {
    // Sync the input string when the range array changes (e.g., from presets)
    // but only if it's not currently being edited to avoid cursor jumping
    setKSensVariationInput(kSensVariationRange.join(', '));
  }, [kSensVariationRange]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Weight method state
  const [selectedWeightMethod, setSelectedWeightMethod] = useState<string>('equal');
  const [workingCriteria, setWorkingCriteria] = useState<Criterion[]>(criteria);
  const [customWeights, setCustomWeights] = useState<{ [key: string]: number }>({});
  const [isCalculatingWeights, setIsCalculatingWeights] = useState<boolean>(false);
  const [selectedAltIds, setSelectedAltIds] = useState<string[]>(alternatives.map(a => a.id));
  const [hasCalculatedOnce, setHasCalculatedOnce] = useState<boolean>(false);

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
      const userApiKey = localStorage.getItem("user_gemini_api_key") || "";
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
          userApiKey,
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
      const userApiKey = localStorage.getItem("user_gemini_api_key") || "";
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
          userApiKey,
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

  // Auto-calculate sensitivity analysis on load disabled as per user request
  // Initial run MUST be manual. Subsequent runs are auto-triggered only if hasCalculatedOnce is true.
  /*
  useEffect(() => {
    if (hasValidData() && selectedCriterionToVary && !hasCalculatedOnce && !isAnalyzing) {
      // performKSensitivityAnalysis(); // Stop auto-run on mount
    }
  }, [selectedCriterionToVary, criteria, alternatives, selectedRankingMethod, selectedWeightMethod]);
  */

  // Auto-recalculate when weight method or actual weight values change (in results view)
  useEffect(() => {
    if (hasCalculatedOnce && hasValidData()) {
      setKSensResults(null); // Clear old results to prevent displaying stale data
      const timer = setTimeout(() => {
        performKSensitivityAnalysis();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedWeightMethod, JSON.stringify(workingCriteria.map(c => c.weight))]);

  // Auto-recalculate when ranking method changes (in results view)
  useEffect(() => {
    if (hasCalculatedOnce && hasValidData()) {
      setKSensResults(null); // Clear old results
      performKSensitivityAnalysis();
    }
  }, [selectedRankingMethod]);

  // Auto-recalculate when criterion to vary changes (in results view)
  useEffect(() => {
    if (hasCalculatedOnce && hasValidData() && selectedCriterionToVary) {
      setKSensResults(null); // Clear old results
      performKSensitivityAnalysis(undefined, undefined, selectedCriterionToVary);
    }
  }, [selectedCriterionToVary]);

  // Auto-recalculate when variation range changes (in results view)
  useEffect(() => {
    if (hasCalculatedOnce && hasValidData()) {
      setKSensResults(null); // Clear old results
      const timer = setTimeout(() => {
        performKSensitivityAnalysis();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [JSON.stringify(kSensVariationRange)]);

  // Auto-recalculate when alternatives to analyze change (in results view)
  useEffect(() => {
    if (hasCalculatedOnce && hasValidData()) {
      // Clear results and re-run immediately for alternatives toggle
      setKSensResults(null);
      performKSensitivityAnalysis();
    }
  }, [JSON.stringify(selectedAltIds)]);

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
    { value: 'area', label: 'Area Chart', icon: '📈' },
    { value: 'stackedArea', label: 'Stacked Area Chart', icon: '📈' },
    { value: 'bar', label: 'Bar Chart', icon: '📊' },
    { value: 'stackedBar', label: 'Stacked Bar Chart', icon: '📊' },
    { value: 'column', label: 'Column Chart', icon: '📊' },
    { value: 'scatter', label: 'Scatter Plot', icon: '⚫' },
    { value: 'radar', label: 'Radar Chart', icon: '🎯' },
    { value: 'dual', label: 'Dual-Axis (Score & Rank)', icon: '🌓' },
    { value: 'heatmap', label: 'Sensitivity Heatmap', icon: '🌡️' },
    { value: 'parallel', label: 'Parallel Coordinates', icon: '〰️' },
  ];

  const calculateKSensScore = (altValues: number[], weights: number[], criteriaTypes: string[]) => {
    return altValues.reduce((sum, val, idx) => {
      const normalizedVal = criteriaTypes[idx] === 'non-beneficial' ? (1 - val) : val;
      return sum + (normalizedVal * weights[idx]);
    }, 0);
  };

  const downloadChartAsJpeg = async (format: 'jpeg' | 'png' | 'svg' = 'jpeg') => {
    if (!chartRef.current) return;

    const element = chartRef.current;
    
    // Store original state
    const originalAttr = element.getAttribute("style");
    
    // Professional 1200x675 (16:9) aspect ratio for publication
    element.style.width = '1200px';
    element.style.height = '675px';
    element.style.maxWidth = 'none';
    element.style.backgroundColor = '#ffffff';
    element.style.overflow = 'hidden'; // Strict clipping
    element.style.position = 'relative';

    // Wait for Recharts reflow
    setTimeout(async () => {
      try {
        const options = {
          quality: 1.0,
          backgroundColor: "#ffffff",
          pixelRatio: 4, // 4x high density for journals
          width: 1200,
          height: 675,
          style: {
            padding: '20px'
          }
        };

        let dataUrl = "";
        const criterionName = workingCriteria.find(c => c.id === selectedCriterionToVary)?.name || "Sensitivity";
        const filename = `sensitivity-analysis-${criterionName.replace(/\s+/g, '_').toLowerCase()}-${Date.now()}.${format}`;

        if (format === 'svg') {
          dataUrl = await toSvg(element, options);
        } else if (format === 'png') {
          dataUrl = await toPng(element, options);
        } else {
          dataUrl = await toJpeg(element, options);
        }

        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Error exporting chart", err);
        alert("Failed to export figure. Please try again.");
      } finally {
        if (originalAttr) {
          element.setAttribute("style", originalAttr);
        } else {
          element.removeAttribute("style");
        }
      }
    }, 500);
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
        setHasCalculatedOnce(true);
        setIsAnalyzing(false);
        if (onCalculationComplete) onCalculationComplete(true, results, kSensVariationRange);
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
            dataPoint[`${alt.name} Score`] = varData.rankings[alt.name].score;
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

  const calculateSwitchingPoints = (criterionName: string) => {
    if (!kSensResults || !kSensResults[criterionName]) return [];

    const criterionData = kSensResults[criterionName];
    if (criterionData.length < 2) return [];

    const switchingPoints: { alt1: string, alt2: string, variation: number, type: string }[] = [];

    // Check between each variation step if rankings swapped
    for (let i = 0; i < criterionData.length - 1; i++) {
      const v1 = criterionData[i];
      const v2 = criterionData[i + 1];

      const altNames = alternatives.map(a => a.name);

      for (let j = 0; j < altNames.length; j++) {
        for (let k = j + 1; k < altNames.length; k++) {
          const a1 = altNames[j];
          const a2 = altNames[k];

          const r1_v1 = v1.rankings[a1]?.rank;
          const r2_v1 = v1.rankings[a2]?.rank;
          const r1_v2 = v2.rankings[a1]?.rank;
          const r2_v2 = v2.rankings[a2]?.rank;

          if (!r1_v1 || !r2_v1 || !r1_v2 || !r2_v2) continue;

          // If relative order changed (e.g. A1 was better than A2, now A2 is better than A1)
          if ((r1_v1 < r2_v1 && r1_v2 > r2_v2) || (r1_v1 > r2_v1 && r1_v2 < r2_v2)) {
            const s1_v1 = v1.rankings[a1]?.score;
            const s2_v1 = v1.rankings[a2]?.score;
            const s1_v2 = v2.rankings[a1]?.score;
            const s2_v2 = v2.rankings[a2]?.score;

            const diffV1 = s1_v1 - s2_v1;
            const diffV2 = s1_v2 - s2_v2;

            if (Math.abs(diffV2 - diffV1) > 0.000001) {
              const t = -diffV1 / (diffV2 - diffV1);
              const exactVar = v1.variation + t * (v2.variation - v1.variation);

              switchingPoints.push({
                alt1: a1,
                alt2: a2,
                variation: exactVar,
                type: r1_v1 < r2_v1 ? `${a1} Swapped with ${a2}` : `${a2} Swapped with ${a1}`
              });
            }
          }
        }
      }
    }
    return switchingPoints;
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
          <div ref={chartRef} className="bg-white max-w-7xl mx-auto relative">
            <ResponsiveContainer width="100%" height={750}>
              <RadarChart data={radarData} outerRadius="80%" margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                {isWeightView && <text x="50%" y="20" textAnchor="middle" fontSize="14" fontWeight="normal" fill="#000">Weight Stability Forensic Radar</text>}
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
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #999',
                    padding: '8px',
                    lineHeight: '12px',
                    top: 70,
                    right: 280,
                    width: 'auto',
                    zIndex: 100,
                    boxShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}
                  iconSize={8}
                  iconType="circle"
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
        <div ref={chartRef} className="bg-white max-w-7xl mx-auto relative">
          <ResponsiveContainer width="100%" height={750}>
            <RadarChart data={radarData} outerRadius="80%" margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <text x="50%" y="20" textAnchor="middle" fontSize="14" fontWeight="normal" fill="#000">Alternative Stability Forensic Radar</text>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #999',
                  padding: '8px',
                  lineHeight: '12px',
                  top: 70,
                  right: 280,
                  width: 'auto',
                  zIndex: 100,
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
                iconSize={8}
                iconType="circle"
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
    if (kSensChartType === 'parallel') {
      if (!isWeightView) {
        return <div className="p-4 text-center text-gray-500 font-bold text-xs mt-10">Parallel Coordinates Plot is only available for Weight Analysis.</div>;
      }

      // TRANSPOSE: X-axis = Criteria, Lines = Scenarios
      const parallelData = workingCriteria.map(crit => {
        const row: any = { name: crit.name };
        kSensVariationRange.forEach((v, vIdx) => {
          row[`${v}%`] = data[vIdx]?.[crit.name] || 0;
        });
        return row;
      });

      return (
        <div ref={chartRef} className="bg-white max-w-7xl mx-auto relative">
          <ResponsiveContainer width="100%" height={600}>
            <LineChart data={parallelData} margin={{ top: 40, right: 100, left: 80, bottom: 80 }}>
              {isWeightView && <text x="50%" y="20" textAnchor="middle" fontSize="14" fontWeight="normal" fill="#000">Sensitivity Analysis of Criteria Weights (Parallel Plot)</text>}
              <CartesianGrid stroke="#b0b0b0" strokeDasharray="none" vertical={true} horizontal={true} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontWeight: 'bold', fill: '#000' }}
                axisLine={{ stroke: '#000', strokeWidth: 1 }}
                tickLine={{ stroke: '#000' }}
                label={{ value: 'Criteria', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#000' } }}
              />
              <YAxis
                label={{ value: 'Weight (%)', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 11, fill: '#000' } }}
                tick={{ fontSize: 10, fill: '#000' }}
                axisLine={{ stroke: '#000' }}
                tickLine={{ stroke: '#000' }}
                tickFormatter={(val) => (val * 100).toFixed(0)}
              />
              <Tooltip
                formatter={(value: number) => (value * 100).toFixed(2) + '%'}
                contentStyle={{ border: '1px solid #000', borderRadius: '0px', fontSize: '10px' }}
              />
              <Legend
                verticalAlign="top"
                align="left"
                layout="vertical"
                wrapperStyle={{
                  fontSize: "9px",
                  color: '#000',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #999',
                  padding: '5px',
                  lineHeight: '12px',
                  marginTop: '55px',
                  marginLeft: '130px',
                  width: 'auto',
                  zIndex: 50,
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
                iconSize={8}
                iconType="circle"
              />
              {kSensVariationRange.map((v, idx) => {
                const label = `${v}%`;
                // Scientific colors for scenarios
                const scenarioColors = [
                  '#8fbbaf', '#82ac06', '#640280', '#82ac06', '#f699ff',
                  '#32cd32', '#f699ff', '#00ced1', '#f0fff0'
                ];
                const color = scenarioColors[idx % scenarioColors.length];
                return (
                  <Line
                    key={label}
                    type="linear"
                    dataKey={label}
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }


    return (
      <div ref={chartRef} className="bg-white max-w-7xl mx-auto">
        {['line', 'area', 'stackedArea'].includes(kSensChartType) ? (
          <ResponsiveContainer width="100%" height={600}>
            {['area', 'stackedArea'].includes(kSensChartType) ? (
              <AreaChart data={data} margin={{ top: 40, right: 100, left: 80, bottom: 80 }}>
                {isWeightView && <text x="50%" y="20" textAnchor="middle" fontSize="14" fontWeight="normal" fill="#000">Sensitivity Analysis of Criteria Weights</text>}
                <CartesianGrid strokeDasharray={isWeightView ? "none" : "3 3"} vertical={isWeightView ? true : false} stroke={isWeightView ? "#b0b0b0" : "#e5e7eb"} opacity={isWeightView ? 0.7 : 0.5} />
                <XAxis dataKey="variation" tick={{ fontSize: 10, fill: '#000' }} axisLine={{ stroke: '#000' }} tickLine={{ stroke: '#000' }} interval={0} padding={{ left: 10, right: 10 }} tickFormatter={isWeightView ? (val: string) => val.replace('%', '') : undefined} label={{ value: isWeightView ? 'Weight Variation (%)' : 'Perturbation Strength (%)', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#000', fontWeight: isWeightView ? 'normal' : 'bold', fontStyle: isWeightView ? 'normal' : 'italic' } }} />
                <XAxis orientation="top" xAxisId="top_border" axisLine={{ stroke: isWeightView ? '#999' : '#000' }} tick={false} tickLine={false} />
                <YAxis reversed={!isWeightView} tick={{ fontSize: 10, fill: '#000' }} axisLine={{ stroke: isWeightView ? '#999' : '#000' }} tickLine={{ stroke: isWeightView ? '#999' : '#000' }} domain={isWeightView ? (kSensChartType === 'stackedArea' ? [0, 1] : [0, 'auto']) : [1, alternatives.length]} allowDecimals={isWeightView} ticks={!isWeightView ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined} tickFormatter={isWeightView ? (val: number) => Number(val.toFixed(2)).toString() : undefined} label={{ value: isWeightView ? 'Weight (%)' : 'Alternative Rank', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 11, fill: '#000', fontWeight: isWeightView ? 'normal' : 'bold', fontStyle: isWeightView ? 'normal' : 'italic' } }} />
                <YAxis orientation="right" yAxisId="right_border" width={1} axisLine={{ stroke: isWeightView ? '#999' : '#000' }} tick={false} tickLine={false} domain={isWeightView ? (kSensChartType === 'stackedArea' ? [0, 1] : [0, 'auto']) : [1, alternatives.length]} />
                <Tooltip />
                <Legend verticalAlign="top" align={isWeightView ? "left" : "right"} layout="vertical" wrapperStyle={isWeightView ? { fontSize: "9px", color: '#000', backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #999', padding: '5px', lineHeight: '12px', marginTop: '55px', marginLeft: '130px', width: 'auto', zIndex: 50, boxShadow: '1px 1px 2px rgba(0,0,0,0.1)' } : { fontSize: "8px", color: '#000', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #333', padding: '4px', top: 73, right: 230, width: 'auto', zIndex: 50, boxShadow: '1px 1px 3px rgba(0,0,0,0.1)' }} iconSize={8} iconType={isWeightView ? "circle" : "square"} />
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
                {isWeightView && <text x="50%" y="20" textAnchor="middle" fontSize="14" fontWeight="normal" fill="#000">Sensitivity Analysis of Criteria Weights</text>}
                <CartesianGrid strokeDasharray={isWeightView ? "none" : "3 3"} vertical={isWeightView ? true : false} stroke={isWeightView ? "#b0b0b0" : "#e5e7eb"} opacity={isWeightView ? 0.7 : 0.5} />
                <XAxis
                  dataKey="variation"
                  tick={{ fontSize: 10, fill: '#000' }}
                  axisLine={{ stroke: '#000' }}
                  tickLine={{ stroke: '#000' }}
                  interval={0}
                  padding={{ left: 10, right: 10 }}
                  tickFormatter={isWeightView ? (val: string) => val.replace('%', '') : undefined}
                  label={{ value: isWeightView ? 'Weight Variation (%)' : 'Perturbation Strength (%)', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#000' } }}
                />
                <XAxis
                  orientation="top"
                  xAxisId="top_border"
                  axisLine={{ stroke: isWeightView ? '#999' : '#000' }}
                  tick={false}
                  tickLine={false}
                />
                <YAxis
                  reversed={isWeightView ? false : true}
                  tick={{ fontSize: 10, fill: '#000' }}
                  axisLine={{ stroke: isWeightView ? '#999' : '#000' }}
                  tickLine={{ stroke: isWeightView ? '#999' : '#000' }}
                  domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
                  allowDecimals={isWeightView}
                  ticks={!isWeightView ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined}
                  tickFormatter={isWeightView ? (val: number) => (val * 100).toFixed(0) : undefined}
                  label={{ value: isWeightView ? 'Weight (%)' : 'Alternative Rank', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 11, fill: '#000' } }}
                />
                <YAxis
                  orientation="right"
                  yAxisId="right_border"
                  width={1}
                  axisLine={{ stroke: isWeightView ? '#999' : '#000' }}
                  tick={false}
                  tickLine={false}
                  domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
                />

                <Tooltip />
                <Legend
                  verticalAlign="top"
                  align="left"
                  layout="vertical"
                  wrapperStyle={{
                    fontSize: "9px",
                    color: '#000',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #999',
                    padding: '5px',
                    lineHeight: '12px',
                    marginTop: '55px',
                    marginLeft: '130px',
                    width: 'auto',
                    zIndex: 50,
                    boxShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}
                  iconSize={8}
                  iconType="circle"
                />
                {isWeightView ? (
                  workingCriteria.map((crit, idx) => {
                    const mplColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
                    const color = mplColors[idx % mplColors.length];
                    return (
                      <Line
                        key={crit.id}
                        type="linear"
                        dataKey={crit.name}
                        name={crit.name}
                        stroke={color}
                        strokeWidth={1.5}
                        dot={{ r: 4, strokeWidth: 0, fill: color }}
                        activeDot={{ r: 6 }}
                      />
                    );
                  })
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
              {isWeightView && <text x="50%" y="20" textAnchor="middle" fontSize="14" fontWeight="normal" fill="#000">Sensitivity Analysis of Criteria Weights</text>}
              <CartesianGrid strokeDasharray={isWeightView ? "none" : "3 3"} vertical={isWeightView ? true : false} stroke={isWeightView ? "#b0b0b0" : "#e5e7eb"} opacity={isWeightView ? 0.7 : 0.5} />
              <XAxis
                type="number"
                dataKey="x"
                name="Variation Index"
                tick={{ fontSize: 10, fill: '#000' }}
                axisLine={{ stroke: '#000' }}
                tickLine={{ stroke: '#000' }}
                domain={[0, kSensVariationRange.length - 1]}
                ticks={Array.from({ length: kSensVariationRange.length }, (_, i) => i)}
                tickFormatter={(val) => isWeightView ? `${kSensVariationRange[val]}` : `${kSensVariationRange[val]}%`}
                interval={0}
                label={{ value: isWeightView ? 'Weight Variation (%)' : 'Perturbation Strength (%)', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#000', fontWeight: isWeightView ? 'normal' : 'bold', fontStyle: isWeightView ? 'normal' : 'italic' } }}
              />
              <XAxis
                orientation="top"
                xAxisId="top_border"
                axisLine={{ stroke: isWeightView ? '#999' : '#000' }}
                tick={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={isWeightView ? "Weight" : "Rank"}
                reversed={!isWeightView}
                tick={{ fontSize: 10, fill: '#000' }}
                axisLine={{ stroke: isWeightView ? '#999' : '#000' }}
                tickLine={{ stroke: isWeightView ? '#999' : '#000' }}
                width={50}
                domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
                allowDecimals={isWeightView}
                ticks={!isWeightView ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined}
                tickFormatter={isWeightView ? (val: number) => (val * 100).toFixed(0) : undefined}
                label={{
                  value: isWeightView ? 'Weight (%)' : 'Alternative Rank',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -5,
                  style: { fontSize: 11, fill: '#000', fontWeight: isWeightView ? 'normal' : 'bold', fontStyle: isWeightView ? 'normal' : 'italic' }
                }}
              />
              <YAxis
                orientation="right"
                yAxisId="right_border"
                width={1}
                axisLine={{ stroke: isWeightView ? '#999' : '#000' }}
                tick={false}
                tickLine={false}
                domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend
                verticalAlign="top"
                align={isWeightView ? "left" : "right"}
                layout="vertical"
                wrapperStyle={isWeightView ? {
                  fontSize: "9px",
                  color: '#000',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #999',
                  padding: '5px',
                  lineHeight: '12px',
                  marginTop: '55px',
                  marginLeft: '130px',
                  width: 'auto',
                  zIndex: 50,
                  boxShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                } : {
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
                iconType={isWeightView ? "circle" : undefined}
              />
              {isWeightView ? (
                workingCriteria.map((crit, idx) => {
                  const scatterData = data.map((d: any, i: number) => ({ x: i, y: d[crit.name] }));
                  const mplColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
                  const color = mplColors[idx % mplColors.length];
                  return <Scatter key={crit.name} name={crit.name} data={scatterData} fill={color} />;
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
                padding={{ left: 10, right: 10 }}
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
          <>
            <ResponsiveContainer width="100%" height={600}>
              {kSensChartType === 'stackedBar' || kSensChartType === 'bar' || kSensChartType === 'column' ? (
                <BarChart
                  data={data}
                  margin={{ top: 40, right: 80, left: 80, bottom: 80 }}
                  barGap={0}
                  barCategoryGap="10%"
                >
                  {isWeightView && <text x="50%" y="20" textAnchor="middle" fontSize="14" fontWeight="normal" fill="#000">Sensitivity Analysis of Criteria Weights</text>}
                  <CartesianGrid strokeDasharray={isWeightView ? "none" : "3 3"} vertical={isWeightView ? true : false} stroke={isWeightView ? "#b0b0b0" : "#e5e7eb"} opacity={isWeightView ? 0.7 : 0.5} />
                  <XAxis
                    dataKey="variation"
                    tick={{ fontSize: 10, fill: '#000' }}
                    axisLine={{ stroke: '#000' }}
                    tickLine={{ stroke: '#000' }}
                    interval={0}
                    padding={{ left: 10, right: 10 }}
                    tickFormatter={isWeightView ? (val: string) => val.replace('%', '') : undefined}
                    label={{ value: isWeightView ? 'Weight Variation (%)' : 'Perturbation Strength (%)', position: 'insideBottom', offset: -5, style: { fontSize: 11, fill: '#000', fontWeight: isWeightView ? 'normal' : 'bold', fontStyle: isWeightView ? 'normal' : 'italic' } }}
                  />
                  <XAxis orientation="top" xAxisId="top_border" axisLine={{ stroke: isWeightView ? '#999' : '#000' }} tick={false} tickLine={false} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: '#000' }}
                    axisLine={{ stroke: isWeightView ? '#999' : '#000' }}
                    tickLine={{ stroke: isWeightView ? '#999' : '#000' }}
                    label={{ value: isWeightView ? 'Weight (%)' : `${MCDM_METHODS.find(m => m.value === selectedRankingMethod)?.label || selectedRankingMethod.toUpperCase()} Score`, angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: 11, fill: '#000', fontWeight: isWeightView ? 'normal' : 'bold', fontStyle: isWeightView ? 'normal' : 'italic' } }}
                    domain={isWeightView ? (kSensChartType === 'stackedBar' ? [0, 1] : [0, 'auto']) : [0, (max: number) => Math.ceil(max * 10) / 10]}
                    tickFormatter={isWeightView ? (val: number) => (kSensChartType === 'stackedBar' ? Number(val.toFixed(2)).toString() : (val * 100).toFixed(0)) : (val: number) => val.toFixed(1)}
                  />
                  {isWeightView && (
                    <YAxis
                      orientation="right"
                      yAxisId="right_border"
                      width={1}
                      axisLine={{ stroke: '#999' }}
                      tick={false}
                      tickLine={false}
                      domain={kSensChartType === 'stackedBar' ? [0, 1] : [0, 'auto']}
                    />
                  )}
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
                    align={isWeightView ? "left" : "right"}
                    layout="vertical"
                    wrapperStyle={isWeightView ? {
                      fontSize: "9px",
                      color: '#000',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #999',
                      padding: '5px',
                      lineHeight: '12px',
                      marginTop: '55px',
                      marginLeft: '130px',
                      width: 'auto',
                      zIndex: 50,
                      boxShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                    } : {
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
                    iconType={isWeightView ? "circle" : "square"}
                  />
                  {isWeightView ? (
                    workingCriteria.map((crit, idx) => {
                      const mplColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
                      const color = mplColors[idx % mplColors.length];
                      return (
                        <Bar key={crit.name} yAxisId="left" dataKey={crit.name} fill={color} name={crit.name} stackId={kSensChartType === 'stackedBar' ? "a" : undefined} />
                      );
                    })
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
              ) : <div />}
            </ResponsiveContainer>
          </>
        )}
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
        [`Perturbation Analysis Report - ${criterionName}`, `Date: ${date}`],
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
            {isAnalyzing ? "Running Perturbation Analysis..." : "Calculating Weights..."}
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
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <CardTitle className="text-sm text-black flex items-center">
              {assetLabels?.sensitivity_analysis || "Type 2: Data Perturbation (Test ±% Fluctuations)"}
            </CardTitle>
            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded border border-green-200 w-fit flex items-center gap-1 shadow-sm">
              <span>⭐</span> Highly Recommended for Q1 Journals
            </span>
          </div>
          <CardDescription className="text-xs text-gray-700 flex flex-wrap items-center gap-1">
            <span>Use this to test real-world risk. It simulates what happens to your rankings if the importance of a separate criterion fluctuates by ±margin.</span>
            <a
              href="#"
              className="text-blue-600 hover:underline inline-flex items-center gap-1 ml-1"
              onClick={(e) => { e.preventDefault(); setShowFormula(!showFormula); }}
            >
              General formula
              <span className="text-gray-500 text-[10px]">{showFormula ? '▼' : '▶'}</span>
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="space-y-6">
            {/* Formula Section Content */}
            {showFormula && (
              <div className="p-4 space-y-4 border rounded-lg bg-gray-50">
                {/* Step 1: General Formula */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-gray-900 mb-3">1. General Formula for Perturbation Sensitivity Analysis</h4>
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
                            <strong> is varied by ±{Math.abs(kSensVariationRange[0])}%</strong>
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
                      <span className="text-[10px] sm:text-xs font-semibold text-center text-gray-800 whitespace-nowrap">Run Perturbation Analysis</span>
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
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
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
                    <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">Perturbation (%)</label>
                    <Select value={selectedCriterionToVary} onValueChange={(value) => {
                      setSelectedCriterionToVary(value);
                      if (hasCalculatedOnce) {
                        setKSensResults(null); // Reset results when criterion changes
                      }
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
                          <div className="text-[8px] sm:text-sm font-semibold text-blue-600">±30% Recommended</div>
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
                          value={kSensVariationInput}
                          onChange={(e) => {
                            setKSensVariationInput(e.target.value);
                            const values = e.target.value.split(',')
                              .map(v => parseFloat(v.trim()))
                              .filter(v => !isNaN(v));
                            if (values.length > 0) {
                              setKSensVariationRange(values);
                            }
                          }}
                          onBlur={() => {
                            // On blur, sort the values and update the input to be clean
                            const sorted = [...kSensVariationRange].sort((a, b) => a - b);
                            setKSensVariationRange(sorted);
                            setKSensVariationInput(sorted.join(', '));
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
                          if (kSensResults) {
                            setKSensResults(null);
                            setHasCalculatedOnce(false);
                          }
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
                {!hasCalculatedOnce && (
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
                              <span>Run Perturbation Analysis</span>
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
            {hasCalculatedOnce && (
              <div className="space-y-6">
                {/* Show processing state */}
                {isAnalyzing && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2 text-black">Processing Perturbation Analysis...</h3>
                    <p className="text-sm text-gray-600">Please wait while we analyze your data</p>
                  </div>
                )}

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
                </div>

                <div className="space-y-12">
                  {(() => {
                    const selectedCrit = workingCriteria.find(c => c.id === selectedCriterionToVary);
                    if (!selectedCrit) return (
                      <div className="p-10 text-center border-2 border-dashed rounded-2xl bg-gray-50 text-gray-400 font-medium">
                        Please select a criterion from the dropdown to visualize analysis.
                      </div>
                    );

                    return (
                      <div className="space-y-12">
                        {/* 1. DATA TABLE */}
                        <Card className="border-gray-200 bg-white shadow-sm -mx-3 sm:mx-0 rounded-none sm:rounded-xl overflow-hidden">
                          <CardHeader className="pb-3 px-3 sm:px-6 bg-gray-50/50 border-b border-gray-100">
                            <ResearchAssetHeader
                              assetKey={`sensitivity_${kSensViewType}_table_${selectedCriterionToVary}`}
                              defaultLabel={`Table S${tableCounter++}`}
                              title={`Sensitivity Data Table (${kSensViewType === 'ranking' ? 'Ranking' : 'Weight'}): ${selectedCrit.name}`}
                              onLabelChange={onLabelChange}
                              included={selectedAiAssets.has(`sensitivity_${kSensViewType}_table_${selectedCriterionToVary}`)}
                              onIncludeChange={onIncludeChange}
                              onAiAnalysis={() => onAiAnalysis?.({
                                kSensData: kSensResults[selectedCrit.name],
                                criterionName: selectedCrit.name,
                                variationRange: kSensVariationRange,
                                analysisType: kSensViewType
                              })}
                            >
                              <div className="flex items-center gap-2 mr-2">
                                <Select value={kSensTableDisplayStyle} onValueChange={(v: any) => setKSensTableDisplayStyle(v)}>
                                  <SelectTrigger className="w-28 h-8 text-[11px] bg-white border-gray-300">
                                    <SelectValue placeholder="Display Style" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="rank" className="text-[11px]">Rank Only</SelectItem>
                                    <SelectItem value="score" className="text-[11px]">Score Only</SelectItem>
                                    <SelectItem value="both" className="text-[11px]">Rank & Score</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button onClick={downloadAllTables} variant="outline" size="sm" className="h-8 text-[11px] bg-white border-gray-300 hover:bg-gray-100 text-gray-700">
                                  <Download className="w-3 h-3 mr-1" />
                                  Excel
                                </Button>
                              </div>
                            </ResearchAssetHeader>
                          </CardHeader>
                          <CardContent className="px-0 sm:px-6 pt-6">
                            {kSensViewType === 'weight'
                              ? renderWeightTable(selectedCrit)
                              : renderKSensTable(selectedCrit.name)}
                          </CardContent>
                        </Card>

                        {/* 2. CORRESPONDING FIGURE */}
                        <Card className="border-none bg-white shadow-none -mx-3 sm:mx-0 rounded-none sm:rounded-xl overflow-hidden">
                          <CardHeader className="pb-3 px-3 sm:px-6 bg-gray-50/50">
                            <ResearchAssetHeader
                              assetKey={`sensitivity_${kSensViewType}_chart_${selectedCriterionToVary}`}
                              defaultLabel={`Figure S${figureCounter++}`}
                              title={`Sensitivity Visualization (${kSensViewType === 'ranking' ? 'Ranking' : 'Weight'}): ${selectedCrit.name}`}
                              onLabelChange={onLabelChange}
                              included={selectedAiAssets.has(`sensitivity_${kSensViewType}_chart_${selectedCriterionToVary}`)}
                              onIncludeChange={onIncludeChange}
                              onAiAnalysis={() => onAiAnalysis?.({
                                kSensData: kSensResults[selectedCrit.name],
                                criterionName: selectedCrit.name,
                                variationRange: kSensVariationRange,
                                analysisType: kSensViewType
                              })}
                            >
                              <div className="flex items-center gap-2 mr-2">
                                <Select value={kSensChartType} onValueChange={setKSensChartType}>
                                  <SelectTrigger className="w-36 h-8 text-[11px] bg-white border-gray-300"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {kSensChartTypes.map(ct => (
                                      <SelectItem key={ct.value} value={ct.value} className="text-[11px]">
                                        {ct.icon} {ct.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-md border border-gray-200">
                                  <Button 
                                    onClick={() => downloadChartAsJpeg('jpeg')} 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 px-2 text-[10px] font-bold hover:bg-white hover:shadow-sm transition-all text-blue-600"
                                  >
                                    <Download className="w-3 h-3 mr-1" /> JPEG
                                  </Button>
                                  <div className="w-[1px] h-3 bg-gray-300 mx-0.5" />
                                  <Button 
                                    onClick={() => downloadChartAsJpeg('svg')} 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 px-2 text-[10px] font-bold hover:bg-white hover:shadow-sm transition-all text-indigo-600"
                                  >
                                    <Sparkles className="w-3 h-3 mr-1" /> SVG (Vector)
                                  </Button>
                                </div>
                              </div>
                            </ResearchAssetHeader>
                            <CardDescription className="text-[10px]">
                              Base Case Weight: {(selectedCrit.weight * 100).toFixed(4)}% | Optimality: {selectedCrit.type === 'beneficial' ? 'Higher is Better' : 'Lower is Better'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="px-0 sm:px-6 pt-6">
                            {renderKSensChart(selectedCrit.name)}
                          </CardContent>
                        </Card>

                        {/* 3. SWITCHING POINTS ANALYSIS (Integrated at Bottom) */}
                        {kSensViewType === 'ranking' && (
                          <div className="pt-8 border-t-2 border-dashed border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                                <RefreshCw className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Rank Robustness Analysis</h4>
                                <p className="text-[10px] text-gray-500 font-medium italic">Exact threshold points where alternative rankings intersect.</p>
                              </div>
                            </div>

                            {(() => {
                              const points = calculateSwitchingPoints(selectedCrit.name);
                              if (points.length === 0) return (
                                <div className="p-8 text-center border-2 border-dashed rounded-2xl bg-gray-50/30">
                                  <div className="mx-auto w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border mb-3">
                                    <Check className="w-5 h-5 text-emerald-500" />
                                  </div>
                                  <h5 className="text-[11px] font-bold text-gray-900 uppercase">Preference Stable</h5>
                                  <p className="text-[10px] text-gray-500 max-w-xs mx-auto italic">No rank reversals detected within tested boundaries.</p>
                                </div>
                              );

                              return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {points.sort((a, b) => Math.abs(a.variation) - Math.abs(b.variation)).map((p, idx) => (
                                    <Card key={idx} className="border-gray-100 bg-white shadow-sm hover:border-amber-400 transition-all">
                                      <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-900 border rounded-full px-3 py-1 bg-gray-50/50">
                                          <span>{p.alt1}</span>
                                          <span className="text-amber-500">↔</span>
                                          <span>{p.alt2}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                          <div className={`text-xl font-black ${p.variation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {p.variation > 0 ? '+' : ''}{p.variation.toFixed(2)}%
                                          </div>
                                          <span className="text-[9px] uppercase font-bold text-gray-400">Critical Threshold</span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t items-center justify-start">
                  <Button onClick={() => { setKSensResults(null); setHasCalculatedOnce(false); setShowConfig(true); }} variant="outline" className="text-xs h-8">
                    ← Modify Config
                  </Button>
                  <Button onClick={() => { setKSensResults(null); setHasCalculatedOnce(false); setShowConfig(true); }} variant="outline" className="text-xs h-8">
                    🔄 Start Over
                  </Button>
                </div>
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
          </div>

          <DialogFooter className="mt-6 flex flex-col gap-2">
            <div className="text-[10px] text-gray-500 italic mb-2">
              Weights = (1/n) * Σ (1/i) from i=k to n
            </div>
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setIsRocDialogOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleRocCalculation} className="bg-blue-600 hover:bg-blue-700">Calculate Weight</Button>
            </div>
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
            <Button variant="outline" onClick={() => setIsRrDialogOpen(false)} className="text-xs h-8">Cancel</Button>
            <Button type="button" onClick={handleRrCalculation} className="bg-black text-white hover:bg-gray-800 text-xs h-8">Calculate Weights</Button>
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
                    <TableHead className="text-xs font-semibold">Criterion</TableHead>
                    <TableHead className="text-xs font-semibold text-center w-24">sj Coefficient</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criteria.map((crit, index) => (
                    <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell className="py-2 px-4 font-medium text-black text-xs">
                        {crit.name} {index === 0 && <span className="text-[10px] text-blue-600 font-bold ml-1">(Reference)</span>}
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 text-xs text-black">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={index === 0}
                          className="w-20 h-7 text-xs text-center mx-auto"
                          value={index === 0 ? 0 : swaraCoefficients[crit.id] || "0"}
                          onChange={(e) => setSwaraCoefficients(prev => ({ ...prev, [crit.id]: parseFloat(e.target.value) || 0 }))}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsSwaraDialogOpen(false)} className="text-xs h-8">Cancel</Button>
            <Button type="button" onClick={handleSwaraCalculation} className="bg-black text-white hover:bg-gray-800 text-xs h-8">Calculate Weights</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Weights Dialog */}
      <Dialog open={selectedWeightMethod === 'custom' && isCalculatingWeights === false} onOpenChange={(open) => {
        if (!open) setSelectedWeightMethod('equal');
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Custom Weight Input</DialogTitle>
            <DialogDescription className="text-xs">
              Enter custom weights for each criterion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold">Criterion</TableHead>
                    <TableHead className="text-xs font-semibold text-center w-24">Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criteria.map((crit) => (
                    <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <TableCell className="py-2 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                      <TableCell className="text-center py-2 px-4 text-xs text-black">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-20 h-7 text-xs text-center mx-auto"
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
                <strong>Note:</strong> You can enter any positive numbers. The weights will be automatically normalized to sum to 1.0.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedWeightMethod('equal')} className="text-xs h-8">Cancel</Button>
            <Button
              type="button"
              onClick={() => {
                applyCustomWeights();
                setSelectedWeightMethod('equal');
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
};
