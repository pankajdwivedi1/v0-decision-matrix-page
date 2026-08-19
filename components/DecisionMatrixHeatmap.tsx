"use client";

import React, { useState } from "react";
import type { Alternative, Criterion } from "@/app/api/calculate/types";

interface HeatmapProps {
  alternatives: Alternative[];
  criteria: Criterion[];
}

export default function DecisionMatrixHeatmap({ alternatives, criteria }: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ altName: string; critName: string; val: number } | null>(null);

  if (!alternatives || alternatives.length === 0 || !criteria || criteria.length === 0) {
    return null;
  }

  // Calculate min and max per criterion for normalized color scale (0 to 1)
  const minMax: Record<string, { min: number; max: number }> = {};
  criteria.forEach((crit) => {
    const vals = alternatives.map((alt) => Number(alt.scores[crit.id]) || 0);
    minMax[crit.id] = {
      min: Math.min(...vals),
      max: Math.max(...vals),
    };
  });

  const getColor = (val: number, crit: Criterion) => {
    const { min, max } = minMax[crit.id] || { min: 0, max: 1 };
    const range = max - min || 1;
    let normalized = (val - min) / range;
    if (crit.type !== "beneficial") {
      normalized = 1 - normalized; // Invert for cost criteria
    }

    // Color gradient from Red (0) -> Yellow (0.5) -> Green (1)
    if (normalized >= 0.5) {
      const greenIntensity = Math.round((normalized - 0.5) * 2 * 200 + 55);
      return `rgba(16, 185, 129, ${0.2 + normalized * 0.7})`;
    } else {
      return `rgba(239, 68, 68, ${0.2 + (1 - normalized) * 0.6})`;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-5 space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h4 className="font-bold text-sm text-gray-900">Decision Matrix Heatmap Spectrum</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Color intensity indicates performance: Green = Superior (Ideal) | Red = Suboptimal
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-400 inline-block" /> Low Performance
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> High Performance
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
              <th className="py-2.5 px-3 text-left">Alternative</th>
              {criteria.map((crit) => (
                <th key={crit.id} className="py-2.5 px-3 whitespace-nowrap">
                  {crit.name}
                  <span className="block text-[10px] font-normal text-gray-400">
                    {crit.type === "beneficial" ? "Max ↑" : "Min ↓"} ({(crit.weight * 100).toFixed(1)}%)
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alternatives.map((alt) => (
              <tr key={alt.id}>
                <td className="py-2.5 px-3 font-semibold text-left text-gray-800 bg-gray-50/50">
                  {alt.name}
                </td>
                {criteria.map((crit) => {
                  const val = Number(alt.scores[crit.id]) || 0;
                  const bgColor = getColor(val, crit);
                  return (
                    <td
                      key={crit.id}
                      style={{ backgroundColor: bgColor }}
                      onMouseEnter={() => setHoveredCell({ altName: alt.name, critName: crit.name, val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className="py-2.5 px-3 font-mono font-medium text-gray-900 border border-white/40 cursor-default transition-transform hover:scale-105"
                    >
                      {typeof val === "number" ? val.toFixed(2) : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredCell && (
        <div className="text-center text-xs font-semibold text-indigo-700 bg-indigo-50/60 py-1.5 rounded-lg border border-indigo-100">
          {hoveredCell.altName} → {hoveredCell.critName}: <strong>{hoveredCell.val}</strong>
        </div>
      )}
    </div>
  );
}
