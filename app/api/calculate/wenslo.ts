import type { Alternative, Criterion } from "./types"
import { calculateWensloWeights, WensloResult } from "../../../dummy/wenslo"

export type { WensloResult }

/**
 * WENSLO Method API Wrapper
 * 
 * This function wraps the WENSLO weight calculation method
 * and returns the calculated weights for criteria.
 */
export function calculateWenslo(
    alternatives: Alternative[],
    criteria: Criterion[]
): WensloResult {
    return calculateWensloWeights(alternatives, criteria)
}
