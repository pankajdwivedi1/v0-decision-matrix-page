import { type NextRequest, NextResponse } from "next/server"
import { calculateSWEI } from "./swei"
import type { CalculationRequest, CalculationResponse, Alternative, Criterion } from "./types"

function normalizeScores(alternatives: Alternative[], criteria: Criterion[], critId: string): Record<string, number> {
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

function calculateTOPSIS(alternatives: Alternative[], criteria: Criterion[]): Record<string, number> {
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

  const results: Record<string, number> = {}
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

  return results
}

function calculateAHP(alternatives: Alternative[], criteria: Criterion[]): Record<string, number> {
  const results: Record<string, number> = {}

  alternatives.forEach((alt) => {
    let totalScore = 0
    let totalWeight = 0

    criteria.forEach((crit) => {
      const normalized = normalizeScores(alternatives, criteria, crit.id)
      const score = normalized[alt.id] || 0
      totalScore += Math.pow(score, crit.weight)
      totalWeight += crit.weight
    })

    results[alt.id] = totalWeight > 0 ? totalScore / totalWeight : 0
  })

  return results
}

function calculateVIKOR(alternatives: Alternative[], criteria: Criterion[]): Record<string, number> {
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

  const results: Record<string, number> = {}
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

  return results
}

function calculateELECTRE(alternatives: Alternative[], criteria: Criterion[]): Record<string, number> {
  const results: Record<string, number> = {}

  alternatives.forEach((alt) => {
    let concordance = 0
    let discordance = 0

    criteria.forEach((crit) => {
      const score = alt.scores[crit.id] || 0
      const normalized = normalizeScores(alternatives, criteria, crit.id)
      const normScore = normalized[alt.id] || 0

      if (normScore > 0.5) {
        concordance += crit.weight
      } else {
        discordance += crit.weight
      }
    })

    results[alt.id] = concordance > 0 ? concordance / (concordance + discordance + 0.001) : 0
  })

  return results
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculationRequest = await request.json()

    // Validate input
    if (!body.method || !body.alternatives || !body.criteria) {
      return NextResponse.json({ error: "Missing required fields: method, alternatives, criteria" }, { status: 400 })
    }

    let results: Record<string, number> = {}

    // Calculate based on method
    switch (body.method) {
      case "swei":
        const sweiResult = calculateSWEI(body.alternatives, body.criteria)
        results = sweiResult.scores
        break
      case "topsis":
        results = calculateTOPSIS(body.alternatives, body.criteria)
        break
      case "ahp":
        results = calculateAHP(body.alternatives, body.criteria)
        break
      case "vikor":
        results = calculateVIKOR(body.alternatives, body.criteria)
        break
      case "electre":
        results = calculateELECTRE(body.alternatives, body.criteria)
        break
      default:
        return NextResponse.json({ error: "Invalid method" }, { status: 400 })
    }

    // Create ranking
    const ranking = body.alternatives
      .map((alt) => ({
        alternativeId: alt.id,
        alternativeName: alt.name,
        score: results[alt.id] || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
        percentage: (item.score * 100).toFixed(1),
      }))

    const bestAlternative = ranking[0]

    const response: CalculationResponse = {
      method: body.method,
      results,
      ranking,
      bestAlternative: {
        id: bestAlternative.alternativeId,
        name: bestAlternative.alternativeName,
        score: bestAlternative.score,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Calculation error:", error)
    return NextResponse.json({ error: "Internal server error during calculation" }, { status: 500 })
  }
}
