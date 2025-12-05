"use client"

import { useState, useRef, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
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
import * as XLSX from "xlsx"
import { Upload, ChevronDown, ChevronRight } from "lucide-react"
<<<<<<< HEAD
=======
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
>>>>>>> df2da8c600b3cf8575811737a8a3ac102d253276
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

<<<<<<< HEAD
type MCDMMethod = "swei" | "swi" | "topsis" | "vikor" | "waspas" | "edas" | "moora" | "cocoso" | "test" 
=======
type MCDMMethod = "swei" | "swi" | "topsis" | "vikor" | "waspas" | "edas" | "moora" | "multimoora" | "todim" | "codas" | "moosra" | "mairca" | "marcos" | "cocoso" | "copras" | "promethee" | "promethee1" | "promethee2" | "electre" | "electre1" | "electre2"
type WeightMethod = "equal" | "entropy" | "critic" | "ahp"
>>>>>>> df2da8c600b3cf8575811737a8a3ac102d253276
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
<<<<<<< HEAD
    value: "test",
    label: "test",
    description: "test zoltion",
=======
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
>>>>>>> df2da8c600b3cf8575811737a8a3ac102d253276
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
  const [homeTab, setHomeTab] = useState<"calculator" | "rankingComparison">("calculator")
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
    if (data.length < 4) {
      setComparisonError("Excel file must have at least 4 rows (headers, max/min, weights, data)")
      return
    }

    const headers = data[0].slice(1).filter(h => h !== undefined && h !== null && h !== "")
    const types = data[1].slice(1)
    const weights = data[2].slice(1)
    const dataRows = data.slice(3).filter(row => row[0])

    if (headers.length === 0 || dataRows.length === 0) {
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

    setComparisonCriteria(newCriteria)
    setComparisonAlternatives(newAlternatives)
    setComparisonError(null)
  }

  const handleComparisonFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        parseComparisonExcelData(jsonData as any[][])
        setComparisonFileName(file.name)
      } catch (error) {
        console.error(error)
        setComparisonError("Error reading Excel file. Please ensure it's a valid Excel file.")
      }
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
    if (comparisonAlternatives.length === 0 || comparisonCriteria.length === 0) {
      setComparisonError("Please upload a valid Excel file first.")
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
        comparisonAlternatives,
        comparisonCriteria,
      )

      const payloadAlternatives = comparisonAlternatives

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
          if (!response.ok) throw new Error(`Failed to calculate ${m} ranking`)
          const data = await response.json()
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        parseExcelData(jsonData as any[][])
      } catch (error) {
        alert("Error reading Excel file. Please ensure it's a valid Excel file.")
        console.error(error)
      }
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

    setCurrentStep("matrix")
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

      if (!response.ok) {
        throw new Error("Failed to calculate")
      }

      const data = await response.json()
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

  // Collapsible sidebar sections: Methods (functional) and Weights (dummy)
  const SidebarSections = ({
    onMethodClick,
  }: {
    onMethodClick?: (value: MCDMMethod) => void | Promise<void>
  }) => {
    const [methodsOpen, setMethodsOpen] = useState(true)
    const [weightsOpen, setWeightsOpen] = useState(false)

    const handleMethodClick = (value: MCDMMethod) => {
      if (onMethodClick) {
        // allow parent to handle async or special behavior
        void onMethodClick(value)
      } else {
        setMethod(value)
      }
    }

    return (
      <SidebarMenu>
        <SidebarGroup>
          <div onClick={() => setMethodsOpen((v) => !v)} className="cursor-pointer">
            <SidebarGroupLabel className="text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span>Ranking Methods</span>
               
                {methodsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </SidebarGroupLabel>
          </div>

          {methodsOpen && (
            <SidebarGroupContent>
              {MCDM_METHODS.map((m) => (
                <SidebarMenuItem key={m.value}>
                  <SidebarMenuButton
                    onClick={() => handleMethodClick(m.value)}
                    isActive={method === m.value}
                    className={`text-xs ${method === m.value ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                  >
                    <span>{m.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <div onClick={() => setWeightsOpen((v) => !v)} className="cursor-pointer">
            <SidebarGroupLabel className="text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span>Weight Methods</span>
               
                {weightsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </SidebarGroupLabel>
          </div>

          {weightsOpen && (
            <SidebarGroupContent>
              {/* Dummy weight items for now */}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => {}} className="text-xs">
                    <span>Default Weights</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => {}} className="text-xs">
                    <span>Equal Weights</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarMenu>
    )
  }

  if (currentStep === "home") {
    return (
      <SidebarProvider>
        <Sidebar className="border-r border-gray-200 bg-gray-50">
          <SidebarHeader className="py-2 px-3">
            <h2 className="text-xs font-bold text-black">MCDM Methods</h2>
          </SidebarHeader>
          <SidebarContent className="px-2">
<<<<<<< HEAD
            <SidebarSections onMethodClick={(v) => setMethod(v)} />
=======
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
                          className={`text-xs ${
                            method === m.value
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
                          className={`text-xs ${
                            weightMethod === w.value
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
>>>>>>> df2da8c600b3cf8575811737a8a3ac102d253276
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 min-h-screen bg-white p-2 md:p-3">
          <div className="max-w-2xl mx-auto py-6">
            <div className="flex items-center gap-3 mb-6">
              <SidebarTrigger className="md:hidden border-gray-200 text-black" />
              <div>
                <h1 className="text-2xl font-bold text-black">Decision Matrix</h1>
                <p className="text-xs text-gray-700">Multicriteria Decision Making Calculator</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Button
                variant={homeTab === "calculator" ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => setHomeTab("calculator")}
              >
                Calculator
              </Button>
              <Button
                variant={homeTab === "rankingComparison" ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => setHomeTab("rankingComparison")}
              >
                Ranking comparison
              </Button>
            </div>

            {homeTab === "calculator" && (
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
                      onClick={() => setCurrentStep("input")}
                      className="w-full bg-black text-white hover:bg-gray-800 text-xs h-8"
                    >
                      + Add Alternative & Criteria
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-none w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-black">{cardTitle}</CardTitle>
                    <CardDescription className="text-xs text-gray-700">
                      {cardDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="font-semibold text-black mb-1">Formula:</p>
                        <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                          {cardFormula}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-black mb-1">Description:</p>
                        <p className="text-gray-700">
                          {cardLongDescription}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {homeTab === "rankingComparison" && (
              <>
                <Card className="border-gray-200 bg-white shadow-none w-full mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-black">Ranking comparison</CardTitle>
                    <CardDescription className="text-xs text-gray-700">
                      Upload a decision matrix, choose one weight method, pick ranking methods to compare, then view rankings and chart.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-black">Upload Excel</p>
                      <input
                        ref={comparisonFileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleComparisonFileUpload}
                        className="text-xs"
                      />
                      {comparisonFileName && (
                        <p className="text-[11px] text-gray-600">Loaded: {comparisonFileName}</p>
                      )}
                      <p className="text-[11px] text-gray-600">
                        Format: Row 1 headers; Row 2 max/min; Row 3 weights; Row 4+ alternative values.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border border-gray-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-black mb-2">Weight method (choose one)</p>
                        <div className="space-y-2">
                          {WEIGHT_METHODS.map((w) => (
                            <label key={w.value} className="flex items-start gap-2 text-xs text-black">
                              <input
                                type="checkbox"
                                checked={comparisonWeightMethod === w.value}
                                onChange={() => setComparisonWeightMethod(w.value)}
                                disabled={comparisonLoading}
                              />
                              <span>
                                <span className="font-semibold">{w.label}</span>{" "}
                                <span className="text-gray-700">{w.description}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-black mb-2">Ranking methods (choose one or more)</p>
                        <div className="grid grid-cols-2 gap-2">
                          {MCDM_METHODS.map((m) => (
                            <label key={m.value} className="flex items-start gap-2 text-[11px] text-black">
                              <input
                                type="checkbox"
                                checked={selectedRankingMethods.includes(m.value)}
                                onChange={() => toggleRankingMethodSelection(m.value)}
                                disabled={comparisonLoading}
                              />
                              <span>
                                <span className="font-semibold">{m.label}</span>{" "}
                                <span className="text-gray-700">{m.description}</span>
                              </span>
                            </label>
                          ))}
                        </div>
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
                        Rankings by method (lower rank is better).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <table className="min-w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 border-b border-gray-200 text-black">Method</th>
                            {comparisonResults[0]?.ranking?.map((item) => (
                              <th key={item.alternativeName} className="px-3 py-2 text-left border-b border-gray-200 text-black">
                                {item.alternativeName}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {comparisonResults.map((result) => (
                            <tr key={result.method} className="border-b border-gray-200">
                              <td className="px-3 py-2 font-semibold text-black whitespace-nowrap">{result.label}</td>
                              {result.ranking?.map((item) => (
                                <td key={item.alternativeName} className="px-3 py-2 text-black">
                                  {item.rank}
                                </td>
                              ))}
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
          </div>

          {!showingWeightFormula && homeTab === "calculator" && method === "swei" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <SWEIFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "swi" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <SWIFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "topsis" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <TOPSISFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "waspas" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <WASPASFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "vikor" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <VIKORFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "edas" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <EDASFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "copras" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <COPRASFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "moora" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <MOORAFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "multimoora" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <MULTIMOORAFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "todim" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <TODIMFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "codas" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <CODASFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "moosra" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <MOOSRAFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "mairca" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <MAIRCAFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "marcos" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <MARCOSFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "cocoso" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <COCOSOFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "promethee" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <PROMETHEEFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "promethee1" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <PROMETHEE1Formula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "promethee2" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <PROMETHEE2Formula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "electre" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <ELECTREFormula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "electre1" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <ELECTRE1Formula />
            </div>
          )}

          {homeTab === "calculator" && !showingWeightFormula && method === "electre2" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <ELECTRE2Formula />
            </div>
          )}

          {homeTab === "calculator" && showingWeightFormula && weightMethod === "entropy" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <EntropyFormula />
            </div>
          )}

          {homeTab === "calculator" && showingWeightFormula && weightMethod === "ahp" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <AHPFormula />
            </div>
          )}

          {homeTab === "calculator" && showingWeightFormula && weightMethod === "critic" && (
            <div className="max-w-7xl mx-auto px-2 md:px-3 pb-6">
              <CRITICFormula />
            </div>
          )}

        </main>
      </SidebarProvider>
    )
  }

  if (currentStep === "input") {
    return (
      <SidebarProvider>
        <Sidebar className="border-r border-gray-200 bg-gray-50">
          <SidebarHeader className="py-2 px-3">
            <h2 className="text-xs font-bold text-black">MCDM Methods</h2>
          </SidebarHeader>
          <SidebarContent className="px-2">
<<<<<<< HEAD
            <SidebarSections onMethodClick={(v) => setMethod(v)} />
=======
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
                          className={`text-xs ${
                            method === m.value
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
                          className={`text-xs ${
                            weightMethod === w.value
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
>>>>>>> df2da8c600b3cf8575811737a8a3ac102d253276
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 min-h-screen bg-white p-2 md:p-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <SidebarTrigger className="md:hidden border-gray-200 text-black" />
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
      </SidebarProvider>
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
<<<<<<< HEAD
            <SidebarSections onMethodClick={(v) => setMethod(v)} />
=======
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
                          className={`text-xs ${
                            method === m.value
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
                          className={`text-xs ${
                            weightMethod === w.value
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
>>>>>>> df2da8c600b3cf8575811737a8a3ac102d253276
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 h-screen bg-white flex flex-col">
          <div className="p-2 md:p-3 border-b border-gray-200 flex-shrink-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <SidebarTrigger className="md:hidden border-gray-200 text-black" />
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
            <div className="max-w-7xl mx-auto flex gap-2 justify-end">
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
        </main>
      </SidebarProvider>
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
<<<<<<< HEAD
            <SidebarSections onMethodClick={(v) => setMethod(v)} />
=======
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
                          className={`text-xs ${
                            method === m.value
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
                          className={`text-xs ${
                            weightMethod === w.value
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
>>>>>>> df2da8c600b3cf8575811737a8a3ac102d253276
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 min-h-screen bg-white p-2 md:p-3">
          <div className="max-w-full lg:max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden border-gray-200 text-black" />
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
      </SidebarProvider>
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
<<<<<<< HEAD
            <SidebarSections
              onMethodClick={async (value) => {
                if (value !== method) {
                  setMethod(value)
                  setApiResults(null)
                  setIsLoading(true)
                  try {
                    const response = await fetch("/api/calculate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        method: value,
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
            />
=======
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
>>>>>>> df2da8c600b3cf8575811737a8a3ac102d253276
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 min-h-screen bg-white p-2 md:p-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <SidebarTrigger className="md:hidden border-gray-200 text-black" />
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
      </SidebarProvider>
    )
  }

  return null
}
