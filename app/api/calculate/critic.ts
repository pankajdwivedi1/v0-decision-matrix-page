import type { Alternative, Criterion } from "./types"

export interface CriticResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  standardDeviations: Record<string, number>
  correlationMatrix: Record<string, Record<string, number>>
  informationAmounts: Record<string, number>
}

/**
 * CRITIC Method for Weight Calculation
 * 
 * CRITIC (Criteria Importance Through Intercriteria Correlation) is an objective
 * weighting method that determines weights based on both the contrast intensity
 * (standard deviation) and the conflict between criteria (correlation).
 * 
 * Steps:
 * 1. Build decision matrix X = [x_ij]
 * 2. Normalize the decision matrix:
 *    - For beneficial criteria: r_ij = (x_ij - min_i(x_ij)) / (max_i(x_ij) - min_i(x_ij))
 *    - For non-beneficial criteria: r_ij = (max_i(x_ij) - x_ij) / (max_i(x_ij) - min_i(x_ij))
 * 3. Calculate standard deviation for each criterion:
 *    σ_j = sqrt((1/m) * Σ_{i=1}^{m} (r_ij - r̄_j)²)
 *    where r̄_j = (1/m) * Σ_{i=1}^{m} r_ij
 * 4. Calculate correlation matrix between criteria:
 *    r_jk = Σ_{i=1}^{m} (r_ij - r̄_j)(r_ik - r̄_k) / sqrt(Σ_{i=1}^{m} (r_ij - r̄_j)² * Σ_{i=1}^{m} (r_ik - r̄_k)²)
 * 5. Calculate amount of information for each criterion:
 *    C_j = σ_j * Σ_{k=1}^{n} (1 - r_jk)
 * 6. Calculate weights:
 *    w_j = C_j / Σ_{j=1}^{n} C_j
 * 
 * Higher C_j means more information and contrast, so higher weight.
 */
export function calculateCritic(
  alternatives: Alternative[],
  criteria: Criterion[]
): CriticResult {
  const epsilon = 1e-12
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      weights: {},
      normalizedMatrix: {},
      standardDeviations: {},
      correlationMatrix: {},
      informationAmounts: {},
    }
  }

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] ?? 0)
  )

  // Step 2: Normalize the decision matrix
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
      normalizedMatrix[alternatives[i].id][crit.id] = normalizedValue
    }
  }

  // Step 3: Calculate standard deviation for each criterion
  const standardDeviations: Record<string, number> = {}
  const means: number[] = []

  for (let j = 0; j < n; j++) {
    // Calculate mean
    let mean = 0
    for (let i = 0; i < m; i++) {
      mean += normalizedMatrixArray[i][j]
    }
    mean = mean / m
    means[j] = mean

    // Calculate variance and standard deviation
    let variance = 0
    for (let i = 0; i < m; i++) {
      const diff = normalizedMatrixArray[i][j] - mean
      variance += diff * diff
    }
    variance = variance / m
    const stdDev = Math.sqrt(variance) || epsilon
    standardDeviations[criteria[j].id] = stdDev
  }

  // Step 4: Calculate correlation matrix
  const correlationMatrix: Record<string, Record<string, number>> = {}
  criteria.forEach((crit) => (correlationMatrix[crit.id] = {}))

  for (let j = 0; j < n; j++) {
    for (let k = 0; k < n; k++) {
      if (j === k) {
        correlationMatrix[criteria[j].id][criteria[k].id] = 1.0
      } else {
        // Calculate correlation coefficient between criteria j and k
        let numerator = 0
        let sumSqJ = 0
        let sumSqK = 0

        for (let i = 0; i < m; i++) {
          const diffJ = normalizedMatrixArray[i][j] - means[j]
          const diffK = normalizedMatrixArray[i][k] - means[k]
          numerator += diffJ * diffK
          sumSqJ += diffJ * diffJ
          sumSqK += diffK * diffK
        }

        const denominator = Math.sqrt(sumSqJ * sumSqK) || epsilon
        const correlation = numerator / denominator

        // Clamp correlation to [-1, 1] range
        const clampedCorrelation = Math.max(-1, Math.min(1, correlation))
        correlationMatrix[criteria[j].id][criteria[k].id] = clampedCorrelation
      }
    }
  }

  // Step 5: Calculate amount of information for each criterion
  const informationAmounts: Record<string, number> = {}

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    const stdDev = standardDeviations[crit.id]
    let sumCorrelation = 0

    for (let k = 0; k < n; k++) {
      const correlation = correlationMatrix[crit.id][criteria[k].id]
      sumCorrelation += 1 - correlation
    }

    informationAmounts[crit.id] = stdDev * sumCorrelation
  }

  // Step 6: Calculate weights
  const weights: Record<string, number> = {}
  const totalInformation = Object.values(informationAmounts).reduce(
    (sum, val) => sum + val,
    0
  ) || epsilon

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    weights[crit.id] = informationAmounts[crit.id] / totalInformation
  }

  return {
    weights,
    normalizedMatrix,
    standardDeviations,
    correlationMatrix,
    informationAmounts,
  }
}

