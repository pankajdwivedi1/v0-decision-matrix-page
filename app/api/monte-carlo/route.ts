import { NextRequest, NextResponse } from "next/server";
import { calculateSWEI } from "../calculate/swei";
import { calculateSWI } from "../calculate/swi";
import { calculateTOPSIS } from "../calculate/topsis";
import { calculateVIKOR } from "../calculate/vikor";
import { calculateWASPAS } from "../calculate/waspas";
import { calculateEDAS } from "../calculate/edas";
import { calculateMOORA } from "../calculate/moora";
import { calculateMULTIMOORA } from "../calculate/multimoora";
import { calculateTODIM } from "../calculate/todim";
import { calculateCODAS } from "../calculate/codas";
import { calculateMOOSRA } from "../calculate/moosra";
import { calculateMAIRCA } from "../calculate/mairca";
import { calculateMARCOS } from "../calculate/marcos";
import { calculateCOCOSO } from "../calculate/cocoso";
import { calculateCOPRAS } from "../calculate/copras";
import { calculateMABAC } from "../calculate/mabac";
import { calculateGRA } from "../calculate/gra";
import { calculateARAS } from "../calculate/aras";
import { calculateSPOTIS } from "../calculate/spotis";
import { calculateCRADIS } from "../calculate/cradis";
import { calculateWISP } from "../calculate/wisp";
import { calculateAROMAN } from "../calculate/aroman";
import { calculateDNMA } from "../calculate/dnma";
import { calculateERVD } from "../calculate/ervd";
import { calculateLBWA } from "../calculate/lbwa";

// Fuzzy methods
import { calculateFuzzySWEI } from "../calculate/fuzzySwei";
import { calculateFuzzySWI } from "../calculate/fuzzySwi";
import { calculateFuzzyTOPSIS } from "../calculate/fuzzyTopsis";
import { calculateFuzzyVIKOR } from "../calculate/fuzzyVikor";
import { calculateFuzzyWASPAS } from "../calculate/fuzzyWaspas";
import { calculateFuzzyEDAS } from "../calculate/fuzzyEdas";
import { calculateFuzzyMOORA } from "../calculate/fuzzyMoora";
import { calculateFuzzyMULTIMOORA } from "../calculate/fuzzyMultimoora";
import { calculateFuzzyTODIM } from "../calculate/fuzzyTodim";
import { calculateFuzzyCODAS } from "../calculate/fuzzyCodas";
import { calculateFuzzyMOOSRA } from "../calculate/fuzzyMoosra";
import { calculateFuzzyMAIRCA } from "../calculate/fuzzyMairca";
import { calculateFuzzyMABAC } from "../calculate/fuzzyMabac";
import { calculateFuzzyMARCOS } from "../calculate/fuzzyMarcos";
import { calculateFuzzyCOCOSO } from "../calculate/fuzzyCocoso";
import { calculateFuzzyCOPRAS } from "../calculate/fuzzyCopras";

/**
 * Monte Carlo Sensitivity Analysis Route
 * Runs N random criteria weight perturbation trials using the user's selected MCDM method.
 * Computes empirical rank stability probability and rank reversal rate for journal validation.
 */

interface Alternative {
  id: string;
  name: string;
  scores: Record<string, number>;
}

interface Criterion {
  id: string;
  name: string;
  weight: number;
  type: "beneficial" | "non-beneficial";
}

// ── Seeded Pseudo-Random Number Generator (Mulberry32) ────────
function createPRNG(seed?: number | null): () => number {
  if (seed === undefined || seed === null || isNaN(seed)) {
    return Math.random;
  }
  let s = Math.floor(Math.abs(seed)) || 1;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Normalize weights to sum = 1 ─────────────────────────────
function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return weights.map(() => 1 / weights.length);
  return weights.map((w) => w / sum);
}

// ── Perturb weights randomly within ±perturbPct% using PRNG ──
function perturbWeights(baseWeights: number[], perturbPct: number, prng: () => number): number[] {
  const perturbed = baseWeights.map((w) => {
    const variation = (prng() * 2 - 1) * perturbPct; // ±perturbPct
    return Math.max(0.001, w * (1 + variation / 100));
  });
  return normalizeWeights(perturbed);
}

// ── Execute Selected MCDM Method ──────────────────────────────
function runMethod(
  methodName: string,
  alternatives: Alternative[],
  criteria: Criterion[]
): { scores: Record<string, number>; isAscending: boolean } {
  const method = (methodName || "topsis").toLowerCase();
  const ascendingMethods = [
    "swei", "swi", "vikor", "multimoora", "mairca", "spotis", 
    "fuzzyswei", "fuzzyswi", "fuzzyvikor", "fuzzymultimoora", "fuzzymairca"
  ];
  const isAscending = ascendingMethods.includes(method);

  let scores: Record<string, number> = {};

  switch (method) {
    case "swei":
      scores = calculateSWEI(alternatives as any, criteria as any).scores;
      break;
    case "swi":
      scores = calculateSWI(alternatives as any, criteria as any).scores;
      break;
    case "fuzzyswei":
      scores = calculateFuzzySWEI(alternatives as any, criteria as any).scores;
      break;
    case "fuzzyswi":
      scores = calculateFuzzySWI(alternatives as any, criteria as any).scores;
      break;
    case "fuzzytopsis":
      scores = calculateFuzzyTOPSIS(alternatives as any, criteria as any).scores;
      break;
    case "fuzzyvikor":
      scores = calculateFuzzyVIKOR(alternatives as any, criteria as any).scores;
      break;
    case "fuzzywaspas":
      scores = calculateFuzzyWASPAS(alternatives as any, criteria as any).scores;
      break;
    case "fuzzyedas":
      scores = calculateFuzzyEDAS(alternatives as any, criteria as any).scores;
      break;
    case "fuzzymoora":
      scores = calculateFuzzyMOORA(alternatives as any, criteria as any).scores;
      break;
    case "fuzzymultimoora":
      scores = calculateFuzzyMULTIMOORA(alternatives as any, criteria as any).scores;
      break;
    case "fuzzytodim":
      scores = calculateFuzzyTODIM(alternatives as any, criteria as any).scores;
      break;
    case "fuzzycodas":
      scores = calculateFuzzyCODAS(alternatives as any, criteria as any).scores;
      break;
    case "fuzzymoosra":
      scores = calculateFuzzyMOOSRA(alternatives as any, criteria as any).scores;
      break;
    case "fuzzymairca":
      scores = calculateFuzzyMAIRCA(alternatives as any, criteria as any).scores;
      break;
    case "fuzzymabac":
      scores = calculateFuzzyMABAC(alternatives as any, criteria as any).scores;
      break;
    case "fuzzymarcos":
      scores = calculateFuzzyMARCOS(alternatives as any, criteria as any).scores;
      break;
    case "fuzzycocoso":
      scores = calculateFuzzyCOCOSO(alternatives as any, criteria as any).scores;
      break;
    case "fuzzycopras":
      scores = calculateFuzzyCOPRAS(alternatives as any, criteria as any).scores;
      break;
    case "vikor":
      scores = calculateVIKOR(alternatives as any, criteria as any).scores;
      break;
    case "waspas":
      scores = calculateWASPAS(alternatives as any, criteria as any).scores;
      break;
    case "edas":
      scores = calculateEDAS(alternatives as any, criteria as any).scores;
      break;
    case "moora":
      scores = calculateMOORA(alternatives as any, criteria as any).scores;
      break;
    case "multimoora":
      scores = calculateMULTIMOORA(alternatives as any, criteria as any).scores;
      break;
    case "todim":
      scores = calculateTODIM(alternatives as any, criteria as any).scores;
      break;
    case "codas":
      scores = calculateCODAS(alternatives as any, criteria as any).scores;
      break;
    case "moosra":
      scores = calculateMOOSRA(alternatives as any, criteria as any).scores;
      break;
    case "mairca":
      scores = calculateMAIRCA(alternatives as any, criteria as any).scores;
      break;
    case "marcos":
      scores = calculateMARCOS(alternatives as any, criteria as any).scores;
      break;
    case "cocoso":
      scores = calculateCOCOSO(alternatives as any, criteria as any).scores;
      break;
    case "copras":
      scores = calculateCOPRAS(alternatives as any, criteria as any).scores;
      break;
    case "mabac":
      scores = calculateMABAC(alternatives as any, criteria as any).scores;
      break;
    case "gra":
      scores = calculateGRA(alternatives as any, criteria as any).scores;
      break;
    case "aras":
      scores = calculateARAS(alternatives as any, criteria as any).scores;
      break;
    case "spotis":
      scores = calculateSPOTIS(alternatives as any, criteria as any).scores;
      break;
    case "cradis":
      scores = calculateCRADIS(alternatives as any, criteria as any).scores;
      break;
    case "wisp":
      scores = calculateWISP(alternatives as any, criteria as any).scores;
      break;
    case "aroman":
      scores = calculateAROMAN(alternatives as any, criteria as any).scores;
      break;
    case "dnma":
      scores = calculateDNMA(alternatives as any, criteria as any).scores;
      break;
    case "ervd":
      scores = calculateERVD(alternatives as any, criteria as any).scores;
      break;
    case "lbwa":
      scores = calculateLBWA(alternatives as any, criteria as any).scores;
      break;
    case "topsis":
    default:
      scores = calculateTOPSIS(alternatives as any, criteria as any).scores;
      break;
  }

  return { scores, isAscending };
}

// ── Rank results given scores ─────────────────────────────────
function rankFromScores(
  scores: Record<string, number>,
  alternatives: Alternative[],
  ascending = false
): Record<string, number> {
  const sorted = [...alternatives].sort((a, b) => {
    const valA = scores[a.id] !== undefined ? scores[a.id] : 0;
    const valB = scores[b.id] !== undefined ? scores[b.id] : 0;
    return ascending ? valA - valB : valB - valA;
  });

  const ranks: Record<string, number> = {};
  sorted.forEach((alt, i) => {
    ranks[alt.id] = i + 1;
  });
  return ranks;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      alternatives,
      criteria,
      method = "swei",
      trials = 1000,
      perturbPct = 10, // ±10% default
      seed = null,
      iteration = 1,
    } = body;

    if (!alternatives || !criteria || alternatives.length === 0 || criteria.length === 0) {
      return NextResponse.json({ error: "Missing alternatives or criteria" }, { status: 400 });
    }

    const prng = createPRNG(seed);
    const baseWeights = normalizeWeights(criteria.map((c: Criterion) => c.weight || 1));
    const normalizedCriteria = criteria.map((c: Criterion, j: number) => ({
      ...c,
      weight: baseWeights[j],
    }));

    // Baseline ranking for the selected method
    const { scores: baseScores, isAscending } = runMethod(method, alternatives, normalizedCriteria);
    const baseRanks = rankFromScores(baseScores, alternatives, isAscending);

    // Track rank frequencies per alternative
    const rankFrequency: Record<string, Record<number, number>> = {};
    const scoreHistory: Record<string, number[]> = {};
    alternatives.forEach((alt: Alternative) => {
      rankFrequency[alt.id] = {};
      scoreHistory[alt.id] = [];
      for (let r = 1; r <= alternatives.length; r++) {
        rankFrequency[alt.id][r] = 0;
      }
    });

    // Track criterion weight variations across trials for transparency
    const criteriaWeightSamples: number[][] = criteria.map(() => []);

    // Run Monte Carlo trials
    let successfulTrials = 0;
    for (let t = 0; t < trials; t++) {
      try {
        const perturbedWeights = perturbWeights(baseWeights, perturbPct, prng);
        perturbedWeights.forEach((pw, idx) => criteriaWeightSamples[idx].push(pw));

        const perturbedCriteria = criteria.map((c: Criterion, j: number) => ({
          ...c,
          weight: perturbedWeights[j],
        }));

        const { scores } = runMethod(method, alternatives, perturbedCriteria);
        const ranks = rankFromScores(scores, alternatives, isAscending);

        alternatives.forEach((alt: Alternative) => {
          const rank = ranks[alt.id] || 1;
          rankFrequency[alt.id][rank] = (rankFrequency[alt.id][rank] || 0) + 1;
          scoreHistory[alt.id].push(scores[alt.id] || 0);
        });

        successfulTrials++;
      } catch {
        // Skip failed trial
      }
    }

    // Calculate stability metrics per alternative
    const stabilityResults = alternatives.map((alt: Alternative) => {
      const baseRank = baseRanks[alt.id] || 1;
      const rankCounts = rankFrequency[alt.id];
      const sameRankCount = rankCounts[baseRank] || 0;
      const stabilityPct = successfulTrials > 0 ? (sameRankCount / successfulTrials) * 100 : 0;

      // Score statistics
      const scores = scoreHistory[alt.id];
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const minScore = scores.length > 0 ? Math.min(...scores) : 0;
      const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
      const stdDev = scores.length > 0
        ? Math.sqrt(scores.reduce((acc, s) => acc + Math.pow(s - avgScore, 2), 0) / scores.length)
        : 0;

      let mostCommonRank = baseRank;
      let mostCommonCount = 0;
      for (let r = 1; r <= alternatives.length; r++) {
        if ((rankCounts[r] || 0) > mostCommonCount) {
          mostCommonCount = rankCounts[r] || 0;
          mostCommonRank = r;
        }
      }

      // 95% Confidence Interval for stability percentage: p ± 1.96 * sqrt(p(1-p)/N)
      const p = stabilityPct / 100;
      const ciMargin = successfulTrials > 0 ? 1.96 * Math.sqrt((p * (1 - p)) / successfulTrials) * 100 : 0;

      return {
        alternativeId: alt.id,
        alternativeName: alt.name,
        baseRank,
        stabilityPct: parseFloat(stabilityPct.toFixed(1)),
        ciMargin: parseFloat(ciMargin.toFixed(1)),
        mostCommonRank,
        avgScore: parseFloat(avgScore.toFixed(4)),
        minScore: parseFloat(minScore.toFixed(4)),
        maxScore: parseFloat(maxScore.toFixed(4)),
        stdDev: parseFloat(stdDev.toFixed(4)),
        rankDistribution: rankCounts,
        robustness:
          stabilityPct >= 80
            ? "High"
            : stabilityPct >= 50
            ? "Medium"
            : "Low",
      };
    });

    // Sort by base rank
    stabilityResults.sort((a, b) => a.baseRank - b.baseRank);

    // Rank reversal count: trials where baseline winner was not #1
    const baseWinner = stabilityResults[0]?.alternativeId;
    const rankReversalCount = alternatives.reduce((acc: number, alt: Alternative) => {
      if (alt.id !== baseWinner) {
        return acc + (rankFrequency[alt.id][1] || 0);
      }
      return acc;
    }, 0);
    const rankReversalPct = successfulTrials > 0 ? (rankReversalCount / successfulTrials) * 100 : 0;

    // Criteria weight transparent variation summary
    const criteriaStats = criteria.map((c: Criterion, j: number) => {
      const samples = criteriaWeightSamples[j] || [];
      const minW = samples.length > 0 ? Math.min(...samples) : baseWeights[j];
      const maxW = samples.length > 0 ? Math.max(...samples) : baseWeights[j];
      const meanW = samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : baseWeights[j];
      return {
        id: c.id,
        name: c.name,
        baseWeight: parseFloat(baseWeights[j].toFixed(4)),
        minWeight: parseFloat(minW.toFixed(4)),
        maxWeight: parseFloat(maxW.toFixed(4)),
        meanWeight: parseFloat(meanW.toFixed(4)),
      };
    });

    return NextResponse.json({
      method,
      trials: successfulTrials,
      perturbPct,
      seed: seed !== null && seed !== undefined ? Number(seed) : null,
      iteration: Number(iteration) || 1,
      timestamp: new Date().toISOString(),
      stabilityResults,
      criteriaStats,
      summary: {
        baseWinner: stabilityResults[0]?.alternativeName || "N/A",
        winnerStabilityPct: stabilityResults[0]?.stabilityPct || 0,
        rankReversalPct: parseFloat(rankReversalPct.toFixed(1)),
        overallRobustness:
          (stabilityResults[0]?.stabilityPct || 0) >= 80
            ? "Highly Robust"
            : (stabilityResults[0]?.stabilityPct || 0) >= 50
            ? "Moderately Robust"
            : "Sensitive to Weight Changes",
      },
    });
  } catch (err: any) {
    console.error("Monte Carlo error:", err);
    return NextResponse.json({ error: err.message || "Monte Carlo simulation failed" }, { status: 500 });
  }
}
