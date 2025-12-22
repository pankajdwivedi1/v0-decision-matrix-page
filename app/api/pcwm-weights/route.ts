import { NextResponse } from "next/server"
import { calculatePCWM } from "../calculate/pcwm"

export async function POST(request: Request) {
    try {
        const { alternatives, criteria } = await request.json()

        if (!alternatives || !criteria) {
            return NextResponse.json(
                { error: "Missing alternatives or criteria" },
                { status: 400 }
            )
        }

        const result = calculatePCWM(alternatives, criteria)
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error in PCWM calculation:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
