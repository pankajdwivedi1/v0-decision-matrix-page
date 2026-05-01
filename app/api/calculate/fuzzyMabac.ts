import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyMABACResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  borderApproximationArea: Record<string, FuzzyNumber>
  fuzzyDistanceMatrix: Record<string, Record<string, FuzzyNumber>>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyMABAC(
  alternatives: Alternative[],
  criteria: Criterion[]
): FuzzyMABACResult {
  try {
    const m = alternatives.length
    const n = criteria.length

    if (m === 0 || n === 0) {
      return {
        scores: {},
        fuzzyNormalizedMatrix: {},
        fuzzyWeightedMatrix: {},
        borderApproximationArea: {},
        fuzzyDistanceMatrix: {}
      }
    }

    const fuzzyMatrix: FuzzyNumber[][] = alternatives.map((alt) =>
      criteria.map((crit) => {
        const score = alt.scores[crit.id];
        if (score && typeof score === 'object' && 'l' in score && 'm' in score && 'u' in score) {
          return score as unknown as FuzzyNumber;
        }
        const val = Number(score) || 0;
        return crispToFuzzy(val);
      })
    )

    const fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>> = {};
    alternatives.forEach(a => fuzzyNormalizedMatrix[a.id] = {});

    const normMatrix: FuzzyNumber[][] = Array.from({ length: m }, () => Array(n).fill(null));

    for (let j = 0; j < n; j++) {
      const col = fuzzyMatrix.map(row => row[j]);
      const crit = criteria[j];

      const minL = Math.min(...col.map(fn => Number(fn.l) || 0));
      const maxU = Math.max(...col.map(fn => Number(fn.u) || 0));
      const range = (maxU - minL) || 1;

      for (let i = 0; i < m; i++) {
        let fn: FuzzyNumber;
        if (crit.type === "beneficial") {
          fn = {
            l: ((Number(fuzzyMatrix[i][j].l) || 0) - minL) / range,
            m: ((Number(fuzzyMatrix[i][j].m) || 0) - minL) / range,
            u: ((Number(fuzzyMatrix[i][j].u) || 0) - minL) / range
          };
        } else {
          fn = {
            l: (maxU - (Number(fuzzyMatrix[i][j].u) || 0)) / range,
            m: (maxU - (Number(fuzzyMatrix[i][j].m) || 0)) / range,
            u: (maxU - (Number(fuzzyMatrix[i][j].l) || 0)) / range
          };
        }
        normMatrix[i][j] = fn;
        fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;
      }
    }

    const fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>> = {};
    alternatives.forEach(a => fuzzyWeightedMatrix[a.id] = {});
    
    const weightedMatrixData: FuzzyNumber[][] = Array.from({ length: m }, () => Array(n).fill(null));

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const crit = criteria[j];
        const fn = normMatrix[i][j];

        const w_l = (Number(fn.l) + 1) * (Number(crit.weight) || 0);
        const w_m = (Number(fn.m) + 1) * (Number(crit.weight) || 0);
        const w_u = (Number(fn.u) + 1) * (Number(crit.weight) || 0);

        const wfn = { l: w_l, m: w_m, u: w_u };
        weightedMatrixData[i][j] = wfn;
        fuzzyWeightedMatrix[alternatives[i].id][crit.id] = wfn;
      }
    }

    const borderApproximationArea: Record<string, FuzzyNumber> = {};
    const g: FuzzyNumber[] = [];

    for (let j = 0; j < n; j++) {
      const col = weightedMatrixData.map(row => row[j]);
      
      const prodL = col.reduce((prod, fn) => prod * (Number(fn.l) || 0), 1);
      const prodM = col.reduce((prod, fn) => prod * (Number(fn.m) || 0), 1);
      const prodU = col.reduce((prod, fn) => prod * (Number(fn.u) || 0), 1);

      const g_j = {
        l: Math.pow(prodL, 1 / m),
        m: Math.pow(prodM, 1 / m),
        u: Math.pow(prodU, 1 / m)
      };
      g[j] = g_j;
      borderApproximationArea[criteria[j].id] = g_j;
    }

    const fuzzyDistanceMatrix: Record<string, Record<string, FuzzyNumber>> = {};
    alternatives.forEach(a => fuzzyDistanceMatrix[a.id] = {});

    const scores: Record<string, number> = {};

    for (let i = 0; i < m; i++) {
      let sumDefuzzifiedGap = 0;
      for (let j = 0; j < n; j++) {
        const wfn = weightedMatrixData[i][j];
        const g_j = g[j];

        const distFn = {
          l: wfn.l - g_j.u,
          m: wfn.m - g_j.m,
          u: wfn.u - g_j.l
        };

        fuzzyDistanceMatrix[alternatives[i].id][criteria[j].id] = distFn;

        const defuzz = (distFn.l + distFn.m + distFn.u) / 3;
        sumDefuzzifiedGap += defuzz;
      }
      scores[alternatives[i].id] = sumDefuzzifiedGap;
    }

    return {
      scores,
      fuzzyNormalizedMatrix,
      fuzzyWeightedMatrix,
      borderApproximationArea,
      fuzzyDistanceMatrix
    };
  } catch (err) {
    console.error("CRASH IN FUZZY MABAC:", err);
    throw err;
  }
}
