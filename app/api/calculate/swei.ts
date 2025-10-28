import type { Alternative, Criterion } from "./types"

interface SWEIResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  informationMatrix: Record<string, Record<string, number>>
}

/**
 * SWEI (Sum-Weighted Exponential Information) Calculation
 *
 * Algorithm:
 * 1. Normalize the decision matrix (IDM)
 *    - For MAX criteria: divide by column sum
 *    - For MIN criteria: divide 1/value by column sum of 1/values
 * 2. Calculate information term: log2(1/IDM)
 * 3. Apply weighted exponential: (Info)^weight
 * 4. Sum all terms for each alternative
 */

export function calculateSWEI(alternatives: Alternative[], criteria: Criterion[]): SWEIResult {
  const epsilon = 1e-12
  const m = alternatives.length
  const n = criteria.length

  // Build decision matrix
  const matrix: number[][] = alternatives.map((alt) => criteria.map((crit) => alt.scores[crit.id] || 0))

  // Handle zero or negative values
  const processedMatrix = matrix.map((row) => row.map((val) => (val <= 0 ? epsilon : val)))

  // Step 1: Normalize (IDM - Inverse Decision Matrix)
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt, i) => {
    normalizedMatrix[alt.id] = {}
  })

  for (let j = 0; j < n; j++) {
    const criterion = criteria[j]
    const columnValues = processedMatrix.map((row) => row[j])

    if (criterion.type === "non-beneficial") {
      // MIN criteria: use inverse normalization
      const inverseValues = columnValues.map((val) => 1 / val)
      const inverseSum = inverseValues.reduce((sum, val) => sum + val, 0)

      alternatives.forEach((alt, i) => {
        normalizedMatrix[alt.id][criterion.id] = inverseValues[i] / inverseSum
      })
    } else {
      // MAX criteria: standard normalization
      const columnSum = columnValues.reduce((sum, val) => sum + val, 0)

      alternatives.forEach((alt, i) => {
        normalizedMatrix[alt.id][criterion.id] = columnValues[i] / columnSum
      })
    }
  }

  // Step 2: Calculate information term (log2(1/IDM))
  const informationMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    informationMatrix[alt.id] = {}
  })

  for (const altId in normalizedMatrix) {
    for (const critId in normalizedMatrix[altId]) {
      const idmValue = normalizedMatrix[altId][critId]
      informationMatrix[altId][critId] = Math.log2(1 / (idmValue + epsilon))
    }
  }

  // Step 3 & 4: Apply weighted exponential and sum
  const scores: Record<string, number> = {}

  alternatives.forEach((alt) => {
    let totalScore = 0

    criteria.forEach((crit) => {
      const infoValue = informationMatrix[alt.id][crit.id]
      const weightedTerm = Math.pow(infoValue, crit.weight)
      totalScore += weightedTerm
    })

    scores[alt.id] = totalScore
  })

  return {
    scores,
    normalizedMatrix,
    informationMatrix,
  }
}
