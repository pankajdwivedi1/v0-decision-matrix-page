import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyCOCOSOResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  weightedComparabilitySum: Record<string, FuzzyNumber>
  weightedComparabilityPower: Record<string, FuzzyNumber>
  kia: Record<string, number>
  kib: Record<string, number>
  kic: Record<string, number>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyCOCOSO(
  alternatives: Alternative[],
  criteria: Criterion[]
): FuzzyCOCOSOResult {
  try {
    const m = alternatives.length;
    const n = criteria.length;

    if (m === 0 || n === 0) {
      return {
        scores: {},
        fuzzyNormalizedMatrix: {},
        weightedComparabilitySum: {},
        weightedComparabilityPower: {},
        kia: {},
        kib: {},
        kic: {}
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

    const weightedComparabilitySum: Record<string, FuzzyNumber> = {};
    const weightedComparabilityPower: Record<string, FuzzyNumber> = {};

    const Si: FuzzyNumber[] = [];
    const Pi: FuzzyNumber[] = [];

    for (let i = 0; i < m; i++) {
      let s_l = 0, s_m = 0, s_u = 0;
      let p_l = 0, p_m = 0, p_u = 0;

      for (let j = 0; j < n; j++) {
        const crit = criteria[j];
        const fn = normMatrix[i][j];

        const w = Number(crit.weight) || 0;
        
        s_l += fn.l * w;
        s_m += fn.m * w;
        s_u += fn.u * w;

        p_l += Math.pow(fn.l > 0 ? fn.l : 0.001, w);
        p_m += Math.pow(fn.m > 0 ? fn.m : 0.001, w);
        p_u += Math.pow(fn.u > 0 ? fn.u : 0.001, w);
      }

      const s_fn = { l: s_l, m: s_m, u: s_u };
      const p_fn = { l: p_l, m: p_m, u: p_u };

      Si.push(s_fn);
      Pi.push(p_fn);

      weightedComparabilitySum[alternatives[i].id] = s_fn;
      weightedComparabilityPower[alternatives[i].id] = p_fn;
    }

    const defuzzify = (fn: FuzzyNumber) => (fn.l + fn.m + fn.u) / 3;

    const sVals = Si.map(defuzzify);
    const pVals = Pi.map(defuzzify);

    const sumSP = sVals.reduce((a, b, idx) => a + b + pVals[idx], 0) || 1;
    const minS = Math.min(...sVals) || 1;
    const minP = Math.min(...pVals) || 1;
    const maxS = Math.max(...sVals) || 1;
    const maxP = Math.max(...pVals) || 1;

    const kia: Record<string, number> = {};
    const kib: Record<string, number> = {};
    const kic: Record<string, number> = {};
    const scores: Record<string, number> = {};

    const λ = 0.5;

    for (let i = 0; i < m; i++) {
      const altId = alternatives[i].id;
      const s_i = sVals[i];
      const p_i = pVals[i];

      const k_a = (p_i + s_i) / sumSP;
      const k_b = (s_i / minS) + (p_i / minP);
      const k_c = (λ * s_i + (1 - λ) * p_i) / (λ * maxS + (1 - λ) * maxP);

      kia[altId] = k_a;
      kib[altId] = k_b;
      kic[altId] = k_c;

      const score = Math.pow(k_a * k_b * k_c, 1 / 3) + ((k_a + k_b + k_c) / 3);
      scores[altId] = score;
    }

    return {
      scores,
      fuzzyNormalizedMatrix,
      weightedComparabilitySum,
      weightedComparabilityPower,
      kia,
      kib,
      kic
    };
  } catch (err) {
    console.error("CRASH IN FUZZY COCOSO:", err);
    throw err;
  }
}
