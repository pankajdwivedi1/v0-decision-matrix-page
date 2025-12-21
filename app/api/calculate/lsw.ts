import { Alternative, Criterion } from "./types";

/**
 * Least Squares Weighting Method (LSW)
 * Formula:
 * 1. Normalize matrix: n_ij = x_ij / sqrt(sum(x_kj^2))
 * 2. Calculate ideal solution: A* = max(n_ij) for beneficial, min(n_ij) for non-beneficial
 * 3. Calculate least squares value: LS_j = sum_i( (n_ij - A*_j)^2 )
 * 4. Weights: w_j = LS_j / sum(LS_k)
 */
export function calculateLSW(alternatives: Alternative[], criteria: Criterion[]) {
    const m = alternatives.length;
    const n = criteria.length;

    const weights: Record<string, number> = {};
    const normalizedMatrix: Record<string, Record<string, number>> = {};
    const leastSquaresValues: Record<string, number> = {};
    const idealSolution: Record<string, number> = {};

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

        // Step 2: Determine ideal solution
        if (crit.type === "beneficial") {
            idealSolution[crit.id] = Math.max(...normalizedUnits);
        } else {
            idealSolution[crit.id] = Math.min(...normalizedUnits);
        }

        // Step 3: Calculate least squares value
        let lsValue = 0;
        normalizedUnits.forEach((val) => {
            lsValue += Math.pow(val - idealSolution[crit.id], 2);
        });
        leastSquaresValues[crit.id] = lsValue;
    });

    // Step 4: Calculate weights
    const totalLS = Object.values(leastSquaresValues).reduce((a, b) => a + b, 0);
    criteria.forEach((crit) => {
        weights[crit.id] = totalLS === 0 ? 1 / n : leastSquaresValues[crit.id] / totalLS;
    });

    return { weights, normalizedMatrix, leastSquaresValues, idealSolution };
}
