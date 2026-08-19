import type { Alternative, Criterion } from "./types"

export interface CRADISResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  weightedMatrix: Record<string, Record<string, number>>
  idealPositive: Record<string, number>
  idealNegative: Record<string, number>
  distancePlus: Record<string, number>
  distanceMinus: Record<string, number>
}

/**
 * CRADIS (Compromise Ranking of Alternatives from Distance to Ideal Solution) Method
 * Reference: Stević, Ž. et al. (2021), Symmetry.
 */
export function calculateCRADIS(
  alternatives: Alternative[],
  criteria: Criterion[]
): CRADISResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      normalizedMatrix: {},
      weightedMatrix: {},
      idealPositive: {},
      idealNegative: {},
      distancePlus: {},
      distanceMinus: {}
    }
  }

  // 1. Find Max and Min for each criterion
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
        normalizedMatrix[alt.id][crit.id] = maxVals[crit.id] !== 0 ? val / maxVals[crit.id] : 0
      } else {
        normalizedMatrix[alt.id][crit.id] = val !== 0 ? minVals[crit.id] / val : 0
      }
    })
  })

  // 3. Weighted normalized matrix
  const weightedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    weightedMatrix[alt.id] = {}
    criteria.forEach((crit) => {
      weightedMatrix[alt.id][crit.id] = (normalizedMatrix[alt.id][crit.id] || 0) * (crit.weight || 1 / n)
    })
  })

  // 4. Determine Ideal and Anti-Ideal solutions
  const idealPositive: Record<string, number> = {}
  const idealNegative: Record<string, number> = {}

  criteria.forEach((crit) => {
    const colVals = alternatives.map((alt) => weightedMatrix[alt.id][crit.id] || 0)
    idealPositive[crit.id] = Math.max(...colVals)
    idealNegative[crit.id] = Math.min(...colVals)
  })

  // 5. Calculate distances (d+ and d-)
  const distancePlus: Record<string, number> = {}
  const distanceMinus: Record<string, number> = {}

  alternatives.forEach((alt) => {
    let sumSqPlus = 0
    let sumSqMinus = 0
    criteria.forEach((crit) => {
      const v = weightedMatrix[alt.id][crit.id] || 0
      sumSqPlus += Math.pow(v - idealPositive[crit.id], 2)
      sumSqMinus += Math.pow(v - idealNegative[crit.id], 2)
    })
    distancePlus[alt.id] = Math.sqrt(sumSqPlus)
    distanceMinus[alt.id] = Math.sqrt(sumSqMinus)
  })

  // 6. Calculate Utility Score Qi (Compromise evaluation)
  const maxDMinus = Math.max(...Object.values(distanceMinus)) || 1
  const minDPlus = Math.min(...Object.values(distancePlus)) || 0.0001

  const scores: Record<string, number> = {}
  alternatives.forEach((alt) => {
    const term1 = distanceMinus[alt.id] / maxDMinus
    const term2 = (distancePlus[alt.id] || 0.0001) !== 0 ? minDPlus / distancePlus[alt.id] : 0
    // Higher Qi means closer to ideal and farther from anti-ideal
    scores[alt.id] = 0.5 * term1 + 0.5 * term2
  })

  return {
    scores,
    normalizedMatrix,
    weightedMatrix,
    idealPositive,
    idealNegative,
    distancePlus,
    distanceMinus
  }
}
