import type { Alternative, Criterion } from "./types"

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyEDASResult {
  scores: Record<string, number>
  fuzzyAverageSolution: Record<string, FuzzyNumber>
  fuzzyPdaMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyNdaMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzySpValues: Record<string, FuzzyNumber>
  fuzzySnValues: Record<string, FuzzyNumber>
  fuzzyNspValues: Record<string, FuzzyNumber>
  fuzzyNsnValues: Record<string, FuzzyNumber>
  fuzzyAsValues: Record<string, FuzzyNumber>
}

const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyEDAS(
  alternatives: Alternative[],
  criteria: Criterion[]
): FuzzyEDASResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      fuzzyAverageSolution: {},
      fuzzyPdaMatrix: {},
      fuzzyNdaMatrix: {},
      fuzzySpValues: {},
      fuzzySnValues: {},
      fuzzyNspValues: {},
      fuzzyNsnValues: {},
      fuzzyAsValues: {}
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

  const fuzzyAverageSolution: Record<string, FuzzyNumber> = {};
  const AV: FuzzyNumber[] = [];

  for (let j = 0; j < n; j++) {
    const col = fuzzyMatrix.map(row => row[j]);
    const crit = criteria[j];

    const av_l = col.reduce((sum, fn) => sum + fn.l, 0) / m;
    const av_m = col.reduce((sum, fn) => sum + fn.m, 0) / m;
    const av_u = col.reduce((sum, fn) => sum + fn.u, 0) / m;

    const avFn = { l: av_l, m: av_m, u: av_u };
    AV.push(avFn);
    fuzzyAverageSolution[crit.id] = avFn;
  }

  const fuzzyPdaMatrix: Record<string, Record<string, FuzzyNumber>> = {};
  const fuzzyNdaMatrix: Record<string, Record<string, FuzzyNumber>> = {};

  alternatives.forEach(a => {
    fuzzyPdaMatrix[a.id] = {};
    fuzzyNdaMatrix[a.id] = {};
  });

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const crit = criteria[j];
      const fn = fuzzyMatrix[i][j];
      const av = AV[j];

      let pda_l = 0, pda_m = 0, pda_u = 0;
      let nda_l = 0, nda_m = 0, nda_u = 0;

      if (crit.type === "beneficial") {
        const diff_l = fn.l - av.u;
        const diff_m = fn.m - av.m;
        const diff_u = fn.u - av.l;

        pda_l = Math.max(0, diff_l) / (av.u || 1);
        pda_m = Math.max(0, diff_m) / (av.m || 1);
        pda_u = Math.max(0, diff_u) / (av.l || 1);

        const ndiff_l = av.l - fn.u;
        const ndiff_m = av.m - fn.m;
        const ndiff_u = av.u - fn.l;

        nda_l = Math.max(0, ndiff_l) / (av.u || 1);
        nda_m = Math.max(0, ndiff_m) / (av.m || 1);
        nda_u = Math.max(0, ndiff_u) / (av.l || 1);
      } else {
        const diff_l = fn.l - av.u;
        const diff_m = fn.m - av.m;
        const diff_u = fn.u - av.l;

        nda_l = Math.max(0, diff_l) / (av.u || 1);
        nda_m = Math.max(0, diff_m) / (av.m || 1);
        nda_u = Math.max(0, diff_u) / (av.l || 1);

        const ndiff_l = av.l - fn.u;
        const ndiff_m = av.m - fn.m;
        const ndiff_u = av.u - fn.l;

        pda_l = Math.max(0, ndiff_l) / (av.u || 1);
        pda_m = Math.max(0, ndiff_m) / (av.m || 1);
        pda_u = Math.max(0, ndiff_u) / (av.l || 1);
      }

      fuzzyPdaMatrix[alternatives[i].id][crit.id] = { l: pda_l, m: pda_m, u: pda_u };
      fuzzyNdaMatrix[alternatives[i].id][crit.id] = { l: nda_l, m: nda_m, u: nda_u };
    }
  }

  const fuzzySpValues: Record<string, FuzzyNumber> = {};
  const fuzzySnValues: Record<string, FuzzyNumber> = {};

  const SP: FuzzyNumber[] = [];
  const SN: FuzzyNumber[] = [];

  for (let i = 0; i < m; i++) {
    let sp_l = 0, sp_m = 0, sp_u = 0;
    let sn_l = 0, sn_m = 0, sn_u = 0;

    for (let j = 0; j < n; j++) {
      const crit = criteria[j];
      const pda = fuzzyPdaMatrix[alternatives[i].id][crit.id];
      const nda = fuzzyNdaMatrix[alternatives[i].id][crit.id];

      sp_l += pda.l * crit.weight;
      sp_m += pda.m * crit.weight;
      sp_u += pda.u * crit.weight;

      sn_l += nda.l * crit.weight;
      sn_m += nda.m * crit.weight;
      sn_u += nda.u * crit.weight;
    }

    fuzzySpValues[alternatives[i].id] = { l: sp_l, m: sp_m, u: sp_u };
    fuzzySnValues[alternatives[i].id] = { l: sn_l, m: sn_m, u: sn_u };

    SP.push({ l: sp_l, m: sp_m, u: sp_u });
    SN.push({ l: sn_l, m: sn_m, u: sn_u });
  }

  const fuzzyNspValues: Record<string, FuzzyNumber> = {};
  const fuzzyNsnValues: Record<string, FuzzyNumber> = {};
  const fuzzyAsValues: Record<string, FuzzyNumber> = {};
  const scores: Record<string, number> = {};

  const maxSP_u = Math.max(...SP.map(fn => fn.u)) || 1;
  const maxSN_u = Math.max(...SN.map(fn => fn.u)) || 1;

  for (let i = 0; i < m; i++) {
    const sp = SP[i];
    const sn = SN[i];

    const nsp_l = sp.l / maxSP_u;
    const nsp_m = sp.m / maxSP_u;
    const nsp_u = sp.u / maxSP_u;

    const nsn_l = 1 - (sn.u / maxSN_u);
    const nsn_m = 1 - (sn.m / maxSN_u);
    const nsn_u = 1 - (sn.l / maxSN_u);

    fuzzyNspValues[alternatives[i].id] = { l: nsp_l, m: nsp_m, u: nsp_u };
    fuzzyNsnValues[alternatives[i].id] = { l: nsn_l, m: nsn_m, u: nsn_u };

    const as_l = 0.5 * (nsp_l + nsn_l);
    const as_m = 0.5 * (nsp_m + nsn_m);
    const as_u = 0.5 * (nsp_u + nsn_u);

    fuzzyAsValues[alternatives[i].id] = { l: as_l, m: as_m, u: as_u };

    scores[alternatives[i].id] = (as_l + as_m + as_u) / 3;
  }

  return {
    scores,
    fuzzyAverageSolution,
    fuzzyPdaMatrix,
    fuzzyNdaMatrix,
    fuzzySpValues,
    fuzzySnValues,
    fuzzyNspValues,
    fuzzyNsnValues,
    fuzzyAsValues
  };
}
