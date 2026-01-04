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
import { calculatePROMETHEE } from "../calculate/promethee";
import { calculatePROMETHEE1 } from "../calculate/promethee1";
import { calculatePROMETHEE2 } from "../calculate/promethee2";
import { calculateELECTRE } from "../calculate/electre";
import { calculateELECTRE1 } from "../calculate/electre1";
import { calculateELECTRE2 } from "../calculate/electre2";
import { calculateMABAC } from "../calculate/mabac";
import { calculateGRA } from "../calculate/gra";
import { calculateARAS } from "../calculate/aras";
import { calculateWSM } from "../calculate/wsm";
import { calculateWPM } from "../calculate/wpm";

function buildResponseSnippet(method: string, results: Record<string, number>, alternatives: any[]) {
    const ascendingMethods = ["swei", "swi", "vikor", "multimoora", "mairca"];
    const isAscending = ascendingMethods.includes(method.toLowerCase());

    const ranking = alternatives
        .map((alt) => ({
            alternativeName: alt.name,
            alternativeId: alt.id,
            score: results[alt.id] !== undefined ? results[alt.id] : 0,
        }))
        .sort((a, b) => (isAscending ? a.score - b.score : b.score - a.score))
        .map((item, index) => ({
            rank: index + 1,
            alternativeName: item.alternativeName,
            score: item.score,
        }));

    return { ranking };
}

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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { method, alternatives, tasks } = body;

        console.log(`Analyzing K-Sens for method: ${method}, tasks: ${tasks?.length}`);

        if (!method || !alternatives || !tasks || !Array.isArray(tasks)) {
            return NextResponse.json({ error: "Missing required fields or invalid tasks" }, { status: 400 });
        }

        // Check if method is SWEI or SWI and validate values BEFORE processing
        if (method.toLowerCase() === "swei" || method.toLowerCase() === "swi") {
            // Check first task's criteria for validation (all tasks use same alternatives)
            if (tasks.length > 0 && tasks[0].criteria) {
                const validation = checkPositiveValues(alternatives, tasks[0].criteria);
                if (!validation.isValid) {
                    const methodName = method.toUpperCase();
                    return NextResponse.json(
                        {
                            error: `${methodName} method requires all values to be greater than zero. Please check your decision matrix.`,
                            invalidCells: validation.invalidCells
                        },
                        { status: 400 }
                    );
                }
            }
        }

        const resultsByCriterion: Record<string, any[]> = {};

        for (const task of tasks) {
            const { criterionName, variation, criteria } = task;
            let scores: Record<string, number> = {};

            try {
                const methodLower = method.toLowerCase();

                // Perform calculation based on method
                if (methodLower === "swei") scores = calculateSWEI(alternatives, criteria).scores;
                else if (methodLower === "swi") scores = calculateSWI(alternatives, criteria).scores;
                else if (methodLower === "topsis") scores = calculateTOPSIS(alternatives, criteria).scores;
                else if (methodLower === "vikor") scores = calculateVIKOR(alternatives, criteria, 0.5).scores;
                else if (methodLower === "waspas") scores = calculateWASPAS(alternatives, criteria, 0.5).scores;
                else if (methodLower === "edas") scores = calculateEDAS(alternatives, criteria).scores;
                else if (methodLower === "moora") scores = calculateMOORA(alternatives, criteria).scores;
                else if (methodLower === "multimoora") scores = calculateMULTIMOORA(alternatives, criteria).scores;
                else if (methodLower === "todim") scores = calculateTODIM(alternatives, criteria).scores;
                else if (methodLower === "codas") scores = calculateCODAS(alternatives, criteria, 0.02).scores;
                else if (methodLower === "moosra") scores = calculateMOOSRA(alternatives, criteria).scores;
                else if (methodLower === "mairca") scores = calculateMAIRCA(alternatives, criteria).scores;
                else if (methodLower === "marcos") scores = calculateMARCOS(alternatives, criteria).scores;
                else if (methodLower === "cocoso") scores = calculateCOCOSO(alternatives, criteria).scores;
                else if (methodLower === "copras") scores = calculateCOPRAS(alternatives, criteria).scores;
                else if (methodLower === "promethee") scores = calculatePROMETHEE(alternatives, criteria).scores;
                else if (methodLower === "promethee1") scores = calculatePROMETHEE1(alternatives, criteria).scores;
                else if (methodLower === "promethee2") scores = calculatePROMETHEE2(alternatives, criteria).scores;
                else if (methodLower === "electre") scores = calculateELECTRE(alternatives, criteria);
                else if (methodLower === "electre1") scores = calculateELECTRE1(alternatives, criteria);
                else if (methodLower === "electre2") scores = calculateELECTRE2(alternatives, criteria);
                else if (methodLower === "mabac") scores = calculateMABAC(alternatives, criteria).scores;
                else if (methodLower === "gra") scores = calculateGRA(alternatives, criteria).scores;
                else if (methodLower === "aras") scores = calculateARAS(alternatives, criteria).scores;
                else if (methodLower === "wsm") scores = calculateWSM(alternatives, criteria).scores;
                else if (methodLower === "wpm") scores = calculateWPM(alternatives, criteria).scores;

                const { ranking } = buildResponseSnippet(method, scores, alternatives);

                const rankingsMap: Record<string, any> = {};
                const scoresList: any[] = [];
                ranking.forEach(item => {
                    rankingsMap[item.alternativeName] = { rank: item.rank, score: item.score };
                    scoresList.push({ name: item.alternativeName, score: item.score });
                });

                if (!resultsByCriterion[criterionName]) resultsByCriterion[criterionName] = [];
                resultsByCriterion[criterionName].push({
                    variation,
                    rankings: rankingsMap,
                    scores: scoresList
                });
            } catch (err) {
                console.error(`Error calculating ${method} for ${criterionName} at variation ${variation}:`, err);
            }
        }

        return NextResponse.json({ results: resultsByCriterion });
    } catch (error) {
        console.error("KSens Analysis API error:", error);
        return NextResponse.json({ error: "Internal server error performing analysis", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
