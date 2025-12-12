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
  weightedMatrix: Record<string, Record<string, number>> // Added
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
  const weightedMatrixRecord: Record<string, Record<string, number>> = {} // To return

  for (let i = 0; i < m; i++) {
    weightedMatrixRecord[alternatives[i].id] = {}
    for (let j = 0; j < n; j++) {
      const val = normalizedMatrixArray[i][j] * criteria[j].weight
      weightedMatrix[i][j] = val
      weightedMatrixRecord[alternatives[i].id][criteria[j].id] = val
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
      referencePoint[j] = Math.min(...col) // Min is ideal for non-beneficial? Wait.
      // Reference point approach (Min-Max Metric):
      // Usually r_i = max_j { w_j * | (f*_j - f_ij) / (f*_j - f-_j) | } etc...
      // But for MULTIMOORA RP:
      // Reference Point coordinates r_j are:
      // max_i x*_ij for beneficial
      // min_i x*_ij for non-beneficial
      // (where x* are weighted normalized values)
      // So yes, max for beneficial, min for non-beneficial.
      referencePoint[j] = Math.min(...col)
    }
  }

  // Calculate Tchebycheff distance: max_j | v_ij - r_j |
  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    let maxDist = 0

    for (let j = 0; j < n; j++) {
      const dist = Math.abs(weightedMatrix[i][j] - referencePoint[j])
      if (dist > maxDist) {
        maxDist = dist
      }
    }

    // Lower distance is better.
    // However, for consistency in scoring (higher is better), we might invert this later for final ranking?
    // MULTIMOORA usually ranks RP by ascending order (lower is better).
    referencePointScores[altId] = maxDist
  }

  // Step 4c: Full Multiplicative Form (FMF)
  // Usually uses decision matrix X values, not weighted normalized?
  // Brauers & Zavadskas (2010): "The Full Multiplicative Form... U_i = A_i / B_i"
  // where A_i = product of x_ij (beneficial), B_i = product of x_ij (non-beneficial).
  // Some versions use weighted normalized values. The previous code used weighted values.
  // Standard FMF typically uses original values x_ij, but let's stick to previous implementation for consistency unless it's wrong.
  // Actually, standard MULTIMOORA uses: "formulas of the ratio system" which uses normalized measurements.
  // For FMF: "U'_i = (Product_j x_ij) / ..."
  // Let's stick with the existing logic: product of weighted normalized values? Or just x_ij?
  // The previous implementation used `weightedMatrix`.

  const fullMultiplicativeScores: Record<string, number> = {}
  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    let productB = 1
    let productC = 1

    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      // Previous impl used weightedMatrix values.
      const v_ij = Math.max(matrix[i][j], epsilon) // Let's use MATRIX values (x_ij) for FMF standard?
      // Wait, Brauers (2010): "The Full Multiplicative Form... does not need normalization..."
      // So using `matrix[i][j]` is correct for standard FMF.
      // But let's check what the previous code did: it used `weightedMatrix`.
      // If I change it now, it might change results drastically.
      // I will keep it as it was to avoid breaking changes, but be aware.
      // Actually, looking at the previous code lines 136: `const v_ij = Math.max(weightedMatrix[i][j], epsilon)`
      // I will preserve that behavior.
      const val = Math.max(weightedMatrix[i][j], epsilon)

      if (crit.type === "non-beneficial") {
        productC *= val
      } else {
        productB *= val
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
  // Final score = average of rankings (lower is better, since rank 1 is best)
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
    weightedMatrix: weightedMatrixRecord,
  }
}

