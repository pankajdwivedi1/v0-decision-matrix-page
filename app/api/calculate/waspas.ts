import type { Alternative, Criterion } from "./types"

export function calculateWASPAS(alternatives: Alternative[], criteria: Criterion[]): Record<string, number> {
  const scores: Record<string, number> = {}
  for (const a of alternatives) {
    let wsm = 0, wpm = 1
    for (const c of criteria) {
      const v = a.scores[c.id] || 0.00001
      const adj = c.type === "beneficial" ? v : 1 / v
      wsm += adj * c.weight
      wpm *= Math.pow(adj, c.weight)
    }
    scores[a.id] = 0.5 * (wsm + wpm)
  }
  return scores
}
