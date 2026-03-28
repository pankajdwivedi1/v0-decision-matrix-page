import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// POST handler for Paper Extraction
export async function POST(req: NextRequest) {
  try {
    const { paperText, extractionType, userApiKey: providedKey, userApiKeys: providedKeys } = await req.json();

    if (!paperText) {
      return NextResponse.json(
        { error: "Paper text is required" },
        { status: 400 }
      );
    }

    // Build key list: user-provided keys take priority, fall back to server keys
    let apiKeys: string[] = [];

    // Accept multiple keys (new format)
    if (providedKeys && Array.isArray(providedKeys) && providedKeys.length > 0) {
      apiKeys = providedKeys.map((k: string) => k.trim()).filter((k: string) => k.length > 0);
    }
    // Also accept single legacy key
    if (providedKey && providedKey.trim().length > 0 && !apiKeys.includes(providedKey.trim())) {
      apiKeys.unshift(providedKey.trim());
    }
    // Fall back to server keys if no user key provided
    if (apiKeys.length === 0) {
      const keysString = process.env.GEMINI_API_KEY || "";
      apiKeys = keysString.split(",").map(k => k.trim()).filter(k => k.length > 0);
    }

    if (apiKeys.length === 0) {
      return NextResponse.json(
        { error: "Gemini API Keys are missing. Please add your own API key in settings." },
        { status: 500 }
      );
    }

    // Truncate text to avoid token limits on free tier (roughly 10k-15k words)
    const truncatedText = paperText.length > 40000 
        ? paperText.substring(0, 40000) + "... [Text truncated to prevent quota overflow]"
        : paperText;

    const prompt = `
You are an expert academic research analyst specializing in Multi-Criteria Decision Making (MCDM) literature.

Analyze the following research paper (partially truncated if long) and extract all relevant MCDM information in a structured format.

**Paper Text:**
${truncatedText}

**Your Task:**
Extract and structure the following information from this paper:

1. **Citation Information:**
   - Paper Title
   - Authors (if identifiable)
   - Year (if identifiable)
   - Journal/Conference (if mentioned)
   - DOI (if present)

2. **Research Context:**
   - Research Topic/Domain (what is being selected/evaluated?)
   - Problem Statement (what challenge is addressed?)
   - Research Gap (what was missing in previous research?)
   - MCDM Method Used (TOPSIS, PROMETHEE, AHP, ELECTRE, etc.)

3. **Decision Matrix Components:**
   - List of Alternatives (what options were evaluated?)
   - List of Criteria (what factors were considered?)
   - For each criterion:
     * Name
     * Description/Definition
     * Unit of measurement (if any)
     * Type (beneficial/cost/non-beneficial - extract from context)
     * Weight/Importance (if provided)
   
4. **Decision Matrix Data (if a table is present):**
   - Extract the numerical decision matrix
   - Alternative names as rows
   - Criteria as columns
   - Include all values

5. **Original Results:**
   - Which alternative was ranked first/optimal?
   - Final ranking order (if provided)
   - Key findings

6. **Gaps Identified for Future Research:**
   - What did this study NOT include?
   - What limitations were mentioned?
   - What could be extended/improved?

**Output Format:**
Provide your response in the following JSON structure:

{
  "citation": {
    "title": "extracted title",
    "authors": "author names or 'Not found'",
    "year": "year or 'Not found'",
    "journal": "journal name or 'Not found'",
    "doi": "DOI or 'Not found'"
  },
  "researchContext": {
    "topic": "brief research topic",
    "problemStatement": "extracted problem statement (100-200 words)",
    "researchGap": "identified research gap from the paper",
    "methodology": "MCDM method used (e.g., TOPSIS, PROMETHEE)",
    "domain": "application domain (e.g., manufacturing, healthcare)"
  },
  "criteria": [
    {
      "name": "Criterion name",
      "description": "What this criterion represents",
      "unit": "unit of measurement",
      "type": "beneficial or non-beneficial",
      "weight": 0.25
    }
  ],
  "alternatives": [
    {
      "name": "Alternative 1",
      "description": "brief description if available"
    }
  ],
  "decisionMatrix": {
    "hasMatrix": true or false,
    "values": [[row1values], [row2values]] or null
  },
  "originalResults": {
    "winner": "top ranked alternative",
    "ranking": ["alt1", "alt2", "alt3"] or null,
    "keyFindings": "brief summary of main results"
  },
  "identifiedGaps": [
    "Gap 1: No sensitivity analysis performed",
    "Gap 2: Only one MCDM method used",
    "Gap 3: Static weights without validation"
  ],
  "suggestedContributions": [
    "Apply comparative method analysis (TOPSIS vs PROMETHEE)",
    "Conduct K% sensitivity analysis",
    "Validate robustness under weight variations"
  ]
}

**Important Instructions:**
- Extract ONLY information explicitly present in the paper
- Use "Not found" or null for missing information
- Be precise with numerical values
- Infer criterion type (beneficial/non-beneficial) from context clues like "higher is better", "minimize", "maximize", "cost", "benefit"
- Provide comprehensive criterion descriptions that capture the paper's explanation
- Identify realistic research gaps that could justify a new comparative/extension study

Return ONLY the JSON object, no additional text.
        `;

    let lastError = null;

    // Try each API key
    for (let i = 0; i < apiKeys.length; i++) {
      try {
        const genAI = new GoogleGenerativeAI(apiKeys[i]);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash", // Reverting to user confirmed working model
          generationConfig: {
            temperature: 0.3,
            topP: 0.95,
            topK: 40,
          },
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean JSON response
        text = text.trim();
        if (text.startsWith("```json")) {
          text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (text.startsWith("```")) {
          text = text.replace(/```\n?/g, "");
        }

        // Parse and return the extracted data
        const extractedData = JSON.parse(text);

        return NextResponse.json({
          success: true,
          data: extractedData,
          message: "Paper analyzed successfully!"
        });

      } catch (err: any) {
        lastError = err;
        console.error(`Key ${i + 1} failed:`, err.message);
        continue;
      }
    }

    // All keys failed
    console.error("All API keys failed. Last error:", lastError);
    return NextResponse.json(
      {
        error: `AI service unavailable: ${lastError?.message || 'All API keys failed'}. Please check your API keys or try again later.`,
        details: lastError?.message || "Unknown error",
        suggestion: "If this persists, check your Gemini API key quota at https://ai.google.dev/"
      },
      { status: 500 }
    );

  } catch (error: any) {
    console.error("Paper extraction error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract paper data" },
      { status: 500 }
    );
  }
}
