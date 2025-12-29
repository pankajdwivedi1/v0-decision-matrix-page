import type { Alternative, Criterion } from "./types"

interface WSMResult {
    scores: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    weightedMatrix: Record<string, Record<string, number>>
}

/**
 * WSM (Weighted Sum Model) Calculation
 */
export function calculateWSM(alternatives: Alternative[], criteria: Criterion[]): WSMResult {
    const scores: Record<string, number> = {}
    const epsilon = 1e-12

    const m = alternatives.length
    const n = criteria.length

    const normalizedMatrix: Record<string, Record<string, number>> = {}
    const weightedMatrix: Record<string, Record<string, number>> = {}

    alternatives.forEach(a => {
        normalizedMatrix[a.id] = {}
        weightedMatrix[a.id] = {}
    })

    if (m === 0 || n === 0) return {
        scores,
        normalizedMatrix,
        weightedMatrix,
    }

    const matrix: number[][] = alternatives.map((alt) =>
        criteria.map((crit) => alt.scores[crit.id] ?? 0)
    )

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

        if (!isFinite(maxVal) || maxVal === 0) maxVal = 1
        if (!isFinite(minVal) || minVal <= 0) minVal = epsilon

        maxPerCrit[j] = maxVal
        minPerCrit[j] = minVal
    }

    for (let i = 0; i < m; i++) {
        const alt = alternatives[i]
        let totalScore = 0

        for (let j = 0; j < n; j++) {
            const crit = criteria[j]
            const x_ij = matrix[i][j]

            let q_ij: number
            if (crit.type === "beneficial") {
                q_ij = x_ij / (maxPerCrit[j] || 1)
            } else {
                const denom = x_ij <= 0 ? epsilon : x_ij
                q_ij = (minPerCrit[j] || epsilon) / denom
            }

            if (!isFinite(q_ij) || q_ij < 0) q_ij = 0
            normalizedMatrix[alt.id][crit.id] = q_ij

            const weightedTerm = crit.weight * q_ij
            totalScore += weightedTerm
            weightedMatrix[alt.id][crit.id] = weightedTerm
        }

        scores[alt.id] = totalScore
    }

    return {
        scores,
        normalizedMatrix,
        weightedMatrix,
    }
}
