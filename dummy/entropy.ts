import type { Alternative, Criterion } from "../app/api/calculate/types"

export interface EntropyResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  entropyValues: Record<string, number>
  diversityValues: Record<string, number>
}

/**
 * Entropy Method for Weight Calculation
 * 
 * The entropy method is used to determine objective weights for criteria
 * based on the information content in the decision matrix.
 * 
 * Steps:
 * 1. Build decision matrix X = [x_ij]
 * 2. Normalize the decision matrix:
 *    - For benefit criteria: p_ij = x_ij / Σ_i x_ij
 *    - For cost criteria: p_ij = (1/x_ij) / Σ_i (1/x_ij)
 * 3. Calculate entropy for each criterion:
 *    E_j = -k * Σ_i (p_ij * ln(p_ij))
 *    where k = 1/ln(m) and m is the number of alternatives
 * 4. Calculate diversity degree:
 *    d_j = 1 - E_j
 * 5. Calculate weights:
 *    w_j = d_j / Σ_j d_j
 * 
 * Higher entropy means more uncertainty, so lower weight.
 * Lower entropy means more information, so higher weight.
 */
export function calculateEntropyWeights(
  alternatives: Alternative[],
  criteria: Criterion[]
): EntropyResult {
  const epsilon = 1e-12
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      weights: {},
      normalizedMatrix: {},
      entropyValues: {},
      diversityValues: {},
    }
  }

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => {
      const value = alt.scores[crit.id] ?? 0
      return value <= 0 ? epsilon : value // Handle zero or negative values
    })
  )

  // Step 2: Normalize the decision matrix
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => (normalizedMatrix[alt.id] = {}))

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    const colVals = matrix.map((row) => row[j])

    if (crit.type === "non-beneficial") {
      // For cost criteria: use inverse values
      const inv = colVals.map((v) => 1 / v)
      const invSum = inv.reduce((sum, val) => sum + val, 0) || epsilon
      alternatives.forEach((alt, i) => {
        normalizedMatrix[alt.id][crit.id] = inv[i] / invSum
      })
    } else {
      // For benefit criteria: use direct values
      const sum = colVals.reduce((sum, val) => sum + val, 0) || epsilon
      alternatives.forEach((alt, i) => {
        normalizedMatrix[alt.id][crit.id] = colVals[i] / sum
      })
    }
  }

  // Step 3: Calculate entropy for each criterion
  const k = 1 / Math.log(m) // Normalization constant
  const entropyValues: Record<string, number> = {}

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    let entropy = 0

    for (let i = 0; i < m; i++) {
      const p_ij = normalizedMatrix[alternatives[i].id][crit.id]
      if (p_ij > epsilon) {
        entropy += p_ij * Math.log(p_ij)
      }
    }

    entropyValues[crit.id] = -k * entropy
  }

  // Step 4: Calculate diversity degree
  const diversityValues: Record<string, number> = {}
  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    diversityValues[crit.id] = 1 - entropyValues[crit.id]
  }

  // Step 5: Calculate weights
  const weights: Record<string, number> = {}
  const totalDiversity = Object.values(diversityValues).reduce(
    (sum, val) => sum + val,
    0
  ) || epsilon

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    weights[crit.id] = diversityValues[crit.id] / totalDiversity
  }

  return {
    weights,
    normalizedMatrix,
    entropyValues,
    diversityValues,
  }
}

