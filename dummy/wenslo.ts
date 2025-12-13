import type { Alternative, Criterion } from "../app/api/calculate/types"

export interface WensloResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  wensloValues: Record<string, number>
  diversityValues: Record<string, number> // Kept for compatibility, can be empty or used for steps
}

export function calculateWensloWeights(
  alternatives: Alternative[],
  criteria: Criterion[]
): WensloResult {
  const weights: Record<string, number> = {}
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  const wensloValues: Record<string, number> = {} // criterion statistical score (S_j)
  const diversityValues: Record<string, number> = {} // not used in new formula, keeping empty for compatibility

  // 1. Min/Max for each criterion
  const minMax: Record<string, { min: number; max: number }> = {}

  criteria.forEach((crit) => {
    let min = Infinity
    let max = -Infinity
    alternatives.forEach((alt) => {
      const val = alt.scores[crit.id]
      if (val < min) min = val
      if (val > max) max = val
    })
    minMax[crit.id] = { min, max }
  })

  // 2. Normalization (r_ij)
  alternatives.forEach((alt) => {
    normalizedMatrix[alt.id] = {}
    criteria.forEach((crit) => {
      const val = alt.scores[crit.id]
      const { min, max } = minMax[crit.id]
      const range = max - min
      let normVal = 0

      if (range === 0) {
        normVal = 1 // Avoid division by zero if all values are same
      } else {
        if (crit.type === "beneficial") {
          normVal = (val - min) / range
        } else {
          normVal = (max - val) / range
        }
      }
      normalizedMatrix[alt.id][crit.id] = normVal
    })
  })

  // 3. Criterion Statistical Score (S_j = Sum(r_ij))
  let totalScoreSum = 0
  criteria.forEach((crit) => {
    let sum = 0
    alternatives.forEach((alt) => {
      sum += normalizedMatrix[alt.id][crit.id]
    })
    wensloValues[crit.id] = sum
    totalScoreSum += sum
  })

  // 4. Wenslo Weights (w_j = s_j / Sum(s_k))
  criteria.forEach((crit) => {
    if (totalScoreSum === 0) {
      weights[crit.id] = 1 / criteria.length
    } else {
      weights[crit.id] = wensloValues[crit.id] / totalScoreSum
    }
    // Fill diversityValues with 0 as it's not part of this specific WENSLO variant
    diversityValues[crit.id] = 0
  })

  return {
    weights,
    normalizedMatrix,
    wensloValues,
    diversityValues, // sending empty/zeros
  }
}
