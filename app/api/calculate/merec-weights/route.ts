import { NextRequest, NextResponse } from "next/server";
import type { Alternative, Criterion } from "../types";
import { calculateMEREC } from "../merec";

export interface MERECWeightsRequest {
    alternatives: Alternative[];
    criteria: Criterion[];
}

export interface MERECWeightsResponse {
    weights: Record<string, number>;
    normalizedMatrix: Record<string, Record<string, number>>;
    performanceScores: Record<string, number>;
    removalScores: Record<string, Record<string, number>>;
    removalEffects: Record<string, number>;
}

export async function POST(request: NextRequest) {
    try {
        const body: MERECWeightsRequest = await request.json();
        const { alternatives, criteria } = body;

        if (!alternatives || !criteria) {
            return NextResponse.json(
                { error: "Missing required fields: alternatives, criteria" },
                { status: 400 }
            );
        }

        const result = calculateMEREC(alternatives, criteria);

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("MEREC calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during MEREC weight calculation" },
            { status: 500 }
        );
    }
}
