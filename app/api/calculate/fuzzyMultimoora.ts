import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyMULTIMOORAResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  ratioSystemScores: Record<string, number>
  referencePointScores: Record<string, number>
  fullMultiplicativeScores: Record<string, number>
  ratioSystemRanking: Record<string, number>
  referencePointRanking: Record<string, number>
  fullMultiplicativeRanking: Record<string, number>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyMULTIMOORA(
  alternatives: Alternative[],
  criteria: Criterion[]
): FuzzyMULTIMOORAResult {
  try {
    const m = alternatives.length
    const n = criteria.length

    if (m === 0 || n === 0) {
      return {
        scores: {},
        fuzzyNormalizedMatrix: {},
        fuzzyWeightedMatrix: {},
        ratioSystemScores: {},
        referencePointScores: {},
        fullMultiplicativeScores: {},
        ratioSystemRanking: {},
        referencePointRanking: {},
        fullMultiplicativeRanking: {}
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

    const vertexDistance = (a: FuzzyNumber, b: FuzzyNumber): number => {
      return Math.sqrt((1 / 3) * (
        Math.pow((Number(a.l) || 0) - (Number(b.l) || 0), 2) +
        Math.pow((Number(a.m) || 0) - (Number(b.m) || 0), 2) +
        Math.pow((Number(a.u) || 0) - (Number(b.u) || 0), 2)
      ));
    };

    const fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>> = {};
    alternatives.forEach(a => fuzzyWeightedMatrix[a.id] = {});

    const ratioSystemScores: Record<string, number> = {};
    const rPoint: FuzzyNumber[] = [];
    const referencePointScores: Record<string, number> = {};
    const fullMultiplicativeScores: Record<string, number> = {};

    for (let j = 0; j < n; j++) {
      const col = normMatrix.map(row => row[j]);
      const crit = criteria[j];

      if (crit.type === "beneficial") {
        rPoint.push({
          l: Math.max(...col.map(fn => Number(fn.l) || 0)),
          m: Math.max(...col.map(fn => Number(fn.m) || 0)),
          u: Math.max(...col.map(fn => Number(fn.u) || 0))
        });
      } else {
        rPoint.push({
          l: Math.min(...col.map(fn => Number(fn.l) || 0)),
          m: Math.min(...col.map(fn => Number(fn.m) || 0)),
          u: Math.min(...col.map(fn => Number(fn.u) || 0))
        });
      }
    }

    for (let i = 0; i < m; i++) {
      let ben_l = 0, ben_m = 0, ben_u = 0;
      let cost_l = 0, cost_m = 0, cost_u = 0;

      let distRef = 0;
      let mult_l = 1, mult_m = 1, mult_u = 1;

      for (let j = 0; j < n; j++) {
        const crit = criteria[j];
        const fn = normMatrix[i][j];

        const w_l = fn.l * (Number(crit.weight) || 0);
        const w_m = fn.m * (Number(crit.weight) || 0);
        const w_u = fn.u * (Number(crit.weight) || 0);

        fuzzyWeightedMatrix[alternatives[i].id][crit.id] = { l: w_l, m: w_m, u: w_u };

        if (crit.type === "beneficial") {
          ben_l += w_l;
          ben_m += w_m;
          ben_u += w_u;
        } else {
          cost_l += w_l;
          cost_m += w_m;
          cost_u += w_u;
        }

        const dist = vertexDistance(rPoint[j], { l: w_l, m: w_m, u: w_u });
        distRef = Math.max(distRef, dist);

        const power_l = Math.pow(fn.l > 0 ? fn.l : 0.0001, Number(crit.weight) || 0);
        const power_m = Math.pow(fn.m > 0 ? fn.m : 0.0001, Number(crit.weight) || 0);
        const power_u = Math.pow(fn.u > 0 ? fn.u : 0.0001, Number(crit.weight) || 0);

        if (crit.type === "beneficial") {
          mult_l *= power_l;
          mult_m *= power_m;
          mult_u *= power_u;
        } else {
          mult_l /= (power_u || 1);
          mult_m /= (power_m || 1);
          mult_u /= (power_l || 1);
        }
      }

      ratioSystemScores[alternatives[i].id] = ((ben_l - cost_u) + (ben_m - cost_m) + (ben_u - cost_l)) / 3;
      referencePointScores[alternatives[i].id] = distRef;
      fullMultiplicativeScores[alternatives[i].id] = (mult_l + mult_m + mult_u) / 3;
    }

    const sortMap = (map: Record<string, number>, ascending: boolean) => {
      const sorted = Object.entries(map).sort((a, b) => ascending ? a[1] - b[1] : b[1] - a[1]);
      const res: Record<string, number> = {};
      sorted.forEach(([id], index) => res[id] = index + 1);
      return res;
    };

    const ratioSystemRanking = sortMap(ratioSystemScores, false);
    const referencePointRanking = sortMap(referencePointScores, true); 
    const fullMultiplicativeRanking = sortMap(fullMultiplicativeScores, false);

    const finalScores: Record<string, number> = {};
    for (let i = 0; i < m; i++) {
      const id = alternatives[i].id;
      const r1 = ratioSystemRanking[id];
      const r2 = referencePointRanking[id];
      const r3 = fullMultiplicativeRanking[id];
      finalScores[id] = (m - r1) + (m - r2) + (m - r3);
    }

    return {
      scores: finalScores,
      fuzzyNormalizedMatrix,
      fuzzyWeightedMatrix,
      ratioSystemScores,
      referencePointScores,
      fullMultiplicativeScores,
      ratioSystemRanking,
      referencePointRanking,
      fullMultiplicativeRanking
    };
  } catch (err) {
    console.error("CRASH IN FUZZY MULTIMOORA:", err);
    throw err;
  }
}
