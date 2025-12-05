import type { Alternative, Criterion } from "./types"

interface CODASResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  negativeIdealSolution: Record<string, number>
  euclideanDistances: Record<string, number>
  taxicabDistances: Record<string, number>
  relativeAssessmentScores: Record<string, number>
}

/**
 * CODAS (Combinative Distance-based Assessment) Method
 *
 * Reference:
 * Keshavarz Ghorabaee, M., Zavadskas, E.K., Turskis, Z., & Antucheviciene, J. (2016)
 *
 * Steps:
 * (1) Construct decision matrix X = [x_ij]
 * (2) Normalize the decision matrix (linear normalization)
 * (3) Determine negative-ideal solution (NIS)
 * (4) Calculate Euclidean distance from NIS: d_i^E = sqrt(Σ w_j * (x_ij - NIS_j)^2)
 * (5) Calculate Taxicab distance from NIS: d_i^T = Σ w_j * |x_ij - NIS_j|
 * (6) Calculate relative assessment score: RA_i = d_i^E + τ * d_i^T
 * (7) Rank alternatives (higher RA_i is better)
 *
 * Parameters:
 * - τ (tau) = 0.02 (threshold parameter, typically 0.01-0.05)
 */

export function calculateCODAS(
  alternatives: Alternative[],
  criteria: Criterion[],
  tau: number = 0.02
): CODASResult {
  const epsilon = 1e-12
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      normalizedMatrix: {},
      negativeIdealSolution: {},
      euclideanDistances: {},
      taxicabDistances: {},
      relativeAssessmentScores: {},
    }
  }

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] || 0)
  )

  // Step 2: Normalize using linear normalization
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => (normalizedMatrix[alt.id] = {}))

  const normalizedMatrixArray: number[][] = Array.from({ length: m }, () => Array(n).fill(0))

  for (let j = 0; j < n; j++) {
    const colVals = matrix.map((row) => row[j])
    const maxVal = Math.max(...colVals)
    const minVal = Math.min(...colVals)
    const range = maxVal - minVal || epsilon

    for (let i = 0; i < m; i++) {
      const crit = criteria[j]
      let normalizedValue: number

      if (crit.type === "beneficial") {
        normalizedValue = (colVals[i] - minVal) / range
      } else {
        // non-beneficial
        normalizedValue = (maxVal - colVals[i]) / range
      }

      normalizedMatrixArray[i][j] = normalizedValue
      normalizedMatrix[alternatives[i].id][criteria[j].id] = normalizedValue
    }
  }

  // Step 3: Determine negative-ideal solution (NIS)
  const negativeIdealSolution: Record<string, number> = {}
  for (let j = 0; j < n; j++) {
    const col = normalizedMatrixArray.map((row) => row[j])
    const crit = criteria[j]
    
    if (crit.type === "beneficial") {
      // For beneficial criteria, NIS is the minimum (worst)
      negativeIdealSolution[crit.id] = Math.min(...col)
    } else {
      // For non-beneficial criteria, NIS is the maximum (worst)
      negativeIdealSolution[crit.id] = Math.max(...col)
    }
  }

  // Step 4: Calculate Euclidean distance from NIS
  const euclideanDistances: Record<string, number> = {}
  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    let sum = 0

    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      const diff = normalizedMatrixArray[i][j] - negativeIdealSolution[crit.id]
      sum += crit.weight * diff * diff
    }

    euclideanDistances[altId] = Math.sqrt(sum)
  }

  // Step 5: Calculate Taxicab (Manhattan) distance from NIS
  const taxicabDistances: Record<string, number> = {}
  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    let sum = 0

    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      const diff = Math.abs(normalizedMatrixArray[i][j] - negativeIdealSolution[crit.id])
      sum += crit.weight * diff
    }

    taxicabDistances[altId] = sum
  }

  // Step 6: Calculate relative assessment score
  const relativeAssessmentScores: Record<string, number> = {}
  const scores: Record<string, number> = {}
  
  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    const ra = euclideanDistances[altId] + tau * taxicabDistances[altId]
    relativeAssessmentScores[altId] = ra
    scores[altId] = ra
  }

  return {
    scores,
    normalizedMatrix,
    negativeIdealSolution,
    euclideanDistances,
    taxicabDistances,
    relativeAssessmentScores,
  }
}

