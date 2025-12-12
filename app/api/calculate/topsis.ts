import type { Alternative, Criterion } from "./types"

/**
 * TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
 * Steps:
 * 1. Normalize the decision matrix
 * 2. Apply weights to the normalized matrix
 * 3. Determine positive & negative ideal solutions
 * 4. Compute Euclidean distances
 * 5. Compute closeness coefficients and rank
 */

interface TOPSISResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  weightedMatrix: Record<string, Record<string, number>>
  idealBest: Record<string, number>
  idealWorst: Record<string, number>
  distances: Record<string, { positive: number; negative: number }>
}

export function calculateTOPSIS(
  alternatives: Alternative[],
  criteria: Criterion[]
): TOPSISResult {
  const m = alternatives.length
  const n = criteria.length

  // Step 1: Build and normalize matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] || 0)
  )

  const normMatrix = matrix.map(() => Array(n).fill(0))
  // To store keyed normalized matrix
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach(a => normalizedMatrix[a.id] = {})

  for (let j = 0; j < n; j++) {
    const colVals = matrix.map((row) => row[j])
    const denom = Math.sqrt(colVals.reduce((sum, v) => sum + v * v, 0)) || 1
    for (let i = 0; i < m; i++) {
      const val = matrix[i][j] / denom
      normMatrix[i][j] = val
      normalizedMatrix[alternatives[i].id][criteria[j].id] = val
    }
  }

  // Step 2: Apply weights
  const weightedMatrixData = normMatrix.map((row) =>
    row.map((val, j) => val * criteria[j].weight)
  )

  const weightedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach(a => weightedMatrix[a.id] = {})
  weightedMatrixData.forEach((row, i) => {
    row.forEach((val, j) => {
      weightedMatrix[alternatives[i].id][criteria[j].id] = val
    })
  })

  // Step 3: Determine ideal and negative-ideal solutions
  const ideal: number[] = []
  const nadir: number[] = []

  const idealBest: Record<string, number> = {}
  const idealWorst: Record<string, number> = {}

  for (let j = 0; j < n; j++) {
    const col = weightedMatrixData.map((row) => row[j])
    const crit = criteria[j]
    if (crit.type === "beneficial") {
      ideal[j] = Math.max(...col)
      nadir[j] = Math.min(...col)
    } else {
      ideal[j] = Math.min(...col)
      nadir[j] = Math.max(...col)
    }
    idealBest[crit.id] = ideal[j]
    idealWorst[crit.id] = nadir[j]
  }

  // Step 4: Compute distances
  const distPlus: number[] = []
  const distMinus: number[] = []
  const distances: Record<string, { positive: number; negative: number }> = {}

  for (let i = 0; i < m; i++) {
    let dPlus = 0
    let dMinus = 0
    for (let j = 0; j < n; j++) {
      dPlus += Math.pow(weightedMatrixData[i][j] - ideal[j], 2)
      dMinus += Math.pow(weightedMatrixData[i][j] - nadir[j], 2)
    }
    distPlus[i] = Math.sqrt(dPlus)
    distMinus[i] = Math.sqrt(dMinus)

    distances[alternatives[i].id] = {
      positive: distPlus[i],
      negative: distMinus[i]
    }
  }

  // Step 5: Closeness coefficient
  const scores: Record<string, number> = {}
  for (let i = 0; i < m; i++) {
    const cc =
      distPlus[i] + distMinus[i] > 0
        ? distMinus[i] / (distPlus[i] + distMinus[i])
        : 0
    scores[alternatives[i].id] = cc
  }

  return {
    scores,
    normalizedMatrix,
    weightedMatrix,
    idealBest,
    idealWorst,
    distances
  }
}
