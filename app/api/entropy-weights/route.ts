import { NextRequest, NextResponse } from "next/server";
import type { Alternative, Criterion } from "../calculate/types";
import { calculateEntropy } from "../calculate/entropy";

export interface EntropyWeightsRequest {
  alternatives: Alternative[];
  criteria: Criterion[];
}

export interface EntropyWeightsResponse {
  weights: Record<string, number>;
  normalizedMatrix: Record<string, Record<string, number>>;
  entropyValues: Record<string, number>;
  diversityValues: Record<string, number>;
  entropyMatrix: Record<string, Record<string, number>>;
}

export async function POST(request: NextRequest) {
  try {
    const body: EntropyWeightsRequest = await request.json();
    const { alternatives, criteria } = body;

    if (!alternatives || !criteria) {
      return NextResponse.json(
        { error: "Missing required fields: alternatives, criteria" },
        { status: 400 }
      );
    }

    const result = calculateEntropy(alternatives, criteria);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Entropy calculation error:", err);
    return NextResponse.json(
      { error: "Internal server error during entropy weight calculation" },
      { status: 500 }
    );
  }
}

