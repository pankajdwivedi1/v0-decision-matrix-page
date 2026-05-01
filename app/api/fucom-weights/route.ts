import { NextRequest, NextResponse } from "next/server";
import type { Criterion } from "../calculate/types";
import { calculateFUCOM } from "../calculate/fucom";

export interface FUCOMWeightsRequest {
    criteria: Criterion[];
    priorityScores: Record<string, number>;
}

export async function POST(request: NextRequest) {
    try {
        const body: FUCOMWeightsRequest = await request.json();
        const { criteria, priorityScores } = body;

        if (!criteria || !priorityScores) {
            return NextResponse.json(
                { error: "Missing required fields: criteria, priorityScores" },
                { status: 400 }
            );
        }

        const result = calculateFUCOM(criteria, priorityScores);

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("FUCOM calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during FUCOM weight calculation" },
            { status: 500 }
        );
    }
}
