import type { Alternative, Criterion } from "./types"

/**
 * GRA (Grey Relational Analysis)
 * Steps:
 * 1. Normalize the decision matrix
 * 2. Calculate deviation sequence
 * 3. Calculate Grey Relational Coefficient (GRC)
 * 4. Calculate Grey Relational Grade (GRG)
 */

interface GRAResult {
    scores: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    deviationSequence: Record<string, Record<string, number>>
    greyRelationalCoefficients: Record<string, Record<string, number>>
    referenceSequence?: Record<string, number>
}

export function calculateGRA(
    alternatives: Alternative[],
    criteria: Criterion[],
    zeta: number = 0.5
): GRAResult {
    const m = alternatives.length
    const n = criteria.length

    // Step 1: Normalize decision matrix
    // For beneficial: (x - min) / (max - min)
    // For non-beneficial: (max - x) / (max - min)
    const matrix: number[][] = alternatives.map((alt) =>
        criteria.map((crit) => Number(alt.scores[crit.id] || 0))
    )

    const normalizedMatrixData: number[][] = []
    const normalizedMatrix: Record<string, Record<string, number>> = {}
    alternatives.forEach(a => normalizedMatrix[a.id] = {})

    for (let j = 0; j < n; j++) {
        const colVals = matrix.map(row => row[j])
        const min = Math.min(...colVals)
        const max = Math.max(...colVals)
        const denom = max - min || 1 // Avoid division by zero

        for (let i = 0; i < m; i++) {
            let val = 0;
            if (criteria[j].type === "beneficial") {
                val = (matrix[i][j] - min) / denom
            } else {
                val = (max - matrix[i][j]) / denom
            }

            if (!normalizedMatrixData[i]) normalizedMatrixData[i] = []
            normalizedMatrixData[i][j] = val
            normalizedMatrix[alternatives[i].id][criteria[j].id] = val
        }
    }

    // Reference sequence (Ideal solution) is typically all 1s after this normalization
    const referenceSequenceData: number[] = Array(n).fill(1)
    const referenceSequence: Record<string, number> = {}
    criteria.forEach((c, idx) => referenceSequence[c.id] = referenceSequenceData[idx])

    // Step 2: Deviation Sequence
    // Delta_ij = |x0_j - x_ij| = |1 - x_ij|
    const deviationData: number[][] = []
    const deviationSequence: Record<string, Record<string, number>> = {}
    alternatives.forEach(a => deviationSequence[a.id] = {})

    let maxDeviation = 0
    let minDeviation = 1 // Since x_ij is [0,1], deviation is [0,1], so min is likely 0

    for (let i = 0; i < m; i++) {
        deviationData[i] = []
        for (let j = 0; j < n; j++) {
            const dev = Math.abs(referenceSequenceData[j] - normalizedMatrixData[i][j])
            deviationData[i][j] = dev
            deviationSequence[alternatives[i].id][criteria[j].id] = dev

            if (dev > maxDeviation) maxDeviation = dev
            // We can find global min deviation, which should be 0 usually
        }
    }

    // Find global min deviation across all i, j (usually 0 if ideal exists or at least one value is 1)
    // Actually, minDeviation is traditionally defined as global min of Delta_ij
    let globalMinDev = Number.MAX_VALUE
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (deviationData[i][j] < globalMinDev) globalMinDev = deviationData[i][j]
        }
    }

    // Step 3: Grey Relational Coefficient (GRC)
    // GRC_ij = (minDev + zeta * maxDev) / (Delta_ij + zeta * maxDev)
    const grcData: number[][] = []
    const greyRelationalCoefficients: Record<string, Record<string, number>> = {}
    alternatives.forEach(a => greyRelationalCoefficients[a.id] = {})

    for (let i = 0; i < m; i++) {
        grcData[i] = []
        for (let j = 0; j < n; j++) {
            const val = (globalMinDev + zeta * maxDeviation) / (deviationData[i][j] + zeta * maxDeviation)
            grcData[i][j] = val
            greyRelationalCoefficients[alternatives[i].id][criteria[j].id] = val
        }
    }

    // Step 4: Grey Relational Grade (GRG)
    // Weighted sum of GRCs
    const scores: Record<string, number> = {}

    for (let i = 0; i < m; i++) {
        let sum = 0
        for (let j = 0; j < n; j++) {
            sum += grcData[i][j] * criteria[j].weight
        }
        scores[alternatives[i].id] = sum
    }

    return {
        scores,
        normalizedMatrix,
        deviationSequence,
        greyRelationalCoefficients
    }
}
