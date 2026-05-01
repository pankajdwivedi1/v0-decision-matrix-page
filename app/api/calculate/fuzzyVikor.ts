import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyVIKORResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  fpis: Record<string, FuzzyNumber>
  fnis: Record<string, FuzzyNumber>
  sValues: Record<string, number>
  rValues: Record<string, number>
  qValues: Record<string, number>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyVIKOR(
  alternatives: Alternative[],
  criteria: Criterion[],
  v: number = 0.5
): FuzzyVIKORResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      fuzzyNormalizedMatrix: {},
      fuzzyWeightedMatrix: {},
      fpis: {},
      fnis: {},
      sValues: {},
      rValues: {},
      qValues: {}
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

  const fpis: Record<string, FuzzyNumber> = {};
  const fnis: Record<string, FuzzyNumber> = {};

  for (let j = 0; j < n; j++) {
    const col = fuzzyMatrix.map(row => row[j]);
    const crit = criteria[j];

    if (crit.type === "beneficial") {
      fpis[crit.id] = {
        l: Math.max(...col.map(fn => fn.l)),
        m: Math.max(...col.map(fn => fn.m)),
        u: Math.max(...col.map(fn => fn.u))
      };
      fnis[crit.id] = {
        l: Math.min(...col.map(fn => fn.l)),
        m: Math.min(...col.map(fn => fn.m)),
        u: Math.min(...col.map(fn => fn.u))
      };
    } else {
      fpis[crit.id] = {
        l: Math.min(...col.map(fn => fn.l)),
        m: Math.min(...col.map(fn => fn.m)),
        u: Math.min(...col.map(fn => fn.u))
      };
      fnis[crit.id] = {
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

  const sValues: Record<string, number> = {};
  const rValues: Record<string, number> = {};
  const fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>> = {};
  const fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>> = {};

  alternatives.forEach(a => {
    fuzzyNormalizedMatrix[a.id] = {};
    fuzzyWeightedMatrix[a.id] = {};
  });

  for (let i = 0; i < m; i++) {
    let Si = 0;
    let Ri = 0;

    for (let j = 0; j < n; j++) {
      const crit = criteria[j];
      const fn = fuzzyMatrix[i][j];
      const best = fpis[crit.id];
      const worst = fnis[crit.id];

      const distPlus = vertexDistance(best, fn);
      const distRange = vertexDistance(best, worst) || 1;
      const ratio = distPlus / distRange;

      const normFn = { l: ratio, m: ratio, u: ratio };
      fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = normFn;

      const weightedRatio = crit.weight * ratio;
      const weightFn = { l: weightedRatio, m: weightedRatio, u: weightedRatio };
      fuzzyWeightedMatrix[alternatives[i].id][crit.id] = weightFn;

      Si += weightedRatio;
      Ri = Math.max(Ri, weightedRatio);
    }

    sValues[alternatives[i].id] = Si;
    rValues[alternatives[i].id] = Ri;
  }

  const sVals = Object.values(sValues);
  const rVals = Object.values(rValues);

  const Smin = Math.min(...sVals);
  const Smax = Math.max(...sVals);
  const Rmin = Math.min(...rVals);
  const Rmax = Math.max(...rVals);

  const qValues: Record<string, number> = {};
  const scores: Record<string, number> = {};

  for (let i = 0; i < m; i++) {
    const altId = alternatives[i].id;
    const Si = sValues[altId];
    const Ri = rValues[altId];

    const Sterm = (Smax - Smin) > 0 ? (Si - Smin) / (Smax - Smin) : 0;
    const Rterm = (Rmax - Rmin) > 0 ? (Ri - Rmin) / (Rmax - Rmin) : 0;

    const Qi = v * Sterm + (1 - v) * Rterm;

    qValues[altId] = Qi;
    scores[altId] = Qi; 
  }

  return {
    scores,
    fuzzyNormalizedMatrix,
    fuzzyWeightedMatrix,
    fpis,
    fnis,
    sValues,
    rValues,
    qValues
  };
}
