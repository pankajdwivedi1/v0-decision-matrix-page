import type { Alternative, Criterion } from "./types"

export interface PROMETHEE2Result {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  preferenceMatrix: Record<string, Record<string, Record<string, number>>>
  aggregatedPreferenceMatrix: Record<string, Record<string, number>>
  positiveFlow: Record<string, number>
  negativeFlow: Record<string, number>
}

/**
 * PROMETHEE II (Preference Ranking Organization Method for Enrichment Evaluations)
 *
 * PROMETHEE II provides a complete ranking based on net flow.
 * Unlike PROMETHEE I which provides partial preorder, PROMETHEE II uses:
 * - Net flow φ(a) = φ⁺(a) - φ⁻(a) for complete ranking
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
export function calculatePROMETHEE2(
  alternatives: Alternative[],
  criteria: Criterion[]
): PROMETHEE2Result {
  const scores: Record<string, number> = {}
  const epsilon = 1e-12

  const m = alternatives.length
  const n = criteria.length

  const emptyResult: PROMETHEE2Result = {
    scores: {},
    normalizedMatrix: {},
    preferenceMatrix: {},
    aggregatedPreferenceMatrix: {},
    positiveFlow: {},
    negativeFlow: {},
  }

  if (m === 0 || n === 0) return emptyResult
  if (m === 1) {
    const altId = alternatives[0].id
    emptyResult.scores[altId] = 0
    return emptyResult
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
  const preferenceMatrix: number[][][] = Array.from({ length: m }, () =>
    Array.from({ length: m }, () => Array(n).fill(0))
  )

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
        preferenceMatrix[i][k][j] = preference

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

  // Step 7: Calculate net flow (PROMETHEE II characteristic)
  for (let i = 0; i < m; i++) {
    const netFlow = phiPlus[i] - phiMinus[i]
    scores[alternatives[i].id] = netFlow
  }

  // Format results for JSON response
  const result: PROMETHEE2Result = {
    scores,
    normalizedMatrix: {},
    preferenceMatrix: {},
    aggregatedPreferenceMatrix: {},
    positiveFlow: {},
    negativeFlow: {},
  }

  alternatives.forEach((alt, i) => {
    result.normalizedMatrix[alt.id] = {}
    criteria.forEach((crit, j) => {
      result.normalizedMatrix[alt.id][crit.id] = normalizedMatrix[i][j]
    })
  })

  alternatives.forEach((altI, i) => {
    result.preferenceMatrix[altI.id] = {}
    alternatives.forEach((altK, k) => {
      result.preferenceMatrix[altI.id][altK.id] = {}
      criteria.forEach((crit, j) => {
        result.preferenceMatrix[altI.id][altK.id][crit.id] = preferenceMatrix[i][k][j]
      })
    })
  })

  alternatives.forEach((altI, i) => {
    result.aggregatedPreferenceMatrix[altI.id] = {}
    alternatives.forEach((altK, k) => {
      result.aggregatedPreferenceMatrix[altI.id][altK.id] = pi[i][k]
    })
  })

  alternatives.forEach((alt, i) => {
    result.positiveFlow[alt.id] = phiPlus[i]
    result.negativeFlow[alt.id] = phiMinus[i]
  })

  return result
}

