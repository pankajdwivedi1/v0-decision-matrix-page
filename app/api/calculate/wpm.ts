import type { Alternative, Criterion } from "./types"

interface WPMResult {
    scores: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    weightedProductMatrix: Record<string, Record<string, number>>
}

/**
 * WPM (Weighted Product Model) Calculation
 */
export function calculateWPM(alternatives: Alternative[], criteria: Criterion[]): WPMResult {
    const scores: Record<string, number> = {}
    const epsilon = 1e-12

    const m = alternatives.length
    const n = criteria.length

    const normalizedMatrix: Record<string, Record<string, number>> = {}
    const weightedProductMatrix: Record<string, Record<string, number>> = {}

    alternatives.forEach(a => {
        normalizedMatrix[a.id] = {}
        weightedProductMatrix[a.id] = {}
    })

    if (m === 0 || n === 0) return {
        scores,
        normalizedMatrix,
        weightedProductMatrix,
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
        let totalScore = 1

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

            const base = Math.max(q_ij, epsilon)
            const weightedTerm = Math.pow(base, crit.weight)
            totalScore *= weightedTerm
            weightedProductMatrix[alt.id][crit.id] = weightedTerm
        }

        scores[alt.id] = totalScore
    }

    return {
        scores,
        normalizedMatrix,
        weightedProductMatrix,
    }
}
