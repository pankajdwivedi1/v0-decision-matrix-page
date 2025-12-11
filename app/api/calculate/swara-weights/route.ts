import { NextRequest, NextResponse } from "next/server";
import type { Criterion } from "../types";
import { calculateSWARA } from "../swara";

export interface SWARAWeightsRequest {
    criteria: Criterion[];
    coefficients: Record<string, number>;
}

export interface SWARAWeightsResponse {
    weights: Record<string, number>;
    stepFactors: Record<string, number>;
    preliminaryWeights: Record<string, number>;
    coefficients: Record<string, number>;
}

export async function POST(request: NextRequest) {
    try {
        const body: SWARAWeightsRequest = await request.json();
        const { criteria, coefficients } = body;

        if (!criteria || !coefficients) {
            return NextResponse.json(
                { error: "Missing required fields: criteria, coefficients" },
                { status: 400 }
            );
        }

        const result = calculateSWARA(criteria, coefficients);

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("SWARA calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during SWARA weight calculation" },
            { status: 500 }
        );
    }
}
