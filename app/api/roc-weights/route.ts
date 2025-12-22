import { NextResponse } from "next/server"
import { calculateROCWeights } from "../../../dummy/ranking_weights"

export async function POST(request: Request) {
    try {
        const { criteria, ranks } = await request.json()
        const result = calculateROCWeights(criteria, ranks)
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error calculating ROC weights:", error)
        return NextResponse.json({ error: "Failed to calculate ROC weights" }, { status: 500 })
    }
}
