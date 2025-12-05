import type { Alternative, Criterion } from "./types"

interface TODIMResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  relativeWeights: Record<string, number>
  dominanceMatrix: Record<string, Record<string, number>>
}

/**
 * TODIM (Tomada de Decisão Interativa e Multicritério) Method
 *
 * Reference:
 * Gomes, L.F.A.M., & Lima, M.M.P.P. (1992)
 * Based on Prospect Theory
 *
 * Steps:
 * (1) Construct decision matrix X = [x_ij]
 * (2) Normalize the decision matrix (min-max normalization)
 * (3) Calculate relative weights: w_k^r = w_k / w_max
 * (4) Calculate dominance degree for each pair of alternatives:
 *     Φ_k(A_i, A_j) = w_k^r * (z_ik - z_jk)^α if z_ik >= z_jk (gain)
 *     Φ_k(A_i, A_j) = -λ * w_k^r * (z_jk - z_ik)^β if z_ik < z_jk (loss)
 * (5) Calculate overall dominance: δ(A_i, A_j) = Σ_k Φ_k(A_i, A_j)
 * (6) Calculate global value: ξ_i = Σ_j δ(A_i, A_j)
 * (7) Normalize global values: ξ_i^norm = (ξ_i - ξ_min) / (ξ_max - ξ_min)
 * (8) Rank alternatives (higher is better)
 *
 * Parameters:
 * - α = 0.88 (gain parameter)
 * - β = 0.88 (loss parameter)
 * - λ = 2.25 (loss aversion coefficient)
 */

export function calculateTODIM(
  alternatives: Alternative[],
  criteria: Criterion[],
  alpha: number = 0.88,
  beta: number = 0.88,
  lambda: number = 2.25
): TODIMResult {
  const epsilon = 1e-12
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      normalizedMatrix: {},
      relativeWeights: {},
      dominanceMatrix: {},
    }
  }

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] || 0)
  )

  // Step 2: Normalize using min-max normalization
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

  // Step 3: Calculate relative weights (normalized by maximum weight)
  const weights = criteria.map((crit) => crit.weight)
  const maxWeight = Math.max(...weights) || epsilon
  const relativeWeights: Record<string, number> = {}
  criteria.forEach((crit) => {
    relativeWeights[crit.id] = crit.weight / maxWeight
  })

  // Step 4 & 5: Calculate dominance matrix
  const dominanceMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    dominanceMatrix[alt.id] = {}
    alternatives.forEach((alt2) => {
      dominanceMatrix[alt.id][alt2.id] = 0
    })
  })

  // For each pair of alternatives
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      if (i === j) continue

      let overallDominance = 0

      // For each criterion
      for (let k = 0; k < n; k++) {
        const crit = criteria[k]
        const z_ik = normalizedMatrixArray[i][k]
        const z_jk = normalizedMatrixArray[j][k]
        const w_k_r = relativeWeights[crit.id]

        let dominance_k = 0

        if (z_ik >= z_jk) {
          // Gain: Φ_k(A_i, A_j) = w_k^r * (z_ik - z_jk)^α
          const diff = z_ik - z_jk
          dominance_k = w_k_r * Math.pow(diff, alpha)
        } else {
          // Loss: Φ_k(A_i, A_j) = -λ * w_k^r * (z_jk - z_ik)^β
          const diff = z_jk - z_ik
          dominance_k = -lambda * w_k_r * Math.pow(diff, beta)
        }

        overallDominance += dominance_k
      }

      dominanceMatrix[alternatives[i].id][alternatives[j].id] = overallDominance
    }
  }

  // Step 6: Calculate global value for each alternative
  const globalValues: Record<string, number> = {}
  alternatives.forEach((alt) => {
    let sum = 0
    alternatives.forEach((alt2) => {
      sum += dominanceMatrix[alt.id][alt2.id]
    })
    globalValues[alt.id] = sum
  })

  // Step 7: Normalize global values
  const globalValuesArray = Object.values(globalValues)
  const maxGlobal = Math.max(...globalValuesArray)
  const minGlobal = Math.min(...globalValuesArray)
  const rangeGlobal = maxGlobal - minGlobal || epsilon

  const scores: Record<string, number> = {}
  alternatives.forEach((alt) => {
    scores[alt.id] = (globalValues[alt.id] - minGlobal) / rangeGlobal
  })

  return {
    scores,
    normalizedMatrix,
    relativeWeights,
    dominanceMatrix,
  }
}

