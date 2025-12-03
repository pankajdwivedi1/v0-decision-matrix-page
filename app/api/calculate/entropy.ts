import type { Alternative, Criterion } from "./types"
import { calculateEntropyWeights } from "../../../dummy/entropy"

export interface EntropyResult {
  weights: Record<string, number>
  normalizedMatrix: Record<string, Record<string, number>>
  entropyValues: Record<string, number>
  diversityValues: Record<string, number>
}

/**
 * Entropy Method API Wrapper
 * 
 * This function wraps the entropy weight calculation method
 * and returns the calculated weights for criteria.
 */
export function calculateEntropy(
  alternatives: Alternative[],
  criteria: Criterion[]
): EntropyResult {
  return calculateEntropyWeights(alternatives, criteria)
}

