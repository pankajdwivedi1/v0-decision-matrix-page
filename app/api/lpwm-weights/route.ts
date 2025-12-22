import { NextRequest, NextResponse } from "next/server";
import { calculateLPWM } from "../calculate/lpwm";

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

        const result = calculateLPWM(alternatives, criteria);
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("LPWM weight calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during LPWM weight calculation" },
            { status: 500 }
        );
    }
}
