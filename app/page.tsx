"use client"

import { useState, useRef, useMemo, Fragment } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import * as XLSX from "xlsx"
import { Upload, ChevronDown, ChevronRight, Home, Download } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area, ComposedChart, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar, PieChart, Pie, ReferenceLine } from "recharts"
import SWEIFormula from "@/components/SWEIFormula"
import SWIFormula from "@/components/SWIFormula"
import TOPSISFormula from "@/components/TOPSISFormula"
import WASPASFormula from "@/components/WASPASFormula"
import VIKORFormula from "@/components/VIKORFormula"
import EDASFormula from "@/components/EDASFormula"
import COPRASFormula from "@/components/COPRASFormula"
import MOORAFormula from "@/components/MOORAFormula"
import MULTIMOORAFormula from "@/components/MULTIMOORAFormula"
import TODIMFormula from "@/components/TODIMFormula"
import CODASFormula from "@/components/CODASFormula"
import MOOSRAFormula from "@/components/MOOSRAFormula"
import MAIRCAFormula from "@/components/MAIRCAFormula"
import MARCOSFormula from "@/components/MARCOSFormula"
import AHPFormula from "@/components/AHPFormula"
import PROMETHEEFormula from "@/components/PROMETHEEFormula"
import PROMETHEE1Formula from "@/components/PROMETHEE1Formula"
import PROMETHEE2Formula from "@/components/PROMETHEE2Formula"
import ELECTREFormula from "@/components/ELECTREFormula"
import ELECTRE1Formula from "@/components/ELECTRE1Formula"
import ELECTRE2Formula from "@/components/ELECTRE2Formula"
import COCOSOFormula from "@/components/COCOSOFormula"
import EntropyFormula from "@/components/EntropyFormula"
import CRITICFormula from "@/components/CRITICFormula"
import EqualWeightsFormula from "@/components/EqualWeightsFormula"
import PIPRECIAFormula from "@/components/PIPRECIAFormula"

interface Criterion {
  id: string
  name: string
  weight: number
  type: "beneficial" | "non-beneficial"
}

interface Alternative {
  id: string
  name: string
  scores: Record<string, number | "">
}

type MCDMMethod = "swei" | "swi" | "topsis" | "vikor" | "waspas" | "edas" | "moora" | "multimoora" | "todim" | "codas" | "moosra" | "mairca" | "marcos" | "cocoso" | "copras" | "promethee" | "promethee1" | "promethee2" | "electre" | "electre1" | "electre2"
type WeightMethod = "equal" | "entropy" | "critic" | "ahp" | "piprecia"
type PageStep = "home" | "input" | "table" | "matrix" | "calculate"
type ComparisonResult = {
  method: MCDMMethod
  label: string
  ranking: { alternativeName: string; rank: number; score: number | string }[]
}

interface PipreciaResult {
  weights: Record<string, number>
  s_values: Record<string, number>
  k_values: Record<string, number>
  q_values: Record<string, number>
}

interface EntropyResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  entropyValues: Record<string, number>
  diversityValues: Record<string, number>
}

interface SensitivityRankingItem {
  alternativeName: string;
  rank: number;
  score: number | string;
}

interface SensitivityResult {
  weight: number;
  weightLabel: string;
  ranking: SensitivityRankingItem[];
}

interface CriticResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  standardDeviations: Record<string, number>
  correlationMatrix: Record<string, Record<string, number>>
  informationAmounts: Record<string, number>
}

interface AHPResult {
  weights: Record<string, number>
  pairwiseMatrix: number[][]
  normalizedMatrix: number[][]
  lambdaMax: number
  consistencyIndex: number
  consistencyRatio: number
}

const MCDM_METHODS: { value: MCDMMethod; label: string; description: string; formula: string }[] = [
  {
    value: "swei",
    label: "SWEI",
    description: "Sum Weighted Exponential Information",
    formula: "Score = Σ(log₂(1/IDM)^Weight)"
  },
  {
    value: "swi",
    label: "SWI",
    description: "Sum Weighted Information",
    formula: "Score = Σ(Normalized Score × Weight)"
  },
  {
    value: "topsis",
    label: "TOPSIS",
    description: "Technique for Order Preference by Similarity to Ideal Solution",
    formula: "Score = D⁻ / (D⁺ + D⁻)"
  },
  {
    value: "vikor",
    label: "VIKOR",
    description: "VlseKriterijumska Optimizacija I Kompromisno Resenje",
    formula: "Q = v(S-S*)/(S⁻-S*) + (1-v)(R-R*)/(R⁻-R*)"
  },
  {
    value: "waspas",
    label: "WASPAS",
    description: "Weighted Aggregated Sum Product Assessment",
    formula: "Q = λ × WSM + (1-λ) × WPM"
  },
  {
    value: "edas",
    label: "EDAS",
    description: "Evaluation based on Distance from Average Solution",
    formula: "AS = (PDA + NDA) / 2"
  },
  {
    value: "moora",
    label: "MOORA",
    description: "Multi-Objective Optimization by Ratio Analysis",
    formula: "y = Σ(beneficial) - Σ(non-beneficial)"
  },
  {
    value: "multimoora",
    label: "MULTIMOORA",
    description: "Multi-Objective Optimization by Ratio Analysis plus Full Multiplicative Form",
    formula: "Score = (Rank_RS + Rank_RP + Rank_FMF) / 3"
  },
  {
    value: "todim",
    label: "TODIM",
    description: "Tomada de Decisão Interativa e Multicritério (Interactive and Multicriteria Decision Making)",
    formula: "ξ_i^norm = (ξ_i - ξ_min) / (ξ_max - ξ_min)"
  },
  {
    value: "codas",
    label: "CODAS",
    description: "Combinative Distance-based Assessment",
    formula: "RA_i = d_i^E + τ × d_i^T"
  },
  {
    value: "moosra",
    label: "MOOSRA",
    description: "Multi-Objective Optimization on the basis of Simple Ratio Analysis",
    formula: "v_i = S_i^+ / S_i^-"
  },
  {
    value: "mairca",
    label: "MAIRCA",
    description: "Multi-Attributive Ideal-Real Comparative Analysis",
    formula: "G_p = Σ(T_pj - R_pj)"
  },
  {
    value: "marcos",
    label: "MARCOS",
    description: "Measurement of Alternatives and Ranking according to Compromise Solution",
    formula: "f(K_i) = K_i^+ / (K_i^+ + K_i^-)"
  },
  {
    value: "cocoso",
    label: "COCOSO",
    description: "Combined Compromise Solution",
    formula: "Score = (kₐ × S + kb × P + kc × (S×P)/(S+P))"
  },
  {
    value: "copras",
    label: "COPRAS",
    description: "Complex Proportional Assessment",
    formula: "Q = S⁺ + adjusted S⁻ term"
  },
  {
    value: "promethee",
    label: "PROMETHEE",
    description: "Preference Ranking Organization Method for Enrichment Evaluations",
    formula: "φ = φ⁺ - φ⁻"
  },
  {
    value: "promethee1",
    label: "PROMETHEE I",
    description: "Preference Ranking Organization Method (Partial Preorder)",
    formula: "Score = Outranked - OutrankedBy (based on φ⁺ and φ⁻)"
  },
  {
    value: "promethee2",
    label: "PROMETHEE II",
    description: "Preference Ranking Organization Method (Complete Ranking)",
    formula: "φ = φ⁺ - φ⁻"
  },
  {
    value: "electre",
    label: "ELECTRE",
    description: "ÉLimination Et Choix Traduisant la REalité",
    formula: "Score = Outranked - OutrankedBy"
  },
  {
    value: "electre1",
    label: "ELECTRE I",
    description: "ÉLimination Et Choix Traduisant la REalité (Basic Outranking)",
    formula: "Score = Outranked - OutrankedBy"
  },
  {
    value: "electre2",
    label: "ELECTRE II",
    description: "ÉLimination Et Choix Traduisant la REalité (Complete Ranking)",
    formula: "Score = Strong Outranked - Strong OutrankedBy"
  },
]

const WEIGHT_METHODS: { value: WeightMethod; label: string; description: string }[] = [
  {
    value: "equal",
    label: "Equal Weights",
    description: "Assigns equal weights to all criteria.",
  },
  {
    value: "entropy",
    label: "Entropy Weight",
    description: "Entropy-based objective weighting method that calculates weights based on information content in the decision matrix.",
  },
  {
    value: "critic",
    label: "CRITIC Method",
    description: "CRITIC (Criteria Importance Through Intercriteria Correlation) method that determines weights based on contrast intensity and conflict between criteria.",
  },
  {
    value: "ahp",
    label: "AHP",
    description: "Analytic Hierarchy Process (AHP) derives weights from a pairwise comparison matrix; here derived from provided priority scores.",
  },
  {
    value: "piprecia",
    label: "PIPRECIA",
    description: "Pivot Pairwise Relative Criteria Importance Assessment (PIPRECIA) determines weights based on subjective relative importance of criteria.",
  },
]

const CHART_COLORS = [
  "#2563eb",
  "#db2777",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
  "#6366f1",
  "#14b8a6",
  "#f97316",
]

export default function MCDMCalculator() {
  const [method, setMethod] = useState<MCDMMethod>("swei")
  const [weightMethod, setWeightMethod] = useState<WeightMethod>("equal")
  const [activeFormulaType, setActiveFormulaType] = useState<"method" | "weight">("method")
  const [homeTab, setHomeTab] = useState<"rankingMethods" | "weightMethods" | "rankingComparison" | "sensitivityAnalysis">("rankingMethods")
  const [comparisonAlternatives, setComparisonAlternatives] = useState<Alternative[]>([])
  const [comparisonCriteria, setComparisonCriteria] = useState<Criterion[]>([])
  const [selectedRankingMethods, setSelectedRankingMethods] = useState<MCDMMethod[]>(["topsis", "swei"])
  const [comparisonWeightMethod, setComparisonWeightMethod] = useState<WeightMethod>("equal")
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([])
  const [comparisonLoading, setComparisonLoading] = useState(false)
  const [comparisonError, setComparisonError] = useState<string | null>(null)
  const [comparisonFileName, setComparisonFileName] = useState<string>("")
  const comparisonFileInputRef = useRef<HTMLInputElement>(null)
  const [currentStep, setCurrentStep] = useState<PageStep>("home")
  const [rankingOpen, setRankingOpen] = useState(true)
  const [weightOpen, setWeightOpen] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [comparisonChartType, setComparisonChartType] = useState<string>("composed")
  const comparisonChartRef = useRef<HTMLDivElement>(null)

  // State to track where to return after completing input flow
  const [returnToTab, setReturnToTab] = useState<"rankingMethods" | "weightMethods" | "rankingComparison" | "sensitivityAnalysis" | null>(null)

  // State for comparison tab collapsible sections
  const [comparisonWeightOpen, setComparisonWeightOpen] = useState(true)
  const [comparisonRankingOpen, setComparisonRankingOpen] = useState(true)

  const [alternatives, setAlternatives] = useState<Alternative[]>([])
  const [criteria, setCriteria] = useState<Criterion[]>([])

  const [numAlternatives, setNumAlternatives] = useState(3)
  const [numCriteria, setNumCriteria] = useState(3)

  const [isLoading, setIsLoading] = useState(false)
  const [apiResults, setApiResults] = useState<any>(null)
  const [entropyResult, setEntropyResult] = useState<EntropyResult | null>(null)
  const [criticResult, setCriticResult] = useState<CriticResult | null>(null)
  const [ahpResult, setAhpResult] = useState<AHPResult | null>(null)
  const [pipreciaResult, setPipreciaResult] = useState<PipreciaResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sensitivity Analysis state
  const [sensitivityCriterion, setSensitivityCriterion] = useState<string>("")
  const [sensitivityMethod, setSensitivityMethod] = useState<MCDMMethod>("topsis")
  const [sensitivityResults, setSensitivityResults] = useState<SensitivityResult[]>([])
  const [sensitivityLoading, setSensitivityLoading] = useState(false)
  const [sensitivityError, setSensitivityError] = useState<string | null>(null)
  // Replaced with string type below for more options
  // const [sensitivityChartType, setSensitivityChartType] = useState<"line" | "bar">("line")
  const [sensitivityChartType, setSensitivityChartType] = useState<string>("line")
  const sensitivityChartRef = useRef<HTMLDivElement>(null)
  const weightChartRef = useRef<HTMLDivElement>(null)

  // New state for Weight Method Comparison in Sensitivity Analysis
  const [sensitivityWeightMethods, setSensitivityWeightMethods] = useState<string[]>([])
  const [sensitivityCustomWeights, setSensitivityCustomWeights] = useState<Record<string, number>>({})
  const [isCustomWeightsDialogOpen, setIsCustomWeightsDialogOpen] = useState(false)

  // PIPRECIA State
  const [isPipreciaDialogOpen, setIsPipreciaDialogOpen] = useState(false)
  const [pipreciaCalculatedWeights, setPipreciaCalculatedWeights] = useState<Record<string, number> | null>(null)
  const [pipreciaScores, setPipreciaScores] = useState<Record<number, string>>({})

  // AHP State
  const [isAhpDialogOpen, setIsAhpDialogOpen] = useState(false)
  const [ahpCalculatedWeights, setAhpCalculatedWeights] = useState<Record<string, number> | null>(null)
  const [ahpMatrix, setAhpMatrix] = useState<number[][]>([])

  const [isWeightSelectorOpen, setIsWeightSelectorOpen] = useState(false)
  const [sensitivityAnalysisType, setSensitivityAnalysisType] = useState<"criterion" | "weights">("criterion") // Toggle between old and new analysis
  const [sensitivityWeightComparisonResults, setSensitivityWeightComparisonResults] = useState<any[]>([])
  const [sensitivityCriteriaWeights, setSensitivityCriteriaWeights] = useState<any[]>([])
  const [weightChartType, setWeightChartType] = useState<string>("bar")


  const parseExcelData = (data: any[][]) => {
    if (data.length < 4) {
      alert("Excel file must have at least 4 rows (headers, max/min, weights, and data)")
      return
    }

    const headers = data[0].slice(1).filter(h => h !== undefined && h !== null && h !== '')
    const types = data[1].slice(1)
    const weights = data[2].slice(1)
    const dataRows = data.slice(3).filter(row => row[0])

    if (headers.length === 0 || dataRows.length === 0) {
      alert("Excel file doesn't contain valid data")
      return
    }

    const newCriteria: Criterion[] = headers.map((header, idx) => ({
      id: `crit-${idx}`,
      name: header?.toString() || `Criteria-${idx + 1}`,
      type: types[idx]?.toString().toLowerCase().includes("min") ? "non-beneficial" as const : "beneficial" as const,
      weight: Number(weights[idx]) || (1 / headers.length),
    }))

    const newAlternatives: Alternative[] = dataRows.map((row, altIdx) => {
      const scores: Record<string, number> = {}
      newCriteria.forEach((crit, critIdx) => {
        const value = row[critIdx + 1]
        scores[crit.id] = Number(value) || 0
      })
      return {
        id: `alt-${altIdx}`,
        name: row[0]?.toString() || `Alt-${altIdx + 1}`,
        scores,
      }
    })

    setCriteria(newCriteria)
    setAlternatives(newAlternatives)
    setNumCriteria(newCriteria.length)
    setNumAlternatives(newAlternatives.length)
  }

  const parseComparisonExcelData = (data: any[][]) => {
    console.log("=== parseComparisonExcelData called ===")
    console.log("Input data rows:", data.length)
    if (data.length < 4) {
      console.error("Error: Need at least 4 rows")
      setComparisonError("Excel file must have at least 4 rows (headers, max/min, weights, data)")
      return
    }

    const headers = data[0].slice(1).filter(h => h !== undefined && h !== null && h !== "")
    const types = data[1].slice(1)
    const weights = data[2].slice(1)
    const dataRows = data.slice(3).filter(row => row[0])

    console.log("Parsed headers:", headers)
    console.log("Parsed types:", types)
    console.log("Parsed weights:", weights)
    console.log("Data rows count:", dataRows.length)

    if (headers.length === 0 || dataRows.length === 0) {
      console.error("Error: No valid data")
      setComparisonError("Excel file doesn't contain valid data")
      return
    }

    const newCriteria: Criterion[] = headers.map((header, idx) => ({
      id: `crit-${idx}`,
      name: header?.toString() || `Criteria-${idx + 1}`,
      type: types[idx]?.toString().toLowerCase().includes("min") ? "non-beneficial" : "beneficial",
      weight: Number(weights[idx]) || 1 / headers.length,
    }))

    const newAlternatives: Alternative[] = dataRows.map((row, altIdx) => {
      const scores: Record<string, number> = {}
      newCriteria.forEach((crit, critIdx) => {
        const value = row[critIdx + 1]
        scores[crit.id] = Number(value) || 0
      })
      return {
        id: `alt-${altIdx}`,
        name: row[0]?.toString() || `Alt-${altIdx + 1}`,
        scores,
      }
    })

    console.log("Created criteria:", newCriteria.length)
    console.log("Created alternatives:", newAlternatives.length)
    console.log("Setting state...")

    setComparisonCriteria(newCriteria)
    setComparisonAlternatives(newAlternatives)
    setComparisonError(null)
    console.log("State updated - data loaded successfully!")
  }

  const handleComparisonFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== handleComparisonFileUpload triggered ===")
    const file = event.target.files?.[0]
    console.log("File selected:", file?.name)
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      console.log("FileReader onload triggered")
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        console.log("Data loaded, size:", data.length)
        const workbook = XLSX.read(data, { type: "array" })
        console.log("Workbook parsed, sheets:", workbook.SheetNames)
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        console.log("JSON data extracted, rows:", (jsonData as any[][]).length)
        console.log("First row:", jsonData[0])
        parseComparisonExcelData(jsonData as any[][])
        setComparisonFileName(file.name)
        console.log("File parsed successfully!")
      } catch (error) {
        console.error("Error parsing file:", error)
        setComparisonError("Error reading Excel file. Please ensure it's a valid Excel file.")
      }
    }
    reader.onerror = (error) => {
      console.error("FileReader error:", error)
    }
    reader.readAsArrayBuffer(file)
    if (comparisonFileInputRef.current) {
      comparisonFileInputRef.current.value = ""
    }
  }

  const toggleRankingMethodSelection = (value: MCDMMethod) => {
    setSelectedRankingMethods((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value],
    )
  }

  const applyWeightMethodForComparison = async (
    weight: WeightMethod,
    alts: Alternative[],
    crits: Criterion[],
  ): Promise<{ criteria: Criterion[]; entropyResult?: EntropyResult; criticResult?: CriticResult }> => {
    if (weight === "equal") {
      const equalCriteria = crits.map((crit) => ({ ...crit, weight: 1 / crits.length }))
      return { criteria: equalCriteria }
    }

    if (weight === "entropy") {
      const response = await fetch("/api/calculate/entropy-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate entropy weights")
      const data: EntropyResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated, entropyResult: data }
    }

    if (weight === "critic") {
      const response = await fetch("/api/calculate/critic-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate CRITIC weights")
      const data: CriticResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated, criticResult: data }
    }

    // AHP
    const response = await fetch("/api/calculate/ahp-weights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ criteria: crits }),
    })
    if (!response.ok) throw new Error("Failed to calculate AHP weights")
    const data: AHPResult = await response.json()
    const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
    return { criteria: updated }
  }

  const handleComparisonCalculate = async () => {
    if (alternatives.length === 0 || criteria.length === 0) {
      setComparisonError("Please add alternatives and criteria first using the 'Get Started' section.")
      return
    }
    if (selectedRankingMethods.length === 0) {
      setComparisonError("Select at least one ranking method.")
      return
    }

    setComparisonLoading(true)
    setComparisonError(null)
    setComparisonResults([])

    try {
      const { criteria: weightedCriteria } = await applyWeightMethodForComparison(
        comparisonWeightMethod,
        alternatives,
        criteria,
      )

      const payloadAlternatives = alternatives

      const resultsPromises = selectedRankingMethods.map(async (m) => {
        try {
          const response = await fetch("/api/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method: m,
              alternatives: payloadAlternatives,
              criteria: weightedCriteria,
            }),
          })
          const data = await response.json()
          if (!response.ok) {
            console.warn(`Method ${m} failed:`, data.error)
            return null
          }
          const info = MCDM_METHODS.find((item) => item.value === m)
          return {
            method: m,
            label: info?.label || m,
            ranking: data.ranking || [],
          } as ComparisonResult
        } catch (err) {
          console.error(`Error calculating ${m}:`, err)
          return null
        }
      })

      const resultsRaw = await Promise.all(resultsPromises)
      const results = resultsRaw.filter((r): r is ComparisonResult => r !== null)

      if (results.length === 0) {
        throw new Error("All selected methods failed. Check input data (e.g. SWEI requires positive values).")
      }

      setComparisonResults(results)
      console.log("Comparison results set:", results)
    } catch (error: any) {
      console.error("Comparison error:", error)
      setComparisonError(error?.message || "Error while calculating comparison.")
    } finally {
      setComparisonLoading(false)
    }
  }

  const downloadComparisonChartAsJpeg = () => {
    if (!comparisonChartRef.current) return
    const svgElement = comparisonChartRef.current.querySelector("svg")
    if (!svgElement) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const blob = new Blob([svgString], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const width = svgElement.clientWidth || svgElement.getBoundingClientRect().width
      const height = svgElement.clientHeight || svgElement.getBoundingClientRect().height
      // Scale up for better quality
      const scale = 2
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Fill white background for JPEG
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.drawImage(img, 0, 0, width, height)

      const imgUrl = canvas.toDataURL("image/jpeg", 0.9)
      const link = document.createElement("a")
      link.href = imgUrl
      link.download = `ranking-comparison-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const comparisonChartData = useMemo(() => {
    if (comparisonResults.length === 0) return []
    const methodOrder = comparisonResults.map((r) => r.label)
    const alternativesSet = new Set<string>()
    comparisonResults.forEach((r) => {
      r.ranking?.forEach((item) => alternativesSet.add(item.alternativeName))
    })
    const alternativesList = Array.from(alternativesSet)

    return methodOrder.map((label, idx) => {
      const entry: Record<string, any> = { method: label }
      const ranking = comparisonResults[idx]?.ranking || []
      ranking.forEach((item) => {
        entry[item.alternativeName] = item.rank
      })
      // Ensure all alternatives exist to avoid undefined in chart
      alternativesList.forEach((alt) => {
        if (entry[alt] === undefined) entry[alt] = null
      })
      return entry
    })
  }, [comparisonResults])

  const comparisonChartAlternatives = useMemo(() => {
    const alternativesSet = new Set<string>()
    comparisonResults.forEach((r) => {
      r.ranking?.forEach((item) => alternativesSet.add(item.alternativeName))
    })
    return Array.from(alternativesSet)
  }, [comparisonResults])

  const composedChartData = useMemo(() => {
    if (comparisonResults.length === 0) return []
    const alts = Array.from(new Set(comparisonResults.flatMap((r) => r.ranking?.map((x) => x.alternativeName) || [])))

    return alts.map((altName) => {
      const row: any = { name: altName }
      comparisonResults.forEach((res) => {
        const item = res.ranking?.find((r) => r.alternativeName === altName)
        if (item) {
          row[`${res.method}_rank`] = item.rank
          row[`${res.method}_score`] = Number(item.score)
        }
      })
      return row
    })
  }, [comparisonResults])

  // Validation warning for SWEI and SWI methods - check if any values are <= 0
  const sweiSwiValidationWarning = useMemo(() => {
    if (method !== "swei" && method !== "swi") return null

    const invalidCells: string[] = []
    alternatives.forEach((alt) => {
      criteria.forEach((crit) => {
        const value = alt.scores[crit.id]
        if (value !== undefined && value !== "" && Number(value) <= 0) {
          invalidCells.push(`${alt.name} - ${crit.name}`)
        }
      })
    })

    if (invalidCells.length === 0) return null

    const methodName = method.toUpperCase()
    return {
      message: `${methodName} requires all values to be greater than zero. Please check your decision matrix.`,
      invalidCells,
    }
  }, [method, alternatives, criteria])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== handleFileUpload triggered ===")
    const file = event.target.files?.[0]
    console.log("File selected:", file?.name)
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      console.log("FileReader onload triggered")
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        console.log("Data loaded, size:", data.length)
        const workbook = XLSX.read(data, { type: "array" })
        console.log("Workbook parsed, sheets:", workbook.SheetNames)
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        console.log("JSON data extracted, rows:", (jsonData as any[][]).length)
        parseExcelData(jsonData as any[][])
        console.log("File parsed successfully!")
      } catch (error) {
        alert("Error reading Excel file. Please ensure it's a valid Excel file.")
        console.error("Error parsing file:", error)
      }
    }
    reader.onerror = (error) => {
      console.error("FileReader error:", error)
    }
    reader.readAsArrayBuffer(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const generateTable = () => {
    const newAlts: Alternative[] = Array.from({ length: numAlternatives }, (_, i) => ({
      id: `alt-${i}`,
      name: `Alt-${i + 1}`,
      scores: {},
    }))

    const newCrits: Criterion[] = Array.from({ length: numCriteria }, (_, i) => ({
      id: `crit-${i}`,
      name: `Criteria-${i + 1}`,
      weight: 1 / numCriteria,
      type: "beneficial",
    }))

    setAlternatives(newAlts)
    setCriteria(newCrits)
    setCurrentStep("table")
  }

  const updateAlternativeName = (id: string, name: string) => {
    setAlternatives(alternatives.map((alt) => (alt.id === id ? { ...alt, name } : alt)))
  }

  const updateAlternativeScore = (altId: string, critId: string, value: string) => {
    if (value !== "") {
      const numValue = Number.parseFloat(value)
      if (isNaN(numValue) || numValue < 0) {
        return
      }
    }

    setAlternatives(
      alternatives.map((alt) =>
        alt.id === altId
          ? {
            ...alt,
            scores: {
              ...alt.scores,
              [critId]: value === "" ? "" : Number.parseFloat(value),
            },
          }
          : alt,
      ),
    )
  }

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    setCriteria(criteria.map((crit) => (crit.id === id ? { ...crit, ...updates } : crit)))
  }

  const calculateWeights = async (methodToUse: WeightMethod) => {
    setIsLoading(true)
    setWeightMethod(methodToUse)

    // Reset previous results
    setEntropyResult(null)
    setCriticResult(null)
    setAhpResult(null)

    if (methodToUse === "equal") {
      const weight = 1 / criteria.length
      setCriteria(criteria.map((c) => ({ ...c, weight })))
      setIsLoading(false)
      return
    }

    try {
      if (methodToUse === "entropy") {
        const response = await fetch("/api/calculate/entropy-weights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alternatives,
            criteria,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to calculate entropy weights")
        }

        const data: EntropyResult = await response.json()
        setEntropyResult(data)
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } else if (methodToUse === "critic") {
        const response = await fetch("/api/calculate/critic-weights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alternatives,
            criteria,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to calculate CRITIC weights")
        }

        const data: CriticResult = await response.json()
        setCriticResult(data)
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } else if (methodToUse === "ahp") {
        const response = await fetch("/api/calculate/ahp-weights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            criteria,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to calculate AHP weights")
        }

        const data: AHPResult = await response.json()
        setAhpResult(data)
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } else if (methodToUse === "piprecia") {
        const response = await fetch("/api/calculate/piprecia-weights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            criteria,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to calculate PIPRECIA weights")
        }

        const data: PipreciaResult = await response.json()
        setPipreciaResult(data)
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      }
    } catch (error) {
      console.error("Error calculating weights:", error)
      alert(`Error calculating ${methodToUse} weights.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTable = async (shouldNavigate = true): Promise<boolean> => {
    const allScoresFilled = alternatives.every((alt) =>
      criteria.every((crit) => {
        const score = alt.scores[crit.id]
        return score !== undefined && score !== "" && Number(score) >= 0
      }),
    )

    if (!allScoresFilled) {
      alert("Please fill in all score values with numbers greater than or equal to 0")
      return false
    }

    // Reset previous weight calculation results
    setEntropyResult(null)
    setCriticResult(null)
    setAhpResult(null)
    setPipreciaResult(null)

    // Calculate entropy weights if entropy method is selected
    if (weightMethod === "entropy") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/calculate/entropy-weights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alternatives,
            criteria,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to calculate entropy weights")
        }

        const data: EntropyResult = await response.json()

        // Save full entropy result for display (normalisation, entropy, diversity, weights)
        setEntropyResult(data)

        // Update criteria with calculated entropy weights
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } catch (error) {
        console.error("Error calculating entropy weights:", error)
        alert("Error calculating entropy weights. Using equal weights instead.")
      } finally {
        setIsLoading(false)
      }
    }

    // Calculate CRITIC weights if CRITIC method is selected
    if (weightMethod === "critic") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/calculate/critic-weights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            alternatives,
            criteria,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to calculate CRITIC weights")
        }

        const data: CriticResult = await response.json()

        // Save full CRITIC result for display
        setCriticResult(data)

        // Update criteria with calculated CRITIC weights
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } catch (error) {
        console.error("Error calculating CRITIC weights:", error)
        alert("Error calculating CRITIC weights. Using equal weights instead.")
      } finally {
        setIsLoading(false)
      }
    }

    // Calculate AHP weights if AHP method is selected
    if (weightMethod === "ahp") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/calculate/ahp-weights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            criteria,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to calculate AHP weights")
        }

        const data: AHPResult = await response.json()

        setAhpResult(data)
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } catch (error) {
        console.error("Error calculating AHP weights:", error)
        alert("Error calculating AHP weights. Using equal weights instead.")
      } finally {
        setIsLoading(false)
      }
    }

    // Calculate PIPRECIA weights if PIPRECIA method is selected
    if (weightMethod === "piprecia") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/calculate/piprecia-weights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            criteria,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to calculate PIPRECIA weights")
        }

        const data: PipreciaResult = await response.json()

        setPipreciaResult(data)
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } catch (error) {
        console.error("Error calculating PIPRECIA weights:", error)
        alert("Error calculating PIPRECIA weights. Using equal weights instead.")
      } finally {
        setIsLoading(false)
      }
    }

    // Check if we need to return to a specific tab after completing input
    if (shouldNavigate) {
      if (returnToTab === "rankingComparison") {
        alert("Data has uploaded")
        setHomeTab("rankingComparison")
        setReturnToTab(null)
        setCurrentStep("home")
      } else if (returnToTab === "sensitivityAnalysis") {
        alert("Data has uploaded")
        setHomeTab("sensitivityAnalysis")
        setReturnToTab(null)
        setCurrentStep("home")
      } else if (returnToTab === "rankingMethods") {
        setHomeTab("rankingMethods")
        setReturnToTab(null)
        setCurrentStep("home")
      } else if (returnToTab === "weightMethods") {
        setHomeTab("weightMethods")
        setReturnToTab(null)
        setCurrentStep("home")
      } else {
        setCurrentStep("matrix")
      }
    }
    return true
  }

  const handleCalculate = async (methodOverride?: string) => {
    setIsLoading(true)
    setApiResults(null)

    try {
      const payload = {
        method: methodOverride || method,
        alternatives,
        criteria,
      }

      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        // Display the error message from the API
        const errorMessage = data.error || "Failed to calculate"
        alert(errorMessage)
        return
      }

      setApiResults(data)
      setCurrentStep("calculate")
    } catch (error) {
      console.error("Error:", error)
      alert("Error calculating results")
    } finally {
      setIsLoading(false)
    }
  }

  const methodInfo = MCDM_METHODS.find((m) => m.value === method)
  const weightMethodInfo = WEIGHT_METHODS.find((w) => w.value === weightMethod)
  const showingWeightFormula = activeFormulaType === "weight"

  const cardTitle = showingWeightFormula
    ? `${weightMethodInfo?.label} Method`
    : `${methodInfo?.label} Method`

  const cardDescription = showingWeightFormula
    ? weightMethodInfo?.description
    : methodInfo?.description

  const cardFormula = showingWeightFormula
    ? weightMethod === "entropy"
      ? "w_j = d_j / Σd_j, where d_j = 1 - E_j and E_j = -k Σ(p_ij × ln(p_ij))"
      : weightMethod === "critic"
        ? "w_j = C_j / ΣC_j, where C_j = σ_j × Σ(1 - r_jk)"
        : weightMethod === "ahp"
          ? "w = eigenvector of pairwise matrix a_ij = w_i / w_j; check CR = CI / RI"
          : weightMethod === "piprecia"
            ? "w_j = q_j / Σq, where q_j = q_{j-1}/k_j, k_j derived from relative importance sort"
            : weightMethodInfo?.label
    : methodInfo?.formula

  const cardLongDescription = showingWeightFormula
    ? weightMethod === "entropy"
      ? "Entropy-based objective weighting method that calculates weights based on information content in the decision matrix. Higher entropy means more uncertainty (less information), resulting in lower weight. Lower entropy means more information content, resulting in higher weight."
      : weightMethod === "critic"
        ? "CRITIC method determines weights based on both contrast intensity (standard deviation) and conflict (correlation) between criteria. Higher information content (higher contrast and lower correlation) results in higher weights."
        : weightMethod === "ahp"
          ? "AHP derives weights from pairwise comparisons (here built from provided priority scores). It computes the eigenvector of the pairwise matrix and checks consistency (CI/CR)."
          : weightMethod === "piprecia"
            ? "PIPRECIA determines weights based on the relative importance of each criterion compared to the previous one in a sorted sequence."
            : weightMethodInfo?.description
    : methodInfo?.description

  // Sensitivity Analysis calculation function
  const handleSensitivityAnalysis = async () => {
    if (!sensitivityCriterion) {
      setSensitivityError("Please select a criterion to analyze")
      return
    }
    if (alternatives.length === 0 || criteria.length === 0) {
      setSensitivityError("Please add alternatives and criteria first")
      return
    }

    setSensitivityLoading(true)
    setSensitivityError(null)
    setSensitivityResults([])

    try {
      const selectedCrit = criteria.find(c => c.id === sensitivityCriterion)
      if (!selectedCrit) {
        throw new Error("Selected criterion not found")
      }

      // Generate weight variations (0% to 100% in steps of 10%)
      const weightSteps = 11 // 0%, 10%, 20%, ..., 100%
      const results: any[] = []

      for (let i = 0; i < weightSteps; i++) {
        const newWeight = i * 0.1 // 0.0 to 1.0

        // Create modified criteria with adjusted weights
        const modifiedCriteria = criteria.map(crit => {
          if (crit.id === sensitivityCriterion) {
            return { ...crit, weight: newWeight }
          } else {
            // Distribute remaining weight proportionally among other criteria
            const remainingWeight = 1 - newWeight
            const otherCriteriaCount = criteria.length - 1
            const otherWeight = otherCriteriaCount > 0 ? remainingWeight / otherCriteriaCount : 0
            return { ...crit, weight: otherWeight }
          }
        })

        // Calculate ranking with modified weights
        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: sensitivityMethod,
            alternatives,
            criteria: modifiedCriteria,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to calculate for weight ${(newWeight * 100).toFixed(0)}%`)
        }

        const data = await response.json()

        results.push({
          weight: newWeight * 100, // Convert to percentage
          weightLabel: `${(newWeight * 100).toFixed(0)}%`,
          ranking: data.ranking || [],
        })
      }

      setSensitivityResults(results)
    } catch (error: any) {
      console.error("Sensitivity analysis error:", error)
      setSensitivityError(error?.message || "Error performing sensitivity analysis")
    } finally {
      setSensitivityLoading(false)
    }
  }

  // Download chart as JPEG function
  const downloadChartAsJpeg = (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return

    const svgElement = ref.current.querySelector('svg')
    if (!svgElement) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)

    // Get dimensions
    const width = svgElement.viewBox.baseVal.width || svgElement.clientWidth || 600
    const height = svgElement.viewBox.baseVal.height || svgElement.clientHeight || 400

    const canvas = document.createElement('canvas')
    canvas.width = width * 2 // 2x for high quality
    canvas.height = height * 2
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(2, 2)

    const img = new Image()
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height)
      const imgUrl = canvas.toDataURL('image/jpeg', 0.9)
      const link = document.createElement('a')
      link.href = imgUrl
      link.download = `${filename}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  // Download chart function (SVG)
  const downloadChart = () => {
    if (!sensitivityChartRef.current) return
    // ... existing SVG export logic preserved for backward compatibility/preference
    const svgElement = sensitivityChartRef.current.querySelector('svg')
    if (!svgElement) return

    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `sensitivity-analysis-${sensitivityMethod}-${Date.now()}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Prepare data for sensitivity chart
  const sensitivityChartData = useMemo(() => {
    if (sensitivityResults.length === 0) return []

    return sensitivityResults.map(result => {
      const dataPoint: Record<string, any> = {
        weight: result.weight,
        weightLabel: result.weightLabel,
      }

      result.ranking.forEach((item: any) => {
        dataPoint[item.alternativeName] = item.rank
      })

      return dataPoint
    })
  }, [sensitivityResults])

  const sensitivityAlternatives = useMemo(() => {
    if (sensitivityResults.length === 0 || sensitivityResults[0].ranking.length === 0) return []
    return sensitivityResults[0].ranking.map((item: SensitivityRankingItem) => item.alternativeName)
  }, [sensitivityResults])


  // New Logic: Compare Ranking across Weight Methods
  const handleWeightSensitivityAnalysis = async (pipreciaWeightsOverride?: Record<string, number>) => {
    if (sensitivityWeightMethods.length === 0) {
      setSensitivityError("Please select at least one weight method.")
      return
    }
    if (alternatives.length === 0 || criteria.length === 0) {
      setSensitivityError("Please add alternatives and criteria first.")
      return
    }

    setSensitivityLoading(true)
    setSensitivityError(null)
    setSensitivityWeightComparisonResults([])

    try {
      const results = await Promise.all(
        sensitivityWeightMethods.map(async (wm) => {
          let weightedCriteria = [...criteria]

          // Apply weight method
          if (wm === "equal") {
            weightedCriteria = criteria.map(c => ({ ...c, weight: 1 / criteria.length }))
          } else if (wm === "entropy") {
            // We can allow reusing cached results if available, but for safety call API
            // Or better, extract the weight calculation logic to a reusable function "applyWeightMethod"
            // reusing applyWeightMethodForComparison I previously defined for Ranking Comparison
            const res = await applyWeightMethodForComparison("entropy", alternatives, criteria)
            weightedCriteria = res.criteria
          } else if (wm === "critic") {
            const res = await applyWeightMethodForComparison("critic", alternatives, criteria)
            weightedCriteria = res.criteria
          } else if (wm === "ahp") {
            // Use stored or overridden weights for AHP
            const weightsToUse = ahpCalculatedWeights || {};
            weightedCriteria = criteria.map(c => ({
              ...c,
              weight: weightsToUse[c.id] !== undefined ? weightsToUse[c.id] : (1 / criteria.length)
            }))
          } else if (wm === "piprecia") {
            // Use stored or overridden weights for PIPRECIA
            const weightsToUse = pipreciaWeightsOverride || pipreciaCalculatedWeights || {};
            weightedCriteria = criteria.map(c => ({
              ...c,
              weight: weightsToUse[c.id] !== undefined ? weightsToUse[c.id] : (1 / criteria.length)
            }))
          }

          // Special handling for "Custom" if I add "custom" to WeightMethod type or handle separately
          // Re-using applyWeightMethodForComparison might be limited because it returns Promise

          return { wm, criteria: weightedCriteria }
        })
      )

      // Calculate Ranking for each weight set
      const finalResults = await Promise.all(
        results.map(async ({ wm, criteria: wCrits }) => {
          const response = await fetch("/api/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method: sensitivityMethod,
              alternatives,
              criteria: wCrits,
            }),
          })
          const data = await response.json()
          if (!response.ok) throw new Error(`Failed to calculate for ${wm}`)

          const label = WEIGHT_METHODS.find(w => w.value === wm)?.label || wm
          return {
            method: sensitivityMethod,
            weightMethod: wm,
            weightLabel: label,
            ranking: data.ranking || []
          }
        })
      )

      // Handle "Custom" weights
      if (sensitivityWeightMethods.includes("custom")) {
        const customCriteria = criteria.map(c => ({
          ...c,
          weight: sensitivityCustomWeights[c.id] !== undefined ? sensitivityCustomWeights[c.id] : (1 / criteria.length)
        }))

        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: sensitivityMethod,
            alternatives,
            criteria: customCriteria,
          }),
        })
        const data = await response.json()
        if (response.ok) {
          finalResults.push({
            method: sensitivityMethod,
            weightMethod: "custom",
            weightLabel: "Custom Weights",
            ranking: data.ranking || []
          })
        }
      }

      setSensitivityWeightComparisonResults(finalResults)

      // --- New: Prepare Weight Variation Data ---
      const weightDataMap: Record<string, any> = {}
      criteria.forEach(c => {
        weightDataMap[c.id] = { name: c.name }
      })

      const allWeightResults = [...results]
      if (sensitivityWeightMethods.includes("custom")) {
        // We need to reconstruct the custom criteria locally since it wasn't in the Promise.all loop results with the same structure
        const customCriteria = criteria.map(c => ({
          ...c,
          weight: sensitivityCustomWeights[c.id] !== undefined ? sensitivityCustomWeights[c.id] : (1 / criteria.length)
        }))
        allWeightResults.push({ wm: 'custom', criteria: customCriteria })
      }

      allWeightResults.forEach(({ wm, criteria: wCrits }) => {
        const label = WEIGHT_METHODS.find(w => w.value === wm)?.label || (wm === 'custom' ? 'Custom' : wm)
        wCrits.forEach(c => {
          if (weightDataMap[c.id]) {
            weightDataMap[c.id][label] = c.weight
          }
        })
      })
      setSensitivityCriteriaWeights(Object.values(weightDataMap))
      // ------------------------------------------

    } catch (error: any) {
      console.error(error)
      setSensitivityError(error?.message || "Error calculating weight comparison")
    } finally {
      setSensitivityLoading(false)
    }
  }

  // Helper for toggle
  const toggleSensitivityWeightMethod = (method: string) => {
    setSensitivityWeightMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    )
  }

  const alternativesList = useMemo(() => alternatives.map(a => a.name), [alternatives])

  // Chart data preparation for Sensitivity Weight Comparison
  const sensitivityWeightChartData = useMemo(() => {
    if (sensitivityWeightComparisonResults.length === 0) return []

    // X-axis: Alternatives
    // Series: Weight Methods (Score or Rank)

    // We need to pivot the data
    const alternativesMap: Record<string, any> = {}

    // Initialize with alternative names
    alternativesList.forEach(alt => {
      alternativesMap[alt] = { name: alt }
    })

    sensitivityWeightComparisonResults.forEach(res => {
      res.ranking.forEach((item: any) => {
        if (alternativesMap[item.alternativeName]) {
          alternativesMap[item.alternativeName][`${res.weightLabel} Score`] = typeof item.score === 'number' ? item.score : parseFloat(item.score)
          alternativesMap[item.alternativeName][`${res.weightLabel} Rank`] = item.rank
        }
      })
    })

    return Object.values(alternativesMap)

  }, [sensitivityWeightComparisonResults, alternativesList])


  if (currentStep === "home") {
    return (
      <main className="flex-1 min-h-screen bg-white p-2 md:p-3">
        <div className="max-w-2xl mx-auto py-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            {/* SidebarTrigger removed */}
            <div>
              <h1 className="text-2xl font-bold text-black">Decision Matrix</h1>
              <p className="text-xs text-gray-700">Multicriteria Decision Making Calculator</p>
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shrink-0">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant="outline"
              className={`text-xs h-8 cursor-pointer ${homeTab === "rankingMethods" ? "bg-[#FFF2CC] border-[#FFF2CC] text-black hover:bg-[#FFE699]" : "bg-white border-gray-200 text-black hover:bg-gray-50"}`}
              onClick={() => setHomeTab("rankingMethods")}
            >
              Ranking Methods / Calculator
            </Button>
            <Button
              variant="outline"
              className={`text-xs h-8 cursor-pointer ${homeTab === "weightMethods" ? "bg-[#FFF2CC] border-[#FFF2CC] text-black hover:bg-[#FFE699]" : "bg-white border-gray-200 text-black hover:bg-gray-50"}`}
              onClick={() => setHomeTab("weightMethods")}
            >
              Weight Methods
            </Button>
            <Button
              variant="outline"
              className={`text-xs h-8 cursor-pointer ${homeTab === "rankingComparison" ? "bg-[#FFF2CC] border-[#FFF2CC] text-black hover:bg-[#FFE699]" : "bg-white border-gray-200 text-black hover:bg-gray-50"}`}
              onClick={() => setHomeTab("rankingComparison")}
            >
              Ranking comparison
            </Button>
            <Button
              variant="outline"
              className={`text-xs h-8 cursor-pointer ${homeTab === "sensitivityAnalysis" ? "bg-[#FFF2CC] border-[#FFF2CC] text-black hover:bg-[#FFE699]" : "bg-white border-gray-200 text-black hover:bg-gray-50"}`}
              onClick={() => setHomeTab("sensitivityAnalysis")}
            >
              Sensitivity Analysis
            </Button>
          </div>

          {(homeTab === "rankingMethods" || homeTab === "weightMethods") && (
            <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-black">Get Started</CardTitle>
                <CardDescription className="text-xs text-gray-700">
                  Create a decision matrix by adding alternatives and criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => {
                    setReturnToTab(homeTab === "weightMethods" ? "weightMethods" : "rankingMethods")
                    setCurrentStep("input")
                  }}
                  className="w-full bg-black text-white hover:bg-gray-800 text-xs h-8"
                >
                  + Add Alternative & Criteria
                </Button>
              </CardContent>
            </Card>
          )}

          {homeTab === "rankingMethods" && (
            <>
              <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Ranking Methods</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Select a ranking method to use in your calculations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MCDM_METHODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => {
                          setMethod(m.value)
                          setActiveFormulaType("method")
                          setIsDialogOpen(true)
                        }}
                        className={`text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${method === m.value
                          ? "border-[#F8BBD0] bg-[#FCE4EC] text-black"
                          : "border-gray-200 bg-white text-black hover:border-[#F8BBD0] hover:bg-[#FCE4EC]"
                          }`}
                      >
                        <div className="font-semibold text-sm mb-1">{m.label}</div>
                        <div className="text-xs mb-2 text-gray-700">
                          {m.description}
                        </div>
                        <div className="text-[11px] font-mono text-gray-600">
                          {m.formula}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>




            </>
          )}

          {homeTab === "weightMethods" && (
            <>
              <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Weight Methods Reference</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Click on a method to view its formula and description
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {WEIGHT_METHODS.map((w) => (
                      <button
                        key={w.value}
                        onClick={() => {
                          setWeightMethod(w.value)
                          setActiveFormulaType("weight")
                          setIsDialogOpen(true)
                        }}
                        className={`text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${weightMethod === w.value
                          ? "border-[#90CAF9] bg-[#E3F2FD] text-black"
                          : "border-gray-200 bg-white text-black hover:border-[#90CAF9] hover:bg-[#E3F2FD]"
                          }`}
                      >
                        <div className="font-semibold text-sm mb-1">{w.label}</div>
                        <div className="text-xs text-gray-700">
                          {w.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Weight Comparison Analysis</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Select methods to calculate and compare criteria weights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-black">Select Methods to Compare:</p>
                    <div className="flex flex-wrap gap-2">
                      {WEIGHT_METHODS.map((w) => (
                        <label key={w.value} className="flex items-center gap-2 text-xs p-2 rounded border border-gray-100 hover:bg-gray-50 cursor-pointer text-black">
                          <input
                            type="checkbox"
                            checked={sensitivityWeightMethods.includes(w.value)}
                            onChange={() => {
                              if (w.value === "piprecia" && !sensitivityWeightMethods.includes("piprecia")) {
                                setIsPipreciaDialogOpen(true)
                              }
                              if (w.value === "ahp" && !sensitivityWeightMethods.includes("ahp")) {
                                setIsAhpDialogOpen(true)
                              }
                              toggleSensitivityWeightMethod(w.value)
                            }}
                            className="rounded border-gray-300"
                          />
                          {w.label}
                        </label>
                      ))}
                      <label className="flex items-center gap-2 text-xs p-2 rounded border border-gray-100 hover:bg-gray-50 cursor-pointer text-black">
                        <input
                          type="checkbox"
                          checked={sensitivityWeightMethods.includes("custom")}
                          onChange={(e) => {
                            toggleSensitivityWeightMethod("custom")
                            if (e.target.checked) setIsCustomWeightsDialogOpen(true)
                          }}
                          className="rounded border-gray-300"
                        />
                        Enter own weights
                      </label>
                    </div>

                    <Dialog open={isCustomWeightsDialogOpen} onOpenChange={setIsCustomWeightsDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Enter Custom Weights</DialogTitle>
                          <DialogDescription>Sum must equal 1</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                          {criteria.map((crit) => (
                            <div key={crit.id} className="grid grid-cols-4 items-center gap-4">
                              <label className="text-right text-xs col-span-2">{crit.name}</label>
                              <Input
                                type="number"
                                step="0.01"
                                className="col-span-2 h-8 text-xs"
                                value={sensitivityCustomWeights[crit.id] || ""}
                                onChange={(e) => setSensitivityCustomWeights(prev => ({ ...prev, [crit.id]: parseFloat(e.target.value) }))}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <div className="text-xs flex items-center mr-auto">
                            Total: {Object.values(sensitivityCustomWeights).reduce((a, b) => a + (b || 0), 0).toFixed(2)}
                          </div>
                          <Button onClick={() => setIsCustomWeightsDialogOpen(false)} size="sm">Save</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* --- PIPRECIA Dialog (Weight Methods Tab) --- */}
                    <Dialog open={isPipreciaDialogOpen} onOpenChange={setIsPipreciaDialogOpen}>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
                        <DialogTitle>PIPRECIA Weight Calculator</DialogTitle>
                        <PIPRECIAFormula
                          criteria={criteria}
                          initialScores={pipreciaScores}
                          onScoresChange={setPipreciaScores}
                          onWeightsCalculated={(weights) => {
                            setPipreciaCalculatedWeights(weights)
                            setIsPipreciaDialogOpen(false)
                            // Automatically trigger analysis update with new weights
                            handleWeightSensitivityAnalysis(weights)
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                    {/* --- AHP Dialog (Weight Methods Tab) --- */}
                    <Dialog open={isAhpDialogOpen} onOpenChange={setIsAhpDialogOpen}>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                        <DialogTitle>AHP Weight Calculator</DialogTitle>
                        <AHPFormula
                          criteria={criteria}
                          initialMatrix={ahpMatrix}
                          onMatrixChange={setAhpMatrix}
                          onWeightsCalculated={(weights) => {
                            setAhpCalculatedWeights(weights)
                            setIsAhpDialogOpen(false)
                            // Automatically trigger analysis update with new weights
                            handleWeightSensitivityAnalysis()
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                  </div>

                  {sensitivityError && (
                    <div className="text-xs text-red-600 border border-red-200 bg-red-50 p-2 rounded">
                      {sensitivityError}
                    </div>
                  )}

                  <Button
                    onClick={handleWeightSensitivityAnalysis}
                    disabled={sensitivityLoading}
                    className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 text-xs h-8"
                  >
                    {sensitivityLoading ? "Calculating..." : "Calculate Weights & Compare"}
                  </Button>
                </CardContent>
              </Card>

              {sensitivityCriteriaWeights.length > 0 && (
                <>
                  <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-sm text-black">Weight Variation Chart</CardTitle>
                        <CardDescription className="text-xs text-gray-700">Visualizing weights across different methods</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={weightChartType} onValueChange={setWeightChartType}>
                          <SelectTrigger className="w-32 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="stackedBar">Stacked Bar</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="area">Area Chart</SelectItem>
                            <SelectItem value="radar">Radar Chart</SelectItem>
                            <SelectItem value="scatter">Scatter Plot</SelectItem>
                            <SelectItem value="composed">Composed</SelectItem>
                            <SelectItem value="radial">Radial Bar</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={() => downloadChartAsJpeg(weightChartRef, 'weight-analysis')} variant="outline" size="sm" className="h-7 text-xs"><Download className="w-3 h-3 mr-1" /> JPG</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div style={{ height: 400 }} ref={weightChartRef}>
                        <ResponsiveContainer width="100%" height="100%">
                          {weightChartType === 'radar' ? (
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sensitivityCriteriaWeights}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <PolarRadiusAxis />
                              <Legend wrapperStyle={{ fontSize: "10px" }} />
                              <Tooltip />
                              {sensitivityWeightComparisonResults.map((res, i) => (
                                <Radar
                                  key={res.weightLabel}
                                  name={res.weightLabel}
                                  dataKey={res.weightLabel}
                                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                                  fillOpacity={0.1}
                                />
                              ))}
                            </RadarChart>
                          ) : weightChartType === 'bar' ? (
                            <BarChart data={sensitivityCriteriaWeights}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <YAxis label={{ value: 'Weight', angle: -90, position: 'insideLeft' }} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: "10px" }} />
                              {sensitivityWeightComparisonResults.map((res, i) => (
                                <Bar key={res.weightLabel} dataKey={res.weightLabel} fill={CHART_COLORS[i % CHART_COLORS.length]} name={res.weightLabel} />
                              ))}
                            </BarChart>
                          ) : weightChartType === 'stackedBar' ? (
                            <BarChart data={sensitivityCriteriaWeights}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <YAxis label={{ value: 'Weight', angle: -90, position: 'insideLeft' }} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: "10px" }} />
                              {sensitivityWeightComparisonResults.map((res, i) => (
                                <Bar key={res.weightLabel} stackId="a" dataKey={res.weightLabel} fill={CHART_COLORS[i % CHART_COLORS.length]} name={res.weightLabel} />
                              ))}
                            </BarChart>
                          ) : weightChartType === 'line' ? (
                            <LineChart data={sensitivityCriteriaWeights}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <YAxis label={{ value: 'Weight', angle: -90, position: 'insideLeft' }} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: "10px" }} />
                              {sensitivityWeightComparisonResults.map((res, i) => (
                                <Line key={res.weightLabel} type="monotone" dataKey={res.weightLabel} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} name={res.weightLabel} />
                              ))}
                            </LineChart>
                          ) : weightChartType === 'area' ? (
                            <AreaChart data={sensitivityCriteriaWeights}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <YAxis label={{ value: 'Weight', angle: -90, position: 'insideLeft' }} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: "10px" }} />
                              {sensitivityWeightComparisonResults.map((res, i) => (
                                <Area key={res.weightLabel} type="monotone" dataKey={res.weightLabel} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.3} name={res.weightLabel} />
                              ))}
                            </AreaChart>
                          ) : weightChartType === 'composed' ? (
                            <ComposedChart data={sensitivityCriteriaWeights}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <YAxis label={{ value: 'Weight', angle: -90, position: 'insideLeft' }} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: "10px" }} />
                              {sensitivityWeightComparisonResults.map((res, i) => (
                                <Fragment key={i}>
                                  <Bar dataKey={res.weightLabel} fill={CHART_COLORS[i % CHART_COLORS.length]} name={res.weightLabel} barSize={20} />
                                  <Line type="monotone" dataKey={res.weightLabel} stroke={CHART_COLORS[(i + 1) % CHART_COLORS.length]} name={res.weightLabel} strokeWidth={2} />
                                </Fragment>
                              ))}
                            </ComposedChart>
                          ) : weightChartType === 'scatter' ? (
                            <ScatterChart>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 10 }} />
                              <YAxis dataKey="weight" name="Weight" label={{ value: 'Weight', angle: -90, position: 'insideLeft' }} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend wrapperStyle={{ fontSize: "10px" }} />
                              {sensitivityWeightComparisonResults.map((res, i) => (
                                <Scatter key={res.weightLabel} name={res.weightLabel} data={sensitivityCriteriaWeights.map(d => ({ name: d.name, weight: d[res.weightLabel] }))} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </ScatterChart>
                          ) : (
                            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={sensitivityCriteriaWeights}>
                              <RadialBar
                                label={{ position: 'insideStart', fill: '#fff' }}
                                background
                                dataKey={sensitivityWeightComparisonResults[0]?.weightLabel}
                              />
                              <Legend iconSize={10} wrapperStyle={{ fontSize: "10px" }} />
                              {sensitivityWeightComparisonResults.map((res, i) => (
                                <RadialBar key={res.weightLabel} name={res.weightLabel} dataKey={res.weightLabel} fill={CHART_COLORS[i % CHART_COLORS.length]} background />
                              ))}
                              <Tooltip />
                            </RadialBarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Weight Values Table</CardTitle>
                      <CardDescription className="text-xs text-gray-700">Detailed numerical weights for each criterion</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <table className="min-w-full text-xs border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left border-b border-r text-black font-semibold">Criterion</th>
                            {sensitivityWeightComparisonResults.map((res, i) => (
                              <th key={i} className="px-3 py-2 text-center border-b border-l text-black font-semibold">
                                {res.weightLabel}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sensitivityCriteriaWeights.map((row, i) => (
                            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-black border-r border-gray-200">{row.name}</td>
                              {sensitivityWeightComparisonResults.map((res, k) => (
                                <td key={k} className="px-3 py-2 text-center text-black border-l border-gray-200">
                                  {row[res.weightLabel] !== undefined ? Number(row[res.weightLabel]).toFixed(4) : "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </>
              )}




            </>
          )}

          {homeTab === "rankingComparison" && (
            <>
              <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Get Started</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Create a decision matrix by adding alternatives and criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => {
                      setReturnToTab("rankingComparison")
                      setCurrentStep("input")
                    }}
                    className="w-full bg-black text-white hover:bg-gray-800 text-xs h-8"
                  >
                    + Add Alternative & Criteria
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white shadow-none w-full mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Ranking comparison</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Choose one weight method, pick ranking methods to compare, then view rankings and chart.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alternatives.length > 0 && criteria.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-[11px] text-green-700 bg-green-50 border border-green-200 p-2 rounded">
                        <p className="font-semibold">✓ Data has uploaded</p>
                        <p className="mt-1">
                          {alternatives.length} alternatives × {criteria.length} criteria
                        </p>
                      </div>

                      {/* Editable Decision Matrix Table */}
                      <div className="border border-gray-200 rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="text-xs text-black font-semibold w-24">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className="text-xs text-black font-semibold text-center min-w-20">
                                  <div>{crit.name}</div>
                                  <div className="text-[10px] text-gray-500 font-normal">
                                    {crit.type === "beneficial" ? "Max" : "Min"}
                                  </div>
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((alt) => (
                              <TableRow key={alt.id}>
                                <TableCell className="text-xs text-black font-medium">{alt.name}</TableCell>
                                {criteria.map((crit) => (
                                  <TableCell key={crit.id} className="p-1">
                                    <Input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={alt.scores[crit.id] ?? ""}
                                      onChange={(e) => updateAlternativeScore(alt.id, crit.id, e.target.value)}
                                      className="text-center text-xs h-8 border-gray-200 text-black w-full shadow-none"
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
                      <p className="font-semibold">⚠️ No data available</p>
                      <p className="mt-1">
                        Please add alternatives and criteria using the "Get Started" section above.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <button
                        type="button"
                        onClick={() => setComparisonWeightOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between mb-2"
                      >
                        <p className="text-xs font-semibold text-black">Weight method (choose one)</p>
                        {comparisonWeightOpen ? (
                          <ChevronDown className="w-4 h-4 text-black" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-black" />
                        )}
                      </button>
                      {comparisonWeightOpen && (
                        <div className="space-y-2 mt-2">
                          {WEIGHT_METHODS.map((w) => (
                            <label key={w.value} className="flex items-start gap-2 text-xs text-black cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={comparisonWeightMethod === w.value}
                                onChange={() => {
                                  if (w.value === "piprecia") {
                                    setIsPipreciaDialogOpen(true)
                                  }
                                  if (w.value === "ahp") {
                                    setIsAhpDialogOpen(true)
                                  }
                                  setComparisonWeightMethod(w.value)
                                }}
                                disabled={comparisonLoading}
                                className="mt-0.5"
                              />
                              <span>
                                <span className="font-semibold">{w.label}</span>{" "}
                                <span className="text-gray-700">{w.description}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border border-gray-200 rounded-lg p-3">
                      <button
                        type="button"
                        onClick={() => setComparisonRankingOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between mb-2"
                      >
                        <p className="text-xs font-semibold text-black">
                          Ranking methods ({selectedRankingMethods.length} selected)
                        </p>
                        {comparisonRankingOpen ? (
                          <ChevronDown className="w-4 h-4 text-black" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-black" />
                        )}
                      </button>
                      {comparisonRankingOpen && (
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
                          {MCDM_METHODS.map((m) => (
                            <label key={m.value} className="flex items-start gap-2 text-[11px] text-black cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={selectedRankingMethods.includes(m.value)}
                                onChange={() => toggleRankingMethodSelection(m.value)}
                                disabled={comparisonLoading}
                                className="mt-0.5"
                              />
                              <span>
                                <span className="font-semibold">{m.label}</span>{" "}
                                <span className="text-gray-700">{m.description}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {comparisonError && (
                    <div className="text-xs text-red-600 border border-red-200 bg-red-50 p-2 rounded">
                      {comparisonError}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={handleComparisonCalculate}
                      className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                      disabled={comparisonLoading}
                    >
                      {comparisonLoading ? "Calculating..." : "Calculate comparison"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* --- PIPRECIA Dialog (Ranking Comparison Tab) --- */}
              <Dialog open={isPipreciaDialogOpen} onOpenChange={setIsPipreciaDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
                  <DialogTitle>PIPRECIA Weight Calculator</DialogTitle>
                  <PIPRECIAFormula
                    criteria={comparisonCriteria.length > 0 ? comparisonCriteria : criteria}
                    initialScores={pipreciaScores}
                    onScoresChange={setPipreciaScores}
                    onWeightsCalculated={(weights) => {
                      setPipreciaCalculatedWeights(weights)
                      setIsPipreciaDialogOpen(false)

                      // Update criteria with new weights
                      const targetCriteria = comparisonCriteria.length > 0 ? comparisonCriteria : criteria
                      const updatedCriteria = targetCriteria.map(c => ({
                        ...c,
                        weight: weights[c.id] || 0
                      }))

                      if (comparisonCriteria.length > 0) {
                        setComparisonCriteria(updatedCriteria)
                      } else {
                        setCriteria(updatedCriteria)
                      }

                      // Set weight method to PIPRECIA
                      setComparisonWeightMethod("piprecia")

                      // Automatically trigger comparison calculation
                      setTimeout(() => handleComparisonCalculate(), 100)
                    }}
                  />
                </DialogContent>
              </Dialog>

              {/* --- AHP Dialog (Ranking Comparison Tab) --- */}
              <Dialog open={isAhpDialogOpen} onOpenChange={setIsAhpDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                  <DialogTitle>AHP Weight Calculator</DialogTitle>
                  <AHPFormula
                    criteria={comparisonCriteria.length > 0 ? comparisonCriteria : criteria}
                    initialMatrix={ahpMatrix}
                    onMatrixChange={setAhpMatrix}
                    onWeightsCalculated={(weights) => {
                      setAhpCalculatedWeights(weights)
                      setIsAhpDialogOpen(false)

                      // Update criteria with new weights
                      const targetCriteria = comparisonCriteria.length > 0 ? comparisonCriteria : criteria
                      const updatedCriteria = targetCriteria.map(c => ({
                        ...c,
                        weight: weights[c.id] || 0
                      }))

                      if (comparisonCriteria.length > 0) {
                        setComparisonCriteria(updatedCriteria)
                      } else {
                        setCriteria(updatedCriteria)
                      }

                      // Set weight method to AHP
                      setComparisonWeightMethod("ahp")

                      // Automatically trigger comparison calculation
                      setTimeout(() => handleComparisonCalculate(), 100)
                    }}
                  />
                </DialogContent>
              </Dialog>

              {comparisonResults.length > 0 && (
                <Card className="border-gray-200 bg-white shadow-none w-full mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-black">Ranking table</CardTitle>
                    <CardDescription className="text-xs text-gray-700">
                      Scores and rankings generated by the methods. Ranking depends on the method used.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th rowSpan={2} className="text-left px-3 py-2 border-b border-r border-gray-200 text-black font-semibold align-bottom">
                            Alternative
                          </th>
                          {comparisonResults.map((result) => (
                            <th
                              key={result.method}
                              colSpan={2}
                              className="px-3 py-2 text-center border-b border-r border-gray-200 text-black font-semibold"
                            >
                              {result.label}
                            </th>
                          ))}
                        </tr>
                        <tr>
                          {comparisonResults.map((result) => (
                            <Fragment key={result.method}>
                              <th key={`${result.method}-score`} className="px-2 py-1 text-center border-b border-gray-200 text-gray-600 font-medium text-[10px]">
                                Score
                              </th>
                              <th key={`${result.method}-rank`} className="px-2 py-1 text-center border-b border-r border-gray-200 text-gray-600 font-medium text-[10px]">
                                Rank
                              </th>
                            </Fragment>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonResults[0]?.ranking?.map((item, altIndex) => (
                          <tr key={item.alternativeName} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-black whitespace-nowrap border-r border-gray-200">
                              {item.alternativeName}
                            </td>
                            {comparisonResults.map((result) => {
                              const altRanking = result.ranking?.find(r => r.alternativeName === item.alternativeName)
                              return (
                                <Fragment key={result.method}>
                                  <td key={`${result.method}-${item.alternativeName}-score`} className="px-2 py-2 text-center text-black">
                                    {altRanking?.score !== undefined ? Number(altRanking.score).toFixed(4) : "-"}
                                  </td>
                                  <td key={`${result.method}-${item.alternativeName}-rank`} className="px-2 py-2 text-center font-semibold text-black border-r border-gray-200">
                                    {altRanking?.rank ?? "-"}
                                  </td>
                                </Fragment>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              {comparisonResults.length > 0 && comparisonChartData.length > 0 && (
                <Card className="border-gray-200 bg-white shadow-none w-full">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm text-black">Ranking variation</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        {comparisonChartType === "composed"
                          ? "Deviation from average rank - bars extending left are better than average."
                          : "Chart comparing alternative ranks across selected methods."}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={comparisonChartType} onValueChange={setComparisonChartType}>
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="step">Step Line Chart</SelectItem>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="stackedBar">Stacked Bar Chart</SelectItem>
                          <SelectItem value="area">Area Chart</SelectItem>
                          <SelectItem value="stackedArea">Stacked Area Chart</SelectItem>
                          <SelectItem value="scatter">Scatter Plot</SelectItem>
                          <SelectItem value="composed">Diverging Bar Chart</SelectItem>
                          <SelectItem value="radar">Radar Chart</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={downloadComparisonChartAsJpeg} variant="outline" size="sm" className="h-7 text-xs">
                        <Download className="w-3 h-3 mr-1" /> JPG
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent style={{ height: comparisonChartType === "composed" ? 500 : 400 }} ref={comparisonChartRef}>
                    <ResponsiveContainer width="100%" height="100%">
                      {comparisonChartType === "radar" ? (
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonChartData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="method" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Tooltip />
                          {comparisonChartAlternatives.map((alt, idx) => (
                            <Radar
                              key={alt}
                              name={alt}
                              dataKey={alt}
                              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              fillOpacity={0.1}
                            />
                          ))}
                        </RadarChart>
                      ) : comparisonChartType === "bar" ? (
                        <BarChart data={comparisonChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                          <YAxis label={{ value: "Rank", angle: -90, position: "insideLeft" }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          {comparisonChartAlternatives.map((alt, idx) => (
                            <Bar
                              key={alt}
                              dataKey={alt}
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              name={alt}
                            />
                          ))}
                        </BarChart>
                      ) : comparisonChartType === "stackedBar" ? (
                        <BarChart data={comparisonChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                          <YAxis label={{ value: "Rank", angle: -90, position: "insideLeft" }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          {comparisonChartAlternatives.map((alt, idx) => (
                            <Bar
                              key={alt}
                              stackId="a"
                              dataKey={alt}
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              name={alt}
                            />
                          ))}
                        </BarChart>
                      ) : comparisonChartType === "area" ? (
                        <AreaChart data={comparisonChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                          <YAxis />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          {comparisonChartAlternatives.map((alt, idx) => (
                            <Area
                              type="monotone"
                              key={alt}
                              dataKey={alt}
                              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              fillOpacity={0.3}
                              name={alt}
                            />
                          ))}
                        </AreaChart>
                      ) : comparisonChartType === "stackedArea" ? (
                        <AreaChart data={comparisonChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                          <YAxis />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          {comparisonChartAlternatives.map((alt, idx) => (
                            <Area
                              type="monotone"
                              stackId="1"
                              key={alt}
                              dataKey={alt}
                              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              fillOpacity={0.3}
                              name={alt}
                            />
                          ))}
                        </AreaChart>
                      ) : comparisonChartType === "composed" ? (
                        <BarChart
                          data={comparisonChartData.map(d => {
                            // Calculate average rank for each alternative across all methods
                            const avgRank = comparisonChartAlternatives.reduce((sum, alt) => sum + (d[alt] || 0), 0) / comparisonChartAlternatives.length;
                            // Create diverging data (deviation from average)
                            const divergingData: any = { method: d.method };
                            comparisonChartAlternatives.forEach(alt => {
                              const rank = d[alt] || 0;
                              divergingData[alt] = rank - avgRank; // Positive = worse than avg, Negative = better than avg
                            });
                            return divergingData;
                          })}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            label={{ value: "Deviation from Average Rank", position: "insideBottom", offset: -10 }}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis
                            type="category"
                            dataKey="method"
                            tick={{ fontSize: 10 }}
                            width={90}
                          />
                          <Tooltip
                            formatter={(value: any, name: string) => {
                              const deviation = parseFloat(value);
                              return [
                                `${deviation > 0 ? '+' : ''}${deviation.toFixed(2)} (${deviation < 0 ? 'Better' : 'Worse'} than avg)`,
                                name
                              ];
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <ReferenceLine x={0} stroke="#666" strokeWidth={2} />
                          {comparisonChartAlternatives.map((alt, idx) => (
                            <Bar
                              key={alt}
                              dataKey={alt}
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              name={alt}
                              stackId="stack"
                            >
                              {comparisonChartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                  opacity={0.8}
                                />
                              ))}
                            </Bar>
                          ))}
                        </BarChart>
                      ) : comparisonChartType === "scatter" ? (
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="x"
                            type="category"
                            allowDuplicatedCategory={false}
                            tick={{ fontSize: 10 }}
                            name="Method"
                          />
                          <YAxis
                            dataKey="y"
                            type="number"
                            name="Rank"
                            label={{ value: "Rank", angle: -90, position: "insideLeft" }}
                          />
                          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          {comparisonChartAlternatives.map((alt, idx) => (
                            <Scatter
                              key={alt}
                              name={alt}
                              data={comparisonChartData.map((d) => ({ x: d.method, y: d[alt] }))}
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              shape={["circle", "cross", "diamond", "square", "star", "triangle", "wye"][idx % 7] as any}
                              line
                            >
                              {comparisonChartData.map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                              ))}
                            </Scatter>
                          ))}
                        </ScatterChart>
                      ) : (
                        <LineChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          {comparisonChartAlternatives.map((alt, idx) => (
                            <Line
                              key={alt}
                              type={comparisonChartType === "step" ? "step" : "monotone"}
                              dataKey={alt}
                              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                              strokeWidth={2}
                              strokeDasharray={["0", "5 5", "3 3", "10 5", "2 2", "15 5"][idx % 6]}
                              activeDot={{ r: 6 }}
                              dot={{
                                r: 4,
                                strokeWidth: 1,
                                fill: "white",
                                stroke: CHART_COLORS[idx % CHART_COLORS.length],
                              }}
                            />
                          ))}
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {homeTab === "sensitivityAnalysis" && (
            <>
              <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Get Started</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Create a decision matrix by adding alternatives and criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => {
                      setReturnToTab("sensitivityAnalysis")
                      setCurrentStep("input")
                    }}
                    className="w-full bg-black text-white hover:bg-gray-800 text-xs h-8"
                  >
                    + Add Alternative & Criteria
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Sensitivity Analysis Configuration</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Analyze how changing the weight of a specific criterion affects the ranking of alternatives
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alternatives.length > 0 && criteria.length > 0 ? (
                    <>
                      <div className="text-[11px] text-green-700 bg-green-50 border border-green-200 p-2 rounded">
                        <p className="font-semibold">✓ Data has uploaded</p>
                        <p className="mt-1">
                          {alternatives.length} alternatives × {criteria.length} criteria
                        </p>
                      </div>

                      {/* Editable Decision Matrix Table */}
                      <div className="border border-gray-200 rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="text-xs text-black font-semibold w-24">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className="text-xs text-black font-semibold text-center min-w-20">
                                  <div>{crit.name}</div>
                                  <div className="text-[10px] text-gray-500 font-normal">
                                    {crit.type === "beneficial" ? "Max" : "Min"}
                                  </div>
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((alt) => (
                              <TableRow key={alt.id}>
                                <TableCell className="text-xs text-black font-medium">{alt.name}</TableCell>
                                {criteria.map((crit) => (
                                  <TableCell key={crit.id} className="p-1">
                                    <Input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={alt.scores[crit.id] ?? ""}
                                      onChange={(e) => updateAlternativeScore(alt.id, crit.id, e.target.value)}
                                      className="text-center text-xs h-8 border-gray-200 text-black w-full shadow-none"
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-black">Select Criterion to Vary</label>
                          <Select value={sensitivityCriterion} onValueChange={setSensitivityCriterion}>
                            <SelectTrigger className="text-xs h-8 border-gray-200">
                              <SelectValue placeholder="Choose a criterion..." />
                            </SelectTrigger>
                            <SelectContent>
                              {criteria.map((crit) => (
                                <SelectItem key={crit.id} value={crit.id} className="text-xs">
                                  {crit.name} ({crit.type === "beneficial" ? "Max" : "Min"})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-gray-500">
                            The weight will vary from 0% to 100%, while others adjust proportionally
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-black">Choose weight method</label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsWeightSelectorOpen(!isWeightSelectorOpen)}
                              className="w-full flex items-center justify-between text-xs h-8 border border-gray-200 rounded px-3 bg-white"
                            >
                              <span>{sensitivityWeightMethods.length > 0 ? `${sensitivityWeightMethods.length} selected` : "Select weight methods..."}</span>
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>
                            {isWeightSelectorOpen && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto p-2">
                                {WEIGHT_METHODS.map((w) => (
                                  <label key={w.value} className="flex items-center gap-2 text-xs p-1 hover:bg-gray-50 cursor-pointer text-black">
                                    <input
                                      type="checkbox"
                                      checked={sensitivityWeightMethods.includes(w.value)}
                                      onChange={() => {
                                        if (w.value === "piprecia" && !sensitivityWeightMethods.includes("piprecia")) {
                                          setIsPipreciaDialogOpen(true)
                                        }
                                        if (w.value === "ahp" && !sensitivityWeightMethods.includes("ahp")) {
                                          setIsAhpDialogOpen(true)
                                        }
                                        toggleSensitivityWeightMethod(w.value)
                                      }}
                                    />
                                    {w.label}
                                  </label>
                                ))}
                                <div className="border-t my-1"></div>
                                <label className="flex items-center gap-2 text-xs p-1 hover:bg-gray-50 cursor-pointer text-black">
                                  <input
                                    type="checkbox"
                                    checked={sensitivityWeightMethods.includes("custom")}
                                    onChange={(e) => {
                                      toggleSensitivityWeightMethod("custom")
                                      if (e.target.checked) setIsCustomWeightsDialogOpen(true)
                                    }}
                                  />
                                  Enter own weights
                                </label>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500">
                            Select methods to compare outcomes
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-black">Select MCDM Method</label>
                          <Select value={sensitivityMethod} onValueChange={(value) => setSensitivityMethod(value as MCDMMethod)}>
                            <SelectTrigger className="text-xs h-8 border-gray-200">
                              <SelectValue placeholder="Choose a method..." />
                            </SelectTrigger>
                            <SelectContent>
                              {MCDM_METHODS.map((m) => (
                                <SelectItem key={m.value} value={m.value} className="text-xs">
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-gray-500">
                            Method used to calculate rankings
                          </p>
                        </div>

                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={handleWeightSensitivityAnalysis}
                          className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                          disabled={sensitivityLoading}
                        >
                          {sensitivityLoading ? "Calculating..." : "Calculate Sensitivity"}
                        </Button>
                      </div>

                      <Dialog open={isCustomWeightsDialogOpen} onOpenChange={setIsCustomWeightsDialogOpen}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Enter Custom Weights</DialogTitle>
                            <DialogDescription>Sum must equal 1</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                            {criteria.map((crit) => (
                              <div key={crit.id} className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-xs col-span-2">{crit.name}</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="col-span-2 h-8 text-xs"
                                  value={sensitivityCustomWeights[crit.id] || ""}
                                  onChange={(e) => setSensitivityCustomWeights(prev => ({ ...prev, [crit.id]: parseFloat(e.target.value) }))}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2">
                            <div className="text-xs flex items-center mr-auto">
                              Total: {Object.values(sensitivityCustomWeights).reduce((a, b) => a + (b || 0), 0).toFixed(2)}
                            </div>
                            <Button onClick={() => setIsCustomWeightsDialogOpen(false)} size="sm">Save</Button>
                          </div>
                        </DialogContent>
                      </Dialog>



                      {/* --- PIPRECIA Dialog --- */}
                      <Dialog open={isPipreciaDialogOpen} onOpenChange={setIsPipreciaDialogOpen}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
                          <DialogTitle>PIPRECIA Weight Calculator</DialogTitle>
                          <PIPRECIAFormula
                            criteria={criteria}
                            initialScores={pipreciaScores}
                            onScoresChange={setPipreciaScores}
                            onWeightsCalculated={(weights) => {
                              setPipreciaCalculatedWeights(weights)
                              setIsPipreciaDialogOpen(false)
                              // Automatically trigger analysis update with new weights
                              handleWeightSensitivityAnalysis(weights)
                            }}
                          />
                        </DialogContent>
                      </Dialog>

                      {/* --- AHP Dialog (Sensitivity Analysis Tab) --- */}
                      <Dialog open={isAhpDialogOpen} onOpenChange={setIsAhpDialogOpen}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                          <DialogTitle>AHP Weight Calculator</DialogTitle>
                          <AHPFormula
                            criteria={criteria}
                            initialMatrix={ahpMatrix}
                            onMatrixChange={setAhpMatrix}
                            onWeightsCalculated={(weights) => {
                              setAhpCalculatedWeights(weights)
                              setIsAhpDialogOpen(false)
                              // Automatically trigger analysis update with new weights
                              handleWeightSensitivityAnalysis()
                            }}
                          />
                        </DialogContent>
                      </Dialog>

                      {sensitivityWeightComparisonResults.length > 0 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                          <Card className="border-gray-200 bg-white shadow-none w-full">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                              <div>
                                <CardTitle className="text-sm text-black">Comparison Results</CardTitle>
                                <CardDescription className="text-xs text-gray-700">Ranking variations across weight methods</CardDescription>
                              </div>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                              <table className="min-w-full text-xs border border-gray-200 rounded-lg">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left border-b text-black font-semibold">Alternative</th>
                                    {sensitivityWeightComparisonResults.map((res, i) => (
                                      <Fragment key={i}>
                                        <th className="px-3 py-2 text-center border-b text-black font-semibold border-l border-gray-200" colSpan={2}>
                                          {res.weightLabel} ({res.method})
                                        </th>
                                      </Fragment>
                                    ))}
                                  </tr>
                                  <tr>
                                    <th className="border-b"></th>
                                    {sensitivityWeightComparisonResults.map((res, i) => (
                                      <Fragment key={i}>
                                        <th className="px-2 py-1 text-center border-b text-gray-500 font-medium text-[10px] border-l border-gray-200">Score</th>
                                        <th className="px-2 py-1 text-center border-b text-gray-500 font-medium text-[10px]">Rank</th>
                                      </Fragment>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {alternatives.map((alt) => (
                                    <tr key={alt.id} className="hover:bg-gray-50 border-b last:border-0 border-gray-100">
                                      <td className="px-3 py-2 text-black font-medium">{alt.name}</td>
                                      {sensitivityWeightComparisonResults.map((res, i) => {
                                        const item = res.ranking.find((r: any) => r.alternativeName === alt.name)
                                        return (
                                          <Fragment key={i}>
                                            <td className="px-2 py-2 text-center text-black border-l border-gray-200">
                                              {item?.score !== undefined ? Number(item.score).toFixed(4) : "-"}
                                            </td>
                                            <td className="px-2 py-2 text-center text-black font-bold">
                                              {item?.rank}
                                            </td>
                                          </Fragment>
                                        )
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </CardContent>
                          </Card>

                          <Card className="border-gray-200 bg-white shadow-none w-full">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                              <div>
                                <CardTitle className="text-sm text-black">Graphical Variation</CardTitle>
                                <CardDescription className="text-xs text-gray-700">Visualizing the impact of weight methods</CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <Select value={sensitivityChartType} onValueChange={setSensitivityChartType}>
                                  <SelectTrigger className="w-32 h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="line">Line Chart</SelectItem>
                                    <SelectItem value="step">Step Line Chart</SelectItem>
                                    <SelectItem value="bar">Bar Chart</SelectItem>
                                    <SelectItem value="stackedBar">Stacked Bar Chart</SelectItem>
                                    <SelectItem value="area">Area Chart</SelectItem>
                                    <SelectItem value="stackedArea">Stacked Area Chart</SelectItem>
                                    <SelectItem value="scatter">Scatter Plot</SelectItem>
                                    <SelectItem value="composed">Gantt Chart (Range)</SelectItem>
                                    <SelectItem value="radar">Radar Chart</SelectItem>
                                    <SelectItem value="radial">Radial Bar Chart</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button onClick={downloadChart} variant="outline" size="sm" className="h-7 text-xs"><Download className="w-3 h-3 mr-1" /> SVG</Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div style={{ height: 400 }} ref={sensitivityChartRef}>
                                <ResponsiveContainer width="100%" height="100%">
                                  {sensitivityChartType === 'radar' ? (
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sensitivityWeightChartData}>
                                      <PolarGrid />
                                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                                      <PolarRadiusAxis />
                                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                                      <Tooltip />
                                      {sensitivityWeightComparisonResults.map((res, i) => (
                                        <Radar
                                          key={res.weightLabel}
                                          name={`${res.weightLabel} Rank`}
                                          dataKey={`${res.weightLabel} Rank`}
                                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                                          fillOpacity={0.1}
                                        />
                                      ))}
                                    </RadarChart>
                                  ) : sensitivityChartType === "bar" ? (
                                    <BarChart data={sensitivityWeightChartData}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                      <YAxis label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} reversed />
                                      <Tooltip />
                                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                                      {sensitivityWeightComparisonResults.map((res, i) => (
                                        <Bar key={res.weightLabel} dataKey={`${res.weightLabel} Rank`} fill={CHART_COLORS[i % CHART_COLORS.length]} name={`${res.weightLabel} Rank`} />
                                      ))}
                                    </BarChart>
                                  ) : sensitivityChartType === "stackedBar" ? (
                                    <BarChart data={sensitivityWeightChartData}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                      <YAxis label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} reversed />
                                      <Tooltip />
                                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                                      {sensitivityWeightComparisonResults.map((res, i) => (
                                        <Bar key={res.weightLabel} stackId="a" dataKey={`${res.weightLabel} Rank`} fill={CHART_COLORS[i % CHART_COLORS.length]} name={`${res.weightLabel} Rank`} />
                                      ))}
                                    </BarChart>
                                  ) : sensitivityChartType === "area" ? (
                                    <AreaChart data={sensitivityWeightChartData}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                      <YAxis reversed />
                                      <Tooltip />
                                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                                      {sensitivityWeightComparisonResults.map((res, i) => (
                                        <Area type="monotone" key={res.weightLabel} dataKey={`${res.weightLabel} Rank`} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.3} name={`${res.weightLabel} Rank`} />
                                      ))}
                                    </AreaChart>
                                  ) : sensitivityChartType === "stackedArea" ? (
                                    <AreaChart data={sensitivityWeightChartData}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                      <YAxis reversed />
                                      <Tooltip />
                                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                                      {sensitivityWeightComparisonResults.map((res, i) => (
                                        <Area type="monotone" stackId="1" key={res.weightLabel} dataKey={`${res.weightLabel} Rank`} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.3} name={`${res.weightLabel} Rank`} />
                                      ))}
                                    </AreaChart>
                                  ) : sensitivityChartType === "composed" ? (
                                    <BarChart
                                      data={sensitivityWeightComparisonResults.map((res, idx) => {
                                        // Get all ranks for this weight method across alternatives
                                        const ranks = sensitivityWeightChartData.map(d => d[`${res.weightLabel} Rank`] || 0);
                                        const minRank = Math.min(...ranks);
                                        const maxRank = Math.max(...ranks);
                                        const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;

                                        return {
                                          method: res.weightLabel,
                                          start: minRank,
                                          range: maxRank - minRank,
                                          avg: avgRank,
                                          min: minRank,
                                          max: maxRank
                                        };
                                      })}
                                      layout="vertical"
                                      margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis
                                        type="number"
                                        domain={[0, 'dataMax']}
                                        label={{ value: "Rank Range (Best to Worst)", position: "insideBottom", offset: -10 }}
                                        tick={{ fontSize: 10 }}
                                      />
                                      <YAxis
                                        type="category"
                                        dataKey="method"
                                        tick={{ fontSize: 10 }}
                                        width={110}
                                      />
                                      <Tooltip
                                        formatter={(value: any, name: string, props: any) => {
                                          const data = props.payload;
                                          if (name === 'range') {
                                            return [`Best: ${data.min}, Worst: ${data.max}, Avg: ${data.avg.toFixed(2)}`, 'Rank Range'];
                                          }
                                          return [value, name];
                                        }}
                                      />
                                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                                      {/* Base bar showing starting position */}
                                      <Bar
                                        dataKey="start"
                                        stackId="a"
                                        fill="transparent"
                                      />
                                      {/* Range bar showing the spread */}
                                      <Bar
                                        dataKey="range"
                                        stackId="a"
                                        name="Rank Range"
                                      >
                                        {sensitivityWeightComparisonResults.map((res, index) => (
                                          <Cell
                                            key={`cell-${index}`}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            opacity={0.7}
                                          />
                                        ))}
                                      </Bar>
                                      {/* Markers for average */}
                                      <Scatter
                                        dataKey="avg"
                                        fill="#000"
                                        shape="diamond"
                                        name="Average Rank"
                                      />
                                    </BarChart>
                                  ) : sensitivityChartType === "scatter" ? (
                                    <ScatterChart>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 10 }} />
                                      <YAxis type="number" reversed dataKey="rank" name="Rank" label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} />
                                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                                      {sensitivityWeightComparisonResults.map((res, i) => (
                                        <Scatter key={res.weightLabel} name={`${res.weightLabel} Rank`} data={sensitivityWeightChartData.map(d => ({ name: d.name, rank: d[`${res.weightLabel} Rank`] }))} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                      ))}
                                    </ScatterChart>
                                  ) : sensitivityChartType === "radial" ? (
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={sensitivityWeightChartData}>
                                      <RadialBar
                                        label={{ position: 'insideStart', fill: '#fff' }}
                                        background
                                        dataKey="Equal Weights Rank"
                                      />
                                      <Legend iconSize={10} wrapperStyle={{ fontSize: "10px" }} />
                                      {sensitivityWeightComparisonResults.map((res, i) => (
                                        <RadialBar key={res.weightLabel} name={`${res.weightLabel} Rank`} dataKey={`${res.weightLabel} Rank`} fill={CHART_COLORS[i % CHART_COLORS.length]} background />
                                      ))}
                                      <Tooltip />
                                    </RadialBarChart>
                                  ) : (
                                    <LineChart data={sensitivityWeightChartData}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                      <YAxis reversed label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} />
                                      <Tooltip />
                                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                                      {sensitivityWeightComparisonResults.map((res, i) => (
                                        <Line type={sensitivityChartType === "step" ? "step" : "monotone"} key={res.weightLabel} dataKey={`${res.weightLabel} Rank`} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} name={`${res.weightLabel} Rank`} />
                                      ))}
                                    </LineChart>
                                  )}
                                </ResponsiveContainer>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {sensitivityError && (
                        <div className="text-xs text-red-600 border border-red-200 bg-red-50 p-2 rounded">
                          {sensitivityError}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          onClick={handleSensitivityAnalysis}
                          className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                          disabled={sensitivityLoading}
                        >
                          {sensitivityLoading ? "Calculating..." : "Run Sensitivity Analysis"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
                      <p className="font-semibold">⚠️ No data available</p>
                      <p className="mt-1">
                        Please add alternatives and criteria using the "Get Started" section above.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {sensitivityResults.length > 0 && (
                <>
                  <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm text-black">Sensitivity Results</CardTitle>
                          <CardDescription className="text-xs text-gray-700">
                            Rankings as the weight of {criteria.find(c => c.id === sensitivityCriterion)?.name} varies from 0% to 100%
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`text-xs h-7 ${sensitivityChartType === "line" ? "bg-[#FFF2CC] border-[#FFF2CC]" : ""}`}
                            onClick={() => setSensitivityChartType("line")}
                          >
                            Line Chart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`text-xs h-7 ${sensitivityChartType === "bar" ? "bg-[#FFF2CC] border-[#FFF2CC]" : ""}`}
                            onClick={() => setSensitivityChartType("bar")}
                          >
                            Bar Chart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={downloadChart}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div ref={sensitivityChartRef} style={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          {sensitivityChartType === "line" ? (
                            <LineChart data={sensitivityChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="weightLabel"
                                tick={{ fontSize: 10 }}
                                label={{ value: 'Weight (%)', position: 'insideBottom', offset: -5, fontSize: 11 }}
                              />
                              <YAxis
                                reversed
                                allowDecimals={false}
                                tick={{ fontSize: 10 }}
                                label={{ value: 'Rank', angle: -90, position: 'insideLeft', fontSize: 11 }}
                              />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: "10px" }} />
                              {sensitivityAlternatives.map((alt, idx) => (
                                <Line
                                  key={alt}
                                  type="monotone"
                                  dataKey={alt}
                                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                                  activeDot={{ r: 5 }}
                                  strokeWidth={2}
                                />
                              ))}
                            </LineChart>
                          ) : (
                            <BarChart data={sensitivityChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="weightLabel"
                                tick={{ fontSize: 10 }}
                                label={{ value: 'Weight (%)', position: 'insideBottom', offset: -5, fontSize: 11 }}
                              />
                              <YAxis
                                reversed
                                allowDecimals={false}
                                tick={{ fontSize: 10 }}
                                label={{ value: 'Rank', angle: -90, position: 'insideLeft', fontSize: 11 }}
                              />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: "10px" }} />
                              {sensitivityAlternatives.map((alt, idx) => (
                                <Bar
                                  key={alt}
                                  dataKey={alt}
                                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                />
                              ))}
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Detailed Results Table</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Complete ranking data for each weight variation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <table className="min-w-full text-xs border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 border-b border-r border-gray-200 text-black font-semibold text-left">
                              Weight
                            </th>
                            {sensitivityAlternatives.map((alt) => (
                              <th key={alt} className="px-3 py-2 border-b border-r border-gray-200 text-black font-semibold text-center">
                                {alt}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sensitivityResults.map((result, idx) => (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-black border-r border-gray-200">
                                {result.weightLabel}
                              </td>
                              {sensitivityAlternatives.map((alt) => {
                                const ranking = result.ranking.find((r: SensitivityRankingItem) => r.alternativeName === alt)
                                return (
                                  <td key={alt} className="px-3 py-2 text-center text-black border-r border-gray-200">
                                    {ranking?.rank ?? "-"}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </div >

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full sm:w-[70vw] h-screen max-w-none rounded-none border-0 flex flex-col">
            <DialogHeader>
              <DialogTitle>{cardTitle}</DialogTitle>
              <DialogDescription>{cardDescription}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4 flex-1 overflow-y-auto">
              {activeFormulaType === "method" ? (
                <>
                  {method === "swei" && <SWEIFormula />}
                  {method === "swi" && <SWIFormula />}
                  {method === "topsis" && <TOPSISFormula />}
                  {method === "waspas" && <WASPASFormula />}
                  {method === "vikor" && <VIKORFormula />}
                  {method === "edas" && <EDASFormula />}
                  {method === "copras" && <COPRASFormula />}
                  {method === "moora" && <MOORAFormula />}
                  {method === "multimoora" && <MULTIMOORAFormula />}
                  {method === "todim" && <TODIMFormula />}
                  {method === "codas" && <CODASFormula />}
                  {method === "moosra" && <MOOSRAFormula />}
                  {method === "mairca" && <MAIRCAFormula />}
                  {method === "marcos" && <MARCOSFormula />}
                  {method === "promethee" && <PROMETHEEFormula />}
                  {method === "promethee1" && <PROMETHEE1Formula />}
                  {method === "promethee2" && <PROMETHEE2Formula />}
                  {method === "electre" && <ELECTREFormula />}
                  {method === "electre1" && <ELECTRE1Formula />}
                  {method === "electre2" && <ELECTRE2Formula />}
                  {method === "cocoso" && <COCOSOFormula />}
                </>
              ) : (
                <>
                  {weightMethod === "entropy" && <EntropyFormula />}
                  {weightMethod === "critic" && <CRITICFormula />}
                  {weightMethod === "ahp" && <AHPFormula />}
                  {weightMethod === "piprecia" && <PIPRECIAFormula />}
                  {weightMethod === "equal" && (
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-semibold text-black mb-1">Formula:</p>
                        <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                          w_i = 1/n for all criteria
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-black mb-1">Description:</p>
                        <p className="text-gray-700">
                          Equal weighting assigns the same weight to all criteria, calculated as 1 divided by the number of criteria.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main >
    )
  }

  if (currentStep === "input") {
    return (
      <main className="min-h-screen bg-white p-2 md:p-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={() => setCurrentStep("home")}
              variant="outline"
              size="icon"
              className="h-9 w-9 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
              title="Go to Home"
            >
              <Home className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-black">Create Decision Matrix</h1>
              <p className="text-xs text-gray-700">Step 1 of 3</p>
            </div>
          </div>

          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-xs text-black cursor-pointer">Input</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-400" />
              <BreadcrumbItem>
                <span className="text-xs text-gray-400">Table</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-gray-400" />
              <BreadcrumbItem>
                <span className="text-xs text-gray-400">Matrix</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card className="border-gray-200 bg-white shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-black">Specify Dimensions</CardTitle>
              <CardDescription className="text-xs text-gray-700">
                How many alternatives and criteria do you need?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Number of Alternatives</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={numAlternatives === 0 ? "" : numAlternatives}
                  onChange={(e) => {
                    const val = e.target.value
                    setNumAlternatives(val === "" ? 0 : Number.parseInt(val) || 0)
                  }}
                  className="text-sm h-10 border-gray-200 text-black shadow-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Number of Criteria</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={numCriteria === 0 ? "" : numCriteria}
                  onChange={(e) => {
                    const val = e.target.value
                    setNumCriteria(val === "" ? 0 : Number.parseInt(val) || 0)
                  }}
                  className="text-sm h-10 border-gray-200 text-black shadow-none"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end mt-4">
            <Button
              onClick={() => setCurrentStep("home")}
              variant="outline"
              className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
            >
              Back
            </Button>
            <Button onClick={generateTable} className="bg-black text-white hover:bg-gray-800 text-xs h-8">
              Next
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (currentStep === "table") {
    return (
      <SidebarProvider>
        <Sidebar className="border-r border-gray-200 bg-gray-50">
          <SidebarHeader className="py-2 px-3">
            <h2 className="text-xs font-bold text-black">MCDM Methods</h2>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <div className="space-y-3">
              <div>
                <button
                  type="button"
                  onClick={() => setRankingOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-2 py-1 text-[11px] font-semibold text-black hover:bg-gray-100 rounded"
                >
                  <span>Ranking Methods</span>
                  {rankingOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
                {rankingOpen && (
                  <SidebarMenu>
                    {MCDM_METHODS.map((m) => (
                      <SidebarMenuItem key={m.value}>
                        <SidebarMenuButton
                          onClick={() => {
                            setActiveFormulaType("method")
                            setMethod(m.value)
                          }}
                          isActive={method === m.value}
                          className={`text-xs ${method === m.value
                            ? "bg-black text-white"
                            : "text-black hover:bg-gray-100"
                            }`}
                        >
                          <span>{m.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setWeightOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-2 py-1 text-[11px] font-semibold text-black hover:bg-gray-100 rounded"
                >
                  <span>Weight Methods</span>
                  {weightOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
                {weightOpen && (
                  <SidebarMenu>
                    {WEIGHT_METHODS.map((w) => (
                      <SidebarMenuItem key={w.value}>
                        <SidebarMenuButton
                          onClick={async () => {
                            const allScoresFilled = alternatives.every((alt) =>
                              criteria.every((crit) => {
                                const score = alt.scores[crit.id]
                                return score !== undefined && score !== "" && Number(score) >= 0
                              }),
                            )

                            if (!allScoresFilled) {
                              alert("Please fill in all score values with numbers greater than or equal to 0")
                              setWeightMethod(w.value)
                              return
                            }

                            await calculateWeights(w.value)
                            setCurrentStep("matrix")
                          }}
                          isActive={weightMethod === w.value}
                          className={`text-xs ${weightMethod === w.value
                            ? "bg-black text-white"
                            : "text-black hover:bg-gray-100"
                            }`}
                        >
                          <span>{w.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )}
              </div>
            </div>
          </SidebarContent >
        </Sidebar >

        <main className="flex-1 h-screen bg-white flex flex-col">
          <div className="p-2 md:p-3 border-b border-gray-200 flex-shrink-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <SidebarTrigger className="md:hidden border-gray-200 text-black" />
                <Button
                  onClick={() => setCurrentStep("home")}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                  title="Go to Home"
                >
                  <Home className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-black">Fill Decision Matrix</h1>
                  <p className="text-xs text-gray-700">Step 2 of 3</p>
                </div>
              </div>

              <Breadcrumb className="mb-4">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={() => setCurrentStep("input")}
                      className="text-xs text-black cursor-pointer hover:text-gray-700"
                    >
                      Input
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-gray-400" />
                  <BreadcrumbItem>
                    <span className="text-xs text-black">Table</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-gray-400" />
                  <BreadcrumbItem>
                    <span className="text-xs text-gray-400">Matrix</span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 md:p-3">
            <div className="max-w-7xl mx-auto">
              <Card className="border-gray-200 bg-white shadow-none mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Import Data</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Upload Excel file to auto-fill the table. Format: Row 1: Alt, Criteria names | Row 2: Alt, max/min | Row 3: Alt, weights | Row 4+: Alternative names and values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Upload Excel
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Decision Matrix</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Edit names, set criteria types, weights, and fill in scores
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-xs font-semibold text-black py-3 px-4 min-w-32">Alt</TableHead>
                          {criteria.map((crit) => (
                            <TableHead
                              key={crit.id}
                              className="text-xs font-semibold text-black text-center py-3 px-4 min-w-40"
                            >
                              <Input
                                value={crit.name}
                                onChange={(e) => updateCriterion(crit.id, { name: e.target.value })}
                                className="text-xs h-8 border-gray-200 text-black text-center shadow-none font-semibold"
                              />
                            </TableHead>
                          ))}
                        </TableRow>
                        <TableRow className="bg-white border-b border-gray-200">
                          <TableHead className="text-xs font-semibold text-black py-3 px-4">max/min</TableHead>
                          {criteria.map((crit) => (
                            <TableHead key={crit.id} className="text-xs font-semibold text-black text-center py-3 px-4">
                              <Select
                                value={crit.type}
                                onValueChange={(value) =>
                                  updateCriterion(crit.id, { type: value as "beneficial" | "non-beneficial" })
                                }
                              >
                                <SelectTrigger className="text-xs h-8 border-gray-200 bg-white text-black shadow-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beneficial">max</SelectItem>
                                  <SelectItem value="non-beneficial">min</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableHead>
                          ))}
                        </TableRow>
                        {weightMethod !== "entropy" && weightMethod !== "critic" && weightMethod !== "ahp" && (
                          <TableRow className="bg-white border-b border-gray-200">
                            <TableHead className="text-xs font-semibold text-black py-3 px-4">Weight</TableHead>
                            {criteria.map((crit) => (
                              <TableHead key={crit.id} className="text-xs font-semibold text-black text-center py-3 px-4">
                                <Input
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={crit.weight}
                                  onChange={(e) =>
                                    updateCriterion(crit.id, { weight: Number.parseFloat(e.target.value) })
                                  }
                                  className="text-center text-xs h-8 border-gray-200 text-black shadow-none"
                                />
                              </TableHead>
                            ))}
                          </TableRow>
                        )}
                      </TableHeader>
                      <TableBody>
                        {alternatives.map((alt) => (
                          <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-3 px-4">
                              <Input
                                placeholder="Name"
                                value={alt.name}
                                onChange={(e) => updateAlternativeName(alt.id, e.target.value)}
                                className="text-xs font-medium h-8 border-gray-200 text-black shadow-none"
                              />
                            </TableCell>
                            {criteria.map((crit) => (
                              <TableCell key={crit.id} className="text-center py-3 px-4">
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  placeholder="Enter value"
                                  value={alt.scores[crit.id] ?? ""}
                                  onChange={(e) => updateAlternativeScore(alt.id, crit.id, e.target.value)}
                                  className="text-center text-xs h-8 border-gray-200 text-black w-full shadow-none"
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white p-2 md:p-3 flex-shrink-0">
            <div className="max-w-7xl mx-auto">
              {sweiSwiValidationWarning && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-xs">
                  <p className="font-semibold">⚠️ {sweiSwiValidationWarning.message}</p>
                  <p className="mt-1 text-amber-700">
                    Invalid values found in: {sweiSwiValidationWarning.invalidCells.slice(0, 5).join(", ")}
                    {sweiSwiValidationWarning.invalidCells.length > 5 && ` and ${sweiSwiValidationWarning.invalidCells.length - 5} more...`}
                  </p>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => setCurrentStep("input")}
                  variant="outline"
                  className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                >
                  Back
                </Button>
                <Button
                  onClick={async () => {
                    const isSpecialWeight = ["entropy", "critic", "ahp", "piprecia"].includes(weightMethod)
                    // Always pass false to handleSaveTable to prevent auto-navigation to dashboard
                    // We want to proceed to the matrix step or calculation results instead
                    const success = await handleSaveTable(false)

                    if (success) {
                      if (isSpecialWeight) {
                        setCurrentStep("matrix")
                      } else {
                        handleCalculate()
                      }
                    }
                  }}
                  className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                >
                  {weightMethod === "entropy"
                    ? "Calculate Entropy Weights"
                    : weightMethod === "critic"
                      ? "Calculate CRITIC Weights"
                      : weightMethod === "ahp"
                        ? "Calculate AHP Weights"
                        : "Calculate Ranking"}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </SidebarProvider >
    )
  }

  if (currentStep === "matrix") {
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="px-4 py-2 font-bold text-lg">Weight Methods</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {WEIGHT_METHODS.map((w) => (
                <SidebarMenuItem key={w.value}>
                  <SidebarMenuButton
                    isActive={weightMethod === w.value}
                    onClick={() => {
                      if (w.value === "piprecia") {
                        setIsPipreciaDialogOpen(true)
                      } else if (w.value === "ahp") {
                        setIsAhpDialogOpen(true)
                      } else {
                        calculateWeights(w.value)
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <span className="truncate">{w.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* --- PIPRECIA Dialog (Matrix Step) --- */}
        <Dialog open={isPipreciaDialogOpen} onOpenChange={setIsPipreciaDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
            <DialogTitle>PIPRECIA Weight Calculator</DialogTitle>
            <PIPRECIAFormula
              criteria={criteria}
              initialScores={pipreciaScores}
              onScoresChange={setPipreciaScores}
              onWeightsCalculated={(weights) => {
                setPipreciaCalculatedWeights(weights)
                setIsPipreciaDialogOpen(false)

                // Update criteria with new weights
                const updatedCriteria = criteria.map(c => ({
                  ...c,
                  weight: weights[c.id] || 0
                }))
                setCriteria(updatedCriteria)
                setWeightMethod("piprecia")
              }}
            />
          </DialogContent>
        </Dialog>

        {/* --- AHP Dialog (Matrix Step) --- */}
        <Dialog open={isAhpDialogOpen} onOpenChange={setIsAhpDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            <DialogTitle>AHP Weight Calculator</DialogTitle>
            <AHPFormula
              criteria={criteria}
              initialMatrix={ahpMatrix}
              onMatrixChange={setAhpMatrix}
              onWeightsCalculated={(weights) => {
                setAhpCalculatedWeights(weights)
                setIsAhpDialogOpen(false)

                // Update criteria with new weights
                const updatedCriteria = criteria.map(c => ({
                  ...c,
                  weight: weights[c.id] || 0
                }))
                setCriteria(updatedCriteria)
                setWeightMethod("ahp")
              }}
            />
          </DialogContent>
        </Dialog>

        <main className="flex-1 min-h-screen bg-white p-2 md:p-3 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <SidebarTrigger />
          </div>

          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-4">
              <Button
                onClick={() => setCurrentStep("home")}
                variant="outline"
                size="icon"
                className="h-9 w-9 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                title="Go to Home"
              >
                <Home className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-black">Decision Matrix</h1>
                <p className="text-xs text-gray-700">Step 3 of 3</p>
              </div>
            </div>

            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setCurrentStep("input")}
                    className="text-xs text-black cursor-pointer hover:text-gray-700"
                  >
                    Input
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-400" />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => setCurrentStep("table")}
                    className="text-xs text-black cursor-pointer hover:text-gray-700"
                  >
                    Table
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-400" />
                <BreadcrumbItem>
                  <span className="text-xs text-black">Matrix</span>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-end gap-2 mb-4">
              <Button
                onClick={() => setCurrentStep("table")}
                variant="outline"
                className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
              >
                Edit
              </Button>

            </div>

            <Card className="border-gray-200 bg-white shadow-none mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-black">Evaluation Matrix</CardTitle>
                <CardDescription className="text-xs text-gray-700">
                  Review your decision matrix before calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="text-xs font-semibold text-black py-3 px-4 min-w-32">Alternative</TableHead>
                        {criteria.map((crit) => (
                          <TableHead
                            key={crit.id}
                            className="text-xs font-semibold text-black text-center py-3 px-4 min-w-40"
                          >
                            <div className="flex flex-col items-center">
                              <span>{crit.name}</span>
                              <span className="text-[10px] text-gray-500 mt-1">↓ ({crit.weight.toFixed(4)})</span>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alternatives.map((alt) => (
                        <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <TableCell className="py-3 px-4 font-medium text-black text-xs">
                            {alt.name}
                          </TableCell>
                          {criteria.map((crit) => (
                            <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black">
                              {alt.scores[crit.id] !== undefined && alt.scores[crit.id] !== ""
                                ? Number(alt.scores[crit.id]).toString()
                                : "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {entropyResult && weightMethod === "entropy" && (
              <Card className="border-gray-200 bg-white shadow-none mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Entropy Weight Calculation Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                          {criteria.map((crit) => (
                            <TableHead key={crit.id} className="text-xs font-semibold text-black text-center py-3 px-4">
                              {crit.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alternatives.map((alt) => (
                          <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-3 px-4 font-medium text-black text-xs">{alt.name}</TableCell>
                            {criteria.map((crit) => (
                              <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black">
                                {entropyResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(4)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        <TableRow className="bg-gray-50/50 border-b border-gray-200">
                          <TableCell className="py-3 px-4 font-bold text-black text-xs">Ej</TableCell>
                          {criteria.map((crit) => (
                            <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                              {entropyResult.entropyValues[crit.id]?.toFixed(4)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow className="bg-gray-50/50 border-b border-gray-200">
                          <TableCell className="py-3 px-4 font-bold text-black text-xs">dj = 1 - Ej</TableCell>
                          {criteria.map((crit) => (
                            <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                              {entropyResult.diversityValues[crit.id]?.toFixed(4)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow className="bg-yellow-50 border-b border-gray-200">
                          <TableCell className="py-3 px-4 font-bold text-black text-xs">Wj</TableCell>
                          {criteria.map((crit) => (
                            <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                              {entropyResult.weights[crit.id]?.toFixed(4)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {criticResult && weightMethod === "critic" && (
              <Card className="border-gray-200 bg-white shadow-none mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">CRITIC Weight Calculation Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                          {criteria.map((crit) => (
                            <TableHead key={crit.id} className="text-xs font-semibold text-black text-center py-3 px-4">
                              {crit.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alternatives.map((alt) => (
                          <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-3 px-4 font-medium text-black text-xs">{alt.name}</TableCell>
                            {criteria.map((crit) => (
                              <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black">
                                {criticResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(4)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        <TableRow className="bg-gray-50/50 border-b border-gray-200">
                          <TableCell className="py-3 px-4 font-bold text-black text-xs">Std. Dev (σ)</TableCell>
                          {criteria.map((crit) => (
                            <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                              {criticResult.standardDeviations[crit.id]?.toFixed(4)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow className="bg-gray-50/50 border-b border-gray-200">
                          <TableCell className="py-3 px-4 font-bold text-black text-xs">Info Amount (Cj)</TableCell>
                          {criteria.map((crit) => (
                            <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                              {criticResult.informationAmounts[crit.id]?.toFixed(4)}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow className="bg-yellow-50 border-b border-gray-200">
                          <TableCell className="py-3 px-4 font-bold text-black text-xs">Wj</TableCell>
                          {criteria.map((crit) => (
                            <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                              {criticResult.weights[crit.id]?.toFixed(4)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {ahpResult && weightMethod === "ahp" && (
              <Card className="border-gray-200 bg-white shadow-none mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">AHP Weight Calculation Results</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    λmax = {ahpResult.lambdaMax.toFixed(4)} | CI = {ahpResult.consistencyIndex.toFixed(4)} | CR = {ahpResult.consistencyRatio.toFixed(4)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-xs font-semibold text-black py-3 px-4">Criteria</TableHead>
                          {criteria.map((crit) => (
                            <TableHead key={crit.id} className="text-xs font-semibold text-black text-center py-3 px-4">
                              {crit.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {criteria.map((rowCrit, i) => (
                          <TableRow key={rowCrit.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-3 px-4 font-medium text-black text-xs">{rowCrit.name}</TableCell>
                            {criteria.map((colCrit, j) => (
                              <TableCell key={colCrit.id} className="text-center py-3 px-4 text-xs text-black">
                                {ahpResult.pairwiseMatrix[i]?.[j]?.toFixed(2)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        <TableRow className="bg-yellow-50 border-b border-gray-200">
                          <TableCell className="py-3 px-4 font-bold text-black text-xs">Weights (Wj)</TableCell>
                          {criteria.map((crit) => (
                            <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                              {ahpResult.weights[crit.id]?.toFixed(4)}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {pipreciaResult && weightMethod === "piprecia" && (
              <Card className="border-gray-200 bg-white shadow-none mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">PIPRECIA Weight Calculation Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-xs font-semibold text-black py-3 px-4 text-left">Criterion</TableHead>
                          <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">s<sub>j</sub></TableHead>
                          <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">k<sub>j</sub></TableHead>
                          <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">q<sub>j</sub></TableHead>
                          <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Weight (w<sub>j</sub>)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {criteria.map((crit) => (
                          <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                            <TableCell className="text-center py-3 px-4 text-xs text-black">
                              {pipreciaResult.s_values[crit.id]?.toFixed(4)}
                            </TableCell>
                            <TableCell className="text-center py-3 px-4 text-xs text-black">
                              {pipreciaResult.k_values[crit.id]?.toFixed(4)}
                            </TableCell>
                            <TableCell className="text-center py-3 px-4 text-xs text-black">
                              {pipreciaResult.q_values[crit.id]?.toFixed(4)}
                            </TableCell>
                            <TableCell className="text-center py-3 px-4 text-xs text-black font-bold">
                              {pipreciaResult.weights[crit.id]?.toFixed(4)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </SidebarProvider>
    )
  }

  // Results view after calculation
  if (currentStep === "calculate") {
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="px-4 py-2 font-bold text-lg">MCDM Methods</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {MCDM_METHODS.map((m) => (
                <SidebarMenuItem key={m.value}>
                  <SidebarMenuButton
                    isActive={method === m.value}
                    onClick={() => {
                      setMethod(m.value)
                      handleCalculate(m.value)
                    }}
                    className="cursor-pointer"
                  >
                    <span className="truncate">{m.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 min-h-screen bg-white p-2 md:p-3 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <SidebarTrigger />
          </div>

          {!apiResults ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-gray-700">Loading results...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-3 mb-4">
                <Button
                  onClick={() => setCurrentStep("home")}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                  title="Go to Home"
                >
                  <Home className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-black">Results</h1>
                  <p className="text-xs text-gray-700">Calculation Results</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mb-4">
                <Button
                  onClick={() => {
                    setCurrentStep("matrix")
                    setMethod(method)
                  }}
                  variant="outline"
                  className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep("matrix")}
                  className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                >
                  New Calculation
                </Button>
              </div>

              <Card className="border-gray-200 bg-white shadow-none mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">{methodInfo?.label} Results</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Ranked alternatives based on {methodInfo?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Rank</th>
                          <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                          <th className="px-3 py-2 text-right border-b border-gray-200 text-black font-semibold">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiResults.ranking && apiResults.ranking.length > 0 ? (
                          apiResults.ranking.map((item: any, index: number) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-3 py-2 text-left text-black font-bold">{item.rank}</td>
                              <td className="px-3 py-2 text-left text-black">{item.alternativeName}</td>
                              <td className="px-3 py-2 text-right text-black">
                                {typeof item.score === "number" ? item.score.toFixed(4) : item.score}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-3 py-4 text-center text-gray-500 text-xs">
                              No ranking results available. Please check your inputs.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </SidebarProvider>
    )
  }
}
