import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyMAIRCAResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  theoreticalRatings: Record<string, Record<string, FuzzyNumber>>
  realRatings: Record<string, Record<string, FuzzyNumber>>
  gapMatrix: Record<string, Record<string, FuzzyNumber>>
  totalGaps: Record<string, number>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyMAIRCA(
  alternatives: Alternative[],
  criteria: Criterion[]
): FuzzyMAIRCAResult {
  try {
    const m = alternatives.length
    const n = criteria.length

    if (m === 0 || n === 0) {
      return {
        scores: {},
        fuzzyNormalizedMatrix: {},
        theoreticalRatings: {},
        realRatings: {},
        gapMatrix: {},
        totalGaps: {}
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

    const theoreticalRatings: Record<string, Record<string, FuzzyNumber>> = {};
    const realRatings: Record<string, Record<string, FuzzyNumber>> = {};
    const gapMatrix: Record<string, Record<string, FuzzyNumber>> = {};

    alternatives.forEach(a => {
      theoreticalRatings[a.id] = {};
      realRatings[a.id] = {};
      gapMatrix[a.id] = {};
    });

    for (let j = 0; j < n; j++) {
      const col = normMatrix.map(row => row[j]);
      const crit = criteria[j];

      const idealFn = crit.type === "beneficial"
        ? {
            l: Math.max(...col.map(fn => Number(fn.l) || 0)),
            m: Math.max(...col.map(fn => Number(fn.m) || 0)),
            u: Math.max(...col.map(fn => Number(fn.u) || 0))
          }
        : {
            l: Math.min(...col.map(fn => Number(fn.l) || 0)),
            m: Math.min(...col.map(fn => Number(fn.m) || 0)),
            u: Math.min(...col.map(fn => Number(fn.u) || 0))
          };

      const theoreticalRating = {
        l: idealFn.l * (Number(crit.weight) || 0),
        m: idealFn.m * (Number(crit.weight) || 0),
        u: idealFn.u * (Number(crit.weight) || 0)
      };

      alternatives.forEach(a => {
        theoreticalRatings[a.id][crit.id] = theoreticalRating;
      });
    }

    const totalGaps: Record<string, number> = {};
    const scores: Record<string, number> = {};

    for (let i = 0; i < m; i++) {
      const altId = alternatives[i].id;
      let sumGap = 0;

      for (let j = 0; j < n; j++) {
        const crit = criteria[j];
        const fn = normMatrix[i][j];

        const realFn = {
          l: fn.l * (Number(crit.weight) || 0),
          m: fn.m * (Number(crit.weight) || 0),
          u: fn.u * (Number(crit.weight) || 0)
        };
        realRatings[altId][crit.id] = realFn;

        const theoreticalFn = theoreticalRatings[altId][crit.id];

        const gapFn = {
          l: Math.max(0, theoreticalFn.l - realFn.u),
          m: Math.max(0, theoreticalFn.m - realFn.m),
          u: Math.max(0, theoreticalFn.u - realFn.l)
        };
        gapMatrix[altId][crit.id] = gapFn;

        sumGap += (gapFn.l + gapFn.m + gapFn.u) / 3;
      }

      totalGaps[altId] = sumGap;
      scores[altId] = sumGap; 
    }

    return {
      scores,
      fuzzyNormalizedMatrix,
      theoreticalRatings,
      realRatings,
      gapMatrix,
      totalGaps
    };
  } catch (err) {
    console.error("CRASH IN FUZZY MAIRCA:", err);
    throw err;
  }
}
