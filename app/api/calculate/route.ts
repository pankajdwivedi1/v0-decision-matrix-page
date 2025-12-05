import { NextRequest, NextResponse } from "next/server";
import type { CalculationRequest, CalculationResponse } from "./types";

// Import all calculation functions
import { calculateSWEI } from "./swei";
import { calculateSWI } from "./swi";
import { calculateTOPSIS } from "./topsis";
import { calculateVIKOR } from "./vikor";
import { calculateWASPAS } from "./waspas";
import { calculateEDAS } from "./edas";
import { calculateMOORA } from "./moora";
import { calculateMULTIMOORA } from "./multimoora";
import { calculateTODIM } from "./todim";
import { calculateCODAS } from "./codas";
import { calculateMOOSRA } from "./moosra";
import { calculateMAIRCA } from "./mairca";
import { calculateMARCOS } from "./marcos";
import { calculateCOCOSO } from "./cocoso";
import { calculateCOPRAS } from "./copras";
import { calculatePROMETHEE } from "./promethee";
import { calculatePROMETHEE1 } from "./promethee1";
import { calculatePROMETHEE2 } from "./promethee2";
import { calculateELECTRE } from "./electre";
import { calculateELECTRE1 } from "./electre1";
import { calculateELECTRE2 } from "./electre2";
import { calculateEntropy } from "./entropy";

// Helper: build ranking and response
function buildResponse(
  method: string,
  results: Record<string, number>,
  alternatives: { id: string; name: string }[]
): CalculationResponse {
  // Methods where LOWER score is better
  const ascendingMethods = ["swei", "swi", "vikor", "multimoora", "mairca"];
  const isAscending = ascendingMethods.includes(method.toLowerCase());

  const ranking = alternatives
    .map((alt) => ({
      alternativeId: alt.id,
      alternativeName: alt.name,
      score: results[alt.id] || 0,
    }))
    .sort((a, b) => isAscending ? a.score - b.score : b.score - a.score)
    .map((item, index) => ({
      rank: index + 1,
      ...item,
      percentage: (item.score * 100).toFixed(2),
    }));

  const best = ranking[0];
  return {
    method,
    results,
    ranking,
    bestAlternative: {
      id: best.alternativeId,
      name: best.alternativeName,
      score: best.score,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculationRequest = await request.json();
    const { method, alternatives, criteria } = body;

    if (!method || !alternatives || !criteria) {
      return NextResponse.json(
        { error: "Missing required fields: method, alternatives, criteria" },
        { status: 400 }
      );
    }

    let results: Record<string, number> = {};

    // Method routing
    switch (method.toLowerCase()) {
      case "swei":
        results = calculateSWEI(alternatives, criteria).scores;
        break;
      case "swi":
        results = calculateSWI(alternatives, criteria).scores;
        break;
      case "topsis":
        results = calculateTOPSIS(alternatives, criteria);
        break;
      case "vikor":
        results = calculateVIKOR(alternatives, criteria);
        break;
      case "waspas":
        results = calculateWASPAS(alternatives, criteria);
        break;
      case "edas":
        results = calculateEDAS(alternatives, criteria);
        break;
      case "moora":
        results = calculateMOORA(alternatives, criteria).scores;
        break;
      case "multimoora":
        results = calculateMULTIMOORA(alternatives, criteria).scores;
        break;
      case "todim":
        results = calculateTODIM(alternatives, criteria).scores;
        break;
      case "codas":
        results = calculateCODAS(alternatives, criteria).scores;
        break;
      case "moosra":
        results = calculateMOOSRA(alternatives, criteria).scores;
        break;
      case "mairca":
        results = calculateMAIRCA(alternatives, criteria).scores;
        break;
      case "marcos":
        results = calculateMARCOS(alternatives, criteria).scores;
        break;
      case "cocoso":
        results = calculateCOCOSO(alternatives, criteria);
      case "test":
        console.log("Test method invoked");
        // results = calculateCOCOSO(alternatives, criteria);
        break;
      case "copras":
        results = calculateCOPRAS(alternatives, criteria);
        break;
      case "promethee":
        results = calculatePROMETHEE(alternatives, criteria);
        break;
      case "promethee1":
        results = calculatePROMETHEE1(alternatives, criteria);
        break;
      case "promethee2":
        results = calculatePROMETHEE2(alternatives, criteria);
        break;
      case "electre":
        results = calculateELECTRE(alternatives, criteria);
        break;
      case "electre1":
        results = calculateELECTRE1(alternatives, criteria);
        break;
      case "electre2":
        results = calculateELECTRE2(alternatives, criteria);
        break;
      default:
        return NextResponse.json(
          { error: `Invalid method: ${method}` },
          { status: 400 }
        );
    }

    const response = buildResponse(method, results, alternatives);
    
    console.log("=== API Response ===");
    console.log("Method:", method);
    console.log("Results:", results);
    console.log("Ranking:", JSON.stringify(response.ranking, null, 2));
    console.log("===================");
    
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("Calculation error:", err);
    return NextResponse.json(
      { error: "Internal server error during calculation" },
      { status: 500 }
    );
  }
}
