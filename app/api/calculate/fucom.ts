import type { Criterion } from "./types"

/**
 * FUCOM (Full Consistency Method)
 * 
 * Steps:
 * 1. Rank the criteria according to their importance (priority scores).
 * 2. Calculate the comparative priority of criteria.
 * 3. Calculate the weights of criteria based on full consistency.
 */

export interface FUCOMResult {
  weights: Record<string, number>
  rankedCriteria: string[]
  comparativePriorities: Record<string, number>
  comparativeWeights: Record<string, number>
}

export function calculateFUCOM(
  criteria: Criterion[],
  priorityScores: Record<string, number>
): FUCOMResult {
  const n = criteria.length
  
  // Step 1: Rank criteria by priority scores (higher score = more important)
  // If scores are equal, maintain alphabetical order or provided order
  const sortedCriteria = [...criteria].sort((a, b) => {
    const scoreA = priorityScores[a.id] || 0
    const scoreB = priorityScores[b.id] || 0
    if (scoreB !== scoreA) return scoreB - scoreA
    return a.id.localeCompare(b.id)
  })

  const rankedIds = sortedCriteria.map(c => c.id)

  // Step 2: Calculate comparative priority phi_k/(k+1)
  // phi is the ratio of importance between adjacent ranked criteria
  const phi: Record<string, number> = {}
  for (let k = 0; k < n - 1; k++) {
    const idCurr = rankedIds[k]
    const idNext = rankedIds[k+1]
    const scoreCurr = priorityScores[idCurr] || 1
    const scoreNext = priorityScores[idNext] || 1
    
    // phi = scoreCurr / scoreNext
    phi[`${idCurr}/${idNext}`] = scoreCurr / scoreNext
  }

  // Step 3: Calculate weights based on consistency
  // w_k / w_{k+1} = phi_k/(k+1) => w_{k+1} = w_k / phi_k/(k+1)
  // We can start with w_1 = 1 and then normalize later
  const tempWeights: Record<string, number> = {}
  tempWeights[rankedIds[0]] = 1

  for (let k = 0; k < n - 1; k++) {
    const idCurr = rankedIds[k]
    const idNext = rankedIds[k+1]
    const phiVal = phi[`${idCurr}/${idNext}`] || 1
    tempWeights[idNext] = tempWeights[idCurr] / phiVal
  }

  // Normalize weights
  const sumWeights = Object.values(tempWeights).reduce((sum, w) => sum + w, 0)
  const finalWeights: Record<string, number> = {}
  Object.keys(tempWeights).forEach(id => {
    finalWeights[id] = tempWeights[id] / sumWeights
  })

  return {
    weights: finalWeights,
    rankedCriteria: rankedIds,
    comparativePriorities: phi,
    comparativeWeights: tempWeights
  }
}
