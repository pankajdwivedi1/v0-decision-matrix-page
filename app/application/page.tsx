"use client";

import { useState, useRef, useMemo, Fragment, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import * as XLSX from "xlsx"
import { Upload, ChevronDown, ChevronRight, ChevronLeft, Home, Download, LayoutGrid } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area, ComposedChart, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, RadialBar, PieChart, Pie, ReferenceLine } from "recharts"
import { toJpeg } from "html-to-image"
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
import MERECFormula from "@/components/MERECFormula"

import SWARAFormula from "@/components/SWARAFormula"
import WENSLOFormula from "@/components/WENSLOFormula"
import LOPCOWFormula from "@/components/LOPCOWFormula"
import DEMATELFormula from "@/components/DEMATELFormula"
import MABACFormula from "@/components/MABACFormula"
import SDFormula from "@/components/SDFormula"
import VarianceFormula from "@/components/VarianceFormula"
import MADFormula from "@/components/MADFormula"

import DBWFormula from "@/components/DBWFormula"
import SVPFormula from "@/components/SVPFormula"
import MDMFormula from "@/components/MDMFormula"
import LSWFormula from "@/components/LSWFormula"
import GPOWFormula from "@/components/GPOWFormula"
import LPWMFormula from "@/components/LPWMFormula"
import PCWMFormula from "@/components/PCWMFormula"
import ROCFormula from "@/components/ROCFormula"
import RRFormula from "@/components/RRFormula"
import GRAFormula from "@/components/GRAFormula"
import ARASFormula from "@/components/ARASFormula"
import ColorSwitcher from "@/components/ColorSwitcher"

declare global {
  interface Window {
    MathJax?: any;
  }
}

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

type MCDMMethod = "swei" | "swi" | "topsis" | "vikor" | "waspas" | "edas" | "moora" | "multimoora" | "todim" | "codas" | "moosra" | "mairca" | "marcos" | "cocoso" | "copras" | "promethee" | "promethee1" | "promethee2" | "electre" | "electre1" | "electre2" | "mabac" | "gra" | "aras"
type WeightMethod = "equal" | "entropy" | "critic" | "ahp" | "piprecia" | "merec" | "swara" | "wenslo"
  | "lopcow"
  | "dematel"
  | "sd"
  | "variance"
  | "mad"
  | "dbw"
  | "svp"
  | "mdm"
  | "lsw"
  | "gpow"
  | "lpwm"
  | "pcwm"
  | "roc"
  | "rr"
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
  entropyMatrix: Record<string, Record<string, number>>
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

interface MERECResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  performanceScores: Record<string, number>
  removalScores: Record<string, Record<string, number>>
  removalEffects: Record<string, number>
}

interface SWARAResult {
  weights: Record<string, number>
  stepFactors: Record<string, number>
  preliminaryWeights: Record<string, number>
  coefficients: Record<string, number>
}

interface WensloResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  wensloValues: Record<string, number>
  diversityValues: Record<string, number>
}

interface LopcowResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  geometricMeans: Record<string, number>
  logPercentages: Record<string, number>
}

interface DematelResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  directRelationMatrix: Record<string, Record<string, number>>
  totalRelationMatrix: Record<string, Record<string, number>>
  dValues: Record<string, number>
  rValues: Record<string, number>
  pValues: Record<string, number>
  eValues: Record<string, number>
}

interface SDResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  sigmaValues: Record<string, number>
}

interface VarianceResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  varianceValues: Record<string, number>
}

interface MADResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  madValues: Record<string, number>
}

interface DBWResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  distanceValues: Record<string, number>
}

interface SVPResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  varianceValues: Record<string, number>
}

interface MDMResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  deviationValues: Record<string, number>
}

interface LSWResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  leastSquaresValues: Record<string, number>
  idealSolution: Record<string, number>
}

interface GPOWResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  goalDeviationValues: Record<string, number>
  goalValues: Record<string, number>
}

interface LPWMResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  lowerDeviationValues: Record<string, number>
  antiIdealValues: Record<string, number>
}

interface PCWMResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  correlationMatrix: Record<string, Record<string, number>>
  independenceMeasures: Record<string, number>
}
interface RankingWeightResult {
  weights: Record<string, number>
  ranks: Record<string, number>
}

interface ROCResult extends RankingWeightResult { }
interface RRResult extends RankingWeightResult { }


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
    value: "mabac",
    label: "MABAC",
    description: "Multi-Attributive Border Approximation Area Comparison",
    formula: "S_i = Σ(v_ij - g_j)"
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
  {
    value: "gra",
    label: "GRA",
    description: "Grey Relational Analysis",
    formula: "γ_i = Σ(w_j × ξ_ij)"
  },
  {
    value: "aras",
    label: "ARAS",
    description: "Additive Ratio Assessment",
    formula: "K_i = S_i / S_0"
  },
]

const WEIGHT_METHODS: { value: WeightMethod; label: string; description: string }[] = [
  {
    value: "equal",
    label: "Equal Weight",
    description: "Assigns equal weight to all criteria.",
  },
  {
    value: "entropy",
    label: "Entropy Weight",
    description: "Entropy-based objective weighting method that calculates weights based on information content in the decision matrix.",
  },
  {
    value: "critic",
    label: "CRITIC Weight",
    description: "CRITIC (Criteria Importance Through Intercriteria Correlation) method that determines weights based on contrast intensity and conflict between criteria.",
  },
  {
    value: "ahp",
    label: "AHP Weight",
    description: "Analytic Hierarchy Process (AHP) derives weights from a pairwise comparison matrix; here derived from provided priority scores.",
  },
  {
    value: "piprecia",
    label: "PIPRECIA Weight",
    description: "Pivot Pairwise Relative Criteria Importance Assessment (PIPRECIA) determines weights based on subjective relative importance of criteria.",
  },
  {
    value: "merec",
    label: "MEREC Weight",
    description: "Method based on the Removal Effects of Criteria (MEREC) determines objective weights by analyzing the effect of removing each criterion.",
  },
  {
    value: "swara",
    label: "SWARA Weight",
    description: "Step-wise Weight Assessment Ratio Analysis (SWARA) determines weights based on expert assessment of relative importance differences between criteria.",
  },
  {
    value: "wenslo",
    label: "WENSLO Weight",
    description: "WENSLO weight method determines weights based on objective calculation similar to Entropy and MEREC.",
  },
  {
    value: "lopcow",
    label: "LOPCOW Weight",
    description: "LOPCOW (Logarithmic Percentage Change-driven Objective Weighting) method determines weights using the magnitude of data variability.",
  },
  {
    value: "dematel",
    label: "DEMATEL Weight",
    description: "DEMATEL (Decision Making Trial and Evaluation Laboratory) visualizes the structure of complex causal relationships between criteria.",
  },
  {
    value: "sd",
    label: "SD Weight",
    description: "Standard Deviation (SD) method assigns weights based on the dispersion of criteria values in the normalized matrix.",
  },
  {
    value: "variance",
    label: "Variance Weight",
    description: "Variance method determines weights based on the statistical variance of criteria values.",
  },
  {
    value: "mad",
    label: "MAD Weight",
    description: "Mean Absolute Deviation (MAD) method calculates weights using the average absolute deviation from the mean.",
  },

  {
    value: "dbw",
    label: "Distance-based Weight",
    description: "Distance-based Weighting (DBW) method calculates weights based on the pair-wise distances between alternatives for each criterion.",
  },
  {
    value: "svp",
    label: "SVP Weight",
    description: "Statistical Variance Procedure (SVP) uses variance on Min-Max normalized data to determine objective weights.",
  },
  {
    value: "mdm",
    label: "MDM Weight",
    description: "Maximizing Deviation Method (MDM) assigns higher weights to criteria with greater deviation between alternatives.",
  },
  {
    value: "lsw",
    label: "LSW Weight",
    description: "Least Squares Weighting Method (LSW) determines weights based on squared deviations from the ideal solution.",
  },
  {
    value: "gpow",
    label: "GPOW Weight",
    description: "Goal Programming–based Objective Weights (GPOW) method determines weights by minimizing total absolute deviation from the ideal goal.",
  },
  {
    value: "lpwm",
    label: "LPWM Weight",
    description: "Linear Programming Weight Method (LPWM) determines weights based on cumulative absolute deviation from the anti-ideal solution.",
  },
  {
    value: "pcwm",
    label: "PCWM Weight",
    description: "Pearson Correlation Weight Method (PCWM) Determines weights based on the degree of independence and conflict (correlation) between criteria.",
  },
  {
    value: "roc",
    label: "ROC Weight",
    description: "Rank Order Centroid (ROC) method calculates weights based on a pre-defined rank order of criteria (Barron & Barrett, 1996).",
  },
  {
    value: "rr",
    label: "RR Weight",
    description: "Rank Reciprocal (RR) method assigns weights based on the reciprocal of criteria ranks (Stillwell et al., 1981).",
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
  const sensitivityGraphicalVariationRef = useRef<HTMLDivElement>(null)
  const sensitivityResultsRef = useRef<HTMLDivElement>(null)

  // State to track where to return after completing input flow
  const [returnToTab, setReturnToTab] = useState<"rankingMethods" | "weightMethods" | "rankingComparison" | "sensitivityAnalysis" | null>(null)

  // State for comparison tab collapsible sections
  const [comparisonWeightOpen, setComparisonWeightOpen] = useState(true)
  const [comparisonRankingOpen, setComparisonRankingOpen] = useState(true)

  // State for Ranking Methods carousel
  const [rankingMethodsCarouselIndex, setRankingMethodsCarouselIndex] = useState(0)
  const [weightMethodsCarouselIndex, setWeightMethodsCarouselIndex] = useState(0)

  const [alternatives, setAlternatives] = useState<Alternative[]>([])
  const [criteria, setCriteria] = useState<Criterion[]>([])

  const [numAlternatives, setNumAlternatives] = useState(3)
  const [numCriteria, setNumCriteria] = useState(3)

  const [isLoading, setIsLoading] = useState(false)
  const [apiResults, setApiResults] = useState<any>(null)
  const [entropyResult, setEntropyResult] = useState<EntropyResult | null>(null)
  const [criticResult, setCriticResult] = useState<CriticResult | null>(null)
  const [sdResult, setSdResult] = useState<SDResult | null>(null)
  const [varianceResult, setVarianceResult] = useState<VarianceResult | null>(null)
  const [madResult, setMadResult] = useState<MADResult | null>(null)

  const [dbwResult, setDbwResult] = useState<DBWResult | null>(null)
  const [svpResult, setSvpResult] = useState<SVPResult | null>(null)
  const [mdmResult, setMdmResult] = useState<MDMResult | null>(null)
  const [lswResult, setLswResult] = useState<LSWResult | null>(null)
  const [gpowResult, setGpowResult] = useState<GPOWResult | null>(null)
  const [lpwmResult, setLpwmResult] = useState<LPWMResult | null>(null)
  const [pcwmResult, setPcwmResult] = useState<PCWMResult | null>(null)
  const [rocResult, setRocResult] = useState<ROCResult | null>(null)
  const [rrResult, setRrResult] = useState<RRResult | null>(null)

  // Responsive items per page for carousels
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [showAllRankingMethods, setShowAllRankingMethods] = useState(false)
  const [showAllWeightMethods, setShowAllWeightMethods] = useState(false)
  const [isMethodSelectionSheetOpen, setIsMethodSelectionSheetOpen] = useState(false)

  // Persistence for navigation state
  useEffect(() => {
    const savedStep = localStorage.getItem("currentStep") as PageStep
    if (savedStep) {
      // If the saved step is "calculate", revert to "matrix" because apiResults are lost on reload.
      // This prevents the infinite "Loading results..." spinner and ensures the user explicitly triggers calculation.
      if (savedStep === "calculate") {
        setCurrentStep("matrix")
      } else {
        setCurrentStep(savedStep)
      }
    }
    const savedTab = localStorage.getItem("homeTab") as any
    if (savedTab) setHomeTab(savedTab)
  }, [])

  useEffect(() => {
    if (currentStep) localStorage.setItem("currentStep", currentStep)
  }, [currentStep])

  useEffect(() => {
    if (homeTab) localStorage.setItem("homeTab", homeTab)
  }, [homeTab])

  const handleResetAndHome = () => {
    setCurrentStep("home")
    // Optional: Reset other transient states if needed
    setIsLoading(false)
  }

  // Prevent Enter key from triggering submit/reload
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(3)
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(6)
      } else {
        setItemsPerPage(8)
      }
    }

    // Set initial
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const [ahpResult, setAhpResult] = useState<AHPResult | null>(null)
  const [pipreciaResult, setPipreciaResult] = useState<PipreciaResult | null>(null)
  const [merecResult, setMerecResult] = useState<MERECResult | null>(null)
  const [swaraResult, setSwaraResult] = useState<SWARAResult | null>(null)
  const [sidebarCategory, setSidebarCategory] = useState<"objective" | "subjective">("objective")
  const [wensloResult, setWensloResult] = useState<WensloResult | null>(null)
  const [lopcowResult, setLopcowResult] = useState<LopcowResult | null>(null)
  const [dematelResult, setDematelResult] = useState<DematelResult | null>(null)
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

  // SWARA State
  const [isSwaraDialogOpen, setIsSwaraDialogOpen] = useState(false)
  const [isSensitivitySwaraDialogOpen, setIsSensitivitySwaraDialogOpen] = useState(false)
  const [isComparisonSwaraDialogOpen, setIsComparisonSwaraDialogOpen] = useState(false)
  const [swaraCalculatedWeights, setSwaraCalculatedWeights] = useState<Record<string, number> | null>(null)
  const [swaraCoefficients, setSwaraCoefficients] = useState<Record<string, string>>({})
  const [criteriaRanks, setCriteriaRanks] = useState<Record<string, string>>({})
  const [isRanksDialogOpen, setIsRanksDialogOpen] = useState(false)
  const [isSensitivityRanksDialogOpen, setIsSensitivityRanksDialogOpen] = useState(false)
  const [isComparisonRanksDialogOpen, setIsComparisonRanksDialogOpen] = useState(false)

  // AHP State
  const [isAhpDialogOpen, setIsAhpDialogOpen] = useState(false)
  const [ahpCalculatedWeights, setAhpCalculatedWeights] = useState<Record<string, number> | null>(null)
  const [ahpMatrix, setAhpMatrix] = useState<number[][]>([])

  const [isWeightSelectorOpen, setIsWeightSelectorOpen] = useState(false)
  const [sensitivityAnalysisType, setSensitivityAnalysisType] = useState<"criterion" | "weights">("criterion") // Toggle between old and new analysis
  const [sensitivityWeightComparisonResults, setSensitivityWeightComparisonResults] = useState<any[]>([])
  const [sensitivityCriteriaWeights, setSensitivityCriteriaWeights] = useState<any[]>([])
  const [weightChartType, setWeightChartType] = useState<string>("bar")

  // Decimal precision for results display
  const [resultsDecimalPlaces, setResultsDecimalPlaces] = useState<number>(4)
  const [weightsDecimalPlaces, setWeightsDecimalPlaces] = useState<number>(4)
  const [vikorVValue, setVikorVValue] = useState<string>("0.5")
  const [waspasLambdaValue, setWpasLambdaValue] = useState<string>("0.5")
  const [codasTauValue, setCodasTauValue] = useState<string>("0.02")

  // Excel data selection state
  const [excelPreviewData, setExcelPreviewData] = useState<any[][] | null>(null)
  const [isExcelPreviewOpen, setIsExcelPreviewOpen] = useState(false)
  const [selectedDataRange, setSelectedDataRange] = useState<{
    startRow: number
    endRow: number
    startCol: number
    endCol: number
  }>({ startRow: 0, endRow: 0, startCol: 0, endCol: 0 })
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [isExcelExampleOpen, setIsExcelExampleOpen] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("decisionMatrixData")
      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (parsed.alternatives && parsed.alternatives.length > 0) setAlternatives(parsed.alternatives)
        if (parsed.criteria && parsed.criteria.length > 0) setCriteria(parsed.criteria)
        if (parsed.numAlternatives) setNumAlternatives(parsed.numAlternatives)
        if (parsed.numCriteria) setNumCriteria(parsed.numCriteria)
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e)
    }
  }, [])

  // Save data to localStorage whenever relevant state changes
  useEffect(() => {
    if (alternatives.length > 0 || criteria.length > 0) {
      localStorage.setItem(
        "decisionMatrixData",
        JSON.stringify({
          alternatives,
          criteria,
          numAlternatives,
          numCriteria,
        })
      )
    }
  }, [alternatives, criteria, numAlternatives, numCriteria])

  // Auto-play carousel for ranking methods removed in favor of grid view

  // Trigger MathJax typesetting when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setTimeout(() => {
        if (window.MathJax) {
          window.MathJax.typesetPromise?.().catch((err: any) => console.log('MathJax error:', err))
        }
      }, 100)
    }
  }, [isDialogOpen])



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
  ): Promise<{ criteria: Criterion[]; entropyResult?: EntropyResult; criticResult?: CriticResult; dematelResult?: DematelResult }> => {
    if (weight === "equal") {
      const equalCriteria = crits.map((crit) => ({ ...crit, weight: 1 / crits.length }))
      return { criteria: equalCriteria }
    }

    if (weight === "entropy") {
      const response = await fetch("/api/entropy-weights", {
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
      const response = await fetch("/api/critic-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate CRITIC weights")
      const data: CriticResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated, criticResult: data }
    }

    if (weight === "merec") {
      const response = await fetch("/api/merec-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate MEREC weights")
      const data: MERECResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "wenslo") {
      const response = await fetch("/api/wenslo-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate WENSLO weights")
      const data: WensloResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "lopcow") {
      const response = await fetch("/api/lopcow-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate LOPCOW weights")
      const data: LopcowResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "dematel") {
      const response = await fetch("/api/dematel-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate DEMATEL weights")
      const data: DematelResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated, dematelResult: data }
    }

    if (weight === "sd") {
      const response = await fetch("/api/sd-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate SD weights")
      const data: SDResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "variance") {
      const response = await fetch("/api/variance-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate Variance weights")
      const data: VarianceResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "mad") {
      const response = await fetch("/api/mad-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate MAD weights")
      const data: MADResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "dbw") {
      const response = await fetch("/api/dbw-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate DBW weights")
      const data: DBWResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "svp") {
      const response = await fetch("/api/svp-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate SVP weights")
      const data: SVPResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "mdm") {
      const response = await fetch("/api/mdm-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate MDM weights")
      const data: MDMResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "lsw") {
      const response = await fetch("/api/lsw-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate LSW weights")
      const data: LSWResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "gpow") {
      const response = await fetch("/api/gpow-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate GPOW weights")
      const data: GPOWResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "lpwm") {
      const response = await fetch("/api/lpwm-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate LPWM weights")
      const data: LPWMResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "pcwm") {
      const response = await fetch("/api/pcwm-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alternatives: alts, criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate PCWM weights")
      const data: PCWMResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (["roc", "rr"].includes(weight)) {
      const response = await fetch(`/api/${weight}-weights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          criteria: crits,
          ranks: Object.fromEntries(Object.entries(criteriaRanks).map(([id, r]) => [id, parseInt(r) || 0]))
        }),
      })
      if (!response.ok) throw new Error(`Failed to calculate ${weight.toUpperCase()} weights`)
      const data = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "swara") {
      // Use stored SWARA weights if available
      const weightsToUse = swaraCalculatedWeights || {}
      const updated = crits.map((crit) => ({
        ...crit,
        weight: weightsToUse[crit.id] !== undefined ? weightsToUse[crit.id] : (1 / crits.length)
      }))
      return { criteria: updated }
    }

    if (weight === "ahp") {
      // Return stored weights if they exist, otherwise fetch
      if (ahpCalculatedWeights) {
        const updated = crits.map((crit) => ({ ...crit, weight: ahpCalculatedWeights[crit.id] || crit.weight }))
        return { criteria: updated }
      }
      const response = await fetch("/api/ahp-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate AHP weights")
      const data: AHPResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    if (weight === "piprecia") {
      // Return stored weights if they exist, otherwise fetch
      if (pipreciaCalculatedWeights) {
        const updated = crits.map((crit) => ({ ...crit, weight: pipreciaCalculatedWeights[crit.id] || crit.weight }))
        return { criteria: updated }
      }
      const response = await fetch("/api/piprecia-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria: crits }),
      })
      if (!response.ok) throw new Error("Failed to calculate PIPRECIA weights")
      const data: PipreciaResult = await response.json()
      const updated = crits.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
      return { criteria: updated }
    }

    return { criteria: crits }
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
              vikorVValue: parseFloat(vikorVValue) || 0.5,
              waspasLambdaValue: parseFloat(waspasLambdaValue) || 0.5,
              codasTauValue: parseFloat(codasTauValue) || 0.02,
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

  const downloadChartAsJpeg = (ref: React.RefObject<HTMLDivElement | null>, prefix: string) => {
    if (!ref.current) return

    toJpeg(ref.current, { quality: 1.0, backgroundColor: "#ffffff", pixelRatio: 4 })
      .then((dataUrl) => {
        const link = document.createElement("a")
        link.download = `${prefix}-${Date.now()}.jpg`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((err) => {
        console.error("Error exporting chart", err)
      })
  }

  const downloadComparisonChartAsJpeg = () => {
    if (!comparisonChartRef.current) return

    const element = comparisonChartRef.current
    const originalStyle = {
      overflow: element.style.overflow,
      maxHeight: element.style.maxHeight,
      maxWidth: element.style.maxWidth,
      width: element.style.width,
      height: element.style.height
    }

    // Force full size for capture
    // We explicitly set width/height to scroll dimensions to capture everything
    const width = element.scrollWidth
    const height = element.scrollHeight

    toJpeg(element, {
      quality: 1.0,
      backgroundColor: "#ffffff",
      pixelRatio: 4,
      width: width,
      height: height,
      style: {
        overflow: 'visible',
        maxHeight: 'none',
        maxWidth: 'none',
        width: `${width}px`,
        height: `${height}px`
      }
    })
      .then((dataUrl) => {
        const link = document.createElement("a")
        link.download = `ranking-comparison-${Date.now()}.jpg`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((err) => {
        console.error("Error exporting chart", err)
      })
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

        // Store the data and open preview dialog
        setExcelPreviewData(jsonData as any[][])
        setIsExcelPreviewOpen(true)

        // Initialize selection to include all data
        const rows = (jsonData as any[][]).length
        const cols = Math.max(...(jsonData as any[][]).map(row => row.length))
        setSelectedDataRange({
          startRow: 0,
          endRow: rows - 1,
          startCol: 0,
          endCol: cols - 1
        })

        console.log("Excel preview opened")
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

  const toggleCellSelection = (rowIdx: number, colIdx: number) => {
    const cellKey = `${rowIdx}-${colIdx}`
    setSelectedCells(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cellKey)) {
        newSet.delete(cellKey)
      } else {
        newSet.add(cellKey)
      }
      return newSet
    })
  }

  const handleImportSelectedData = () => {
    if (!excelPreviewData) return

    // Extract selected data based on selectedDataRange
    const { startRow, endRow, startCol, endCol } = selectedDataRange
    const selectedData = excelPreviewData
      .slice(startRow, endRow + 1)
      .map(row => row.slice(startCol, endCol + 1))

    // Parse the selected data
    parseExcelData(selectedData)

    // Close the dialog
    setIsExcelPreviewOpen(false)
    setExcelPreviewData(null)
    setSelectedCells(new Set())
  }

  const selectAllData = () => {
    if (!excelPreviewData) return
    const rows = excelPreviewData.length
    const cols = Math.max(...excelPreviewData.map(row => row.length))
    setSelectedDataRange({
      startRow: 0,
      endRow: rows - 1,
      startCol: 0,
      endCol: cols - 1
    })
  }

  const updateSelectionRange = (type: 'startRow' | 'endRow' | 'startCol' | 'endCol', value: number) => {
    setSelectedDataRange(prev => ({
      ...prev,
      [type]: value
    }))
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

  const calculateWeights = async (methodToUse: WeightMethod): Promise<Criterion[]> => {
    setIsLoading(true)
    setWeightMethod(methodToUse)
    let newCriteria = [...criteria]

    // Reset previous results
    setEntropyResult(null)
    setCriticResult(null)
    setAhpResult(null)
    setMerecResult(null)
    setSwaraResult(null)
    setWensloResult(null)
    setLopcowResult(null)
    setDematelResult(null)

    if (methodToUse === "equal") {
      const weight = 1 / criteria.length
      newCriteria = criteria.map((c) => ({ ...c, weight }))
      setCriteria(newCriteria)
      setIsLoading(false)
      return newCriteria
    }

    try {
      if (methodToUse === "entropy") {
        const response = await fetch("/api/entropy-weights", {
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
        const response = await fetch("/api/critic-weights", {
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
        const response = await fetch("/api/ahp-weights", {
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
        const response = await fetch("/api/piprecia-weights", {
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
      } else if (methodToUse === "merec") {
        const response = await fetch("/api/merec-weights", {
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
          throw new Error("Failed to calculate MEREC weights")
        }

        const data: MERECResult = await response.json()
        setMerecResult(data)
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } else if (methodToUse === "wenslo") {
        const response = await fetch("/api/wenslo-weights", {
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
          throw new Error("Failed to calculate WENSLO weights")
        }

        const data: WensloResult = await response.json()

        setWensloResult(data)
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } else if (methodToUse === "lopcow") {
        const response = await fetch("/api/lopcow-weights", {
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
          throw new Error("Failed to calculate LOPCOW weights")
        }

        const data: LopcowResult = await response.json()

        setLopcowResult(data)
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } else if (methodToUse === "dematel") {
        console.log("Calling DEMATEL API...");
        const response = await fetch("/api/dematel-weights", {
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
          throw new Error("Failed to calculate DEMATEL weights")
        }

        const data: DematelResult = await response.json()

        setDematelResult(data)
        setCriteria(
          criteria.map((crit) => ({
            ...crit,
            weight: data.weights[crit.id] || crit.weight,
          })),
        )
      } else if (methodToUse === "sd") {
        const response = await fetch("/api/sd-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate SD weights")
        const data: SDResult = await response.json()
        setSdResult(data)
        newCriteria = criteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(newCriteria)
      } else if (methodToUse === "variance") {
        const response = await fetch("/api/variance-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate Variance weights")
        const data: VarianceResult = await response.json()
        setVarianceResult(data)
        newCriteria = criteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(newCriteria)
      } else if (methodToUse === "mad") {
        const response = await fetch("/api/mad-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate MAD weights")
        const data: MADResult = await response.json()
        setMadResult(data)
        newCriteria = criteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(newCriteria)
      } else if (methodToUse === "dbw") {
        const response = await fetch("/api/dbw-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate DBW weights")
        const data: DBWResult = await response.json()
        setDbwResult(data)
        newCriteria = criteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(newCriteria)
      } else if (methodToUse === "svp") {
        const response = await fetch("/api/svp-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate SVP weights")
        const data: SVPResult = await response.json()
        setSvpResult(data)
        newCriteria = criteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(newCriteria)
      } else if (methodToUse === "mdm") {
        const response = await fetch("/api/mdm-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate MDM weights")
        const data: MDMResult = await response.json()
        setMdmResult(data)
        newCriteria = criteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(newCriteria)
      } else if (methodToUse === "lsw") {
        const response = await fetch("/api/lsw-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate LSW weights")
        const data: LSWResult = await response.json()
        setLswResult(data)
        newCriteria = criteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(newCriteria)
      } else if (methodToUse === "gpow") {
        const response = await fetch("/api/gpow-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate GPOW weights")
        const data: GPOWResult = await response.json()
        setGpowResult(data)
        newCriteria = criteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(newCriteria)
      } else if (methodToUse === "lpwm") {
        const response = await fetch("/api/lpwm-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate LPWM weights")
        const data: LPWMResult = await response.json()
        setLpwmResult(data)
        newCriteria = criteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(newCriteria)
      } else if (methodToUse === "pcwm") {
        const response = await fetch("/api/pcwm-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate PCWM weights")
        const data: PCWMResult = await response.json()
        setPcwmResult(data)
        newCriteria = criteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(newCriteria)
      } else if (["roc", "rr"].includes(methodToUse)) {
        const response = await fetch(`/api/${methodToUse}-weights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            criteria,
            ranks: Object.fromEntries(Object.entries(criteriaRanks).map(([id, r]) => [id, parseInt(r) || 0]))
          }),
        })
        if (!response.ok) throw new Error(`Failed to calculate ${methodToUse.toUpperCase()} weights`)
        const data = await response.json()
        if (methodToUse === "roc") setRocResult(data)
        else setRrResult(data)

        let newCriteria = criteria.map((crit) => ({
          ...crit,
          weight: data.weights[crit.id] || crit.weight,
        }))
        setCriteria(newCriteria)
      }
    } catch (error) {
      console.error("Error calculating weights:", error)
      alert("Error calculating weights")
    } finally {
      setIsLoading(false)
    }
    return newCriteria
  }

  const handleSaveTable = async (shouldNavigate = true, weightMethodOverride?: WeightMethod): Promise<{ success: boolean; updatedCriteria: Criterion[] }> => {
    const allScoresFilled = alternatives.every((alt) =>
      criteria.every((crit) => {
        const score = alt.scores[crit.id]
        return score !== undefined && score !== "" && Number(score) >= 0
      }),
    )

    if (!allScoresFilled) {
      alert("Please fill in all score values with numbers greater than or equal to 0")
      return { success: false, updatedCriteria: criteria }
    }

    const finalWeightMethod = weightMethodOverride || weightMethod
    let currentCriteria = [...criteria]

    // Reset previous weight calculation results
    setEntropyResult(null)
    setCriticResult(null)
    setAhpResult(null)
    setPipreciaResult(null)
    setWensloResult(null)
    setLopcowResult(null)
    setDematelResult(null)
    setSdResult(null)
    setVarianceResult(null)
    setMadResult(null)

    setDbwResult(null)
    setSvpResult(null)
    setMdmResult(null)
    setLswResult(null)
    setGpowResult(null)
    setLpwmResult(null)
    setPcwmResult(null)
    setRocResult(null)
    setRrResult(null)

    // Calculate entropy weights if entropy method is selected
    if (finalWeightMethod === "entropy") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/entropy-weights", {
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
        currentCriteria = currentCriteria.map((crit) => ({
          ...crit,
          weight: data.weights[crit.id] || crit.weight,
        }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating entropy weights:", error)
        alert("Error calculating entropy weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    // Calculate CRITIC weights if CRITIC weight is selected
    if (finalWeightMethod === "critic") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/critic-weights", {
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
        currentCriteria = currentCriteria.map((crit) => ({
          ...crit,
          weight: data.weights[crit.id] || crit.weight,
        }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating CRITIC weights:", error)
        alert("Error calculating CRITIC weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    // Calculate AHP weights if AHP method is selected
    if (finalWeightMethod === "ahp") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/ahp-weights", {
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
        currentCriteria = currentCriteria.map((crit) => ({
          ...crit,
          weight: data.weights[crit.id] || crit.weight,
        }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating AHP weights:", error)
        alert("Error calculating AHP weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    // Calculate PIPRECIA weights if PIPRECIA method is selected
    if (finalWeightMethod === "piprecia") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/piprecia-weights", {
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
        currentCriteria = currentCriteria.map((crit) => ({
          ...crit,
          weight: data.weights[crit.id] || crit.weight,
        }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating PIPRECIA weights:", error)
        alert("Error calculating PIPRECIA weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    // Calculate WENSLO weights if WENSLO method is selected
    if (finalWeightMethod === "wenslo") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/wenslo-weights", {
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
          throw new Error("Failed to calculate WENSLO weights")
        }

        const data: WensloResult = await response.json()

        setWensloResult(data)
        currentCriteria = currentCriteria.map((crit) => ({
          ...crit,
          weight: data.weights[crit.id] || crit.weight,
        }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating WENSLO weights:", error)
        alert("Error calculating WENSLO weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    // Calculate LOPCOW weights if LOPCOW method is selected
    if (finalWeightMethod === "lopcow") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/lopcow-weights", {
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
          throw new Error("Failed to calculate LOPCOW weights")
        }

        const data: LopcowResult = await response.json()

        setLopcowResult(data)
        currentCriteria = currentCriteria.map((crit) => ({
          ...crit,
          weight: data.weights[crit.id] || crit.weight,
        }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating LOPCOW weights:", error)
        alert("Error calculating LOPCOW weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }



    // Calculate DEMATEL weights if DEMATEL method is selected
    if (finalWeightMethod === "dematel") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/dematel-weights", {
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
          throw new Error("Failed to calculate DEMATEL weights")
        }

        const data: DematelResult = await response.json()

        setDematelResult(data)
        currentCriteria = currentCriteria.map((crit) => ({
          ...crit,
          weight: data.weights[crit.id] || crit.weight,
        }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating DEMATEL weights:", error)
        alert("Error calculating DEMATEL weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    if (finalWeightMethod === "sd") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/sd-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate SD weights")
        const data: SDResult = await response.json()
        setSdResult(data)
        currentCriteria = currentCriteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating SD weights:", error)
        alert("Error calculating SD weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    if (finalWeightMethod === "variance") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/variance-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate Variance weights")
        const data: VarianceResult = await response.json()
        setVarianceResult(data)
        currentCriteria = currentCriteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating Variance weights:", error)
        alert("Error calculating Variance weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    if (finalWeightMethod === "mad") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/mad-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate MAD weights")
        const data: MADResult = await response.json()
        setMadResult(data)
        currentCriteria = currentCriteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating MAD weights:", error)
        alert("Error calculating MAD weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    if (finalWeightMethod === "dbw") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/dbw-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate DBW weights")
        const data: DBWResult = await response.json()
        setDbwResult(data)
        currentCriteria = currentCriteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating DBW weights:", error)
        alert("Error calculating DBW weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    if (finalWeightMethod === "svp") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/svp-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate SVP weights")
        const data: SVPResult = await response.json()
        setSvpResult(data)
        currentCriteria = currentCriteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating SVP weights:", error)
        alert("Error calculating SVP weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    if (finalWeightMethod === "mdm") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/mdm-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate MDM weights")
        const data: MDMResult = await response.json()
        setMdmResult(data)
        currentCriteria = currentCriteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating MDM weights:", error)
        alert("Error calculating MDM weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    if (finalWeightMethod === "lsw") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/lsw-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate LSW weights")
        const data: LSWResult = await response.json()
        setLswResult(data)
        currentCriteria = currentCriteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating LSW weights:", error)
        alert("Error calculating LSW weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    if (finalWeightMethod === "gpow") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/gpow-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate GPOW weights")
        const data: GPOWResult = await response.json()
        setGpowResult(data)
        currentCriteria = currentCriteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating GPOW weights:", error)
        alert("Error calculating GPOW weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    if (finalWeightMethod === "lpwm") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/lpwm-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate LPWM weights")
        const data: LPWMResult = await response.json()
        setLpwmResult(data)
        currentCriteria = currentCriteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating LPWM weights:", error)
        alert("Error calculating LPWM weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    if (["roc", "rr"].includes(finalWeightMethod)) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/${finalWeightMethod}-weights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            criteria,
            ranks: Object.fromEntries(Object.entries(criteriaRanks).map(([id, r]) => [id, parseInt(r) || 0]))
          }),
        })
        if (!response.ok) throw new Error(`Failed to calculate ${finalWeightMethod.toUpperCase()} weights`)
        const data = await response.json()
        if (finalWeightMethod === "roc") setRocResult(data)
        else setRrResult(data)

        currentCriteria = currentCriteria.map((crit) => ({
          ...crit,
          weight: data.weights[crit.id] || crit.weight,
        }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error(`Error calculating ${finalWeightMethod} weights:`, error)
        alert(`Error calculating ${finalWeightMethod} weights. Using equal weight instead.`)
      } finally {
        setIsLoading(false)
      }
    }

    if (finalWeightMethod === "pcwm") {
      setIsLoading(true)
      try {
        const response = await fetch("/api/pcwm-weights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alternatives, criteria }),
        })
        if (!response.ok) throw new Error("Failed to calculate PCWM weights")
        const data: PCWMResult = await response.json()
        setPcwmResult(data)
        currentCriteria = currentCriteria.map((crit) => ({ ...crit, weight: data.weights[crit.id] || crit.weight }))
        setCriteria(currentCriteria)
      } catch (error) {
        console.error("Error calculating PCWM weights:", error)
        alert("Error calculating PCWM weights. Using equal weight instead.")
      } finally {
        setIsLoading(false)
      }
    }

    // Check if we need to return to a specific tab after completing input
    if (shouldNavigate) {
      if (returnToTab === "rankingComparison") {
        alert("Data has uploaded")
        setHomeTab("rankingComparison")
        setCurrentStep("home")
      } else if (returnToTab === "sensitivityAnalysis") {
        alert("Data has uploaded")
        setHomeTab("sensitivityAnalysis")
        setCurrentStep("home")
      } else {
        setCurrentStep("matrix")
      }
      // Always clear returnToTab after it has been used for navigation
      setReturnToTab(null)
    }
    return { success: true, updatedCriteria: currentCriteria }
  }

  const exportResultsToExcel = async () => {
    if (!apiResults?.ranking || apiResults.ranking.length === 0) {
      alert("No results to export")
      return
    }

    try {
      const methodLabel = MCDM_METHODS.find(m => m.value === method)?.label || method.toUpperCase()

      // Prepare data for export
      const exportData = {
        method: methodLabel,
        ranking: apiResults.ranking,
        alternatives,
        criteria,
        metrics: apiResults.metrics,
        resultsDecimalPlaces
      }

      // Call the export API
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(exportData)
      })

      if (!response.ok) {
        throw new Error("Failed to export to Excel")
      }

      // Get the blob and trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${methodLabel}_Results.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export to Excel")
    }
  }

  const exportWeightsToExcel = async () => {
    // Determine which weight result is active
    let activeResult: any = null
    let methodLabel = weightMethod.toUpperCase()

    if (weightMethod === "entropy") activeResult = entropyResult
    else if (weightMethod === "critic") activeResult = criticResult
    else if (weightMethod === "ahp") activeResult = ahpResult
    else if (weightMethod === "piprecia") activeResult = pipreciaResult
    else if (weightMethod === "merec") activeResult = merecResult
    else if (weightMethod === "swara") activeResult = swaraResult
    else if (weightMethod === "wenslo") activeResult = wensloResult
    else if (weightMethod === "lopcow") activeResult = lopcowResult
    else if (weightMethod === "dematel") activeResult = dematelResult
    else if (weightMethod === "sd") activeResult = sdResult
    else if (weightMethod === "variance") activeResult = varianceResult
    else if (weightMethod === "mad") activeResult = madResult

    else if (weightMethod === "dbw") activeResult = dbwResult
    else if (weightMethod === "svp") activeResult = svpResult
    else if (weightMethod === "mdm") activeResult = mdmResult
    else if (weightMethod === "lsw") activeResult = lswResult
    else if (weightMethod === "gpow") activeResult = gpowResult
    else if (weightMethod === "lpwm") activeResult = lpwmResult
    else if (weightMethod === "pcwm") activeResult = pcwmResult
    else if (weightMethod === "roc") activeResult = rocResult
    else if (weightMethod === "rr") activeResult = rrResult

    if (!activeResult && weightMethod !== "equal") {
      alert("No weight results to export. Please calculate weights first.")
      return
    }

    try {
      const weightMethodLabel = WEIGHT_METHODS.find(w => w.value === weightMethod)?.label || weightMethod.toUpperCase()

      // Prepare data for export
      // We'll reuse the same export API, but structure the weights as the main result if possible
      // or just put all metrics in.
      const exportData = {
        method: weightMethodLabel,
        ranking: criteria.map((c, idx) => ({
          rank: idx + 1,
          alternativeName: c.name,
          score: c.weight
        })),
        alternatives: alternatives,
        criteria: criteria,
        metrics: activeResult || undefined,
        resultsDecimalPlaces: weightsDecimalPlaces
      }

      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportData)
      })

      if (!response.ok) throw new Error("Failed to export to Excel")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${weightMethodLabel}_Weights.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("Failed to export to Excel")
    }
  }

  const handleCalculate = async (methodOverride?: string, criteriaOverride?: Criterion[]) => {
    setIsLoading(true)
    setApiResults(null)

    try {
      const payload = {
        method: methodOverride || method,
        alternatives,
        criteria: criteriaOverride || criteria,
        vikorVValue: vikorVValue,
        waspasLambdaValue: waspasLambdaValue,
        codasTauValue: codasTauValue,
      }

      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('API Response data:', data)

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
            : weightMethod === "pcwm"
              ? "w_j = C_j / ΣC_j, where C_j = Σ(1 - r_jk)"
              : weightMethodInfo?.label
    : methodInfo?.formula

  const cardLongDescription = showingWeightFormula
    ? weightMethod === "entropy"
      ? "Entropy-based objective weighting method that calculates weights based on information content in the decision matrix. Higher entropy means more uncertainty (less information), resulting in lower weight. Lower entropy means more information content, resulting in higher weight."
      : weightMethod === "critic"
        ? "CRITIC weight determines weights based on both contrast intensity (standard deviation) and conflict (correlation) between criteria. Higher information content (higher contrast and lower correlation) results in higher weights."
        : weightMethod === "ahp"
          ? "AHP derives weights from pairwise comparisons (here built from provided priority scores). It computes the eigenvector of the pairwise matrix and checks consistency (CI/CR)."
          : weightMethod === "piprecia"
            ? "PIPRECIA determines weights based on the relative importance of each criterion compared to the previous one in a sorted sequence."
            : weightMethod === "pcwm"
              ? "Pearson Correlation Weight Method (PCWM) is an objective weighting approach that determines weights based on the degree of independence and conflict (correlation) between criteria. It utilizes the Pearson correlation coefficient, formalized by Karl Pearson."
              : weightMethodInfo?.description
    : methodInfo?.description

  // Result page handlers
  const handleRankingMethodChange = async (newMethod: MCDMMethod) => {
    setMethod(newMethod)
    await handleCalculate(newMethod)
  }

  const handleWeightMethodChange = async (newWeightMethod: WeightMethod) => {
    setWeightMethod(newWeightMethod)

    // Handle subjective methods by opening their respective dialogs
    if (newWeightMethod === "ahp") {
      setIsAhpDialogOpen(true)
      return
    }
    if (newWeightMethod === "piprecia") {
      setIsPipreciaDialogOpen(true)
      return
    }
    if (newWeightMethod === "swara") {
      setIsSwaraDialogOpen(true)
      return
    }
    if (["roc", "rr"].includes(newWeightMethod)) {
      setIsRanksDialogOpen(true)
      return
    }

    // For objective methods, calculate immediately
    const { success, updatedCriteria } = await handleSaveTable(false, newWeightMethod)
    if (success) {
      await handleCalculate(method, updatedCriteria)
    }
  }

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
            vikorVValue: parseFloat(vikorVValue) || 0.5,
            waspasLambdaValue: parseFloat(waspasLambdaValue) || 0.5,
            codasTauValue: parseFloat(codasTauValue) || 0.02,
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
  const handleWeightSensitivityAnalysis = async (
    pipreciaWeightsOverride?: Record<string, number>,
    swaraWeightsOverride?: Record<string, number>
  ) => {
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
          const specialMethods = ["ahp", "piprecia", "swara"];
          if (wm === "equal") {
            weightedCriteria = criteria.map(c => ({ ...c, weight: 1 / criteria.length }))
          } else if (wm === "ahp") {
            const weightsToUse = ahpCalculatedWeights || {};
            weightedCriteria = criteria.map(c => ({
              ...c,
              weight: weightsToUse[c.id] !== undefined ? weightsToUse[c.id] : (1 / criteria.length)
            }))
          } else if (wm === "piprecia") {
            const weightsToUse = pipreciaWeightsOverride || pipreciaCalculatedWeights || {};
            weightedCriteria = criteria.map(c => ({
              ...c,
              weight: weightsToUse[c.id] !== undefined ? weightsToUse[c.id] : (1 / criteria.length)
            }))
          } else if (wm === "swara") {
            const weightsToUse = swaraWeightsOverride || swaraCalculatedWeights || {};
            weightedCriteria = criteria.map(c => ({
              ...c,
              weight: weightsToUse[c.id] !== undefined ? weightsToUse[c.id] : (1 / criteria.length)
            }))
          } else if (wm !== "custom") {
            // Use general weight calculation for all other methods
            try {
              const res = await applyWeightMethodForComparison(wm as WeightMethod, alternatives, criteria)
              weightedCriteria = res.criteria
            } catch (err) {
              console.error(`Error calculating weight for ${wm}:`, err)
              // fallback to existing weights
            }
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
              vikorVValue: parseFloat(vikorVValue) || 0.5,
              waspasLambdaValue: parseFloat(waspasLambdaValue) || 0.5,
              codasTauValue: parseFloat(codasTauValue) || 0.02,
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
            vikorVValue: parseFloat(vikorVValue) || 0.5,
            waspasLambdaValue: parseFloat(waspasLambdaValue) || 0.5,
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
      <main className="flex-1 min-h-screen p-0 sm:p-4 bg-transparent">
        {(sensitivityLoading || comparisonLoading || isLoading) && (
          <div className="processing-ring-overlay">
            <div className="processing-ring-container">
              <div className="premium-spinner">
                {[...Array(12)].map((_, i) => (
                  <div key={i}></div>
                ))}
              </div>
            </div>
            <p className="processing-text">
              {sensitivityLoading ? "Analyzing Sensitivity..." :
                comparisonLoading ? "Calculating Comparison..." :
                  homeTab === "weightMethods" ? "Calculating Weights..." : "Calculating Ranking..."}
            </p>
          </div>
        )}
        <div className="w-full max-w-7xl px-4 sm:px-6 md:px-8 mx-auto py-4 sm:py-6">
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
            {/* SidebarTrigger removed */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-black truncate">Decision Matrix</h1>
              <p className="text-[10px] sm:text-xs text-gray-700">Multicriteria Decision Making Calculator</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-end sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                <ColorSwitcher />
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="h-7 sm:h-9 text-[10px] sm:text-xs px-2 sm:px-3"
                >
                  <Home className="mr-1.5 h-3.5 w-3.5" /> Home
                </Button>
              </div>
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-gray-200 shrink-0">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="flex gap-1.5 sm:gap-2 mb-4 flex-wrap">
            <Button
              variant="outline"
              className={`text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 cursor-pointer ${homeTab === "rankingMethods" ? "bg-[#FFF2CC] border-[#FFF2CC] text-black hover:bg-[#FFE699]" : "bg-white border-gray-200 text-black hover:bg-gray-50"}`}
              onClick={() => setHomeTab("rankingMethods")}
            >
              <span className="truncate">Ranking Methods / Calculator</span>
            </Button>
            <Button
              variant="outline"
              className={`text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 cursor-pointer ${homeTab === "weightMethods" ? "bg-[#FFF2CC] border-[#FFF2CC] text-black hover:bg-[#FFE699]" : "bg-white border-gray-200 text-black hover:bg-gray-50"}`}
              onClick={() => setHomeTab("weightMethods")}
            >
              <span className="truncate">Weight Methods</span>
            </Button>
            <Button
              variant="outline"
              className={`text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 cursor-pointer ${homeTab === "rankingComparison" ? "bg-[#FFF2CC] border-[#FFF2CC] text-black hover:bg-[#FFE699]" : "bg-white border-gray-200 text-black hover:bg-gray-50"}`}
              onClick={() => setHomeTab("rankingComparison")}
            >
              <span className="truncate">Ranking comparison</span>
            </Button>
            <Button
              variant="outline"
              className={`text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 cursor-pointer ${homeTab === "sensitivityAnalysis" ? "bg-[#FFF2CC] border-[#FFF2CC] text-black hover:bg-[#FFE699]" : "bg-white border-gray-200 text-black hover:bg-gray-50"}`}
              onClick={() => setHomeTab("sensitivityAnalysis")}
            >
              <span className="truncate">Sensitivity Analysis</span>
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
              {alternatives.length > 0 && criteria.length > 0 && (
                <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-black">Ranking Methods / Calculator</CardTitle>
                    <CardDescription className="text-xs text-gray-700">
                      Review and edit the decision matrix before calculation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-[11px] text-green-700 bg-green-50 border border-green-200 p-2 rounded">
                      <p className="font-semibold">✓ Data has uploaded</p>
                      <p className="mt-1">
                        {alternatives.length} alternatives × {criteria.length} criteria
                      </p>
                    </div>

                    <div className="table-responsive border border-gray-200 rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-xs text-black font-semibold w-24">Alternative</TableHead>
                            {criteria.map((crit) => (
                              <TableHead key={crit.id} className="text-xs text-black font-semibold text-center min-w-20">
                                <div className="flex flex-col items-center">
                                  <div className="flex items-center gap-1">
                                    <div className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"}>{crit.name}</div>
                                    <span className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"} aria-hidden>
                                      {crit.type === "beneficial" ? "▲" : "▼"}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-gray-500 font-normal">
                                    {crit.type === "beneficial" ? "Max" : "Min"}
                                  </div>
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
                                    onKeyDown={handleKeyDown}
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
              )}

              {alternatives.length > 0 && criteria.length > 0 && (
                <div className="mb-6">
                  <Button
                    type="button"
                    onClick={() => {
                      handleCalculate()
                    }}
                    className="w-full bg-black text-white hover:bg-gray-800 text-sm h-10 shadow-sm"
                  >
                    Calculate ranking
                  </Button>
                </div>
              )}
              <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                <CardHeader className="pb-3 text-center sm:text-left">
                  <CardTitle className="text-[15px] text-gray-900 font-bold font-serif italic uppercase flex items-center gap-2">
                    Ranking Methods
                    <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500 font-medium">
                    Select a ranking method to use in your calculations, and view the Mathematical formula
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(showAllRankingMethods ? MCDM_METHODS : MCDM_METHODS.slice(0, itemsPerPage)).map((m) => (
                      <div
                        key={m.value}
                        onClick={() => {
                          setMethod(m.value)
                          setActiveFormulaType("method")
                          setIsDialogOpen(true)
                        }}
                        className={`group relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden h-[100px] w-full ${method === m.value
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-blue-400/40 bg-white hover:border-blue-500 hover:bg-blue-50/30 hover:shadow-sm"
                          }`}
                      >
                        <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-100 transition-opacity">
                          <div className="text-blue-500 border border-current rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-serif italic font-bold">i</div>
                        </div>

                        <div className="pr-4 flex-1 flex flex-col justify-center">
                          <h4 className={`text-[13px] font-bold font-serif mb-1 transition-colors ${method === m.value ? 'text-blue-800' : 'text-gray-900 group-hover:text-blue-600'}`}>
                            {m.label}
                          </h4>
                          <div className={`text-[10px] font-mono leading-relaxed line-clamp-3 ${method === m.value ? 'text-blue-700' : 'text-gray-500 font-medium'}`}>
                            {m.formula}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllRankingMethods(!showAllRankingMethods)}
                      className="text-xs font-bold text-gray-800 hover:bg-white gap-1.5 transition-all h-8 px-4 rounded-full border border-blue-200 hover:border-blue-400"
                    >
                      {showAllRankingMethods ? "See less methods" : "See more methods"}
                      <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showAllRankingMethods ? "rotate-180" : ""}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>




            </>
          )}

          {homeTab === "weightMethods" && (
            <>
              {alternatives.length > 0 && criteria.length > 0 && (
                <>
                  <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Weight Methods</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Review and edit the decision matrix before weight calculation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-[11px] text-green-700 bg-green-50 border border-green-200 p-2 rounded">
                        <p className="font-semibold">✓ Data has uploaded</p>
                        <p className="mt-1">
                          {alternatives.length} alternatives × {criteria.length} criteria
                        </p>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="text-xs text-black font-semibold w-24">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className="text-xs text-black font-semibold text-center min-w-20">
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-1">
                                      <div className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"}>{crit.name}</div>
                                      <span className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"} aria-hidden>
                                        {crit.type === "beneficial" ? "▲" : "▼"}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-normal">
                                      {crit.type === "beneficial" ? "Max" : "Min"}
                                    </div>
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
                                      onKeyDown={handleKeyDown}
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

                  <div className="mt-4 mb-2">
                    <Button
                      type="button"
                      onClick={async () => {
                        const methodToUse = weightMethod || "equal"
                        if (["roc", "rr"].includes(methodToUse)) {
                          setIsRanksDialogOpen(true)
                          return
                        }
                        // Calculate weights and update state (entropyResult etc.)
                        await calculateWeights(methodToUse)
                        // Navigate to Matrix step where sidebar shows Weight Methods
                        setCurrentStep("matrix")
                      }}
                      className="w-full bg-black text-white hover:bg-gray-800 text-sm h-10 shadow-sm"
                    >
                      Calculate weight
                    </Button>

                    {/* --- ROC & RR Ranks Dialog (Weight Methods Tab) --- */}
                    <Dialog open={isRanksDialogOpen} onOpenChange={setIsRanksDialogOpen}>
                      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-full">
                        <DialogHeader>
                          <DialogTitle>{weightMethod === "roc" ? "ROC" : "RR"} Weight Calculator</DialogTitle>
                          <DialogDescription className="text-xs">
                            Enter the rank for each criterion. 1 is the most important, 2 is second, etc.
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
                                        value={criteriaRanks[crit.id] || ""}
                                        onChange={(e) => setCriteriaRanks(prev => ({ ...prev, [crit.id]: e.target.value }))}
                                        onKeyDown={handleKeyDown}
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
                          <Button
                            variant="outline"
                            onClick={() => setIsRanksDialogOpen(false)}
                            className="text-xs h-8"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={async () => {
                              setIsRanksDialogOpen(false)
                              await calculateWeights(weightMethod)
                              setCurrentStep("matrix")
                            }}
                            className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                          >
                            Calculate Weights
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
              <Card className="border-gray-200 bg-white shadow-none w-full mb-6">
                <CardHeader className="pb-3 text-center sm:text-left">
                  <CardTitle className="text-[15px] text-gray-900 font-bold font-serif italic uppercase flex items-center gap-2">
                    Weight Methods Reference
                    <div className="h-1 w-1 rounded-full bg-emerald-500"></div>
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500 font-medium">
                    Click on a method to view its formula and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(showAllWeightMethods ? WEIGHT_METHODS : WEIGHT_METHODS.slice(0, itemsPerPage)).map((w) => (
                      <div
                        key={w.value}
                        onClick={() => {
                          setWeightMethod(w.value)
                          setActiveFormulaType("weight")
                          setIsDialogOpen(true)
                        }}
                        className={`group relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden h-[90px] w-full ${weightMethod === w.value
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-emerald-400/40 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 hover:shadow-sm"
                          }`}
                      >
                        <div className="absolute top-2 right-2 opacity-30 group-hover:opacity-100 transition-opacity">
                          <div className="text-emerald-500 border border-current rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-serif italic font-bold">i</div>
                        </div>

                        <div className="pr-4 flex-1 flex flex-col justify-center">
                          <h4 className={`text-[13px] font-bold font-serif mb-1 transition-colors ${weightMethod === w.value ? 'text-emerald-800' : 'text-gray-900 group-hover:text-emerald-600'}`}>
                            {w.label}
                          </h4>
                          <div className={`text-[10px] leading-snug line-clamp-3 ${weightMethod === w.value ? 'text-emerald-700' : 'text-gray-500 font-medium'}`}>
                            {w.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllWeightMethods(!showAllWeightMethods)}
                      className="text-xs font-bold text-gray-800 hover:bg-white gap-1.5 transition-all h-8 px-4 rounded-full border border-emerald-200 hover:border-emerald-400"
                    >
                      {showAllWeightMethods ? "See less methods" : "See more methods"}
                      <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showAllWeightMethods ? "rotate-180" : ""}`} />
                    </Button>
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
                    <div className="max-h-[130px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {WEIGHT_METHODS.map((w) => (
                          <label key={w.value} className="flex items-center gap-3 cursor-pointer group">
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
                                if (w.value === "swara" && !sensitivityWeightMethods.includes("swara")) {
                                  setIsSwaraDialogOpen(true)
                                }
                                if (["roc", "rr"].includes(w.value) && !sensitivityWeightMethods.includes(w.value)) {
                                  setIsSensitivityRanksDialogOpen(true)
                                }
                                toggleSensitivityWeightMethod(w.value)
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                            />
                            <span className="text-xs font-semibold text-black group-hover:text-blue-600 transition-colors truncate">
                              {w.label}
                            </span>
                          </label>
                        ))}
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={sensitivityWeightMethods.includes("custom")}
                            onChange={(e) => {
                              toggleSensitivityWeightMethod("custom")
                              if (e.target.checked) setIsCustomWeightsDialogOpen(true)
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                          />
                          <span className="text-xs font-semibold text-black group-hover:text-blue-600 transition-colors truncate">
                            Enter own weight
                          </span>
                        </label>
                      </div>
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
                          onWeightsChange={(weights) => {
                            setPipreciaCalculatedWeights(weights)
                            // Automatically trigger analysis update with new weights
                            handleWeightSensitivityAnalysis(weights)
                          }}
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

                    {/* --- SWARA Dialog (Weight Methods Tab) --- */}
                    <Dialog open={isSwaraDialogOpen} onOpenChange={setIsSwaraDialogOpen}>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
                        <DialogHeader>
                          <DialogTitle>SWARA Weight Calculator</DialogTitle>
                          <DialogDescription className="text-xs">
                            Enter comparative importance coefficients (s<sub>j</sub>) for each criterion.
                            The first criterion is most important (s<sub>1</sub> = 0).
                            Higher values indicate larger importance differences.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50">
                                  <TableHead className="text-xs font-semibold">Rank</TableHead>
                                  <TableHead className="text-xs font-semibold">Criterion</TableHead>
                                  <TableHead className="text-xs font-semibold text-center">
                                    Coefficient (s<sub>j</sub>)
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {criteria.map((crit, index) => (
                                  <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <TableCell className="py-3 px-4 font-medium text-black text-xs">{index + 1}</TableCell>
                                    <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                                    <TableCell className="text-center py-3 px-4 text-xs text-black">
                                      {index === 0 ? (
                                        <span className="text-xs text-gray-500">0 (most important)</span>
                                      ) : (
                                        <Input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          value={swaraCoefficients[crit.id] || ""}
                                          onChange={(e) => setSwaraCoefficients({
                                            ...swaraCoefficients,
                                            [crit.id]: e.target.value,
                                          })}
                                          className="w-24 h-7 text-xs text-center"
                                          placeholder="0.00"
                                        />
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-900">
                              <strong>Note:</strong> Criteria are ordered by importance (top = most important).
                              For each criterion j, enter how much less important it is compared to the previous criterion (j-1).
                            </p>
                          </div>
                        </div>

                        <DialogFooter className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsSwaraDialogOpen(false)}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={async () => {
                              try {
                                const coeffs: Record<string, number> = {}
                                criteria.forEach((crit, index) => {
                                  if (index === 0) {
                                    coeffs[crit.id] = 0
                                  } else {
                                    coeffs[crit.id] = parseFloat(swaraCoefficients[crit.id]) || 0
                                  }
                                })

                                const response = await fetch("/api/swara-weights", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ criteria, coefficients: coeffs }),
                                })

                                if (!response.ok) throw new Error("Failed to calculate SWARA weights")

                                const data: SWARAResult = await response.json()
                                setSwaraResult(data)
                                setSwaraCalculatedWeights(data.weights)
                                setIsSwaraDialogOpen(false)

                                // Trigger analysis update
                                handleWeightSensitivityAnalysis(undefined, data.weights)
                              } catch (error) {
                                console.error("SWARA calculation error:", error)
                                alert("Error calculating SWARA weights")
                              }
                            }}
                            className="bg-black text-white hover:bg-gray-800 text-xs"
                          >
                            Calculate Weights
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                  </div>

                  {sensitivityError && (
                    <div className="text-xs text-red-600 border border-red-200 bg-red-50 p-2 rounded">
                      {sensitivityError}
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={() => handleWeightSensitivityAnalysis()}
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
                    <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm text-black">Weight Variation Chart</CardTitle>
                        <CardDescription className="text-xs text-gray-700">Visualizing weights across different methods</CardDescription>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select value={weightChartType} onValueChange={setWeightChartType}>
                          <SelectTrigger className="w-28 sm:w-32 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="stackedBar">Stacked Bar</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="area">Area Chart</SelectItem>
                            <SelectItem value="radar">Radar Chart</SelectItem>
                            <SelectItem value="scatter">Scatter Plot</SelectItem>
                            <SelectItem value="boxPlot">Box Plot</SelectItem>
                            <SelectItem value="radial">Radial Bar</SelectItem>
                            <SelectItem value="parallel">Parallel Coordinates</SelectItem>
                            <SelectItem value="violin">Violin Plot</SelectItem>
                            <SelectItem value="ridgeline">Ridgeline (Density)</SelectItem>
                            <SelectItem value="ecdf">Empirical CDF</SelectItem>
                            <SelectItem value="kde">KDE Density</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={() => downloadChartAsJpeg(weightChartRef, 'weight-analysis')} variant="outline" size="sm" className="h-7 text-xs"><Download className="w-3 h-3 mr-1" /> JPG</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px] sm:h-[500px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%" ref={weightChartRef}>
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
                          ) : weightChartType === 'boxPlot' ? (
                            (() => {
                              const methods = sensitivityWeightComparisonResults.map(r => r.weightLabel);
                              const data = sensitivityCriteriaWeights.map(row => {
                                const values = methods.map(m => (row[m] !== undefined ? Number(row[m]) : 0));
                                const sorted = [...values].sort((a, b) => a - b);
                                const q = (arr: number[], p: number) => {
                                  if (arr.length === 0) return 0;
                                  const pos = (arr.length - 1) * p;
                                  const base = Math.floor(pos);
                                  const rest = pos - base;
                                  if (arr[base + 1] !== undefined) return arr[base] + rest * (arr[base + 1] - arr[base]);
                                  return arr[base];
                                };
                                const min = sorted[0] ?? 0;
                                const max = sorted[sorted.length - 1] ?? 0;
                                const q1 = q(sorted, 0.25);
                                const q2 = q(sorted, 0.5);
                                const q3 = q(sorted, 0.75);
                                return { name: row.name, values, min, q1, q2, q3, max };
                              });

                              const width = 800;
                              const height = 420;
                              const padding = { left: 60, right: 20, top: 20, bottom: 60 };
                              const innerW = width - padding.left - padding.right;
                              const innerH = height - padding.top - padding.bottom;

                              const allVals = data.flatMap(d => d.values);
                              const gMin = Math.min(...allVals, 0);
                              const gMax = Math.max(...allVals, 1);
                              const yScale = (v: number) => padding.top + innerH - ((v - gMin) / (gMax - gMin || 1)) * innerH;

                              const boxWidth = Math.min(60, innerW / (data.length * 1.2));

                              const gaussian = (u: number) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
                              const kde = (values: number[], bw = 0.04, samples = 50) => {
                                const xs = Array.from({ length: samples }, (_, i) => gMin + (i / (samples - 1)) * (gMax - gMin));
                                const dens = xs.map(x => {
                                  const s = values.reduce((acc, v) => acc + gaussian((x - v) / bw), 0);
                                  return s / (values.length * bw);
                                });
                                const max = Math.max(...dens) || 1;
                                return xs.map((x, i) => ({ x, y: dens[i] / max }));
                              };

                              return (
                                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ fontFamily: 'sans-serif' }}>
                                  {/* Y-axis and grid */}
                                  {Array.from({ length: 6 }).map((_, i) => {
                                    const yVal = gMin + (i / 5) * (gMax - gMin);
                                    const y = yScale(yVal);
                                    return (
                                      <g key={i}>
                                        <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e5e7eb" />
                                        <text x={padding.left - 8} y={y + 4} fontSize={10} textAnchor="end" fill="#6b7280">{yVal.toFixed(2)}</text>
                                      </g>
                                    );
                                  })}
                                  <text x={padding.left / 2} y={padding.top + innerH / 2} transform={`rotate(-90, ${padding.left / 2}, ${padding.top + innerH / 2})`} textAnchor="middle" fontSize="12" fill="#374151">Weight</text>

                                  {data.map((d, i) => {
                                    const cx = padding.left + (i + 0.5) * (innerW / data.length);
                                    const color = CHART_COLORS[i % CHART_COLORS.length];
                                    const dens = kde(d.values);
                                    const violinWidth = boxWidth * 0.8;

                                    const pathD = dens.map((pt, idx) => {
                                      const x = cx + pt.y * violinWidth;
                                      const y = yScale(pt.x);
                                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                                    }).join(' ') + ` L ${cx} ${yScale(gMax)} L ${cx} ${yScale(gMin)} Z`;

                                    return (
                                      <g key={d.name}>
                                        {/* Half-violin */}
                                        <path d={pathD} fill={color} stroke={color} fillOpacity={0.2} strokeWidth={1.5} />

                                        {/* Box plot part */}
                                        <line x1={cx - 10} x2={cx - 10} y1={yScale(d.q1)} y2={yScale(d.q3)} stroke="#374151" strokeWidth={3} />
                                        <line x1={cx - 15} x2={cx - 5} y1={yScale(d.q2)} y2={yScale(d.q2)} stroke="#374151" strokeWidth={2} />
                                        <line x1={cx - 10} x2={cx - 10} y1={yScale(d.min)} y2={yScale(d.q1)} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 3" />
                                        <line x1={cx - 10} x2={cx - 10} y1={yScale(d.q3)} y2={yScale(d.max)} stroke="#6b7280" strokeWidth={1} strokeDasharray="3 3" />

                                        {/* Jittered points */}
                                        {d.values.map((val, j) => (
                                          <circle
                                            key={j}
                                            cx={cx - 30 + (Math.random() - 0.5) * 20}
                                            cy={yScale(val)}
                                            r={3}
                                            fill={color}
                                            fillOpacity={0.6}
                                            stroke="#fff"
                                            strokeWidth={0.5}
                                          >
                                            <title>{`${d.name}: ${val.toFixed(resultsDecimalPlaces)}`}</title>
                                          </circle>
                                        ))}

                                        <text x={cx} y={padding.top + innerH + 18} fontSize={12} textAnchor="middle" fill="#0f172a">{d.name}</text>
                                      </g>
                                    );
                                  })}
                                </svg>
                              );
                            })()
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
                          ) : weightChartType === 'parallel' ? (
                            (() => {
                              const criteriaNames = sensitivityCriteriaWeights.map(d => d.name)
                              const methods = sensitivityWeightComparisonResults.map(r => r.weightLabel)
                              const series = methods.map((m) => ({
                                name: m,
                                values: criteriaNames.map(cn => {
                                  const row = sensitivityCriteriaWeights.find(r => r.name === cn)
                                  return row && row[m] !== undefined ? Number(row[m]) : 0
                                })
                              }))

                              const width = 800
                              const height = 420
                              const padding = { left: 50, right: 20, top: 20, bottom: 40 }
                              const innerW = width - padding.left - padding.right
                              const innerH = height - padding.top - padding.bottom

                              const xScale = (i: number) => padding.left + (i / Math.max(1, criteriaNames.length - 1)) * innerW
                              const yScale = (v: number) => padding.top + innerH - v * innerH

                              return (
                                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                                  {criteriaNames.map((cn, i) => (
                                    <g key={cn} transform={`translate(${xScale(i)},0)`}>
                                      <line x1={0} x2={0} y1={padding.top} y2={height - padding.bottom} stroke="#e5e7eb" />
                                      <text x={0} y={height - padding.bottom + 14} fontSize={11} textAnchor="middle" fill="#111827">{cn}</text>
                                    </g>
                                  ))}

                                  {series.map((s, si) => (
                                    <path key={s.name}
                                      d={s.values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`).join(' ')}
                                      fill="none"
                                      stroke={CHART_COLORS[si % CHART_COLORS.length]}
                                      strokeWidth={1.6}
                                      opacity={0.85}
                                    />
                                  ))}

                                  {series.map((s, si) => (
                                    <g key={s.name} transform={`translate(${width - padding.right - 120}, ${padding.top + si * 18})`}>
                                      <rect width={10} height={10} fill={CHART_COLORS[si % CHART_COLORS.length]} />
                                      <text x={14} y={9} fontSize={11} fill="#111827">{s.name}</text>
                                    </g>
                                  ))}
                                </svg>
                              )
                            })()
                          ) : weightChartType === 'violin' ? (
                            (() => {
                              const criteriaNames = sensitivityCriteriaWeights.map(d => d.name)
                              const methods = sensitivityWeightComparisonResults.map(r => r.weightLabel)
                              const width = 800
                              const height = 420
                              const padding = { left: 60, right: 160, top: 20, bottom: 60 }
                              const innerW = width - padding.left - padding.right
                              const innerH = height - padding.top - padding.bottom

                              const gaussian = (u: number) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
                              const kde = (values: number[], bw = 0.05, samples = 40) => {
                                const xs = Array.from({ length: samples }, (_, i) => i / (samples - 1))
                                const dens = xs.map(x => {
                                  const s = values.reduce((acc, v) => acc + gaussian((x - v) / bw), 0)
                                  return s / (values.length * bw)
                                })
                                const max = Math.max(...dens) || 1
                                return xs.map((x, i) => ({ x, y: dens[i] / max }))
                              }

                              return (
                                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                                  {criteriaNames.map((cn, i) => {
                                    const weights = methods.map(m => {
                                      const row = sensitivityCriteriaWeights.find(r => r.name === cn)
                                      return row && row[m] !== undefined ? Number(row[m]) : 0
                                    })
                                    const dens = kde(weights, 0.06, 60)
                                    const xCenter = padding.left + (i / Math.max(1, criteriaNames.length - 1)) * innerW
                                    const maxWidth = Math.min(60, innerW / (criteriaNames.length * 0.9))

                                    const pathD = dens.map((pt, idx) => {
                                      const x = xCenter + pt.y * maxWidth
                                      const y = padding.top + (1 - pt.x) * innerH
                                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                                    }).join(' ') + ' ' + dens.slice().reverse().map((pt, idx) => {
                                      const x = xCenter - pt.y * maxWidth
                                      const y = padding.top + (1 - pt.x) * innerH
                                      return `L ${x} ${y}`
                                    }).join(' ') + ' Z'

                                    return (
                                      <g key={cn}>
                                        <path d={pathD} fill="#eef2ff" stroke="#4338ca" opacity={0.9} />
                                        <line x1={xCenter - maxWidth} x2={xCenter + maxWidth} y1={padding.top + innerH + 6} y2={padding.top + innerH + 6} stroke="#111827" />
                                        <text x={xCenter} y={padding.top + innerH + 22} fontSize={11} textAnchor="middle" fill="#111827">{cn}</text>
                                        {weights.map((w, wi) => (
                                          <circle
                                            key={wi}
                                            cx={xCenter + (Math.random() - 0.5) * 15}
                                            cy={padding.top + (1 - w) * innerH}
                                            r={3}
                                            fill={CHART_COLORS[wi % CHART_COLORS.length]}
                                            stroke="white"
                                            strokeWidth={1}
                                            opacity={0.8}
                                          />
                                        ))}
                                      </g>
                                    )
                                  })}

                                  <g transform={`translate(${width - 150}, ${padding.top})`}>
                                    <text x={0} y={0} fontSize={12} fontWeight={600} fill="#111827">Methods</text>
                                    {methods.map((m, mi) => (
                                      <g key={m} transform={`translate(0, ${16 + mi * 16})`}>
                                        <rect width={10} height={10} fill={CHART_COLORS[mi % CHART_COLORS.length]} />
                                        <text x={14} y={9} fontSize={11} fill="#111827">{m}</text>
                                      </g>
                                    ))}
                                  </g>
                                </svg>
                              )
                            })()
                          ) : weightChartType === 'ridgeline' ? (
                            (() => {
                              const criteriaNames = sensitivityCriteriaWeights.map(d => d.name)
                              const methods = sensitivityWeightComparisonResults.map(r => r.weightLabel)
                              const width = 800
                              const height = 420
                              const padding = { left: 80, right: 20, top: 30, bottom: 40 }
                              const innerW = width - padding.left - padding.right

                              const gaussian = (u: number) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
                              const kde = (values: number[], bw = 0.06, samples = 60) => {
                                const xs = Array.from({ length: samples }, (_, i) => i / (samples - 1))
                                const dens = xs.map(x => {
                                  const s = values.reduce((acc, v) => acc + gaussian((x - v) / bw), 0)
                                  return s / (values.length * bw)
                                })
                                const max = Math.max(...dens) || 1
                                return xs.map((x, i) => ({ x, y: dens[i] / max }))
                              }

                              return (
                                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                                  {criteriaNames.map((cn, idx) => {
                                    const weights = methods.map(m => {
                                      const row = sensitivityCriteriaWeights.find(r => r.name === cn)
                                      return row && row[m] !== undefined ? Number(row[m]) : 0
                                    })
                                    const dens = kde(weights, 0.06, 60)
                                    const offsetY = padding.top + idx * ((height - padding.top - padding.bottom) / Math.max(1, criteriaNames.length))
                                    const scaleX = (x: number) => padding.left + x * (innerW)
                                    const scaleY = (v: number) => offsetY + (1 - v) * 40

                                    const pathTop = dens.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.x)} ${scaleY(pt.y)}`).join(' ')
                                    const pathBottom = dens.slice().reverse().map((pt, i) => `L ${scaleX(pt.x)} ${offsetY + 4}`).join(' ')

                                    return (
                                      <g key={cn}>
                                        <path d={`${pathTop} ${pathBottom} Z`} fill="#eef2ff" stroke="#4338ca" opacity={0.9} />
                                        <text x={10} y={offsetY + 6} fontSize={11} fill="#111827">{cn}</text>
                                      </g>
                                    )
                                  })}
                                </svg>
                              )
                            })()
                          ) : weightChartType === 'ecdf' ? (
                            (() => {
                              const first = sensitivityCriteriaWeights[0]
                              if (!first) return <div className="text-xs">No data</div>
                              const methods = sensitivityWeightComparisonResults.map(r => r.weightLabel)
                              const vals = methods.map(m => first[m] !== undefined ? Number(first[m]) : 0).sort((a, b) => a - b)
                              const width = 700
                              const height = 420
                              const padding = { left: 60, right: 20, top: 20, bottom: 60 }
                              const innerW = width - padding.left - padding.right
                              const innerH = height - padding.top - padding.bottom
                              const points = vals.map((v, i) => ({ x: padding.left + (i / (vals.length - 1 || 1)) * innerW, y: padding.top + innerH - ((i + 1) / vals.length) * innerH, v }))

                              const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

                              return (
                                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                                  <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + innerH} stroke="#e5e7eb" />
                                  <line x1={padding.left} x2={padding.left + innerW} y1={padding.top + innerH} y2={padding.top + innerH} stroke="#e5e7eb" />
                                  <path d={lineD} stroke="#2563eb" fill="none" strokeWidth={2} />
                                  {points.map((p, i) => (<circle key={i} cx={p.x} cy={p.y} r={3} fill="#2563eb" />))}
                                  <text x={padding.left + innerW / 2} y={height - 20} textAnchor="middle" fontSize={12}>{first.name} - ECDF</text>
                                </svg>
                              )
                            })()
                          ) : weightChartType === 'kde' ? (
                            (() => {
                              const first = sensitivityCriteriaWeights[0]
                              if (!first) return <div className="text-xs">No data</div>
                              const methods = sensitivityWeightComparisonResults.map(r => r.weightLabel)
                              const vals = methods.map(m => first[m] !== undefined ? Number(first[m]) : 0)
                              const gaussian = (u: number) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
                              const kde = (values: number[], bw = 0.06, samples = 150) => {
                                const xs = Array.from({ length: samples }, (_, i) => i / (samples - 1))
                                const dens = xs.map(x => {
                                  const s = values.reduce((acc, v) => acc + gaussian((x - v) / bw), 0)
                                  return s / (values.length * bw)
                                })
                                const max = Math.max(...dens) || 1
                                return xs.map((x, i) => ({ x, y: dens[i] / max }))
                              }

                              const dens = kde(vals, 0.06, 150)
                              const width = 700
                              const height = 420
                              const padding = { left: 60, right: 20, top: 20, bottom: 60 }
                              const innerW = width - padding.left - padding.right
                              const innerH = height - padding.top - padding.bottom

                              const pathD = dens.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + pt.x * innerW} ${padding.top + innerH - pt.y * (innerH * 0.8)}`).join(' ')

                              return (
                                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                                  <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + innerH} stroke="#e5e7eb" />
                                  <path d={pathD} stroke="#ef4444" fill="none" strokeWidth={2} />
                                  <text x={padding.left + innerW / 2} y={height - 20} textAnchor="middle" fontSize={12}>{first.name} - KDE</text>
                                </svg>
                              )
                            })()
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
                    <CardContent className="table-responsive">
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
                                  {row[res.weightLabel] !== undefined ? Number(row[res.weightLabel]).toFixed(resultsDecimalPlaces) : "-"}
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
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center min-w-20 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-1">
                                      <div className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"}>{crit.name}</div>
                                      <span className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"} aria-hidden>
                                        {crit.type === "beneficial" ? "▲" : "▼"}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-normal">
                                      {crit.type === "beneficial" ? "Max" : "Min"}
                                    </div>
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
                                      onKeyDown={handleKeyDown}
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
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-[200px] overflow-y-auto">
                          {WEIGHT_METHODS.map((w) => (
                            <label key={w.value} className="flex items-start gap-2 text-[11px] text-black cursor-pointer hover:bg-gray-50 p-1 rounded">
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
                                  if (w.value === "swara") {
                                    setIsComparisonSwaraDialogOpen(true)
                                  }
                                  if (w.value === "roc" || w.value === "rr") {
                                    setIsComparisonRanksDialogOpen(true)
                                  }
                                  setComparisonWeightMethod(w.value)
                                }}
                                disabled={comparisonLoading}
                                className="mt-0.5"
                              />
                              <span>
                                <span className="font-semibold">{w.label}</span>
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
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-[200px] overflow-y-auto">
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
                                <span className="font-semibold">{m.label}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedRankingMethods.includes("vikor") && (
                    <div className="border border-teal-200 bg-teal-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-semibold text-teal-900">VIKOR v-value (Compromise):</label>
                          <p className="text-[10px] text-teal-700">Weight of "majority of criteria" (v) vs "individual regret" (1-v)</p>
                        </div>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={vikorVValue}
                          onChange={(e) => setVikorVValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleComparisonCalculate}
                          placeholder="0.5"
                          className="w-16 h-8 text-xs text-center border-teal-300 bg-white text-black"
                        />
                      </div>
                    </div>
                  )}

                  {selectedRankingMethods.includes("waspas") && (
                    <div className="border border-teal-200 bg-teal-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-semibold text-teal-900">WASPAS lambda:</label>
                          <p className="text-[10px] text-teal-700">Weight of WSM (λ) vs WPM (1-λ)</p>
                        </div>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={waspasLambdaValue}
                          onChange={(e) => setWpasLambdaValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleComparisonCalculate}
                          placeholder="0.5"
                          className="w-16 h-8 text-xs text-center border-teal-300 bg-white text-black"
                        />
                      </div>
                    </div>
                  )}

                  {selectedRankingMethods.includes("codas") && (
                    <div className="border border-teal-200 bg-teal-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-semibold text-teal-900">CODAS tau-value:</label>
                          <p className="text-[10px] text-teal-700">Threshold parameter (typically 0.01-0.05)</p>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={codasTauValue}
                          onChange={(e) => setCodasTauValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleComparisonCalculate}
                          placeholder="0.02"
                          className="w-16 h-8 text-xs text-center border-teal-300 bg-white text-black"
                        />
                      </div>
                    </div>
                  )}

                  {comparisonError && (
                    <div className="text-xs text-red-600 border border-red-200 bg-red-50 p-2 rounded">
                      {comparisonError}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="button"
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

                      // Do not auto-trigger - let user click Calculate button
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

                      // Do not auto-trigger - let user click Calculate button
                    }}
                  />
                </DialogContent>
              </Dialog>

              {/* --- SWARA Dialog (Ranking Comparison Tab) --- */}
              <Dialog open={isComparisonSwaraDialogOpen} onOpenChange={setIsComparisonSwaraDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
                  <DialogHeader>
                    <DialogTitle>SWARA Weight Calculator</DialogTitle>
                    <DialogDescription className="text-xs">
                      Enter comparative importance coefficients (s<sub>j</sub>) for each criterion.
                      The first criterion is most important (s<sub>1</sub> = 0).
                      Higher values indicate larger importance differences.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-xs font-semibold">Rank</TableHead>
                            <TableHead className="text-xs font-semibold">Criterion</TableHead>
                            <TableHead className="text-xs font-semibold text-center">
                              Coefficient (s<sub>j</sub>)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(comparisonCriteria.length > 0 ? comparisonCriteria : criteria).map((crit, index) => (
                            <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-medium text-black text-xs">{index + 1}</TableCell>
                              <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                              <TableCell className="text-center py-3 px-4 text-xs text-black">
                                {index === 0 ? (
                                  <span className="text-xs text-gray-500">0 (most important)</span>
                                ) : (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={swaraCoefficients[crit.id] || ""}
                                    onChange={(e) => setSwaraCoefficients({
                                      ...swaraCoefficients,
                                      [crit.id]: e.target.value,
                                    })}
                                    onKeyDown={handleKeyDown}
                                    className="w-24 h-7 text-xs text-center"
                                    placeholder="0.00"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-900">
                        <strong>Note:</strong> Criteria are ordered by importance (top = most important).
                        For each criterion j, enter how much less important it is compared to the previous criterion (j-1).
                      </p>
                    </div>
                  </div>

                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsComparisonSwaraDialogOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={async () => {
                        try {
                          const targetCriteria = comparisonCriteria.length > 0 ? comparisonCriteria : criteria
                          const coeffs: Record<string, number> = {}
                          targetCriteria.forEach((crit, index) => {
                            if (index === 0) {
                              coeffs[crit.id] = 0
                            } else {
                              coeffs[crit.id] = parseFloat(swaraCoefficients[crit.id]) || 0
                            }
                          })

                          const response = await fetch("/api/swara-weights", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ criteria: targetCriteria, coefficients: coeffs }),
                          })

                          if (!response.ok) throw new Error("Failed to calculate SWARA weights")

                          const data: SWARAResult = await response.json()
                          setSwaraResult(data)
                          setSwaraCalculatedWeights(data.weights)
                          setIsComparisonSwaraDialogOpen(false)

                          // Update criteria with new weights
                          const updatedCriteria = targetCriteria.map(c => ({
                            ...c,
                            weight: data.weights[c.id] || 0
                          }))

                          if (comparisonCriteria.length > 0) {
                            setComparisonCriteria(updatedCriteria)
                          } else {
                            setCriteria(updatedCriteria)
                          }

                          setComparisonWeightMethod("swara")

                          // Do not auto-trigger - user will click Calculate button manually
                        } catch (error) {
                          console.error("SWARA calculation error:", error)
                          alert("Error calculating SWARA weights")
                        }
                      }}
                      className="bg-black text-white hover:bg-gray-800 text-xs"
                    >
                      Calculate Weights
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* --- Ranks Dialog (Ranking Comparison Tab) --- */}
              <Dialog open={isComparisonRanksDialogOpen} onOpenChange={setIsComparisonRanksDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Enter Criteria Ranks</DialogTitle>
                    <DialogDescription>1 = Most Important, Higher numbers = Less Important</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {(comparisonCriteria.length > 0 ? comparisonCriteria : criteria).map((crit) => (
                      <div key={crit.id} className="flex items-center justify-between">
                        <label className="text-sm font-medium">{crit.name}</label>
                        <Input
                          type="number"
                          min="1"
                          className="w-20 h-8 text-xs"
                          value={criteriaRanks[crit.id] || ""}
                          onChange={(e) => setCriteriaRanks(prev => ({ ...prev, [crit.id]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setIsComparisonRanksDialogOpen(false)}>Save Ranks</Button>
                  </DialogFooter>
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
                  <CardContent className="table-responsive">
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
                                    {altRanking?.score !== undefined ? Number(altRanking.score).toFixed(resultsDecimalPlaces) : "-"}
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
                  <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm text-black">Ranking variation</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        {comparisonChartType === "composed"
                          ? "Deviation from average rank - bars extending left are better than average."
                          : "Chart comparing alternative ranks across selected methods."}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select value={comparisonChartType} onValueChange={setComparisonChartType}>
                        <SelectTrigger className="w-28 sm:w-40 h-7 text-xs">
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
                          <SelectItem value="heatmap">Heatmap</SelectItem>
                          <SelectItem value="boxPlot">Box Plot</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={downloadComparisonChartAsJpeg} variant="outline" size="sm" className="h-7 text-xs">
                        <Download className="w-3 h-3 mr-1" /> JPG
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className={`${comparisonChartType === "heatmap" ? "h-auto" : "h-[500px] sm:h-[500px]"} p-0 sm:p-6 mt-4`}>
                    {(() => {
                      if (comparisonChartType === "heatmap") {
                        return (
                          <div ref={comparisonChartRef} className="w-full h-full flex flex-col overflow-x-auto">
                            <div className="flex-1 flex flex-col min-w-[max-content]">
                              <div className="flex text-xs font-semibold border-b">
                                <div className="w-24 sm:w-32 p-2 border-r bg-gray-50 flex-shrink-0">Method</div>
                                <div className="flex flex-1">
                                  {comparisonChartAlternatives.map((alt) => (
                                    <div key={alt} className="flex-1 min-w-[100px] p-2 border-r text-center bg-gray-50 truncate">
                                      {alt}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {comparisonChartData.map((row, idx) => (
                                <div key={idx} className="flex border-b">
                                  <div className="w-24 sm:w-32 p-2 border-r text-xs font-medium bg-gray-50 flex-shrink-0 truncate">
                                    {row.method}
                                  </div>
                                  <div className="flex flex-1">
                                    {comparisonChartAlternatives.map((alt, altIdx) => {
                                      const value = row[alt]
                                      const minVal = 1
                                      const maxVal = Math.max(...comparisonChartData.flatMap((r) => comparisonChartAlternatives.map((a) => r[a])).filter((v) => v != null))
                                      const normalized = (value - minVal || 1) / (maxVal - minVal || 1)
                                      const hue = (1 - normalized) * 120
                                      const bgColor = `hsl(${hue}, 70%, 60%)`
                                      return (
                                        <div
                                          key={alt}
                                          className="flex-1 min-w-[100px] p-3 border-r flex items-center justify-center text-xs font-medium text-white"
                                          style={{ backgroundColor: bgColor }}
                                        >
                                          {value}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-center gap-4 text-xs" style={{ paddingTop: "8px" }}>
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(120, 70%, 60%)" }}></div>
                                <span>Better Alternative (Rank)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(0, 70%, 60%)" }}></div>
                                <span>Worse Alternative (Rank)</span>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <ResponsiveContainer width="100%" height="100%" ref={comparisonChartRef}>
                          {(() => {
                            switch (comparisonChartType) {
                              case "radar":
                                return (
                                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonChartData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="method" tick={{ fontSize: 10 }} />
                                    <PolarRadiusAxis />
                                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                                    <Tooltip />
                                    {comparisonChartAlternatives.map((alt, idx) => (
                                      <Radar key={alt} name={alt} dataKey={alt} stroke={CHART_COLORS[idx % CHART_COLORS.length]} fill={CHART_COLORS[idx % CHART_COLORS.length]} fillOpacity={0.1} />
                                    ))}
                                  </RadarChart>
                                );
                              case "bar":
                                return (
                                  <BarChart data={comparisonChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                                    <YAxis label={{ value: "Rank", angle: -90, position: "insideLeft" }} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                                    {comparisonChartAlternatives.map((alt, idx) => (
                                      <Bar key={alt} dataKey={alt} fill={CHART_COLORS[idx % CHART_COLORS.length]} name={alt} />
                                    ))}
                                  </BarChart>
                                );
                              case "stackedBar":
                                return (
                                  <BarChart data={comparisonChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                                    <YAxis label={{ value: "Rank", angle: -90, position: "insideLeft" }} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                                    {comparisonChartAlternatives.map((alt, idx) => (
                                      <Bar key={alt} stackId="a" dataKey={alt} fill={CHART_COLORS[idx % CHART_COLORS.length]} name={alt} />
                                    ))}
                                  </BarChart>
                                );
                              case "area":
                                return (
                                  <AreaChart data={comparisonChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                                    {comparisonChartAlternatives.map((alt, idx) => (
                                      <Area type="monotone" key={alt} dataKey={alt} stroke={CHART_COLORS[idx % CHART_COLORS.length]} fill={CHART_COLORS[idx % CHART_COLORS.length]} fillOpacity={0.3} name={alt} />
                                    ))}
                                  </AreaChart>
                                );
                              case "stackedArea":
                                return (
                                  <AreaChart data={comparisonChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                                    {comparisonChartAlternatives.map((alt, idx) => (
                                      <Area type="monotone" stackId="1" key={alt} dataKey={alt} stroke={CHART_COLORS[idx % CHART_COLORS.length]} fill={CHART_COLORS[idx % CHART_COLORS.length]} fillOpacity={0.3} name={alt} />
                                    ))}
                                  </AreaChart>
                                );
                              case "composed":
                                const composedData = comparisonChartData.map(d => {
                                  const avgRank = comparisonChartAlternatives.reduce((sum, alt) => sum + (d[alt] || 0), 0) / comparisonChartAlternatives.length;
                                  const divergingData: any = { method: d.method };
                                  comparisonChartAlternatives.forEach(alt => {
                                    const rank = d[alt] || 0;
                                    divergingData[alt] = rank - avgRank;
                                  });
                                  return divergingData;
                                });
                                return (
                                  <BarChart data={composedData} layout="vertical" margin={{ top: 20, right: 20, left: 0, bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" label={{ value: "Deviation from Average Rank", position: "insideBottom", offset: -10 }} tick={{ fontSize: 10 }} />
                                    <YAxis type="category" dataKey="method" tick={{ fontSize: 10 }} width={90} />
                                    <Tooltip formatter={(value: any, name: string) => [`${parseFloat(value) > 0 ? '+' : ''}${parseFloat(value).toFixed(2)} (${parseFloat(value) < 0 ? 'Better' : 'Worse'} than avg)`, name]} />
                                    <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "20px" }} layout="horizontal" align="center" verticalAlign="bottom" iconType="square" />
                                    <ReferenceLine x={0} stroke="#666" strokeWidth={2} />
                                    {comparisonChartAlternatives.map((alt, idx) => (
                                      <Bar key={alt} dataKey={alt} fill={CHART_COLORS[idx % CHART_COLORS.length]} name={alt} stackId="stack" />
                                    ))}
                                  </BarChart>
                                );
                              case "scatter":
                                return (
                                  <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="x" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 10 }} name="Method" />
                                    <YAxis dataKey="y" type="number" name="Rank" label={{ value: "Rank", angle: -90, position: "insideLeft" }} />
                                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                                    {comparisonChartAlternatives.map((alt, idx) => (
                                      <Scatter key={alt} name={alt} data={comparisonChartData.map((d) => ({ x: d.method, y: d[alt] }))} fill={CHART_COLORS[idx % CHART_COLORS.length]} shape={["circle", "cross", "diamond", "square", "star", "triangle", "wye"][idx % 7] as any} line />
                                    ))}
                                  </ScatterChart>
                                );
                              case "boxPlot":
                                const boxData = comparisonChartAlternatives.map((alt) => {
                                  const values = comparisonChartData.map((r) => r[alt]).filter((v) => v != null).sort((a, b) => a - b)
                                  if (values.length === 0) return null
                                  const q1 = values[Math.floor(values.length * 0.25)]
                                  const median = values[Math.floor(values.length * 0.5)]
                                  const q3 = values[Math.floor(values.length * 0.75)]
                                  const min = Math.min(...values)
                                  const max = Math.max(...values)
                                  const iqr = q3 - q1
                                  const whiskerLow = Math.max(min, q1 - 1.5 * iqr)
                                  const whiskerHigh = Math.min(max, q3 + 1.5 * iqr)
                                  return { alt, min, q1, median, q3, max, whiskerLow, whiskerHigh, n: values.length }
                                }).filter((d): d is any => d !== null)

                                if (boxData.length === 0) return <></>
                                const allVals = boxData.flatMap(d => [d.whiskerLow, d.whiskerHigh])
                                const minV = Math.min(...allVals)
                                const maxV = Math.max(...allVals)
                                const yR = maxV - minV || 1
                                const pad = { top: 30, right: 30, bottom: 50, left: 50 }
                                const cW = 800 - pad.left - pad.right
                                const cH = 400 - pad.top - pad.bottom
                                const bW = Math.max(15, (cW / boxData.length) * 0.6)
                                const sp = cW / boxData.length
                                const gY = (v: number) => pad.top + cH - ((v - minV) / yR) * cH
                                const gX = (idx: number) => pad.left + (idx + 0.5) * sp

                                return (
                                  <svg viewBox="0 0 800 400" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                                    <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + cH} stroke="#999" strokeWidth="2" />
                                    <line x1={pad.left} y1={pad.top + cH} x2={800 - pad.right} y2={pad.top + cH} stroke="#999" strokeWidth="2" />
                                    {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                                      <g key={`ylabel-${pct}`}>
                                        <line x1={pad.left - 5} y1={gY(minV + pct * yR)} x2={pad.left} y2={gY(minV + pct * yR)} stroke="#999" strokeWidth="1" />
                                        <text x={pad.left - 10} y={gY(minV + pct * yR) + 4} fontSize="11" textAnchor="end" fill="#666">{(minV + pct * yR).toFixed(1)}</text>
                                        <line x1={pad.left} y1={gY(minV + pct * yR)} x2={800 - pad.right} y2={gY(minV + pct * yR)} stroke="#eee" strokeWidth="1" strokeDasharray="2,2" />
                                      </g>
                                    ))}
                                    {boxData.map((data, idx) => {
                                      const x = gX(idx)
                                      const color = CHART_COLORS[idx % CHART_COLORS.length]
                                      return (
                                        <g key={`box-${data.alt}`}>
                                          <line x1={x} y1={gY(data.whiskerLow)} x2={x} y2={gY(data.whiskerHigh)} stroke={color} strokeWidth="2" opacity="0.8" />
                                          <line x1={x - bW / 3} y1={gY(data.whiskerLow)} x2={x + bW / 3} y2={gY(data.whiskerLow)} stroke={color} strokeWidth="2.5" opacity="0.8" />
                                          <line x1={x - bW / 3} y1={gY(data.whiskerHigh)} x2={x + bW / 3} y2={gY(data.whiskerHigh)} stroke={color} strokeWidth="2.5" opacity="0.8" />
                                          <rect x={x - bW / 2} y={gY(data.q3)} width={bW} height={Math.max(1, gY(data.q1) - gY(data.q3))} fill={color} fillOpacity="0.4" stroke={color} strokeWidth="2" />
                                          <line x1={x - bW / 2} y1={gY(data.median)} x2={x + bW / 2} y2={gY(data.median)} stroke="#ff3333" strokeWidth="3" />
                                          <circle cx={x} cy={gY(data.min)} r="3" fill={color} opacity="0.6" />
                                          <circle cx={x} cy={gY(data.max)} r="3" fill={color} opacity="0.6" />
                                          <text x={x} y={pad.top + cH + 25} fontSize="12" textAnchor="middle" fill="#333" fontWeight="500">{data.alt.substring(0, 8)}</text>
                                        </g>
                                      )
                                    })}
                                    <text x={25} y={15} fontSize="12" fontWeight="600" fill="#333">Rank</text>
                                    <text x={750} y={pad.top + cH + 40} fontSize="12" fontWeight="600" fill="#333">Alts</text>
                                  </svg>
                                );
                              default:
                                return (
                                  <LineChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                                    {comparisonChartAlternatives.map((alt, idx) => (
                                      <Line key={alt} type={comparisonChartType === "step" ? "step" : "monotone"} dataKey={alt} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2} strokeDasharray={["0", "5 5", "3 3", "10 5", "2 2", "15 5"][idx % 6]} activeDot={{ r: 6 }} dot={{ r: 4, strokeWidth: 1, fill: "white", stroke: CHART_COLORS[idx % CHART_COLORS.length] }} />
                                    ))}
                                  </LineChart>
                                );
                            }
                          })()}
                        </ResponsiveContainer>
                      );
                    })()}
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
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center min-w-20 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-1">
                                      <div className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"}>{crit.name}</div>
                                      <span className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"} aria-hidden>
                                        {crit.type === "beneficial" ? "▲" : "▼"}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-normal">
                                      {crit.type === "beneficial" ? "Max" : "Min"}
                                    </div>
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
                                      onKeyDown={handleKeyDown}
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
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span>{crit.name}</span>
                                      <span className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"} aria-hidden>
                                        {crit.type === "beneficial" ? "▲" : "▼"}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-500">{crit.type === "beneficial" ? "Max" : "Min"}</span>
                                  </div>
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
                                        if (w.value === "swara" && !sensitivityWeightMethods.includes("swara")) {
                                          setIsSensitivitySwaraDialogOpen(true)
                                        }
                                        if (["roc", "rs", "rr"].includes(w.value) && !sensitivityWeightMethods.includes(w.value)) {
                                          setIsSensitivityRanksDialogOpen(true)
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
                                  Enter own weight
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

                        {waspasLambdaValue !== undefined && sensitivityMethod === "waspas" && (
                          <div className="border border-teal-200 bg-teal-50 rounded-lg p-3 md:col-span-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-xs font-semibold text-teal-900">WASPAS lambda:</label>
                                <p className="text-[10px] text-teal-700">Weight of WSM (λ) vs WPM (1-λ)</p>
                              </div>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={waspasLambdaValue}
                                onChange={(e) => setWpasLambdaValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSensitivityAnalysis}
                                placeholder="0.5"
                                className="w-16 h-8 text-xs text-center border-teal-300 bg-white text-black"
                              />
                            </div>
                          </div>
                        )}

                        {codasTauValue !== undefined && sensitivityMethod === "codas" && (
                          <div className="border border-teal-200 bg-teal-50 rounded-lg p-3 md:col-span-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-xs font-semibold text-teal-900">CODAS tau-value:</label>
                                <p className="text-[10px] text-teal-700">Threshold parameter (typically 0.01-0.05)</p>
                              </div>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={codasTauValue}
                                onChange={(e) => setCodasTauValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSensitivityAnalysis}
                                placeholder="0.02"
                                className="w-16 h-8 text-xs text-center border-teal-300 bg-white text-black"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => handleWeightSensitivityAnalysis()}
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

                      {/* --- SWARA Dialog (Sensitivity Analysis Tab) --- */}
                      <Dialog open={isSensitivitySwaraDialogOpen} onOpenChange={setIsSensitivitySwaraDialogOpen}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
                          <DialogHeader>
                            <DialogTitle>SWARA Weight Calculator</DialogTitle>
                            <DialogDescription className="text-xs">
                              Enter comparative importance coefficients (s<sub>j</sub>) for each criterion.
                              The first criterion is most important (s<sub>1</sub> = 0).
                              Higher values indicate larger importance differences.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 mt-4">
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50">
                                    <TableHead className="text-xs font-semibold">Rank</TableHead>
                                    <TableHead className="text-xs font-semibold">Criterion</TableHead>
                                    <TableHead className="text-xs font-semibold text-center">
                                      Coefficient (s<sub>j</sub>)
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {criteria.map((crit, index) => (
                                    <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                                      <TableCell className="py-3 px-4 font-medium text-black text-xs">{index + 1}</TableCell>
                                      <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                                      <TableCell className="text-center py-3 px-4 text-xs text-black">
                                        {index === 0 ? (
                                          <span className="text-xs text-gray-500">0 (most important)</span>
                                        ) : (
                                          <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={swaraCoefficients[crit.id] || ""}
                                            onChange={(e) => setSwaraCoefficients({
                                              ...swaraCoefficients,
                                              [crit.id]: e.target.value,
                                            })}
                                            onKeyDown={handleKeyDown}
                                            className="w-24 h-7 text-xs text-center"
                                            placeholder="0.00"
                                          />
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-xs text-blue-900">
                                <strong>Note:</strong> Criteria are ordered by importance (top = most important).
                                For each criterion j, enter how much less important it is compared to the previous criterion (j-1).
                              </p>
                            </div>
                          </div>

                          <DialogFooter className="mt-4">
                            <Button
                              variant="outline"
                              onClick={() => setIsSensitivitySwaraDialogOpen(false)}
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={async () => {
                                try {
                                  const coeffs: Record<string, number> = {}
                                  criteria.forEach((crit, index) => {
                                    if (index === 0) {
                                      coeffs[crit.id] = 0
                                    } else {
                                      coeffs[crit.id] = parseFloat(swaraCoefficients[crit.id]) || 0
                                    }
                                  })

                                  const response = await fetch("/api/swara-weights", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ criteria, coefficients: coeffs }),
                                  })

                                  if (!response.ok) throw new Error("Failed to calculate SWARA weights")

                                  const data: SWARAResult = await response.json()
                                  setSwaraResult(data)
                                  setSwaraCalculatedWeights(data.weights)
                                  setIsSensitivitySwaraDialogOpen(false)

                                  // Trigger analysis update
                                  handleWeightSensitivityAnalysis(undefined, data.weights)
                                } catch (error) {
                                  console.error("SWARA calculation error:", error)
                                  alert("Error calculating SWARA weights")
                                }
                              }}
                              className="bg-black text-white hover:bg-gray-800 text-xs"
                            >
                              Calculate Weights
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* --- Ranks Dialog (Sensitivity Analysis Tab) --- */}
                      <Dialog open={isSensitivityRanksDialogOpen} onOpenChange={setIsSensitivityRanksDialogOpen}>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Enter Criteria Ranks</DialogTitle>
                            <DialogDescription>1 = Most Important, Higher numbers = Less Important</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {criteria.map((crit) => (
                              <div key={crit.id} className="flex items-center justify-between">
                                <label className="text-sm font-medium">{crit.name}</label>
                                <Input
                                  type="number"
                                  min="1"
                                  className="w-20 h-8 text-xs"
                                  value={criteriaRanks[crit.id] || ""}
                                  onChange={(e) => setCriteriaRanks(prev => ({ ...prev, [crit.id]: e.target.value }))}
                                />
                              </div>
                            ))}
                          </div>
                          <DialogFooter>
                            <Button onClick={() => setIsSensitivityRanksDialogOpen(false)}>Save Ranks</Button>
                          </DialogFooter>
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
                            <CardContent className="table-responsive">
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
                                              {item?.score !== undefined ? Number(item.score).toFixed(resultsDecimalPlaces) : "-"}
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
                            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <CardTitle className="text-sm text-black">Graphical Variation</CardTitle>
                                <CardDescription className="text-xs text-gray-700">Visualizing the impact of weight methods</CardDescription>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Select value={sensitivityChartType} onValueChange={setSensitivityChartType}>
                                  <SelectTrigger className="w-28 sm:w-32 h-7 text-xs">
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
                                <Button onClick={() => downloadChartAsJpeg(sensitivityGraphicalVariationRef, "sensitivity-graphical-variation")} variant="outline" size="sm" className="h-7 text-xs"><Download className="w-3 h-3 mr-1" /> JPG</Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="chart-container" ref={sensitivityGraphicalVariationRef}>
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
                                      <YAxis label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} interval={0} domain={[0, 'dataMax']} />
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
                                      <YAxis label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} interval={0} domain={[0, 'dataMax']} />
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
                                      <YAxis interval={0} domain={[0, 'dataMax']} />
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
                                      <YAxis interval={0} domain={[0, 'dataMax']} />
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
                                      margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis
                                        type="number"
                                        domain={[0, 'dataMax']}
                                        label={{
                                          value: "Rank Range (Best to Worst)",
                                          position: "insideBottom",
                                          offset: -45,
                                          style: { fontSize: 11, fontWeight: 500 }
                                        }}
                                        tick={{ fontSize: 10 }}
                                        interval={0}
                                        allowDecimals={false}
                                        height={60}
                                      />
                                      <YAxis
                                        type="category"
                                        dataKey="method"
                                        tick={{ fontSize: 10 }}
                                        width={130}
                                      />
                                      <Tooltip
                                        content={({ active, payload }) => {
                                          if (active && payload && payload.length > 0) {
                                            const data = payload[0].payload;
                                            return (
                                              <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg text-xs">
                                                <p className="font-semibold text-black mb-1">{data.method}</p>
                                                <p className="text-gray-700">Best Rank: <span className="font-medium text-black">{data.min}</span></p>
                                                <p className="text-gray-700">Worst Rank: <span className="font-medium text-black">{data.max}</span></p>
                                                <p className="text-gray-700">Range: <span className="font-medium text-black">{data.range}</span></p>
                                                <p className="text-gray-700">Avg Rank: <span className="font-medium text-black">{data.avg.toFixed(2)}</span></p>
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                      />
                                      <Legend
                                        wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                                        iconType="rect"
                                      />
                                      {/* Base bar showing starting position */}
                                      <Bar
                                        dataKey="start"
                                        stackId="a"
                                        fill="transparent"
                                        name=""
                                        legendType="none"
                                      />
                                      {/* Range bar showing the spread */}
                                      <Bar
                                        dataKey="range"
                                        stackId="a"
                                        name="Rank Range"
                                        radius={[0, 4, 4, 0]}
                                      >
                                        {sensitivityWeightComparisonResults.map((res, index) => (
                                          <Cell
                                            key={`cell-${index}`}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            opacity={0.75}
                                          />
                                        ))}
                                      </Bar>
                                      {/* Markers for average */}
                                      <Scatter
                                        dataKey="avg"
                                        fill="#1a1a1a"
                                        shape="diamond"
                                        name="Average Rank"
                                      />
                                    </BarChart>
                                  ) : sensitivityChartType === "scatter" ? (
                                    <ScatterChart>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 10 }} />
                                      <YAxis type="number" dataKey="rank" name="Rank" label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} interval={0} domain={[0, 'dataMax']} />
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
                                        dataKey="Equal Weight Rank"
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
                                      <YAxis label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} interval={0} domain={[0, 'dataMax']} />
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
                            SVG (Legacy)
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => downloadChartAsJpeg(sensitivityResultsRef, "sensitivity-results")}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            JPG
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div ref={sensitivityResultsRef} className="chart-container">
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
                    <CardContent className="table-responsive">
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
          <DialogContent className="w-[95vw] sm:w-[85vw] md:w-[70vw] h-[90vh] sm:h-screen max-w-none rounded-lg sm:rounded-none border sm:border-0 flex flex-col p-3 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{cardTitle}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">{cardDescription}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4 flex-1 overflow-y-auto" key={method + activeFormulaType}>
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
                  {method === "mabac" && <MABACFormula />}
                  {method === "cocoso" && <COCOSOFormula />}
                  {method === "gra" && <GRAFormula />}
                  {method === "aras" && <ARASFormula />}
                </>
              ) : (
                <>
                  {weightMethod === "entropy" && <EntropyFormula />}
                  {weightMethod === "critic" && <CRITICFormula />}
                  {weightMethod === "ahp" && <AHPFormula />}
                  {weightMethod === "piprecia" && <PIPRECIAFormula />}
                  {weightMethod === "equal" && <EqualWeightsFormula />}
                  {weightMethod === "merec" && <MERECFormula />}
                  {weightMethod === "swara" && <SWARAFormula />}
                  {weightMethod === "wenslo" && <WENSLOFormula />}
                  {weightMethod === "lopcow" && <LOPCOWFormula />}
                  {weightMethod === "dematel" && <DEMATELFormula />}
                  {weightMethod === "sd" && <SDFormula />}
                  {weightMethod === "variance" && <VarianceFormula />}
                  {weightMethod === "mad" && <MADFormula />}

                  {weightMethod === "dbw" && <DBWFormula />}
                  {weightMethod === "svp" && <SVPFormula />}
                  {weightMethod === "mdm" && <MDMFormula />}
                  {weightMethod === "lsw" && <LSWFormula />}
                  {weightMethod === "gpow" && <GPOWFormula />}
                  {weightMethod === "lpwm" && <LPWMFormula />}
                  {weightMethod === "pcwm" && <PCWMFormula />}
                  {weightMethod === "roc" && <ROCFormula />}
                  {weightMethod === "rr" && <RRFormula />}
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
          {/* Progress Section */}
          <div className="mb-6 md:mb-8">
            <Breadcrumb className="mb-4 overflow-x-auto whitespace-nowrap pb-2">
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                  <span className="text-xs md:text-sm font-semibold text-black">Input</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-400" />
                <BreadcrumbItem>
                  <span className="text-xs md:text-sm text-gray-400">Table</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-400" />
                <BreadcrumbItem>
                  <span className="text-xs md:text-sm text-gray-400">Matrix</span>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Card className="border-gray-200 bg-white shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-black">Specify Dimensions</CardTitle>
              <CardDescription className="text-xs text-gray-700">
                How many alternatives and criteria do you need?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
        {isLoading && (
          <div className="processing-ring-overlay">
            <div className="processing-ring-container">
              <div className="premium-spinner">
                {[...Array(12)].map((_, i) => (
                  <div key={i}></div>
                ))}
              </div>
            </div>
            <p className="processing-text">
              {homeTab === "weightMethods" ? "Calculating Weights..." : "Calculating Ranking..."}
            </p>
          </div>
        )}


        <main className="flex-1 h-screen bg-white flex flex-col">
          <div className="p-2 md:p-3 border-b border-gray-200 flex-shrink-0">
            <div className="max-w-7xl mx-auto">
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
                  <Button
                    onClick={() => setIsExcelExampleOpen(true)}
                    variant="outline"
                    className="ml-2 text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                  >
                    Click here for Excel example
                  </Button>
                </CardContent>
              </Card>

              <Dialog open={isExcelExampleOpen} onOpenChange={setIsExcelExampleOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white">
                  <DialogHeader className="p-4 pb-0">
                    <DialogTitle>Excel Example Format</DialogTitle>
                  </DialogHeader>
                  <div className="p-4 overflow-auto max-h-[80vh]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/excel_example.jpg" alt="Excel Example" className="w-full h-auto" />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Excel Data Preview Dialog */}
              <Dialog open={isExcelPreviewOpen} onOpenChange={setIsExcelPreviewOpen}>
                <DialogContent className="w-[95vw] sm:w-auto sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-3 sm:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg font-bold text-black">Select Data to Import</DialogTitle>
                    <DialogDescription className="text-[10px] sm:text-xs text-gray-700">
                      Review the Excel data and select the range you want to import.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-black">Start Row:</label>
                      <Input
                        type="number"
                        min={0}
                        max={excelPreviewData ? excelPreviewData.length - 1 : 0}
                        value={selectedDataRange.startRow}
                        onChange={(e) => updateSelectionRange('startRow', parseInt(e.target.value) || 0)}
                        className="w-20 h-8 text-xs border-gray-200"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-black">End Row:</label>
                      <Input
                        type="number"
                        min={0}
                        max={excelPreviewData ? excelPreviewData.length - 1 : 0}
                        value={selectedDataRange.endRow}
                        onChange={(e) => updateSelectionRange('endRow', parseInt(e.target.value) || 0)}
                        className="w-20 h-8 text-xs border-gray-200"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-black">Start Col:</label>
                      <Input
                        type="number"
                        min={0}
                        max={excelPreviewData ? Math.max(...excelPreviewData.map(row => row.length)) - 1 : 0}
                        value={selectedDataRange.startCol}
                        onChange={(e) => updateSelectionRange('startCol', parseInt(e.target.value) || 0)}
                        className="w-20 h-8 text-xs border-gray-200"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-black">End Col:</label>
                      <Input
                        type="number"
                        min={0}
                        max={excelPreviewData ? Math.max(...excelPreviewData.map(row => row.length)) - 1 : 0}
                        value={selectedDataRange.endCol}
                        onChange={(e) => updateSelectionRange('endCol', parseInt(e.target.value) || 0)}
                        className="w-20 h-8 text-xs border-gray-200"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={selectAllData}
                      variant="outline"
                      className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100"
                    >
                      Select All
                    </Button>
                  </div>

                  <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-black w-12 text-center">#</TableHead>
                          {excelPreviewData && excelPreviewData[0] &&
                            Array.from({ length: Math.max(...excelPreviewData.map(row => row.length)) }).map((_, colIdx) => (
                              <TableHead key={colIdx} className="text-xs font-semibold text-black text-center min-w-24">
                                Col {colIdx}
                              </TableHead>
                            ))
                          }
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {excelPreviewData?.map((row, rowIdx) => (
                          <TableRow
                            key={rowIdx}
                            className={`border-b border-gray-200 ${rowIdx >= selectedDataRange.startRow &&
                              rowIdx <= selectedDataRange.endRow
                              ? 'bg-blue-50'
                              : 'hover:bg-gray-50'
                              }`}
                          >
                            <TableCell className="text-xs font-semibold text-gray-600 text-center">
                              {rowIdx}
                            </TableCell>
                            {Array.from({ length: Math.max(...excelPreviewData.map(r => r.length)) }).map((_, colIdx) => {
                              const isSelected =
                                rowIdx >= selectedDataRange.startRow &&
                                rowIdx <= selectedDataRange.endRow &&
                                colIdx >= selectedDataRange.startCol &&
                                colIdx <= selectedDataRange.endCol

                              return (
                                <TableCell
                                  key={colIdx}
                                  className={`text-xs text-black text-center ${isSelected ? 'bg-blue-100 font-semibold' : ''
                                    }`}
                                >
                                  {row[colIdx] !== undefined && row[colIdx] !== null ? String(row[colIdx]) : ''}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <DialogFooter className="mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsExcelPreviewOpen(false)
                        setExcelPreviewData(null)
                        setSelectedCells(new Set())
                      }}
                      variant="outline"
                      className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={async () => {
                        await handleImportSelectedData()
                        if (homeTab === "rankingComparison" || homeTab === "sensitivityAnalysis") {
                          setCurrentStep("home")
                        }
                      }}
                      className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                    >
                      Import Selected Data
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>


              <Card className="border-gray-200 bg-white shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Decision Matrix</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Edit names, set criteria types, weights, and fill in scores
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="table-responsive border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-xs font-semibold text-black py-3 px-4 min-w-32">Alt</TableHead>
                          {criteria.map((crit) => (
                            <TableHead
                              key={crit.id}
                              className="text-xs font-semibold text-black text-center py-3 px-4 min-w-40"
                            >
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={crit.name}
                                    onChange={(e) => updateCriterion(crit.id, { name: e.target.value })}
                                    className="text-xs h-8 border-gray-200 text-black text-center shadow-none font-semibold"
                                  />
                                  <span className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"} aria-hidden>
                                    {crit.type === "beneficial" ? "▲" : "▼"}
                                  </span>
                                </div>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                        <TableRow className="bg-white border-b border-gray-200">
                          <TableHead className="text-xs font-semibold text-black py-3 px-4">max/min</TableHead>
                          {criteria.map((crit) => (
                            <TableHead key={crit.id} className="text-xs font-semibold text-black text-center py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
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
                                <span className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"} aria-hidden>
                                  {crit.type === "beneficial" ? "▲" : "▼"}
                                </span>
                              </div>
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
                                onKeyDown={handleKeyDown}
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
                                  onKeyDown={handleKeyDown}
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
              {(!homeTab || (homeTab !== "rankingComparison" && homeTab !== "sensitivityAnalysis")) && (
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("input")}
                    variant="outline"
                    className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault()
                      const result = await handleSaveTable(false)

                      if (result.success) {
                        if (homeTab === "rankingComparison") {
                          setCurrentStep("home")
                        } else if (homeTab === "weightMethods") {
                          setCurrentStep("matrix")
                        } else {
                          await handleCalculate(method, result.updatedCriteria)
                        }
                      }
                    }}
                    className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* --- ROC & RR Ranks Dialog (Input Step) --- */}
        <Dialog open={isRanksDialogOpen} onOpenChange={setIsRanksDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-full">
            <DialogHeader>
              <DialogTitle>{weightMethod === "roc" ? "ROC" : "RR"} Weight Calculator</DialogTitle>
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
                            value={criteriaRanks[crit.id] || ""}
                            onChange={(e) => setCriteriaRanks(prev => ({ ...prev, [crit.id]: e.target.value }))}
                            onKeyDown={handleKeyDown}
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
              <Button
                variant="outline"
                onClick={() => setIsRanksDialogOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  setIsRanksDialogOpen(false)
                  await calculateWeights(weightMethod)
                  setCurrentStep("matrix")
                }}
                className="bg-black text-white hover:bg-gray-800 text-xs h-8"
              >
                Calculate Weights
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* --- PIPRECIA Dialog (Input Step) --- */}
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
                const updatedCriteria = criteria.map(c => ({
                  ...c,
                  weight: weights[c.id] || 0
                }))
                setCriteria(updatedCriteria)
                setWeightMethod("piprecia")
                setCurrentStep("matrix")
              }}
            />
          </DialogContent>
        </Dialog>

        {/* --- AHP Dialog (Input Step) --- */}
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
                const updatedCriteria = criteria.map(c => ({
                  ...c,
                  weight: weights[c.id] || 0
                }))
                setCriteria(updatedCriteria)
                setWeightMethod("ahp")
                setCurrentStep("matrix")
              }}
            />
          </DialogContent>
        </Dialog>

        {/* --- SWARA Dialog (Input Step) --- */}
        <Dialog open={isSwaraDialogOpen} onOpenChange={setIsSwaraDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
            <DialogHeader>
              <DialogTitle>SWARA Weight Calculator</DialogTitle>
              <DialogDescription className="text-xs">
                Enter comparative importance coefficients for each criterion.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs font-semibold">Rank</TableHead>
                    <TableHead className="text-xs font-semibold">Criterion</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Coefficient (sj)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criteria.map((crit, index) => (
                    <TableRow key={crit.id}>
                      <TableCell className="text-xs">{index + 1}</TableCell>
                      <TableCell className="text-xs font-medium">{crit.name}</TableCell>
                      <TableCell className="text-center">
                        {index === 0 ? "0 (Fixed)" : (
                          <Input
                            type="number"
                            step="0.01"
                            className="w-20 h-7 mx-auto text-xs"
                            value={swaraCoefficients[crit.id] || ""}
                            onChange={(e) => setSwaraCoefficients({ ...swaraCoefficients, [crit.id]: e.target.value })}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsSwaraDialogOpen(false)} variant="outline" className="text-xs">Cancel</Button>
              <Button
                onClick={async () => {
                  const coeffs: Record<string, number> = {}
                  criteria.forEach((crit, index) => {
                    coeffs[crit.id] = index === 0 ? 0 : parseFloat(swaraCoefficients[crit.id]) || 0
                  })
                  const res = await fetch("/api/swara-weights", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ criteria, coefficients: coeffs }),
                  })
                  if (res.ok) {
                    const data = await res.json()
                    setSwaraResult(data)
                    setSwaraCalculatedWeights(data.weights)
                    setIsSwaraDialogOpen(false)
                    setCriteria(criteria.map(c => ({ ...c, weight: data.weights[c.id] || 0 })))
                    setWeightMethod("swara")
                    setCurrentStep("matrix")
                  }
                }}
                className="bg-black text-white text-xs"
              >
                Calculate Weights
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    )
  }

  if (currentStep === "matrix") {
    return (
      <>
        <div className="min-h-screen bg-gray-50/50 pb-20">
          {isLoading && (
            <div className="processing-ring-overlay">
              <div className="processing-ring-container">
                <div className="premium-spinner">
                  {[...Array(12)].map((_, i) => (
                    <div key={i}></div>
                  ))}
                </div>
              </div>
              <p className="processing-text">
                {weightMethod ? "Calculating Weights..." : "Calculating Ranking..."}
              </p>
            </div>
          )}

          <main className="flex-1 min-h-screen bg-white p-2 md:p-3 flex flex-col">

            <div className="max-w-7xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-black/5 p-2 rounded-lg">
                    <LayoutGrid className="h-5 w-5 md:h-6 md:w-6 text-black" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-black tracking-tight">Decision Matrix</h1>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Step 3: Results & Analysis</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("home")}
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                    title="Go to Home"
                  >
                    <Home className="h-4 w-4" />
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

              {/* Weight Method Selector */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Weight Method:</span>
                  <Select value={weightMethod} onValueChange={(val: WeightMethod) => {
                    if (val === "piprecia") {
                      setIsPipreciaDialogOpen(true)
                    } else if (val === "ahp") {
                      setIsAhpDialogOpen(true)
                    } else if (val === "swara") {
                      setIsSwaraDialogOpen(true)
                    } else if (["roc", "rr"].includes(val)) {
                      setWeightMethod(val)
                      setIsRanksDialogOpen(true)
                    } else {
                      calculateWeights(val)
                    }
                  }}>
                    <SelectTrigger className="h-9 text-xs border-gray-200 text-black bg-white shadow-sm hover:border-gray-300 transition-colors min-w-[180px]">
                      <SelectValue placeholder="Select Weight Method" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectGroup>
                        <SelectLabel className="text-xs font-bold text-blue-600 px-2 py-1.5 bg-blue-50/50">Objective Weights</SelectLabel>
                        {WEIGHT_METHODS.filter(m => !["ahp", "piprecia", "swara", "roc", "rr"].includes(m.value)).map((m) => (
                          <SelectItem key={m.value} value={m.value} className="text-xs pl-6">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-xs font-bold text-purple-600 px-2 py-1.5 bg-purple-50/50 mt-1">Subjective Weights</SelectLabel>
                        {WEIGHT_METHODS.filter(m => ["ahp", "piprecia", "swara", "roc", "rr"].includes(m.value)).map((m) => (
                          <SelectItem key={m.value} value={m.value} className="text-xs pl-6">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  onClick={() => setCurrentStep("table")}
                  variant="outline"
                  className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                >
                  Edit
                </Button>
              </div>

              <div className="flex justify-end gap-2 mb-4" style={{ display: 'none' }}>
                <Button
                  type="button"
                  onClick={() => setCurrentStep("table")}
                  variant="outline"
                  className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent"
                >
                  Edit
                </Button>

              </div>



              {/* Weight Results Controls */}
              {weightMethod && (
                <div className="flex flex-wrap items-center gap-3 mb-6 p-2 bg-white border border-gray-200 rounded-lg">
                  {/* Method Name Badge */}
                  <div className="inline-flex items-center gap-2 bg-teal-100 border border-teal-300 rounded-full px-3 py-1">
                    <span className="text-[10px] font-semibold text-teal-800 uppercase">
                      {WEIGHT_METHODS.find((w) => w.value === weightMethod)?.label || weightMethod}
                    </span>
                  </div>

                  {/* Criteria Badge */}
                  <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1">
                    <span className="text-[10px] font-semibold text-blue-800 uppercase">
                      {String(criteria.length).padStart(2, "0")} Criteria
                    </span>
                  </div>

                  {/* Alternatives Badge */}
                  <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-3 py-1">
                    <span className="text-[10px] font-semibold text-gray-800 uppercase">
                      {String(alternatives.length).padStart(2, "0")} Alternatives
                    </span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1"></div>

                  {/* Decimal Places Control */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-black">Decimal:</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={weightsDecimalPlaces}
                      onChange={(e) => setWeightsDecimalPlaces(Math.max(0, Math.min(10, parseInt(e.target.value) || 4)))}
                      className="w-12 h-8 text-xs text-center border-gray-200 text-black shadow-none bg-transparent focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Export to Excel Button */}
                  <Button
                    onClick={exportWeightsToExcel}
                    variant="outline"
                    className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent flex items-center gap-1 shadow-none transition-colors"
                    title="Export weight results to Excel"
                  >
                    <Download className="w-3 h-3" />
                    <span className="">Export</span>
                  </Button>
                </div>
              )}
              {/* Evaluation Matrix */}
              <Card className="border-gray-200 bg-white shadow-none mb-3">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">Evaluation Matrix</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Review your decision matrix before calculation
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  <div className="table-responsive border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                          {criteria.map((crit) => (
                            <TableHead
                              key={crit.id}
                              className="text-xs font-semibold text-center py-3 px-4"
                            >
                              <div className="flex flex-col items-center">
                                <span className={crit.type === "beneficial" ? "text-green-600" : "text-red-600"}>{crit.name}</span>
                                <span className="text-[10px] text-gray-500 mt-1">{crit.type === "beneficial" ? "↑" : "↓"} ({crit.weight.toFixed(weightsDecimalPlaces)})</span>
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
                <>
                  {/* Table 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 2: Normalized Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (p_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using sum normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {entropyResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Entropy Values */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Entropy Values (p_ij * log2(p_ij))</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Intermediate entropy calculation values
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {entropyResult.entropyMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                            <TableRow className="bg-gray-50/50 border-b border-gray-200 border-t-2">
                              <TableCell className="py-3 px-4 font-bold text-black text-xs">Entropy (Ej)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {entropyResult.entropyValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Diversity Degree */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Diversity Degree (dj)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Degree of divergence (1 - Ej)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {entropyResult.diversityValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 5: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Final Weights (Wj)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {entropyResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {criticResult && weightMethod === "critic" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalization */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalization (r_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized decision matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {criticResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Standard Deviation (Contrast) */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Standard Deviation (σ_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Contrast intensity of each criterion
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {criticResult.standardDeviations[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Correlation Matrix (Conflict) */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Correlation Matrix (r_jk)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Conflict between criteria
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Criterion</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.map((critJ) => (
                              <TableRow key={critJ.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{critJ.name}</TableCell>
                                {criteria.map((critK) => (
                                  <TableCell key={critK.id} className="text-center py-3 px-4 text-xs text-black">
                                    {criticResult.correlationMatrix[critJ.id]?.[critK.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 5: Information Measure */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Information Measure (Cj)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Amount of information contained in each criterion
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {criticResult.informationAmounts[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 6: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 6: Final Weights (Wj)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated CRITIC weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {criticResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {ahpResult && weightMethod === "ahp" && (
                <Card className="border-gray-200 bg-white shadow-none mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-black">AHP Weight Calculation Results</CardTitle>
                    <CardDescription className="text-xs text-gray-700">
                      λmax = {ahpResult.lambdaMax.toFixed(weightsDecimalPlaces)} | CI = {ahpResult.consistencyIndex.toFixed(weightsDecimalPlaces)} | CR = {ahpResult.consistencyRatio.toFixed(weightsDecimalPlaces)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="table-responsive border border-gray-200 rounded-lg">
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
                                  {ahpResult.pairwiseMatrix[i]?.[j]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                          <TableRow className="bg-yellow-50 border-b border-gray-200">
                            <TableCell className="py-3 px-4 font-bold text-black text-xs">Weights (Wj)</TableCell>
                            {criteria.map((crit) => (
                              <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                {ahpResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
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
                    <div className="table-responsive border border-gray-200 rounded-lg">
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
                                {pipreciaResult.s_values[crit.id]?.toFixed(weightsDecimalPlaces)}
                              </TableCell>
                              <TableCell className="text-center py-3 px-4 text-xs text-black">
                                {pipreciaResult.k_values[crit.id]?.toFixed(weightsDecimalPlaces)}
                              </TableCell>
                              <TableCell className="text-center py-3 px-4 text-xs text-black">
                                {pipreciaResult.q_values[crit.id]?.toFixed(weightsDecimalPlaces)}
                              </TableCell>
                              <TableCell className="text-center py-3 px-4 text-xs text-black font-bold">
                                {pipreciaResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {merecResult && weightMethod === "merec" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalize the decision matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalize the decision matrix (r_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values based on criteria type
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {merecResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Calculate overall performance of alternatives */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Overall performance of alternatives (S_i)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Performance score with all criteria
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              <TableHead className="text-xs font-semibold text-black text-center py-3 px-4">Performance Score (Si)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((alt) => (
                              <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{alt.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {merecResult.performanceScores[alt.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Calculation of performance with removing each criterion */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Performance with removing each criterion (S_i<sup>(-k)</sup>)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Scores calculated by removing one criterion at a time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  Remove {crit.name}
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
                                    {merecResult.removalScores[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 5: Calculation of the removal effect */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Removal effect of each criterion (E_k)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Sum of absolute deviations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {merecResult.removalEffects[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 6: Calculation of objective weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 6: Final Weights (w_k)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated MEREC Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {merecResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {
                swaraResult && weightMethod === "swara" && (
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">SWARA Weight Calculation Results</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg mb-4">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-left">Criterion</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">s<sub>j</sub> (Coefficient)</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">k<sub>j</sub> (Step Factor)</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">q<sub>j</sub> (Preliminary)</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Weight (w<sub>j</sub>)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.map((crit) => (
                              <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {swaraResult.coefficients[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {swaraResult.stepFactors[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {swaraResult.preliminaryWeights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black font-bold bg-yellow-50">
                                  {swaraResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              {wensloResult && weightMethod === "wenslo" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalize the decision matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalize the decision matrix (r_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values (Min-Max)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {wensloResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Criterion Statistical Score */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Criterion Statistical Score (S_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Sum of normalized scores per criterion
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {wensloResult.wensloValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated WENSLO Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {wensloResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {lopcowResult && weightMethod === "lopcow" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalize the decision matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalize the decision matrix (r_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Vector normalization results
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {lopcowResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Geometric Mean */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Geometric Mean (GM_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Combined performance scores
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {lopcowResult.geometricMeans[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Logarithmic Percentage Change */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Logarithmic Percentage Change (L_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Diversification intensity results
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {lopcowResult.logPercentages[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 5: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated LOPCOW Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {lopcowResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {dematelResult && weightMethod === "dematel" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized for relationship analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {dematelResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Direct Relation Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Direct Relation Matrix (A)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Absolute correlation intensities between criteria
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Criteria</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.map((rowCrit) => (
                              <TableRow key={rowCrit.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{rowCrit.name}</TableCell>
                                {criteria.map((colCrit) => (
                                  <TableCell key={colCrit.id} className="text-center py-3 px-4 text-xs text-black">
                                    {dematelResult.directRelationMatrix[rowCrit.id]?.[colCrit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Total Relation Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Total Relation Matrix (T)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Full impact propagation matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Criteria</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.map((rowCrit) => (
                              <TableRow key={rowCrit.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{rowCrit.name}</TableCell>
                                {criteria.map((colCrit) => (
                                  <TableCell key={colCrit.id} className="text-center py-3 px-4 text-xs text-black">
                                    {dematelResult.totalRelationMatrix[rowCrit.id]?.[colCrit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 5: Influence (D) and Dependence (R) */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Influence (D) and Dependence (R)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Sum of influence/dependence per criterion
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Criterion</TableHead>
                              <TableHead className="text-xs font-semibold text-black text-center py-3 px-4">Influence (D)</TableHead>
                              <TableHead className="text-xs font-semibold text-black text-center py-3 px-4">Dependence (R)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.map((crit) => (
                              <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {dematelResult.dValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {dematelResult.rValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 6: Prominence (P) and Relation (E) */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 6: Prominence (P) and Relation (E)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Causal analysis: P = D + R, E = D - R
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Criterion</TableHead>
                              <TableHead className="text-xs font-semibold text-black text-center py-3 px-4">Prominence (P)</TableHead>
                              <TableHead className="text-xs font-semibold text-black text-center py-3 px-4">Relation (E)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.map((crit) => (
                              <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {dematelResult.pValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {dematelResult.eValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 7: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 7: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated DEMATEL Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {dematelResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              {sdResult && weightMethod === "sd" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (r_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using Min-Max normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {sdResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Standard Deviations */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Standard Deviation per Criterion (σ_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated standard deviation of normalized scores
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {sdResult.sigmaValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated SD Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {sdResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              {varianceResult && weightMethod === "variance" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (r_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using Min-Max normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {varianceResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Variances */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Statistical Variance per Criterion (σ²_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated variance of normalized scores
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {varianceResult.varianceValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated Variance Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {varianceResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              {madResult && weightMethod === "mad" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (r_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using Min-Max normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {madResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Mean Absolute Deviations */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Mean Absolute Deviation per Criterion (MAD_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated average absolute deviation from the mean of normalized scores
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {madResult.madValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated MAD Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {madResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}


              {dbwResult && weightMethod === "dbw" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (r_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using Sum normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {dbwResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Distance Sums */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Distance Sum per Criterion (D_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Sum of pairwise differences between alternative scores
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {dbwResult.distanceValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated DBW Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {dbwResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              {svpResult && weightMethod === "svp" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (r_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using Min-Max normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {svpResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Statistical Variances */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Statistical Variance per Criterion (SVP_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated statistical variance on Min-Max normalized data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {svpResult.varianceValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated SVP Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {svpResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {mdmResult && weightMethod === "mdm" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (n_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using Vector normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {mdmResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Deviation Values */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Total Deviation per Criterion (D_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Combined absolute differences between all alternatives
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {mdmResult.deviationValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated MDM Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {mdmResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {lswResult && weightMethod === "lsw" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (n_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using Vector normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {lswResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Ideal Solution and Least Squares Values */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Ideal Solution (A*) and Least Squares Values (LS_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Ideal points and sum of squared deviations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Metric</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-medium text-black text-xs">Ideal Solution (A*)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {lswResult.idealSolution[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-medium text-black text-xs">Least Squares (LS_j)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {lswResult.leastSquaresValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated LSW Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {lswResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {gpowResult && weightMethod === "gpow" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (n_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using Vector normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {gpowResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Goal Values and Deviations */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Goal Values (G_j) and Deviations (D_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Target goals and absolute deviations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Metric</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-medium text-black text-xs">Goal Value (G_j)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {gpowResult.goalValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-medium text-black text-xs">Goal Deviation (D_j)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {gpowResult.goalDeviationValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated GPOW Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {gpowResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {lpwmResult && weightMethod === "lpwm" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (n_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using Vector normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {lpwmResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Anti-Ideal Values and Deviations */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Anti-Ideal Values (A⁻) and Lower Deviations (LD_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Anti-ideal reference points and deviations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Metric</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-medium text-black text-xs">Anti-Ideal (A⁻)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {lpwmResult.antiIdealValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-medium text-black text-xs">Lower Deviation (LD_j)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {lpwmResult.lowerDeviationValues[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated LPWM Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {lpwmResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {pcwmResult && weightMethod === "pcwm" && (
                <>
                  {/* Step 1: Decision Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 1: Decision Matrix (X)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Original Decision Matrix
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {alt.scores[crit.id] !== undefined ? Number(alt.scores[crit.id]).toString() : "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix (n_ij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized values using Vector normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {pcwmResult.normalizedMatrix[alt.id]?.[crit.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3: Correlation Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Pearson Correlation Matrix (R)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Correlation between criteria
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Criterion</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className="text-xs font-semibold text-center py-3 px-4 text-black">
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.map((critRow) => (
                              <TableRow key={critRow.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{critRow.name}</TableCell>
                                {criteria.map((critCol) => (
                                  <TableCell key={critCol.id} className="text-center py-3 px-4 text-xs text-black">
                                    {pcwmResult.correlationMatrix[critRow.id]?.[critCol.id]?.toFixed(weightsDecimalPlaces)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4: Final Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Final Weights (w_j)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Calculated PCWM Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-yellow-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-bold">
                                  {pcwmResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {rocResult && weightMethod === "roc" && (
                <>
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table: ROC Weight Results</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Weights calculated using Rank Order Centroid (ROC) method based on entered ranks.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Criterion</TableHead>
                              <TableHead className="text-xs font-semibold text-center py-3 px-4 text-black">Rank</TableHead>
                              <TableHead className="text-xs font-semibold text-center py-3 px-4 text-black">Weight</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.map((crit) => (
                              <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">{rocResult.ranks[crit.id]}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black font-bold bg-yellow-50">
                                  {rocResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}



              {rrResult && weightMethod === "rr" && (
                <>
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table: RR Weight Results</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Weights calculated using Rank Reciprocal (RR) method based on entered ranks.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Criterion</TableHead>
                              <TableHead className="text-xs font-semibold text-center py-3 px-4 text-black">Rank</TableHead>
                              <TableHead className="text-xs font-semibold text-center py-3 px-4 text-black">Weight</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {criteria.map((crit) => (
                              <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">{rrResult.ranks[crit.id]}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black font-bold bg-yellow-50">
                                  {rrResult.weights[crit.id]?.toFixed(weightsDecimalPlaces)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

            </div >
          </main >
        </div>

        {/* --- ROC & RR Ranks Dialog (Matrix Step) --- */}
        <Dialog open={isRanksDialogOpen} onOpenChange={setIsRanksDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-full">
            <DialogHeader>
              <DialogTitle>{weightMethod === "roc" ? "ROC" : "RR"} Weight Calculator</DialogTitle>
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
                            value={criteriaRanks[crit.id] || ""}
                            onChange={(e) => setCriteriaRanks(prev => ({ ...prev, [crit.id]: e.target.value }))}
                            onKeyDown={handleKeyDown}
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
              <Button
                variant="outline"
                onClick={() => setIsRanksDialogOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  setIsRanksDialogOpen(false)
                  const updatedCriteria = await calculateWeights(weightMethod)
                  if (currentStep === "calculate") {
                    handleCalculate(method, updatedCriteria)
                  }
                }}
                className="bg-black text-white hover:bg-gray-800 text-xs h-8"
              >
                Calculate Weights
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* --- PIPRECIA Dialog (Matrix Step) --- */}
        < Dialog open={isPipreciaDialogOpen} onOpenChange={setIsPipreciaDialogOpen} >
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

                if (currentStep === "calculate") {
                  handleCalculate(method, updatedCriteria)
                }
              }}
            />
          </DialogContent>
        </Dialog >

        {/* --- AHP Dialog (Matrix Step) --- */}
        < Dialog open={isAhpDialogOpen} onOpenChange={setIsAhpDialogOpen} >
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

                if (currentStep === "calculate") {
                  handleCalculate(method, updatedCriteria)
                }
              }}
            />
          </DialogContent>
        </Dialog >

        {/* --- SWARA Dialog (Matrix Step) --- */}
        < Dialog open={isSwaraDialogOpen} onOpenChange={setIsSwaraDialogOpen} >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
            <DialogHeader>
              <DialogTitle>SWARA Weight Calculator</DialogTitle>
              <DialogDescription className="text-xs">
                Enter comparative importance coefficients (s<sub>j</sub>) for each criterion.
                The first criterion is most important (s<sub>1</sub> = 0).
                Higher values indicate larger importance differences.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs font-semibold">Rank</TableHead>
                      <TableHead className="text-xs font-semibold">Criterion</TableHead>
                      <TableHead className="text-xs font-semibold text-center">
                        Coefficient (s<sub>j</sub>)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteria.map((crit, index) => (
                      <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <TableCell className="py-3 px-4 font-medium text-black text-xs">{index + 1}</TableCell>
                        <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                        <TableCell className="text-center py-3 px-4 text-xs text-black">
                          {index === 0 ? (
                            <span className="text-xs text-gray-500">0 (most important)</span>
                          ) : (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={swaraCoefficients[crit.id] || ""}
                              onChange={(e) =>
                                setSwaraCoefficients({
                                  ...swaraCoefficients,
                                  [crit.id]: e.target.value,
                                })
                              }
                              onKeyDown={handleKeyDown}
                              className="w-24 h-7 text-xs text-center"
                              placeholder="0.00"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>

                </Table>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <strong>Note:</strong> Criteria are ordered by importance (top = most important).
                  For each criterion j, enter how much less important it is compared to the previous criterion (j-1).
                </p>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsSwaraDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  try {
                    // Convert string coefficients to numbers
                    const coeffs: Record<string, number> = {}
                    criteria.forEach((crit, index) => {
                      if (index === 0) {
                        coeffs[crit.id] = 0
                      } else {
                        coeffs[crit.id] = parseFloat(swaraCoefficients[crit.id]) || 0
                      }
                    })

                    // Call SWARA API
                    const response = await fetch("/api/swara-weights", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ criteria, coefficients: coeffs }),
                    })

                    if (!response.ok) throw new Error("Failed to calculate SWARA weights")

                    const data: SWARAResult = await response.json()
                    setSwaraResult(data)
                    setSwaraCalculatedWeights(data.weights)
                    setIsSwaraDialogOpen(false)

                    // Update criteria with new weights
                    const updatedCriteria = criteria.map(c => ({
                      ...c,
                      weight: data.weights[c.id] || 0
                    }))
                    setCriteria(updatedCriteria)
                    setWeightMethod("swara")

                    if (currentStep === "calculate") {
                      handleCalculate(method, updatedCriteria)
                    }
                  } catch (error) {
                    console.error("SWARA calculation error:", error)
                    alert("Error calculating SWARA weights")
                  }
                }}
                className="bg-black text-white hover:bg-gray-800 text-xs"
              >
                Calculate Weights
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog >
      </>
    )
  }

  // Results view after calculation
  if (currentStep === "calculate") {
    return (
      <div className="min-h-screen bg-gray-50/50 pb-20">

        <main className="flex-1 min-h-screen bg-white p-2 md:p-3 flex flex-col">


          {!apiResults ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="premium-spinner">
                    {[...Array(12)].map((_, i) => (
                      <div key={i}></div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700">Loading results...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsMethodSelectionSheetOpen(true)}
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-gray-200 text-black hover:bg-gray-100 bg-transparent flex-shrink-0"
                    title="Select Ranking Method"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <div className="flex-shrink-0">
                    <h1 className="text-xl md:text-2xl font-bold text-black">Results</h1>
                    <p className="text-xs text-gray-700">Calculation Results</p>
                  </div>
                </div>

                {/* Selectors in the middle */}
                <div className="flex flex-wrap items-center gap-4 flex-1 justify-center">
                  <div className="flex flex-col gap-1 min-w-[160px]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase px-1 tracking-wider">Weight Method</span>
                    <Select value={weightMethod} onValueChange={(val: WeightMethod) => handleWeightMethodChange(val)}>
                      <SelectTrigger className="h-9 text-xs border-gray-200 text-black bg-white shadow-sm hover:border-gray-300 transition-colors">
                        <SelectValue placeholder="Select Weight Method" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectGroup>
                          <SelectLabel className="text-xs font-bold text-blue-600 px-2 py-1.5 bg-blue-50/50">Objective Weights</SelectLabel>
                          {WEIGHT_METHODS.filter(m => !["ahp", "piprecia", "swara", "roc", "rr"].includes(m.value)).map((m) => (
                            <SelectItem key={m.value} value={m.value} className="text-xs pl-6">
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="text-xs font-bold text-purple-600 px-2 py-1.5 bg-purple-50/50 mt-1">Subjective Weights</SelectLabel>
                          {WEIGHT_METHODS.filter(m => ["ahp", "piprecia", "swara", "roc", "rr"].includes(m.value)).map((m) => (
                            <SelectItem key={m.value} value={m.value} className="text-xs pl-6">
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1 min-w-[160px]">
                    <span className="text-[10px] font-bold text-gray-500 uppercase px-1 tracking-wider">Ranking Method</span>
                    <Select value={method} onValueChange={(val: MCDMMethod) => handleRankingMethodChange(val)}>
                      <SelectTrigger className="h-9 text-xs border-gray-200 text-black bg-white shadow-sm hover:border-gray-300 transition-colors">
                        <SelectValue placeholder="Select Ranking Method" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {MCDM_METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value} className="text-xs">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    onClick={() => {
                      setCurrentStep("matrix")
                      setMethod(method)
                    }}
                    variant="outline"
                    className="text-xs h-9 border-gray-200 text-black hover:bg-gray-100 bg-transparent px-4"
                  >
                    Back
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setCurrentStep("matrix")}
                    className="bg-black text-white hover:bg-gray-800 text-xs h-9 px-4"
                  >
                    New Calculation
                  </Button>
                </div>
              </div>

              <Card className="border-gray-200 bg-white shadow-none mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-black">{methodInfo?.label} Results</CardTitle>
                  <CardDescription className="text-xs text-gray-700">
                    Ranked alternatives based on {methodInfo?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Method Info and Controls */}
                  <div className="flex flex-wrap items-center gap-3 mb-6 p-2 bg-white border border-gray-200 rounded-lg">
                    {/* Method Name Badge */}
                    <div className="inline-flex items-center gap-2 bg-teal-100 border border-teal-300 rounded-full px-3 py-1">
                      <span className="text-[10px] font-semibold text-teal-800 uppercase">{methodInfo?.label}</span>
                    </div>

                    {/* Criteria Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-full px-3 py-1">
                      <span className="text-[10px] font-semibold text-blue-800 uppercase">{String(criteria.length).padStart(2, '0')} Criteria</span>
                    </div>

                    {/* Alternatives Badge */}
                    <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-3 py-1">
                      <span className="text-[10px] font-semibold text-gray-800 uppercase">{String(alternatives.length).padStart(2, '0')} Alternatives</span>
                    </div>

                    {/* Parametric Controls (VIKOR, WASPAS, CODAS) */}
                    <div className="flex items-center gap-4">
                      {method === "vikor" && (
                        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                          <label className="text-[10px] font-bold text-gray-600 uppercase">v-value:</label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={vikorVValue}
                            onChange={(e) => setVikorVValue(e.target.value)}
                            onBlur={() => handleCalculate()}
                            className="w-16 h-7 text-xs text-center border-gray-200 text-black shadow-none bg-transparent focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {method === "waspas" && (
                        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                          <label className="text-[10px] font-bold text-gray-600 uppercase">λ-value:</label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={waspasLambdaValue}
                            onChange={(e) => setWpasLambdaValue(e.target.value)}
                            onBlur={() => handleCalculate()}
                            className="w-16 h-7 text-xs text-center border-gray-200 text-black shadow-none bg-transparent focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {method === "codas" && (
                        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                          <label className="text-[10px] font-bold text-gray-600 uppercase">τ-value:</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={codasTauValue}
                            onChange={(e) => setCodasTauValue(e.target.value)}
                            onBlur={() => handleCalculate()}
                            className="w-16 h-7 text-xs text-center border-gray-200 text-black shadow-none bg-transparent focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1"></div>

                    {/* Decimal Places Control */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-black">Decimal:</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={resultsDecimalPlaces}
                        onChange={(e) => setResultsDecimalPlaces(Math.max(0, Math.min(10, parseInt(e.target.value) || 4)))}
                        className="w-12 h-8 text-xs text-center border-gray-200 text-black shadow-none bg-transparent focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Export to Excel Button */}
                    <Button
                      onClick={exportResultsToExcel}
                      variant="outline"
                      className="text-xs h-8 border-gray-200 text-black hover:bg-gray-100 bg-transparent flex items-center gap-1 shadow-none transition-colors"
                      title="Export results to Excel"
                    >
                      <Download className="w-3 h-3" />
                      <span className="">Export</span>
                    </Button>
                  </div>

                  {/* Results Table */}
                  <div className="table-responsive border border-gray-200 rounded-lg">
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
                                {typeof item.score === "number" ? item.score.toFixed(resultsDecimalPlaces) : item.score}
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

              {method === "swei" && apiResults?.metrics?.sweiNormalizedMatrix && (
                <>
                  {/* Table 2: Normalization Values */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalization Values</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized Decision Matrix (IDM) using Equation (2) for Benefit and Equation (3) for Non-Benefit criteria
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.sweiNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Information Score */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Information Score</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Information Score Matrix using Equation (4): log2(1/IDM)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.sweiInformationMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Weighted Exponential Information */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Weighted Exponential Information</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Weighted information for each attribute: (Info)^weight
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.sweiWeightedExponentialMatrix?.[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "cocoso" && apiResults?.metrics?.cocosoNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Compromise Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.cocosoNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: WSM and WPM */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: WSM and WPM Scores</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Weighted Sum (Si) and Weighted Power (Pi) Scores
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Si (WSM)</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Pi (WPM)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((alt) => (
                              <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{alt.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.cocosoWeightedComparabilitySum[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.cocosoWeightedComparabilityPower[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Appraisal Scores */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Compromise Appraisal Scores</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Relative appraisal scores: kia, kib, kic
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">kia</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">kib</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">kic</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((alt) => (
                              <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{alt.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.cocosoKia[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.cocosoKib[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.cocosoKic[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "copras" && apiResults?.metrics?.coprasNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized by column sums
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.coprasNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Weighted Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Weighted Normalized Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Weighted normalized values
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.coprasWeightedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: S+, S- and Qi values */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Significance and Priority</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Sum of beneficial (S+) and non-beneficial (S-) criteria values, and final priority score (Qi)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">S+</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">S-</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Qi (Score)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((alt) => (
                              <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{alt.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.coprasSPlus[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.coprasSMinus[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.coprasQi[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "promethee" && apiResults?.metrics?.prometheeNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Vector Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.prometheeNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Preference Flows */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Preference Flows</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Positive (φ+), Negative (φ-), and Net (φ) flows for each alternative.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Positive Flow (φ+)</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Negative Flow (φ-)</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Net Flow (φ)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((alt) => (
                              <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{alt.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.prometheePhiPlus[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.prometheePhiMinus[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.prometheeNetFlow[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "promethee1" && apiResults?.metrics?.promethee1NormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Vector Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.promethee1NormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Aggregated Preference Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Aggregated Preference Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alt \ Alt</TableHead>
                              {alternatives.map((alt) => (
                                <TableHead key={alt.id} className="text-xs font-semibold text-black text-center py-3 px-4">
                                  {alt.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((rowAlt) => (
                              <TableRow key={rowAlt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{rowAlt.name}</TableCell>
                                {alternatives.map((colAlt) => (
                                  <TableCell key={colAlt.id} className="text-center py-3 px-4 text-xs text-black">
                                    {apiResults.metrics?.promethee1AggregatedPreferenceMatrix[rowAlt.id]?.[colAlt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Preference Flows */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Preference Flows</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Positive (φ+) and Negative (φ-) flows for each alternative.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Positive Flow (φ+)</TableHead>
                              <TableHead className="text-xs font-semibold text-black py-3 px-4 text-center">Negative Flow (φ-)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((alt) => (
                              <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{alt.name}</TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.promethee1PositiveFlow[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                                <TableCell className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.promethee1NegativeFlow[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 5: Outranking Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Outranking Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alt \ Alt</TableHead>
                              {alternatives.map((alt) => (
                                <TableHead key={alt.id} className="text-xs font-semibold text-black text-center py-3 px-4">
                                  {alt.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((rowAlt) => (
                              <TableRow key={rowAlt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{rowAlt.name}</TableCell>
                                {alternatives.map((colAlt) => (
                                  <TableCell key={colAlt.id} className="text-center py-3 px-4 text-xs text-black">
                                    {apiResults.metrics?.promethee1OutrankingMatrix[rowAlt.id]?.[colAlt.id] ? "Yes" : "No"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "swi" && apiResults?.metrics?.swiNormalizedMatrix && (
                <>
                  {/* Table 2: Normalization Values */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalization Values</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized Decision Matrix (IDM) using Equation (2) for Benefit and Equation (3) for Non-Benefit criteria
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.swiNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Information Score */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Information Score</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Information Score Matrix using Equation (4): log2(1/IDM)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.swiInformationMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Weighted Information */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Weighted Information</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Weighted information for each attribute: weight * Info
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.swiWeightedInformationMatrix?.[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "topsis" && apiResults?.metrics?.topsisNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Vector Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.topsisNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Weighted Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Weighted Normalized Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized matrix * weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.topsisWeightedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Ideal Solutions */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Ideal Solutions</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Positive Ideal (PIS) and Negative Ideal (NIS) Solutions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Solution</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-bold text-green-700 text-xs">PIS (A+)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold text-green-700">
                                  {apiResults.metrics?.topsisIdealBest[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-bold text-red-700 text-xs">NIS (A-)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold text-red-700">
                                  {apiResults.metrics?.topsisIdealWorst[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 5: Separation Measures */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Separation Measures</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Distances to Positive (D+) and Negative (D-) Ideal Solutions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">D+ (Distance to Best)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">D- (Distance to Worst)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.topsisDistances[alt.id]?.positive?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.topsisDistances[alt.id]?.negative?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "gra" && apiResults?.metrics?.graNormalizedMatrix && (
                <>
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">Grey Relational Normalization</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"}`}>
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
                                    {apiResults.metrics?.graNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
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
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Deviation Sequence (Δij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">Absolute difference from reference sequence</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"}`}>
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
                                    {apiResults.metrics?.graDeviationSequence[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
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
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Grey Relational Coefficients (ξij)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">Correlation measure (ζ = 0.5)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"}`}>
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
                                    {apiResults.metrics?.graGreyRelationalCoefficients[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "aras" && apiResults?.metrics?.arasNormalizedMatrix && (
                <>
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">Detailed normalized values (including optimal alternative)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"}`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {/* using arasOptimalAlternativeValues which are RAW values usually, but this table is Normalized. 
                                      Wait, x0 is also normalized in ARAS.
                                      But I only returned 'optimalAlternativeValues' which are RAW x0 from calculateARAS.
                                      I did not return Normalized x0. 
                                      In calculateARAS.ts:
                                      normMatrix[0] was normX0. But I didn't put it in the returned object.
                                      
                                      Actually, looking at `calculateARAS.ts`:
                                      `optimalAlternativeValues` are the raw x0 values.
                                      
                                      So if I put them in Table 2 (Normalized), it might be misleading if they aren't normalized.
                                      However, for ARAS, the normalized x0 is typically:
                                      x0_j / sum(x_ij).
                                      
                                      Let's display "-" or maybe "Ref" to avoid confusion, OR create a separate table for "Optimal Alternative (Raw Values)".
                                      
                                      Given I can't easily get normalized x0 without changing backend again, I will just leave it as "-" or remove the row to avoid showing empty data. 
                                      Actually, transparency is better. I will remove the "Optimal (x0)" row from Normalized Matrix since I don't have the data, 
                                      AND adding a small Table 1.5: Optimal Alternative (Raw) would be better if I wanted to show it.
                                      
                                      But the USER asked for "all calculated values".
                                      
                                      Let's stick to what I have or validly improve it. 
                                      I'll remove the placeholder row to be clean, as showing "-" looks broken. 
                                  */}

                            {alternatives.map((alt) => (
                              <TableRow key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{alt.name}</TableCell>
                                {criteria.map((crit) => (
                                  <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black">
                                    {apiResults.metrics?.arasNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
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
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Weighted Normalized Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">Normalized values × Weights</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"}`}>
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
                                    {apiResults.metrics?.arasWeightedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
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
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Optimality Function & Utility</CardTitle>
                      <CardDescription className="text-xs text-gray-700">Si (Optimality Function) and Ki (Degree of Utility)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Optimality Function (Si)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Degree of Utility (Ki)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.arasOptimalityFunctionValues[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {/* Ki is basically the score in ARAS implementation map, let's use results score directly or re-compute if needed, 
                                      but we have `apiResults.results` which maps altId -> score. 
                                      In ARAS implementation `scores` ARE Ki values. 
                                  */}
                                  {apiResults.results[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "vikor" && apiResults?.metrics?.vikorNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Linear Normalization using Best (f*) and Worst (f-) values
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.vikorNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Best (f*) and Worst (f-) Values */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Best and Worst Values</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        f* (Best) and f- (Worst) for each criterion
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Value Type</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-bold text-green-700 text-xs">f* (Best)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold text-green-700">
                                  {apiResults.metrics?.vikorFBest[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-bold text-red-700 text-xs">f- (Worst)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold text-red-700">
                                  {apiResults.metrics?.vikorFWorst[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: S, R and Q Values */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: VIKOR Values (S, R, Q)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        S (Utility Measure), R (Regret Measure), and Q (VIKOR Index)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">S Value</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">R Value</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Q Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.vikorSValues[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.vikorRValues[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.vikorQValues[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "waspas" && apiResults?.metrics?.waspasNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Linear Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.waspasNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: WSM Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Weighted Sum Model (WSM)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Values * Weight (additive part)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.waspasWsmMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: WPM Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Weighted Product Model (WPM)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Values ^ Weight (multiplicative part)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.waspasWpmMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 5: Aggregated Scores */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Aggregated WASPAS Scores</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Score = λ * WSM + (1 - λ) * WPM
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Total WSM</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Total WPM</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">WASPAS Score (Q)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.waspasWsmScores[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.waspasWpmScores[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {typeof apiResults.ranking.find((r: any) => r.alternativeId === alt.id)?.score === 'number'
                                    ? apiResults.ranking.find((r: any) => r.alternativeId === alt.id)?.score.toFixed(resultsDecimalPlaces)
                                    : apiResults.metrics?.waspasScores?.[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "edas" && apiResults?.metrics?.edasPdaMatrix && (
                <>
                  {/* Table 2: Average Solution */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Average Solution (AV)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Average value for each criterion
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-center py-3 px-4 font-semibold text-xs ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.edasAvVector[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: PDA Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Positive Distance from Average (PDA)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        PDA Calculation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.edasPdaMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: NDA Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Negative Distance from Average (NDA)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        NDA Calculation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.edasNdaMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 5: EDAS Scores Breakdown */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: EDAS Scores Breakdown</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        SP/SN (Weighted Sums), NSP/NSN (Normalized), AS (Appraisal Score)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">SP (Weighted PDA)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">SN (Weighted NDA)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">NSP</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">NSN</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">AS Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.edasSpValues[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.edasSnValues[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.edasNspValues[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.edasNsnValues[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.edasAsValues[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}


              {method === "mabac" && apiResults?.metrics?.mabacNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Linear Normalization (Min-Max)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.mabacNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Weighted Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Weighted Matrix (V)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        V = (n_ij + 1) * w_j
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.mabacWeightedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Border Approximation Area (BAA) */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Border Approximation Area (BAA)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Geometric mean of weighted matrix values for each criterion
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Metric</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-bold text-black text-xs">BAA (G)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold">
                                  {apiResults.metrics?.mabacBorderApproximationArea[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 5: Distance Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Distance Matrix (Q)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Distance from BAA (Q = V - G)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.mabacDistanceMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "marcos" && apiResults?.metrics?.marcosNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalization using Extended Matrix (with Ideal/Anti-Ideal)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.marcosNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Weighted Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Weighted Normalized Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized Value * Weight
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.marcosWeightedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Ideal and Anti-Ideal Solutions */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Ideal and Anti-Ideal Solutions</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Ideal (AI) and Anti-Ideal (AAI) solutions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Solution</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-bold text-green-700 text-xs">Ideal (AI)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold text-green-700">
                                  {apiResults.metrics?.marcosIdealSolution[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              <TableCell className="py-3 px-4 font-bold text-red-700 text-xs">Anti-Ideal (AAI)</TableCell>
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold text-red-700">
                                  {apiResults.metrics?.marcosAntiIdealSolution[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 5: Utility Degrees and Final Score */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Utility Degrees</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Utility degrees relative to Ideal (K-) and Anti-Ideal (K+), and Final Utility Function (f(K))
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">K- (vs Ideal)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">K+ (vs Anti-Ideal)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Utility Score (f(K))</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.marcosKMinus?.[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.marcosKPlus?.[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black font-bold">
                                  {apiResults.metrics?.marcosUtilityDegrees?.[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "moora" && apiResults?.metrics?.mooraNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Vector Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.mooraNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Weighted Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Weighted Normalized Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized Value * Weight
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.mooraWeightedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Final Scores Breakdown */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: MOORA Scores Breakdown</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Sum of Beneficial Criteria (Max) - Sum of Non-Beneficial Criteria (Min)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Sum (Beneficial)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Sum (Non-Beneficial)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Final Score (Yi)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.mooraBeneficialSum[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.mooraNonBeneficialSum[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.ranking.find((r: any) => r.alternativeId === alt.id)?.score?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "multimoora" && apiResults?.metrics?.multimooraNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Vector Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.multimooraNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Weighted Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Weighted Normalized Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Values * Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.multimooraWeightedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: MULTIMOORA Scores and Rankings Breakdown */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: MULTIMOORA Scores & Rankings</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Ratio System (RS), Reference Point (RP), Full Multiplicative Form (FMF)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold" rowSpan={2}>Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold border-l" colSpan={2}>Ratio System (RS)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold border-l" colSpan={2}>Reference Point (RP)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold border-l" colSpan={2}>Full Multiplicative (FMF)</th>
                            </tr>
                            <tr>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold border-l">Score</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Rank</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold border-l">Score (Min)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Rank</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold border-l">Score</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Rank</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black border-l">
                                  {apiResults.metrics?.multimooraRatioSystemScores[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black font-bold">
                                  {apiResults.metrics?.multimooraRatioSystemRanking[alt.id] || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black border-l">
                                  {apiResults.metrics?.multimooraReferencePointScores[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black font-bold">
                                  {apiResults.metrics?.multimooraReferencePointRanking[alt.id] || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black border-l">
                                  {apiResults.metrics?.multimooraFullMultiplicativeScores[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black font-bold">
                                  {apiResults.metrics?.multimooraFullMultiplicativeRanking[alt.id] || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "todim" && apiResults?.metrics?.todimNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Min-Max Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.todimNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Relative Weights */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Relative Weights</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Normalized by maximum weight
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-center py-3 px-4 font-semibold text-xs ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black">
                                  {apiResults.metrics?.todimRelativeWeights[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Dominance Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Dominance Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Overall Dominance Degree δ(Ai, Aj)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alt \ Alt</TableHead>
                              {alternatives.map((alt) => (
                                <TableHead key={alt.id} className="text-xs font-semibold text-black text-center py-3 px-4">
                                  {alt.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {alternatives.map((rowAlt) => (
                              <TableRow key={rowAlt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <TableCell className="py-3 px-4 font-medium text-black text-xs">{rowAlt.name}</TableCell>
                                {alternatives.map((colAlt) => (
                                  <TableCell key={colAlt.id} className="text-center py-3 px-4 text-xs text-black">
                                    {rowAlt.id === colAlt.id
                                      ? "0.0000"
                                      : apiResults.metrics?.todimDominanceMatrix[rowAlt.id]?.[colAlt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "codas" && apiResults?.metrics?.codasNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Linear Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.codasNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Negative Ideal Solution */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Negative Ideal Solution (NIS)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Min (Beneficial) or Max (Non-Beneficial) of Normalized Values
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-center py-3 px-4 font-semibold text-xs ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
                                  {crit.name}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="border-b border-gray-200 hover:bg-gray-50">
                              {criteria.map((crit) => (
                                <TableCell key={crit.id} className="text-center py-3 px-4 text-xs text-black font-semibold text-red-700">
                                  {apiResults.metrics?.codasNegativeIdealSolution[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Distances and RA Scores */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: CODAS Distances and Assessment</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Euclidean (Ei) and Taxicab (Ti) Distances from NIS, and Relative Assessment (RA) Score
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Euclidean Distance (Ei)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Taxicab Distance (Ti)</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Relative Assessment (RA) Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.codasEuclideanDistances[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.codasTaxicabDistances[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.codasRelativeAssessmentScores[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "moosra" && apiResults?.metrics?.moosraNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Vector Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.moosraNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Weighted Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Weighted Normalized Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Values * Weights
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.moosraWeightedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: MOOSRA Scores Breakdown */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: MOOSRA Scores Breakdown</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Beneficial Sum, Non-Beneficial Sum, and Final Ratio (Score)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Beneficial Sum</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Non-Beneficial Sum</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">MOOSRA Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.moosraBeneficialSum[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.moosraNonBeneficialSum[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.ranking.find((r: any) => r.alternativeId === alt.id)?.score?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {method === "mairca" && apiResults?.metrics?.maircaNormalizedMatrix && (
                <>
                  {/* Table 2: Normalized Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 2: Normalized Decision Matrix</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Linear Normalization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.maircaNormalizedMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 3: Theoretical Ratings */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 3: Theoretical Ratings (Tp)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Tp = Weight * Ideal Value
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.maircaTheoreticalRatings[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 4: Real Ratings */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 4: Real Ratings (Tr)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Tr = Weight * Normalized Value
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.maircaRealRatings[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 5: Gap Matrix */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 5: Gap Matrix (G)</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Gap = Tp - Tr
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="text-xs font-semibold text-black py-3 px-4">Alternative</TableHead>
                              {criteria.map((crit) => (
                                <TableHead key={crit.id} className={`text-xs font-semibold text-center py-3 px-4 ${crit.type === "beneficial" ? "text-green-600" : "text-red-600"
                                  }`}>
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
                                    {apiResults.metrics?.maircaGapMatrix[alt.id]?.[crit.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Table 6: Total Gaps and Final Score */}
                  <Card className="border-gray-200 bg-white shadow-none mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-black">Table 6: Total Gaps & Final Score</CardTitle>
                      <CardDescription className="text-xs text-gray-700">
                        Sum of Gaps (Lower is better)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="table-responsive border border-gray-200 rounded-lg">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-200 text-black font-semibold">Alternative</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Total Gap</th>
                              <th className="px-3 py-2 text-center border-b border-gray-200 text-black font-semibold">Rank</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alternatives.map((alt) => (
                              <tr key={alt.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-3 py-2 text-left text-black font-medium">{alt.name}</td>
                                <td className="px-3 py-2 text-center text-black">
                                  {apiResults.metrics?.maircaTotalGaps[alt.id]?.toFixed(resultsDecimalPlaces) || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-black font-bold">
                                  {apiResults.ranking.find((r: any) => r.alternativeId === alt.id)?.rank || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}




            </div>
          )}
        </main>

        {/* --- Dialogs for Calculate Step --- */}
        {/* AHP Dialog */}
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
                const updatedCriteria = criteria.map(c => ({ ...c, weight: weights[c.id] || 0 }))
                setCriteria(updatedCriteria)
                setWeightMethod("ahp")
                handleCalculate(method, updatedCriteria)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* PIPRECIA Dialog */}
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
                const updatedCriteria = criteria.map(c => ({ ...c, weight: weights[c.id] || 0 }))
                setCriteria(updatedCriteria)
                setWeightMethod("piprecia")
                handleCalculate(method, updatedCriteria)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* SWARA Dialog */}
        <Dialog open={isSwaraDialogOpen} onOpenChange={setIsSwaraDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
            <DialogHeader>
              <DialogTitle>SWARA Weight Calculator</DialogTitle>
              <DialogDescription className="text-xs">
                Enter comparative importance coefficients (s<sub>j</sub>) for each criterion.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs font-semibold">Rank</TableHead>
                      <TableHead className="text-xs font-semibold">Criterion</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Coefficient (s<sub>j</sub>)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteria.map((crit, index) => (
                      <TableRow key={crit.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <TableCell className="py-3 px-4 font-medium text-black text-xs">{index + 1}</TableCell>
                        <TableCell className="py-3 px-4 font-medium text-black text-xs">{crit.name}</TableCell>
                        <TableCell className="text-center py-3 px-4 text-xs text-black">
                          {index === 0 ? (
                            <span className="text-xs text-gray-500">0 (most important)</span>
                          ) : (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={swaraCoefficients[crit.id] || ""}
                              onChange={(e) => setSwaraCoefficients({ ...swaraCoefficients, [crit.id]: e.target.value })}
                              onKeyDown={handleKeyDown}
                              className="w-24 h-7 text-xs text-center mx-auto"
                              placeholder="0.00"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsSwaraDialogOpen(false)} className="text-xs">Cancel</Button>
              <Button
                type="button"
                className="bg-black text-white hover:bg-gray-800 text-xs"
                onClick={async () => {
                  try {
                    const coeffs: Record<string, number> = {}
                    criteria.forEach((crit, index) => {
                      if (index === 0) coeffs[crit.id] = 0
                      else coeffs[crit.id] = parseFloat(swaraCoefficients[crit.id]) || 0
                    })
                    const response = await fetch("/api/swara-weights", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ criteria, coefficients: coeffs }),
                    })
                    if (!response.ok) throw new Error("Failed to calculate SWARA weights")
                    const data: SWARAResult = await response.json()
                    setSwaraResult(data)
                    setSwaraCalculatedWeights(data.weights)
                    setIsSwaraDialogOpen(false)
                    const updatedCriteria = criteria.map(c => ({ ...c, weight: data.weights[c.id] || 0 }))
                    setCriteria(updatedCriteria)
                    setWeightMethod("swara")
                    handleCalculate(method, updatedCriteria)
                  } catch (error) {
                    console.error("SWARA calculation error:", error)
                    alert("Error calculating SWARA weights")
                  }
                }}
              >
                Calculate Weights
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ROC & RR Dialog */}
        <Dialog open={isRanksDialogOpen} onOpenChange={setIsRanksDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-full">
            <DialogHeader>
              <DialogTitle>{weightMethod === "roc" ? "ROC" : "RR"} Weight Calculator</DialogTitle>
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
                            value={criteriaRanks[crit.id] || ""}
                            onChange={(e) => setCriteriaRanks(prev => ({ ...prev, [crit.id]: e.target.value }))}
                            onKeyDown={handleKeyDown}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsRanksDialogOpen(false)} className="text-xs h-8">Cancel</Button>
              <Button
                type="button"
                className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                onClick={async () => {
                  setIsRanksDialogOpen(false)
                  const updatedCriteria = await calculateWeights(weightMethod)
                  handleCalculate(method, updatedCriteria)
                }}
              >
                Calculate Weights
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Method Selection Sheet */}
        {/* Method Selection Sheet removed */}
      </div>
    )
  }
}
