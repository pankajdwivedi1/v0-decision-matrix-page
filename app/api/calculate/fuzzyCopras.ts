import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyCOPRASResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  sPlus: Record<string, FuzzyNumber>
  sMinus: Record<string, FuzzyNumber>
  qi: Record<string, number>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyCOPRAS(
  alternatives: Alternative[],
  criteria: Criterion[]
): FuzzyCOPRASResult {
  try {
    const m = alternatives.length;
    const n = criteria.length;

    if (m === 0 || n === 0) {
      return {
        scores: {},
        fuzzyNormalizedMatrix: {},
        fuzzyWeightedMatrix: {},
        sPlus: {},
        sMinus: {},
        qi: {}
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
    const fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>> = {};
    alternatives.forEach(a => {
      fuzzyNormalizedMatrix[a.id] = {};
      fuzzyWeightedMatrix[a.id] = {};
    });

    const normMatrix: FuzzyNumber[][] = Array.from({ length: m }, () => Array(n).fill(null));

    for (let j = 0; j < n; j++) {
      const col = fuzzyMatrix.map(row => row[j]);
      
      const sumL = col.reduce((sum, fn) => sum + (Number(fn.l) || 0), 0) || 1;
      const sumM = col.reduce((sum, fn) => sum + (Number(fn.m) || 0), 0) || 1;
      const sumU = col.reduce((sum, fn) => sum + (Number(fn.u) || 0), 0) || 1;

      for (let i = 0; i < m; i++) {
        const fn = {
          l: (Number(fuzzyMatrix[i][j].l) || 0) / sumU,
          m: (Number(fuzzyMatrix[i][j].m) || 0) / sumM,
          u: (Number(fuzzyMatrix[i][j].u) || 0) / sumL
        };
        normMatrix[i][j] = fn;
        fuzzyNormalizedMatrix[alternatives[i].id][criteria[j].id] = fn;
      }
    }

    const sPlus: Record<string, FuzzyNumber> = {};
    const sMinus: Record<string, FuzzyNumber> = {};

    let hasNonBeneficial = false;

    for (let i = 0; i < m; i++) {
      let sp_l = 0, sp_m = 0, sp_u = 0;
      let sm_l = 0, sm_m = 0, sm_u = 0;

      for (let j = 0; j < n; j++) {
        const crit = criteria[j];
        const fn = normMatrix[i][j];

        const w_l = fn.l * (Number(crit.weight) || 0);
        const w_m = fn.m * (Number(crit.weight) || 0);
        const w_u = fn.u * (Number(crit.weight) || 0);

        fuzzyWeightedMatrix[alternatives[i].id][crit.id] = { l: w_l, m: w_m, u: w_u };

        if (crit.type === "non-beneficial") {
          hasNonBeneficial = true;
          sm_l += w_l;
          sm_m += w_m;
          sm_u += w_u;
        } else {
          sp_l += w_l;
          sp_m += w_m;
          sp_u += w_u;
        }
      }

      sPlus[alternatives[i].id] = { l: sp_l, m: sp_m, u: sp_u };
      sMinus[alternatives[i].id] = { l: sm_l, m: sm_m, u: sm_u };
    }

    const scores: Record<string, number> = {};
    const qi: Record<string, number> = {};

    const defuzzify = (fn: FuzzyNumber) => (fn.l + fn.m + fn.u) / 3;

    if (!hasNonBeneficial) {
      for (let i = 0; i < m; i++) {
        const altId = alternatives[i].id;
        const score = defuzzify(sPlus[altId]);
        scores[altId] = score;
        qi[altId] = score;
      }
    } else {
      const sMinusVals = alternatives.map(a => defuzzify(sMinus[a.id]) || 1e-12);
      const sPlusVals = alternatives.map(a => defuzzify(sPlus[a.id]));

      const minSMinus = Math.min(...sMinusVals);
      const totalSMinus = sMinusVals.reduce((acc, v) => acc + v, 0);

      const sumFraction = sMinusVals.reduce((acc, v) => acc + (minSMinus / v), 0);

      for (let i = 0; i < m; i++) {
        const altId = alternatives[i].id;
        const sMinus_i = sMinusVals[i];
        
        const secondTerm = (minSMinus * totalSMinus) / (sMinus_i * sumFraction);
        const Qi = sPlusVals[i] + secondTerm;

        scores[altId] = Qi;
        qi[altId] = Qi;
      }
    }

    return {
      scores,
      fuzzyNormalizedMatrix,
      fuzzyWeightedMatrix,
      sPlus,
      sMinus,
      qi
    };
  } catch (err) {
    console.error("CRASH IN FUZZY COPRAS:", err);
    throw err;
  }
}
