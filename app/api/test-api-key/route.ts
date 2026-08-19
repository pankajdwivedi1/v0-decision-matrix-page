import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// A lightweight endpoint to verify a Gemini or OpenAI API key
export async function POST(req: NextRequest) {
    try {
        const { apiKey, provider } = await req.json();

        if (!apiKey || apiKey.trim().length === 0) {
            return NextResponse.json({ success: false, error: "No API key provided" }, { status: 400 });
        }

        const trimmedKey = apiKey.trim();
        const isOpenAI = provider === "openai" || trimmedKey.startsWith("sk-");

        if (isOpenAI) {
            // Test OpenAI API Key
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${trimmedKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: "Reply with just the word: OK" }],
                    max_tokens: 5,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData.error?.message || `OpenAI API returned status ${res.status}`;
                return NextResponse.json({ success: false, error: errMsg }, { status: 200 });
            }

            const data = await res.json();
            const text = data.choices?.[0]?.message?.content || "OK";

            return NextResponse.json({
                success: true,
                message: "OpenAI API Key is valid and working!",
                provider: "openai",
                response: text.trim(),
            });
        }

        // Test Google Gemini API Key
        const genAI = new GoogleGenerativeAI(trimmedKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent("Reply with just the word: OK");
        const text = result.response.text();

        return NextResponse.json({
            success: true,
            message: "Gemini API Key is valid and working!",
            provider: "gemini",
            response: text.trim(),
        });

    } catch (error: any) {
        const msg = error.message || "Unknown error";
        return NextResponse.json({
            success: false,
            error: msg,
        }, { status: 200 });
    }
}
