import type { Alternative, Criterion } from "./types"

export function calculateEDAS(alternatives: Alternative[], criteria: Criterion[]): Record<string, number> {
  const n = criteria.length
  const AV = criteria.map(c => alternatives.reduce((s, a) => s + (a.scores[c.id] || 0), 0) / alternatives.length)
  const PDA: number[][] = [], NDA: number[][] = []

  alternatives.forEach(a => {
    const p: number[] = [], nArr: number[] = []
    criteria.forEach((c, j) => {
      const x = a.scores[c.id] || 0
      const diff = (x - AV[j]) / (AV[j] || 1)
      if (c.type === "beneficial") {
        p.push(Math.max(0, diff)); nArr.push(Math.max(0, -diff))
      } else {
        p.push(Math.max(0, -diff)); nArr.push(Math.max(0, diff))
      }
    })
    PDA.push(p); NDA.push(nArr)
  })

  const scores: Record<string, number> = {}
  for (let i = 0; i < alternatives.length; i++) {
    const SP = criteria.reduce((s, c, j) => s + PDA[i][j] * c.weight, 0)
    const SN = criteria.reduce((s, c, j) => s + NDA[i][j] * c.weight, 0)
    const NSP = SP / Math.max(...PDA.flat()) || 0
    const NSN = SN / Math.max(...NDA.flat()) || 0
    scores[alternatives[i].id] = 0.5 * (NSP + (1 - NSN))
  }
  return scores
}
