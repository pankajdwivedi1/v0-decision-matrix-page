import type { Alternative, Criterion } from "./types"

interface MAIRCAResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  theoreticalRatings: Record<string, Record<string, number>>
  realRatings: Record<string, Record<string, number>>
  gapMatrix: Record<string, Record<string, number>>
  totalGaps: Record<string, number>
}

/**
 * MAIRCA (Multi-Attributive Ideal-Real Comparative Analysis) Method
 *
 * Reference:
 * Pamucar, D., Vasin, L., & Lukovac, L. (2014)
 *
 * Steps:
 * (1) Construct decision matrix X = [x_ij]
 * (2) Normalize the decision matrix (linear normalization)
 * (3) Calculate theoretical ratings: T_pj = w_j * (ideal value for criterion j)
 *     where ideal value = max for beneficial, min for non-beneficial
 * (4) Calculate real ratings: R_pj = w_j * r_ij
 * (5) Calculate gap matrix: g_pj = T_pj - R_pj
 * (6) Calculate total gap for each alternative: G_p = Σ_j g_pj
 * (7) Rank alternatives (lower total gap is better)
 */

export function calculateMAIRCA(
  alternatives: Alternative[],
  criteria: Criterion[]
): MAIRCAResult {
  const epsilon = 1e-12
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      normalizedMatrix: {},
      theoreticalRatings: {},
      realRatings: {},
      gapMatrix: {},
      totalGaps: {},
    }
  }

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] || 0)
  )

  // Step 2: Normalize using linear normalization
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

  // Step 3: Calculate theoretical ratings (ideal values)
  const theoreticalRatings: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    theoreticalRatings[alt.id] = {}
  })

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    const col = normalizedMatrixArray.map((row) => row[j])
    
    // Ideal value: max for beneficial, min for non-beneficial
    const idealValue = crit.type === "beneficial" 
      ? Math.max(...col) 
      : Math.min(...col)
    
    const theoreticalRating = crit.weight * idealValue

    // All alternatives have the same theoretical rating for each criterion
    alternatives.forEach((alt) => {
      theoreticalRatings[alt.id][crit.id] = theoreticalRating
    })
  }

  // Step 4: Calculate real ratings
  const realRatings: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    realRatings[alt.id] = {}
  })

  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      const normalizedValue = normalizedMatrixArray[i][j]
      realRatings[altId][crit.id] = crit.weight * normalizedValue
    }
  }

  // Step 5: Calculate gap matrix
  const gapMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    gapMatrix[alt.id] = {}
  })

  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      const gap = theoreticalRatings[altId][crit.id] - realRatings[altId][crit.id]
      gapMatrix[altId][crit.id] = gap
    }
  }

  // Step 6: Calculate total gap for each alternative
  const totalGaps: Record<string, number> = {}
  const scores: Record<string, number> = {}

  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id
    let totalGap = 0

    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      totalGap += gapMatrix[altId][crit.id]
    }

    totalGaps[altId] = totalGap
    // Lower gap is better, so we use negative for consistency with other methods
    // But actually, we'll keep it positive and mark as ascending method
    scores[altId] = totalGap
  }

  return {
    scores,
    normalizedMatrix,
    theoreticalRatings,
    realRatings,
    gapMatrix,
    totalGaps,
  }
}

