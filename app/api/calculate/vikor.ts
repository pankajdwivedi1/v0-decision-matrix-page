import type { Alternative, Criterion } from "./types"

export function calculateVIKOR(alternatives: Alternative[], criteria: Criterion[]): Record<string, number> {
  const fBest: Record<string, number> = {}, fWorst: Record<string, number> = {}
  criteria.forEach(c => {
    const vals = alternatives.map(a => a.scores[c.id] || 0)
    fBest[c.id] = c.type === "beneficial" ? Math.max(...vals) : Math.min(...vals)
    fWorst[c.id] = c.type === "beneficial" ? Math.min(...vals) : Math.max(...vals)
  })
  const S: Record<string, number> = {}, R: Record<string, number> = {}
  alternatives.forEach(a => {
    let Si = 0, Ri = -Infinity
    criteria.forEach(c => {
      const val = a.scores[c.id] || 0
      const term = (fBest[c.id] - val) / (fBest[c.id] - fWorst[c.id] || 1)
      const weighted = c.weight * term
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
  return Q
}
