import type { Alternative, Criterion } from "./types"

/**
 * COPRAS (Complex Proportional Assessment) Method
 *
 * Reference formulation:
 * 1) Build decision matrix X = [x_ij]
 * 2) Normalize by column sums:
 *      r_ij = x_ij / Σ_i x_ij
 * 3) Apply weights:
 *      q_ij = w_j * r_ij
 * 4) For each alternative i:
 *      S⁺_i = Σ (q_ij) for beneficial criteria
 *      S⁻_i = Σ (q_ij) for non-beneficial criteria
 * 5) Let S⁻_min = min_i S⁻_i, and compute:
 *      Q_i = S⁺_i + (S⁻_min * Σ_i S⁻_i) / (S⁻_i * Σ_i (S⁻_min / S⁻_i))
 *    (when there are no cost criteria, COPRAS reduces to Q_i = S⁺_i)
 *
 * Higher Q_i indicates a better alternative.
 */

interface COPRASResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  weightedMatrix: Record<string, Record<string, number>>
  sPlus: Record<string, number>
  sMinus: Record<string, number>
  qi: Record<string, number>
}

export function calculateCOPRAS(
  alternatives: Alternative[],
  criteria: Criterion[]
): COPRASResult {
  const scores: Record<string, number> = {}
  const epsilon = 1e-12

  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) return { scores: {}, normalizedMatrix: {}, weightedMatrix: {}, sPlus: {}, sMinus: {}, qi: {} }

  // Step 1: decision matrix x_ij
  const matrix: number[][] = alternatives.map((alt) =>
    criteria.map((crit) => alt.scores[crit.id] ?? 0)
  )

  // Step 2: normalize by column sums
  const colSums: number[] = []
  for (let j = 0; j < n; j++) {
    let sum = 0
    for (let i = 0; i < m; i++) {
      sum += matrix[i][j]
    }
    if (sum === 0) sum = 1 // avoid division by zero
    colSums[j] = sum
  }

  const normalizedMatrix: Record<string, Record<string, number>> = {}
  const weightedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach(a => {
    normalizedMatrix[a.id] = {}
    weightedMatrix[a.id] = {}
  })

  const r: number[][] = Array.from({ length: m }, () => Array(n).fill(0))
  const q: number[][] = Array.from({ length: m }, () => Array(n).fill(0))

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      r[i][j] = matrix[i][j] / colSums[j]
      q[i][j] = r[i][j] * criteria[j].weight

      normalizedMatrix[alternatives[i].id][criteria[j].id] = r[i][j]
      weightedMatrix[alternatives[i].id][criteria[j].id] = q[i][j]
    }
  }

  // Step 4: S⁺ and S⁻ for each alternative
  const Splus: number[] = Array(m).fill(0)
  const Sminus: number[] = Array(m).fill(0)

  let hasBeneficial = false
  let hasNonBeneficial = false

  for (let j = 0; j < n; j++) {
    const isNonBeneficial = criteria[j].type === "non-beneficial"
    if (isNonBeneficial) hasNonBeneficial = true
    else hasBeneficial = true

    for (let i = 0; i < m; i++) {
      if (isNonBeneficial) {
        Sminus[i] += q[i][j]
      } else {
        Splus[i] += q[i][j]
      }
    }
  }

  const sPlusRecord: Record<string, number> = {}
  const sMinusRecord: Record<string, number> = {}
  const qiRecord: Record<string, number> = {}

  // If there are no cost (non-beneficial) criteria, COPRAS reduces to S⁺ ranking
  if (!hasNonBeneficial) {
    for (let i = 0; i < m; i++) {
      scores[alternatives[i].id] = Splus[i]
      sPlusRecord[alternatives[i].id] = Splus[i]
      sMinusRecord[alternatives[i].id] = 0
      qiRecord[alternatives[i].id] = Splus[i]
    }
    return {
      scores,
      normalizedMatrix,
      weightedMatrix,
      sPlus: sPlusRecord,
      sMinus: sMinusRecord,
      qi: qiRecord
    }
  }

  // Guard against all-zero Sminus
  for (let i = 0; i < m; i++) {
    if (Sminus[i] <= 0) Sminus[i] = epsilon
  }

  const SminusMin = Math.min(...Sminus)
  const totalSminus = Sminus.reduce((acc, v) => acc + v, 0) || epsilon

  const sumFraction = Sminus.reduce(
    (acc, v) => acc + SminusMin / (v || epsilon),
    0
  ) || epsilon

  // Step 5: compute Q_i
  for (let i = 0; i < m; i++) {
    const denom = Sminus[i] * sumFraction || epsilon
    const secondTerm = (SminusMin * totalSminus) / denom
    const Qi = Splus[i] + secondTerm
    scores[alternatives[i].id] = Qi

    sPlusRecord[alternatives[i].id] = Splus[i]
    sMinusRecord[alternatives[i].id] = Sminus[i] // Keep the possibly adjusted Sminus for display? Or original? 
    // Usually original is 0 but we adjusted to epsilon. Displaying epsilon is fine or 0.
    // Let's display the used values.
    qiRecord[alternatives[i].id] = Qi
  }

  return {
    scores,
    normalizedMatrix,
    weightedMatrix,
    sPlus: sPlusRecord,
    sMinus: sMinusRecord,
    qi: qiRecord
  }
}


