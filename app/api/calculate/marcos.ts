import type { Alternative, Criterion } from "./types"

interface MARCOSResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  weightedMatrix: Record<string, Record<string, number>>
  utilityDegrees: Record<string, number>
  idealSolution: Record<string, number>
  antiIdealSolution: Record<string, number>
}

/**
 * MARCOS (Measurement of Alternatives and Ranking according to Compromise Solution) Method
 *
 * Reference:
 * Stevic, Z., Pamucar, D., Puška, A., & Chatterjee, P. (2020)
 *
 * Steps:
 * (1) Construct decision matrix X = [x_ij]
 * (2) Create extended matrix with ideal (AI) and anti-ideal (AAI) solutions
 * (3) Normalize the extended matrix
 * (4) Apply weights to get weighted normalized matrix
 * (5) Calculate utility degrees relative to ideal and anti-ideal
 * (6) Calculate final utility function
 * (7) Rank alternatives (higher utility is better)
 */

export function calculateMARCOS(
  alternatives: Alternative[],
  criteria: Criterion[]
): MARCOSResult {
  const epsilon = 1e-12
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      normalizedMatrix: {},
      weightedMatrix: {},
      utilityDegrees: {},
      idealSolution: {},
      antiIdealSolution: {},
    }
  }

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] || 0)
  )

  // Step 2: Determine ideal (AI) and anti-ideal (AAI) solutions
  const idealSolution: Record<string, number> = {}
  const antiIdealSolution: Record<string, number> = {}

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    const colVals = matrix.map((row) => row[j]).filter(val => val > 0)
    
    if (colVals.length === 0) {
      idealSolution[crit.id] = 0
      antiIdealSolution[crit.id] = 0
      continue
    }
    
    if (crit.type === "beneficial") {
      idealSolution[crit.id] = Math.max(...colVals)
      antiIdealSolution[crit.id] = Math.min(...colVals)
    } else {
      // non-beneficial
      idealSolution[crit.id] = Math.min(...colVals)
      antiIdealSolution[crit.id] = Math.max(...colVals)
    }
  }

  // Step 3: Create extended matrix and normalize
  // Extended matrix includes alternatives + ideal + anti-ideal solutions
  // First, find max and min values in extended matrix (including ideal and anti-ideal)
  const maxValues: number[] = []
  const minValues: number[] = []

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    const colVals = matrix.map((row) => row[j])
    const extendedVals = [...colVals, idealSolution[crit.id], antiIdealSolution[crit.id]].filter(v => v > 0)
    
    if (extendedVals.length === 0) {
      maxValues[j] = 1
      minValues[j] = 1
    } else {
      maxValues[j] = Math.max(...extendedVals)
      minValues[j] = Math.min(...extendedVals)
    }
  }

  // Normalize the decision matrix
  // For beneficial: n_ij = x_ij / x_max
  // For non-beneficial: n_ij = x_min / x_ij
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => (normalizedMatrix[alt.id] = {}))

  const normalizedMatrixArray: number[][] = Array.from({ length: m }, () => Array(n).fill(0))

  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      const x_ij = matrix[i][j]
      
      let normalizedValue: number
      if (crit.type === "beneficial") {
        normalizedValue = maxValues[j] > epsilon ? x_ij / maxValues[j] : 0
      } else {
        normalizedValue = x_ij > epsilon ? minValues[j] / x_ij : 0
      }

      normalizedMatrixArray[i][j] = normalizedValue
      normalizedMatrix[altId][crit.id] = normalizedValue
    }
  }

  // Normalize ideal and anti-ideal solutions
  const normalizedIdeal: number[] = []
  const normalizedAntiIdeal: number[] = []

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    const x_ideal = idealSolution[crit.id]
    const x_antiIdeal = antiIdealSolution[crit.id]
    
    if (crit.type === "beneficial") {
      normalizedIdeal[j] = maxValues[j] > epsilon ? x_ideal / maxValues[j] : 1
      normalizedAntiIdeal[j] = maxValues[j] > epsilon ? x_antiIdeal / maxValues[j] : 0
    } else {
      normalizedIdeal[j] = x_ideal > epsilon ? minValues[j] / x_ideal : 1
      normalizedAntiIdeal[j] = x_antiIdeal > epsilon ? minValues[j] / x_antiIdeal : 0
    }
  }

  // Step 4: Apply weights to get weighted normalized matrix
  const weightedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => (weightedMatrix[alt.id] = {}))

  const weightedMatrixArray: number[][] = Array.from({ length: m }, () => Array(n).fill(0))

  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      const weightedValue = normalizedMatrixArray[i][j] * crit.weight
      weightedMatrixArray[i][j] = weightedValue
      weightedMatrix[altId][crit.id] = weightedValue
    }
  }

  // Calculate weighted ideal and anti-ideal
  const weightedIdeal: number[] = []
  const weightedAntiIdeal: number[] = []

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    weightedIdeal[j] = normalizedIdeal[j] * crit.weight
    weightedAntiIdeal[j] = normalizedAntiIdeal[j] * crit.weight
  }

  // Step 5: Calculate utility degrees
  // Utility degree relative to ideal: K_i^- = S_i / S_ideal
  // Utility degree relative to anti-ideal: K_i^+ = S_i / S_antiIdeal
  // where S_i = sum of weighted normalized values for alternative i

  const utilityDegrees: Record<string, number> = {}
  const scores: Record<string, number> = {}

  // Calculate S values for alternatives
  const sValues: number[] = []
  for (let i = 0; i < m; i++) {
    const s_i = weightedMatrixArray[i].reduce((sum, val) => sum + val, 0)
    sValues[i] = s_i
  }

  // Calculate S for ideal and anti-ideal
  const sIdeal = weightedIdeal.reduce((sum, val) => sum + val, 0)
  const sAntiIdeal = weightedAntiIdeal.reduce((sum, val) => sum + val, 0)

  // Calculate utility degrees and final utility function
  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    const s_i = sValues[i]

    // Calculate utility degrees
    const k_i_minus = sIdeal > epsilon ? s_i / sIdeal : 0
    const k_i_plus = sAntiIdeal > epsilon ? s_i / sAntiIdeal : 0

    // Final utility function using standard MARCOS formula
    // f(K_i) = K_i^+ / (K_i^+ + K_i^-)
    // This gives values between 0 and 1, where higher is better
    const denominator = k_i_plus + k_i_minus
    const utility = denominator > epsilon ? k_i_plus / denominator : 0

    utilityDegrees[altId] = utility
    scores[altId] = utility
  }

  return {
    scores,
    normalizedMatrix,
    weightedMatrix,
    utilityDegrees,
    idealSolution,
    antiIdealSolution,
  }
}

