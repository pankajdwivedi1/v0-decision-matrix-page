"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Play,
  ShieldCheck,
  AlertTriangle,
  Download,
  BookOpen,
  CheckCircle2,
  Table as TableIcon,
  BarChart3,
  Layers,
  Activity,
  History,
  Sliders,
  Sparkles,
  Lock,
  Unlock,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type { Alternative, Criterion } from "@/app/api/calculate/types";
import { MCDM_METHODS } from "@/constants/mcdm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MonteCarloFormula from "@/components/MonteCarloFormula";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
  Line,
} from "recharts";

interface MonteCarloPanelProps {
  alternatives: Alternative[];
  criteria: Criterion[];
  currentMethod?: string;
}

export interface StabilityResult {
  alternativeId: string;
  alternativeName: string;
  baseRank: number;
  stabilityPct: number;
  ciMargin?: number;
  mostCommonRank: number;
  avgScore: number;
  minScore: number;
  maxScore: number;
  stdDev: number;
  robustness: "High" | "Medium" | "Low";
  rankDistribution: Record<number, number>;
}

export interface CriterionStat {
  id: string;
  name: string;
  baseWeight: number;
  minWeight: number;
  maxWeight: number;
  meanWeight: number;
}

export interface MonteCarloSummary {
  baseWinner: string;
  winnerStabilityPct: number;
  rankReversalPct: number;
  overallRobustness: string;
}

export interface SimulationRun {
  runId: number;
  runLabel: string;
  method: string;
  methodLabel: string;
  trials: number;
  perturbPct: number;
  seed: number | null;
  seedMode: "fixed42" | "fixed100" | "random" | "custom";
  timestamp: string;
  results: StabilityResult[];
  summary: MonteCarloSummary;
  criteriaStats?: CriterionStat[];
}

type ViewMode = "table" | "stability_bar" | "rank_stacked" | "score_range" | "criteria_weights" | "history_comparison";

const RANK_COLORS = [
  "#2563eb", // Rank 1 - Blue
  "#16a34a", // Rank 2 - Green
  "#eab308", // Rank 3 - Yellow
  "#9333ea", // Rank 4 - Purple
  "#ea580c", // Rank 5 - Orange
  "#0891b2", // Rank 6 - Cyan
  "#be185d", // Rank 7 - Pink
  "#4d7c0f", // Rank 8 - Lime
  "#64748b", // Rank 9 - Slate
  "#475569", // Rank 10 - Slate Dark
];

export default function MonteCarloPanel({ alternatives, criteria, currentMethod = "swei" }: MonteCarloPanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(currentMethod);
  const [selectedWeightMethod, setSelectedWeightMethod] = useState<string>("auto");
  const [activeCriteria, setActiveCriteria] = useState<Criterion[]>(criteria);
  const [isCalculatingWeights, setIsCalculatingWeights] = useState<boolean>(false);
  const [trials, setTrials] = useState<number>(1000);
  const [perturbPct, setPerturbPct] = useState<number>(10);
  
  // Option A: Reproducibility Seed Control State
  const [seedMode, setSeedMode] = useState<"fixed42" | "fixed100" | "random" | "custom">("fixed42");
  const [customSeedInput, setCustomSeedInput] = useState<number>(42);

  // Option B: Iteration / Run History State
  const [runHistory, setRunHistory] = useState<SimulationRun[]>([]);
  const [activeRunIndex, setActiveRunIndex] = useState<number>(0);
  const [isNewRunPending, setIsNewRunPending] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  useEffect(() => {
    if (currentMethod) {
      setSelectedMethod(currentMethod);
    }
  }, [currentMethod]);

  // Synchronize activeCriteria when criteria prop updates from parent (e.g. Entropy weight selection)
  useEffect(() => {
    if (selectedWeightMethod === "auto" && criteria && criteria.length > 0) {
      setActiveCriteria(criteria);
    }
  }, [criteria, selectedWeightMethod]);

  const handleWeightMethodChange = async (method: string) => {
    setSelectedWeightMethod(method);
    if (method === "auto") {
      setActiveCriteria(criteria);
      return;
    }

    if (method === "equal") {
      const eq = 1 / criteria.length;
      setActiveCriteria(criteria.map((c) => ({ ...c, weight: eq })));
      return;
    }

    try {
      setIsCalculatingWeights(true);
      const res = await fetch("/api/calculate-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          criteria: criteria.map((c) => ({ id: c.id, name: c.name, type: c.type })),
          alternatives: alternatives.map((a) => ({ id: a.id, name: a.name, scores: a.scores })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.weights) {
          const updated = criteria.map((c) => ({
            ...c,
            weight: data.weights[c.id] ?? (1 / criteria.length),
          }));
          setActiveCriteria(updated);
        }
      }
    } catch (e) {
      console.error("Failed to calculate weights in Monte Carlo panel:", e);
    } finally {
      setIsCalculatingWeights(false);
    }
  };

  // Active run data
  const currentRun = runHistory[activeRunIndex] || null;
  const results = currentRun?.results || null;
  const summary = currentRun?.summary || null;
  const criteriaStats = currentRun?.criteriaStats || null;

  const handleResetAllIterations = () => {
    setRunHistory([]);
    setActiveRunIndex(0);
    setIsNewRunPending(false);
    setViewMode("table");
    setShowResetConfirmModal(false);
  };

  const getEffectiveSeed = (): number | null => {
    if (seedMode === "fixed42") return 42;
    if (seedMode === "fixed100") return 100;
    if (seedMode === "custom") return Number(customSeedInput) || 42;
    return null; // random
  };

  const handleRunSimulation = async () => {
    const targetCriteria = activeCriteria.length > 0 ? activeCriteria : criteria;
    if (!alternatives || alternatives.length === 0 || !targetCriteria || targetCriteria.length === 0) {
      setError("Please ensure alternatives and criteria are configured in your decision matrix.");
      return;
    }

    setIsRunning(true);
    setError("");

    const effectiveSeed = getEffectiveSeed();
    const nextIterationNumber = isNewRunPending ? runHistory.length + 1 : (runHistory.length === 0 ? 1 : (currentRun?.runId || runHistory.length));

    try {
      const res = await fetch("/api/monte-carlo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alternatives,
          criteria: targetCriteria,
          method: selectedMethod,
          trials,
          perturbPct,
          seed: effectiveSeed,
          iteration: nextIterationNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");

      const methodLabel =
        MCDM_METHODS.find((m) => m.value.toLowerCase() === selectedMethod.toLowerCase())?.label ||
        selectedMethod.toUpperCase();

      const newRun: SimulationRun = {
        runId: nextIterationNumber,
        runLabel: `Iteration #${nextIterationNumber} (${methodLabel})`,
        method: selectedMethod,
        methodLabel,
        trials,
        perturbPct,
        seed: data.seed,
        seedMode,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        results: data.stabilityResults,
        summary: data.summary,
        criteriaStats: data.criteriaStats,
      };

      if (isNewRunPending || runHistory.length === 0) {
        setRunHistory((prev) => [...prev, newRun]);
        setActiveRunIndex(runHistory.length);
        setIsNewRunPending(false);
      } else {
        // Overwrite or update current active run
        setRunHistory((prev) => {
          const updated = [...prev];
          updated[activeRunIndex] = newRun;
          return updated;
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to run Monte Carlo simulation.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectIteration = (indexStr: string) => {
    if (indexStr === "new") {
      setIsNewRunPending(true);
    } else if (indexStr === "reset_all") {
      setShowResetConfirmModal(true);
    } else {
      setIsNewRunPending(false);
      setActiveRunIndex(Number(indexStr));
    }
  };

  const handleExportCSV = () => {
    if (!currentRun || !results) return;

    const seedLabel = currentRun.seed !== null ? `Seed #${currentRun.seed} (Deterministic)` : "Fresh Stochastic (Random)";
    const metadataHeader = [
      `# DECISIONALGO MONTE CARLO SENSITIVITY SIMULATION REPORT`,
      `# Method: ${currentRun.methodLabel}`,
      `# Iteration: Run #${currentRun.runId}`,
      `# Trials: ${currentRun.trials}`,
      `# Criteria Perturbation: ±${currentRun.perturbPct}%`,
      `# Reproducibility Seed: ${seedLabel}`,
      `# Timestamp: ${currentRun.timestamp}`,
      `# Baseline Winner: ${currentRun.summary.baseWinner} (Winner Stability: ${currentRun.summary.winnerStabilityPct}%)`,
      `# Rank Reversal Rate: ${currentRun.summary.rankReversalPct}% (${currentRun.summary.overallRobustness})`,
      ``,
    ].join("\n");

    const headers = [
      "Rank",
      "Alternative",
      "Stability (%)",
      "95% CI Margin (±%)",
      "Robustness",
      "Avg Score",
      "Min Score",
      "Max Score",
      "Std Dev",
    ];

    const rows = results.map((r) => [
      `#${r.baseRank}`,
      `"${r.alternativeName}"`,
      `${r.stabilityPct}%`,
      `±${r.ciMargin || 0}%`,
      r.robustness,
      r.avgScore,
      r.minScore,
      r.maxScore,
      r.stdDev,
    ]);

    let csvContent = metadataHeader + headers.join(",") + "\n" + rows.map((row) => row.join(",")).join("\n");

    if (criteriaStats && criteriaStats.length > 0) {
      csvContent += "\n\n# CRITERIA WEIGHT VARIATION FOOTPRINT\nCriterion,Base Weight,Min Simulated,Mean Simulated,Max Simulated\n";
      criteriaStats.forEach((cs) => {
        csvContent += `"${cs.name}",${cs.baseWeight},${cs.minWeight},${cs.meanWeight},${cs.maxWeight}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `monte_carlo_${currentRun.method}_Run${currentRun.runId}_seed${currentRun.seed || "rand"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportGraphPNG = () => {
    const svgElement = document.querySelector("#monte-carlo-chart-container svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svgElement.clientWidth * 2 || 1200;
      canvas.height = svgElement.clientHeight * 2 || 800;
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const png = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = png;
        downloadLink.download = `monte_carlo_${viewMode}_${selectedMethod}_Run${currentRun?.runId || 1}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  const currentMethodLabel =
    MCDM_METHODS.find((m) => m.value.toLowerCase() === selectedMethod.toLowerCase())?.label ||
    selectedMethod.toUpperCase();

  // Prepare stacked rank distribution chart data
  const stackedRankData = React.useMemo(() => {
    if (!results) return [];
    return results.map((r) => {
      const item: Record<string, any> = {
        name: r.alternativeName,
        baseRank: r.baseRank,
      };
      const total = currentRun?.trials || trials || 1000;
      for (let rank = 1; rank <= alternatives.length; rank++) {
        const count = r.rankDistribution[rank] || 0;
        item[`Rank #${rank}`] = parseFloat(((count / total) * 100).toFixed(1));
      }
      return item;
    });
  }, [results, currentRun, trials, alternatives]);

  // Prepare score range chart data
  const scoreRangeData = React.useMemo(() => {
    if (!results) return [];
    return results.map((r) => ({
      name: r.alternativeName,
      avgScore: r.avgScore,
      minScore: r.minScore,
      maxScore: r.maxScore,
      rangeWidth: parseFloat((r.maxScore - r.minScore).toFixed(4)),
      stdDev: r.stdDev,
    }));
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Simulation Configuration Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-blue-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                Peer-Review Robustness Engine
              </span>
              <button
                onClick={() => setShowFormulaModal(true)}
                className="text-xs text-blue-200 underline hover:text-white flex items-center gap-1 font-semibold transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" /> View Mathematical Steps
              </button>
            </div>
            <h3 className="text-xl font-black tracking-tight">Monte Carlo Sensitivity Simulation</h3>
            <p className="text-sm text-blue-200/80 mt-1 max-w-xl leading-relaxed">
              Simulates 1,000+ random weight perturbations across all criteria using{" "}
              <strong className="text-white underline">{currentMethodLabel}</strong> to measure ranking stability and detect rank reversal probabilities.
            </p>
          </div>

          {/* Control Bar: Method, Trials, Perturbation, Seed (Option A), Iteration (Option B) */}
          <div className="flex flex-wrap items-center gap-2.5 bg-black/25 p-3 rounded-xl border border-white/10">
            {/* MCDM Method Selector */}
            <div className="flex items-center bg-white/10 rounded-lg p-1.5 px-2.5 border border-white/10 text-xs">
              <span className="text-blue-200 mr-2 font-medium">Method:</span>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="bg-transparent font-bold text-white outline-none cursor-pointer"
                disabled={isRunning}
              >
                {MCDM_METHODS.map((m) => (
                  <option key={m.value} value={m.value} className="text-gray-900">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Criteria Weight Method Selector */}
            <div className="flex items-center bg-white/10 rounded-lg p-1.5 px-2.5 border border-white/10 text-xs">
              <span className="text-blue-200 mr-2 font-medium">Weights:</span>
              <select
                value={selectedWeightMethod}
                onChange={(e) => handleWeightMethodChange(e.target.value)}
                className="bg-transparent font-bold text-white outline-none cursor-pointer"
                disabled={isRunning || isCalculatingWeights}
              >
                <option value="auto" className="text-gray-900 font-semibold">Active Baseline Weights (Auto)</option>
                <option value="equal" className="text-gray-900">Equal Weights (1/N)</option>
                <option value="entropy" className="text-gray-900">Entropy Weight</option>
                <option value="critic" className="text-gray-900">CRITIC Weight</option>
                <option value="merec" className="text-gray-900">MEREC Weight</option>
                <option value="ahp" className="text-gray-900">AHP Weight</option>
                <option value="swara" className="text-gray-900">SWARA Weight</option>
                <option value="piprecia" className="text-gray-900">PIPRECIA Weight</option>
                <option value="wenslo" className="text-gray-900">WENSLO Weight</option>
                <option value="lopcow" className="text-gray-900">LOPCOW Weight</option>
                <option value="dematel" className="text-gray-900">DEMATEL Weight</option>
                <option value="sd" className="text-gray-900">SD Weight</option>
                <option value="variance" className="text-gray-900">Variance Weight</option>
                <option value="mad" className="text-gray-900">MAD Weight</option>
                <option value="fucom" className="text-gray-900">FUCOM Weight</option>
              </select>
              {isCalculatingWeights && <Loader2 className="w-3 h-3 ml-1 animate-spin text-blue-200" />}
            </div>

            {/* Trials */}
            <div className="flex items-center bg-white/10 rounded-lg p-1.5 px-2.5 border border-white/10 text-xs">
              <span className="text-blue-200 mr-2 font-medium">Trials:</span>
              <select
                value={trials}
                onChange={(e) => setTrials(Number(e.target.value))}
                className="bg-transparent font-bold text-white outline-none cursor-pointer"
                disabled={isRunning}
              >
                <option value={500} className="text-gray-900">500 Trials</option>
                <option value={1000} className="text-gray-900">1,000 Trials</option>
                <option value={5000} className="text-gray-900">5,000 Trials</option>
              </select>
            </div>

            {/* Perturbation % */}
            <div className="flex items-center bg-white/10 rounded-lg p-1.5 px-2.5 border border-white/10 text-xs">
              <span className="text-blue-200 mr-2 font-medium">Perturbation:</span>
              <select
                value={perturbPct}
                onChange={(e) => setPerturbPct(Number(e.target.value))}
                className="bg-transparent font-bold text-white outline-none cursor-pointer"
                disabled={isRunning}
              >
                <option value={10} className="text-gray-900">±10% Variation</option>
                <option value={20} className="text-gray-900">±20% Variation</option>
                <option value={30} className="text-gray-900">±30% Variation</option>
              </select>
            </div>

            {/* OPTION A: Reproducibility Seed Selector */}
            <div className="flex items-center bg-white/10 rounded-lg p-1.5 px-2.5 border border-white/10 text-xs">
              <span className="text-blue-200 mr-1.5 flex items-center gap-1 font-medium">
                {seedMode !== "random" ? <Lock className="w-3 h-3 text-emerald-300" /> : <Unlock className="w-3 h-3 text-amber-300" />}
                Seed:
              </span>
              <select
                value={seedMode}
                onChange={(e) => setSeedMode(e.target.value as any)}
                className="bg-transparent font-bold text-white outline-none cursor-pointer"
                disabled={isRunning}
              >
                <option value="fixed42" className="text-gray-900">Fixed Seed #42 (Reproducible)</option>
                <option value="fixed100" className="text-gray-900">Fixed Seed #100</option>
                <option value="random" className="text-gray-900">Random (Fresh Stochastic)</option>
                <option value="custom" className="text-gray-900">Custom Seed...</option>
              </select>

              {seedMode === "custom" && (
                <input
                  type="number"
                  value={customSeedInput}
                  onChange={(e) => setCustomSeedInput(Number(e.target.value))}
                  placeholder="Seed #"
                  className="w-14 ml-2 px-1 py-0.5 text-xs bg-white text-gray-900 rounded font-mono font-bold outline-none"
                  disabled={isRunning}
                />
              )}
            </div>

            {/* OPTION B: Iteration / Run History Selector */}
            <div className="flex items-center bg-white/10 rounded-lg p-1.5 px-2.5 border border-white/10 text-xs gap-1.5">
              <span className="text-blue-200 mr-0.5 flex items-center gap-1 font-medium">
                <History className="w-3 h-3 text-cyan-300" />
                Iteration:
              </span>
              <select
                value={isNewRunPending ? "new" : String(activeRunIndex)}
                onChange={(e) => handleSelectIteration(e.target.value)}
                className="bg-transparent font-bold text-white outline-none cursor-pointer"
                disabled={isRunning}
              >
                {runHistory.length === 0 && <option value="0" className="text-gray-900">Run #1 (Initial)</option>}
                {runHistory.map((run, idx) => (
                  <option key={run.runId} value={String(idx)} className="text-gray-900">
                    Run #{run.runId} ({run.seed !== null ? `Seed ${run.seed}` : "Random"} • {run.timestamp})
                  </option>
                ))}
                <option value="new" className="text-gray-900 font-bold bg-blue-50">
                  + New Iteration (Run #{runHistory.length + 1})
                </option>
                {runHistory.length > 0 && (
                  <option value="reset_all" className="text-red-700 font-bold bg-red-50">
                    🗑️ Reset / Clear All Runs...
                  </option>
                )}
              </select>

              {runHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  title="Reset & Clear All Iteration History"
                  className="px-2 py-0.5 bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-white rounded border border-red-400/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  disabled={isRunning}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Run Button */}
            <Button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-10 px-5 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Running {trials}...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  {isNewRunPending ? `Run Iteration #${runHistory.length + 1}` : `Run Monte Carlo (${currentMethodLabel})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Summary KPI Cards with Seed & Iteration Metadata */}
      {summary && currentRun && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase">Base Winner ({currentRun.methodLabel})</span>
            <div className="text-lg font-bold text-gray-900 mt-1">{summary.baseWinner}</div>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Rank #1 Baseline
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase">Winner Stability</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {summary.winnerStabilityPct}%
            </div>
            <span className="text-xs text-gray-400">Maintained #1 in {currentRun.trials} trials</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase">Rank Reversal Rate</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">{summary.rankReversalPct}%</div>
            <span className="text-xs text-gray-400">Probability of winner shift</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase">Overall Robustness</span>
            <div className="text-lg font-black text-blue-700 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              {summary.overallRobustness}
            </div>
            <span className="text-xs text-gray-400">Peer-review validation</span>
          </div>

          {/* Active Iteration & Seed Metadata Card */}
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Run Metadata</span>
              <div className="text-sm font-bold text-cyan-300 mt-1 flex items-center gap-1.5">
                <History className="w-4 h-4" /> Iteration #{currentRun.runId}
              </div>
            </div>
            <div className="text-xs text-slate-300 mt-2 font-mono flex items-center gap-1.5">
              {currentRun.seed !== null ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Seed #{currentRun.seed} (Deterministic)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fresh Stochastic (Random)</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Simulation View Area */}
      {results && currentRun && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* View Mode Toggle Header */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider mr-1">Display View:</span>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "table"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" /> Stability Matrix Table
              </button>

              <button
                onClick={() => setViewMode("stability_bar")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "stability_bar"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Stability % Bar Chart
              </button>

              <button
                onClick={() => setViewMode("rank_stacked")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "rank_stacked"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Rank Frequency Stacked Chart
              </button>

              <button
                onClick={() => setViewMode("score_range")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "score_range"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> Score Deviation Chart
              </button>

              {criteriaStats && criteriaStats.length > 0 && (
                <button
                  onClick={() => setViewMode("criteria_weights")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "criteria_weights"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" /> Weight Variation Inspector
                </button>
              )}

              {runHistory.length > 1 && (
                <button
                  onClick={() => setViewMode("history_comparison")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "history_comparison"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <History className="w-3.5 h-3.5" /> Multi-Run Comparison ({runHistory.length})
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {viewMode !== "table" && viewMode !== "criteria_weights" && viewMode !== "history_comparison" && (
                <Button
                  onClick={handleExportGraphPNG}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs flex items-center gap-1.5 text-gray-700 hover:bg-white cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Figure (PNG)
                </Button>
              )}
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="h-8 text-xs flex items-center gap-1.5 text-gray-700 hover:bg-white cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Report (CSV)
              </Button>
            </div>
          </div>

          {/* VIEW MODE 1: Table */}
          {viewMode === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100/75 text-gray-600 border-b border-gray-200 uppercase font-bold text-[11px]">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Alternative</th>
                    <th className="py-3 px-4">Stability Progress</th>
                    <th className="py-3 px-4 text-center">Stability % (95% CI)</th>
                    <th className="py-3 px-4 text-center">Robustness</th>
                    <th className="py-3 px-4 text-right">Avg Score</th>
                    <th className="py-3 px-4 text-right">Score Range [Min - Max]</th>
                    <th className="py-3 px-4 text-right">Std Dev</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((r) => {
                    const badgeColor =
                      r.robustness === "High"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : r.robustness === "Medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200";

                    const barColor =
                      r.robustness === "High"
                        ? "bg-emerald-500"
                        : r.robustness === "Medium"
                        ? "bg-amber-500"
                        : "bg-red-500";

                    return (
                      <tr key={r.alternativeId} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900">#{r.baseRank}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{r.alternativeName}</td>
                        <td className="py-3 px-4 w-44">
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${r.stabilityPct}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-gray-900">
                          {r.stabilityPct}%{" "}
                          <span className="text-[10px] text-gray-400 font-normal">
                            (±{r.ciMargin || 0}%)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                            {r.robustness}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-700">{r.avgScore.toFixed(4)}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-500">
                          [{r.minScore.toFixed(3)} - {r.maxScore.toFixed(3)}]
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-gray-500">±{r.stdDev.toFixed(4)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW MODE 2: Stability % Bar Chart */}
          {viewMode === "stability_bar" && (
            <div id="monte-carlo-chart-container" className="p-6">
              <div className="mb-4">
                <h5 className="font-bold text-sm text-gray-900">Rank Stability % per Alternative</h5>
                <p className="text-xs text-gray-500">
                  Percentage of trials where the alternative retains its exact baseline rank (80% threshold line indicates high robustness for peer review).
                </p>
              </div>

              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="alternativeName" tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "0.75rem", color: "#fff", fontSize: "12px" }}
                      formatter={(val: any) => [`${val}%`, "Stability"]}
                    />
                    <ReferenceLine y={80} stroke="#16a34a" strokeDasharray="4 4" label={{ value: "High Robustness Threshold (80%)", fill: "#16a34a", fontSize: 11, position: "top" }} />
                    <Bar dataKey="stabilityPct" name="Stability %" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Stacked Rank Frequency Chart */}
          {viewMode === "rank_stacked" && (
            <div id="monte-carlo-chart-container" className="p-6">
              <div className="mb-4">
                <h5 className="font-bold text-sm text-gray-900">100% Stacked Rank Frequency Distribution</h5>
                <p className="text-xs text-gray-500">
                  Shows the probability distribution of ranks occupied by each alternative across all {currentRun.trials} random perturbation trials.
                </p>
              </div>

              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stackedRankData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "0.75rem", color: "#fff", fontSize: "12px" }}
                      formatter={(val: any) => [`${val}%`, "Frequency"]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    {Array.from({ length: alternatives.length }).map((_, i) => (
                      <Bar
                        key={`Rank #${i + 1}`}
                        dataKey={`Rank #${i + 1}`}
                        stackId="a"
                        fill={RANK_COLORS[i % RANK_COLORS.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* VIEW MODE 4: Score Deviation / Range Chart */}
          {viewMode === "score_range" && (
            <div id="monte-carlo-chart-container" className="p-6">
              <div className="mb-4">
                <h5 className="font-bold text-sm text-gray-900">Score Range & Standard Deviation Footprint</h5>
                <p className="text-xs text-gray-500">
                  Compares average score (bars) against minimum, maximum, and standard deviation score variations under weight perturbations.
                </p>
              </div>

              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={scoreRangeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "0.75rem", color: "#fff", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar dataKey="avgScore" name="Average Score" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    <Line type="monotone" dataKey="maxScore" name="Max Score" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="minScore" name="Min Score" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* VIEW MODE 5: Criteria Weight Variation Inspector */}
          {viewMode === "criteria_weights" && criteriaStats && (
            <div className="p-6">
              <div className="mb-4">
                <h5 className="font-bold text-sm text-gray-900">Simulated Criteria Weight Perturbation Inspector</h5>
                <p className="text-xs text-gray-500">
                  Detailed inspection of baseline normalized criteria weights vs. simulated minimum, mean, and maximum weight variations across {currentRun.trials} trials.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase font-bold text-[11px]">
                      <th className="py-3 px-4">Criterion</th>
                      <th className="py-3 px-4 text-center">Baseline Weight</th>
                      <th className="py-3 px-4 text-center">Simulated Min Weight</th>
                      <th className="py-3 px-4 text-center">Simulated Mean Weight</th>
                      <th className="py-3 px-4 text-center">Simulated Max Weight</th>
                      <th className="py-3 px-4 text-center">Simulated Range Band</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {criteriaStats.map((cs) => {
                      const rangeBand = (cs.maxWeight - cs.minWeight).toFixed(4);
                      return (
                        <tr key={cs.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-bold text-gray-800">{cs.name}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-indigo-700">
                            {(cs.baseWeight * 100).toFixed(2)}% ({cs.baseWeight.toFixed(4)})
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-red-600">
                            {(cs.minWeight * 100).toFixed(2)}% ({cs.minWeight.toFixed(4)})
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-gray-800">
                            {(cs.meanWeight * 100).toFixed(2)}% ({cs.meanWeight.toFixed(4)})
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-emerald-600">
                            {(cs.maxWeight * 100).toFixed(2)}% ({cs.maxWeight.toFixed(4)})
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-gray-500">
                            ±{(Number(rangeBand) / 2 * 100).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 6: Multi-Run History Comparison */}
          {viewMode === "history_comparison" && (
            <div className="p-6">
              <div className="mb-4">
                <h5 className="font-bold text-sm text-gray-900">Monte Carlo Simulation Iteration History & Convergence</h5>
                <p className="text-xs text-gray-500">
                  Compare stability percentages, winner consistency, and rank reversals across multiple simulation runs.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase font-bold text-[11px]">
                      <th className="py-3 px-4">Run #</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Trials & Variation</th>
                      <th className="py-3 px-4">Seed Mode</th>
                      <th className="py-3 px-4 text-center">Baseline Winner</th>
                      <th className="py-3 px-4 text-center">Winner Stability %</th>
                      <th className="py-3 px-4 text-center">Rank Reversal %</th>
                      <th className="py-3 px-4 text-center">Robustness</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {runHistory.map((run, idx) => (
                      <tr key={run.runId} className={`hover:bg-indigo-50/30 ${idx === activeRunIndex ? "bg-indigo-50/50 font-medium" : ""}`}>
                        <td className="py-3 px-4 font-bold text-indigo-700">Iteration #{run.runId}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{run.methodLabel}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {run.trials} trials (±{run.perturbPct}%)
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          {run.seed !== null ? `Seed #${run.seed}` : "Random"}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">{run.summary.baseWinner}</td>
                        <td className="py-3 px-4 text-center font-bold text-gray-900">{run.summary.winnerStabilityPct}%</td>
                        <td className="py-3 px-4 text-center font-bold text-indigo-600">{run.summary.rankReversalPct}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 border border-gray-200">
                            {run.summary.overallRobustness}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setActiveRunIndex(idx);
                              setViewMode("table");
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-900 font-bold underline cursor-pointer"
                          >
                            View Run #{run.runId}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formula Modal Dialog */}
      <Dialog open={showFormulaModal} onOpenChange={setShowFormulaModal}>
        <DialogContent className="w-[95vw] sm:w-[85vw] md:w-[70vw] h-[90vh] sm:h-screen max-w-none rounded-lg sm:rounded-none border sm:border-0 flex flex-col p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Monte Carlo Sensitivity Simulation</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Mathematical formulation and statistical steps for weight perturbation and rank reversal validation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4 flex-1 overflow-y-auto">
            <MonteCarloFormula />
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Simulation History Confirmation Modal */}
      <Dialog open={showResetConfirmModal} onOpenChange={setShowResetConfirmModal}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
              <RotateCcw className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-black text-gray-900">
              Reset Simulation History?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600 space-y-2 pt-1">
              <span>
                This will clear all <strong>{runHistory.length}</strong> previous simulation iteration(s) and reset the run counter back to <strong>Run #1</strong>.
              </span>
              <span className="text-emerald-800 font-medium bg-emerald-50 p-2.5 rounded-lg block border border-emerald-200 mt-2">
                ✓ <strong>Note:</strong> Your decision matrix values, criteria weights, and alternative ratings will remain completely safe and untouched.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2.5 mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResetConfirmModal(false)}
              className="text-gray-700 font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleResetAllIterations}
              className="bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
            >
              Confirm & Reset to Run #1
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

