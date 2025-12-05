import { NextRequest, NextResponse } from "next/server";
import type { Alternative, Criterion } from "../types";
import { calculateCritic } from "../critic";

export interface CriticWeightsRequest {
  alternatives: Alternative[];
  criteria: Criterion[];
}

export interface CriticWeightsResponse {
  weights: Record<string, number>;
  normalizedMatrix: Record<string, Record<string, number>>;
  standardDeviations: Record<string, number>;
  correlationMatrix: Record<string, Record<string, number>>;
  informationAmounts: Record<string, number>;
}

export async function POST(request: NextRequest) {
  try {
    const body: CriticWeightsRequest = await request.json();
    const { alternatives, criteria } = body;

    if (!alternatives || !criteria) {
      return NextResponse.json(
        { error: "Missing required fields: alternatives, criteria" },
        { status: 400 }
      );
    }

    const result = calculateCritic(alternatives, criteria);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("CRITIC calculation error:", err);
    return NextResponse.json(
      { error: "Internal server error during CRITIC weight calculation" },
      { status: 500 }
    );
  }
}

