import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { detectAISentences } from "@/lib/aiDetector";

export async function POST(req: NextRequest) {
    try {
        const { text, userApiKey } = await req.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "No text provided to fix." }, { status: 400 });
        }

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
        const activeKey = apiKeys[0];
        const isOpenAi = activeKey.startsWith("sk-");

        const callLLM = async (prompt: string): Promise<string> => {
            if (isOpenAi) {
                const res = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${activeKey.trim()}`,
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        temperature: 0.6,
                        messages: [{ role: "user", content: prompt }],
                        max_tokens: 300,
                    }),
                });
                if (!res.ok) throw new Error("OpenAI rewrite failed");
                const data = await res.json();
                return (data.choices?.[0]?.message?.content || "").trim().replace(/^"|"$/g, '');
            } else {
                const genAI = new GoogleGenerativeAI(activeKey);
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: {
                        temperature: 0.6,
                        topP: 0.9,
                        topK: 40,
                        maxOutputTokens: 300,
                    },
                });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text().trim().replace(/^"|"$/g, '');
            }
        };

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
                    improved = await callLLM(prompt);

                    // DOUBLE PASS: If score was very high (>70), try one more pass for extra "humanization"
                    if (item.aiScore > 70) {
                        const secondPrompt = buildCitationSafePipelinePrompt(improved);
                        const secImproved = await callLLM(secondPrompt);
                        if (secImproved && secImproved.length > 10) {
                            improved = secImproved;
                            passes = 2;
                        }
                    }

                    // CITATION CONSISTENCY CHECK
                    const mismatchPrompt = buildCitationMismatchPrompt(currentSentence, improved);
                    const checkOutput = await callLLM(mismatchPrompt);

                    // If a mismatch is detected, run the correction prompt
                    if (checkOutput.includes("MISMATCH") || !validateRewriteSafety(currentSentence, improved)) {
                         const correctionPrompt = buildCitationCorrectionPrompt(improved, checkOutput);
                         const corrOutput = await callLLM(correctionPrompt);
                         improved = corrOutput.trim().replace(/^"|"$/g, '');
                    }

                    // FINAL Safety check
                    if (validateRewriteSafety(currentSentence, improved) && improved.length > 5) {
                        updatedText = updatedText.replace(currentSentence, improved);
                        fixResults.push({
                            original: currentSentence,
                            fixed: improved,
                            aiScoreBefore: item.aiScore,
                            passes
                        });
                    } else {
                        fixResults.push({
                            original: currentSentence,
                            fixed: currentSentence,
                            aiScoreBefore: item.aiScore,
                            failed: true,
                            reason: "Citation safety check prevented modification"
                        });
                    }

                } catch (e: any) {
                    console.error("Error fixing sentence:", e);
                    fixResults.push({
                        original: currentSentence,
                        fixed: currentSentence,
                        aiScoreBefore: item.aiScore,
                        failed: true,
                        reason: e.message
                    });
                }
            }
        }

        return NextResponse.json({
            fixedText: updatedText,
            report: {
                totalSentences: analysis.length,
                aiSentencesFound: analysis.filter(a => a.isAI).length,
                fixedCount: fixResults.filter(r => !r.failed).length,
                failedCount: fixResults.filter(r => r.failed).length,
                details: fixResults
            }
        });

    } catch (e: any) {
        console.error("Fix AI error:", e);
        return NextResponse.json({ error: e.message || "Failed to fix AI sentences." }, { status: 500 });
    }
}
