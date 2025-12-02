import type { Alternative, Criterion } from "./types"

/**
 * WASPAS (Weighted Aggregated Sum Product Assessment) Method
 *
 * Reference formulation:
 * 1) Construct decision matrix X = [x_ij]
 * 2) Normalize:
 *    - Beneficial:     q_ij = x_ij / max_i x_ij
 *    - Non-beneficial: q_ij = min_i x_ij / x_ij
 * 3) Compute:
 *    - WSM part: Q_i^(1) = Σ_j w_j * q_ij
 *    - WPM part: Q_i^(2) = Π_j (q_ij)^(w_j)
 * 4) Aggregate with λ (usually 0.5):
 *    - Q_i = λ * Q_i^(1) + (1 - λ) * Q_i^(2)
 *
 * Higher Q_i indicates a better alternative.
 */
export function calculateWASPAS(
  alternatives: Alternative[],
  criteria: Criterion[],
  lambda = 0.5
): Record<string, number> {
  const scores: Record<string, number> = {}
  const epsilon = 1e-12

  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) return scores

  // Build decision matrix: x_ij
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] ?? 0)
  )

  // Precompute max and min per criterion for normalization
  const maxPerCrit: number[] = []
  const minPerCrit: number[] = []

  for (let j = 0; j < n; j++) {
    const col = matrix.map((row) => row[j])
    let maxVal = -Infinity
    let minVal = Infinity

    for (const v of col) {
      if (v > maxVal) maxVal = v
      if (v < minVal) minVal = v
    }

    // Fallbacks to avoid division by zero or infinities
    if (!isFinite(maxVal) || maxVal === 0) maxVal = 1
    if (!isFinite(minVal) || minVal <= 0) minVal = epsilon

    maxPerCrit[j] = maxVal
    minPerCrit[j] = minVal
  }

  // Compute WASPAS score for each alternative
  for (let i = 0; i < m; i++) {
    const alt = alternatives[i]

    let wsm = 0 // additive (WSM) part
    let wpm = 1 // multiplicative (WPM) part

    for (let j = 0; j < n; j++) {
      const crit = criteria[j]
      const x_ij = matrix[i][j]

      // Step 2: normalization
      let q_ij: number
      if (crit.type === "beneficial") {
        q_ij = x_ij / (maxPerCrit[j] || 1)
      } else {
        // non-beneficial (cost) criterion
        const denom = x_ij <= 0 ? epsilon : x_ij
        q_ij = (minPerCrit[j] || epsilon) / denom
      }

      // Guard against pathological values
      if (!isFinite(q_ij) || q_ij < 0) q_ij = 0

      // Step 3: WSM and WPM components
      wsm += crit.weight * q_ij
      // Avoid multiplying by 0 in log-space style if all q_ij are zero
      const base = Math.max(q_ij, epsilon)
      wpm *= Math.pow(base, crit.weight)
    }

    // Step 4: aggregate with λ (default 0.5)
    const Q_i = lambda * wsm + (1 - lambda) * wpm
    scores[alt.id] = Q_i
  }

  return scores
}
