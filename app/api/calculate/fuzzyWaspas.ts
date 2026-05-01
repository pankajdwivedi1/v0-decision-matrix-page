import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyWASPASResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  wsmScores: Record<string, FuzzyNumber>
  wpmScores: Record<string, FuzzyNumber>
  combinedScores: Record<string, FuzzyNumber>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyWASPAS(
  alternatives: Alternative[],
  criteria: Criterion[],
  lambda: number = 0.5
): FuzzyWASPASResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      fuzzyNormalizedMatrix: {},
      fuzzyWeightedMatrix: {},
      wsmScores: {},
      wpmScores: {},
      combinedScores: {}
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

    if (crit.type === "beneficial") {
      const maxU = Math.max(...col.map(fn => fn.u)) || 1;
      for (let i = 0; i < m; i++) {
        const fn = {
          l: fuzzyMatrix[i][j].l / maxU,
          m: fuzzyMatrix[i][j].m / maxU,
          u: fuzzyMatrix[i][j].u / maxU
        };
        normMatrix[i][j] = fn;
        fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;
      }
    } else {
      const minL = Math.min(...col.map(fn => fn.l)) || 1;
      for (let i = 0; i < m; i++) {
        const fn = {
          l: minL / (fuzzyMatrix[i][j].u || 1),
          m: minL / (fuzzyMatrix[i][j].m || 1),
          u: minL / (fuzzyMatrix[i][j].l || 1)
        };
        normMatrix[i][j] = fn;
        fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;
      }
    }
  }

  const fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>> = {};
  const wsmScores: Record<string, FuzzyNumber> = {};
  const wpmScores: Record<string, FuzzyNumber> = {};
  const combinedScores: Record<string, FuzzyNumber> = {};
  const scores: Record<string, number> = {};

  alternatives.forEach(a => fuzzyWeightedMatrix[a.id] = {});

  for (let i = 0; i < m; i++) {
    let wsm_l = 0, wsm_m = 0, wsm_u = 0;
    let wpm_l = 1, wpm_m = 1, wpm_u = 1;

    for (let j = 0; j < n; j++) {
      const crit = criteria[j];
      const fn = normMatrix[i][j];

      const w_l = fn.l * crit.weight;
      const w_m = fn.m * crit.weight;
      const w_u = fn.u * crit.weight;

      fuzzyWeightedMatrix[alternatives[i].id][crit.id] = { l: w_l, m: w_m, u: w_u };

      wsm_l += w_l;
      wsm_m += w_m;
      wsm_u += w_u;

      wpm_l *= Math.pow(fn.l > 0 ? fn.l : 0.0001, crit.weight);
      wpm_m *= Math.pow(fn.m > 0 ? fn.m : 0.0001, crit.weight);
      wpm_u *= Math.pow(fn.u > 0 ? fn.u : 0.0001, crit.weight);
    }

    wsmScores[alternatives[i].id] = { l: wsm_l, m: wsm_m, u: wsm_u };
    wpmScores[alternatives[i].id] = { l: wpm_l, m: wpm_m, u: wpm_u };

    const combined_l = lambda * wsm_l + (1 - lambda) * wpm_l;
    const combined_m = lambda * wsm_m + (1 - lambda) * wpm_m;
    const combined_u = lambda * wsm_u + (1 - lambda) * wpm_u;

    combinedScores[alternatives[i].id] = { l: combined_l, m: combined_m, u: combined_u };

    scores[alternatives[i].id] = (combined_l + combined_m + combined_u) / 3;
  }

  return {
    scores,
    fuzzyNormalizedMatrix,
    fuzzyWeightedMatrix,
    wsmScores,
    wpmScores,
    combinedScores
  };
}
