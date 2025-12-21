import { Alternative, Criterion } from "./types";

/**
 * Standard Deviation (SD) Weight Method
 * Formula:
 * 1. Normalize matrix: n_ij = x_ij / sum(x_kj)
 * 2. Calculate standard deviation for each criterion: sigma_j = sqrt( sum( (n_ij - mean_j)^2 ) / m )
 * 3. Weights: w_j = sigma_j / sum(sigma_k)
 */
export function calculateSD(alternatives: Alternative[], criteria: Criterion[]) {
    const m = alternatives.length;
    const n = criteria.length;

    const weights: Record<string, number> = {};
    const normalizedMatrix: Record<string, Record<string, number>> = {};
    const sigmaValues: Record<string, number> = {};

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

        // Step 2: SD
        const mean = normalizedUnits.reduce((a, b) => a + b, 0) / m;
        const variance = normalizedUnits.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / m;
        const sigma = Math.sqrt(variance);
        sigmaValues[crit.id] = sigma;
    });

    // Step 3: Weights
    const totalSigma = Object.values(sigmaValues).reduce((a, b) => a + b, 0);
    criteria.forEach((crit) => {
        weights[crit.id] = totalSigma === 0 ? 1 / n : sigmaValues[crit.id] / totalSigma;
    });

    return { weights, normalizedMatrix, sigmaValues };
}
