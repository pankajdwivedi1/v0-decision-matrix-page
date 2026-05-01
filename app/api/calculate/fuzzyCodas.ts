import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyCODASResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  negativeIdealSolution: Record<string, FuzzyNumber>
  euclideanDistances: Record<string, number>
  taxicabDistances: Record<string, number>
  relativeAssessmentScores: Record<string, number>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyCODAS(
  alternatives: Alternative[],
  criteria: Criterion[],
  tau: number = 0.02
): FuzzyCODASResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      fuzzyNormalizedMatrix: {},
      fuzzyWeightedMatrix: {},
      negativeIdealSolution: {},
      euclideanDistances: {},
      taxicabDistances: {},
      relativeAssessmentScores: {}
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
    const crit = criteria[j];

    const maxU = Math.max(...col.map(fn => fn.u));
    const minL = Math.min(...col.map(fn => fn.l));

    for (let i = 0; i < m; i++) {
      let fn: FuzzyNumber;
      if (crit.type === "beneficial") {
        fn = {
          l: fuzzyMatrix[i][j].l / (maxU || 1),
          m: fuzzyMatrix[i][j].m / (maxU || 1),
          u: fuzzyMatrix[i][j].u / (maxU || 1)
        };
      } else {
        fn = {
          l: (minL || 1) / (fuzzyMatrix[i][j].u || 1),
          m: (minL || 1) / (fuzzyMatrix[i][j].m || 1),
          u: (minL || 1) / (fuzzyMatrix[i][j].l || 1)
        };
      }
      normMatrix[i][j] = fn;
      fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;

      const w_l = fn.l * crit.weight;
      const w_m = fn.m * crit.weight;
      const w_u = fn.u * crit.weight;
      fuzzyWeightedMatrix[alternatives[i].id][crit.id] = { l: w_l, m: w_m, u: w_u };
    }
  }

  const negativeIdealSolution: Record<string, FuzzyNumber> = {};
  for (let j = 0; j < n; j++) {
    const col = normMatrix.map(row => row[j]);
    const crit = criteria[j];

    if (crit.type === "beneficial") {
      negativeIdealSolution[crit.id] = {
        l: Math.min(...col.map(fn => fn.l)),
        m: Math.min(...col.map(fn => fn.m)),
        u: Math.min(...col.map(fn => fn.u))
      };
    } else {
      negativeIdealSolution[crit.id] = {
        l: Math.max(...col.map(fn => fn.l)),
        m: Math.max(...col.map(fn => fn.m)),
        u: Math.max(...col.map(fn => fn.u))
      };
    }
  }

  const vertexDistance = (a: FuzzyNumber, b: FuzzyNumber): number => {
    return Math.sqrt((1 / 3) * (
      Math.pow(a.l - b.l, 2) +
      Math.pow(a.m - b.m, 2) +
      Math.pow(a.u - b.u, 2)
    ));
  };

  const euclideanDistances: Record<string, number> = {};
  const taxicabDistances: Record<string, number> = {};

  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id;
    let sumE = 0;
    let sumT = 0;

    for (let j = 0; j < n; j++) {
      const crit = criteria[j];
      const fn = {
        l: normMatrix[i][j].l * crit.weight,
        m: normMatrix[i][j].m * crit.weight,
        u: normMatrix[i][j].u * crit.weight
      };
      const nis = negativeIdealSolution[crit.id];
      const dist = vertexDistance(fn, nis);

      sumE += dist * dist;
      sumT += dist;
    }

    euclideanDistances[altId] = Math.sqrt(sumE);
    taxicabDistances[altId] = sumT;
  }

  const relativeAssessmentScores: Record<string, number> = {};
  const scores: Record<string, number> = {};

  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id;
    let ra = 0;

    for (let k = 0; k < m; k++) {
      const otherId = alternatives[k].id;
      const diffE = euclideanDistances[altId] - euclideanDistances[otherId];
      const diffT = taxicabDistances[altId] - taxicabDistances[otherId];

      let psi = 0;
      if (Math.abs(diffE) >= tau) {
        psi = 1;
      }

      ra += diffE + (psi * diffT);
    }

    relativeAssessmentScores[altId] = ra;
    scores[altId] = ra;
  }

  return {
    scores,
    fuzzyNormalizedMatrix,
    fuzzyWeightedMatrix,
    negativeIdealSolution,
    euclideanDistances,
    taxicabDistances,
    relativeAssessmentScores
  };
}
