import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { detectAISentences, buildTargetedRewritePrompt, validateRewriteSafety } from "@/lib/manuscriptPrompts";

export async function POST(req: NextRequest) {
    try {
        const { text, userApiKey } = await req.json();

        if (!text || text.trim().length < 50) {
            return NextResponse.json({ error: "Text too short to process." }, { status: 400 });
        }

        // Get API keys
        let apiKeys: string[] = [];
        if (userApiKey && userApiKey.trim().length > 0) {
            apiKeys = [userApiKey.trim()];
        } else {
            const keysString = process.env.GEMINI_API_KEY || "";
            apiKeys = keysString.split(",").map((k: string) => k.trim()).filter((k: string) => k.length > 0);
        }

        if (apiKeys.length === 0) {
            return NextResponse.json({ error: "No API key available." }, { status: 500 });
        }

        const analysis = detectAISentences(text);
        const genAI = new GoogleGenerativeAI(apiKeys[0]);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
             generationConfig: {
                temperature: 0.6,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 300,
            },
        });

        const { buildCitationSafePipelinePrompt, validateRewriteSafety, buildCitationMismatchPrompt, buildCitationCorrectionPrompt } = await import("@/lib/manuscriptPrompts");

        let updatedText = text;
        const fixResults = [];

        // For EACH sentence flagged as AI
        for (const item of analysis) {
            if (item.isAI) {
                let currentSentence = item.sentence;
                let improved = "";
                let passes = 1;

                // PASS 1: Rewrite using the safe pipeline prompt
                try {
                    const prompt = buildCitationSafePipelinePrompt(currentSentence);
                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    improved = response.text().trim().replace(/^"|"$/g, '');

                    // DOUBLE PASS: If score was very high (>70), try one more pass for extra "humanization"
                    if (item.aiScore > 70) {
                        const secondPrompt = buildCitationSafePipelinePrompt(improved);
                        const secResult = await model.generateContent(secondPrompt);
                        const secResponse = await secResult.response;
                        improved = secResponse.text().trim().replace(/^"|"$/g, '');
                        passes = 2;
                    }

                    // CITATION CONSISTENCY CHECK
                    const mismatchPrompt = buildCitationMismatchPrompt(currentSentence, improved);
                    const checkResult = await model.generateContent(mismatchPrompt);
                    const checkResponse = await checkResult.response;
                    const checkOutput = checkResponse.text();

                    // If a mismatch is detected, run the correction prompt
                    if (checkOutput.includes("MISMATCH") || !validateRewriteSafety(currentSentence, improved)) {
                         const correctionPrompt = buildCitationCorrectionPrompt(improved, checkOutput);
                         const corrResult = await model.generateContent(correctionPrompt);
                         const corrResponse = await corrResult.response;
                         improved = corrResponse.text().trim().replace(/^"|"$/g, '');
                    }

                    // FINAL Safety check
                    const isSafe = validateRewriteSafety(currentSentence, improved);
                    
                    if (isSafe) {
                        // Correctly replace in the main text
                        const parts = updatedText.split(currentSentence);
                        if (parts.length > 1) {
                             updatedText = parts[0] + improved + parts.slice(1).join(currentSentence);
                             fixResults.push({
                                original: currentSentence,
                                rewritten: improved,
                                status: "fixed",
                                aiScore: item.aiScore,
                                passes
                             });
                        }
                    } else {
                        fixResults.push({
                            original: currentSentence,
                            rewritten: improved,
                            status: "rejected_safety",
                            aiScore: item.aiScore
                        });
                    }
                } catch (e) {
                    console.error("Sentence rewrite failed:", e);
                }
            }
        }

        return NextResponse.json({
            fixedText: updatedText,
            report: fixResults,
            flaggedCount: analysis.filter(s => s.isAI).length,
            fixedCount: fixResults.filter(r => r.status === "fixed").length
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: "Rewrite error: " + (error.message || "Unknown") },
            { status: 500 }
        );
    }
}
