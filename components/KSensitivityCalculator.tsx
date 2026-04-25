"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import AHPFormula from "./AHPFormula";
import PIPRECIAFormula from "./PIPRECIAFormula";
import { ComposedChart, LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, LabelList, ReferenceLine, Customized } from 'recharts';
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
import { ChartVisualConfigurator, ChartSettings } from "@/components/ChartVisualConfigurator";



// ─── 3D Bar Chart Component (True Matplotlib Clone) ───────────────────
const ThreeDChart = ({ data, criteria, variationRange, elev: elevDeg, azim: azimDeg, type = 'bar' }: any) => {
  const width = 900;
  const height = 700;
  
  const elev = (elevDeg || 22) * (Math.PI / 180);
  const azim = (azimDeg || -55) * (Math.PI / 180);
  
  const xSpacing = 42;
  const ySpacing = 38;
  const zScale = 520;
  const dx = 10;
  const dy = 10;

  const project = (x: number, y: number, z: number) => {
    const x1 = x * Math.cos(azim) - y * Math.sin(azim);
    const y1 = x * Math.sin(azim) + y * Math.cos(azim);
    const y2 = y1 * Math.cos(elev) - z * Math.sin(elev);
    const z2 = y1 * Math.sin(elev) + z * Math.cos(elev);
    return { x: 400 + x1, y: 380 - z2, depth: y2 };
  };

  const getJetColor = (p: number) => {
    const stops = [[0,0,131],[0,0,255],[0,255,255],[0,255,0],[255,255,0],[255,0,0],[128,0,0]];
    const idx = Math.min(stops.length - 2, Math.floor(p * (stops.length - 1)));
    const rem = (p * (stops.length - 1)) - idx;
    const r = Math.round(stops[idx][0] + (stops[idx+1][0] - stops[idx][0]) * rem);
    const g = Math.round(stops[idx][1] + (stops[idx+1][1] - stops[idx][1]) * rem);
    const b = Math.round(stops[idx][2] + (stops[idx+1][2] - stops[idx][2]) * rem);
    return `rgb(${r},${g},${b})`;
  };

  const xMin = - (variationRange.length / 2) * xSpacing;
  const yMin = - (criteria.length / 2) * ySpacing;
  const xMaxBound = xMin + (variationRange.length - 1) * xSpacing;
  const yMaxBound = yMin + (criteria.length - 1) * ySpacing;
  const cageXMax = xMaxBound + dx * 2;
  const cageYMax = yMaxBound + dy * 2;
  const zMax = 0.45 * zScale;

  const elements: any[] = [];
  
  if (type === 'bar') {
    variationRange.forEach((v: number, vIdx: number) => {
      criteria.forEach((crit: any, cIdx: number) => {
        const val = data[vIdx] ? data[vIdx][crit.name] : 0;
        const x = xMin + vIdx * xSpacing;
        const y = yMin + cIdx * ySpacing;
        const h = val * zScale;
        const vpts = [
          project(x, y, 0), project(x + dx, y, 0), project(x + dx, y + dy, 0), project(x, y + dy, 0),
          project(x, y, h), project(x + dx, y, h), project(x + dx, y + dy, h), project(x, y + dy, h)
        ];
        elements.push({
          type: 'bar',
          color: getJetColor(vIdx / (variationRange.length - 1)),
          v: vpts,
          depth: vpts.reduce((acc, p) => acc + p.depth, 0) / 8
        });
      });
    });
  } else if (type === 'scatter' || type === 'stem') {
    variationRange.forEach((v: number, vIdx: number) => {
      criteria.forEach((crit: any, cIdx: number) => {
        const val = data[vIdx] ? data[vIdx][crit.name] : 0;
        const x = xMin + vIdx * xSpacing + dx/2;
        const y = yMin + cIdx * ySpacing + dy/2;
        const h = val * zScale;
        const pt = project(x, y, h);
        const base = project(x, y, 0);
        elements.push({
          type: type,
          color: getJetColor(vIdx / (variationRange.length - 1)),
          pt, base,
          depth: pt.depth
        });
      });
    });
  } else if (type === 'surface') {
    for (let i = 0; i < variationRange.length - 1; i++) {
      for (let j = 0; j < criteria.length - 1; j++) {
        const x1 = xMin + i * xSpacing + dx/2;
        const x2 = xMin + (i + 1) * xSpacing + dx/2;
        const y1 = yMin + j * ySpacing + dy/2;
        const y2 = yMin + (j + 1) * ySpacing + dy/2;
        
        const z11 = (data[i]?.[criteria[j].name] || 0) * zScale;
        const z12 = (data[i]?.[criteria[j+1].name] || 0) * zScale;
        const z21 = (data[i+1]?.[criteria[j].name] || 0) * zScale;
        const z22 = (data[i+1]?.[criteria[j+1].name] || 0) * zScale;

        const pts = [
          project(x1, y1, z11), project(x2, y1, z21),
          project(x2, y2, z22), project(x1, y2, z12)
        ];

        elements.push({
          type: 'surface',
          color: getJetColor(i / (variationRange.length - 1)),
          v: pts,
          depth: pts.reduce((acc, p) => acc + p.depth, 0) / 4
        });
      }
    }
  }

  elements.sort((a, b) => b.depth - a.depth);
  const zTicks = [0, 10, 20, 30, 40];

  const pX1 = project(xMin, yMin, 0);
  const pX2 = project(cageXMax, yMin, 0);
  const angleX = Math.atan2(pX2.y - pX1.y, pX2.x - pX1.x) * (180 / Math.PI);

  const pY1 = project(cageXMax, yMin, 0);
  const pY2 = project(cageXMax, cageYMax, 0);
  const angleY = Math.atan2(pY2.y - pY1.y, pY2.x - pY1.x) * (180 / Math.PI);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Cage Planes - Moved to Back Sides (xMin and cageYMax) */}
        {/* Floor */}
        <path d={`M ${project(xMin, yMin, 0).x} ${project(xMin, yMin, 0).y} L ${project(cageXMax, yMin, 0).x} ${project(cageXMax, yMin, 0).y} L ${project(cageXMax, cageYMax, 0).x} ${project(cageXMax, cageYMax, 0).y} L ${project(xMin, cageYMax, 0).x} ${project(xMin, cageYMax, 0).y} Z`} fill="#f9f9f9" stroke="#999" strokeWidth="0.8" />
        
        {/* Left Wall (YZ plane at xMin) */}
        <path d={`M ${project(xMin, yMin, 0).x} ${project(xMin, yMin, 0).y} L ${project(xMin, cageYMax, 0).x} ${project(xMin, cageYMax, 0).y} L ${project(xMin, cageYMax, zMax).x} ${project(xMin, cageYMax, zMax).y} L ${project(xMin, yMin, zMax).x} ${project(xMin, yMin, zMax).y} Z`} fill="#f4f4f4" stroke="#999" strokeWidth="0.8" />
        
        {/* Back Wall (XZ plane at cageYMax) */}
        <path d={`M ${project(xMin, cageYMax, 0).x} ${project(xMin, cageYMax, 0).y} L ${project(cageXMax, cageYMax, 0).x} ${project(cageXMax, cageYMax, 0).y} L ${project(cageXMax, cageYMax, zMax).x} ${project(cageXMax, cageYMax, zMax).y} L ${project(xMin, cageYMax, zMax).x} ${project(xMin, cageYMax, zMax).y} Z`} fill="#eeeeee" stroke="#999" strokeWidth="0.8" />

        {/* Grid Lines on Floor */}
        {variationRange.map((_: any, i: number) => {
          const x = xMin + i * xSpacing + dx/2;
          return <line key={`fx-${i}`} x1={project(x, yMin, 0).x} y1={project(x, yMin, 0).y} x2={project(x, cageYMax, 0).x} y2={project(x, cageYMax, 0).y} stroke="#ccc" strokeWidth="0.6" />;
        })}
        {criteria.map((_: any, i: number) => {
          const y = yMin + i * ySpacing + dy/2;
          return <line key={`fy-${i}`} x1={project(xMin, y, 0).x} y1={project(xMin, y, 0).y} x2={project(cageXMax, y, 0).x} y2={project(cageXMax, y, 0).y} stroke="#ccc" strokeWidth="0.6" />;
        })}

        {/* Grid Lines on Walls (Z-axis ticks) */}
        {zTicks.map(z => {
          const h = (z/100) * zScale;
          const pBackLeft = project(xMin, cageYMax, h);
          return (
            <g key={`hz-${z}`}>
              <line x1={pBackLeft.x} y1={pBackLeft.y} x2={project(xMin, yMin, h).x} y2={project(xMin, yMin, h).y} stroke="#ccc" strokeWidth="0.6" />
              <line x1={pBackLeft.x} y1={pBackLeft.y} x2={project(cageXMax, cageYMax, h).x} y2={project(cageXMax, cageYMax, h).y} stroke="#ccc" strokeWidth="0.6" />
            </g>
          );
        })}

        {/* Data Elements (Sorted by Depth) */}
        {elements.map((el: any, i: number) => {
          if (el.type === 'bar') {
            const v = el.v;
            return (
              <g key={`el-${i}`}>
                <path d={`M ${v[4].x} ${v[4].y} L ${v[5].x} ${v[5].y} L ${v[6].x} ${v[6].y} L ${v[7].x} ${v[7].y} Z`} fill={el.color} stroke="#000" strokeWidth="0.3" />
                <path d={`M ${v[0].x} ${v[0].y} L ${v[1].x} ${v[1].y} L ${v[5].x} ${v[5].y} L ${v[4].x} ${v[4].y} Z`} fill={el.color} opacity="0.9" stroke="#000" strokeWidth="0.3" />
                <path d={`M ${v[1].x} ${v[1].y} L ${v[2].x} ${v[2].y} L ${v[6].x} ${v[6].y} L ${v[5].x} ${v[5].y} Z`} fill={el.color} opacity="0.8" stroke="#000" strokeWidth="0.3" />
              </g>
            );
          } else if (el.type === 'scatter') {
            return <circle key={`el-${i}`} cx={el.pt.x} cy={el.pt.y} r="6" fill={el.color} stroke="#000" strokeWidth="1" />;
          } else if (el.type === 'stem') {
            return (
              <g key={`el-${i}`}>
                <line x1={el.base.x} y1={el.base.y} x2={el.pt.x} y2={el.pt.y} stroke={el.color} strokeWidth="1.5" strokeDasharray="2 2" />
                <circle cx={el.pt.x} cy={el.pt.y} r="5" fill={el.color} stroke="#000" strokeWidth="1" />
              </g>
            );
          } else if (el.type === 'surface') {
            const v = el.v;
            return <path key={`el-${i}`} d={`M ${v[0].x} ${v[0].y} L ${v[1].x} ${v[1].y} L ${v[2].x} ${v[2].y} L ${v[3].x} ${v[3].y} Z`} fill={el.color} fillOpacity="0.7" stroke="#000" strokeWidth="0.2" />;
          }
          return null;
        })}

        {/* Labels - Positioned on the "Open" sides */}
        {variationRange.map((v: number, i: number) => {
          const p = project(xMin + i * xSpacing + dx/2, yMin - 12, 0);
          return <text key={`vl-${i}`} x={p.x} y={p.y + 12} fontSize="10" textAnchor="middle" fill="#000" fontWeight="bold">{v}</text>
        })}
        {criteria.map((c: any, i: number) => {
          const p = project(cageXMax + 8, yMin + i * ySpacing + dy/2, 0);
          return <text key={`cl-${i}`} x={p.x} y={p.y + 4} fontSize="10" textAnchor="start" fill="#000" fontWeight="bold">{c.name}</text>
        })}
        {zTicks.map(z => {
          const p = project(xMin, yMin, (z/100) * zScale);
          return (
            <g key={`zt-${z}`}>
              <line x1={p.x} y1={p.y} x2={p.x - 4} y2={p.y} stroke="#000" strokeWidth="1" />
              <text x={p.x - 22} y={p.y + 4} fontSize="10" fill="#000" fontWeight="bold" textAnchor="start">{z}</text>
            </g>
          );
        })}

        {/* Axis Titles - Screen-Space Centered for Perfect Alignment */}
        {(() => {
          // X-Axis (Weight Variation) center
          const pXStart = project(xMin + dx/2, yMin, 0);
          const pXEnd = project(xMaxBound + dx/2, yMin, 0);
          const titleX_x = (pXStart.x + pXEnd.x) / 2;
          const titleX_y = (pXStart.y + pXEnd.y) / 2 + 55;
          
          // Y-Axis (Criteria) center
          const pYStart = project(cageXMax, yMin + dy/2, 0);
          const pYEnd = project(cageXMax, yMaxBound + dy/2, 0);
          const titleY_x = (pYStart.x + pYEnd.x) / 2 + 60;
          const titleY_y = (pYStart.y + pYEnd.y) / 2 + 10;
          
          return (
            <g>
              <text 
                x={titleX_x} y={titleX_y} 
                fontSize="14" textAnchor="middle" fill="#000" fontWeight="black" 
                transform={`rotate(${angleX}, ${titleX_x}, ${titleX_y})`}
              >
                Weight Variation (%)
              </text>
              <text 
                x={titleY_x} y={titleY_y} 
                fontSize="14" textAnchor="middle" fill="#000" fontWeight="black" 
                transform={`rotate(${angleY}, ${titleY_x}, ${titleY_y})`}
              >
                Criteria
              </text>
            </g>
          );
        })()}
        
        {/* Z-Axis Title - Moved to Left for clarity with more padding */}
        <text x={project(xMin, yMin, 0.2*zScale).x - 65} y={project(xMin, yMin, 0.2*zScale).y} transform={`rotate(-90, ${project(xMin, yMin, 0.2*zScale).x - 65}, ${project(xMin, yMin, 0.2*zScale).y})`} fontSize="14" textAnchor="middle" fill="#000" fontWeight="black">Weight (%)</text>
      </svg>
    </div>
  );
};

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
  chartSettings?: any;
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
  methodName = "Method",
  chartSettings = {}
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
  const [chartElev, setChartElev] = useState<number>(22);
  const [chartAzim, setChartAzim] = useState<number>(-55);
  const [threeDChartType, setThreeDChartType] = useState<string>('bar');

  // Add state for internal chart settings
  const [kSensChartSettings, setKSensChartSettings] = useState<ChartSettings>(chartSettings && Object.keys(chartSettings).length > 0 ? chartSettings : {
    colorPalette: 'academic',
    backgroundTheme: 'white',
    borderWidth: 2,
    barOpacity: 0.8,
    barSaturation: 1.0,
    barBrightness: 1.0,
    fillPattern: 'none',
    separatorColor: '#ffffff',
    showSeparator: false,
    gridColor: '#e2e8f0',
    gridOpacity: 0.5,
    showMirrorTicks: false,
    showGridLines: true,
    gridLinesMode: 'both',
    showDataLabels: false,
    showAxisTitles: true,
    legendPosition: 'top',
    legendLayout: 'horizontal',
    fontSize: 12,
    markerSize: 4,
    markerType: 'circle',
    lineStyle: 'uniform',
    resultsDecimalPlaces: 2,
    xAxisTitle: 'Perturbation Strength (%)',
    yAxisTitle: 'Alternative Rank',
    marginTop: 20,
    marginRight: 100,
    marginBottom: 80,
    marginLeft: 80,
    xAxisOffset: 0,
    yAxisOffset: 0,
    legendOffsetX: 0,
    legendOffsetY: 0,
  });

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

  // Sync chart titles based on view type and chart type to maintain UI-mapping integrity
  useEffect(() => {
    let xTitle = 'Perturbation Strength (%)';
    let yTitle = 'Alternative Rank';

    if (kSensViewType === 'weight') {
      xTitle = 'Weight Variation (%)';
      yTitle = 'Weight (%)';
    } else {
      // Ranking Analysis defaults
      if (kSensChartType === 'stackedBar' || kSensChartType === 'stackedArea') {
        yTitle = 'Alternative Score';
      } else if (kSensChartType === 'dual') {
        yTitle = 'Scores & Rankings';
      }
    }

    setKSensChartSettings(prev => ({
      ...prev,
      xAxisTitle: xTitle,
      yAxisTitle: yTitle
    }));
  }, [kSensViewType, kSensChartType]);


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

  // ─── Line-dash pattern helper ────────────────────────────────────────────
  const LINE_DASH_PATTERNS = ['0', '8 4', '2 3', '8 4 2 4', '16 4'];
  const getStrokeDasharray = (idx: number): string => {
    const style = kSensChartSettings.lineStyle || 'uniform';
    switch (style) {
      case 'uniform':     return '0';
      case 'dashed':      return '8 4';
      case 'dotted':      return '2 3';
      case 'alternating': return idx % 2 === 0 ? '0' : '8 4';
      case 'sequential':  return LINE_DASH_PATTERNS[idx % LINE_DASH_PATTERNS.length];
      default:            return '0';
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const kSensChartTypes = [
    { value: 'line', label: 'Line Chart', icon: '📈' },
    { value: 'area', label: 'Area Chart', icon: '📈' },
    { value: 'stackedArea', label: 'Stacked Area Chart', icon: '📈' },
    { value: 'bar', label: 'Bar Chart', icon: '📊' },
    { value: '3dBar', label: '3D Bar Chart', icon: '🧊' },
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
    const rect = element.getBoundingClientRect();
    const currentWidth = rect.width || 1200;
    const currentHeight = rect.height || 600;
    
    // Use actual app dimensions for parity
    element.style.width = `${currentWidth}px`;
    element.style.height = `${currentHeight}px`;
    element.style.maxWidth = 'none';
    element.style.backgroundColor = '#ffffff';
    element.style.overflow = 'hidden';
    element.style.position = 'relative';

    // Wait for Recharts reflow
    setTimeout(async () => {
      try {
        const options = {
          quality: 1.0,
          backgroundColor: "#ffffff",
          pixelRatio: 5, // Ultra-high 5x density for Q1 journal publishing (600 DPI equivalent)
          width: currentWidth,
          height: currentHeight,
          style: {
            padding: '15px'
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

    const baseColors = kSensChartSettings.colorPalette === 'academic' ? ['#2563eb', '#dc2626', '#16a34a', '#ea580c', '#9333ea', '#92400e', '#db2777', '#4b5563', '#a16207', '#0891b2'] :
      kSensChartSettings.colorPalette === 'vibrant' ? ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#a855f7', '#64748b'] :
      kSensChartSettings.colorPalette === 'fluorescent' ? ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#8A2BE2', '#FF4500', '#7FFF00', '#1E90FF', '#FF1493'] :
      kSensChartSettings.colorPalette === 'grayscale' ? ['#333333', '#666666', '#999999', '#aaaaaa', '#cccccc', '#777777', '#555555', '#444444', '#888888', '#bbbbbb'] :
      kSensChartSettings.colorPalette === 'viridis' ? ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#addc30', '#fde725'] :
      kSensChartSettings.colorPalette === 'magma' ? ['#000004', '#140e36', '#3b0f70', '#631184', '#8c2981', '#b73779', '#de4968', '#f56d5d', '#fe9444', '#ffbd35'] :
      kSensChartSettings.colorPalette === 'inferno' ? ['#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60', '#cf4446', '#ed6925', '#fb9b06', '#f7d13d', '#fcffa4'] :
      ['#8884d8', '#82ca9d', '#ffc658', '#0088fe', '#00c49f', '#ff8042', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1'];

    // Helper to adjust color brightness and saturation
    const adjustColor = (hex: string) => {
      // Very basic hex to rgb
      let r = parseInt(hex.slice(1, 3), 16);
      let g = parseInt(hex.slice(3, 5), 16);
      let b = parseInt(hex.slice(5, 7), 16);

      // Convert to HSL
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      // Apply adjustments
      s = Math.min(1, s * (kSensChartSettings.barSaturation || 1));
      l = Math.min(1, l * (kSensChartSettings.barBrightness || 1));

      // Convert back to RGB
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      if (s === 0) {
        r = g = b = l;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      const toHex = (x: number) => {
        const out = Math.round(x * 255).toString(16);
        return out.length === 1 ? '0' + out : out;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const colorsArr = baseColors.map(adjustColor);

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

    const theme = {
      bg: kSensChartSettings.backgroundTheme === 'dark' ? '#1e293b' : 
          kSensChartSettings.backgroundTheme === 'slate' ? '#f8fafc' : 
          kSensChartSettings.backgroundTheme === 'glass' ? 'transparent' : '#ffffff',
      text: kSensChartSettings.backgroundTheme === 'dark' ? '#f8fafc' : '#1e293b',
      border: kSensChartSettings.backgroundTheme === 'dark' ? '#334155' : '#e2e8f0',
      chartBorder: kSensChartSettings.backgroundTheme === 'dark' ? '#64748b' : '#000000',
      tooltipBg: kSensChartSettings.backgroundTheme === 'dark' ? '#0f172a' : '#ffffff',
    };

    const tickStyle = { 
      fontSize: kSensChartSettings.fontSize, 
      fill: theme.text,
      fontWeight: 'bold'
    };

    const labelStyle = (value: string, isVertical = false) => ({
      value,
      fontSize: kSensChartSettings.fontSize + 1,
      fill: theme.text,
      fontWeight: 'bold',
      position: (isVertical ? 'insideLeft' : 'insideBottom') as 'insideLeft' | 'insideBottom',
      offset: isVertical ? kSensChartSettings.yAxisOffset || -5 : kSensChartSettings.xAxisOffset || -10,
      angle: isVertical ? -90 : 0
    });

    const gridProps = kSensChartSettings.showGridLines ? {
      strokeDasharray: kSensChartSettings.gridStyle === 'hairline' ? "1 1" : "3 3",
      strokeWidth: kSensChartSettings.gridStyle === 'hairline' ? 0.5 : 1,
      horizontal: kSensChartSettings.gridLinesMode === 'horizontal' || kSensChartSettings.gridLinesMode === 'both',
      vertical: kSensChartSettings.gridLinesMode === 'vertical' || kSensChartSettings.gridLinesMode === 'both',
      stroke: kSensChartSettings.gridColor,
      opacity: kSensChartSettings.gridOpacity,
      style: { pointerEvents: 'none' }
    } : null;

    const getAspectRatio = () => {
      switch (kSensChartSettings.aspectRatio) {
        case '1:1': return 1;
        case '4:3': return 1.333;
        case '3:2': return 1.5;
        case '16:9': return 1.777;
        case 'golden': return 1.618;
        case 'journal-single': return 1.2;
        case 'journal-double': return 1.5;
        default: return undefined;
      }
    };

    const chartAspectRatio = getAspectRatio();

    // Custom dot renderer — respects markerType (circle, square, triangle, diamond)
    const makeCustomDot = (color: string) => (props: any) => {
      const { cx, cy } = props;
      const s = kSensChartSettings.markerSize;
      if (!s || s <= 0 || cx == null || cy == null) return null as any;
      switch (kSensChartSettings.markerType) {
        case 'square':
          return <rect key={`${cx}-${cy}`} x={cx - s} y={cy - s} width={s * 2} height={s * 2} fill={color} />;
        case 'triangle':
          return <polygon key={`${cx}-${cy}`} points={`${cx},${cy - s} ${cx - s},${cy + s} ${cx + s},${cy + s}`} fill={color} />;
        case 'diamond':
          return <polygon key={`${cx}-${cy}`} points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`} fill={color} />;
        default: // circle
          return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={s} fill={color} />;
      }
    };

    // Right vertical frame border — drawn via Customized SVG to reliably appear on the right side.
    const RightFrameBorder = (props: any) => {
      if (kSensChartSettings.frameStyle !== 'Box') return null;
      
      // Use viewBox to identify the exact plot area boundaries
      const { viewBox } = props;
      if (!viewBox || viewBox.width == null || viewBox.height == null) return null;

      const x = viewBox.x + viewBox.width;
      const y1 = viewBox.y;
      const y2 = viewBox.y + viewBox.height;

      return (
        <line
          key="right-frame-border"
          x1={x} y1={y1} x2={x} y2={y2}
          stroke={theme.chartBorder}
          strokeWidth={1.5}
          strokeLinecap="square"
          pointerEvents="none"
        />
      );
    };

    const getTickLine = (orientation: 'top' | 'bottom' | 'left' | 'right') => {
      const isInner = kSensChartSettings.tickDirection === 'inner';
      const size = 6;
      const stroke = theme.chartBorder;
      const strokeWidth = 1.5;

      if (!isInner) return { stroke, strokeWidth };

      switch (orientation) {
        case 'bottom': return { stroke, strokeWidth, transform: `translate(0, -${size})` };
        case 'top': return { stroke, strokeWidth, transform: `translate(0, ${size})` };
        case 'left': return { stroke, strokeWidth, transform: `translate(${size}, 0)` };
        case 'right': return { stroke, strokeWidth, transform: `translate(-${size}, 0)` };
      }
    };

    const commonChartProps = {
      margin: {
        top: Number(kSensChartSettings.marginTop || 40),
        right: Number(kSensChartSettings.marginRight || 100),
        left: Number(kSensChartSettings.marginLeft || 80),
        bottom: Number(kSensChartSettings.marginBottom || 80)
      }
    };

    const legendProps: any = {
      verticalAlign: (kSensChartSettings.legendPosition === 'left' || kSensChartSettings.legendPosition === 'right' ? 'middle' : kSensChartSettings.legendPosition) as 'top' | 'bottom' | 'middle',
      align: (kSensChartSettings.legendPosition === 'left' ? 'left' : kSensChartSettings.legendPosition === 'right' ? 'right' : 'center') as 'left' | 'center' | 'right',
      layout: kSensChartSettings.legendLayout as 'horizontal' | 'vertical',
      wrapperStyle: {
        fontSize: `${kSensChartSettings.fontSize - 1}px`,
        color: theme.text,
        backgroundColor: kSensChartSettings.backgroundTheme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        border: `${kSensChartSettings.borderWidth}px solid ${theme.border}`,
        padding: "4px 8px",
        top: 70,
        left: kSensChartSettings.legendPosition === 'left' ? 10 : kSensChartSettings.legendPosition === 'right' ? undefined : "50%",
        right: kSensChartSettings.legendPosition === 'right' ? 10 : undefined,
        transform: `${(kSensChartSettings.legendPosition === 'left' || kSensChartSettings.legendPosition === 'right') ? "" : "translateX(-50%)"} translate(${kSensChartSettings.legendOffsetX || 0}px, ${kSensChartSettings.legendOffsetY || 0}px)`,
        width: (kSensChartSettings.legendPosition === 'left' || kSensChartSettings.legendPosition === 'right') ? "150px" : "max-content",
        zIndex: 50,
        boxShadow: "2px 2px 0px rgba(0,0,0,1)",
        display: "flex",
        justifyContent: "center",
        whiteSpace: "nowrap"
      }
    };

    const dataLabelComponent = kSensChartSettings.showDataLabels ? (
      <LabelList 
        position="top" 
        offset={10}
        formatter={(val: any) => {
          if (typeof val !== 'number') return val;
          return val > 1 ? Math.round(val).toString() : val.toFixed(2);
        }}
        style={{ fontSize: kSensChartSettings.fontSize - 3, fill: theme.text, fontWeight: 'bold' }} 
      />
    ) : null;

    if (kSensChartType === '3dBar') {
      if (!isWeightView) {
        return <div className="p-4 text-center text-gray-500 font-bold text-xs mt-10 border-2 border-dashed rounded-xl bg-gray-50">
          3D Bar Chart is optimized for Weight Analysis. <br/> 
          Please switch to <span className="text-blue-600 underline cursor-pointer" onClick={() => setKSensViewType('weight')}>Weight Analysis</span> view above.
        </div>;
      }
      return (
        <div className="space-y-4">
          {/* Interactive Rotation & Type Controls (Excluded from Export) */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-2xl border-2 border-gray-100 mb-6 select-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-600/70">Visualization Style</span>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {['bar', 'surface', 'scatter', 'stem'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setThreeDChartType(t)}
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded-md transition-all ${
                        threeDChartType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">Elevation: {chartElev}°</span>
                <input 
                  type="range" min="0" max="90" step="1" 
                  value={chartElev} 
                  onChange={(e) => setChartElev(parseInt(e.target.value))}
                  className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500">Azimuth: {chartAzim}°</span>
                <input 
                  type="range" min="-180" max="180" step="1" 
                  value={chartAzim} 
                  onChange={(e) => setChartAzim(parseInt(e.target.value))}
                  className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
            <Button 
              variant="outline" size="sm" 
              className="h-8 px-4 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              onClick={() => { setChartElev(22); setChartAzim(-55); setThreeDChartType('bar'); }}
            >
              Default View
            </Button>
          </div>

          {/* Exportable Figure Container (Only this is captured) */}
          <div 
            ref={chartRef} 
            className="bg-white rounded-xl overflow-hidden shadow-sm"
            style={{ padding: '60px' }} // Approx 2cm scientific padding
          >
            <ThreeDChart 
              data={data}
              criteria={workingCriteria}
              variationRange={kSensVariationRange}
              elev={chartElev}
              azim={chartAzim}
              type={threeDChartType}
              colors={colorsArr}
              theme={theme}
              settings={kSensChartSettings}
            />
          </div>
        </div>
      );
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

        // Journal-ready styling tokens
        const journalGridColor = kSensChartSettings.gridColor === '#e2e8f0' ? '#94a3b8' : kSensChartSettings.gridColor;
        const journalStrokeWidth = Math.max(2, kSensChartSettings.borderWidth);

        return (
          <div ref={chartRef} className={`max-w-7xl mx-auto relative transition-all duration-500 rounded-xl overflow-hidden ${kSensChartSettings.backgroundTheme === 'glass' ? 'backdrop-blur-md bg-white/30' : ''}`} style={{ backgroundColor: theme.bg, color: theme.text, border: `1.5px solid ${theme.border}` }}>
            <ResponsiveContainer width="100%" height={chartAspectRatio ? undefined : 750} aspect={chartAspectRatio}>
              <RadarChart data={radarData} outerRadius="75%" margin={{ ...commonChartProps.margin, top: 60 }}>
                {kSensChartSettings.showGridLines && (
                  <PolarGrid
                    gridType="polygon"
                    stroke={journalGridColor}
                    opacity={kSensChartSettings.gridOpacity * 1.2 || 0.4}
                    strokeWidth={0.8}
                  />
                )}
                <PolarAngleAxis 
                  dataKey="scenario" 
                  tick={{ ...tickStyle, fontSize: kSensChartSettings.fontSize + 2 }} 
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 'auto']}
                  tick={{ ...tickStyle, fontSize: kSensChartSettings.fontSize - 1 }}
                  tickFormatter={(val) => (val * 100).toFixed(0) + '%'}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: number) => (val * 100).toFixed(2) + '%'}
                  contentStyle={{ 
                    fontSize: `${kSensChartSettings.fontSize}px`, 
                    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                    color: '#000', 
                    border: '1px solid #000',
                    boxShadow: '4px 4px 0px rgba(0,0,0,0.1)',
                    borderRadius: '0'
                  }}
                />
                <Legend 
                  {...legendProps} 
                  iconSize={12} 
                  iconType="plainline"
                  wrapperStyle={{
                    ...legendProps.wrapperStyle,
                    padding: "10px",
                    border: "1.5px solid #000",
                    backgroundColor: "#fff",
                    boxShadow: "3px 3px 0px rgba(0,0,0,1)"
                  }}
                />
                {workingCriteria.map((crit, idx) => {
                  const isTarget = crit.id === selectedCriterionToVary;
                  const color = colorsArr[idx % colorsArr.length];
                  
                  return (
                    <Radar
                      key={crit.name}
                      name={crit.name}
                      dataKey={crit.name}
                      stroke={color}
                      fill={color}
                      fillOpacity={0.15} // Lowered for journal compatibility (visibility of overlaps)
                      strokeWidth={isTarget ? journalStrokeWidth + 1 : journalStrokeWidth}
                      strokeDasharray={isTarget ? "" : idx % 2 === 0 ? "5 5" : "3 3"}
                      dot={{ 
                        r: isTarget ? 5 : 4, 
                        fill: color, 
                        stroke: '#fff', 
                        strokeWidth: 1.5 
                      }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  );
                })}
              </RadarChart>
            </ResponsiveContainer>
            {/* Minimalist Watermark/Label for Q1 look */}
            <div className="absolute top-4 left-6 py-2 px-4 border-l-4 border-blue-600 bg-white/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-900 block">Publication Quality Asset</span>
              <span className="text-xs font-bold text-gray-800">Weight Stability Analysis (Forensic Radar)</span>
            </div>
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
      if (!kSensResults) return <div className="h-[400px] flex items-center justify-center text-gray-500">Run analysis to view radar chart</div>;

      const radarData = kSensVariationRange.map((v, vIdx) => {
        const row: any = { scenario: `${v}%` };
        alternatives.forEach(alt => {
          const resultAtStep = kSensResults?.[criterionName]?.[vIdx];
          const actualRank = resultAtStep?.rankings?.[alt.name]?.rank || maxRank;
          row[alt.name] = maxRank + 1 - actualRank;
        });
        return row;
      });

      return (
        <div ref={chartRef} className={`max-w-7xl mx-auto relative transition-all duration-500 ${kSensChartSettings.backgroundTheme === 'glass' ? 'backdrop-blur-md bg-white/30' : ''}`} style={{ backgroundColor: theme.bg, color: theme.text }}>
          <ResponsiveContainer width="100%" height={chartAspectRatio ? undefined : 750} aspect={chartAspectRatio}>
            <RadarChart data={radarData} outerRadius="80%" margin={commonChartProps.margin}>
              {kSensChartSettings.showGridLines && (
                <PolarGrid
                  gridType="polygon"
                  stroke={kSensChartSettings.gridColor}
                  opacity={kSensChartSettings.gridOpacity}
                  strokeWidth={1}
                />
              )}
              <PolarAngleAxis
                dataKey="scenario"
                tick={tickStyle}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[1, maxRank]}
                tick={tickStyle}
                tickFormatter={(val) => {
                  const originalRank = Math.round(maxRank + 1 - val);
                  return originalRank > 0 ? originalRank.toString() : '';
                }}
              />
              <Tooltip
                contentStyle={{ fontSize: `${kSensChartSettings.fontSize}px`, backgroundColor: theme.tooltipBg, color: theme.text, border: `1px solid ${theme.border}` }}
                formatter={(val: number) => `Rank ${Math.round(maxRank + 1 - val)}`}
              />
              <Legend {...legendProps} iconSize={8} iconType="circle" />
              {alternatives.map((alt, altIdx) => (
                <Radar
                  key={alt.name}
                  name={alt.name}
                  dataKey={alt.name}
                  stroke={getScientificColor(altIdx / (Math.max(1, alternatives.length - 1)))}
                  fill="none"
                  fillOpacity={0}
                  strokeWidth={2.5}
                  strokeDasharray={altIdx % 4 === 0 ? "" : altIdx % 4 === 1 ? "5 5" : altIdx % 4 === 2 ? "3 3" : "1 4"}
                  dot={{ r: 4, fill: getScientificColor(altIdx / (Math.max(1, alternatives.length - 1))), strokeWidth: 0 }}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
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
        <div ref={chartRef} className={`max-w-7xl mx-auto relative transition-all duration-500 ${kSensChartSettings.backgroundTheme === 'glass' ? 'backdrop-blur-md bg-white/30' : ''}`} style={{ backgroundColor: theme.bg, color: theme.text }}>
          <ResponsiveContainer width="100%" height={chartAspectRatio ? undefined : 600} aspect={chartAspectRatio}>
            <LineChart data={parallelData} margin={commonChartProps.margin}>

              <XAxis
                dataKey="name"
                tick={tickStyle}
                axisLine={{ stroke: theme.border, strokeWidth: 1 }}
                tickLine={{ stroke: theme.border }}
                label={kSensChartSettings.showAxisTitles ? (labelStyle('Criteria') as any) : undefined}
              />
              <YAxis
                label={kSensChartSettings.showAxisTitles ? (labelStyle('Weight (%)', true) as any) : undefined}
                tick={tickStyle}
                axisLine={{ stroke: theme.border }}
                tickLine={{ stroke: theme.border }}
                tickFormatter={(val) => (val * 100).toFixed(0)}
              />
              <Tooltip
                formatter={(value: number) => (value * 100).toFixed(2) + '%'}
                contentStyle={{ fontSize: `${kSensChartSettings.fontSize}px`, backgroundColor: theme.tooltipBg, color: theme.text, border: `1px solid ${theme.border}` }}
              />
              <Legend {...legendProps} iconSize={8} iconType="circle" />
              {kSensVariationRange.map((v, idx) => {
                const label = `${v}%`;
                return (
                  <Line
                    key={label}
                    type="linear"
                    dataKey={label}
                    stroke={colorsArr[idx % colorsArr.length]}
                    strokeWidth={kSensChartSettings.borderWidth || 1.5}
                    dot={false}
                    activeDot={{ r: (kSensChartSettings.markerSize || 4) + 1 }}
                  >
                    {dataLabelComponent}
                  </Line>
                );
              })}
              {kSensChartSettings.showGridLines && <CartesianGrid {...(gridProps as any)} />}
              <Customized component={RightFrameBorder} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }


    const renderDefs = () => {
      if (kSensChartSettings.fillPattern === 'none') return null;
      
      return (
        <defs>
          {colorsArr.map((color, i) => {
            if (kSensChartSettings.fillPattern === 'striped') {
              return (
                <pattern key={`pattern-${i}`} id={`pattern-${i}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="8" height="8" fill={color} fillOpacity={kSensChartSettings.barOpacity} />
                  <line x1="0" y1="0" x2="0" y2="8" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                </pattern>
              );
            }
            if (kSensChartSettings.fillPattern === 'dotted') {
              return (
                <pattern key={`pattern-${i}`} id={`pattern-${i}`} width="10" height="10" patternUnits="userSpaceOnUse">
                  <rect width="10" height="10" fill={color} fillOpacity={kSensChartSettings.barOpacity} />
                  <circle cx="5" cy="5" r="2" fill="white" fillOpacity="0.3" />
                </pattern>
              );
            }
            if (kSensChartSettings.fillPattern === 'grid') {
              return (
                <pattern key={`pattern-${i}`} id={`pattern-${i}`} width="10" height="10" patternUnits="userSpaceOnUse">
                  <rect width="10" height="10" fill={color} fillOpacity={kSensChartSettings.barOpacity} />
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                </pattern>
              );
            }
            return null;
          })}
        </defs>
      );
    };

    return (
      <div ref={chartRef} className={`max-w-7xl mx-auto transition-all duration-500 ${kSensChartSettings.backgroundTheme === 'glass' ? 'backdrop-blur-md bg-white/30' : ''}`} style={{ backgroundColor: theme.bg, color: theme.text }}>
        {['line', 'area', 'stackedArea'].includes(kSensChartType) ? (
          <ResponsiveContainer width="100%" height={chartAspectRatio ? undefined : 600} aspect={chartAspectRatio}>
            {['area', 'stackedArea'].includes(kSensChartType) ? (
              <AreaChart data={data} margin={commonChartProps.margin}>
                {renderDefs()}
                {kSensChartSettings.zeroBaseline && <ReferenceLine y={0} stroke={theme.chartBorder} strokeWidth={2} strokeOpacity={0.8} />}
                <XAxis dataKey="variation" tick={tickStyle} axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tickLine={getTickLine('bottom')} interval={0} padding={{ left: 10, right: 10 }} tickFormatter={isWeightView ? (val: string) => val.replace('%', '') : undefined} label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.xAxisTitle) as any) : undefined} />
                <XAxis orientation="top" xAxisId="top_border" axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tick={kSensChartSettings.showMirrorTicks ? tickStyle : false} tickLine={kSensChartSettings.showMirrorTicks ? getTickLine('top') : false} />
                <YAxis reversed={!isWeightView} tick={tickStyle} axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tickLine={getTickLine('left')} domain={isWeightView ? (kSensChartType === 'stackedArea' ? [0, 1] : [0, 'auto']) : [1, alternatives.length]} allowDecimals={isWeightView} ticks={!isWeightView ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined} tickFormatter={isWeightView ? (val: number) => Number(val.toFixed(2)).toString() : undefined} label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.yAxisTitle, true) as any) : undefined} />
                <YAxis orientation="right" yAxisId="right_border" width={(kSensChartSettings.showMirrorTicks || kSensChartSettings.frameStyle === 'Box') ? (kSensChartSettings.showMirrorTicks ? 40 : 10) : 0} axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tick={kSensChartSettings.showMirrorTicks ? tickStyle : false} tickLine={kSensChartSettings.showMirrorTicks ? getTickLine('right') : false} domain={isWeightView ? (kSensChartType === 'stackedArea' ? [0, 1] : [0, 'auto']) : [1, alternatives.length]} />
                <Tooltip contentStyle={{ fontSize: `${kSensChartSettings.fontSize}px`, backgroundColor: theme.tooltipBg, color: theme.text, border: `1px solid ${theme.border}` }} />
                {!kSensChartSettings.directLabeling && <Legend {...legendProps} iconSize={8} iconType={isWeightView ? "circle" : "square"} />}
                {(isWeightView ? workingCriteria : [...alternatives].sort((a, b) => {
                  const var0 = (kSensResults?.[criterionName] || []).find((v: any) => v.variation === 0);
                  const rA = var0?.rankings?.[a.name]?.rank || 0;
                  const rB = var0?.rankings?.[b.name]?.rank || 0;
                  return rB - rA;
                })).map((item) => {
                  const originalIdx = isWeightView ? workingCriteria.indexOf(item as any) : alternatives.indexOf(item as any);
                  const color = colorsArr[originalIdx % colorsArr.length];
                  const fill = kSensChartSettings.fillPattern === 'none' ? color : `url(#pattern-${originalIdx % colorsArr.length})`;
                  return (
                    <Area
                      key={item.name}
                      type="monotone"
                      dataKey={isWeightView ? item.name : item.name}
                      name={item.name}
                      stroke={kSensChartSettings.showSeparator ? (kSensChartSettings.separatorColor || '#000') : color}
                      fill={fill}
                      strokeWidth={kSensChartSettings.borderWidth || 2}
                      strokeDasharray={getStrokeDasharray(originalIdx)}
                      stackId={kSensChartType === 'stackedArea' ? "1" : undefined}
                      fillOpacity={kSensChartSettings.fillPattern === 'none' ? (kSensChartType === 'stackedArea' ? (kSensChartSettings.barOpacity || 0.8) : (kSensChartSettings.barOpacity * 0.75 || 0.75)) : 1}
                      activeDot={kSensChartSettings.markerSize > 0 ? { r: kSensChartSettings.markerSize + 1 } : false}
                      dot={kSensChartSettings.markerSize > 0 ? makeCustomDot(color) : false}
                    >
                      {dataLabelComponent}
                      {kSensChartSettings.directLabeling && (
                        <LabelList
                          position="right"
                          content={(props: any) => {
                            const { x, y, index } = props;
                            if (index !== data.length - 1) return null;
                            return (
                              <text x={x + 5} y={y} fill={color} fontSize={kSensChartSettings.fontSize} fontWeight="bold" dominantBaseline="middle">
                                {item.name}
                              </text>
                            );
                          }}
                        />
                      )}
                    </Area>
                  );
                })}
                {kSensChartSettings.showGridLines && <CartesianGrid {...(gridProps as any)} />}
                <Customized component={RightFrameBorder} />
              </AreaChart>
            ) : (
              <LineChart
                data={data}
                margin={commonChartProps.margin}
              >
                {kSensChartSettings.zeroBaseline && <ReferenceLine y={0} stroke={theme.chartBorder} strokeWidth={2} strokeOpacity={0.8} />}
                <XAxis
                  dataKey="variation"
                  tick={tickStyle}
                  axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                  tickLine={getTickLine('bottom')}
                  interval={0}
                  padding={{ left: 10, right: 10 }}
                  tickFormatter={isWeightView ? (val: string) => val.replace('%', '') : undefined}
                  label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.xAxisTitle) as any) : undefined}
                />
                <XAxis orientation="top" xAxisId="top_border" axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tick={kSensChartSettings.showMirrorTicks ? tickStyle : false} tickLine={kSensChartSettings.showMirrorTicks ? getTickLine('top') : false} />
                <YAxis
                  reversed={!isWeightView}
                  tick={tickStyle}
                  axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                  tickLine={getTickLine('left')}
                  domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
                  allowDecimals={isWeightView}
                  ticks={!isWeightView ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined}
                  tickFormatter={isWeightView ? (val: number) => (val * 100).toFixed(0) : undefined}
                  label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.yAxisTitle, true) as any) : undefined}
                />
                <YAxis
                  orientation="right"
                  yAxisId="right_border"
                  width={(kSensChartSettings.showMirrorTicks || kSensChartSettings.frameStyle === 'Box') ? (kSensChartSettings.showMirrorTicks ? 40 : 10) : 0}
                  axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                  tick={kSensChartSettings.showMirrorTicks ? tickStyle : false}
                  tickLine={kSensChartSettings.showMirrorTicks ? getTickLine('right') : false}
                  domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
                />

                <Tooltip contentStyle={{ fontSize: `${kSensChartSettings.fontSize}px`, backgroundColor: theme.tooltipBg, color: theme.text, border: `1px solid ${theme.border}` }} />
                {!kSensChartSettings.directLabeling && <Legend {...legendProps} iconSize={8} iconType="circle" />}
                {(isWeightView ? workingCriteria : alternatives).map((item, idx) => {
                  const color = colorsArr[idx % colorsArr.length];
                  const dashArray = getStrokeDasharray(idx);
                  return (
                    <Line
                      key={item.name}
                      type="monotone"
                      dataKey={isWeightView ? item.name : item.name}
                      name={item.name}
                      stroke={color}
                      strokeWidth={kSensChartSettings.borderWidth || 2}
                      strokeDasharray={dashArray}
                      dot={kSensChartSettings.markerSize > 0 ? makeCustomDot(color) : false}
                      activeDot={kSensChartSettings.markerSize > 0 ? { r: kSensChartSettings.markerSize + 2 } : { r: 4 }}
                      legendType={dashArray !== '0' ? 'plainline' : 'line'}
                    >
                      {dataLabelComponent}
                      {kSensChartSettings.directLabeling && (
                        <LabelList
                          position="right"
                          content={(props: any) => {
                            const { x, y, index } = props;
                            if (index !== data.length - 1) return null;
                            return (
                              <text x={x + 5} y={y} fill={color} fontSize={kSensChartSettings.fontSize} fontWeight="bold" dominantBaseline="middle">
                                {item.name}
                              </text>
                            );
                          }}
                        />
                      )}
                    </Line>
                  );
                })}
                {kSensChartSettings.showGridLines && <CartesianGrid {...(gridProps as any)} />}
                <Customized component={RightFrameBorder} />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : kSensChartType === 'scatter' ? (
          <ResponsiveContainer width="100%" height={chartAspectRatio ? undefined : 600} aspect={chartAspectRatio}>
            <ScatterChart
              data={data}
              margin={commonChartProps.margin}
            >

              <XAxis
                type="number"
                dataKey="x"
                name="Variation Index"
                tick={tickStyle}
                axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                tickLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                domain={[0, kSensVariationRange.length - 1]}
                ticks={Array.from({ length: kSensVariationRange.length }, (_, i) => i)}
                tickFormatter={(val) => isWeightView ? `${kSensVariationRange[val]}` : `${kSensVariationRange[val]}%`}
                interval={0}
                label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.xAxisTitle) as any) : undefined}
              />
              <XAxis orientation="top" xAxisId="top_border" axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tick={false} tickLine={false} />
              <YAxis
                type="number"
                dataKey="y"
                name={isWeightView ? "Weight" : "Rank"}
                reversed={!isWeightView}
                tick={tickStyle}
                axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                tickLine={getTickLine('left')}
                width={50}
                domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
                allowDecimals={isWeightView}
                ticks={!isWeightView ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined}
                tickFormatter={isWeightView ? (val: number) => (val * 100).toFixed(0) : undefined}
                label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.yAxisTitle, true) as any) : undefined}
              />
              {kSensChartSettings.zeroBaseline && <ReferenceLine y={0} stroke={theme.chartBorder} strokeWidth={2} strokeOpacity={0.8} />}
              <YAxis orientation="right" yAxisId="right_border" width={(kSensChartSettings.showMirrorTicks || kSensChartSettings.frameStyle === 'Box') ? (kSensChartSettings.showMirrorTicks ? 40 : 10) : 0} axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tick={kSensChartSettings.showMirrorTicks ? tickStyle : false} tickLine={kSensChartSettings.showMirrorTicks ? getTickLine('right') : false} domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontSize: `${kSensChartSettings.fontSize}px`, backgroundColor: theme.tooltipBg, color: theme.text, border: `1px solid ${theme.border}` }} />
              <Legend {...legendProps} iconSize={8} iconType="circle" />
              {(isWeightView ? workingCriteria : alternatives).map((item, idx) => {
                const scatterData = data.map((d: any, i: number) => ({ x: i, y: isWeightView ? d[item.name] : d[item.name] }));
                const color = colorsArr[idx % colorsArr.length];
                return (
                  <Scatter key={item.name} name={item.name} data={scatterData} fill={color} shape={kSensChartSettings.markerType || 'circle'}>
                    {dataLabelComponent}
                  </Scatter>
                );
              })}
              {kSensChartSettings.showGridLines && <CartesianGrid {...(gridProps as any)} />}
              <Customized component={RightFrameBorder} />
            </ScatterChart>
          </ResponsiveContainer>
        ) : kSensChartType === 'dual' ? (
          <ResponsiveContainer width="100%" height={chartAspectRatio ? undefined : 600} aspect={chartAspectRatio}>
            <ComposedChart
              data={data}
              margin={commonChartProps.margin}
              barGap={0}
              barCategoryGap="10%"
            >
              <XAxis
                dataKey="variation"
                tick={tickStyle}
                axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                tickLine={getTickLine('bottom')}
                interval={0}
                padding={{ left: 10, right: 10 }}
                label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.xAxisTitle) as any) : undefined}
              />
              <XAxis orientation="top" xAxisId="top_border" axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tick={kSensChartSettings.showMirrorTicks ? tickStyle : false} tickLine={kSensChartSettings.showMirrorTicks ? getTickLine('top') : false} />
              <YAxis
                yAxisId="left"
                tick={tickStyle}
                axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                tickLine={getTickLine('left')}
                label={kSensChartSettings.showAxisTitles ? (labelStyle(`${MCDM_METHODS.find(m => m.value === selectedRankingMethod)?.label || selectedRankingMethod.toUpperCase()} Score`, true) as any) : undefined}
                domain={[0, (max: number) => Math.ceil(max * 10) / 10]}
                tickFormatter={(val: number) => val.toFixed(1)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={tickStyle}
                axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                tickLine={getTickLine('right')}
                label={kSensChartSettings.showAxisTitles ? { value: 'Ranking (1 = Best)', angle: 90, position: 'insideRight', offset: 15, style: { fontSize: kSensChartSettings.fontSize + 1, fill: theme.text, fontWeight: 'bold' } } : undefined}
                domain={[1, alternatives.length]}
                reversed
                interval={0}
                ticks={alternatives.length <= 20
                  ? Array.from({ length: alternatives.length }, (_, i) => i + 1)
                  : Array.from({ length: Math.floor(alternatives.length / 2) }, (_, i) => (i + 1) * 2)}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ fontSize: `${kSensChartSettings.fontSize}px`, backgroundColor: theme.tooltipBg, color: theme.text, border: `1px solid ${theme.border}` }}
              />
              <Legend {...legendProps} iconSize={10} />
              {kSensChartSettings.zeroBaseline && <ReferenceLine y={0} yAxisId="left" stroke={theme.chartBorder} strokeWidth={2} strokeOpacity={0.8} />}
              {renderDefs()}
              {alternatives.map((alt, i) => {
                const color = colorsArr[i % colorsArr.length];
                const fill = kSensChartSettings.fillPattern === 'none' ? color : `url(#pattern-${i % colorsArr.length})`;
                return (
                  <Bar
                    key={`bar-${alt.name}`}
                    yAxisId="left"
                    dataKey={`${alt.name} Score`}
                    fill={fill}
                    fillOpacity={kSensChartSettings.fillPattern === 'none' ? (kSensChartSettings.barOpacity || 1) : 1}
                    stroke={kSensChartSettings.showSeparator ? (kSensChartSettings.separatorColor || '#000') : 'none'}
                    strokeWidth={kSensChartSettings.showSeparator ? (kSensChartSettings.borderWidth || 0.5) : 0}
                    name={alt.name}
                  >
                    {dataLabelComponent}
                  </Bar>
                );
              })}
              {alternatives.map((alt, i) => {
                const seriesColor = colorsArr[i % colorsArr.length];
                const dashArray = getStrokeDasharray(i);
                return (
                  <Line
                    key={`line-${alt.name}`}
                    yAxisId="right"
                    type="linear"
                    dataKey={alt.name}
                    stroke={seriesColor}
                    strokeWidth={kSensChartSettings.borderWidth || 3}
                    strokeDasharray={dashArray}
                    name={alt.name}
                    legendType="none"
                    dot={kSensChartSettings.markerSize > 0 ? makeCustomDot(seriesColor) : false}
                  />
                );
              })}
              {kSensChartSettings.showGridLines && <CartesianGrid {...(gridProps as any)} />}
              <Customized component={RightFrameBorder} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : kSensChartType === 'heatmap' ? (
          <div className="w-full h-full flex flex-col items-center">
            <h3 className="text-sm font-bold mb-4 opacity-70 italic whitespace-nowrap" style={{ color: theme.text }}>Rank Sensitivity Heatmap</h3>
            <div className="flex w-full items-start px-4" style={{ height: '520px' }}>
              <div className="flex-grow h-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 10, bottom: 60, left: 150 }}>
                    <XAxis
                      type="number"
                      dataKey="varIdx"
                      domain={[-0.5, data.length - 0.5]}
                      ticks={data.map((_, i) => i)}
                      tickFormatter={(i) => data[i]?.variation || ''}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={tickStyle}
                      label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.xAxisTitle) as any) : undefined}
                    />
                    <YAxis
                      type="number"
                      dataKey="altIdx"
                      domain={[-0.5, alternatives.length - 0.5]}
                      ticks={alternatives.map((_, i) => i)}
                      tickFormatter={(i) => alternatives[alternatives.length - 1 - i]?.name || ''}
                      axisLine={false}
                      tickLine={false}
                      tick={tickStyle}
                      label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.yAxisTitle, true) as any) : undefined}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: theme.text }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-white border-2 border-black p-2 shadow-xl text-[11px]" style={{ backgroundColor: theme.tooltipBg, color: theme.text, borderColor: theme.border }}>
                              <p className="font-bold border-b border-black mb-1 pb-1" style={{ borderColor: theme.border }}>{item.altName}</p>
                              <p><span className="font-medium opacity-70">Variation:</span> <span className="font-bold">{item.variation}</span></p>
                              <p><span className="font-medium opacity-70">Rank:</span> <span className="font-bold text-lg">{item.rank}</span></p>
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
                        const { cx, cy, payload } = props;
                        const numAlt = alternatives.length || 1;
                        const getScientificColor = (p: number) => {
                          const stops = [{ r: 68, g: 1, b: 84 }, { r: 59, g: 82, b: 139 }, { r: 33, g: 145, b: 140 }, { r: 94, g: 201, b: 98 }, { r: 253, g: 231, b: 37 }];
                          const pSafe = isNaN(p) ? 0 : Math.max(0, Math.min(1, p));
                          const i = Math.min(stops.length - 2, Math.floor(pSafe * (stops.length - 1)));
                          const segmentP = (pSafe * (stops.length - 1)) - i;
                          const start = stops[i] || stops[0];
                          const end = stops[i + 1] || stops[stops.length - 1];
                          const r = Math.round(start.r + (end.r - start.r) * segmentP);
                          const g = Math.round(start.g + (end.g - start.g) * segmentP);
                          const b = Math.round(start.b + (end.b - start.b) * segmentP);
                          return `rgb(${r},${g},${b})`;
                        };
                        const w = (720 / (data.length || 1));
                        const h = (480 / numAlt);
                        const p = ((payload?.rank || 1) - 1) / (Math.max(1, numAlt - 1));
                        const fill = getScientificColor(p);
                        return (
                          <g>
                            <rect x={cx - w / 2} y={cy - h / 2} width={w - 1} height={h - 1} fill={fill} stroke={theme.bg} strokeWidth={0.3} rx={1} />
                            <text x={cx} y={cy} dy=".35em" textAnchor="middle" fill={(payload?.rank || 1) <= numAlt / 2 ? "#fff" : "#000"} style={{ fontSize: `${kSensChartSettings.fontSize}px`, fontWeight: 'black' }}>{payload?.rank || 1}</text>
                          </g>
                        );
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              {/* Color Bar aligned with plotting area */}
              <div className="w-32 flex flex-col items-center justify-start pt-[25px] flex-shrink-0">
                <div className="text-[10px] font-black uppercase mb-1 w-full text-center" style={{ color: theme.text }}>Worst</div>
                <div className="relative w-8 border border-black shadow-sm" style={{ height: '430px', background: 'linear-gradient(to top, rgb(68,1,84), rgb(59,82,139), rgb(33,145,140), rgb(94,201,98), rgb(253,231,37))' }}>
                  <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex items-center h-full">
                    <div className="text-[10px] font-black whitespace-nowrap -rotate-90 tracking-[0.2em] uppercase opacity-80" style={{ color: theme.text }}>Rank Intensity</div>
                  </div>
                  {Array.from({ length: alternatives.length }, (_, i) => i + 1).map((rank) => (
                    <div key={rank} className="absolute -right-10 text-[11px] font-black flex items-center" style={{ bottom: `${((rank - 0.5) / alternatives.length) * 100}%`, transform: 'translateY(50%)', color: theme.text }}>
                      <span className="w-3 h-[1.5px] bg-black mr-2" style={{ backgroundColor: theme.text }}></span>{rank}
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-black uppercase mt-1 w-full text-center" style={{ color: theme.text }}>Best</div>
              </div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartAspectRatio ? undefined : 600} aspect={chartAspectRatio}>
            {['bar', 'stackedBar', 'column'].includes(kSensChartType) ? (
              <BarChart data={data} margin={commonChartProps.margin}>
                {renderDefs()}
                  <XAxis dataKey="variation" tick={tickStyle} axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tickLine={getTickLine('bottom')} interval={0} padding={{ left: 10, right: 10 }} tickFormatter={isWeightView ? (val: string) => val.replace('%', '') : undefined} label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.xAxisTitle) as any) : undefined} />
                  <YAxis
                    reversed={!isWeightView && kSensChartType !== 'stackedBar'}
                    tick={tickStyle}
                    axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                    tickLine={getTickLine('left')}
                    domain={(isWeightView || kSensChartType === 'stackedBar') ? [0, 'auto'] : [0.5, alternatives.length]}
                    ticks={(!isWeightView && kSensChartType !== 'stackedBar') ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined}
                    label={kSensChartSettings.showAxisTitles ? (labelStyle(kSensChartSettings.yAxisTitle, true) as any) : undefined}
                    tickFormatter={(isWeightView || kSensChartType === 'stackedBar') ? (val: number) => val.toFixed(2) : undefined}
                  />
                  <Tooltip contentStyle={{ fontSize: `${kSensChartSettings.fontSize}px`, backgroundColor: theme.tooltipBg, color: theme.text, border: `1px solid ${theme.border}` }} formatter={(v: number) => {
                    if (isWeightView) return (v * 100).toFixed(2) + '%';
                    if (kSensChartType === 'stackedBar') return `Score: ${v.toFixed(3)}`;
                    return `Rank: ${v}`;
                  }} />
                  <Legend {...legendProps} iconSize={8} />
                  {(isWeightView ? workingCriteria : alternatives).map((item, idx) => {
                    const color = colorsArr[idx % colorsArr.length];
                    const fill = kSensChartSettings.fillPattern === 'none' ? color : `url(#pattern-${idx % colorsArr.length})`;
                    return (
                      <Bar
                        key={item.name}
                        dataKey={isWeightView ? item.name : (kSensChartType === 'stackedBar' ? `${item.name} Score` : item.name)}
                        name={item.name}
                        stackId={kSensChartType === 'stackedBar' ? "1" : undefined}
                        fill={fill}
                        fillOpacity={kSensChartSettings.fillPattern === 'none' ? (kSensChartSettings.barOpacity || 1) : 1}
                        stroke={kSensChartSettings.showSeparator ? (kSensChartSettings.separatorColor || '#000') : theme.border}
                        strokeWidth={kSensChartSettings.showSeparator ? (kSensChartSettings.borderWidth || 0.5) : 0.5}
                        {...({ baseValue: (!isWeightView && kSensChartType !== 'stackedBar') ? alternatives.length : 0 } as any)}
                      >
                        {kSensChartSettings.showDataLabels ? (
                          <LabelList 
                            dataKey={isWeightView ? item.name : item.name}
                            position="center" 
                            formatter={(val: any) => {
                              if (isWeightView) return (val * 100).toFixed(0);
                              return val; // This is the Rank
                            }}
                            style={{ fontSize: kSensChartSettings.fontSize - 1, fill: '#ffffff', fontWeight: 'bold', pointerEvents: 'none' }} 
                          />
                        ) : null}
                      </Bar>
                    );
                  })}

                {kSensChartSettings.showGridLines && <CartesianGrid {...(gridProps as any)} />}
                {/* Mirror axes placed last to ensure they act as a continuous border frame on top of all elements */}
                <XAxis orientation="top" xAxisId="top_border" axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }} tick={kSensChartSettings.showMirrorTicks ? tickStyle : false} tickLine={kSensChartSettings.showMirrorTicks ? getTickLine('top') : false} />
                <YAxis
                  orientation="right"
                  yAxisId="right_border"
                  width={(kSensChartSettings.showMirrorTicks || kSensChartSettings.frameStyle === 'Box') ? (kSensChartSettings.showMirrorTicks ? 40 : 10) : 0}
                  axisLine={{ stroke: theme.chartBorder, strokeWidth: 1.5 }}
                  tick={kSensChartSettings.showMirrorTicks ? tickStyle : false}
                  tickLine={kSensChartSettings.showMirrorTicks ? getTickLine('right') : false}
                  reversed={!isWeightView}
                  domain={isWeightView ? [0, 'auto'] : [1, alternatives.length]}
                  ticks={!isWeightView ? Array.from({ length: alternatives.length }, (_, i) => i + 1) : undefined}
                />
                <Customized component={RightFrameBorder} />
              </BarChart>
            ) : <div />}
          </ResponsiveContainer>
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
                                {/* Chart Type Selector */}
                                <Select value={kSensChartType} onValueChange={setKSensChartType}>
                                  <SelectTrigger className="w-[140px] h-8 text-[11px] bg-white border-gray-300">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {kSensChartTypes.map(ct => (
                                      <SelectItem key={ct.value} value={ct.value} className="text-[11px]">
                                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                                          <span className="opacity-70">{ct.icon}</span>
                                          {ct.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                {/* Download Buttons Section */}
                                <div className="flex items-center gap-1.5 bg-gray-50/80 p-0.5 rounded-md border border-gray-200 ml-2">
                                  <Button 
                                    onClick={() => downloadChartAsJpeg('jpeg')} 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2.5 text-[10px] font-bold hover:bg-white hover:shadow-sm transition-all text-blue-600 rounded-sm"
                                  >
                                    <Download className="w-3.5 h-3.5 mr-1" /> JPEG
                                  </Button>
                                  <div className="w-[1.5px] h-3.5 bg-gray-300 mx-0.5" />
                                  <Button 
                                    onClick={() => downloadChartAsJpeg('svg')} 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 px-2.5 text-[10px] font-bold hover:bg-white hover:shadow-sm transition-all text-indigo-700 rounded-sm"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 mr-1" /> SVG (Vector)
                                  </Button>
                                </div>
                              </div>
                            </ResearchAssetHeader>
                            <CardDescription className="text-[10px]">
                              Base Case Weight: {(selectedCrit.weight * 100).toFixed(4)}% | Optimality: {selectedCrit.type === 'beneficial' ? 'Higher is Better' : 'Lower is Better'}
                            </CardDescription>
                            
                            {/* Graphic Variation Plate Settings */}
                            <div className="w-full mt-4 px-0 border-t pt-2 transition-all duration-500 ease-in-out">
                              <ChartVisualConfigurator
                                settings={kSensChartSettings}
                                onSettingsChange={setKSensChartSettings}
                              />
                            </div>
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
