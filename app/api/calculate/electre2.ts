import type { Alternative, Criterion } from "./types"

/**
 * ELECTRE II (ÉLimination Et Choix Traduisant la REalité)
 *
 * ELECTRE II provides a complete ranking using strong and weak outranking relations.
 * Unlike ELECTRE I which may have incomparabilities, ELECTRE II uses two sets of thresholds
 * (strong and weak) to establish a complete ranking.
 *
 * Reference formulation:
 * 1) Build decision matrix X = [x_ij]
 * 2) Normalize the decision matrix (vector normalization)
 * 3) For each pair of alternatives (a, b):
 *      Calculate concordance index C(a,b) = Σ_j∈J⁺ w_j
 *      where J⁺ = {j: a_j ≥ b_j for beneficial, or a_j ≤ b_j for non-beneficial}
 * 4) Calculate discordance index D(a,b) = max_j (normalized difference)
 *      where difference is max when b is better than a
 * 5) Build strong outranking relation:
 *      a strongly outranks b if C(a,b) ≥ c_s and D(a,b) ≤ d_s
 * 6) Build weak outranking relation:
 *      a weakly outranks b if C(a,b) ≥ c_w and D(a,b) ≤ d_w
 *      (where c_s > c_w and d_s < d_w)
 * 7) Calculate scores based on strong outranking relations for complete ranking
 *
 * Higher score indicates a better alternative.
 */
export function calculateELECTRE2(
  alternatives: Alternative[],
  criteria: Criterion[]
): {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  concordanceMatrix: Record<string, Record<string, number>>
  discordanceMatrix: Record<string, Record<string, number>>
  strongOutrankingMatrix: Record<string, Record<string, boolean>>
  weakOutrankingMatrix: Record<string, Record<string, boolean>>
} {
  const scores: Record<string, number> = {}
  const epsilon = 1e-12

  const m = alternatives.length
  const n = criteria.length

  const resNormalizedMatrix: Record<string, Record<string, number>> = {}
  const resConcordanceMatrix: Record<string, Record<string, number>> = {}
  const resDiscordanceMatrix: Record<string, Record<string, number>> = {}
  const resStrongOutrankingMatrix: Record<string, Record<string, boolean>> = {}
  const resWeakOutrankingMatrix: Record<string, Record<string, boolean>> = {}

  if (m === 0 || n === 0) return { scores, normalizedMatrix: resNormalizedMatrix, concordanceMatrix: resConcordanceMatrix, discordanceMatrix: resDiscordanceMatrix, strongOutrankingMatrix: resStrongOutrankingMatrix, weakOutrankingMatrix: resWeakOutrankingMatrix }
  if (m === 1) {
    scores[alternatives[0].id] = 0
    return { scores, normalizedMatrix: resNormalizedMatrix, concordanceMatrix: resConcordanceMatrix, discordanceMatrix: resDiscordanceMatrix, strongOutrankingMatrix: resStrongOutrankingMatrix, weakOutrankingMatrix: resWeakOutrankingMatrix }
  }

  // ELECTRE II thresholds: strong and weak
  const strongConcordanceThreshold = 0.6
  const strongDiscordanceThreshold = 0.4
  const weakConcordanceThreshold = 0.5
  const weakDiscordanceThreshold = 0.5

  // Step 1: Build decision matrix
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] ?? 0)
  )

  // Step 2: Normalize
  const normalizedMatrix: number[][] = Array.from({ length: m }, () => Array(n).fill(0))
  for (let j = 0; j < n; j++) {
    const colVals = matrix.map((row) => row[j])
    const denom = Math.sqrt(colVals.reduce((sum, v) => sum + v * v, 0)) || epsilon
    for (let i = 0; i < m; i++) {
      normalizedMatrix[i][j] = matrix[i][j] / denom
    }
  }

  // Store normalized matrix
  alternatives.forEach((alt, i) => {
    resNormalizedMatrix[alt.id] = {}
    criteria.forEach((crit, j) => {
      resNormalizedMatrix[alt.id][crit.id] = normalizedMatrix[i][j]
    })
  })

  // Ranges for discordance
  const ranges: number[] = []
  for (let j = 0; j < n; j++) {
    const colVals = normalizedMatrix.map((row) => row[j])
    ranges[j] = Math.max(Math.max(...colVals) - Math.min(...colVals), epsilon)
  }

  // Concordance and Discordance
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

      let cSum = 0
      let maxD = 0
      for (let j = 0; j < n; j++) {
        const crit = criteria[j]
        const iIsBetter = crit.type === "beneficial" ? normalizedMatrix[i][j] >= normalizedMatrix[k][j] : normalizedMatrix[i][j] <= normalizedMatrix[k][j]
        if (iIsBetter) cSum += crit.weight
        else maxD = Math.max(maxD, Math.abs(normalizedMatrix[k][j] - normalizedMatrix[i][j]) / ranges[j])
      }
      concordance[i][k] = cSum
      discordance[i][k] = maxD
      resConcordanceMatrix[alternatives[i].id][alternatives[k].id] = cSum
      resDiscordanceMatrix[alternatives[i].id][alternatives[k].id] = maxD
    }
  }

  // Strong and Weak Outranking
  const strongOutranks: boolean[][] = Array.from({ length: m }, () => Array(m).fill(false))
  const weakOutranks: boolean[][] = Array.from({ length: m }, () => Array(m).fill(false))

  for (let i = 0; i < m; i++) {
    resStrongOutrankingMatrix[alternatives[i].id] = {}
    resWeakOutrankingMatrix[alternatives[i].id] = {}
    for (let k = 0; k < m; k++) {
      if (i !== k) {
        const c = concordance[i][k]
        const d = discordance[i][k]

        const isStrong = c >= strongConcordanceThreshold && d <= strongDiscordanceThreshold
        strongOutranks[i][k] = isStrong
        resStrongOutrankingMatrix[alternatives[i].id][alternatives[k].id] = isStrong

        const isWeak = isStrong || (c >= weakConcordanceThreshold && d <= weakDiscordanceThreshold)
        weakOutranks[i][k] = isWeak
        resWeakOutrankingMatrix[alternatives[i].id][alternatives[k].id] = isWeak
      } else {
        resStrongOutrankingMatrix[alternatives[i].id][alternatives[k].id] = false
        resWeakOutrankingMatrix[alternatives[i].id][alternatives[k].id] = false
      }
    }
  }

  // Scores
  for (let i = 0; i < m; i++) {
    let strongCount = 0
    let strongByCount = 0
    for (let k = 0; k < m; k++) {
      if (i !== k) {
        if (strongOutranks[i][k]) strongCount++
        if (strongOutranks[k][i]) strongByCount++
      }
    }
    scores[alternatives[i].id] = strongCount - strongByCount
  }

  return {
    scores,
    normalizedMatrix: resNormalizedMatrix,
    concordanceMatrix: resConcordanceMatrix,
    discordanceMatrix: resDiscordanceMatrix,
    strongOutrankingMatrix: resStrongOutrankingMatrix,
    weakOutrankingMatrix: resWeakOutrankingMatrix
  }
}

