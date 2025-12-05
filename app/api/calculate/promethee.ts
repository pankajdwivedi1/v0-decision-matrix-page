import type { Alternative, Criterion } from "./types"

/**
 * PROMETHEE II (Preference Ranking Organization Method for Enrichment Evaluations)
 *
 * Reference formulation:
 * 1) Build decision matrix X = [x_ij]
 * 2) Normalize the decision matrix (vector normalization)
 * 3) For each pair of alternatives (a, b) and criterion j:
 *      Calculate preference degree P_j(a, b) using linear preference function
 * 4) Calculate aggregated preference degree:
 *      π(a, b) = Σ_j w_j * P_j(a, b)
 * 5) Calculate positive flow (outranking flow):
 *      φ⁺(a) = (1/(m-1)) * Σ_b≠a π(a, b)
 * 6) Calculate negative flow (outranked flow):
 *      φ⁻(a) = (1/(m-1)) * Σ_b≠a π(b, a)
 * 7) Calculate net flow:
 *      φ(a) = φ⁺(a) - φ⁻(a)
 *
 * Higher net flow indicates a better alternative.
 */
export function calculatePROMETHEE(
  alternatives: Alternative[],
  criteria: Criterion[]
): Record<string, number> {
  const scores: Record<string, number> = {}
  const epsilon = 1e-12

  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) return scores
  if (m === 1) {
    scores[alternatives[0].id] = 0
    return scores
  }

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] ?? 0)
  )

  // Step 2: Normalize using vector normalization
  const normalizedMatrix: number[][] = Array.from({ length: m }, () => Array(n).fill(0))

  for (let j = 0; j < n; j++) {
    const colVals = matrix.map((row) => row[j])
    const denom = Math.sqrt(colVals.reduce((sum, v) => sum + v * v, 0)) || epsilon
    for (let i = 0; i < m; i++) {
      normalizedMatrix[i][j] = matrix[i][j] / denom
    }
  }

  // Calculate ranges for each criterion (for preference function)
  const ranges: number[] = []
  for (let j = 0; j < n; j++) {
    const colVals = normalizedMatrix.map((row) => row[j])
    const maxVal = Math.max(...colVals)
    const minVal = Math.min(...colVals)
    ranges[j] = Math.max(maxVal - minVal, epsilon)
  }

  // Step 3 & 4: Calculate preference degrees and aggregated preferences
  // π[i][k] = aggregated preference of alternative i over alternative k
  const pi: number[][] = Array.from({ length: m }, () => Array(m).fill(0))

  for (let i = 0; i < m; i++) {
    for (let k = 0; k < m; k++) {
      if (i === k) {
        pi[i][k] = 0
        continue
      }

      let aggregatedPreference = 0

      for (let j = 0; j < n; j++) {
        const crit = criteria[j]
        const valI = normalizedMatrix[i][j]
        const valK = normalizedMatrix[k][j]
        let preference = 0

        if (crit.type === "beneficial") {
          // For beneficial: prefer higher values
          if (valI > valK) {
            preference = (valI - valK) / ranges[j]
          }
        } else {
          // For non-beneficial: prefer lower values
          if (valK > valI) {
            preference = (valK - valI) / ranges[j]
          }
        }

        aggregatedPreference += crit.weight * preference
      }

      pi[i][k] = aggregatedPreference
    }
  }

  // Step 5 & 6: Calculate positive and negative flows
  const phiPlus: number[] = Array(m).fill(0)
  const phiMinus: number[] = Array(m).fill(0)

  for (let i = 0; i < m; i++) {
    let sumPlus = 0
    let sumMinus = 0

    for (let k = 0; k < m; k++) {
      if (i !== k) {
        sumPlus += pi[i][k] // How much i outranks k
        sumMinus += pi[k][i] // How much k outranks i
      }
    }

    phiPlus[i] = sumPlus / (m - 1)
    phiMinus[i] = sumMinus / (m - 1)
  }

  // Step 7: Calculate net flow
  for (let i = 0; i < m; i++) {
    const netFlow = phiPlus[i] - phiMinus[i]
    scores[alternatives[i].id] = netFlow
  }

  return scores
}

