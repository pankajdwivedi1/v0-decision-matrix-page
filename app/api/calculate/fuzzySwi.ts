import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzySWIResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyInformationMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedInformationMatrix: Record<string, Record<string, FuzzyNumber>>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzySWI(
  alternatives: Alternative[],
  criteria: Criterion[]
): FuzzySWIResult {
  try {
    const m = alternatives.length;
    const n = criteria.length;

    if (m === 0 || n === 0) {
      return {
        scores: {},
        fuzzyNormalizedMatrix: {},
        fuzzyInformationMatrix: {},
        fuzzyWeightedInformationMatrix: {}
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

      if (crit.type === "non-beneficial") {
        const invL = col.map(fn => 1 / (Number(fn.u) || 0.001));
        const invM = col.map(fn => 1 / (Number(fn.m) || 0.001));
        const invU = col.map(fn => 1 / (Number(fn.l) || 0.001));

        const sumInvL = invL.reduce((sum, v) => sum + v, 0) || 1;
        const sumInvM = invM.reduce((sum, v) => sum + v, 0) || 1;
        const sumInvU = invU.reduce((sum, v) => sum + v, 0) || 1;

        for (let i = 0; i < m; i++) {
          const fn = {
            l: invL[i] / sumInvU,
            m: invM[i] / sumInvM,
            u: invU[i] / sumInvL
          };
          normMatrix[i][j] = fn;
          fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;
        }
      } else {
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
          fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;
        }
      }
    }

    const fuzzyInformationMatrix: Record<string, Record<string, FuzzyNumber>> = {};
    const fuzzyWeightedInformationMatrix: Record<string, Record<string, FuzzyNumber>> = {};
    const scores: Record<string, number> = {};

    alternatives.forEach(a => {
      fuzzyInformationMatrix[a.id] = {};
      fuzzyWeightedInformationMatrix[a.id] = {};
    });

    for (let i = 0; i < m; i++) {
      let totalScoreL = 0, totalScoreM = 0, totalScoreU = 0;

      for (let j = 0; j < n; j++) {
        const crit = criteria[j];
        const idm = normMatrix[i][j];

        const infoFn = {
          l: Math.log2(1 / (idm.u || 0.001)),
          m: Math.log2(1 / (idm.m || 0.001)),
          u: Math.log2(1 / (idm.l || 0.001))
        };
        fuzzyInformationMatrix[alternatives[i].id][crit.id] = infoFn;

        const w = Number(crit.weight) || 0;
        const wInfoL = infoFn.l * w;
        const wInfoM = infoFn.m * w;
        const wInfoU = infoFn.u * w;

        fuzzyWeightedInformationMatrix[alternatives[i].id][crit.id] = { l: wInfoL, m: wInfoM, u: wInfoU };

        totalScoreL += wInfoL;
        totalScoreM += wInfoM;
        totalScoreU += wInfoU;
      }
      scores[alternatives[i].id] = (totalScoreL + totalScoreM + totalScoreU) / 3;
    }

    return {
      scores,
      fuzzyNormalizedMatrix,
      fuzzyInformationMatrix,
      fuzzyWeightedInformationMatrix
    };
  } catch (err) {
    console.error("CRASH IN FUZZY SWI:", err);
    throw err;
  }
}
