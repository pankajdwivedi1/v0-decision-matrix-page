import type { Alternative, Criterion } from "./types"

/**
 * ARAS (Additive Ratio Assessment)
 * Steps:
 * 1. Form decision matrix and determine optimal alternative (x0)
 * 2. Normalize the decision matrix (including x0)
 * 3. Calculate weighted normalized matrix
 * 4. Determine optimality function (S_i)
 * 5. Calculate degree of utility (K_i)
 */

interface ARASResult {
    scores: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    weightedMatrix: Record<string, Record<string, number>>
    optimalityFunctionValues: Record<string, number>
    optimalAlternativeValues: Record<string, number>
}

export function calculateARAS(
    alternatives: Alternative[],
    criteria: Criterion[]
): ARASResult {
    const m = alternatives.length
    const n = criteria.length

    // Step 1: Initial Matrix
    const matrix: number[][] = alternatives.map((alt) =>
        criteria.map((crit) => Number(alt.scores[crit.id] || 0))
    )

    // Determine Optimal Alternative x0 (Row 0 considered as index -1 logically or pushed)
    // Beneficial: max, Non-beneficial: min
    const x0: number[] = []
    const optimalAlternativeValues: Record<string, number> = {}

    for (let j = 0; j < n; j++) {
        const colVals = matrix.map(row => row[j])
        if (criteria[j].type === "beneficial") {
            x0[j] = Math.max(...colVals)
        } else {
            x0[j] = Math.min(...colVals)
        }
        optimalAlternativeValues[criteria[j].id] = x0[j]
    }

    // Combine x0 and alternatives for normalization
    // Row 0 will be x0, Rows 1..m will be alternatives
    // But wait, for non-beneficial, we invert values. 
    // Standard ARAS treats cost criteria by taking reciprocal 1/x_ij THEN normalizing.

    // Prepare processed columns (handling reciprocals for cost criteria)
    // Let's create an extended matrix of size (m+1) x n
    const extendedMatrix: number[][] = [x0, ...matrix]
    const processedMatrix: number[][] = [] // Will hold simple values or reciprocals

    for (let i = 0; i < m + 1; i++) {
        processedMatrix[i] = []
    }

    for (let j = 0; j < n; j++) {
        if (criteria[j].type === "non-beneficial") {
            for (let i = 0; i < m + 1; i++) {
                // value 1/x, handle divide by zero if necessary, though decision matrix shouldn't have 0 usually
                const originVal = extendedMatrix[i][j]
                processedMatrix[i][j] = originVal === 0 ? 0 : 1 / originVal
            }
        } else {
            for (let i = 0; i < m + 1; i++) {
                processedMatrix[i][j] = extendedMatrix[i][j]
            }
        }
    }

    // Calculate sums of columns of processedMatrix
    const colSums: number[] = []
    for (let j = 0; j < n; j++) {
        let sum = 0
        for (let i = 0; i < m + 1; i++) {
            sum += processedMatrix[i][j]
        }
        colSums[j] = sum
    }

    // Step 2: Normalize
    const normalizedData: number[][] = []
    for (let i = 0; i < m + 1; i++) {
        normalizedData[i] = []
        for (let j = 0; j < n; j++) {
            normalizedData[i][j] = processedMatrix[i][j] / colSums[j]
        }
    }

    // Only for actual alternatives + x0
    // We want to return normalizedMatrix including x0 for display purposes (Extended Matrix)
    const normalizedMatrix: Record<string, Record<string, number>> = {}

    // Add Optimal row first
    normalizedMatrix["Optimal"] = {}
    criteria.forEach((c, j) => {
        // x0 is at row index 0 in normalizedData
        normalizedMatrix["Optimal"][c.id] = normalizedData[0][j]
    })

    // Add alternatives
    alternatives.forEach((a, idx) => {
        normalizedMatrix[a.id] = {}
        criteria.forEach((c, cIdx) => {
            normalizedMatrix[a.id][c.id] = normalizedData[idx + 1][cIdx]
        })
    })

    // Step 3: Weighted Normalized Matrix
    const weightedData = normalizedData.map(row =>
        row.map((val, j) => val * criteria[j].weight)
    )

    const weightedMatrix: Record<string, Record<string, number>> = {}

    // Add Optimal row first
    weightedMatrix["Optimal"] = {}
    criteria.forEach((c, j) => {
        weightedMatrix["Optimal"][c.id] = weightedData[0][j]
    })

    alternatives.forEach((a, idx) => {
        weightedMatrix[a.id] = {}
        criteria.forEach((c, cIdx) => {
            weightedMatrix[a.id][c.id] = weightedData[idx + 1][cIdx]
        })
    })

    // Step 4: Optimality Scores
    const S = weightedData.map(row =>
        row.reduce((a, b) => a + b, 0)
    )

    const S0 = S[0] // ideal alternative score

    const optimalityFunctionValues: Record<string, number> = {}

    // Add S0
    optimalityFunctionValues["Optimal"] = S0

    alternatives.forEach((a, idx) => {
        optimalityFunctionValues[a.id] = S[idx + 1]
    })

    // Step 5: Utility Degree
    const scores: Record<string, number> = {}
    // The K array corresponds to S.slice(1).map(score => score / S0)
    // indices 1..m in S correspond to alternatives 0..m-1
    for (let i = 1; i <= m; i++) {
        const ki = S0 !== 0 ? S[i] / S0 : 0
        scores[alternatives[i - 1].id] = ki
    }

    return {
        scores,
        normalizedMatrix,
        weightedMatrix,
        optimalityFunctionValues,
        optimalAlternativeValues
    }
}
