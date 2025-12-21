import { Alternative, Criterion } from "./types";

/**
 * Mean Absolute Deviation (MAD) Weight Method
 * Formula:
 * 1. Normalize matrix: n_ij = x_ij / sum(x_kj)
 * 2. Calculate mean absolute deviation for each criterion: MAD_j = sum( |n_ij - mean_j| ) / m
 * 3. Weights: w_j = MAD_j / sum(MAD_k)
 */
export function calculateMAD(alternatives: Alternative[], criteria: Criterion[]) {
    const m = alternatives.length;
    const n = criteria.length;

    const weights: Record<string, number> = {};
    const normalizedMatrix: Record<string, Record<string, number>> = {};
    const madValues: Record<string, number> = {};

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

        // Step 2: MAD
        const mean = normalizedUnits.reduce((a, b) => a + b, 0) / m;
        const mad = normalizedUnits.reduce((acc, val) => acc + Math.abs(val - mean), 0) / m;
        madValues[crit.id] = mad;
    });

    // Step 3: Weights
    const totalMAD = Object.values(madValues).reduce((a, b) => a + b, 0);
    criteria.forEach((crit) => {
        weights[crit.id] = totalMAD === 0 ? 1 / n : madValues[crit.id] / totalMAD;
    });

    return { weights, normalizedMatrix, madValues };
}
