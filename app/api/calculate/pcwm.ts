import type { Alternative, Criterion } from "./types"

export interface PCWMResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    correlationMatrix: Record<string, Record<string, number>>
    independenceMeasures: Record<string, number>
}

/**
 * Pearson Correlation Weight Method (PCWM)
 * 
 * Based on Pearson Correlation Coefficient by Karl Pearson.
 * 
 * PCWM is an objective weighting method that determines weights based on the 
 * independence of criteria. It uses Pearson correlation to measure the conflict/redundancy
 * between criteria.
 * 
 * Steps:
 * 1. Normalize the decision matrix using vector normalization.
 * 2. Calculate the Pearson correlation matrix between criteria.
 * 3. Calculate the independence measure (conflict) for each criterion as the sum of (1 - r_jk).
 * 4. Determine final weights by normalizing the independence measures.
 */
export function calculatePCWM(
    alternatives: Alternative[],
    criteria: Criterion[]
): PCWMResult {
    const epsilon = 1e-12
    const m = alternatives.length
    const n = criteria.length

    if (m === 0 || n === 0) {
        return {
            weights: {},
            normalizedMatrix: {},
            correlationMatrix: {},
            independenceMeasures: {},
        }
    }

    // Step 1: Build decision matrix
    const matrix: number[][] = alternatives.map((alt) =>
        criteria.map((crit) => Number(alt.scores[crit.id]) || 0)
    )

    // Step 2: Normalize the decision matrix (Vector Normalization)
    const normalizedMatrix: Record<string, Record<string, number>> = {}
    alternatives.forEach((alt) => (normalizedMatrix[alt.id] = {}))

    const normalizedMatrixArray: number[][] = Array.from({ length: m }, () => Array(n).fill(0))

    for (let j = 0; j < n; j++) {
        let sumSq = 0
        for (let i = 0; i < m; i++) {
            sumSq += matrix[i][j] * matrix[i][j]
        }
        const den = Math.sqrt(sumSq) || epsilon

        for (let i = 0; i < m; i++) {
            const val = matrix[i][j] / den
            normalizedMatrixArray[i][j] = val
            normalizedMatrix[alternatives[i].id][criteria[j].id] = val
        }
    }

    // Step 3: Pearson Correlation Matrix
    const means: number[] = []
    for (let j = 0; j < n; j++) {
        let sum = 0
        for (let i = 0; i < m; i++) {
            sum += normalizedMatrixArray[i][j]
        }
        means[j] = sum / m
    }

    const correlationMatrix: Record<string, Record<string, number>> = {}
    criteria.forEach((crit) => (correlationMatrix[crit.id] = {}))

    for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
            if (j === k) {
                correlationMatrix[criteria[j].id][criteria[k].id] = 1.0
            } else {
                let num = 0
                let denJ = 0
                let denK = 0
                for (let i = 0; i < m; i++) {
                    const diffJ = normalizedMatrixArray[i][j] - means[j]
                    const diffK = normalizedMatrixArray[i][k] - means[k]
                    num += diffJ * diffK
                    denJ += diffJ * diffJ
                    denK += diffK * diffK
                }
                const den = Math.sqrt(denJ * denK) || epsilon
                const corr = Math.max(-1, Math.min(1, num / den))
                correlationMatrix[criteria[j].id][criteria[k].id] = corr
            }
        }
    }

    // Step 4: Independence Measures (Conflict)
    const independenceMeasures: Record<string, number> = {}
    let totalIndependence = 0

    for (let j = 0; j < n; j++) {
        let sumConflict = 0
        for (let k = 0; k < n; k++) {
            sumConflict += (1 - correlationMatrix[criteria[j].id][criteria[k].id])
        }
        independenceMeasures[criteria[j].id] = sumConflict
        totalIndependence += sumConflict
    }

    // Step 5: Final Weights
    const weights: Record<string, number> = {}
    for (let j = 0; j < n; j++) {
        weights[criteria[j].id] = independenceMeasures[criteria[j].id] / (totalIndependence || epsilon)
    }

    return {
        weights,
        normalizedMatrix,
        correlationMatrix,
        independenceMeasures,
    }
}
