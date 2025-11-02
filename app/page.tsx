"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
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

interface Criterion {
  id: string
  name: string
  weight: number
  type: "beneficial" | "non-beneficial"
}

interface Alternative {
  id: string
  name: string
  scores: Record<string, number>
}

type MCDMMethod = "swei" | "ahp" | "topsis" | "vikor" | "electre"
type PageStep = "home" | "input" | "table" | "matrix" | "calculate"

const MCDM_METHODS: { value: MCDMMethod; label: string; description: string }[] = [
  { value: "swei", label: "SWEI", description: "Sum Weighted Exponential Information" },
  { value: "ahp", label: "AHP", description: "Analytic Hierarchy Process" },
  { value: "topsis", label: "TOPSIS", description: "Technique for Order Preference by Similarity to Ideal Solution" },
  { value: "vikor", label: "VIKOR", description: "VlseKriterijumska Optimizacija I Kompromisno Resenje" },
  { value: "electre", label: "ELECTRE", description: "Elimination and Choice Expressing Reality" },
]

export default function MCDMCalculator() {
  const [method, setMethod] = useState<MCDMMethod>("swei")
  const [currentStep, setCurrentStep] = useState<PageStep>("home")

  const [alternatives, setAlternatives] = useState<Alternative[]>([])
  const [criteria, setCriteria] = useState<Criterion[]>([])

  const [numAlternatives, setNumAlternatives] = useState(3)
  const [numCriteria, setNumCriteria] = useState(3)

  const [isLoading, setIsLoading] = useState(false)
  const [apiResults, setApiResults] = useState<any>(null)

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
      if (isNaN(numValue) || numValue <= 0) {
        return // Don't update if invalid
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

  const handleSaveTable = () => {
    const allScoresFilled = alternatives.every((alt) =>
      criteria.every((crit) => {
        const score = alt.scores[crit.id]
        return score !== undefined && score !== "" && Number(score) > 0
      }),
    )

    if (!allScoresFilled) {
      alert("Please fill in all score values with numbers greater than 0")
      return
    }

    setCurrentStep("matrix")
  }

  const normalizeScores = (critId: string) => {
    const scores = alternatives.map((alt) => alt.scores[critId] || 0).filter((s) => s > 0)
    if (scores.length === 0) return {}

    const max = Math.max(...scores)
    const min = Math.min(...scores)
    const range = max - min || 1

    const normalized: Record<string, number> = {}
    alternatives.forEach((alt) => {
      const score = alt.scores[critId] || 0
      if (score > 0) {
        const criterion = criteria.find((c) => c.id === critId)
        if (criterion?.type === "beneficial") {
          normalized[alt.id] = (score - min) / range
        } else {
          normalized[alt.id] = (max - score) / range
        }
      }
    })
    return normalized
  }

  const calculateScores = () => {
    const results: Record<string, number> = {}

    if (method === "swei") {
      alternatives.forEach((alt) => {
        let totalScore = 0
        let totalWeight = 0

        criteria.forEach((crit) => {
          const normalized = normalizeScores(crit.id)
          const score = normalized[alt.id] || 0
          totalScore += score * crit.weight
          totalWeight += crit.weight
        })

        results[alt.id] = totalWeight > 0 ? totalScore / totalWeight : 0
      })
    } else if (method === "topsis") {
      const normalizedMatrix: Record<string, Record<string, number>> = {}

      criteria.forEach((crit) => {
        const scores = alternatives.map((alt) => alt.scores[crit.id] || 0)
        const sumSquares = Math.sqrt(scores.reduce((sum, s) => sum + s * s, 0))

        alternatives.forEach((alt) => {
          if (!normalizedMatrix[alt.id]) normalizedMatrix[alt.id] = {}
          normalizedMatrix[alt.id][crit.id] = sumSquares > 0 ? (alt.scores[crit.id] || 0) / sumSquares : 0
        })
      })

      const idealSolution: Record<string, number> = {}
      const negativeIdeal: Record<string, number> = {}

      criteria.forEach((crit) => {
        const values = alternatives.map((alt) => normalizedMatrix[alt.id][crit.id])
        if (crit.type === "beneficial") {
          idealSolution[crit.id] = Math.max(...values)
          negativeIdeal[crit.id] = Math.min(...values)
        } else {
          idealSolution[crit.id] = Math.min(...values)
          negativeIdeal[crit.id] = Math.max(...values)
        }
      })

      alternatives.forEach((alt) => {
        let distanceToIdeal = 0
        let distanceToNegativeIdeal = 0

        criteria.forEach((crit) => {
          const weighted = normalizedMatrix[alt.id][crit.id] * crit.weight
          distanceToIdeal += Math.pow(weighted - idealSolution[crit.id] * crit.weight, 2)
          distanceToNegativeIdeal += Math.pow(weighted - negativeIdeal[crit.id] * crit.weight, 2)
        })

        distanceToIdeal = Math.sqrt(distanceToIdeal)
        distanceToNegativeIdeal = Math.sqrt(distanceToNegativeIdeal)

        results[alt.id] =
          distanceToIdeal + distanceToNegativeIdeal > 0
            ? distanceToNegativeIdeal / (distanceToIdeal + distanceToNegativeIdeal)
            : 0
      })
    } else if (method === "ahp") {
      alternatives.forEach((alt) => {
        let totalScore = 0
        let totalWeight = 0

        criteria.forEach((crit) => {
          const normalized = normalizeScores(crit.id)
          const score = normalized[alt.id] || 0
          totalScore += Math.pow(score, crit.weight)
          totalWeight += crit.weight
        })

        results[alt.id] = totalWeight > 0 ? totalScore / totalWeight : 0
      })
    } else if (method === "vikor") {
      const fBest: Record<string, number> = {}
      const fWorst: Record<string, number> = {}

      criteria.forEach((crit) => {
        const scores = alternatives.map((alt) => alt.scores[crit.id] || 0)
        if (crit.type === "beneficial") {
          fBest[crit.id] = Math.max(...scores)
          fWorst[crit.id] = Math.min(...scores)
        } else {
          fBest[crit.id] = Math.min(...scores)
          fWorst[crit.id] = Math.max(...scores)
        }
      })

      alternatives.forEach((alt) => {
        let S = 0
        let R = 0

        criteria.forEach((crit) => {
          const score = alt.scores[crit.id] || 0
          const normalized =
            fBest[crit.id] !== fWorst[crit.id] ? (fBest[crit.id] - score) / (fBest[crit.id] - fWorst[crit.id]) : 0
          S += crit.weight * normalized
          R = Math.max(R, crit.weight * normalized)
        })

        results[alt.id] = S + R
      })

      const maxScore = Math.max(...Object.values(results))
      Object.keys(results).forEach((key) => {
        results[key] = maxScore - results[key]
      })
    } else if (method === "electre") {
      alternatives.forEach((alt) => {
        let concordance = 0
        let discordance = 0

        criteria.forEach((crit) => {
          const score = alt.scores[crit.id] || 0
          const normalized = normalizeScores(crit.id)
          const normScore = normalized[alt.id] || 0

          if (normScore > 0.5) {
            concordance += crit.weight
          } else {
            discordance += crit.weight
          }
        })

        results[alt.id] = concordance > 0 ? concordance / (concordance + discordance + 0.001) : 0
      })
    }

    return results
  }

  const getMethodMetrics = () => {
    if (method === "topsis") {
      const normalizedMatrix: Record<string, Record<string, number>> = {}
      criteria.forEach((crit) => {
        const scores = alternatives.map((alt) => alt.scores[crit.id] || 0)
        const sumSquares = Math.sqrt(scores.reduce((sum, s) => sum + s * s, 0))
        alternatives.forEach((alt) => {
          if (!normalizedMatrix[alt.id]) normalizedMatrix[alt.id] = {}
          normalizedMatrix[alt.id][crit.id] = sumSquares > 0 ? (alt.scores[crit.id] || 0) / sumSquares : 0
        })
      })

      const idealSolution: Record<string, number> = {}
      const negativeIdeal: Record<string, number> = {}
      criteria.forEach((crit) => {
        const values = alternatives.map((alt) => normalizedMatrix[alt.id][crit.id])
        if (crit.type === "beneficial") {
          idealSolution[crit.id] = Math.max(...values)
          negativeIdeal[crit.id] = Math.min(...values)
        } else {
          idealSolution[crit.id] = Math.min(...values)
          negativeIdeal[crit.id] = Math.max(...values)
        }
      })

      const metrics: Record<string, { distToIdeal: number; distToNegIdeal: number }> = {}
      alternatives.forEach((alt) => {
        let distanceToIdeal = 0
        let distanceToNegativeIdeal = 0
        criteria.forEach((crit) => {
          const weighted = normalizedMatrix[alt.id][crit.id] * crit.weight
          distanceToIdeal += Math.pow(weighted - idealSolution[crit.id] * crit.weight, 2)
          distanceToNegativeIdeal += Math.pow(weighted - negativeIdeal[crit.id] * crit.weight, 2)
        })
        metrics[alt.id] = {
          distToIdeal: Math.sqrt(distanceToIdeal),
          distToNegIdeal: Math.sqrt(distanceToNegativeIdeal),
        }
      })
      return metrics
    } else if (method === "vikor") {
      const fBest: Record<string, number> = {}
      const fWorst: Record<string, number> = {}
      criteria.forEach((crit) => {
        const scores = alternatives.map((alt) => alt.scores[crit.id] || 0)
        if (crit.type === "beneficial") {
          fBest[crit.id] = Math.max(...scores)
          fWorst[crit.id] = Math.min(...scores)
        } else {
          fBest[crit.id] = Math.min(...scores)
          fWorst[crit.id] = Math.max(...scores)
        }
      })

      const metrics: Record<string, { S: number; R: number }> = {}
      alternatives.forEach((alt) => {
        let S = 0
        let R = 0
        criteria.forEach((crit) => {
          const score = alt.scores[crit.id] || 0
          const normalized =
            fBest[crit.id] !== fWorst[crit.id] ? (fBest[crit.id] - score) / (fBest[crit.id] - fWorst[crit.id]) : 0
          S += crit.weight * normalized
          R = Math.max(R, crit.weight * normalized)
        })
        metrics[alt.id] = { S, R }
      })
      return metrics
    }
    return {}
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
    } catch (error) {
      console.error("Error:", error)
      alert("Error calculating results")
    } finally {
      setIsLoading(false)
    }
  }

  const scores = calculateScores()
  const maxScore = Math.max(...Object.values(scores), 0)
  const bestAlternative = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0]
  const methodMetrics = getMethodMetrics()
  const methodInfo = MCDM_METHODS.find((m) => m.value === method)

  if (currentStep === "home") {
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
                    onClick={() => setMethod(m.value)}
                    isActive={method === m.value}
                    className={`text-xs ${method === m.value ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                  >
                    <span>{m.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
                <CardTitle className="text-sm text-black">{methodInfo?.label} Method</CardTitle>
                <CardDescription className="text-xs text-gray-700">{methodInfo?.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {method === "swei" && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-black mb-1">Formulation:</p>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                        Score = Σ(log₂(1/IDM)^Weight)
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-black mb-1">How it works:</p>
                      <p className="text-gray-700">
                        | Step                 | Math Formula                       | Code Equivalent              | Status |
| -------------------- | ---------------------------------- | ---------------------------- | ------ |
| Normalization (Max)  | ( x_{ij} / \sum_i x_{ij} )         | columnSum division           | ✅      |
| Normalization (Min)  | ( (1/x_{ij}) / \sum_i (1/x_{ij}) ) | inverse normalization        | ✅      |
| Information Term     | ( \log_2(1/IDM_{ij}) )             | `Math.log2(1 / (idm + eps))` | ✅      |
| Weighted Exponential | ( (Info_{ij})^{w_j} )              | `Math.pow(info, weight)`     | ✅      |
| SWEI Score           | ( \sum_j (Info_{ij})^{w_j} )       | sum loop                     | ✅      |
. The lower information score is the first ranking
                      </p>
                    </div>
                  </div>
                )}

                {method === "ahp" && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-black mb-1">Formulation:</p>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                        Score = Σ(Normalized Score^Weight)
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-black mb-1">How it works:</p>
                      <p className="text-gray-700">
                        Uses hierarchical decomposition and pairwise comparisons to handle complex decision problems.
                        Excellent for capturing expert judgments and managing dependencies between criteria.
                      </p>
                    </div>
                  </div>
                )}

                {method === "topsis" && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-black mb-1">Formulation:</p>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                        Score = D⁻ / (D⁺ + D⁻)
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        Where D⁺ = distance to ideal solution, D⁻ = distance to negative ideal
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-black mb-1">How it works:</p>
                      <p className="text-gray-700">
                        Finds the alternative closest to the ideal solution and farthest from the negative ideal.
                        Effective for ranking alternatives based on their proximity to best and worst scenarios.
                      </p>
                    </div>
                  </div>
                )}

                {method === "vikor" && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-black mb-1">Formulation:</p>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                        S = Σ(w × (f* - f) / (f* - f⁻)), R = max(w × (f* - f) / (f* - f⁻))
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-black mb-1">How it works:</p>
                      <p className="text-gray-700">
                        Calculates group utility (S) and individual regret (R) to find compromise solutions. Balances
                        majority satisfaction with minority dissatisfaction.
                      </p>
                    </div>
                  </div>
                )}

                {method === "electre" && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-black mb-1">Formulation:</p>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                        Outranking based on Concordance and Discordance indices
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-black mb-1">How it works:</p>
                      <p className="text-gray-700">
                        Builds outranking relations between alternatives using concordance (agreement) and discordance
                        (disagreement) analysis. Handles veto effects and incomparability well.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarProvider>
    )
  }

  if (currentStep === "input") {
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
                    onClick={() => setMethod(m.value)}
                    isActive={method === m.value}
                    className={`text-xs ${method === m.value ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                  >
                    <span>{m.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
          <SidebarHeader className="py-2">
            <h2 className="text-xs font-bold text-black">MCDM Methods</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {MCDM_METHODS.map((m) => (
                <SidebarMenuItem key={m.value}>
                  <SidebarMenuButton
                    onClick={() => setMethod(m.value)}
                    isActive={method === m.value}
                    className={`text-xs ${method === m.value ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                  >
                    <span>{m.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
                Next
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
          <SidebarHeader className="py-2">
            <h2 className="text-xs font-bold text-black">MCDM Methods</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {MCDM_METHODS.map((m) => (
                <SidebarMenuItem key={m.value}>
                  <SidebarMenuButton
                    onClick={() => setMethod(m.value)}
                    isActive={method === m.value}
                    className={`text-xs ${method === m.value ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                  >
                    <span>{m.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
                  onClick={() => setCurrentStep("calculate")}
                  className="bg-black text-white hover:bg-gray-800 text-xs h-8"
                >
                  Calculate
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

            <Card className="border-gray-200 bg-white shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-black">Evaluation Matrix</CardTitle>
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
                              {crit.type === "beneficial" ? "↑" : "↓"} ({crit.weight})
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
                              {alt.scores[crit.id] || "-"}
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
            <SidebarMenu>
              {MCDM_METHODS.map((m) => (
                <SidebarMenuItem key={m.value}>
                  <SidebarMenuButton
                    onClick={() => setMethod(m.value)}
                    isActive={method === m.value}
                    className={`text-xs ${method === m.value ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                  >
                    <span>{m.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 min-h-screen bg-white p-2 md:p-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="md:hidden border-gray-200 text-black" />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-black">Results</h1>
                  <p className="text-xs text-gray-700">{methodInfo?.label} Analysis</p>
                </div>
              </div>
              <Button
                onClick={() => setCurrentStep("matrix")}
                className="bg-black text-white hover:bg-gray-800 text-xs h-8"
              >
                Back
              </Button>
            </div>

            {isLoading ? (
              <Card className="border-gray-200 bg-white shadow-none">
                <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center gap-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <p className="text-xs text-gray-700">Calculating {methodInfo?.label} results...</p>
                </CardContent>
              </Card>
            ) : apiResults ? (
              <>
                <Card className="border-gray-200 bg-white mb-3 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-black">{methodInfo?.label} Dashboard</CardTitle>
                    <CardDescription className="text-xs text-gray-700">{methodInfo?.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {method === "swei" && (
                      <div className="text-xs text-gray-700 space-y-1">
                        <p>
                          <span className="font-semibold text-black">Method:</span> Sum Weighted Exponential Infoemation
                        </p>
                        <p>
                          <span className="font-semibold text-black">Formula:</span> Score = Σ(log₂(1/IDM)^Weight)
                        </p>
                        <p className="text-gray-600">
                          Normalized values are converted to information terms using log₂(1/value), then raised to their
                          weights and summed. Lower scores are better.
                        </p>
                      </div>
                    )}

                    {method === "ahp" && (
                      <div className="text-xs text-gray-700 space-y-1">
                        <p>
                          <span className="font-semibold text-black">Method:</span> Analytic Hierarchy Process
                        </p>
                        <p>
                          <span className="font-semibold text-black">Formula:</span> Score = Σ(log₂(1/IDM)^Weight)
                        </p>
                        <p className="text-gray-600">
                          Uses pairwise comparisons and hierarchical decomposition for complex decision problems.
                        </p>
                      </div>
                    )}

                    {method === "topsis" && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>
                            <span className="font-semibold text-black">Method:</span> TOPSIS (Ideal Solution)
                          </p>
                          <p>
                            <span className="font-semibold text-black">Formula:</span> Score = Distance to Negative
                            Ideal / (Distance to Ideal + Distance to Negative Ideal)
                          </p>
                        </div>
                      </div>
                    )}

                    {method === "vikor" && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-700 space-y-1">
                          <p>
                            <span className="font-semibold text-black">Method:</span> VIKOR (Compromise Ranking)
                          </p>
                          <p>
                            <span className="font-semibold text-black">Metrics:</span> S (group utility) and R
                            (individual regret)
                          </p>
                        </div>
                      </div>
                    )}

                    {method === "electre" && (
                      <div className="text-xs text-gray-700 space-y-1">
                        <p>
                          <span className="font-semibold text-black">Method:</span> ELECTRE (Outranking)
                        </p>
                        <p>
                          <span className="font-semibold text-black">Analysis:</span> Concordance and Discordance
                          indices
                        </p>
                        <p className="text-gray-600">
                          Builds outranking relations between alternatives based on concordance and discordance
                          analysis.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-black">Results</CardTitle>
                    <CardDescription className="text-xs text-gray-700">
                      Information scores and ranking (ascending order)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-2">
                      {apiResults.ranking
                        .sort((a: any, b: any) => a.score - b.score)
                        .map((item: any, index: number) => (
                          <div
                            key={item.alternativeId}
                            className={`p-2 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border ${
                              index === 0 ? "bg-white border-black" : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-bold text-black w-5 text-center">#{index + 1}</div>
                              <div className="min-w-0">
                                <p className="font-semibold text-black text-xs truncate">{item.alternativeName}</p>
                                {index === 0 && <p className="text-xs text-black">🏆 Best Choice</p>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-base font-bold text-black">{item.score.toFixed(4)}</div>
                              <div className="text-xs text-gray-600">Information Score</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-gray-200 bg-white shadow-none">
                <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center gap-4">
                  <p className="text-xs text-gray-700">Click the button below to calculate results</p>
                  <Button onClick={handleCalculate} className="bg-black text-white hover:bg-gray-800 text-xs h-8">
                    Calculate Results
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </SidebarProvider>
    )
  }

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
                  onClick={() => setMethod(m.value)}
                  isActive={method === m.value}
                  className={`text-xs ${method === m.value ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                >
                  <span>{m.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 min-h-screen bg-white p-2 md:p-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden border-gray-200 text-black" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-black">Results</h1>
                <p className="text-xs text-gray-700">{methodInfo?.label} Analysis</p>
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep("matrix")}
              className="bg-black text-white hover:bg-gray-800 text-xs h-8"
            >
              Back
            </Button>
          </div>

          <Card className="border-gray-200 bg-white mb-3 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-black">{methodInfo?.label} Dashboard</CardTitle>
              <CardDescription className="text-xs text-gray-700">{methodInfo?.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {method === "swei" && (
                <div className="text-xs text-gray-700 space-y-1">
                  <p>
                    <span className="font-semibold text-black">Method:</span> Sum Weighted Exponential Infoemation
                  </p>
                  <p>
                    <span className="font-semibold text-black">Formula:</span> Score = Σ(log₂(1/IDM)^Weight)
                  </p>
                  <p className="text-gray-600">
                    Normalized values are converted to information terms using log₂(1/value), then raised to their
                    weights and summed. Lower scores are better.
                  </p>
                </div>
              )}

              {method === "ahp" && (
                <div className="text-xs text-gray-700 space-y-1">
                  <p>
                    <span className="font-semibold text-black">Method:</span> Analytic Hierarchy Process
                  </p>
                  <p>
                    <span className="font-semibold text-black">Formula:</span> Score = Σ(Normalized Score^Weight)
                  </p>
                  <p className="text-gray-600">
                    Uses pairwise comparisons and hierarchical decomposition for complex decision problems.
                  </p>
                </div>
              )}

              {method === "topsis" && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-700 space-y-1">
                    <p>
                      <span className="font-semibold text-black">Method:</span> TOPSIS (Ideal Solution)
                    </p>
                    <p>
                      <span className="font-semibold text-black">Formula:</span> Score = Distance to Negative Ideal /
                      (Distance to Ideal + Distance to Negative Ideal)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {alternatives.map((alt) => (
                      <div key={alt.id} className="p-2 border border-gray-200 rounded text-xs">
                        <p className="font-semibold text-black">{alt.name}</p>
                        <p className="text-gray-700">
                          Distance to Ideal: {(methodMetrics[alt.id]?.distToIdeal || 0).toFixed(3)}
                        </p>
                        <p className="text-gray-700">
                          Distance to Negative Ideal: {(methodMetrics[alt.id]?.distToNegIdeal || 0).toFixed(3)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {method === "vikor" && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-700 space-y-1">
                    <p>
                      <span className="font-semibold text-black">Method:</span> VIKOR (Compromise Ranking)
                    </p>
                    <p>
                      <span className="font-semibold text-black">Metrics:</span> S (group utility) and R (individual
                      regret)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {alternatives.map((alt) => (
                      <div key={alt.id} className="p-2 border border-gray-200 rounded text-xs">
                        <p className="font-semibold text-black">{alt.name}</p>
                        <p className="text-gray-700">S (Group Utility): {(methodMetrics[alt.id]?.S || 0).toFixed(3)}</p>
                        <p className="text-gray-700">
                          R (Individual Regret): {(methodMetrics[alt.id]?.R || 0).toFixed(3)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {method === "electre" && (
                <div className="text-xs text-gray-700 space-y-1">
                  <p>
                    <span className="font-semibold text-black">Method:</span> ELECTRE (Outranking)
                  </p>
                  <p>
                    <span className="font-semibold text-black">Analysis:</span> Concordance and Discordance indices
                  </p>
                  <p className="text-gray-600">
                    Builds outranking relations between alternatives based on concordance and discordance analysis.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-black">Results</CardTitle>
              <CardDescription className="text-xs text-gray-700">Weighted scores and ranking</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                {alternatives
                  .map((alt) => ({
                    ...alt,
                    score: scores[alt.id] || 0,
                  }))
                  .sort((a, b) => b.score - a.score)
                  .map((alt, index) => (
                    <div
                      key={alt.id}
                      className={`p-2 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border ${
                        alt.id === bestAlternative ? "bg-white border-black" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-black w-5 text-center">#{index + 1}</div>
                        <div className="min-w-0">
                          <p className="font-semibold text-black text-xs truncate">{alt.name}</p>
                          {alt.id === bestAlternative && <p className="text-xs text-black">🏆 Best Choice</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-black">{(alt.score * 100).toFixed(1)}%</div>
                        <div className="w-20 md:w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-black rounded-full" style={{ width: `${alt.score * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </SidebarProvider>
  )
}
