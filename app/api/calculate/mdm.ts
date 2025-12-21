import { Alternative, Criterion } from "./types";

/**
 * Maximizing Deviation Method (MDM) Weight Method
 * Formula:
 * 1. Normalize matrix: n_ij = x_ij / sqrt(sum(x_kj^2))
 * 2. Calculate deviation for each criterion: D_j = sum_i( sum_k( |n_ij - n_kj| ) )
 * 3. Weights: w_j = D_j / sum(D_k)
 */
export function calculateMDM(alternatives: Alternative[], criteria: Criterion[]) {
    const m = alternatives.length;
    const n = criteria.length;

    const weights: Record<string, number> = {};
    const normalizedMatrix: Record<string, Record<string, number>> = {};
    const deviationValues: Record<string, number> = {};

    // Initialize normalizedMatrix
    alternatives.forEach((alt) => {
        normalizedMatrix[alt.id] = {};
    });

    criteria.forEach((crit) => {
        // Step 1: Vector Normalization
        let sumSquares = 0;
        alternatives.forEach((alt) => {
            const val = Number(alt.scores[crit.id]) || 0;
            sumSquares += val * val;
        });

        const denominator = Math.sqrt(sumSquares);
        const normalizedUnits: number[] = [];

        alternatives.forEach((alt) => {
            const val = Number(alt.scores[crit.id]) || 0;
            const normalized = denominator === 0 ? 0 : val / denominator;
            normalizedMatrix[alt.id][crit.id] = normalized;
            normalizedUnits.push(normalized);
        });

        // Step 2: Calculate total deviation for this criterion
        let totalDeviation = 0;
        for (let i = 0; i < m; i++) {
            for (let k = 0; k < m; k++) {
                totalDeviation += Math.abs(normalizedUnits[i] - normalizedUnits[k]);
            }
        }
        deviationValues[crit.id] = totalDeviation;
    });

    // Step 3: Calculate weights
    const totalDeviation = Object.values(deviationValues).reduce((a, b) => a + b, 0);
    criteria.forEach((crit) => {
        weights[crit.id] = totalDeviation === 0 ? 1 / n : deviationValues[crit.id] / totalDeviation;
    });

    return { weights, normalizedMatrix, deviationValues };
}
