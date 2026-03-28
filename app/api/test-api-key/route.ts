import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// A lightweight endpoint to verify a Gemini API key works
export async function POST(req: NextRequest) {
    try {
        const { apiKey } = await req.json();

        if (!apiKey || apiKey.trim().length === 0) {
            return NextResponse.json({ success: false, error: "No API key provided" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Minimal test prompt — uses very few tokens
        const result = await model.generateContent("Reply with just the word: OK");
        const text = result.response.text();

        return NextResponse.json({
            success: true,
            message: "Key is valid and working",
            response: text.trim()
        });

    } catch (error: any) {
        const msg = error.message || "Unknown error";
        return NextResponse.json({
            success: false,
            error: msg
        }, { status: 200 }); // Return 200 so client can read the error
    }
}
