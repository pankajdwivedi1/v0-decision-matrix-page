import type { Criterion } from "./types"

export interface PipreciaResult {
    weights: Record<string, number>
    s_values: Record<string, number>
    k_values: Record<string, number>
    q_values: Record<string, number>
}

/**
 * PIPRECIA (Step-wise Weight Assessment Ratio Analysis) weights.
 *
 * We derive the relative importance coefficients from the provided weights
 * to simulate the pairwise comparison process.
 *
 * k_j = w_{j-1} / w_j (for j > 1)
 * k_1 = 1
 *
 * q_1 = 1
 * q_j = q_{j-1} / k_j
 *
 * w_j = q_j / sum(q)
 */
export function calculatePIPRECIA(criteria: Criterion[]): PipreciaResult {
    const n = criteria.length
    if (n === 0) {
        return { weights: {}, s_values: {}, k_values: {}, q_values: {} }
    }

    // Ensure positive weights
    const rawWeights = criteria.map(c => Math.max(c.weight, 1e-6))
    const ids = criteria.map(c => c.id)

    const k_values: Record<string, number> = {}
    const q_values: Record<string, number> = {}
    const s_values: Record<string, number> = {}
    const weights: Record<string, number> = {}

    // Step 1 & 2: Calculate coefficients
    // We reverse engineer k_j to match the input weights distribution
    // k_j = w_{j-1} / w_j
    const kArr: number[] = Array(n).fill(0)
    const qArr: number[] = Array(n).fill(0)

    kArr[0] = 1
    qArr[0] = 1

    // Store for first item
    k_values[ids[0]] = 1
    q_values[ids[0]] = 1
    s_values[ids[0]] = 0 // Not applicable for first

    for (let j = 1; j < n; j++) {
        // Derive k_j from ratio of previous weight to current weight
        // w_{j-1}/w_j approx k_j because q_j = q_{j-1}/k_j => k_j = q_{j-1}/q_j => w_{j-1}/w_j
        kArr[j] = rawWeights[j - 1] / rawWeights[j]
        k_values[ids[j]] = kArr[j]

        // We can't easily back-calculate s_j from k_j without knowing the exact user intent (importance > or <)
        // But we can approximate for display: 
        // If k < 1 (implies w_j > w_{j-1}), then s_j > 1 typically. k = 2 - s_j => s_j = 2 - k
        // If k >= 1 (implies w_j <= w_{j-1}), then s_j <= 1. k = s_j => s_j = k
        // This assumes the standard Stanujkic formulation.
        if (kArr[j] < 1) {
            s_values[ids[j]] = 2 - kArr[j]
        } else {
            s_values[ids[j]] = kArr[j]
        }

        // Step 3: Calculate q_j
        qArr[j] = qArr[j - 1] / kArr[j]
        q_values[ids[j]] = qArr[j]
    }

    // Step 4: Calculate Relative Weights
    const sumQ = qArr.reduce((a, b) => a + b, 0)

    for (let j = 0; j < n; j++) {
        weights[ids[j]] = qArr[j] / sumQ
    }

    return {
        weights,
        s_values,
        k_values,
        q_values
    }
}
