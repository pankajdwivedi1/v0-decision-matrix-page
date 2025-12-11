
import { NextRequest, NextResponse } from "next/server";
import type { Alternative, Criterion } from "../types";
import { calculateLopcow, LopcowResult } from "../lopcow";

export interface LopcowWeightsRequest {
    alternatives: Alternative[];
    criteria: Criterion[];
}

export type { LopcowResult };

export async function POST(request: NextRequest) {
    try {
        const body: LopcowWeightsRequest = await request.json();
        const { alternatives, criteria } = body;

        if (!alternatives || !criteria) {
            return NextResponse.json(
                { error: "Missing required fields: alternatives, criteria" },
                { status: 400 }
            );
        }

        const result = calculateLopcow(alternatives, criteria);

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("LOPCOW calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during LOPCOW weight calculation" },
            { status: 500 }
        );
    }
}
