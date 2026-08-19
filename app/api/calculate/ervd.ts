import type { Alternative, Criterion } from "./types"

export interface ERVDResult {
  scores: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  referencePoint: Record<string, number>
  deviationMatrix: Record<string, Record<string, number>>
  prospectMatrix: Record<string, Record<string, number>>
}

/**
 * ERVD (Elimination and Reference Value Design / Prospect Theory) Method
 * Reference: Behavioral MCDM with prospect theory.
 */
export function calculateERVD(
  alternatives: Alternative[],
  criteria: Criterion[],
  alpha: number = 0.88,
  lambda: number = 2.25
): ERVDResult {
  const m = alternatives.length
  const n = criteria.length

  if (m === 0 || n === 0) {
    return {
      scores: {},
      normalizedMatrix: {},
      referencePoint: {},
      deviationMatrix: {},
      prospectMatrix: {}
    }
  }

  // 1. Min and Max
  const maxVals: Record<string, number> = {}
  const minVals: Record<string, number> = {}
  criteria.forEach((crit) => {
    const vals = alternatives.map((alt) => Number(alt.scores[crit.id]) || 0)
    maxVals[crit.id] = Math.max(...vals) || 1
    minVals[crit.id] = Math.min(...vals) || 0.0001
  })

  // 2. Normalization
  const normalizedMatrix: Record<string, Record<string, number>> = {}
  alternatives.forEach((alt) => {
    normalizedMatrix[alt.id] = {}
    criteria.forEach((crit) => {
      const val = Number(alt.scores[crit.id]) || 0
      if (crit.type === "beneficial") {
        normalizedMatrix[alt.id][crit.id] = val / maxVals[crit.id]
      } else {
        normalizedMatrix[alt.id][crit.id] = val !== 0 ? minVals[crit.id] / val : 0
      }
    })
  })

  // 3. Reference Point Calculation (Mean reference value)
  const referencePoint: Record<string, number> = {}
  criteria.forEach((crit) => {
    const sum = alternatives.reduce((acc, alt) => acc + (normalizedMatrix[alt.id][crit.id] || 0), 0)
    referencePoint[crit.id] = sum / m
  })

  // 4. Deviations & Prospect Value Matrix
  const deviationMatrix: Record<string, Record<string, number>> = {}
  const prospectMatrix: Record<string, Record<string, number>> = {}
  const scores: Record<string, number> = {}

  alternatives.forEach((alt) => {
    deviationMatrix[alt.id] = {}
    prospectMatrix[alt.id] = {}
    let totalProspect = 0

    criteria.forEach((crit) => {
      const r = normalizedMatrix[alt.id][crit.id] || 0
      const ref = referencePoint[crit.id] || 0
      const delta = r - ref
      deviationMatrix[alt.id][crit.id] = delta

      let v = 0
      if (delta >= 0) {
        v = Math.pow(delta, alpha)
      } else {
        v = -lambda * Math.pow(Math.abs(delta), alpha)
      }

      prospectMatrix[alt.id][crit.id] = v
      const w = crit.weight || 1 / n
      totalProspect += w * v
    })

    scores[alt.id] = totalProspect
  })

  return {
    scores,
    normalizedMatrix,
    referencePoint,
    deviationMatrix,
    prospectMatrix
  }
}
