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
import { calculateMABAC } from "./mabac";
import { calculateEntropy } from "./entropy";
import { calculateGRA } from "./gra";
import { calculateARAS } from "./aras";
import { calculateWSM } from "./wsm";
import { calculateWPM } from "./wpm";

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

    // Helper function to check if all values in the decision matrix are greater than zero
    const checkPositiveValues = (alternatives: any[], criteria: any[]): { isValid: boolean; invalidCells: string[] } => {
      const invalidCells: string[] = [];
      alternatives.forEach((alt) => {
        criteria.forEach((crit) => {
          const value = alt.scores[crit.id];
          if (value === undefined || value === "" || Number(value) <= 0) {
            invalidCells.push(`${alt.name} - ${crit.name}`);
          }
        });
      });
      return { isValid: invalidCells.length === 0, invalidCells };
    };

    // Method routing
    switch (method.toLowerCase()) {
      case "swei": {
        // SWEI requires all values to be greater than zero (uses log function)
        const validation = checkPositiveValues(alternatives, criteria);
        if (!validation.isValid) {
          return NextResponse.json(
            {
              error: "SWEI method requires all values to be greater than zero. Please check your decision matrix.",
              invalidCells: validation.invalidCells
            },
            { status: 400 }
          );
        }
        const sweiData = calculateSWEI(alternatives, criteria);
        results = sweiData.scores;
        // Store intermediate matrices for display
        (request as any).extraMetrics = {
          sweiNormalizedMatrix: sweiData.normalizedMatrix,
          sweiInformationMatrix: sweiData.informationMatrix,
          sweiWeightedExponentialMatrix: sweiData.weightedExponentialMatrix
        };
        break;
      }
      case "swi": {
        // SWI requires all values to be greater than zero (uses log function)
        const validation = checkPositiveValues(alternatives, criteria);
        if (!validation.isValid) {
          return NextResponse.json(
            {
              error: "SWI method requires all values to be greater than zero. Please check your decision matrix.",
              invalidCells: validation.invalidCells
            },
            { status: 400 }
          );
        }
        const swiData = calculateSWI(alternatives, criteria);
        results = swiData.scores;
        // Store intermediate matrices for display
        (request as any).extraMetrics = {
          swiNormalizedMatrix: swiData.normalizedMatrix,
          swiInformationMatrix: swiData.informationMatrix,
          swiWeightedInformationMatrix: swiData.weightedInformationMatrix
        };
        break;
      }
      case "topsis": {
        const topsisData = calculateTOPSIS(alternatives, criteria);
        results = topsisData.scores;
        (request as any).extraMetrics = {
          topsisNormalizedMatrix: topsisData.normalizedMatrix,
          topsisWeightedMatrix: topsisData.weightedMatrix,
          topsisIdealBest: topsisData.idealBest,
          topsisIdealWorst: topsisData.idealWorst,
          topsisDistances: topsisData.distances
        };
        break;
      }
      case "vikor": {
        const vikorData = calculateVIKOR(alternatives, criteria, body.vikorVValue);
        results = vikorData.scores;
        (request as any).extraMetrics = {
          vikorNormalizedMatrix: vikorData.normalizedMatrix,
          vikorSValues: vikorData.sValues,
          vikorRValues: vikorData.rValues,
          vikorQValues: vikorData.qValues,
          vikorFBest: vikorData.fBest,
          vikorFWorst: vikorData.fWorst
        };
        break;
      }
      case "waspas": {
        const waspasData = calculateWASPAS(alternatives, criteria, body.waspasLambdaValue);
        results = waspasData.scores;
        (request as any).extraMetrics = {
          waspasNormalizedMatrix: waspasData.normalizedMatrix,
          waspasWsmMatrix: waspasData.wsmMatrix,
          waspasWpmMatrix: waspasData.wpmMatrix,
          waspasWsmScores: waspasData.wsmScores,
          waspasWpmScores: waspasData.wpmScores
        };
        break;
      }
      case "edas": {
        const edasData = calculateEDAS(alternatives, criteria);
        results = edasData.scores;
        (request as any).extraMetrics = {
          edasAvVector: edasData.avVector,
          edasPdaMatrix: edasData.pdaMatrix,
          edasNdaMatrix: edasData.ndaMatrix,
          edasSpValues: edasData.spValues,
          edasSnValues: edasData.snValues,
          edasNspValues: edasData.nspValues,
          edasNsnValues: edasData.nsnValues,
          edasAsValues: edasData.asValues
        };
        break;
      }
      case "moora": {
        const mooraData = calculateMOORA(alternatives, criteria);
        results = mooraData.scores;
        (request as any).extraMetrics = {
          mooraNormalizedMatrix: mooraData.normalizedMatrix,
          mooraWeightedMatrix: mooraData.weightedMatrix,
          mooraBeneficialSum: mooraData.beneficialSum,
          mooraNonBeneficialSum: mooraData.nonBeneficialSum
        };
        break;
      }
      case "multimoora": {
        const multimooraData = calculateMULTIMOORA(alternatives, criteria);
        results = multimooraData.scores;
        (request as any).extraMetrics = {
          multimooraNormalizedMatrix: multimooraData.normalizedMatrix,
          multimooraWeightedMatrix: multimooraData.weightedMatrix,
          multimooraRatioSystemScores: multimooraData.ratioSystemScores,
          multimooraReferencePointScores: multimooraData.referencePointScores,
          multimooraFullMultiplicativeScores: multimooraData.fullMultiplicativeScores,
          multimooraRatioSystemRanking: multimooraData.ratioSystemRanking,
          multimooraReferencePointRanking: multimooraData.referencePointRanking,
          multimooraFullMultiplicativeRanking: multimooraData.fullMultiplicativeRanking
        };
        break;
      }
      case "todim": {
        const todimData = calculateTODIM(alternatives, criteria);
        results = todimData.scores;
        (request as any).extraMetrics = {
          todimNormalizedMatrix: todimData.normalizedMatrix,
          todimRelativeWeights: todimData.relativeWeights,
          todimDominanceMatrix: todimData.dominanceMatrix
        };
        break;
      }
      case "codas": {
        const codasData = calculateCODAS(alternatives, criteria, body.codasTauValue ? parseFloat(String(body.codasTauValue)) : 0.02);
        results = codasData.scores;
        (request as any).extraMetrics = {
          codasNormalizedMatrix: codasData.normalizedMatrix,
          codasNegativeIdealSolution: codasData.negativeIdealSolution,
          codasEuclideanDistances: codasData.euclideanDistances,
          codasTaxicabDistances: codasData.taxicabDistances,
          codasRelativeAssessmentScores: codasData.relativeAssessmentScores
        };
        break;
      }
      case "moosra": {
        const moosraData = calculateMOOSRA(alternatives, criteria);
        results = moosraData.scores;
        (request as any).extraMetrics = {
          moosraNormalizedMatrix: moosraData.normalizedMatrix,
          moosraWeightedMatrix: moosraData.weightedMatrix,
          moosraBeneficialSum: moosraData.beneficialSum,
          moosraNonBeneficialSum: moosraData.nonBeneficialSum
        };
        break;
      }
      case "mairca": {
        const maircaData = calculateMAIRCA(alternatives, criteria);
        results = maircaData.scores;
        (request as any).extraMetrics = {
          maircaNormalizedMatrix: maircaData.normalizedMatrix,
          maircaTheoreticalRatings: maircaData.theoreticalRatings,
          maircaRealRatings: maircaData.realRatings,
          maircaGapMatrix: maircaData.gapMatrix,
          maircaTotalGaps: maircaData.totalGaps
        };
        break;
      }
      case "marcos": {
        const marcosData = calculateMARCOS(alternatives, criteria);
        results = marcosData.scores;
        (request as any).extraMetrics = {
          marcosNormalizedMatrix: marcosData.normalizedMatrix,
          marcosWeightedMatrix: marcosData.weightedMatrix,
          marcosIdealSolution: marcosData.idealSolution,
          marcosAntiIdealSolution: marcosData.antiIdealSolution,
          marcosUtilityDegrees: marcosData.utilityDegrees,
          marcosKMinus: marcosData.kMinus,
          marcosKPlus: marcosData.kPlus
        };
        break;
      }
      case "cocoso": {
        const cocosoData = calculateCOCOSO(alternatives, criteria);
        results = cocosoData.scores;
        (request as any).extraMetrics = {
          cocosoNormalizedMatrix: cocosoData.normalizedMatrix,
          cocosoWeightedComparabilitySum: cocosoData.weightedComparabilitySum,
          cocosoWeightedComparabilityPower: cocosoData.weightedComparabilityPower,
          cocosoKia: cocosoData.kia,
          cocosoKib: cocosoData.kib,
          cocosoKic: cocosoData.kic
        };
        break;
      }
      case "test":
        console.log("Test method invoked");
        // results = calculateCOCOSO(alternatives, criteria);
        break;
      case "copras": {
        const coprasData = calculateCOPRAS(alternatives, criteria);
        results = coprasData.scores;
        (request as any).extraMetrics = {
          coprasNormalizedMatrix: coprasData.normalizedMatrix,
          coprasWeightedMatrix: coprasData.weightedMatrix,
          coprasSPlus: coprasData.sPlus,
          coprasSMinus: coprasData.sMinus,
          coprasQi: coprasData.qi
        };
        break;
      }
      case "promethee": {
        const prometheeData = calculatePROMETHEE(alternatives, criteria);
        results = prometheeData.scores;
        (request as any).extraMetrics = {
          prometheeNormalizedMatrix: prometheeData.normalizedMatrix,
          prometheePhiPlus: prometheeData.phiPlus,
          prometheePhiMinus: prometheeData.phiMinus,
          prometheeNetFlow: prometheeData.netFlow
        };
        break;
      }
      case "promethee1": {
        const promethee1Data = calculatePROMETHEE1(alternatives, criteria);
        results = promethee1Data.scores;
        (request as any).extraMetrics = {
          promethee1NormalizedMatrix: promethee1Data.normalizedMatrix,
          promethee1AggregatedPreferenceMatrix: promethee1Data.aggregatedPreferenceMatrix,
          promethee1PositiveFlow: promethee1Data.positiveFlow,
          promethee1NegativeFlow: promethee1Data.negativeFlow,
          promethee1OutrankingMatrix: promethee1Data.outrankingMatrix
        };
        break;
      }
      case "promethee2": {
        const promethee2Data = calculatePROMETHEE2(alternatives, criteria);
        results = promethee2Data.scores;
        (request as any).extraMetrics = {
          promethee2NormalizedMatrix: promethee2Data.normalizedMatrix,
          promethee2AggregatedPreferenceMatrix: promethee2Data.aggregatedPreferenceMatrix,
          promethee2PositiveFlow: promethee2Data.positiveFlow,
          promethee2NegativeFlow: promethee2Data.negativeFlow
        };
        break;
      }
      case "electre":
        results = calculateELECTRE(alternatives, criteria);
        break;
      case "electre1":
        results = calculateELECTRE1(alternatives, criteria);
        break;
      case "electre2":
        results = calculateELECTRE2(alternatives, criteria);
        break;
      case "mabac": {
        const mabacData = calculateMABAC(alternatives, criteria);
        results = mabacData.scores;
        (request as any).extraMetrics = {
          mabacNormalizedMatrix: mabacData.normalizedMatrix,
          mabacWeightedMatrix: mabacData.weightedMatrix,
          mabacBorderApproximationArea: mabacData.borderApproximationArea,
          mabacDistanceMatrix: mabacData.distanceMatrix
        };
        break;
      }
      case "gra": {
        const graData = calculateGRA(alternatives, criteria);
        results = graData.scores;
        (request as any).extraMetrics = {
          graNormalizedMatrix: graData.normalizedMatrix,
          graDeviationSequence: graData.deviationSequence,
          graGreyRelationalCoefficients: graData.greyRelationalCoefficients
        };
        break;
      }
      case "aras": {
        const arasData = calculateARAS(alternatives, criteria);
        results = arasData.scores;
        (request as any).extraMetrics = {
          arasNormalizedMatrix: arasData.normalizedMatrix,
          arasWeightedMatrix: arasData.weightedMatrix,
          arasOptimalityFunctionValues: arasData.optimalityFunctionValues,
          arasOptimalAlternativeValues: arasData.optimalAlternativeValues
        };
        break;
      }
      case "wsm": {
        const wsmData = calculateWSM(alternatives, criteria);
        results = wsmData.scores;
        (request as any).extraMetrics = {
          wsmNormalizedMatrix: wsmData.normalizedMatrix,
          wsmWeightedMatrix: wsmData.weightedMatrix,
        };
        break;
      }
      case "wpm": {
        const wpmData = calculateWPM(alternatives, criteria);
        results = wpmData.scores;
        (request as any).extraMetrics = {
          wpmNormalizedMatrix: wpmData.normalizedMatrix,
          wpmWeightedProductMatrix: wpmData.weightedProductMatrix,
        };
        break;
      }
      default:
        return NextResponse.json(
          { error: `Invalid method: ${method}` },
          { status: 400 }
        );
    }

    const response = buildResponse(method, results, alternatives);

    // Attach extra metrics if any
    if ((request as any).extraMetrics) {
      response.metrics = (request as any).extraMetrics;
    }

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
