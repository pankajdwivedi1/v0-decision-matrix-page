import { NextResponse } from "next/server"
import { calculateRRWeights } from "../../../dummy/ranking_weights"

export async function POST(request: Request) {
    try {
        const { criteria, ranks } = await request.json()
        const result = calculateRRWeights(criteria, ranks)
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error calculating RR weights:", error)
        return NextResponse.json({ error: "Failed to calculate RR weights" }, { status: 500 })
    }
}
