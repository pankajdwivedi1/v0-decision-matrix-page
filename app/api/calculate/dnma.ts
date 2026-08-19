import type { Alternative, Criterion } from "./types"

export interface DNMAResult {
  scores: Record<string, number>
  linearNormMatrix: Record<string, Record<string, number>>
  vectorNormMatrix: Record<string, Record<string, number>>
  weightedLinear: Record<string, Record<string, number>>
  weightedVector: Record<string, Record<string, number>>
  linearScores: Record<string, number>
  vectorScores: Record<string, number>
}

/**
 * DNMA (Double Normalization-based Multiple Aggregation) Method
 * Reference: Liao, H. et al. (2021), Information Sciences.
 */
export function calculateDNMA(
  alternatives: Alternative[],
  criteria: Criterion[]
): DNMAResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      linearNormMatrix: {},
      vectorNormMatrix: {},
      weightedLinear: {},
      weightedVector: {},
      linearScores: {},
      vectorScores: {}
    }
  }

  // 1. Calculate Min, Max, and Vector Sum-of-Squares
  const minVals: Record<string, number> = {}
  const maxVals: Record<string, number> = {}
  const vectorDenoms: Record<string, number> = {}

  criteria.forEach((crit) => {
    const vals = alternatives.map((alt) => Number(alt.scores[crit.id]) || 0)
    minVals[crit.id] = Math.min(...vals)
    maxVals[crit.id] = Math.max(...vals)
    const sumSq = vals.reduce((acc, v) => acc + v * v, 0)
    vectorDenoms[crit.id] = Math.sqrt(sumSq) || 1
  })

  // 2. Double Normalization (Linear + Vector)
  const linearNormMatrix: Record<string, Record<string, number>> = {}
  const vectorNormMatrix: Record<string, Record<string, number>> = {}
  const weightedLinear: Record<string, Record<string, number>> = {}
  const weightedVector: Record<string, Record<string, number>> = {}

  alternatives.forEach((alt) => {
    linearNormMatrix[alt.id] = {}
    vectorNormMatrix[alt.id] = {}
    weightedLinear[alt.id] = {}
    weightedVector[alt.id] = {}

    criteria.forEach((crit) => {
      const val = Number(alt.scores[crit.id]) || 0
      const range = (maxVals[crit.id] - minVals[crit.id]) || 1
      const w = crit.weight || 1 / n

      // Linear
      const lin = crit.type === "beneficial" ? (val - minVals[crit.id]) / range : (maxVals[crit.id] - val) / range
      linearNormMatrix[alt.id][crit.id] = lin
      weightedLinear[alt.id][crit.id] = lin * w

      // Vector
      const vec = val / vectorDenoms[crit.id]
      vectorNormMatrix[alt.id][crit.id] = vec
      weightedVector[alt.id][crit.id] = vec * w
    })
  })

  // 3. Multiple Aggregation Sub-scores
  const linearScores: Record<string, number> = {}
  const vectorScores: Record<string, number> = {}
  const scores: Record<string, number> = {}

  alternatives.forEach((alt) => {
    const sLinear = criteria.reduce((acc, crit) => acc + (weightedLinear[alt.id][crit.id] || 0), 0)
    const sVector = criteria.reduce((acc, crit) => {
      const v = vectorNormMatrix[alt.id][crit.id] || 0
      const w = crit.weight || 1 / n
      return acc + (crit.type === "beneficial" ? w * v : -w * v)
    }, 0)

    linearScores[alt.id] = sLinear
    vectorScores[alt.id] = sVector
    // Aggregated score
    scores[alt.id] = 0.5 * sLinear + 0.5 * (sVector + 1) / 2
  })

  return {
    scores,
    linearNormMatrix,
    vectorNormMatrix,
    weightedLinear,
    weightedVector,
    linearScores,
    vectorScores
  }
}
