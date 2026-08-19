import type { Alternative, Criterion } from "./types"

export interface WISPResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  sumScoreBeneficial: Record<string, number>
  productScoreBeneficial: Record<string, number>
  sumScoreNonBeneficial: Record<string, number>
  productScoreNonBeneficial: Record<string, number>
}

/**
 * WISP (Weighted Integrated Score for Prioritizing) Method
 * Reference: Stanković, M. et al. (2022), International Journal of Fuzzy Systems.
 */
export function calculateWISP(
  alternatives: Alternative[],
  criteria: Criterion[]
): WISPResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      normalizedMatrix: {},
      sumScoreBeneficial: {},
      productScoreBeneficial: {},
      sumScoreNonBeneficial: {},
      productScoreNonBeneficial: {}
    }
  }

  // 1. Vector normalization
  const colSumSquares: Record<string, number> = {}
  criteria.forEach((crit) => {
    const sumSq = alternatives.reduce((acc, alt) => {
      const val = Number(alt.scores[crit.id]) || 0
      return acc + val * val
    }, 0)
    colSumSquares[crit.id] = Math.sqrt(sumSq) || 1
  })

  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    normalizedMatrix[alt.id] = {}
    criteria.forEach((crit) => {
      const val = Number(alt.scores[crit.id]) || 0
      normalizedMatrix[alt.id][crit.id] = val / colSumSquares[crit.id]
    })
  })

  // 2. Compute Weighted Sums & Weighted Products for Beneficial (B) and Non-Beneficial (C)
  const sumScoreBeneficial: Record<string, number> = {}
  const sumScoreNonBeneficial: Record<string, number> = {}
  const productScoreBeneficial: Record<string, number> = {}
  const productScoreNonBeneficial: Record<string, number> = {}

  alternatives.forEach((alt) => {
    let ws = 0
    let wr = 0
    let wp = 1
    let wq = 1
    let hasBeneficial = false
    let hasCost = false

    criteria.forEach((crit) => {
      const r = normalizedMatrix[alt.id][crit.id] || 0.0001
      const w = crit.weight || 1 / n
      if (crit.type === "beneficial") {
        ws += w * r
        wp *= Math.pow(Math.max(r, 0.00001), w)
        hasBeneficial = true
      } else {
        wr += w * r
        wq *= Math.pow(Math.max(r, 0.00001), w)
        hasCost = true
      }
    })

    sumScoreBeneficial[alt.id] = ws
    sumScoreNonBeneficial[alt.id] = hasCost ? wr : 0
    productScoreBeneficial[alt.id] = hasBeneficial ? wp : 0
    productScoreNonBeneficial[alt.id] = hasCost ? wq : 0
  })

  // 3. Four normalized WISP utility components
  const diffWS_WR: Record<string, number> = {}
  const diffWP_WQ: Record<string, number> = {}
  alternatives.forEach((alt) => {
    diffWS_WR[alt.id] = sumScoreBeneficial[alt.id] - sumScoreNonBeneficial[alt.id]
    diffWP_WQ[alt.id] = productScoreBeneficial[alt.id] - productScoreNonBeneficial[alt.id]
  })

  const minWS = Math.min(...Object.values(sumScoreBeneficial))
  const maxWS = Math.max(...Object.values(sumScoreBeneficial)) || 1
  const minWR = Math.min(...Object.values(sumScoreNonBeneficial)) || 0.0001
  const minWP = Math.min(...Object.values(productScoreBeneficial))
  const maxWP = Math.max(...Object.values(productScoreBeneficial)) || 1
  const minWQ = Math.min(...Object.values(productScoreNonBeneficial)) || 0.0001

  const scores: Record<string, number> = {}
  alternatives.forEach((alt) => {
    const u1 = (diffWS_WR[alt.id] - Math.min(...Object.values(diffWS_WR))) /
      ((Math.max(...Object.values(diffWS_WR)) - Math.min(...Object.values(diffWS_WR))) || 1)

    const u2 = (diffWP_WQ[alt.id] - Math.min(...Object.values(diffWP_WQ))) /
      ((Math.max(...Object.values(diffWP_WQ)) - Math.min(...Object.values(diffWP_WQ))) || 1)

    const u3 = (sumScoreBeneficial[alt.id] / maxWS) / (1 + (sumScoreNonBeneficial[alt.id] / minWR))
    const u4 = (productScoreBeneficial[alt.id] / maxWP) / (1 + (productScoreNonBeneficial[alt.id] / minWQ))

    scores[alt.id] = (u1 + u2 + u3 + u4) / 4
  })

  return {
    scores,
    normalizedMatrix,
    sumScoreBeneficial,
    productScoreBeneficial,
    sumScoreNonBeneficial,
    productScoreNonBeneficial
  }
}
