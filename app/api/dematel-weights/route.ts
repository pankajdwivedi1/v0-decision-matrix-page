import { NextRequest, NextResponse } from "next/server";
import type { Alternative, Criterion } from "../calculate/types";
import { calculateDematel } from "../calculate/dematel";

export interface DematelWeightsRequest {
    alternatives: Alternative[];
    criteria: Criterion[];
}

export async function POST(request: NextRequest) {
    try {
        const body: DematelWeightsRequest = await request.json();
        const { alternatives, criteria } = body;

        if (!alternatives || !criteria) {
            return NextResponse.json(
                { error: "Missing required fields: alternatives, criteria" },
                { status: 400 }
            );
        }


        console.log("Calculated DEMATEL weights...");
        const result = calculateDematel(alternatives, criteria);

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("DEMATEL calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during DEMATEL weight calculation" },
            { status: 500 }
        );
    }
}
