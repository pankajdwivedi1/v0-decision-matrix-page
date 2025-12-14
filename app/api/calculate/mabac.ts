import type { Alternative, Criterion } from "./types"

/**
 * MABAC (Multi-Attributive Border Approximation Area Comparison)
 * Steps:
 * 1. Normalize the decision matrix
 * 2. Calculate the weighted matrix
 * 3. Determine the Border Approximation Area (BAA) matrix
 * 4. Calculate the distance from BAA
 * 5. Rank the alternatives
 */

interface MABACResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  weightedMatrix: Record<string, Record<string, number>>
  borderApproximationArea: Record<string, number>
  distanceMatrix: Record<string, Record<string, number>>
}

export function calculateMABAC(
  alternatives: Alternative[],
  criteria: Criterion[]
): MABACResult {
  const m = alternatives.length
  const n = criteria.length

  // Step 1: Build and normalize matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] || 0)
  )

  const normMatrix: number[][] = matrix.map(() => Array(n).fill(0))
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach(a => normalizedMatrix[a.id] = {})

  for (let j = 0; j < n; j++) {
    const colVals = matrix.map((row) => row[j])
    const crit = criteria[j]
    const minVal = Math.min(...colVals)
    const maxVal = Math.max(...colVals)
    const range = maxVal - minVal

    for (let i = 0; i < m; i++) {
      let val = 0
      if (range > 0) {
        if (crit.type === "beneficial") {
          val = (matrix[i][j] - minVal) / range
        } else {
          val = (maxVal - matrix[i][j]) / range
        }
      }
      normMatrix[i][j] = val
      normalizedMatrix[alternatives[i].id][criteria[j].id] = val
    }
  }

  // Step 2: Calculate the weighted matrix (V)
  const weightedMatrixData: number[][] = normMatrix.map((row) =>
    row.map((val, j) => criteria[j].weight * (val + 1))
  )

  const weightedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach(a => weightedMatrix[a.id] = {})
  weightedMatrixData.forEach((row, i) => {
    row.forEach((val, j) => {
      weightedMatrix[alternatives[i].id][criteria[j].id] = val
    })
  })

  // Step 3: Determine the Border Approximation Area (BAA) matrix (G)
  const borderApproximationArea: Record<string, number> = {}
  const g: number[] = []

  for (let j = 0; j < n; j++) {
    const colVals = weightedMatrixData.map((row) => row[j])
    const product = colVals.reduce((prod, v) => prod * v, 1)
    g[j] = Math.pow(product, 1 / m)
    borderApproximationArea[criteria[j].id] = g[j]
  }

  // Step 4: Calculate the distance from BAA (Q)
  const distanceMatrixData: number[][] = weightedMatrixData.map((row, i) =>
    row.map((val, j) => val - g[j])
  )
  
  const distanceMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach(a => distanceMatrix[a.id] = {})
  distanceMatrixData.forEach((row, i) => {
      row.forEach((val, j) => {
          distanceMatrix[alternatives[i].id][criteria[j].id] = val
      })
  })

  // Step 5: Rank the alternatives
  const scores: Record<string, number> = {}
  for (let i = 0; i < m; i++) {
    const score = distanceMatrixData[i].reduce((sum, val) => sum + val, 0)
    scores[alternatives[i].id] = score
  }

  return {
    scores,
    normalizedMatrix,
    weightedMatrix,
    borderApproximationArea,
    distanceMatrix
  }
}
