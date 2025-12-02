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
): Record<string, number> {
  const scores: Record<string, number> = {}
  const epsilon = 1e-12

  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) return scores
  if (m === 1) {
    scores[alternatives[0].id] = 0
    return scores
  }

  // ELECTRE II thresholds: strong and weak
  // Strong thresholds are stricter (higher concordance, lower discordance)
  const strongConcordanceThreshold = 0.6
  const strongDiscordanceThreshold = 0.4
  const weakConcordanceThreshold = 0.5
  const weakDiscordanceThreshold = 0.5

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

  // Calculate ranges for discordance calculation
  const ranges: number[] = []
  for (let j = 0; j < n; j++) {
    const colVals = normalizedMatrix.map((row) => row[j])
    const maxVal = Math.max(...colVals)
    const minVal = Math.min(...colVals)
    ranges[j] = Math.max(maxVal - minVal, epsilon)
  }

  // Step 3 & 4: Calculate concordance and discordance indices
  // C[i][k] = concordance index (how much i is better than k)
  // D[i][k] = discordance index (how much i is worse than k)
  const concordance: number[][] = Array.from({ length: m }, () => Array(m).fill(0))
  const discordance: number[][] = Array.from({ length: m }, () => Array(m).fill(0))

  for (let i = 0; i < m; i++) {
    for (let k = 0; k < m; k++) {
      if (i === k) {
        concordance[i][k] = 1
        discordance[i][k] = 0
        continue
      }

      let concordanceSum = 0
      let maxDiscordance = 0

      for (let j = 0; j < n; j++) {
        const crit = criteria[j]
        const valI = normalizedMatrix[i][j]
        const valK = normalizedMatrix[k][j]

        // Check if i is better than k for this criterion
        let iIsBetter = false
        if (crit.type === "beneficial") {
          iIsBetter = valI >= valK
        } else {
          iIsBetter = valI <= valK
        }

        if (iIsBetter) {
          concordanceSum += crit.weight
        } else {
          // Calculate discordance (how much k is better than i)
          const diff = Math.abs(valK - valI)
          const normalizedDiff = ranges[j] > epsilon ? diff / ranges[j] : 0
          maxDiscordance = Math.max(maxDiscordance, normalizedDiff)
        }
      }

      concordance[i][k] = concordanceSum
      discordance[i][k] = maxDiscordance
    }
  }

  // Step 5: Build strong outranking relation
  const strongOutranks: boolean[][] = Array.from({ length: m }, () => Array(m).fill(false))

  for (let i = 0; i < m; i++) {
    for (let k = 0; k < m; k++) {
      if (i !== k) {
        const c = concordance[i][k]
        const d = discordance[i][k]
        strongOutranks[i][k] =
          c >= strongConcordanceThreshold && d <= strongDiscordanceThreshold
      }
    }
  }

  // Step 6: Build weak outranking relation
  const weakOutranks: boolean[][] = Array.from({ length: m }, () => Array(m).fill(false))

  for (let i = 0; i < m; i++) {
    for (let k = 0; k < m; k++) {
      if (i !== k) {
        const c = concordance[i][k]
        const d = discordance[i][k]
        // Weak outranking: either strong outranking OR meets weak thresholds
        weakOutranks[i][k] =
          strongOutranks[i][k] ||
          (c >= weakConcordanceThreshold && d <= weakDiscordanceThreshold)
      }
    }
  }

  // Step 7: Calculate scores based on strong outranking relations
  // For ELECTRE II, we use strong outranking to build complete ranking
  // Score = number of alternatives strongly outranked - number of alternatives that strongly outrank this
  for (let i = 0; i < m; i++) {
    let stronglyOutrankedCount = 0
    let stronglyOutrankedByCount = 0

    for (let k = 0; k < m; k++) {
      if (i !== k) {
        if (strongOutranks[i][k]) {
          stronglyOutrankedCount++
        }
        if (strongOutranks[k][i]) {
          stronglyOutrankedByCount++
        }
      }
    }

    const score = stronglyOutrankedCount - stronglyOutrankedByCount
    scores[alternatives[i].id] = score
  }

  return scores
}

