import type { Criterion, RankingWeightResult, ROCResult, RRResult } from "../app/api/calculate/types"

/**
 * Rank Order Centroid (ROC) Weight Method
 * w_j = (1/n) * Σ_{i=j}^n (1/i)
 */
export function calculateROCWeights(
    criteria: Criterion[],
    ranks: Record<string, number>
): RankingWeightResult {
    const n = criteria.length
    const weights: Record<string, number> = {}

    // Sort criteria by rank
    const sortedCriteria = [...criteria].sort((a, b) => (ranks[a.id] || 0) - (ranks[b.id] || 0))

    sortedCriteria.forEach((crit, index) => {
        const j = index + 1 // Rank from 1 to n
        let sum = 0
        for (let i = j; i <= n; i++) {
            sum += 1 / i
        }
        weights[crit.id] = sum / n
    })

    return { weights, ranks }
}

/**
 * Rank Reciprocal (RR) Weight Method
 * w_j = (1/r_j) / Σ(1/r_k)
 */
export function calculateRRWeights(
    criteria: Criterion[],
    ranks: Record<string, number>
): RankingWeightResult {
    const n = criteria.length
    const weights: Record<string, number> = {}

    let sumReciprocals = 0
    criteria.forEach((crit) => {
        const r_j = ranks[crit.id] || n
        sumReciprocals += 1 / r_j
    })

    criteria.forEach((crit) => {
        const r_j = ranks[crit.id] || n
        weights[crit.id] = (1 / r_j) / sumReciprocals
    })

    return { weights, ranks }
}
