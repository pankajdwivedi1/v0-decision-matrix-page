import type { Alternative, Criterion } from "./types"
import { calculateSWARAWeights } from "../../../dummy/swara"

export interface SWARAResult {
    weights: Record<string, number>
    stepFactors: Record<string, number>
    preliminaryWeights: Record<string, number>
    coefficients: Record<string, number>
}

/**
 * SWARA Method API Wrapper
 * 
 * This function wraps the SWARA weight calculation method
 * and returns the calculated weights for criteria.
 */
export function calculateSWARA(
    criteria: Criterion[],
    coefficients: Record<string, number>
): SWARAResult {
    return calculateSWARAWeights(criteria, coefficients)
}
