"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from "recharts";
import { Download, PieChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Alternative {
  id: string;
  name: string;
  scores: Record<string, number>;
}

interface Criterion {
  id: string;
  name: string;
  weight: number;
  type: "beneficial" | "non-beneficial";
}

interface RadarChartPanelProps {
  alternatives: Alternative[];
  criteria: Criterion[];
}

const PRESET_COLORS = [
  "#2563eb", // Blue
  "#16a34a", // Green
  "#dc2626", // Red
  "#9333ea", // Purple
  "#ea580c", // Orange
  "#0891b2", // Cyan
  "#4d7c0f", // Lime
  "#be185d", // Pink
  "#15803d", // Dark Green
  "#4338ca", // Indigo
];

export default function RadarChartPanel({ alternatives, criteria }: RadarChartPanelProps) {
  // Pre-select top 5 alternatives
  const [selectedAltIds, setSelectedAltIds] = useState<string[]>(() => {
    return alternatives.slice(0, 5).map((a) => a.id);
  });

  // Calculate Min-Max Normalized Matrix (0.0 to 1.0) so Radar axes are uniformly scaled
  const radarData = useMemo(() => {
    if (!alternatives.length || !criteria.length) return [];

    // Min and Max per criterion
    const minMaxMap: Record<string, { min: number; max: number }> = {};
    criteria.forEach((c) => {
      const vals = alternatives.map((a) => a.scores[c.id] || 0);
      minMaxMap[c.id] = {
        min: Math.min(...vals),
        max: Math.max(...vals),
      };
    });

    // Build Recharts data points (one per criterion)
    return criteria.map((c) => {
      const point: Record<string, any> = {
        criterion: c.name || c.id,
        criterionId: c.id,
      };

      const { min, max } = minMaxMap[c.id];
      const range = max - min === 0 ? 1 : max - min;

      alternatives.forEach((a) => {
        const rawVal = a.scores[c.id] || 0;
        let normVal = 0;
        if (c.type === "non-beneficial") {
          // Cost criterion: smaller raw value is better (1.0 = best/lowest cost)
          normVal = (max - rawVal) / range;
        } else {
          // Beneficial criterion: larger raw value is better (1.0 = best/highest benefit)
          normVal = (rawVal - min) / range;
        }
        point[a.id] = parseFloat(normVal.toFixed(3));
      });

      return point;
    });
  }, [alternatives, criteria]);

  const toggleAlternative = (id: string) => {
    setSelectedAltIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedAltIds(alternatives.map((a) => a.id));
  };

  const selectTop3 = () => {
    setSelectedAltIds(alternatives.slice(0, 3).map((a) => a.id));
  };

  const handleExportPNG = () => {
    const svgElement = document.querySelector("#radar-chart-container svg");
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
        downloadLink.download = "mcdm_radar_chart_figure.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  if (!alternatives.length || !criteria.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Journal Figure Generator
            </span>
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Normalized Performance Footprint (0.0 to 1.0)
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            Alternative Radar Footprint Spectrum
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Multi-criteria spider visualization mapping alternative performance footprints across all decision dimensions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={selectTop3}
            variant="outline"
            size="sm"
            className="text-xs h-8 text-gray-700"
          >
            Top 3 Only
          </Button>
          <Button
            onClick={selectAll}
            variant="outline"
            size="sm"
            className="text-xs h-8 text-gray-700"
          >
            Select All
          </Button>
          <Button
            onClick={handleExportPNG}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 text-xs px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export High-Res Figure (PNG)
          </Button>
        </div>
      </div>

      {/* Alternative Selectors */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
        <span className="font-bold text-gray-700 mr-2">Toggle Alternatives:</span>
        {alternatives.map((alt, idx) => {
          const isSelected = selectedAltIds.includes(alt.id);
          const color = PRESET_COLORS[idx % PRESET_COLORS.length];
          return (
            <button
              key={alt.id}
              onClick={() => toggleAlternative(alt.id)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-white border-gray-300 text-gray-900 shadow-xs"
                  : "bg-transparent border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: isSelected ? color : "#cbd5e1" }}
              />
              {alt.name}
            </button>
          );
        })}
      </div>

      {/* Recharts Radar Chart */}
      <div id="radar-chart-container" className="w-full h-[450px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="criterion"
              tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 1]}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              stroke="#cbd5e1"
            />

            {alternatives.map((alt, idx) => {
              if (!selectedAltIds.includes(alt.id)) return null;
              const color = PRESET_COLORS[idx % PRESET_COLORS.length];
              return (
                <Radar
                  key={alt.id}
                  name={alt.name}
                  dataKey={alt.id}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              );
            })}

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "0.75rem",
                color: "#ffffff",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}% Relative Performance`, "Score"]}
            />
            <Legend
              wrapperStyle={{ paddingTop: "15px", fontSize: "12px" }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
        <strong>Academic Journal Usage Note:</strong> Normalized radar values represent relative performance metrics (0.0 = Worst, 1.0 = Optimal). Non-beneficial criteria (e.g. Cost, Risk, Pollution) are automatically inverted so that an outer perimeter score always represents superior performance.
      </div>
    </div>
  );
}
