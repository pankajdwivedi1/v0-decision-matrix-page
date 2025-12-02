import type { Alternative, Criterion } from "./types"

/**
 * ELECTRE III (ÉLimination Et Choix Traduisant la REalité)
 *
 * ELECTRE III uses fuzzy thresholds (indifference, preference, veto) and credibility degrees
 * to handle imprecise data and provide a more nuanced outranking analysis.
 *
 * Reference formulation:
 * 1) Build decision matrix X = [x_ij]
 * 2) Normalize the decision matrix (vector normalization)
 * 3) For each pair of alternatives (a, b) and criterion j:
 *      Calculate partial concordance c_j(a,b) using indifference (q) and preference (p) thresholds
 * 4) Calculate global concordance index:
 *      C(a,b) = Σ_j w_j * c_j(a,b)
 * 5) Calculate partial discordance d_j(a,b) using veto threshold (v)
 * 6) Calculate credibility degree:
 *      σ(a,b) = C(a,b) * Π_j∈F (1 - d_j(a,b)) / (1 - C(a,b))
 *      where F = {j: d_j(a,b) > C(a,b)}
 * 7) Build outranking relation based on credibility threshold
 * 8) Calculate scores based on outranking relations
 *
 * Higher score indicates a better alternative.
 */
export function calculateELECTRE3(
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

  // ELECTRE III thresholds (as percentages of range)
  // Indifference threshold: difference where decision maker is indifferent
  const indifferenceThreshold = 0.05 // 5% of range
  // Preference threshold: minimum difference for strict preference
  const preferenceThreshold = 0.15 // 15% of range
  // Veto threshold: difference that completely rejects an alternative
  const vetoThreshold = 0.5 // 50% of range
  // Credibility threshold for outranking
  const credibilityThreshold = 0.6

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

  // Calculate ranges for threshold calculations
  const ranges: number[] = []
  for (let j = 0; j < n; j++) {
    const colVals = normalizedMatrix.map((row) => row[j])
    const maxVal = Math.max(...colVals)
    const minVal = Math.min(...colVals)
    ranges[j] = Math.max(maxVal - minVal, epsilon)
  }

  // Step 3 & 4: Calculate partial concordance and global concordance
  // c_j[i][k] = partial concordance of criterion j for alternative i over k
  // C[i][k] = global concordance index
  const partialConcordance: number[][][] = Array.from({ length: m }, () =>
    Array.from({ length: m }, () => Array(n).fill(0))
  )
  const globalConcordance: number[][] = Array.from({ length: m }, () => Array(m).fill(0))

  for (let i = 0; i < m; i++) {
    for (let k = 0; k < m; k++) {
      if (i === k) {
        globalConcordance[i][k] = 1
        continue
      }

      let concordanceSum = 0

      for (let j = 0; j < n; j++) {
        const crit = criteria[j]
        const valI = normalizedMatrix[i][j]
        const valK = normalizedMatrix[k][j]
        const q = indifferenceThreshold * ranges[j]
        const p = preferenceThreshold * ranges[j]

        let diff = 0
        let c_j = 0

        if (crit.type === "beneficial") {
          diff = valI - valK
          if (diff >= -q) {
            // Indifference or preference
            if (diff >= p) {
              c_j = 1 // Strong preference
            } else if (diff >= 0) {
              c_j = 1 // Preference
            } else {
              // Between -q and 0: weak preference
              c_j = 1 + diff / q
            }
          } else {
            // Dispreference: calculate partial concordance
            if (diff <= -p) {
              c_j = 0 // Strong dispreference
            } else {
              // Between -p and -q
              c_j = (diff + p) / (p - q)
            }
          }
        } else {
          // Non-beneficial: prefer lower values
          diff = valK - valI
          if (diff >= -q) {
            if (diff >= p) {
              c_j = 1
            } else if (diff >= 0) {
              c_j = 1
            } else {
              c_j = 1 + diff / q
            }
          } else {
            if (diff <= -p) {
              c_j = 0
            } else {
              c_j = (diff + p) / (p - q)
            }
          }
        }

        c_j = Math.max(0, Math.min(1, c_j)) // Clamp between 0 and 1
        partialConcordance[i][k][j] = c_j
        concordanceSum += crit.weight * c_j
      }

      globalConcordance[i][k] = concordanceSum
    }
  }

  // Step 5: Calculate partial discordance
  // d_j[i][k] = partial discordance of criterion j
  const partialDiscordance: number[][][] = Array.from({ length: m }, () =>
    Array.from({ length: m }, () => Array(n).fill(0))
  )

  for (let i = 0; i < m; i++) {
    for (let k = 0; k < m; k++) {
      if (i === k) continue

      for (let j = 0; j < n; j++) {
        const crit = criteria[j]
        const valI = normalizedMatrix[i][j]
        const valK = normalizedMatrix[k][j]
        const v = vetoThreshold * ranges[j]

        let diff = 0
        let d_j = 0

        if (crit.type === "beneficial") {
          diff = valK - valI // How much k is better than i
          if (diff > v) {
            d_j = 1 // Veto: complete rejection
          } else if (diff > p * ranges[j]) {
            // Between preference and veto threshold
            d_j = (diff - p * ranges[j]) / (v - p * ranges[j])
          } else {
            d_j = 0 // No discordance
          }
        } else {
          diff = valI - valK // How much i is worse than k
          if (diff > v) {
            d_j = 1
          } else if (diff > p * ranges[j]) {
            d_j = (diff - p * ranges[j]) / (v - p * ranges[j])
          } else {
            d_j = 0
          }
        }

        d_j = Math.max(0, Math.min(1, d_j))
        partialDiscordance[i][k][j] = d_j
      }
    }
  }

  // Step 6: Calculate credibility degrees
  // σ[i][k] = credibility degree of alternative i outranking k
  const credibility: number[][] = Array.from({ length: m }, () => Array(m).fill(0))

  for (let i = 0; i < m; i++) {
    for (let k = 0; k < m; k++) {
      if (i === k) {
        credibility[i][k] = 1
        continue
      }

      const C = globalConcordance[i][k]
      let product = 1

      // Find criteria where discordance > concordance
      for (let j = 0; j < n; j++) {
        const d_j = partialDiscordance[i][k][j]
        if (d_j > C) {
          product *= (1 - d_j) / (1 - C)
        }
      }

      credibility[i][k] = C * product
    }
  }

  // Step 7: Build outranking relation based on credibility threshold
  const outranks: boolean[][] = Array.from({ length: m }, () => Array(m).fill(false))

  for (let i = 0; i < m; i++) {
    for (let k = 0; k < m; k++) {
      if (i !== k) {
        outranks[i][k] = credibility[i][k] >= credibilityThreshold
      }
    }
  }

  // Step 8: Calculate scores based on outranking relations
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

  return scores
}

