import type { Alternative, Criterion } from "./types"
import { calculateMERECWeights } from "../../../dummy/merec"

export interface MERECResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    performanceScores: Record<string, number>
    removalScores: Record<string, Record<string, number>>
    removalEffects: Record<string, number>
}

/**
 * MEREC Method API Wrapper
 * 
 * This function wraps the MEREC weight calculation method
 * and returns the calculated weights for criteria.
 */
export function calculateMEREC(
    alternatives: Alternative[],
    criteria: Criterion[]
): MERECResult {
    return calculateMERECWeights(alternatives, criteria)
}
