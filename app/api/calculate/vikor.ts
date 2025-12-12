import type { Alternative, Criterion } from "./types"

interface VIKORResult {
  scores: Record<string, number>
  fBest: Record<string, number>
  fWorst: Record<string, number>
  sValues: Record<string, number>
  rValues: Record<string, number>
  qValues: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
}

export function calculateVIKOR(alternatives: Alternative[], criteria: Criterion[]): VIKORResult {
  const fBest: Record<string, number> = {}, fWorst: Record<string, number> = {}
  criteria.forEach(c => {
    const vals = alternatives.map(a => a.scores[c.id] || 0)
    fBest[c.id] = c.type === "beneficial" ? Math.max(...vals) : Math.min(...vals)
    fWorst[c.id] = c.type === "beneficial" ? Math.min(...vals) : Math.max(...vals)
  })

  const S: Record<string, number> = {}, R: Record<string, number> = {}
  const normalizedMatrix: Record<string, Record<string, number>> = {}

  alternatives.forEach(a => {
    let Si = 0, Ri = -Infinity
    normalizedMatrix[a.id] = {}
    criteria.forEach(c => {
      const val = a.scores[c.id] || 0
      // Linear normalization difference ratio
      let term: number
      if (c.type === "beneficial") {
        term = (fBest[c.id] - val) / (fBest[c.id] - fWorst[c.id] || 1)
      } else {
        term = (val - fBest[c.id]) / (fWorst[c.id] - fBest[c.id] || 1)
      }
      // Usually standard VIKOR distance: |f* - f_ij| / |f* - f-|
      // Beneficial: (max - val) / (max - min)
      // Cost: (val - min) / (max - min) --> (fBest (min) - val) / (fBest (min) - fWorst (max)) would be negative?
      // Standard VIKOR normalization is:
      // Beneficial: (f_j^* - x_ij) / (f_j^* - f_j^-)
      // Cost: (x_ij - f_j^*) / (f_j^- - f_j^*)  <-- let's use the absolute difference formulation to be safe and positive distance
      // Distance is always positive. Best - val (if ben), Val - Best (if cost). Denom is Range.

      const range = Math.abs(fBest[c.id] - fWorst[c.id]) || 1
      const dist = Math.abs(fBest[c.id] - val) / range

      normalizedMatrix[a.id][c.id] = dist

      const weighted = c.weight * dist
      Si += weighted
      Ri = Math.max(Ri, weighted)
    })
    S[a.id] = Si; R[a.id] = Ri
  })

  const Svals = Object.values(S), Rvals = Object.values(R)
  const Smin = Math.min(...Svals), Smax = Math.max(...Svals)
  const Rmin = Math.min(...Rvals), Rmax = Math.max(...Rvals)
  const v = 0.5
  const Q: Record<string, number> = {}
  for (const a of alternatives)
    Q[a.id] = v * (S[a.id] - Smin) / (Smax - Smin || 1) + (1 - v) * (R[a.id] - Rmin) / (Rmax - Rmin || 1)

  return {
    scores: Q,
    fBest,
    fWorst,
    sValues: S,
    rValues: R,
    qValues: Q,
    normalizedMatrix
  }
}
