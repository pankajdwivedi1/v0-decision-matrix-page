import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyMARCOSResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  utilityDegrees: Record<string, number>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyMARCOS(
  alternatives: Alternative[],
  criteria: Criterion[]
): FuzzyMARCOSResult {
  try {
    const m = alternatives.length
    const n = criteria.length

    if (m === 0 || n === 0) {
      return {
        scores: {},
        fuzzyNormalizedMatrix: {},
        fuzzyWeightedMatrix: {},
        utilityDegrees: {}
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

      const maxU = Math.max(...col.map(fn => Number(fn.u) || 0));
      const minL = Math.min(...col.map(fn => Number(fn.l) || 0));

      for (let i = 0; i < m; i++) {
        let fn: FuzzyNumber;
        if (crit.type === "beneficial") {
          fn = {
            l: (Number(fuzzyMatrix[i][j].l) || 0) / (maxU || 1),
            m: (Number(fuzzyMatrix[i][j].m) || 0) / (maxU || 1),
            u: (Number(fuzzyMatrix[i][j].u) || 0) / (maxU || 1)
          };
        } else {
          fn = {
            l: (minL || 1) / ((Number(fuzzyMatrix[i][j].u) || 0) || 1),
            m: (minL || 1) / ((Number(fuzzyMatrix[i][j].m) || 0) || 1),
            u: (minL || 1) / ((Number(fuzzyMatrix[i][j].l) || 0) || 1)
          };
        }
        normMatrix[i][j] = fn;
        fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;
      }
    }

    const fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>> = {};
    alternatives.forEach(a => fuzzyWeightedMatrix[a.id] = {});

    const sValues: FuzzyNumber[] = [];

    for (let i = 0; i < m; i++) {
      let sumL = 0, sumM = 0, sumU = 0;
      for (let j = 0; j < n; j++) {
        const crit = criteria[j];
        const fn = normMatrix[i][j];

        const w_l = fn.l * (Number(crit.weight) || 0);
        const w_m = fn.m * (Number(crit.weight) || 0);
        const w_u = fn.u * (Number(crit.weight) || 0);

        fuzzyWeightedMatrix[alternatives[i].id][crit.id] = { l: w_l, m: w_m, u: w_u };

        sumL += w_l;
        sumM += w_m;
        sumU += w_u;
      }
      sValues[i] = { l: sumL, m: sumM, u: sumU };
    }

    let sIdeal_l = 0, sIdeal_m = 0, sIdeal_u = 0;
    let sAntiIdeal_l = 0, sAntiIdeal_m = 0, sAntiIdeal_u = 0;

    for (let j = 0; j < n; j++) {
      const col = normMatrix.map(row => row[j]);
      const crit = criteria[j];

      if (crit.type === "beneficial") {
        const maxL = Math.max(...col.map(fn => fn.l));
        const maxM = Math.max(...col.map(fn => fn.m));
        const maxU = Math.max(...col.map(fn => fn.u));
        
        const minL = Math.min(...col.map(fn => fn.l));
        const minM = Math.min(...col.map(fn => fn.m));
        const minU = Math.min(...col.map(fn => fn.u));

        sIdeal_l += maxL * crit.weight;
        sIdeal_m += maxM * crit.weight;
        sIdeal_u += maxU * crit.weight;

        sAntiIdeal_l += minL * crit.weight;
        sAntiIdeal_m += minM * crit.weight;
        sAntiIdeal_u += minU * crit.weight;
      } else {
        const minL = Math.min(...col.map(fn => fn.l));
        const minM = Math.min(...col.map(fn => fn.m));
        const minU = Math.min(...col.map(fn => fn.u));
        
        const maxL = Math.max(...col.map(fn => fn.l));
        const maxM = Math.max(...col.map(fn => fn.m));
        const maxU = Math.max(...col.map(fn => fn.u));

        sIdeal_l += minL * crit.weight;
        sIdeal_m += minM * crit.weight;
        sIdeal_u += minU * crit.weight;

        sAntiIdeal_l += maxL * crit.weight;
        sAntiIdeal_m += maxM * crit.weight;
        sAntiIdeal_u += maxU * crit.weight;
      }
    }

    const utilityDegrees: Record<string, number> = {};
    const scores: Record<string, number> = {};

    const defuzzify = (fn: FuzzyNumber) => (fn.l + fn.m + fn.u) / 3;

    const sIdealVal = (sIdeal_l + sIdeal_m + sIdeal_u) / 3;
    const sAntiIdealVal = (sAntiIdeal_l + sAntiIdeal_m + sAntiIdeal_u) / 3;

    for (let i = 0; i < m; i++) {
      const altId = alternatives[i].id;
      const s_i = defuzzify(sValues[i]);

      const k_minus = sIdealVal > 0 ? s_i / sIdealVal : 0;
      const k_plus = sAntiIdealVal > 0 ? s_i / sAntiIdealVal : 0;

      let utility = 0;
      if (k_minus > 0 && k_plus > 0) {
        const denominator = 1 + (k_plus / k_minus) + (k_minus / k_plus);
        utility = (k_plus + k_minus) / denominator;
      } else {
        utility = k_minus || k_plus || 0;
      }

      utilityDegrees[altId] = utility;
      scores[altId] = utility;
    }

    return {
      scores,
      fuzzyNormalizedMatrix,
      fuzzyWeightedMatrix,
      utilityDegrees
    };
  } catch (err) {
    console.error("CRASH IN FUZZY MARCOS:", err);
    throw err;
  }
}
