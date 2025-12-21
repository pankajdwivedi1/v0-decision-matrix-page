import { NextRequest, NextResponse } from "next/server";
import { calculateVariance } from "../calculate/variance";

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

        const result = calculateVariance(alternatives, criteria);
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("Variance weight calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during variance weight calculation" },
            { status: 500 }
        );
    }
}
