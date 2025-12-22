import { Alternative, Criterion } from "./types";

/**
 * Goal Programming–based Objective Weights (GPOW)
 * Developed by: Wang, Y. M. (2006)
 * 
 * Formula:
 * 1. Normalize matrix: n_ij = x_ij / sqrt(sum(x_kj^2))
 * 2. Determine goal (ideal solution): G_j = max(n_ij) for beneficial, min(n_ij) for non-beneficial
 * 3. Calculate goal deviation: GD_j = sum_i( |n_ij - G_j| )
 * 4. Weights: w_j = GD_j / sum(GD_k)
 */
export function calculateGPOW(alternatives: Alternative[], criteria: Criterion[]) {
    const m = alternatives.length;
    const n = criteria.length;

    const weights: Record<string, number> = {};
    const normalizedMatrix: Record<string, Record<string, number>> = {};
    const goalDeviationValues: Record<string, number> = {};
    const goalValues: Record<string, number> = {};

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

        // Step 2: Determine goal (ideal solution)
        if (crit.type === "beneficial") {
            goalValues[crit.id] = Math.max(...normalizedUnits);
        } else {
            goalValues[crit.id] = Math.min(...normalizedUnits);
        }

        // Step 3: Calculate goal deviation value
        let gdValue = 0;
        normalizedUnits.forEach((val) => {
            gdValue += Math.abs(val - goalValues[crit.id]);
        });
        goalDeviationValues[crit.id] = gdValue;
    });

    // Step 4: Calculate weights
    const totalGD = Object.values(goalDeviationValues).reduce((a, b) => a + b, 0);
    criteria.forEach((crit) => {
        weights[crit.id] = totalGD === 0 ? 1 / n : goalDeviationValues[crit.id] / totalGD;
    });

    return { weights, normalizedMatrix, goalDeviationValues, goalValues };
}
