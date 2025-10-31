import { type NextRequest, NextResponse } from "next/server"
import { calculateSWEI } from "./swei"
import { calculateTOPSIS } from "./topsis"
import type { CalculationRequest, CalculationResponse } from "./types"

export async function POST(request: NextRequest) {
  try {
    const body: CalculationRequest = await request.json()

    // Validate required fields
    if (!body.method || !body.alternatives || !body.criteria) {
      return NextResponse.json(
        { error: "Missing required fields: method, alternatives, criteria" },
        { status: 400 }
      )
    }

    let results: Record<string, number> = {}

    // Determine which method to execute
    switch (body.method.toLowerCase()) {
      case "swei":
        const sweiResult = calculateSWEI(body.alternatives, body.criteria)
        results = sweiResult.scores
        break

      case "topsis":
        results = calculateTOPSIS(body.alternatives, body.criteria)
        break

      default:
        return NextResponse.json({ error: "Invalid method" }, { status: 400 })
    }

    // Generate ranking
    const ranking = body.alternatives
      .map((alt) => ({
        alternativeId: alt.id,
        alternativeName: alt.name,
        score: results[alt.id] || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
        percentage: (item.score * 100).toFixed(2),
      }))

    const bestAlternative = ranking[0]

    const response: CalculationResponse = {
      method: body.method,
      results,
      ranking,
      bestAlternative: {
        id: bestAlternative.alternativeId,
        name: bestAlternative.alternativeName,
        score: bestAlternative.score,
      },
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Calculation error:", error)
    return NextResponse.json(
      { error: "Internal server error during calculation" },
      { status: 500 }
    )
  }
}
