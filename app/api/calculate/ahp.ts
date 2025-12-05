import type { Criterion } from "./types"

export interface AHPResult {
  weights: Record<string, number>
  pairwiseMatrix: number[][]
  normalizedMatrix: number[][]
  lambdaMax: number
  consistencyIndex: number
  consistencyRatio: number
}

// Saaty's Random Consistency Index values for n = 1..15
const RI: Record<number, number> = {
  1: 0.0,
  2: 0.0,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
  11: 1.51,
  12: 1.48,
  13: 1.56,
  14: 1.57,
  15: 1.59,
}

/**
 * AHP (Analytic Hierarchy Process) weight calculation.
 *
 * Assumption:
 * - We use the provided criterion weights as priority scores to derive
 *   a consistent pairwise comparison matrix: a_ij = w_i / w_j.
 * - This avoids requiring additional pairwise input while remaining
 *   compatible with the AHP eigenvector approach.
 */
export function calculateAHP(criteria: Criterion[]): AHPResult {
  const n = criteria.length
  if (n === 0) {
    return {
      weights: {},
      pairwiseMatrix: [],
      normalizedMatrix: [],
      lambdaMax: 0,
      consistencyIndex: 0,
      consistencyRatio: 0,
    }
  }

  // Normalize the provided weights to positive values
  const rawWeights = criteria.map((c) => (c.weight > 0 ? c.weight : 1e-6))
  const sumRaw = rawWeights.reduce((s, v) => s + v, 0) || 1
  const baseWeights = rawWeights.map((v) => v / sumRaw)

  // Build pairwise matrix a_ij = w_i / w_j
  const pairwiseMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      pairwiseMatrix[i][j] = baseWeights[i] / baseWeights[j]
    }
  }

  // Normalize pairwise matrix by columns
  const normalizedMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  for (let j = 0; j < n; j++) {
    let colSum = 0
    for (let i = 0; i < n; i++) colSum += pairwiseMatrix[i][j]
    const denom = colSum || 1e-12
    for (let i = 0; i < n; i++) normalizedMatrix[i][j] = pairwiseMatrix[i][j] / denom
  }

  // Eigenvector approximation: average rows of normalized matrix
  const weights: number[] = normalizedMatrix.map((row) => row.reduce((s, v) => s + v, 0) / n)

  // Consistency metrics
  // λ_max from A*w / w
  let lambdaSum = 0
  for (let i = 0; i < n; i++) {
    let rowSum = 0
    for (let j = 0; j < n; j++) {
      rowSum += pairwiseMatrix[i][j] * weights[j]
    }
    lambdaSum += rowSum / (weights[i] || 1e-12)
  }
  const lambdaMax = lambdaSum / n
  const consistencyIndex = n > 1 ? (lambdaMax - n) / (n - 1) : 0
  const ri = RI[n] ?? RI[15]
  const consistencyRatio = ri > 0 ? consistencyIndex / ri : 0

  // Map to criterion ids
  const weightMap: Record<string, number> = {}
  for (let i = 0; i < n; i++) {
    weightMap[criteria[i].id] = weights[i]
  }

  return {
    weights: weightMap,
    pairwiseMatrix,
    normalizedMatrix,
    lambdaMax,
    consistencyIndex,
    consistencyRatio,
  }
}


