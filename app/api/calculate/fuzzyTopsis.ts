import type { Alternative, Criterion } from "./types"

/**
 * Fuzzy TOPSIS (Technique for Order Preference by Similarity to Ideal Solution with Fuzzy Logic)
 * 
 * This implementation uses Triangular Fuzzy Numbers (TFNs) [l, m, u]
 */

export interface FuzzyNumber {
  l: number;
  m: number;
  u: number;
}

export interface FuzzyTOPSISResult {
  scores: Record<string, number>
  fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>>
  fuzzyWeightedMatrix: Record<string, Record<string, FuzzyNumber>>
  fpis: Record<string, FuzzyNumber> // Fuzzy Positive Ideal Solution
  fnis: Record<string, FuzzyNumber> // Fuzzy Negative Ideal Solution
  distances: Record<string, { positive: number; negative: number }>
}

/**
 * Helper to convert crisp number to TFN if needed
 * Here we use a small spread (e.g., 5%) for demonstration if crisp data is provided
 */
const crispToFuzzy = (val: number): FuzzyNumber => ({
  l: val * 0.9,
  m: val,
  u: val * 1.1
});

export function calculateFuzzyTOPSIS(
  alternatives: Alternative[],
  criteria: Criterion[]
): FuzzyTOPSISResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      fuzzyNormalizedMatrix: {},
      fuzzyWeightedMatrix: {},
      fpis: {},
      fnis: {},
      distances: {}
    }
  }

  // Step 1: Initialize Fuzzy Matrix
  const fuzzyMatrix: FuzzyNumber[][] = alternatives.map((alt) =>
    criteria.map((crit) => {
      const score = alt.scores[crit.id];
      // If already a fuzzy number object, use it directly
      if (score && typeof score === 'object' && 'l' in score && 'm' in score && 'u' in score) {
        return score as unknown as FuzzyNumber;
      }
      const val = Number(score) || 0;
      return crispToFuzzy(val);
    })
  )

  // Step 2: Normalization
  const normalizedMatrix: FuzzyNumber[][] = Array.from({ length: m }, () => Array(n).fill(null));
  const fuzzyNormalizedMatrix: Record<string, Record<string, FuzzyNumber>> = {};
  alternatives.forEach(a => fuzzyNormalizedMatrix[a.id] = {});

  for (let j = 0; j < n; j++) {
    const crit = criteria[j];
    if (crit.type === "beneficial") {
      const maxU = Math.max(...fuzzyMatrix.map(row => row[j].u)) || 1;
      for (let i = 0; i < m; i++) {
        const fn = {
          l: fuzzyMatrix[i][j].l / maxU,
          m: fuzzyMatrix[i][j].m / maxU,
          u: fuzzyMatrix[i][j].u / maxU
        };
        normalizedMatrix[i][j] = fn;
        fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;
      }
    } else {
      const minL = Math.min(...fuzzyMatrix.map(row => row[j].l)) || 1;
      for (let i = 0; i < m; i++) {
        const fn = {
          l: minL / (fuzzyMatrix[i][j].u || 1),
          m: minL / (fuzzyMatrix[i][j].m || 1),
          u: minL / (fuzzyMatrix[i][j].l || 1)
        };
        normalizedMatrix[i][j] = fn;
        fuzzyNormalizedMatrix[alternatives[i].id][crit.id] = fn;
      }
    }
  }

  // Step 3: Apply Weights (Fuzzy Weights)
  // For now, weights are crisp, so we treat them as TFN [w, w, w]
  const weightedMatrix: Record<string, Record<string, FuzzyNumber>> = {};
  alternatives.forEach(a => weightedMatrix[a.id] = {});
  
  const fuzzyWeightedMatrixData = normalizedMatrix.map((row) =>
    row.map((fn, j) => ({
      l: fn.l * criteria[j].weight,
      m: fn.m * criteria[j].weight,
      u: fn.u * criteria[j].weight
    }))
  );

  fuzzyWeightedMatrixData.forEach((row, i) => {
    row.forEach((fn, j) => {
      weightedMatrix[alternatives[i].id][criteria[j].id] = fn;
    });
  });

  // Step 4: Determine FPIS and FNIS
  // FPIS (A*) = [max(l), max(m), max(u)] for beneficial
  // FNIS (A-) = [min(l), min(m), min(u)] for beneficial
  const fpis: Record<string, FuzzyNumber> = {};
  const fnis: Record<string, FuzzyNumber> = {};

  for (let j = 0; j < n; j++) {
    const col = fuzzyWeightedMatrixData.map(row => row[j]);
    const crit = criteria[j];
    
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
  }

  // Step 5: Calculate Distances (Vertex Method)
  // d(A, B) = sqrt(1/3 * [(l1-l2)^2 + (m1-m2)^2 + (u1-u2)^2])
  const distances: Record<string, { positive: number; negative: number }> = {};
  const scores: Record<string, number> = {};

  for (let i = 0; i < m; i++) {
    let dPlus = 0;
    let dMinus = 0;
    
    for (let j = 0; j < n; j++) {
      const crit = criteria[j];
      const fn = fuzzyWeightedMatrixData[i][j];
      const best = fpis[crit.id];
      const worst = fnis[crit.id];
      
      dPlus += (1/3) * (
        Math.pow(fn.l - best.l, 2) + 
        Math.pow(fn.m - best.m, 2) + 
        Math.pow(fn.u - best.u, 2)
      );
      
      dMinus += (1/3) * (
        Math.pow(fn.l - worst.l, 2) + 
        Math.pow(fn.m - worst.m, 2) + 
        Math.pow(fn.u - worst.u, 2)
      );
    }
    
    const dp = Math.sqrt(dPlus);
    const dm = Math.sqrt(dMinus);
    
    distances[alternatives[i].id] = {
      positive: dp,
      negative: dm
    };
    
    // Step 6: Closeness Coefficient CC = dm / (dp + dm)
    scores[alternatives[i].id] = (dp + dm) > 0 ? dm / (dp + dm) : 0;
  }

  return {
    scores,
    fuzzyNormalizedMatrix,
    fuzzyWeightedMatrix: weightedMatrix,
    fpis,
    fnis,
    distances
  }
}
