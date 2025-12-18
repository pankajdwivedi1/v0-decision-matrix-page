import type { Alternative, Criterion } from "../app/api/calculate/types"

export interface MERECResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    performanceScores: Record<string, number>
    removalScores: Record<string, Record<string, number>>
    removalEffects: Record<string, number>
}

/**
 * MEREC Method for Weight Calculation
 * 
 * The MEREC (Method based on the Removal Effects of Criteria) determines
 * objective weights by analyzing the effect of removing each criterion.
 * 
 * Steps:
 * 1. Build decision matrix X = [x_ij]
 * 2. Normalize the decision matrix:
 *    - For benefit criteria: r_ij = x_ij / max_i(x_ij)
 *    - For cost criteria: r_ij = min_i(x_ij) / x_ij
 * 3. Calculate overall performance scores:
 *    S_i = Σ_{j=1}^{n} r_ij
 * 4. Calculate performance with each criterion removed:
 *    S_i^(-k) = Σ_{j=1, j≠k}^{n} r_ij
 * 5. Calculate removal effect for each criterion:
 *    E_k = Σ_{i=1}^{m} |S_i - S_i^(-k)|
 * 6. Calculate weights:
 *    w_k = E_k / Σ_{j=1}^{n} E_j
 */
export function calculateMERECWeights(
    alternatives: Alternative[],
    criteria: Criterion[]
): MERECResult {
    const epsilon = 1e-12
    const m = alternatives.length
    const n = criteria.length

    if (m === 0 || n === 0) {
        return {
            weights: {},
            normalizedMatrix: {},
            performanceScores: {},
            removalScores: {},
            removalEffects: {},
        }
    }

    // Step 1: Build decision matrix
    const matrix: number[][] = alternatives.map((alt) =>
        criteria.map((crit) => {
            const value = alt.scores[crit.id] ?? 0
            return value <= 0 ? epsilon : value // Handle zero or negative values
        })
    )

    // Step 2: Normalize the decision matrix
    const normalizedMatrix: Record<string, Record<string, number>> = {}
    alternatives.forEach((alt) => (normalizedMatrix[alt.id] = {}))

    for (let j = 0; j < n; j++) {
        const crit = criteria[j]
        const colVals = matrix.map((row) => row[j])

        if (crit.type === "beneficial") {
            // For benefit criteria: r_ij = x_ij / max_i(x_ij)
            const maxVal = Math.max(...colVals) || epsilon
            alternatives.forEach((alt, i) => {
                normalizedMatrix[alt.id][crit.id] = colVals[i] / maxVal
            })
        } else {
            // For cost criteria: r_ij = min_i(x_ij) / x_ij
            const minVal = Math.min(...colVals) || epsilon
            alternatives.forEach((alt, i) => {
                normalizedMatrix[alt.id][crit.id] = minVal / (colVals[i] || epsilon)
            })
        }
    }

    // Step 3: Calculate overall performance scores S_i
    const performanceScores: Record<string, number> = {}
    alternatives.forEach((alt) => {
        let sum = 0
        criteria.forEach((crit) => {
            sum += normalizedMatrix[alt.id][crit.id]
        })
        performanceScores[alt.id] = sum
    })

    // Step 4: Calculate performance with each criterion removed S_i^(-k)
    const removalScores: Record<string, Record<string, number>> = {}
    alternatives.forEach((alt) => {
        removalScores[alt.id] = {}
    })

    alternatives.forEach((alt) => {
        criteria.forEach((removedCrit) => {
            let sum = 0
            criteria.forEach((crit) => {
                if (crit.id !== removedCrit.id) {
                    sum += normalizedMatrix[alt.id][crit.id]
                }
            })
            removalScores[alt.id][removedCrit.id] = sum
        })
    })

    // Step 5: Calculate removal effect E_k for each criterion
    const removalEffects: Record<string, number> = {}
    criteria.forEach((crit) => {
        let effect = 0
        alternatives.forEach((alt) => {
            const diff = Math.abs(
                performanceScores[alt.id] - removalScores[alt.id][crit.id]
            )
            effect += diff
        })
        removalEffects[crit.id] = effect
    })

    // Step 6: Calculate weights
    const weights: Record<string, number> = {}
    const totalEffect = Object.values(removalEffects).reduce(
        (sum, val) => sum + val,
        0
    ) || epsilon

    criteria.forEach((crit) => {
        weights[crit.id] = removalEffects[crit.id] / totalEffect
    })

    return {
        weights,
        normalizedMatrix,
        performanceScores,
        removalScores,
        removalEffects,
    }
}
