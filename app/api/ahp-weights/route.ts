import { NextRequest, NextResponse } from "next/server";
import type { Alternative, Criterion } from "../calculate/types";
import { calculateAHP } from "../calculate/ahp";

export interface AHPWeightsRequest {
  criteria: Criterion[]
}

export interface AHPWeightsResponse {
  weights: Record<string, number>
  pairwiseMatrix: number[][]
  normalizedMatrix: number[][]
  lambdaMax: number
  consistencyIndex: number
  consistencyRatio: number
}

export async function POST(request: NextRequest) {
  try {
    const body: AHPWeightsRequest = await request.json()
    const { criteria } = body

    if (!criteria) {
      return NextResponse.json(
        { error: "Missing required field: criteria" },
        { status: 400 }
      )
    }

    const result = calculateAHP(criteria)

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error("AHP weight calculation error:", err)
    return NextResponse.json(
      { error: "Internal server error during AHP weight calculation" },
      { status: 500 }
    )
  }
}


