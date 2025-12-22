import { Alternative, Criterion } from "./types";

/**
 * Linear Programming Weight Method (LPWM)
 * Developed by: Srinivas, S. and Rao, R. V. (2007)
 * 
 * Formula:
 * 1. Normalize matrix: n_ij = x_ij / sqrt(sum(x_kj^2))
 * 2. Determine anti-ideal solution: L_j = min(n_ij) for beneficial, max(n_ij) for non-beneficial
 * 3. Calculate deviation from anti-ideal: LD_j = sum_i( |n_ij - L_j| )
 * 4. Weights: w_j = LD_j / sum(LD_k)
 */
export function calculateLPWM(alternatives: Alternative[], criteria: Criterion[]) {
    const m = alternatives.length;
    const n = criteria.length;

    const weights: Record<string, number> = {};
    const normalizedMatrix: Record<string, Record<string, number>> = {};
    const lowerDeviationValues: Record<string, number> = {};
    const antiIdealValues: Record<string, number> = {};

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

        // Step 2: Determine anti-ideal solution
        if (crit.type === "beneficial") {
            antiIdealValues[crit.id] = Math.min(...normalizedUnits);
        } else {
            antiIdealValues[crit.id] = Math.max(...normalizedUnits);
        }

        // Step 3: Calculate deviation from anti-ideal
        let ldValue = 0;
        normalizedUnits.forEach((val) => {
            ldValue += Math.abs(val - antiIdealValues[crit.id]);
        });
        lowerDeviationValues[crit.id] = ldValue;
    });

    // Step 4: Calculate weights
    const totalLD = Object.values(lowerDeviationValues).reduce((a, b) => a + b, 0);
    criteria.forEach((crit) => {
        weights[crit.id] = totalLD === 0 ? 1 / n : lowerDeviationValues[crit.id] / totalLD;
    });

    return { weights, normalizedMatrix, lowerDeviationValues, antiIdealValues };
}
