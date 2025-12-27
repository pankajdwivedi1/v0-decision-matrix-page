import { NextRequest, NextResponse } from "next/server";
import { calculateEqual } from "../calculate/equal";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { criteria } = body;

        if (!criteria) {
            return NextResponse.json(
                { error: "Missing required fields: criteria" },
                { status: 400 }
            );
        }

        const result = calculateEqual(criteria);

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("Equal weight calculation error:", err);
        return NextResponse.json(
            { error: "Internal server error during equal weight calculation" },
            { status: 500 }
        );
    }
}
