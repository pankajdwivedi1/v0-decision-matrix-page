import type { Alternative, Criterion } from "./types"

interface MULTIMOORAResult {
  scores: Record<string, number>
  ratioSystemScores: Record<string, number>
  referencePointScores: Record<string, number>
  fullMultiplicativeScores: Record<string, number>
  ratioSystemRanking: Record<string, number>
  referencePointRanking: Record<string, number>
  fullMultiplicativeRanking: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
}

/**
 * MULTIMOORA (Multi-Objective Optimization by Ratio Analysis plus Full Multiplicative Form)
 *
 * Reference:
 * Brauers, W.K.M., & Zavadskas, E.K. (2010)
 *
 * MULTIMOORA combines three methods:
 * 1. Ratio System (RS) - same as MOORA
 * 2. Reference Point (RP) - uses Tchebycheff distance
 * 3. Full Multiplicative Form (FMF) - product of beneficial / product of non-beneficial
 *
 * Steps:
 * (1) Construct decision matrix X = [x_ij]
 * (2) Normalize using vector normalization: r_ij = x_ij / sqrt(Σ_i x_ij²)
 * (3) Multiply by criterion weight: v_ij = w_j * r_ij
 * (4) Calculate three scores:
 *     - RS: y_i = Σ(beneficial) - Σ(non-beneficial)
 *     - RP: z_i = max_j |v_ij - v_j*| where v_j* is the reference point
 *     - FMF: u_i = (Π beneficial) / (Π non-beneficial)
 * (5) Rank alternatives by each method
 * (6) Combine rankings using dominance theory
 */

export function calculateMULTIMOORA(
  alternatives: Alternative[],
  criteria: Criterion[]
): MULTIMOORAResult {
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

  // Step 3: Apply weights
  const weightedMatrix: number[][] = Array.from({ length: m }, () => Array(n).fill(0))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      weightedMatrix[i][j] = normalizedMatrixArray[i][j] * criteria[j].weight
    }
  }

  // Step 4a: Ratio System (RS) - same as MOORA
  const ratioSystemScores: Record<string, number> = {}
  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    let sumB = 0
    let sumC = 0

    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      const v_ij = weightedMatrix[i][j]

      if (crit.type === "non-beneficial") {
        sumC += v_ij
      } else {
        sumB += v_ij
      }
    }

    ratioSystemScores[altId] = sumB - sumC
  }

  // Step 4b: Reference Point (RP) - Tchebycheff distance
  const referencePointScores: Record<string, number> = {}
  
  // Determine reference point (ideal solution)
  const referencePoint: number[] = []
  for (let j = 0; j < n; j++) {
    const col = weightedMatrix.map((row) => row[j])
    const crit = criteria[j]
    if (crit.type === "beneficial") {
      referencePoint[j] = Math.max(...col)
    } else {
      referencePoint[j] = Math.min(...col)
    }
  }

  // Calculate Tchebycheff distance
  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    let maxDist = 0

    for (let j = 0; j < n; j++) {
      const dist = Math.abs(weightedMatrix[i][j] - referencePoint[j])
      if (dist > maxDist) {
        maxDist = dist
      }
    }

    // Lower distance is better, so we use negative or inverse
    referencePointScores[altId] = maxDist
  }

  // Step 4c: Full Multiplicative Form (FMF)
  const fullMultiplicativeScores: Record<string, number> = {}
  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    let productB = 1
    let productC = 1

    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      const v_ij = Math.max(weightedMatrix[i][j], epsilon) // Avoid zero

      if (crit.type === "non-beneficial") {
        productC *= v_ij
      } else {
        productB *= v_ij
      }
    }

    fullMultiplicativeScores[altId] = productB / (productC + epsilon)
  }

  // Step 5: Create rankings for each method
  const ratioSystemRanking: Record<string, number> = {}
  const referencePointRanking: Record<string, number> = {}
  const fullMultiplicativeRanking: Record<string, number> = {}

  // RS ranking (higher is better)
  const rsSorted = alternatives
    .map((alt) => ({ id: alt.id, score: ratioSystemScores[alt.id] }))
    .sort((a, b) => b.score - a.score)
  rsSorted.forEach((item, index) => {
    ratioSystemRanking[item.id] = index + 1
  })

  // RP ranking (lower is better)
  const rpSorted = alternatives
    .map((alt) => ({ id: alt.id, score: referencePointScores[alt.id] }))
    .sort((a, b) => a.score - b.score)
  rpSorted.forEach((item, index) => {
    referencePointRanking[item.id] = index + 1
  })

  // FMF ranking (higher is better)
  const fmfSorted = alternatives
    .map((alt) => ({ id: alt.id, score: fullMultiplicativeScores[alt.id] }))
    .sort((a, b) => b.score - a.score)
  fmfSorted.forEach((item, index) => {
    fullMultiplicativeRanking[item.id] = index + 1
  })

  // Step 6: Combine rankings using dominance theory
  // Final score = average of normalized rankings (lower is better)
  const scores: Record<string, number> = {}
  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    const rsRank = ratioSystemRanking[altId]
    const rpRank = referencePointRanking[altId]
    const fmfRank = fullMultiplicativeRanking[altId]
    
    // Average ranking (lower average rank = better)
    scores[altId] = (rsRank + rpRank + fmfRank) / 3
  }

  return {
    scores,
    ratioSystemScores,
    referencePointScores,
    fullMultiplicativeScores,
    ratioSystemRanking,
    referencePointRanking,
    fullMultiplicativeRanking,
    normalizedMatrix,
  }
}

