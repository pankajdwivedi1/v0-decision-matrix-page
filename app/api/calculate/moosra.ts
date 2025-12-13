import type { Alternative, Criterion } from "./types"

interface MOOSRAResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  weightedMatrix: Record<string, Record<string, number>>
  beneficialSum: Record<string, number>
  nonBeneficialSum: Record<string, number>
}

/**
 * MOOSRA (Multi-Objective Optimization on the basis of Simple Ratio Analysis) Method
 *
 * Reference:
 * Brauers, W.K.M., & Zavadskas, E.K. (2006). "The MOORA method and its application to privatization 
 * in a transition economy." Control and Cybernetics, 35(2), 445-469.
 *
 * Steps:
 * (1) Construct decision matrix X = [x_ij]
 * (2) Normalize using vector normalization: r_ij = x_ij / sqrt(Σ_i x_ij²)
 * (3) Apply weights: v_ij = w_j * r_ij
 * (4) For each alternative:
 *     - Sum beneficial criteria: Σ (w_j * r_ij) for beneficial
 *     - Sum non-beneficial criteria: Σ (w_j * r_ij) for non-beneficial
 *     - Performance score: v_i = (beneficial sum) / max(1, non-beneficial sum)
 * (5) Rank alternatives by v_i (higher is better)
 *
 * Note: When non-beneficial sum is 0 or very small (all beneficial criteria),
 * score = beneficial sum / 1 to avoid artificial inflation
 */

export function calculateMOOSRA(
  alternatives: Alternative[],
  criteria: Criterion[]
): MOOSRAResult {
  const epsilon = 1e-12
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      normalizedMatrix: {},
      weightedMatrix: {},
      beneficialSum: {},
      nonBeneficialSum: {},
    }
  }

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] || 0)
  )

  // Step 2: Normalize by vector normalization
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => (normalizedMatrix[alt.id] = {}))

  const normalizedMatrixArray: number[][] = Array.from({ length: m }, () => Array(n).fill(0))

  for (let j = 0; j < n; j++) {
    const column = matrix.map((row) => row[j])
    const denom = Math.sqrt(column.reduce((sum, val) => sum + val * val, 0)) || epsilon

    for (let i = 0; i < m; i++) {
      const normalizedValue = matrix[i][j] / denom
      normalizedMatrixArray[i][j] = normalizedValue
      normalizedMatrix[alternatives[i].id][criteria[j].id] = normalizedValue
    }
  }

  // Step 3 & 4: Compute weighted sums and performance scores
  const weightedMatrix: Record<string, Record<string, number>> = {}
  const beneficialSum: Record<string, number> = {}
  const nonBeneficialSum: Record<string, number> = {}
  const scores: Record<string, number> = {}

  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    let sumB = 0
    let sumC = 0
    weightedMatrix[altId] = {}

    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      const r_ij = normalizedMatrixArray[i][j]
      const weighted = r_ij * crit.weight

      weightedMatrix[altId][crit.id] = weighted

      if (crit.type === "non-beneficial") {
        sumC += weighted
      } else {
        sumB += weighted
      }
    }

    beneficialSum[altId] = sumB
    nonBeneficialSum[altId] = sumC

    // Performance score: ratio of beneficial to non-beneficial
    // Standard MOOSRA uses score = sumB / sumC. However, when there are no non-beneficial
    // criteria (sumC === 0) dividing by a tiny epsilon produces extremely large numbers.
    // In that case we will show the beneficial sum itself as the score (so score == sumB),
    // which matches the common expectation when only beneficial criteria exist.
    if (Math.abs(sumC) < epsilon) {
      // No non-beneficial contribution: use beneficial sum as final score
      scores[altId] = sumB
    } else {
      scores[altId] = sumB / sumC
    }
  }

  return {
    scores,
    normalizedMatrix,
    weightedMatrix,
    beneficialSum,
    nonBeneficialSum,
  }
}

