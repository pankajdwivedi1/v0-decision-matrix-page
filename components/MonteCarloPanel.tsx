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
  BarChart2,
  CheckCircle2,
  Table as TableIcon,
  BarChart3,
  Layers,
  Activity,
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

interface StabilityResult {
  alternativeId: string;
  alternativeName: string;
  baseRank: number;
  stabilityPct: number;
  mostCommonRank: number;
  avgScore: number;
  minScore: number;
  maxScore: number;
  stdDev: number;
  robustness: "High" | "Medium" | "Low";
  rankDistribution: Record<number, number>;
}

interface MonteCarloSummary {
  baseWinner: string;
  winnerStabilityPct: number;
  rankReversalPct: number;
  overallRobustness: string;
}

type ViewMode = "table" | "stability_bar" | "rank_stacked" | "score_range";

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
  const [trials, setTrials] = useState<number>(1000);
  const [perturbPct, setPerturbPct] = useState<number>(10);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<StabilityResult[] | null>(null);
  const [summary, setSummary] = useState<MonteCarloSummary | null>(null);
  const [error, setError] = useState<string>("");
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  useEffect(() => {
    if (currentMethod) {
      setSelectedMethod(currentMethod);
    }
  }, [currentMethod]);

  const handleRunSimulation = async () => {
    if (!alternatives || alternatives.length === 0 || !criteria || criteria.length === 0) {
      setError("Please ensure alternatives and criteria are configured in your decision matrix.");
      return;
    }

    setIsRunning(true);
    setError("");
    try {
      const res = await fetch("/api/monte-carlo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alternatives,
          criteria,
          method: selectedMethod,
          trials,
          perturbPct,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");

      setResults(data.stabilityResults);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "Failed to run Monte Carlo simulation.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportCSV = () => {
    if (!results) return;
    const headers = ["Alternative", "Base Rank", "Stability (%)", "Robustness", "Avg Score", "Min Score", "Max Score", "Std Dev"];
    const rows = results.map((r) => [
      `"${r.alternativeName}"`,
      r.baseRank,
      `${r.stabilityPct}%`,
      r.robustness,
      r.avgScore,
      r.minScore,
      r.maxScore,
      r.stdDev,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `monte_carlo_${selectedMethod}_${trials}_trials.csv`;
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
        downloadLink.download = `monte_carlo_${viewMode}_${selectedMethod}.png`;
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
      const total = trials || 1000;
      for (let rank = 1; rank <= alternatives.length; rank++) {
        const count = r.rankDistribution[rank] || 0;
        item[`Rank #${rank}`] = parseFloat(((count / total) * 100).toFixed(1));
      }
      return item;
    });
  }, [results, trials, alternatives]);

  // Prepare score range / boxplot chart data
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
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                Peer-Review Robustness Engine
              </span>
              <button
                onClick={() => setShowFormulaModal(true)}
                className="text-xs text-blue-200 underline hover:text-white flex items-center gap-1 font-semibold"
              >
                <BookOpen className="w-3.5 h-3.5" /> View Mathematical Steps
              </button>
            </div>
            <h3 className="text-xl font-black tracking-tight">Monte Carlo Sensitivity Simulation</h3>
            <p className="text-sm text-blue-200/80 mt-1 max-w-xl">
              Simulates 1,000+ random weight perturbations across all criteria using{" "}
              <strong className="text-white underline">{currentMethodLabel}</strong> to measure ranking stability and detect rank reversal probabilities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* MCDM Method Selector */}
            <div className="flex items-center bg-white/10 rounded-lg p-1.5 px-3 border border-white/10 text-xs">
              <span className="text-blue-200 mr-2">Method:</span>
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

            {/* Trials */}
            <div className="flex items-center bg-white/10 rounded-lg p-1.5 px-3 border border-white/10 text-xs">
              <span className="text-blue-200 mr-2">Trials:</span>
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
            <div className="flex items-center bg-white/10 rounded-lg p-1.5 px-3 border border-white/10 text-xs">
              <span className="text-blue-200 mr-2">Perturbation:</span>
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

            <Button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-10 px-5 shadow-lg shadow-emerald-500/20"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running {trials}...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Run Monte Carlo ({currentMethodLabel})
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

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase">Base Winner ({currentMethodLabel})</span>
            <div className="text-lg font-bold text-gray-900 mt-1">{summary.baseWinner}</div>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Rank #1 Baseline
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-500 font-semibold uppercase">Winner Stability</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{summary.winnerStabilityPct}%</div>
            <span className="text-xs text-gray-400">Maintained #1 in {trials} trials</span>
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
        </div>
      )}

      {/* Main Simulation View Area */}
      {results && (
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
            </div>

            <div className="flex items-center gap-2">
              {viewMode !== "table" && (
                <Button
                  onClick={handleExportGraphPNG}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs flex items-center gap-1.5 text-gray-700 hover:bg-white"
                >
                  <Download className="w-3.5 h-3.5" /> Export Figure (PNG)
                </Button>
              )}
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="h-8 text-xs flex items-center gap-1.5 text-gray-700 hover:bg-white"
              >
                <Download className="w-3.5 h-3.5" /> Export Data (CSV)
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
                    <th className="py-3 px-4 text-center">Stability %</th>
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
                        <td className="py-3 px-4 text-center font-bold text-gray-900">{r.stabilityPct}%</td>
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
                  Shows the probability distribution of ranks occupied by each alternative across all {trials} random perturbation trials.
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
    </div>
  );
}
