import type { Alternative, Criterion } from "./types"

interface SWIResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  informationMatrix: Record<string, Record<string, number>>
  weightedInformationMatrix: Record<string, Record<string, number>>
}

/**
 * SWI (Sum Weighted Information) Method
 *
 * Steps:
 * 1. Build decision matrix
 * 2. Normalize:
 *    - Benefit: a_ij / Σ_i a_ij
 *    - Cost: (1 / a_ij) / Σ_i (1 / a_ij)
 * 3. Compute log2(1 / normalized)
 * 4. Apply weights and sum → SWI_i
 * 5. Rank: smaller SWI_i = better alternative
 */

export function calculateSWI(
  alternatives: Alternative[],
  criteria: Criterion[]
): SWIResult {
  const epsilon = 1e-12
  const m = alternatives.length
  const n = criteria.length

  // Build decision matrix
  const matrix: number[][] = alternatives.map(a =>
    criteria.map(c => a.scores[c.id] ?? 0)
  )

  // Handle zero or negative
  const processed = matrix.map(row => row.map(v => (v <= 0 ? epsilon : v)))

  // Step 1: Normalize (IDM)
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach(a => (normalizedMatrix[a.id] = {}))

  for (let j = 0; j < n; j++) {
    const crit = criteria[j]
    const colVals = processed.map(r => r[j])

    if (crit.type === "non-beneficial") {
      const inv = colVals.map(v => 1 / v)
      const invSum = inv.reduce((s, v) => s + v, 0)
      alternatives.forEach((a, i) => {
        normalizedMatrix[a.id][crit.id] = inv[i] / invSum
      })
    } else {
      const sum = colVals.reduce((s, v) => s + v, 0)
      alternatives.forEach((a, i) => {
        normalizedMatrix[a.id][crit.id] = colVals[i] / sum
      })
    }
  }

  // Step 2: Compute log2(1 / IDM)
  const informationMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach(a => (informationMatrix[a.id] = {}))

  for (const altId in normalizedMatrix) {
    for (const critId in normalizedMatrix[altId]) {
      const idm = normalizedMatrix[altId][critId]
      informationMatrix[altId][critId] = Math.log2(1 / (idm + epsilon))
    }
  }

  // Step 3: Apply weights and sum (SWI_i)
  const scores: Record<string, number> = {}
  const weightedInformationMatrix: Record<string, Record<string, number>> = {}

  alternatives.forEach(a => {
    let swi = 0
    weightedInformationMatrix[a.id] = {}

    criteria.forEach(c => {
      const info = informationMatrix[a.id][c.id]
      const weightedInfo = (c.weight || 0) * info
      weightedInformationMatrix[a.id][c.id] = weightedInfo
      swi += weightedInfo
    })
    scores[a.id] = swi
  })

  return { scores, normalizedMatrix, informationMatrix, weightedInformationMatrix }
}
