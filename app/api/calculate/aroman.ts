import type { Alternative, Criterion } from "./types"

export interface AROMANResult {
  scores: Record<string, number>
  step1NormalizedMatrix: Record<string, Record<string, number>>
  step2NormalizedMatrix: Record<string, Record<string, number>>
  weightedMatrix: Record<string, Record<string, number>>
  sumValues: Record<string, number>
  productValues: Record<string, number>
}

/**
 * AROMAN (Alternative Ranking Order Method Accounting for Two-Step Normalization) Method
 * Reference: Tešić, D., & Marinković, D. (2022), Symmetry.
 */
export function calculateAROMAN(
  alternatives: Alternative[],
  criteria: Criterion[],
  beta: number = 0.5
): AROMANResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      step1NormalizedMatrix: {},
      step2NormalizedMatrix: {},
      weightedMatrix: {},
      sumValues: {},
      productValues: {}
    }
  }

  // 1. Min and Max
  const minVals: Record<string, number> = {}
  const maxVals: Record<string, number> = {}
  criteria.forEach((crit) => {
    const vals = alternatives.map((alt) => Number(alt.scores[crit.id]) || 0)
    minVals[crit.id] = Math.min(...vals)
    maxVals[crit.id] = Math.max(...vals)
  })

  // 2. Step 1: Linear Min-Max Normalization
  const step1NormalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    step1NormalizedMatrix[alt.id] = {}
    criteria.forEach((crit) => {
      const val = Number(alt.scores[crit.id]) || 0
      const range = (maxVals[crit.id] - minVals[crit.id]) || 1
      if (crit.type === "beneficial") {
        step1NormalizedMatrix[alt.id][crit.id] = (val - minVals[crit.id]) / range
      } else {
        step1NormalizedMatrix[alt.id][crit.id] = (maxVals[crit.id] - val) / range
      }
    })
  })

  // 3. Step 2: Vector Normalization applied on Step 1 output
  const colSumSquares: Record<string, number> = {}
  criteria.forEach((crit) => {
    const sumSq = alternatives.reduce((acc, alt) => {
      const v = (step1NormalizedMatrix[alt.id][crit.id] || 0) + 0.001
      return acc + v * v
    }, 0)
    colSumSquares[crit.id] = Math.sqrt(sumSq) || 1
  })

  const step2NormalizedMatrix: Record<string, Record<string, number>> = {}
  const weightedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    step2NormalizedMatrix[alt.id] = {}
    weightedMatrix[alt.id] = {}
    criteria.forEach((crit) => {
      const v1 = (step1NormalizedMatrix[alt.id][crit.id] || 0) + 0.001
      const r2 = v1 / colSumSquares[crit.id]
      step2NormalizedMatrix[alt.id][crit.id] = r2
      weightedMatrix[alt.id][crit.id] = r2 * (crit.weight || 1 / n)
    })
  })

  // 4. Calculate Linear Sum (S_i) and Multiplicative Power (P_i)
  const sumValues: Record<string, number> = {}
  const productValues: Record<string, number> = {}
  const scores: Record<string, number> = {}

  alternatives.forEach((alt) => {
    let sum = 0
    let prod = 1
    criteria.forEach((crit) => {
      const v = weightedMatrix[alt.id][crit.id] || 0
      const r2 = step2NormalizedMatrix[alt.id][crit.id] || 0.001
      const w = crit.weight || 1 / n
      sum += v
      prod *= Math.pow(Math.max(r2, 0.0001), w)
    })

    sumValues[alt.id] = sum
    productValues[alt.id] = prod
    scores[alt.id] = beta * sum + (1 - beta) * prod
  })

  return {
    scores,
    step1NormalizedMatrix,
    step2NormalizedMatrix,
    weightedMatrix,
    sumValues,
    productValues
  }
}
