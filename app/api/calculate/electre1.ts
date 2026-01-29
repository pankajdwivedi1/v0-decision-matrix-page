import type { Alternative, Criterion } from "./types"

/**
 * ELECTRE I (ÉLimination Et Choix Traduisant la REalité)
 *
 * ELECTRE I is the basic version that uses single thresholds for concordance and discordance
 * to build outranking relations. It may produce partial rankings with incomparabilities.
 *
 * Reference formulation:
 * 1) Build decision matrix X = [x_ij]
 * 2) Normalize the decision matrix (vector normalization)
 * 3) For each pair of alternatives (a, b):
 *      Calculate concordance index C(a,b) = Σ_j∈J⁺ w_j
 *      where J⁺ = {j: a_j ≥ b_j for beneficial, or a_j ≤ b_j for non-beneficial}
 * 4) Calculate discordance index D(a,b) = max_j (normalized difference)
 *      where difference is max when b is better than a
 * 5) Build outranking relation:
 *      a outranks b if C(a,b) ≥ c* and D(a,b) ≤ d*
 *      (default thresholds: c* = 0.5, d* = 0.5)
 * 6) Calculate score as number of alternatives outranked minus outranked by
 *
 * Higher score indicates a better alternative.
 */
export function calculateELECTRE1(
  alternatives: Alternative[],
  criteria: Criterion[]
): {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  concordanceMatrix: Record<string, Record<string, number>>
  discordanceMatrix: Record<string, Record<string, number>>
  outrankingMatrix: Record<string, Record<string, boolean>>
} {
  const scores: Record<string, number> = {}
  const epsilon = 1e-12

  const m = alternatives.length
  const n = criteria.length

  const resNormalizedMatrix: Record<string, Record<string, number>> = {}
  const resConcordanceMatrix: Record<string, Record<string, number>> = {}
  const resDiscordanceMatrix: Record<string, Record<string, number>> = {}
  const resOutrankingMatrix: Record<string, Record<string, boolean>> = {}

  if (m === 0 || n === 0) return { scores, normalizedMatrix: resNormalizedMatrix, concordanceMatrix: resConcordanceMatrix, discordanceMatrix: resDiscordanceMatrix, outrankingMatrix: resOutrankingMatrix }
  if (m === 1) {
    scores[alternatives[0].id] = 0
    return { scores, normalizedMatrix: resNormalizedMatrix, concordanceMatrix: resConcordanceMatrix, discordanceMatrix: resDiscordanceMatrix, outrankingMatrix: resOutrankingMatrix }
  }

  // ELECTRE I thresholds (single set)
  const concordanceThreshold = 0.5
  const discordanceThreshold = 0.5

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] ?? 0)
  )

  // Step 2: Normalize using vector normalization
  const normalizedMatrix: number[][] = Array.from({ length: m }, () => Array(n).fill(0))

  for (let j = 0; j < n; j++) {
    const colVals = matrix.map((row) => row[j])
    const denom = Math.sqrt(colVals.reduce((sum, v) => sum + v * v, 0)) || epsilon
    for (let i = 0; i < m; i++) {
      normalizedMatrix[i][j] = matrix[i][j] / denom
    }
  }

  // Store normalized matrix for return
  alternatives.forEach((alt, i) => {
    resNormalizedMatrix[alt.id] = {}
    criteria.forEach((crit, j) => {
      resNormalizedMatrix[alt.id][crit.id] = normalizedMatrix[i][j]
    })
  })

  // Calculate ranges for discordance calculation
  const ranges: number[] = []
  for (let j = 0; j < n; j++) {
    const colVals = normalizedMatrix.map((row) => row[j])
    const maxVal = Math.max(...colVals)
    const minVal = Math.min(...colVals)
    ranges[j] = Math.max(maxVal - minVal, epsilon)
  }

  // Step 3 & 4: Calculate concordance and discordance indices
  const concordance: number[][] = Array.from({ length: m }, () => Array(m).fill(0))
  const discordance: number[][] = Array.from({ length: m }, () => Array(m).fill(0))

  for (let i = 0; i < m; i++) {
    resConcordanceMatrix[alternatives[i].id] = {}
    resDiscordanceMatrix[alternatives[i].id] = {}
    for (let k = 0; k < m; k++) {
      if (i === k) {
        concordance[i][k] = 1
        discordance[i][k] = 0
        resConcordanceMatrix[alternatives[i].id][alternatives[k].id] = 1
        resDiscordanceMatrix[alternatives[i].id][alternatives[k].id] = 0
        continue
      }

      let concordanceSum = 0
      let maxDiscordance = 0

      for (let j = 0; j < n; j++) {
        const crit = criteria[j]
        const valI = normalizedMatrix[i][j]
        const valK = normalizedMatrix[k][j]

        let iIsBetter = false
        if (crit.type === "beneficial") {
          iIsBetter = valI >= valK
        } else {
          iIsBetter = valI <= valK
        }

        if (iIsBetter) {
          concordanceSum += crit.weight
        } else {
          const diff = Math.abs(valK - valI)
          const normalizedDiff = ranges[j] > epsilon ? diff / ranges[j] : 0
          maxDiscordance = Math.max(maxDiscordance, normalizedDiff)
        }
      }

      concordance[i][k] = concordanceSum
      discordance[i][k] = maxDiscordance
      resConcordanceMatrix[alternatives[i].id][alternatives[k].id] = concordanceSum
      resDiscordanceMatrix[alternatives[i].id][alternatives[k].id] = maxDiscordance
    }
  }

  // Step 5: Build outranking relation
  const outranks: boolean[][] = Array.from({ length: m }, () => Array(m).fill(false))

  for (let i = 0; i < m; i++) {
    resOutrankingMatrix[alternatives[i].id] = {}
    for (let k = 0; k < m; k++) {
      if (i !== k) {
        const c = concordance[i][k]
        const d = discordance[i][k]
        const isOutranked = c >= concordanceThreshold && d <= discordanceThreshold
        outranks[i][k] = isOutranked
        resOutrankingMatrix[alternatives[i].id][alternatives[k].id] = isOutranked
      } else {
        resOutrankingMatrix[alternatives[i].id][alternatives[k].id] = false
      }
    }
  }

  // Step 6: Calculate scores
  for (let i = 0; i < m; i++) {
    let outrankedCount = 0
    let outrankedByCount = 0

    for (let k = 0; k < m; k++) {
      if (i !== k) {
        if (outranks[i][k]) {
          outrankedCount++
        }
        if (outranks[k][i]) {
          outrankedByCount++
        }
      }
    }

    const score = outrankedCount - outrankedByCount
    scores[alternatives[i].id] = score
  }

  return {
    scores,
    normalizedMatrix: resNormalizedMatrix,
    concordanceMatrix: resConcordanceMatrix,
    discordanceMatrix: resDiscordanceMatrix,
    outrankingMatrix: resOutrankingMatrix
  }
}

