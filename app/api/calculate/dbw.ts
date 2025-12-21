import { Alternative, Criterion } from "./types";

/**
 * Distance-based Weighting Method (DBW)
 * Formula:
 * 1. Normalize matrix: n_ij = x_ij / sum(x_kj)
 * 2. Calculate sum of distances between all pairs of alternatives for each criterion:
 *    D_j = sum_i sum_k |n_ij - n_kj|
 * 3. Weights: w_j = D_j / sum(D_k)
 */
export function calculateDBW(alternatives: Alternative[], criteria: Criterion[]) {
    const m = alternatives.length;
    const n = criteria.length;

    const weights: Record<string, number> = {};
    const normalizedMatrix: Record<string, Record<string, number>> = {};
    const distanceValues: Record<string, number> = {};

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

        // Step 2: Distance (Sum of pairs)
        let totalDist = 0;
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < m; j++) {
                totalDist += Math.abs(normalizedUnits[i] - normalizedUnits[j]);
            }
        }
        distanceValues[crit.id] = totalDist;
    });

    // Step 3: Weights
    const grandTotalDist = Object.values(distanceValues).reduce((a, b) => a + b, 0);
    criteria.forEach((crit) => {
        weights[crit.id] = grandTotalDist === 0 ? 1 / n : distanceValues[crit.id] / grandTotalDist;
    });

    return { weights, normalizedMatrix, distanceValues };
}
