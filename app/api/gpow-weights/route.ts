import { NextRequest, NextResponse } from "next/server";
import { calculateGPOW } from "../calculate/gpow";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { alternatives, criteria } = body;

        if (!alternatives || !criteria) {
            return NextResponse.json(
                { error: "Missing required fields: alternatives, criteria" },
                { status: 400 }
            );
        }

        const result = calculateGPOW(alternatives, criteria);
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("GPOW weight calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during GPOW weight calculation" },
            { status: 500 }
        );
    }
}
