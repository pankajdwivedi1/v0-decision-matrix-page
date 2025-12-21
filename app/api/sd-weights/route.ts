import { NextRequest, NextResponse } from "next/server";
import { calculateSD } from "../calculate/sd";

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

        const result = calculateSD(alternatives, criteria);
        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("SD weight calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during SD weight calculation" },
            { status: 500 }
        );
    }
}
