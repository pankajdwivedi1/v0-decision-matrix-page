
import type { Alternative, Criterion } from "./types";

export interface LopcowResult {
    weights: Record<string, number>;
    normalizedMatrix: Record<string, Record<string, number>>;
    geometricMeans: Record<string, number>;
    logPercentages: Record<string, number>;
}

export function calculateLopcow(
    alternatives: Alternative[],
    criteria: Criterion[]
): LopcowResult {
    // 1. Prepare matrix
    const matrix: number[][] = [];
    alternatives.forEach((alt) => {
        const row: number[] = [];
        criteria.forEach((crit) => {
            const val = Number(alt.scores[crit.id]);
            row.push(isNaN(val) ? 0 : val);
        });
        matrix.push(row);
    });

    const m = alternatives.length;
    const n = criteria.length;

    // 2. Normalization
    // Benefit: r_ij = x_ij / sqrt(sum(x_ij^2))
    // Cost: r_ij = (1/x_ij) / sqrt(sum((1/x_ij)^2))

    // First, calculate denominators (sqrt of sum of squares)
    // For cost criteria, we need to handle 1/x_ij. If x_ij is 0, we have a problem.
    // Assuming inputs are non-zero. If 0, we might need a fallback or it will be Infinity.

    const normalizedMatrix: number[][] = alternatives.map(() => Array(n).fill(0));
    const rMatrix: number[][] = alternatives.map(() => Array(n).fill(0));

    for (let j = 0; j < n; j++) {
        const isCost = criteria[j].type === "non-beneficial";
        let sumSquares = 0;

        for (let i = 0; i < m; i++) {
            let val = matrix[i][j];
            if (isCost) {
                // numeric stability check
                if (val === 0) val = 0.000001; // Avoid division by zero
                val = 1 / val;
            }
            sumSquares += val * val;
        }

        const denom = Math.sqrt(sumSquares);

        for (let i = 0; i < m; i++) {
            let val = matrix[i][j];
            if (isCost) {
                if (val === 0) val = 0.000001;
                val = 1 / val;
            }

            const r = denom === 0 ? 0 : val / denom;
            rMatrix[i][j] = r;
        }
    }

    // 3. Geometric Mean
    // GM_j = (prod(r_ij))^(1/m)
    const geometricMeans: number[] = [];

    for (let j = 0; j < n; j++) {
        let product = 1;
        for (let i = 0; i < m; i++) {
            // If r is 0, product becomes 0. Ln(0) is -Infinity.
            // We should probably handle 0 carefully.
            let r = rMatrix[i][j];
            if (r <= 0) r = 0.000001;
            product *= r;
        }
        const gm = Math.pow(product, 1 / m);
        geometricMeans.push(gm);
    }

    // 4. Logarithmic Percentage Change
    // L_j = -ln(GM_j)
    const logPercentages: number[] = [];
    let sumL = 0;
    for (let j = 0; j < n; j++) {
        const gm = geometricMeans[j];
        // gm should be <= 1 since r_ij <= 1.
        // -ln(gm) should be >= 0.
        const l = -Math.log(gm);
        logPercentages.push(l);
        sumL += l;
    }

    // 5. Weights
    // w_j = L_j / sum(L_k)
    const weights: Record<string, number> = {};
    criteria.forEach((crit, idx) => {
        weights[crit.id] = sumL === 0 ? (1 / n) : (logPercentages[idx] / sumL);
    });

    // Format outputs
    const normMatrixObj: Record<string, Record<string, number>> = {};
    alternatives.forEach((alt, i) => {
        normMatrixObj[alt.id] = {};
        criteria.forEach((crit, j) => {
            normMatrixObj[alt.id][crit.id] = rMatrix[i][j];
        });
    });

    const gmObj: Record<string, number> = {};
    const lObj: Record<string, number> = {};
    criteria.forEach((crit, j) => {
        gmObj[crit.id] = geometricMeans[j];
        lObj[crit.id] = logPercentages[j];
    });

    return {
        weights,
        normalizedMatrix: normMatrixObj,
        geometricMeans: gmObj,
        logPercentages: lObj
    };
}
