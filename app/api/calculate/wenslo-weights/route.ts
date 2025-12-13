import { NextRequest, NextResponse } from "next/server";
import type { Alternative, Criterion } from "../types";
import { calculateWenslo } from "../wenslo";

export interface WensloWeightsRequest {
    alternatives: Alternative[];
    criteria: Criterion[];
}

export async function POST(request: NextRequest) {
    try {
        const body: WensloWeightsRequest = await request.json();
        const { alternatives, criteria } = body;

        if (!alternatives || !criteria) {
            return NextResponse.json(
                { error: "Missing required fields: alternatives, criteria" },
                { status: 400 }
            );
        }

        const result = calculateWenslo(alternatives, criteria);

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("WENSLO calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during WENSLO weight calculation" },
            { status: 500 }
        );
    }
}
