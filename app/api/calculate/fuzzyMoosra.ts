import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyMOOSRAResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  beneficialSum: Record<string, FuzzyNumber>
  nonBeneficialSum: Record<string, FuzzyNumber>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyMOOSRA(
  alternatives: Alternative[],
  criteria: Criterion[]
): FuzzyMOOSRAResult {
  try {
    const m = alternatives.length
    const n = criteria.length

    if (m === 0 || n === 0) {
      return {
        scores: {},
        fuzzyNormalizedMatrix: {},
        fuzzyWeightedMatrix: {},
        beneficialSum: {},
        nonBeneficialSum: {}
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

      const sumSquareL = col.reduce((sum, fn) => sum + (Number(fn.l) || 0) * (Number(fn.l) || 0), 0);
      const sumSquareM = col.reduce((sum, fn) => sum + (Number(fn.m) || 0) * (Number(fn.m) || 0), 0);
      const sumSquareU = col.reduce((sum, fn) => sum + (Number(fn.u) || 0) * (Number(fn.u) || 0), 0);

      const denomL = Math.sqrt(sumSquareU) || 1;
      const denomM = Math.sqrt(sumSquareM) || 1;
      const denomU = Math.sqrt(sumSquareL) || 1;

      for (let i = 0; i < m; i++) {
        const fn = {
          l: (Number(fuzzyMatrix[i][j].l) || 0) / denomL,
          m: (Number(fuzzyMatrix[i][j].m) || 0) / denomM,
          u: (Number(fuzzyMatrix[i][j].u) || 0) / denomU
        };
        normMatrix[i][j] = fn;
        fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;
      }
    }

    const fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>> = {};
    const beneficialSum: Record<string, FuzzyNumber> = {};
    const nonBeneficialSum: Record<string, FuzzyNumber> = {};
    const scores: Record<string, number> = {};

    alternatives.forEach(a => fuzzyWeightedMatrix[a.id] = {});

    for (let i = 0; i < m; i++) {
      let ben_l = 0, ben_m = 0, ben_u = 0;
      let cost_l = 0, cost_m = 0, cost_u = 0;

      for (let j = 0; j < n; j++) {
        const crit = criteria[j];
        const fn = normMatrix[i][j];

        const w_l = fn.l * (Number(crit.weight) || 0);
        const w_m = fn.m * (Number(crit.weight) || 0);
        const w_u = fn.u * (Number(crit.weight) || 0);

        fuzzyWeightedMatrix[alternatives[i].id][crit.id] = { l: w_l, m: w_m, u: w_u };

        if (crit.type === "non-beneficial") {
          cost_l += w_l;
          cost_m += w_m;
          cost_u += w_u;
        } else {
          ben_l += w_l;
          ben_m += w_m;
          ben_u += w_u;
        }
      }

      beneficialSum[alternatives[i].id] = { l: ben_l, m: ben_m, u: ben_u };
      nonBeneficialSum[alternatives[i].id] = { l: cost_l, m: cost_m, u: cost_u };

      const b_val = (ben_l + ben_m + ben_u) / 3;
      const c_val = (cost_l + cost_m + cost_u) / 3;

      if (c_val === 0) {
        scores[alternatives[i].id] = b_val;
      } else {
        scores[alternatives[i].id] = b_val / c_val;
      }
    }

    return {
      scores,
      fuzzyNormalizedMatrix,
      fuzzyWeightedMatrix,
      beneficialSum,
      nonBeneficialSum
    };
  } catch (err) {
    console.error("CRASH IN FUZZY MOOSRA:", err);
    throw err;
  }
}
