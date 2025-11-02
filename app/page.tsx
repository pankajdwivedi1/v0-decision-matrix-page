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

type MCDMMethod = "swei" | "swi" | "topsis" | "vikor" | "waspas" | "edas" | "moora" | "cocoso"
type PageStep = "home" | "input" | "table" | "matrix" | "calculate"

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
    description: "Simple Weighted Index",
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
    value: "cocoso", 
    label: "COCOSO", 
    description: "Combined Compromise Solution",
    formula: "Score = (kₐ × S + kb × P + kc × (S×P)/(S+P))"
  },
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
                <div className="space-y-2 text-xs">
                  <div>
                    <p className="font-semibold text-black mb-1">Formula:</p>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
                      {methodInfo?.formula}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-black mb-1">Description:</p>
                    <p className="text-gray-700">{methodInfo?.description}</p>
                  </div>
                </div>
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
                    onClick={() => {
                      setMethod(m.value)
                      setApiResults(null)
                    }}
                    isActive={method === m.value}
                    className={`text-xs ${method === m.value ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
                  >
                    <span>{m.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
