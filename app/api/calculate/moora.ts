import type { Alternative, Criterion } from "./types"

interface MOORAResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  weightedMatrix: Record<string, Record<string, number>>
  beneficialSum: Record<string, number>
  nonBeneficialSum: Record<string, number>
}

/**
 * MOORA (Multi-Objective Optimization by Ratio Analysis) Method
 *
 * Reference:
 * Brauers, W.K.M., & Zavadskas, E.K. (2006, 2010)
 *
 * Steps:
 * (1) Construct decision matrix X = [x_ij]
 * (2) Normalize using vector normalization:
 *     r_ij = x_ij / sqrt(Σ_i x_ij²)
 * (3) Multiply by criterion weight: v_ij = w_j * r_ij
 * (4) For each alternative:
 *     B_i = Σ (w_j * r_ij) for beneficial criteria
 *     C_i = Σ (w_j * r_ij) for non-beneficial criteria
 *     Yi = B_i - C_i
 * (5) Rank alternatives by Yi (higher is better)
 */

export function calculateMOORA(
  alternatives: Alternative[],
  criteria: Criterion[]
): MOORAResult {
  const epsilon = 1e-12
  const m = alternatives.length
  const n = criteria.length

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] || 0)
  )

  // Step 2: Normalize by vector normalization
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => (normalizedMatrix[alt.id] = {}))

  for (let j = 0; j < n; j++) {
    const column = matrix.map((row) => row[j])
    const denom = Math.sqrt(column.reduce((sum, val) => sum + val * val, 0)) || epsilon

    for (let i = 0; i < m; i++) {
      normalizedMatrix[alternatives[i].id][criteria[j].id] = matrix[i][j] / denom
    }
  }

  // Step 3–4: Compute weighted sums & Weighted Matrix
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
      const r_ij = normalizedMatrix[altId][crit.id]
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
    scores[altId] = sumB - sumC
  }

  return {
    scores,
    normalizedMatrix,
    weightedMatrix,
    beneficialSum,
    nonBeneficialSum,
  }
}
