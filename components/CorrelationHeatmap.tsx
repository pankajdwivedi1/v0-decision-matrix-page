"use client";

import React, { useMemo, useState, useRef, useCallback } from "react";
import { ResearchAssetHeader } from "./ResearchAssetHeader";
import { Card, CardContent } from "@/components/ui/card";

interface CorrelationHeatmapProps {
  data: Record<string, Record<string, number>>;
  assetKey: string;
  defaultLabel: string;
  title: string;
  onLabelChange?: (key: string, label: string) => void;
  onAiAnalysis?: (key: string) => void;
  included?: boolean;
  onIncludeChange?: (key: string, included: boolean) => void;
}

// ─── Color Scheme Definitions ────────────────────────────────────────────────

type SchemeKey = "blues" | "vibgyor" | "greens" | "reds" | "coolwarm" | "plasma";

interface ColorScheme {
  label: string;
  swatch: string[];
  gradient: string;
  getColor: (t: number) => string;
  getTextColor: (t: number) => string;
}

const SCHEMES: Record<SchemeKey, ColorScheme> = {
  blues: {
    label: "Blues",
    swatch: ["#f7fbff", "#084594"],
    gradient: "linear-gradient(to top, #f7fbff, #deebf7, #c6dbef, #9ecae1, #6baed6, #4292c6, #2171b5, #084594)",
    getColor: (t) => {
      const c = Math.max(0, Math.min(1, t));
      return `rgb(${Math.round(247 * (1 - c) + 8 * c)},${Math.round(251 * (1 - c) + 48 * c)},${Math.round(255 * (1 - c) + 107 * c)})`;
    },
    getTextColor: (t) => (t > 0.45 ? "text-white" : "text-gray-900"),
  },
  vibgyor: {
    label: "VIBGYOR",
    swatch: ["hsl(270,85%,48%)", "hsl(0,85%,48%)"],
    gradient: "linear-gradient(to top, hsl(270,85%,48%), hsl(225,85%,48%), hsl(180,85%,48%), hsl(120,85%,48%), hsl(60,85%,48%), hsl(30,85%,48%), hsl(0,85%,48%))",
    getColor: (t) => `hsl(${((1 - Math.max(0, Math.min(1, t))) * 270).toFixed(1)},85%,48%)`,
    getTextColor: (t) => {
      const hue = (1 - Math.max(0, Math.min(1, t))) * 270;
      return hue >= 55 && hue <= 155 ? "text-gray-900" : "text-white";
    },
  },
  greens: {
    label: "Greens",
    swatch: ["#f7fcf5", "#00441b"],
    gradient: "linear-gradient(to top, #f7fcf5, #c7e9c0, #74c476, #31a354, #006d2c, #00441b)",
    getColor: (t) => {
      const c = Math.max(0, Math.min(1, t));
      return `rgb(${Math.round(247 * (1 - c))},${Math.round(252 * (1 - c) + 68 * c)},${Math.round(245 * (1 - c) + 27 * c)})`;
    },
    getTextColor: (t) => (t > 0.5 ? "text-white" : "text-gray-900"),
  },
  reds: {
    label: "Reds",
    swatch: ["#fff5f0", "#67000d"],
    gradient: "linear-gradient(to top, #fff5f0, #fcc0a1, #fc8d59, #ef3b2c, #a50f15, #67000d)",
    getColor: (t) => {
      const c = Math.max(0, Math.min(1, t));
      return `rgb(${Math.round(255 * (1 - c) + 103 * c)},${Math.round(245 * (1 - c))},${Math.round(240 * (1 - c) + 13 * c)})`;
    },
    getTextColor: (t) => (t > 0.45 ? "text-white" : "text-gray-900"),
  },
  coolwarm: {
    label: "Cool–Warm",
    swatch: ["#3b4cc0", "#b40426"],
    gradient: "linear-gradient(to top, #3b4cc0, #6f88fc, #b2ccfb, #f7f7f7, #f7a789, #e0432d, #b40426)",
    getColor: (t) => {
      const c = Math.max(0, Math.min(1, t));
      if (c < 0.5) {
        const s = c * 2;
        return `rgb(${Math.round(59 * (1 - s) + 247 * s)},${Math.round(76 * (1 - s) + 247 * s)},${Math.round(192 * (1 - s) + 247 * s)})`;
      }
      const s = (c - 0.5) * 2;
      return `rgb(${Math.round(247 * (1 - s) + 180 * s)},${Math.round(247 * (1 - s) + 4 * s)},${Math.round(247 * (1 - s) + 38 * s)})`;
    },
    getTextColor: (t) => {
      const c = Math.max(0, Math.min(1, t));
      return c < 0.25 || c > 0.75 ? "text-white" : "text-gray-900";
    },
  },
  plasma: {
    label: "Plasma",
    swatch: ["#0d0887", "#f0f921"],
    gradient: "linear-gradient(to top, #0d0887, #6a00a8, #b12a90, #e16462, #fca636, #f0f921)",
    getColor: (t) => {
      const c = Math.max(0, Math.min(1, t));
      return `hsl(${(300 - c * 240).toFixed(1)},90%,${(20 + c * 55).toFixed(1)}%)`;
    },
    getTextColor: (t) => (t > 0.65 ? "text-gray-900" : "text-white"),
  },
};

// ─── Slider control helper ────────────────────────────────────────────────────

function DimSlider({
  label, value, min, max, step, unit, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
        <span className="text-[10px] font-bold text-gray-700 bg-gray-100 rounded px-1.5 py-0.5">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-gray-800"
      />
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CorrelationHeatmap({
  data,
  assetKey,
  defaultLabel,
  title,
  onLabelChange,
  onAiAnalysis,
  included,
  onIncludeChange,
}: CorrelationHeatmapProps) {
  // Color scheme
  const [colorScheme, setColorScheme] = useState<SchemeKey>("blues");
  const scheme = SCHEMES[colorScheme];

  // Dimension controls
  const [cellWidth, setCellWidth] = useState(80);
  const [cellHeight, setCellHeight] = useState(80);
  const [headerHeight, setHeaderHeight] = useState(40);
  const [leftWidth, setLeftWidth] = useState(80);
  const [fontSize, setFontSize] = useState(14);

  // Settings panel toggle
  const [showSettings, setShowSettings] = useState(false);

  // Download state
  const [downloading, setDownloading] = useState(false);
  const heatmapRef = useRef<HTMLDivElement>(null);

  const labels = useMemo(() => Object.keys(data), [data]);

  if (labels.length === 0) return null;

  const totalWidth = labels.length * cellWidth;
  const totalHeight = labels.length * cellHeight;

  // Data-adaptive normalization
  const allValues: number[] = [];
  labels.forEach((row) =>
    labels.forEach((col) => {
      allValues.push(data[row]?.[col] ?? 0);
    })
  );
  const dataMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const dataMax = allValues.length > 0 ? Math.max(...allValues) : 1;
  const dataRange = dataMax - dataMin || 1;
  const normalize = (v: number) => (v - dataMin) / dataRange;

  const tickCount = 6;
  const legendTicks = Array.from({ length: tickCount }, (_, i) =>
    parseFloat((dataMin + (dataMax - dataMin) * (i / (tickCount - 1))).toFixed(2))
  ).reverse();

  // Download handler
  const handleDownload = useCallback(async () => {
    if (!heatmapRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");

      // Higher density for journal-ready quality
      const dataUrl = await toPng(heatmapRef.current, {
        cacheBust: true,
        pixelRatio: 5,      // Matching Step 6 (600 DPI equivalent)
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_heatmap_${cellWidth}x${cellHeight}_${colorScheme}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [colorScheme, cellWidth, cellHeight, title]);

  return (
    <Card className="border-gray-100 bg-white shadow-none w-full mb-12 overflow-hidden">
      <div className="px-6 pt-4">
        <ResearchAssetHeader
          assetKey={assetKey}
          defaultLabel={defaultLabel}
          title={title}
          onLabelChange={onLabelChange}
          onAiAnalysis={onAiAnalysis}
          included={included}
          onIncludeChange={onIncludeChange}
        />
      </div>

      <CardContent className="p-12 flex flex-col items-center justify-center">

        {/* ── Toolbar: Palette + Settings + Download ── */}
        <div className="w-full flex flex-wrap items-start justify-between gap-4 mb-8">

          {/* Color Palette swatches */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">
              Color Palette:
            </span>
            {(Object.keys(SCHEMES) as SchemeKey[]).map((key) => {
              const s = SCHEMES[key];
              const isActive = colorScheme === key;
              return (
                <button
                  key={key}
                  onClick={() => setColorScheme(key)}
                  title={s.label}
                  className="flex flex-col items-center gap-1 group transition-transform hover:scale-110 focus:outline-none"
                >
                  <div
                    className={`w-8 h-8 rounded-md border-2 shadow-sm transition-all ${isActive
                      ? "border-gray-900 ring-2 ring-offset-1 ring-gray-700 scale-110"
                      : "border-gray-300 hover:border-gray-600"
                      }`}
                    style={{ background: `linear-gradient(135deg, ${s.swatch[0]} 0%, ${s.swatch[1]} 100%)` }}
                  />
                  <span className={`text-[9px] font-bold uppercase tracking-wide transition-colors ${isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                    }`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Settings toggle + Download */}
          <div className="flex items-center gap-3">
            {/* Settings toggle button */}
            <button
              onClick={() => setShowSettings((v) => !v)}
              title="Dimension Settings"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] font-black uppercase tracking-widest transition-all ${showSettings
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-600 hover:text-gray-900"
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Dimensions
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              title="Download high-quality PNG"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-gray-900 text-white border-gray-900 text-[11px] font-black uppercase tracking-widest hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Exporting…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Download PNG
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Dimension Settings Panel ── */}
        {showSettings && (
          <div className="w-full mb-8 p-5 rounded-xl border border-gray-200 bg-gray-50 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <DimSlider
              label="Box Width"
              value={cellWidth} min={40} max={150} step={5} unit="px"
              onChange={setCellWidth}
            />
            <DimSlider
              label="Box Height"
              value={cellHeight} min={40} max={150} step={5} unit="px"
              onChange={setCellHeight}
            />
            <DimSlider
              label="Box Text Size"
              value={fontSize} min={8} max={24} step={1} unit="px"
              onChange={setFontSize}
            />
            <DimSlider
              label="Top Header Height"
              value={headerHeight} min={24} max={80} step={4} unit="px"
              onChange={setHeaderHeight}
            />
            <DimSlider
              label="Left Label Width"
              value={leftWidth} min={40} max={200} step={5} unit="px"
              onChange={setLeftWidth}
            />
          </div>
        )}

        {/* ── Heatmap (captured for download) ── */}
        <div
          ref={heatmapRef}
          className="flex flex-col items-start bg-white p-10 select-none"
        >
          {/* TOP BOXED LABELS */}
          <div className="flex">
            <div
              style={{ width: leftWidth, height: headerHeight }}
              className="border-t border-l border-b border-black bg-gray-100"
            />
            <div className="flex" style={{ width: totalWidth }}>
              {labels.map((label, idx) => (
                <div
                  key={`top-box-${label}`}
                  style={{ width: cellWidth, height: headerHeight }}
                  className={`flex items-center justify-center border-t border-b border-black bg-gray-50 border-l ${idx === labels.length - 1 ? "border-r" : ""
                    }`}
                >
                  <span className="text-gray-900 text-[11px] font-black uppercase truncate px-1">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start">
            {/* LEFT BOXED LABELS */}
            <div className="flex flex-col">
              {labels.map((label) => (
                <div
                  key={`left-box-${label}`}
                  style={{ height: cellHeight, width: leftWidth }}
                  className="flex items-center justify-center border-l border-b border-r border-black bg-gray-50"
                >
                  <span className="text-gray-900 text-[11px] font-black uppercase truncate px-1">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Matrix Grid */}
            <div
              className="grid border-r border-black shadow-md"
              style={{
                gridTemplateColumns: `repeat(${labels.length}, ${cellWidth}px)`,
                width: totalWidth,
                height: totalHeight,
              }}
            >
              {labels.map((rowLabel) =>
                labels.map((colLabel) => {
                  const value = data[rowLabel]?.[colLabel] ?? 0;
                  const norm = normalize(value);
                  const textColor = scheme.getTextColor(norm);
                  return (
                    <div
                      key={`${rowLabel}-${colLabel}`}
                      style={{
                        width: cellWidth,
                        height: cellHeight,
                        backgroundColor: scheme.getColor(norm),
                      }}
                      className="flex items-center justify-center border-b border-r border-black/20"
                    >
                      <span
                        className={`font-bold ${textColor}`}
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {value.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Rotated "Correlation" label */}
            <div
              className="flex items-center justify-center mx-4"
              style={{ height: totalHeight, minWidth: "24px" }}
            >
              <span
                className="text-[11px] font-black uppercase text-gray-700 tracking-widest whitespace-nowrap"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                Correlation
              </span>
            </div>

            {/* Color Bar LEGEND */}
            <div className="flex flex-col items-center h-full self-stretch mr-16">
              <div
                className="w-5 border border-black relative rounded-sm shadow-sm"
                style={{ height: totalHeight, background: scheme.gradient }}
              >
                {legendTicks.map((val, i) => {
                  const top = (i / (legendTicks.length - 1)) * 100;
                  return (
                    <div
                      key={val}
                      className="absolute -right-3 w-4 h-[1px] bg-black"
                      style={{ top: `${top}%` }}
                    >
                      <span className="absolute left-6 -top-2 text-[11px] font-bold text-gray-700 whitespace-nowrap">
                        {val.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-gray-300 text-[10px] font-bold tracking-[0.3em] uppercase">
          Pairwise {title} Matrix
        </div>
      </CardContent>
    </Card>
  );
}
