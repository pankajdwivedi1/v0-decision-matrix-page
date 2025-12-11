
import type { Alternative, Criterion } from "./types";

export interface DematelResult {
    weights: Record<string, number>;
    normalizedMatrix: Record<string, Record<string, number>>;
    directRelationMatrix: Record<string, Record<string, number>>;
    totalRelationMatrix: Record<string, Record<string, number>>;
    dValues: Record<string, number>;
    rValues: Record<string, number>;
    pValues: Record<string, number>;
    eValues: Record<string, number>;
}

function invertMatrix(M: number[][]): number[][] {
    // Gaussian elimination
    const n = M.length;
    // Create augmented matrix [M | I]
    const A = M.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))]);

    for (let i = 0; i < n; i++) {
        // Navigate through columns
        // Find pivot
        let pivot = A[i][i];
        let pivotRow = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(A[j][i]) > Math.abs(pivot)) {
                pivot = A[j][i];
                pivotRow = j;
            }
        }

        // Swap rows
        [A[i], A[pivotRow]] = [A[pivotRow], A[i]];

        pivot = A[i][i];
        if (Math.abs(pivot) < 1e-10) {
            // Matrix is singular or close to it
            console.warn("Matrix is singular or near-singular");
            return Array(n).fill(0).map((_, r) => Array(n).fill(0).map((_, c) => c === r ? 1 : 0)); // Return Identity as fallback? Or zero?
        }

        // Normalize row
        for (let j = 0; j < 2 * n; j++) {
            A[i][j] /= pivot;
        }

        // Eliminate other rows
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = A[k][i];
                for (let j = 0; j < 2 * n; j++) {
                    A[k][j] -= factor * A[i][j];
                }
            }
        }
    }

    // Extract right half
    return A.map(row => row.slice(n));
}

function matrixMultiply(A: number[][], B: number[][]): number[][] {
    const n = A.length;
    const C = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < n; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return C;
}

function matrixSubtract(A: number[][], B: number[][]): number[][] {
    return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

function matrixAdd(A: number[][], B: number[][]): number[][] {
    return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

function matrixScale(A: number[][], s: number): number[][] {
    return A.map(row => row.map(val => val * s));
}


export function calculateDematel(
    alternatives: Alternative[],
    criteria: Criterion[]
): DematelResult {
    const m = alternatives.length;
    const n = criteria.length;

    if (m === 0 || n === 0) {
        return {
            weights: {},
            normalizedDecisionMatrix: {},
            directRelationMatrix: {},
            totalRelationMatrix: {},
            dValues: {},
            rValues: {},
            pValues: {},
            eValues: {},
        };
    }

    // 1. Prepare Decision Matrix
    const matrix: number[][] = alternatives.map((alt) =>
        criteria.map((crit) => {
            const val = Number(alt.scores[crit.id]);
            return isNaN(val) ? 0 : val;
        })
    );

    // 2. Normalize Decision Matrix (Min-Max) for Correlation calc
    // Note: CRITIC uses standard deviation and correlation on Normalized matrix.
    // We'll do same to get correlations.
    const normalizedDecisionMatrix: number[][] = Array(m).fill(0).map(() => Array(n).fill(0));
    const normDecMatrixObj: Record<string, Record<string, number>> = {};
    alternatives.forEach(alt => normDecMatrixObj[alt.id] = {});

    for (let j = 0; j < n; j++) {
        const col = matrix.map(row => row[j]);
        const maxVal = Math.max(...col);
        const minVal = Math.min(...col);
        const range = maxVal - minVal || 1e-9;

        for (let i = 0; i < m; i++) {
            let val = 0;
            if (criteria[j].type === 'beneficial') {
                val = (matrix[i][j] - minVal) / range;
            } else {
                val = (maxVal - matrix[i][j]) / range;
            }
            normalizedDecisionMatrix[i][j] = val;
            normDecMatrixObj[alternatives[i].id][criteria[j].id] = val;
        }
    }

    // 3. Calculate Direct Relation Matrix A (Correlation based)
    // A_ij = |Correlation(C_i, C_j)| with A_ii = 0
    const A: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    // Helpers for correlation
    const getCol = (mat: number[][], colIdx: number) => mat.map(row => row[colIdx]);
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const pearson = (arr1: number[], arr2: number[]) => {
        const m1 = mean(arr1);
        const m2 = mean(arr2);
        let num = 0, den1 = 0, den2 = 0;
        for (let i = 0; i < arr1.length; i++) {
            num += (arr1[i] - m1) * (arr2[i] - m2);
            den1 += (arr1[i] - m1) ** 2;
            den2 += (arr2[i] - m2) ** 2;
        }
        if (den1 === 0 || den2 === 0) return 0;
        return num / Math.sqrt(den1 * den2);
    };

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) {
                A[i][j] = 0;
            } else {
                const cor = pearson(getCol(normalizedDecisionMatrix, i), getCol(normalizedDecisionMatrix, j));
                A[i][j] = Math.abs(cor); // Absolute correlation as influence intensity
            }
        }
    }

    // 4. DEMATEL Step 2: Normalization
    // alpha = max_i ( sum_j a_ij )
    let maxRowSum = 0;
    for (let i = 0; i < n; i++) {
        const s = A[i].reduce((a, b) => a + b, 0);
        if (s > maxRowSum) maxRowSum = s;
    }
    const alpha = maxRowSum || 1; // avoid /0

    const X = matrixScale(A, 1 / alpha); // X = A / alpha

    // 5. DEMATEL Step 3: Total Relation Matrix T = X(I - X)^-1
    const I = Array(n).fill(0).map((_, r) => Array(n).fill(0).map((_, c) => r === c ? 1 : 0));
    const I_minus_X = matrixSubtract(I, X);
    const I_minus_X_inv = invertMatrix(I_minus_X);

    const T = matrixMultiply(X, I_minus_X_inv);

    // 6. Step 4: Influence (D) and Dependence (R)
    const D: number[] = T.map(row => row.reduce((a, b) => a + b, 0));
    const R: number[] = Array(n).fill(0).map((_, j) => T.reduce((sum, row) => sum + row[j], 0));

    // 7. Step 5: Prominence (P) and Relation (E)
    const P = D.map((d, i) => d + R[i]);
    const E = D.map((d, i) => d - R[i]);

    // 8. Step 6: Weights
    // w_i = P_i / sum(P)
    const sumP = P.reduce((a, b) => a + b, 0);
    const weightsArr = P.map(p => sumP === 0 ? 1 / n : p / sumP);

    // Format outputs
    const weights: Record<string, number> = {};
    const dValues: Record<string, number> = {};
    const rValues: Record<string, number> = {};
    const pValues: Record<string, number> = {};
    const eValues: Record<string, number> = {};
    const directRelationMatrixObj: Record<string, Record<string, number>> = {};
    const totalRelationMatrixObj: Record<string, Record<string, number>> = {};

    criteria.forEach((crit, i) => {
        weights[crit.id] = weightsArr[i];
        dValues[crit.id] = D[i];
        rValues[crit.id] = R[i];
        pValues[crit.id] = P[i];
        eValues[crit.id] = E[i];

        directRelationMatrixObj[crit.id] = {};
        totalRelationMatrixObj[crit.id] = {};
        criteria.forEach((c2, j) => {
            directRelationMatrixObj[crit.id][c2.id] = A[i][j];
            totalRelationMatrixObj[crit.id][c2.id] = T[i][j];
        });
    });

    return {
        weights,
        normalizedMatrix: normDecMatrixObj,
        directRelationMatrix: directRelationMatrixObj,
        totalRelationMatrix: totalRelationMatrixObj,
        dValues,
        rValues,
        pValues,
        eValues,
    };
}
