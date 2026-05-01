import type { Alternative, Criterion } from "./types"

/**
 * SPOTIS (Stable Preference Ordering Towards Ideal Solution)
 * 
 * Steps:
 * 1. Identify the bounds [S_min, S_max] for each criterion.
 * 2. Define the ideal solution S_best (max for beneficial, min for non-beneficial).
 * 3. Calculate normalized distances d_ij = |A_ij - S_best,j| / (S_max,j - S_min,j).
 * 4. Aggregate: Score_i = sum(w_j * d_ij).
 * 5. Rank: Ascending (Lower score is better).
 */

export interface SPOTISResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  distanceMatrix: Record<string, Record<string, number>>
  bounds: Record<string, { min: number; max: number; best: number }>
}

export function calculateSPOTIS(
  alternatives: Alternative[],
  criteria: Criterion[]
): SPOTISResult {
  const m = alternatives.length
  const n = criteria.length

  const scores: Record<string, number> = {}
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  const distanceMatrix: Record<string, Record<string, number>> = {}
  const bounds: Record<string, { min: number; max: number; best: number }> = {}

  alternatives.forEach(alt => {
    normalizedMatrix[alt.id] = {}
    distanceMatrix[alt.id] = {}
  })

  // Step 1 & 2: Identify bounds and best solution
  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    const colVals = alternatives.map(alt => Number(alt.scores[crit.id]) || 0)
    const min = Math.min(...colVals)
    const max = Math.max(...colVals)
    
    // In SPOTIS, if min == max, we use a range of 1 to avoid division by zero
    const range = (max - min) === 0 ? 1 : (max - min)
    const best = crit.type === "beneficial" ? max : min

    bounds[crit.id] = { min, max, best }

    // Step 3: Calculate distances
    for (let i = 0; i < m; i++) {
      const alt = alternatives[i]
      const val = Number(alt.scores[crit.id]) || 0
      
      // Normalized value (just for display/intermediate step)
      normalizedMatrix[alt.id][crit.id] = val
      
      // Distance from ideal
      const distance = Math.abs(val - best) / range
      distanceMatrix[alt.id][crit.id] = distance
    }
  }

  // Step 4: Aggregate
  for (let i = 0; i < m; i++) {
    const alt = alternatives[i]
    let totalScore = 0
    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      totalScore += crit.weight * distanceMatrix[alt.id][crit.id]
    }
    scores[alt.id] = totalScore
  }

  return {
    scores,
    normalizedMatrix,
    distanceMatrix,
    bounds
  }
}
