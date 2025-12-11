import type { Alternative, Criterion } from "../app/api/calculate/types"

export interface SWARAResult {
    weights: Record<string, number>
    stepFactors: Record<string, number>
    preliminaryWeights: Record<string, number>
    coefficients: Record<string, number>
}

/**
 * SWARA Method for Weight Calculation
 * 
 * The SWARA (Step-wise Weight Assessment Ratio Analysis) determines
 * weights based on expert assessment of relative importance differences.
 * 
 * Steps:
 * 1. Criteria are ordered by decreasing importance
 * 2. Expert provides comparative coefficients s_j (relative importance difference)
 * 3. Calculate step factors: k_j = 1 + s_j
 * 4. Calculate preliminary weights recursively: q_j = q_{j-1} / k_j
 * 5. Normalize to obtain final weights: w_j = q_j / Σq_t
 */
export function calculateSWARAWeights(
    criteria: Criterion[],
    coefficients: Record<string, number>
): SWARAResult {
    const epsilon = 1e-12
    const n = criteria.length

    if (n === 0) {
        return {
            weights: {},
            stepFactors: {},
            preliminaryWeights: {},
            coefficients: {},
        }
    }

    // Step 1: Criteria are already ordered (assumed to be in order of importance)

    // Step 2: Get comparative coefficients (s_j)
    // For first criterion, s_1 = 0
    const s: Record<string, number> = {}
    criteria.forEach((crit, index) => {
        if (index === 0) {
            s[crit.id] = 0
        } else {
            s[crit.id] = coefficients[crit.id] ?? 0
        }
    })

    // Step 3: Calculate step factors k_j = 1 + s_j
    const k: Record<string, number> = {}
    criteria.forEach((crit) => {
        k[crit.id] = 1 + s[crit.id]
    })

    // Step 4: Calculate preliminary weights q_j
    const q: Record<string, number> = {}
    criteria.forEach((crit, index) => {
        if (index === 0) {
            q[crit.id] = 1
        } else {
            const prevCrit = criteria[index - 1]
            q[crit.id] = q[prevCrit.id] / k[crit.id]
        }
    })

    // Step 5: Normalize to obtain final weights
    const sumQ = Object.values(q).reduce((sum, val) => sum + val, 0) || epsilon
    const weights: Record<string, number> = {}
    criteria.forEach((crit) => {
        weights[crit.id] = q[crit.id] / sumQ
    })

    return {
        weights,
        stepFactors: k,
        preliminaryWeights: q,
        coefficients: s,
    }
}
