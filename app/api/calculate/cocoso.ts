import type { Alternative, Criterion } from "./types";

export function calculateCOCOSO(alternatives: Alternative[], criteria: Criterion[]): Record<string, number> {
  const m = alternatives.length;
  const n = criteria.length;

  // Step 1: Build decision matrix X_ij
  const X = alternatives.map(a => criteria.map(c => a.scores[c.id] || 0));

  // Step 2: Normalization (compromise normalization)
  const R: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
  criteria.forEach((crit, j) => {
    const column = X.map(row => row[j]);
    const max = Math.max(...column);
    const min = Math.min(...column);

    for (let i = 0; i < m; i++) {
      if (crit.type === "beneficial") {
        R[i][j] = (X[i][j] - min) / (max - min || 1);
      } else {
        R[i][j] = (max - X[i][j]) / (max - min || 1);
      }
    }
  });

  // Step 3: Compute weighted comparability sequences (Si and Pi)
  const Si: number[] = [];
  const Pi: number[] = [];
  for (let i = 0; i < m; i++) {
    let sum = 0;
    let prod = 1;
    for (let j = 0; j < n; j++) {
      const w = criteria[j].weight;
      sum += w * R[i][j];
      prod *= Math.pow(R[i][j], w);
    }
    Si.push(sum);
    Pi.push(prod);
  }

  // Step 4: Compute relative appraisal scores kia, kib, kic
  const sumSP = Si.map((v, i) => v + Pi[i]).reduce((a, b) => a + b, 0);
  const minS = Math.min(...Si), minP = Math.min(...Pi);
  const maxS = Math.max(...Si), maxP = Math.max(...Pi);
  const λ = 0.5;

  const kia: number[] = [];
  const kib: number[] = [];
  const kic: number[] = [];

  for (let i = 0; i < m; i++) {
    // Eq. (6)
    kia.push((Pi[i] + Si[i]) / (sumSP || 1));

    // Eq. (7)
    kib.push((Si[i] / (minS || 1) + Pi[i] / (minP || 1)));

    // Eq. (8)
    kic.push(
      ((λ * Si[i] + (1 - λ) * Pi[i]) /
        ((λ * maxS + (1 - λ) * maxP) || 1))
    );
  }

  // Step 5: Final CoCoSo score (Eq. 9)
  const Ki: number[] = kia.map((_, i) =>
    Math.cbrt(kia[i] * kib[i] * kic[i]) + (kia[i] + kib[i] + kic[i]) / 3
  );

  // Map scores to alternative IDs
  const results: Record<string, number> = {};
  alternatives.forEach((alt, i) => {
    results[alt.id] = Ki[i];
  });

  return results;
}
