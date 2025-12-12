import type { Alternative, Criterion } from "./types"

interface EDASResult {
  scores: Record<string, number>
  avVector: Record<string, number>
  pdaMatrix: Record<string, Record<string, number>>
  ndaMatrix: Record<string, Record<string, number>>
  spValues: Record<string, number>
  snValues: Record<string, number>
  nspValues: Record<string, number>
  nsnValues: Record<string, number>
  asValues: Record<string, number>
}

export function calculateEDAS(alternatives: Alternative[], criteria: Criterion[]): EDASResult {
  const n = criteria.length

  // 1. Average Solution (AV)
  const AV: Record<string, number> = {}
  criteria.forEach(c => {
    const sum = alternatives.reduce((s, a) => s + (a.scores[c.id] || 0), 0)
    AV[c.id] = sum / alternatives.length
  })

  // 2. PDA & NDA Calculation
  const pdaMatrix: Record<string, Record<string, number>> = {}
  const ndaMatrix: Record<string, Record<string, number>> = {}

  alternatives.forEach(a => {
    pdaMatrix[a.id] = {}
    ndaMatrix[a.id] = {}

    criteria.forEach(c => {
      const x = a.scores[c.id] || 0
      const av = AV[c.id] || 0
      const diff = (x - av) / (av || 1) // Avoid div by zero?

      let pda = 0
      let nda = 0

      if (c.type === "beneficial") {
        pda = Math.max(0, diff)
        nda = Math.max(0, -diff)
      } else {
        pda = Math.max(0, -diff)
        nda = Math.max(0, diff)
      }

      pdaMatrix[a.id][c.id] = pda
      ndaMatrix[a.id][c.id] = nda
    })
  })

  // 3. Weighted Sums (SP & SN)
  const spValues: Record<string, number> = {}
  const snValues: Record<string, number> = {}

  alternatives.forEach(a => {
    let sp = 0
    let sn = 0
    criteria.forEach(c => {
      sp += pdaMatrix[a.id][c.id] * c.weight
      sn += ndaMatrix[a.id][c.id] * c.weight
    })
    spValues[a.id] = sp
    snValues[a.id] = sn
  })

  // 4. Normalization (NSP & NSN)
  const maxSP = Math.max(...Object.values(spValues)) || 1
  const maxSN = Math.max(...Object.values(snValues)) || 1

  const nspValues: Record<string, number> = {}
  const nsnValues: Record<string, number> = {}
  const scores: Record<string, number> = {}

  alternatives.forEach(a => {
    const nsp = spValues[a.id] / maxSP
    const nsn = 1 - (snValues[a.id] / maxSN) // Careful: EDAS usually NSN = 1 - (SN / maxSN) or similar?
    // Standard EDAS: 
    // NSP_i = SP_i / max(SP)
    // NSN_i = 1 - (SN_i / max(SN)) 

    nspValues[a.id] = nsp
    nsnValues[a.id] = nsn

    // 5. Appraisal Score (AS)
    // AS = 0.5 * (NSP + NSN)
    scores[a.id] = 0.5 * (nsp + nsn)
  })

  return {
    scores,
    avVector: AV,
    pdaMatrix,
    ndaMatrix,
    spValues,
    snValues,
    nspValues,
    nsnValues,
    asValues: scores
  }
}
