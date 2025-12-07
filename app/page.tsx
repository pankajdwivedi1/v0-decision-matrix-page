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
} from "@/components/ui/dialog"
import * as XLSX from "xlsx"
import { Upload, ChevronDown, ChevronRight, Home, Download } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
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
type WeightMethod = "equal" | "entropy" | "critic" | "ahp"
type PageStep = "home" | "input" | "table" | "matrix" | "calculate"
type ComparisonResult = {
  method: MCDMMethod
  label: string
  ranking: { alternativeName: string; rank: number; score: number | string }[]
}

interface EntropyResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  entropyValues: Record<string, number>
  diversityValues: Record<string, number>
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
  const [weightOpen, setWeightOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sensitivity Analysis state
  const [sensitivityCriterion, setSensitivityCriterion] = useState<string>("")
  const [sensitivityMethod, setSensitivityMethod] = useState<MCDMMethod>("topsis")
  const [sensitivityResults, setSensitivityResults] = useState<any[]>([])
  const [sensitivityLoading, setSensitivityLoading] = useState(false)
  const [sensitivityError, setSensitivityError] = useState<string | null>(null)
  const [sensitivityChartType, setSensitivityChartType] = useState<"line" | "bar">("line")
  const sensitivityChartRef = useRef<HTMLDivElement>(null)


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

      const results = await Promise.all(
        selectedRankingMethods.map(async (m) => {
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
            const errorMsg = data.error || `Failed to calculate ${m} ranking`
            throw new Error(errorMsg)
          }
          const info = MCDM_METHODS.find((item) => item.value === m)
          return {
            method: m,
            label: info?.label || m,
            ranking: data.ranking || [],
          } as ComparisonResult
        }),
      )

      setComparisonResults(results)
    } catch (error: any) {
      console.error(error)
      setComparisonError(error?.message || "Error while calculating comparison.")
    } finally {
      setComparisonLoading(false)
    }
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

  const handleSaveTable = async () => {
    const allScoresFilled = alternatives.every((alt) =>
      criteria.every((crit) => {
        const score = alt.scores[crit.id]
        return score !== undefined && score !== "" && Number(score) >= 0
      }),
    )

    if (!allScoresFilled) {
      alert("Please fill in all score values with numbers greater than or equal to 0")
      return
    }

    // Reset previous weight calculation results
    setEntropyResult(null)
    setCriticResult(null)
    setAhpResult(null)

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

    // Check if we need to return to a specific tab after completing input
    if (returnToTab === "rankingComparison") {
      setHomeTab("rankingComparison")
      setReturnToTab(null)
      setCurrentStep("home")
    } else if (returnToTab === "sensitivityAnalysis") {
      setHomeTab("sensitivityAnalysis")
      setReturnToTab(null)
      setCurrentStep("home")
    } else {
      setCurrentStep("matrix")
    }
  }

  const handleCalculate = async () => {
    setIsLoading(true)
    setApiResults(null)

    try {
      const payload = {
        method,
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
          : weightMethodInfo?.label
    : methodInfo?.formula

  const cardLongDescription = showingWeightFormula
    ? weightMethod === "entropy"
      ? "Entropy-based objective weighting method that calculates weights based on information content in the decision matrix. Higher entropy means more uncertainty (less information), resulting in lower weight. Lower entropy means more information content, resulting in higher weight."
      : weightMethod === "critic"
        ? "CRITIC method determines weights based on both contrast intensity (standard deviation) and conflict (correlation) between criteria. Higher information content (higher contrast and lower correlation) results in higher weights."
        : weightMethod === "ahp"
          ? "AHP derives weights from pairwise comparisons (here built from provided priority scores). It computes the eigenvector of the pairwise matrix and checks consistency (CI/CR)."
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

  // Download chart function
  const downloadChart = () => {
    if (!sensitivityChartRef.current) return

    // Use html2canvas or a similar library to export to image
    // For now, we'll use a simple SVG export approach
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
    return sensitivityResults[0].ranking.map((item: any) => item.alternativeName)
  }, [sensitivityResults])




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
                  onClick={() => setCurrentStep("input")}
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
                  <CardTitle className="text-sm text-black">Weight Methods</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Select a weight method to use in your calculations
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
                        <p className="font-semibold">✓ Decision Matrix Loaded</p>
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
                                onChange={() => setComparisonWeightMethod(w.value)}
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

              {comparisonResults.length > 0 && (
                <Card className="border-gray-200 bg-white shadow-none w-full mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-black">Ranking table</CardTitle>
                    <CardDescription className="text-xs text-gray-700">
                      Score and rankings by method. Lower rank is better.
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-black">Ranking variation</CardTitle>
                    <CardDescription className="text-xs text-gray-700">
                      Line chart comparing alternative ranks across selected methods.
                    </CardDescription>
                  </CardHeader>
                  <CardContent style={{ height: 360 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                        <YAxis reversed allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: "10px" }} />
                        {comparisonChartAlternatives.map((alt, idx) => (
                          <Line
                            key={alt}
                            type="monotone"
                            dataKey={alt}
                            stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                            activeDot={{ r: 4 }}
                            strokeWidth={2}
                          />
                        ))}
                      </LineChart>
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
                        <p className="font-semibold">✓ Decision Matrix Loaded</p>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            Method used to calculate rankings at each weight variation
                          </p>
                        </div>
                      </div>

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
                                const ranking = result.ranking.find((r: any) => r.alternativeName === alt)
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
        </div>

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



      </main>

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
                          onClick={() => {
                            setActiveFormulaType("weight")
                            setWeightMethod(w.value)
                          }}
                          isActive={weightMethod === w.value}
                          className={`text-xs ${weightMethod === w.value
                            ? "bg-gray-900 text-white"
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
                <Button onClick={handleSaveTable} className="bg-black text-white hover:bg-gray-800 text-xs h-8">
                  {weightMethod === "entropy"
                    ? "Calculate Entropy Weights"
                    : weightMethod === "critic"
                      ? "Calculate CRITIC Weights"
                      : weightMethod === "ahp"
                        ? "Calculate AHP Weights"
                        : "Next"}
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
                          onClick={() => {
                            setActiveFormulaType("weight")
                            setWeightMethod(w.value)
                          }}
                          isActive={weightMethod === w.value}
                          className={`text-xs ${weightMethod === w.value
                            ? "bg-gray-900 text-white"
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

        <main className="flex-1 min-h-screen bg-white p-2 md:p-3">
          <div className="max-w-full lg:max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
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
                  <h1 className="text-lg md:text-2xl font-bold text-black">Decision Matrix</h1>
                  <p className="text-xs text-gray-700">Step 3 of 3</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setCurrentStep("table")}
                  className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                >
                  Edit
                </Button>
                <Button
                  onClick={handleCalculate}
                  disabled={isLoading}
                  className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                >
                  {isLoading ? "Calculating..." : "Calculate"}
                </Button>
              </div>
            </div>

            {sweiSwiValidationWarning && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-xs">
                <p className="font-semibold">⚠️ {sweiSwiValidationWarning.message}</p>
                <p className="mt-1 text-amber-700">
                  Invalid values found in: {sweiSwiValidationWarning.invalidCells.slice(0, 5).join(", ")}
                  {sweiSwiValidationWarning.invalidCells.length > 5 && ` and ${sweiSwiValidationWarning.invalidCells.length - 5} more...`}
                </p>
              </div>
            )}

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

            {/* Evaluation Matrix (Normalized) - First Table */}
            <Card className="border-gray-200 bg-white shadow-none mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-black">
                  {(weightMethod === "entropy" && entropyResult) || (weightMethod === "critic" && criticResult)
                    ? "Evaluation Matrix (Normalized)"
                    : "Evaluation Matrix"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 pb-2">
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="text-left py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                          Alternative
                        </TableHead>
                        {criteria.map((crit) => (
                          <TableHead key={crit.id} className="text-center py-2 px-3 font-semibold text-black text-xs">
                            <div className="text-xs whitespace-nowrap">{crit.name}</div>
                            <div className="text-xs text-gray-700">
                              {crit.type === "beneficial" ? "↑" : "↓"} ({crit.weight.toFixed(3)})
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alternatives.map((alt) => (
                        <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <TableCell className="py-2 px-3 font-medium text-black text-xs">{alt.name}</TableCell>
                          {criteria.map((crit) => (
                            <TableCell key={crit.id} className="text-center py-2 px-3 text-black text-xs">
                              {weightMethod === "entropy" && entropyResult
                                ? entropyResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(4) ?? "-"
                                : weightMethod === "critic" && criticResult
                                  ? criticResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(4) ?? "-"
                                  : alt.scores[crit.id] || "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Entropy Weight Calculation Results - Second Table */}
            {weightMethod === "entropy" && entropyResult && (
              <Card className="border-gray-200 bg-white shadow-none mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-black">Entropy Weight Calculation Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 pb-2">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-left py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                            Alternative
                          </TableHead>
                          {criteria.map((crit) => (
                            <TableHead
                              key={crit.id}
                              className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap"
                            >
                              {crit.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Individual entropy contributions (pᵢⱼ × log₂(pᵢⱼ)) for each alternative */}
                        {alternatives.map((alt) => (
                          <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-2 px-3 font-medium text-black text-xs whitespace-nowrap">
                              {alt.name}
                            </TableCell>
                            {criteria.map((crit) => {
                              const p_ij = entropyResult.normalizedMatrix[alt.id]?.[crit.id]
                              const epsilon = 1e-12
                              // Calculate pᵢⱼ × log₂(pᵢⱼ)
                              const entropyContribution =
                                p_ij && p_ij > epsilon ? p_ij * Math.log2(p_ij) : 0
                              return (
                                <TableCell
                                  key={crit.id}
                                  className="text-center py-2 px-3 text-black text-xs whitespace-nowrap"
                                >
                                  {entropyContribution.toFixed(4)}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}

                        {/* Entropy (Ej) row - highlighted */}
                        <TableRow className="bg-yellow-50 border-b-2 border-yellow-300">
                          <TableCell className="py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                            Eⱼ
                          </TableCell>
                          {criteria.map((crit) => (
                            <TableCell
                              key={crit.id}
                              className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap"
                            >
                              {entropyResult.entropyValues[crit.id]?.toFixed(3) ?? "-"}
                            </TableCell>
                          ))}
                        </TableRow>

                        {/* Diversity Degree (dj=1-Ej) row - highlighted */}
                        <TableRow className="bg-yellow-50 border-b-2 border-yellow-300">
                          <TableCell className="py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                            dⱼ = 1 - Eⱼ
                          </TableCell>
                          {criteria.map((crit) => (
                            <TableCell
                              key={crit.id}
                              className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap"
                            >
                              {entropyResult.diversityValues[crit.id]?.toFixed(3) ?? "-"}
                            </TableCell>
                          ))}
                        </TableRow>

                        {/* Weight Calculation (Wj) row - highlighted */}
                        <TableRow className="bg-yellow-50 border-b-2 border-yellow-300">
                          <TableCell className="py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                            Wⱼ
                          </TableCell>
                          {criteria.map((crit) => (
                            <TableCell
                              key={crit.id}
                              className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap"
                            >
                              {entropyResult.weights[crit.id]?.toFixed(3) ?? "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CRITIC Weight Calculation Results - Second Table */}
            {weightMethod === "critic" && criticResult && (
              <Card className="border-gray-200 bg-white shadow-none mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-black">CRITIC Weight Calculation Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 pb-2">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-left py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                            Criteria
                          </TableHead>
                          <TableHead className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                            Standard Deviation (σⱼ)
                          </TableHead>
                          <TableHead className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                            Information Amount (Cⱼ)
                          </TableHead>
                          <TableHead className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                            Weight (Wⱼ)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {criteria.map((crit) => (
                          <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-2 px-3 font-medium text-black text-xs whitespace-nowrap">
                              {crit.name}
                            </TableCell>
                            <TableCell className="text-center py-2 px-3 text-black text-xs whitespace-nowrap">
                              {criticResult.standardDeviations[crit.id]?.toFixed(4) ?? "-"}
                            </TableCell>
                            <TableCell className="text-center py-2 px-3 text-black text-xs whitespace-nowrap">
                              {criticResult.informationAmounts[crit.id]?.toFixed(4) ?? "-"}
                            </TableCell>
                            <TableCell className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                              {criticResult.weights[crit.id]?.toFixed(4) ?? "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CRITIC Correlation Matrix - Third Table */}
            {weightMethod === "critic" && criticResult && (
              <Card className="border-gray-200 bg-white shadow-none mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-black">Correlation Matrix</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 pb-2">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-left py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                            Criteria
                          </TableHead>
                          {criteria.map((crit) => (
                            <TableHead
                              key={crit.id}
                              className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap"
                            >
                              {crit.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {criteria.map((crit) => (
                          <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="py-2 px-3 font-medium text-black text-xs whitespace-nowrap">
                              {crit.name}
                            </TableCell>
                            {criteria.map((crit2) => (
                              <TableCell
                                key={crit2.id}
                                className="text-center py-2 px-3 text-black text-xs whitespace-nowrap"
                              >
                                {criticResult.correlationMatrix[crit.id]?.[crit2.id]?.toFixed(4) ?? "-"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {weightMethod === "ahp" && ahpResult && (
              <>
                <Card className="border-gray-200 bg-white shadow-none mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-black">AHP Pairwise Comparison Matrix</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 pb-2">
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-gray-200">
                            <TableHead className="text-left py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                              Criteria
                            </TableHead>
                            {criteria.map((crit) => (
                              <TableHead
                                key={crit.id}
                                className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap"
                              >
                                {crit.name}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {criteria.map((crit, rowIdx) => (
                            <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-2 px-3 font-medium text-black text-xs whitespace-nowrap">
                                {crit.name}
                              </TableCell>
                              {criteria.map((_, colIdx) => (
                                <TableCell
                                  key={`${crit.id}-${colIdx}`}
                                  className="text-center py-2 px-3 text-black text-xs whitespace-nowrap"
                                >
                                  {ahpResult.pairwiseMatrix[rowIdx]?.[colIdx]?.toFixed(4) ?? "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-none mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-black">AHP Normalized Matrix</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 pb-2">
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-gray-200">
                            <TableHead className="text-left py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                              Criteria
                            </TableHead>
                            {criteria.map((crit) => (
                              <TableHead
                                key={crit.id}
                                className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap"
                              >
                                {crit.name}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {criteria.map((crit, rowIdx) => (
                            <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-2 px-3 font-medium text-black text-xs whitespace-nowrap">
                                {crit.name}
                              </TableCell>
                              {criteria.map((_, colIdx) => (
                                <TableCell
                                  key={`${crit.id}-norm-${colIdx}`}
                                  className="text-center py-2 px-3 text-black text-xs whitespace-nowrap"
                                >
                                  {ahpResult.normalizedMatrix[rowIdx]?.[colIdx]?.toFixed(4) ?? "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-none mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-black">AHP Weights & Consistency</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 space-y-3">
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-gray-200">
                            <TableHead className="text-left py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                              Criteria
                            </TableHead>
                            <TableHead className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                              Weight (Wⱼ)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {criteria.map((crit) => (
                            <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-2 px-3 font-medium text-black text-xs whitespace-nowrap">
                                {crit.name}
                              </TableCell>
                              <TableCell className="text-center py-2 px-3 font-semibold text-black text-xs whitespace-nowrap">
                                {ahpResult.weights[crit.id]?.toFixed(4) ?? "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-black">
                      <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                        <div className="font-semibold">λ_max</div>
                        <div>{ahpResult.lambdaMax.toFixed(4)}</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                        <div className="font-semibold">Consistency Index (CI)</div>
                        <div>{ahpResult.consistencyIndex.toFixed(4)}</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                        <div className="font-semibold">Consistency Ratio (CR)</div>
                        <div>{ahpResult.consistencyRatio.toFixed(4)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </SidebarProvider >
    )
  }

  if (currentStep === "calculate") {
    return (
      <SidebarProvider>
        <Sidebar className="border-r border-gray-200 bg-gray-50">
          <SidebarHeader className="py-2">
            <h2 className="text-xs font-bold text-black">MCDM Methods</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {MCDM_METHODS.map((m) => (
                <SidebarMenuItem key={m.value}>
                  <SidebarMenuButton
                    onClick={async () => {
                      if (m.value !== method) {
                        setActiveFormulaType("method")
                        setMethod(m.value)
                        setApiResults(null)
                        setIsLoading(true)
                        try {
                          const response = await fetch("/api/calculate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              method: m.value,
                              alternatives,
                              criteria,
                            }),
                          })
                          if (response.ok) {
                            const data = await response.json()
                            setApiResults(data)
                          }
                        } catch (error) {
                          console.error("Recalculation error:", error)
                        } finally {
                          setIsLoading(false)
                        }
                      }
                    }}
                    isActive={method === m.value}
                    className={`text-xs ${method === m.value ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                  >
                    <span>{m.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent >
        </Sidebar >

        <main className="flex-1 min-h-screen bg-white p-2 md:p-3">
          <div className="max-w-4xl mx-auto">
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
                <h1 className="text-xl md:text-2xl font-bold text-black">Results</h1>
                <p className="text-xs text-gray-700">Calculation Results</p>
              </div>
            </div>

            {apiResults && (
              <Card className="border-gray-200 bg-white shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">{methodInfo?.label} Results</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Ranked alternatives based on {methodInfo?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-xs font-semibold text-black py-3 px-4">Rank</TableHead>
                          <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                          <TableHead className="text-xs font-semibold text-black py-3 px-4 text-right">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiResults.ranking?.map((item: any, index: number) => (
                          <TableRow key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <TableCell className="text-xs py-3 px-4 text-black font-medium">{item.rank}</TableCell>
                            <TableCell className="text-xs py-3 px-4 text-black">{item.alternativeName}</TableCell>
                            <TableCell className="text-xs py-3 px-4 text-black text-right">
                              {typeof item.score === "number" ? item.score.toFixed(4) : item.score}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2 justify-end mt-4">
              <Button
                onClick={() => setCurrentStep("matrix")}
                variant="outline"
                className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep("home")
                  setApiResults(null)
                  setAlternatives([])
                  setCriteria([])
                  setEntropyResult(null)
                  setCriticResult(null)
                  setAhpResult(null)
                }}
                className="bg-black text-white hover:bg-gray-800 text-xs h-8"
              >
                New Calculation
              </Button>
            </div>
          </div>
        </main>
      </SidebarProvider >
    )
  }

  return null
}
