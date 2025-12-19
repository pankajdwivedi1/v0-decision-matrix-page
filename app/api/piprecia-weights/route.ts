import { NextRequest, NextResponse } from "next/server";
import type { Alternative, Criterion } from "../calculate/types";
import { calculatePIPRECIA } from "../calculate/piprecia";

export interface PipreciaWeightsRequest {
    criteria: Criterion[]
}

export async function POST(request: NextRequest) {
    try {
        const body: PipreciaWeightsRequest = await request.json()
        const { criteria } = body

        if (!criteria) {
            return NextResponse.json(
                { error: "Missing required field: criteria" },
                { status: 400 }
            )
        }

        const result = calculatePIPRECIA(criteria)

        return NextResponse.json(result, { status: 200 })
    } catch (err) {
        console.error("PIPRECIA weight calculation error:", err)
        return NextResponse.json(
            { error: "Internal server error during PIPRECIA weight calculation" },
            { status: 500 }
        )
    }
}
