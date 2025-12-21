import { Alternative, Criterion } from "./types";

/**
 * Statistical Variance Procedure (SVP) Weight Method
 * Formula:
 * 1. Normalize matrix using Min-Max normalization.
 * 2. Calculate variance for each criterion: V_j = sum( (n_ij - mean_j)^2 ) / m
 * 3. Weights: w_j = V_j / sum(V_k)
 */
export function calculateSVP(alternatives: Alternative[], criteria: Criterion[]) {
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
        let min = Infinity;
        let max = -Infinity;
        alternatives.forEach((alt) => {
            const val = Number(alt.scores[crit.id]) || 0;
            if (val < min) min = val;
            if (val > max) max = val;
        });

        const range = max - min;
        const normalizedUnits: number[] = [];

        alternatives.forEach((alt) => {
            const val = Number(alt.scores[crit.id]) || 0;
            let normalized = 0;
            if (range === 0) {
                normalized = 1;
            } else {
                if (crit.type === "beneficial") {
                    normalized = (val - min) / range;
                } else {
                    normalized = (max - val) / range;
                }
            }
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
