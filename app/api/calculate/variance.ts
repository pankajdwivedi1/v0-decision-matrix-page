import { Alternative, Criterion } from "./types";

/**
 * Variance Weight Method
 * Formula:
 * 1. Normalize matrix: n_ij = x_ij / sum(x_kj)
 * 2. Calculate variance for each criterion: V_j = sum( (n_ij - mean_j)^2 ) / m
 * 3. Weights: w_j = V_j / sum(V_k)
 */
export function calculateVariance(alternatives: Alternative[], criteria: Criterion[]) {
    const m = alternatives.length;
    const n = criteria.length;

    const weights: Record<string, number> = {};
    const normalizedMatrix: Record<string, Record<string, number>> = {};
    const varianceValues: Record<string, number> = {};

    // Initialize normalizedMatrix
    alternatives.forEach((alt) => {
        normalizedMatrix[alt.id] = {};
    });

    criteria.forEach((crit) => {
        let sum = 0;
        alternatives.forEach((alt) => {
            const val = Number(alt.scores[crit.id]) || 0;
            sum += val;
        });

        // Step 1: Normalize
        const normalizedUnits: number[] = [];
        alternatives.forEach((alt) => {
            const val = Number(alt.scores[crit.id]) || 0;
            const normalized = sum === 0 ? 1 / m : val / sum;
            normalizedMatrix[alt.id][crit.id] = normalized;
            normalizedUnits.push(normalized);
        });

        // Step 2: Variance
        const mean = normalizedUnits.reduce((a, b) => a + b, 0) / m;
        const variance = normalizedUnits.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / m;
        varianceValues[crit.id] = variance;
    });

    // Step 3: Weights
    const totalVariance = Object.values(varianceValues).reduce((a, b) => a + b, 0);
    criteria.forEach((crit) => {
        weights[crit.id] = totalVariance === 0 ? 1 / n : varianceValues[crit.id] / totalVariance;
    });

    return { weights, normalizedMatrix, varianceValues };
}
