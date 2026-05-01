import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyTODIMResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  relativeWeights: Record<string, number>
  dominanceMatrix: Record<string, Record<string, number>>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyTODIM(
  alternatives: Alternative[],
  criteria: Criterion[],
  alpha: number = 0.88,
  beta: number = 0.88,
  lambda: number = 2.25
): FuzzyTODIMResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      fuzzyNormalizedMatrix: {},
      relativeWeights: {},
      dominanceMatrix: {}
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

    const minL = Math.min(...col.map(fn => fn.l));
    const maxU = Math.max(...col.map(fn => fn.u));
    const range = (maxU - minL) || 1;

    for (let i = 0; i < m; i++) {
      let fn: FuzzyNumber;
      if (crit.type === "beneficial") {
        fn = {
          l: (fuzzyMatrix[i][j].l - minL) / range,
          m: (fuzzyMatrix[i][j].m - minL) / range,
          u: (fuzzyMatrix[i][j].u - minL) / range
        };
      } else {
        fn = {
          l: (maxU - fuzzyMatrix[i][j].u) / range,
          m: (maxU - fuzzyMatrix[i][j].m) / range,
          u: (maxU - fuzzyMatrix[i][j].l) / range
        };
      }
      normMatrix[i][j] = fn;
      fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;
    }
  }

  const weights = criteria.map((crit) => crit.weight);
  const maxWeight = Math.max(...weights) || 1;
  const relativeWeights: Record<string, number> = {};
  criteria.forEach((crit) => {
    relativeWeights[crit.id] = crit.weight / maxWeight;
  });

  const dominanceMatrix: Record<string, Record<string, number>> = {};
  alternatives.forEach((alt) => {
    dominanceMatrix[alt.id] = {};
    alternatives.forEach((alt2) => {
      dominanceMatrix[alt.id][alt2.id] = 0;
    });
  });

  const defuzzify = (fn: FuzzyNumber) => (fn.l + fn.m + fn.u) / 3;

  for (let i = 0; i < m; i++) {
    for (let k = 0; k < m; k++) {
      if (i === k) continue;
      let overallDominance = 0;

      for (let j = 0; j < n; j++) {
        const crit = criteria[j];
        const w_jr = relativeWeights[crit.id];
        const sumWeights = Object.values(relativeWeights).reduce((a, b) => a + b, 0);

        const valI = defuzzify(normMatrix[i][j]);
        const valK = defuzzify(normMatrix[k][j]);

        let phi = 0;
        if (valI >= valK) {
          const diff = valI - valK;
          phi = Math.sqrt((w_jr * diff) / sumWeights);
        } else {
          const diff = valK - valI;
          phi = (-1 / lambda) * Math.sqrt((sumWeights * diff) / w_jr);
        }
        overallDominance += isNaN(phi) ? 0 : phi;
      }
      dominanceMatrix[alternatives[i].id][alternatives[k].id] = overallDominance;
    }
  }

  const globalValues: Record<string, number> = {};
  alternatives.forEach((alt) => {
    let sum = 0;
    alternatives.forEach((alt2) => {
      sum += dominanceMatrix[alt.id][alt2.id];
    });
    globalValues[alt.id] = sum;
  });

  const globalVals = Object.values(globalValues);
  const maxGlobal = Math.max(...globalVals);
  const minGlobal = Math.min(...globalVals);
  const rangeGlobal = (maxGlobal - minGlobal) || 1;

  const scores: Record<string, number> = {};
  alternatives.forEach((alt) => {
    scores[alt.id] = (globalValues[alt.id] - minGlobal) / rangeGlobal;
  });

  return {
    scores,
    fuzzyNormalizedMatrix,
    relativeWeights,
    dominanceMatrix
  };
}
