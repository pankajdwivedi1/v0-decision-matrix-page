import type { Alternative, Criterion } from "./types"

export interface LBWAResult {
  scores: Record<string, number>
  lbwaWeights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  weightedMatrix: Record<string, Record<string, number>>
}

/**
 * LBWA (Level-Based Weight Assessment & Evaluation) Method
 * Reference: Žižović, M., & Pamučar, D. (2019), Expert Systems with Applications.
 */
export function calculateLBWA(
  alternatives: Alternative[],
  criteria: Criterion[],
  elasticityCoefficient: number = 0.5
): LBWAResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      lbwaWeights: {},
      normalizedMatrix: {},
      weightedMatrix: {}
    }
  }

  // 1. Min and Max
  const maxVals: Record<string, number> = {}
  const minVals: Record<string, number> = {}
  criteria.forEach((crit) => {
    const vals = alternatives.map((alt) => Number(alt.scores[crit.id]) || 0)
    maxVals[crit.id] = Math.max(...vals) || 1
    minVals[crit.id] = Math.min(...vals) || 0.0001
  })

  // 2. Normalization
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    normalizedMatrix[alt.id] = {}
    criteria.forEach((crit) => {
      const val = Number(alt.scores[crit.id]) || 0
      if (crit.type === "beneficial") {
        normalizedMatrix[alt.id][crit.id] = val / maxVals[crit.id]
      } else {
        normalizedMatrix[alt.id][crit.id] = val !== 0 ? minVals[crit.id] / val : 0
      }
    })
  })

  // 3. Compute LBWA Level-based Criteria Weights
  // Sort criteria descending by initial weights
  const sortedCriteria = [...criteria].sort((a, b) => (b.weight || 0) - (a.weight || 0))
  const numLevels = Math.min(3, Math.max(1, Math.ceil(n / 2)))
  const rawLBWAWeights: Record<string, number> = {}

  sortedCriteria.forEach((crit, index) => {
    const level = Math.floor((index / n) * numLevels) + 1
    // LBWA elasticity formula
    const scaleFactor = 1 / (1 + (level - 1) * elasticityCoefficient)
    rawLBWAWeights[crit.id] = (crit.weight || 1 / n) * scaleFactor
  })

  // Normalize LBWA weights so they sum to 1.0
  const sumRawWeights = Object.values(rawLBWAWeights).reduce((a, b) => a + b, 0) || 1
  const lbwaWeights: Record<string, number> = {}
  criteria.forEach((crit) => {
    lbwaWeights[crit.id] = (rawLBWAWeights[crit.id] || 1 / n) / sumRawWeights
  })

  // 4. Weighted normalized matrix & final score
  const weightedMatrix: Record<string, Record<string, number>> = {}
  const scores: Record<string, number> = {}

  alternatives.forEach((alt) => {
    weightedMatrix[alt.id] = {}
    let totalScore = 0
    criteria.forEach((crit) => {
      const norm = normalizedMatrix[alt.id][crit.id] || 0
      const w = lbwaWeights[crit.id]
      const weighted = norm * w
      weightedMatrix[alt.id][crit.id] = weighted
      totalScore += weighted
    })
    scores[alt.id] = totalScore
  })

  return {
    scores,
    lbwaWeights,
    normalizedMatrix,
    weightedMatrix
  }
}
