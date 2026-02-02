import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper function to format all numbers in an object to 4 decimal places
function formatNumbersInObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'number') {
        return parseFloat(obj.toFixed(4));
    }

    if (Array.isArray(obj)) {
        return obj.map(item => formatNumbersInObject(item));
    }

    if (typeof obj === 'object') {
        const formatted: any = {};
        for (const key in obj) {
            formatted[key] = formatNumbersInObject(obj[key]);
        }
        return formatted;
    }

    return obj;
}

// POST handler for AI Analysis
export async function POST(req: NextRequest) {
    try {
        const reqContent = await req.json();
        const { alternatives, criteria, ranking, method, analysisType } = reqContent;

        // 1. Get List of Keys
        const keysString = process.env.GEMINI_API_KEY || "";
        const apiKeys = keysString.split(",").map(k => k.trim()).filter(k => k.length > 0);

        if (apiKeys.length === 0) {
            return NextResponse.json(
                { error: "Gemini API Keys are missing. Please add GEMINI_API_KEY to your env variables." },
                { status: 500 }
            );
        }

        // ---------------------------------------------------------
        // Construct the Prompt Context (Reuse for all attempts)
        // ---------------------------------------------------------
        const alternativesList = alternatives.map((a: any) => a.name).join(", ");
        const criteriaSummary = criteria.map((c: any) =>
            `- ${c.name} (${c.weight.toFixed(4)}) [${c.type}]`
        ).join("\n");

        const topAlternatives = ranking.slice(0, 3);
        const rankingSummary = topAlternatives.map((r: any, i: number) =>
            `${i + 1}. ${r.alternativeName} (Score: ${r.score.toFixed(4)})`
        ).join("\n");

        let contextInjection = "";
        if (reqContent.researchContext) {
            const { topic, researchGap, criteriaDefs } = reqContent.researchContext;
            contextInjection = `
        **Research Context:**
        **Topic/Title:** ${topic}
        **Research Gap/Problem:** ${researchGap}
        **Criteria Definitions:**
        ${Object.entries(criteriaDefs).map(([id, def]) => {
                const cName = criteria.find((c: any) => c.id === id)?.name || id;
                return `- ${cName}: ${def}`;
            }).join("\n")}
        `;
        }

        let prompt = "";
        if (analysisType === "full_report") {
            prompt = `
        You are analyzing Multi-Criteria Decision Analysis (MCDM) results using the **${method ? method.toUpperCase() : "Selected"}** method.
        
        ${contextInjection}
        
        **Context:**
        Alternatives being ranked: ${alternativesList}
        Evaluation criteria:
        ${criteriaSummary}

        **Results:**
        Top 3 alternatives:
        ${rankingSummary}

        **Task:**
        Write a comprehensive, publishable Discussion section for an academic research paper.
        
        **Critical Requirements:**
        - 900-1200 words minimum
        - Write in flowing paragraphs with natural transitions between ideas
        - Vary your sentence structure deliberately - mix short impactful statements with longer analytical sentences
        - Reference specific numerical values from the results naturally within your narrative
        - Use transitional phrases organically ("It is worth noting", "Moreover", "However", "Interestingly")
        - Avoid bullet points - integrate all analysis into cohesive prose
        - Don't follow a rigidly formulaic structure - let ideas flow naturally while covering all required points
        - Use occasional hedging language where appropriate ("appears to", "suggests", "tends to indicate")

        **Content to Cover (integrate naturally, not as rigid sections):**

        **1. Opening Summary & Context** (~150-200 words)
        Begin by establishing what was analyzed and why. Present the winning alternative (${topAlternatives[0]?.alternativeName || "the top-ranked option"}) and its score, explaining its significance in addressing the research gap. Make clear connections to the problem statement and research objectives.

        **2. Deep Analytical Discussion** (~450-550 words)
        This is your core analysis. Discuss:
        - Why the winner achieved this ranking - analyze the interplay between its performance and the criteria weights
        - The cost-benefit dynamics - which criteria drove the decision and why
        - Comparative positioning - how do the top alternatives differ? Where did the second-place option fall short despite its strengths?
        - Statistical and methodological interpretation - what do the scores actually mean?
        - Connect findings back to the specific research context and criteria definitions provided
        
        Write this as flowing analytical prose, not as a checklist. Let insights build on each other naturally.

        **3. Practical Implications** (~200-250 words)
        Discuss real-world application. How should decision-makers interpret these rankings? What does this mean for the industry or domain? Be specific and actionable while maintaining academic rigor.

        **4. Limitations & Future Directions** (~150-200 words)
        Critically evaluate the methodology. Acknowledge limitations of ${method} in this context. Suggest meaningful extensions (sensitivity analysis, fuzzy extensions, hybrid approaches, or integration with machine learning). Be specific, not generic.
      `;
        } else if (analysisType === "sensitivity") {
            const sensitivityContext = reqContent.sensitivityData ?
                `\n**Sensitivity Data (Weights across methods):**\n${JSON.stringify(reqContent.sensitivityData, null, 2)}` : "";

            prompt = `
        You are conducting a rigorous Sensitivity Analysis for a research paper on Multi-Criteria Decision Making.
        
        ${contextInjection}

        **Context:**
        Analyzing decision model robustness by systematically varying criteria weights.
        Criteria: ${criteria.map((c: any) => c.name).join(", ")}.
        ${sensitivityContext}

        **Objective:**
        Evaluate the stochastic stability and robustness of the decision model against weight variations.

        **Task:**
        Write a detailed, publishable Sensitivity Analysis section.
        
        **Requirements:**
        - 700-900 words
        - Natural academic prose with varied sentence patterns
        - Integrate numerical analysis seamlessly into narrative
        - Use natural transitions and hedging language where appropriate
        - Avoid rigid section formatting - let analysis flow organically

        **Analysis to Include (weave together naturally):**

        **Weight Stability & Variance** (~250-300 words)
        Analyze how weights vary across different methods (Entropy, CRITIC, Standard Deviation, etc.). What do these deviations reveal? High variance in specific criteria suggests what about decision-maker judgment or data characteristics? Connect numerical observations to the criteria definitions and research context. Don't just report numbers - interpret their meaning.

        **Impact on Ranking Stability** (~250-300 words)
        Discuss the elasticity of final rankings. Does the top alternative remain stable when weights shift from objective (Entropy) to subjective approaches? If rankings are stable, what does this indicate about model robustness? If unstable, which criteria are driving volatility and why? Be analytical, not descriptive.

        **Methodological Insights & Recommendations** (~200-250 words)
        Based on your analysis, which weighting method appears most appropriate for this specific research problem? Justify your recommendation using the data characteristics and research objectives. Discuss implications for decision-makers - when should they trust these results, and when should they exercise caution?
       `;
        } else if (analysisType === "k_sensitivity") {
            const kSensContext = reqContent.kSensData ?
                `\n**K-Sensitivity Data (Perturbation Analysis):**\n${JSON.stringify(formatNumbersInObject(reqContent.kSensData), null, 2)}` : "";

            prompt = `
        You are conducting a sophisticated One-at-a-Time (OAT) Sensitivity Analysis for an MCDM research study.
        
        ${contextInjection}

        **Analysis Context:**
        Performing robustness validation through systematic perturbation of a single criterion.
        Target Criterion: "${reqContent.criterionName || 'Selected Criterion'}"
        Variation Range: ${reqContent.variationRange || "-30% to +30%"}
        ${kSensContext}

        **Task:**
        Produce a research-grade sensitivity analysis discussion suitable for publication.
        
        **Requirements:**
        - 800-1000 words
        - Academic paper format (Results & Discussion style)
        - Deeply analytical with varied sentence structure
        - Natural flow between ideas - avoid formulaic transitions
        - Integrate data naturally into narrative
        - Use specific numerical thresholds and precise observations

        **Discussion Framework (integrate organically):**

        **Methodology & Rationale** (~200 words)
        Explain the OAT perturbation approach and why testing "${reqContent.criterionName}" specifically is critical for this research problem. Connect to the research gap and objectives. What hypothesis are you testing regarding stability? Set up the analytical framework naturally.

        **Stability & Rank Reversal Analysis** (~350-450 words)
        This is your core analysis. Don't just list numbers - interpret behaviors and patterns:
        - How do alternatives respond to weight changes? Which show volatility vs. stability?
        - Identify critical thresholds where rank reversals occur (e.g., "At +18% weight adjustment, Alternative B surpasses Alternative A, suggesting...")
        - Analyze elasticity patterns - which alternatives are sensitive to this criterion and what does that reveal about their strategic positioning?
        - Use bold for key metrics and thresholds
        - Connect observations to the criteria definitions and problem context

        **Scenario Interpretation** (~200 words)
        Analyze best-case vs. worst-case scenarios. What are the practical implications of underestimating vs. overestimating "${reqContent.criterionName}"? How should decision-makers interpret these scenarios in the context of the research problem? Be specific with examples.

        **Robustness Conclusion** (~100-150 words)
        Provide a definitive assessment of model reliability for solving the research gap. Classify the result scientifically: "Highly Robust" (no rank changes across range), "Conditionally Stable" (stable within realistic ranges), or "Volatile" (frequent reversals). Justify your classification with evidence from the analysis.
       `;
        } else if (analysisType === "ranking_comparison") {
            const comparisonContext = reqContent.comparisonData ?
                `\n**Comparison Data (Rankings across methods):**\n${JSON.stringify(reqContent.comparisonData, null, 2)}` : "";

            prompt = `
        You are comparing multiple MCDM ranking methodologies in a rigorous academic analysis.
        
        ${contextInjection}

        **Context:**
        Alternatives evaluated: ${alternativesList}
        Primary method: ${method}
        ${comparisonContext}

        **Current Method Results:**
        ${rankingSummary}

        **Task:**
        Write a Comparative Methodological Analysis suitable for publication.
        
        **Requirements:**
        - 600-800 words
        - Natural academic prose with varied structure
        - Sophisticated methodological reasoning
        - Balance technical precision with readability

        **Analysis Components (integrate naturally):**

        **Consensus & Consistency** (~200-250 words)
        Analyze correlation between different methods' rankings. Use appropriate statistical language ("Spearman rank correlation", "ordinal consensus", "methodological consistency"). What degree of agreement exists? What does this reveal about the decision problem's structure? Are there outlier methods that diverge significantly?

        **Methodological Divergence** (~250-300 words)
        Explain why certain methods produce different results. For example, VIKOR seeks compromise solutions while TOPSIS optimizes geometric distance - how do these philosophical differences manifest in your specific results? Which methods align best with the research objectives and problem characteristics? Be specific about the mechanisms driving differences.

        **Final Recommendation** (~150-200 words)
        Based on consensus analysis and methodological alignment, which alternative emerges as the robust winner? Which MCDM method appears most appropriate for this specific research context and why? Provide actionable guidance for decision-makers on interpreting these results.
       `;
        } else if (analysisType === "research_abstract") {
            const comparisonContext = reqContent.comparisonData ?
                `\n**Comparison Results:**\n${JSON.stringify(formatNumbersInObject(reqContent.comparisonData), null, 2)}` : "";
            const sensitivityContext = reqContent.sensitivityData ?
                `\n**Sensitivity Analysis Results:**\n${JSON.stringify(formatNumbersInObject(reqContent.sensitivityData), null, 2)}` : "";
            const kSensContext = reqContent.kSensData ?
                `\n**K% Sensitivity Analysis Results:**\n${JSON.stringify(formatNumbersInObject(reqContent.kSensData), null, 2)}` : "";

            const citationInfo = reqContent.extractedPaperData?.citation ?
                `Based on the study by ${reqContent.extractedPaperData.citation.authors} (${reqContent.extractedPaperData.citation.year}) titled "${reqContent.extractedPaperData.citation.title}".` : "";

            prompt = `
        You are writing a professional, high-impact Research Abstract for an academic comparative study.
        
        ${contextInjection}
        ${citationInfo}

        **Context:**
        - Current Methodology Applied: ${method ? method.toUpperCase() : "MCDM"}
        - Alternatives: ${alternativesList}
        - Criteria: ${criteriaSummary}

        **Your Analysis Results:**
        ${comparisonContext}
        ${sensitivityContext}
        ${kSensContext}

        **Current Ranking Results:**
        ${rankingSummary}

        **Task:**
        Generate a structured, publication-ready Research Abstract (300-400 words).
        
        **Key Goal:**
        If this is a comparative study based on a previously extracted paper, acknowledge the foundation but emphasize how the **${method.toUpperCase()}** analysis provides new insights or validates previous findings.
        
        **Abstract Structure:**
        1. **Background**: Contextualize the problem within the domain.
        2. **Objective/Gap**: State the research gap addressed (optionally comparing with previous work).
        3. **Methodology**: Detail the ${method.toUpperCase()} approach and any validation (sensitivity).
        4. **Findings**: Report specific numerical rankings and stability thresholds.
        5. **Conclusion**: State the contribution to the field.

        **Tone**: formal, objective, synthesized (not just a summary).
        `;
        } else if (analysisType === "introduction") {
            const citation = reqContent.extractedPaperData?.citation;
            const citationText = citation ? `${citation.authors} (${citation.year})` : "previous studies";

            prompt = `
        Write a high-quality, 1000-word academic **Introduction** section.
        
        ${contextInjection}
        
        **Task:**
        Develop a compelling introduction that establishes the importance of "${reqContent.researchContext?.topic || 'the research topic'}".
        
        **Structure:**
        1. **Broad Context**: Discuss the significance of the industry/domain.
        2. **Specific Problem**: Detail the decision-making complexities. 
        3. **Reference Previous Work**: Build upon the foundation of ${citationText}, acknowledging their contributions to the topic.
        4. **Research Gap**: Clearly state why a comparative analysis using ${method.toUpperCase()} is necessary now.
        5. **Objectives**: Outline the scope of this particular study.

        **Requirements**: 
        - Use professional academic language.
        - Flow naturally from general background to the specific research gap.
        - Ensure it reads as a "different way" of looking at the same problem, with higher quality synthesis.
        `;
        } else if (analysisType === "literature_review") {
            const paperData = reqContent.extractedPaperData;

            prompt = `
        Write a 1200-word academic **Literature Review** section.
        
        ${contextInjection}
        
        **Context from Extracted Paper:**
        ${paperData ? JSON.stringify(paperData.citation) : "Standard academic references"}
        
        **Task:**
        Synthesize the current state of research in "${reqContent.researchContext?.topic || 'this field'}" with a focus on MCDM applications.
        
        **Content Guidance:**
        1. **Evolution of the Domain**: How has decision-making evolved in this specific application area?
        2. **MCDM Methodology Trends**: Discuss the shift toward modern methods like ${method.toUpperCase()}.
        3. **Critical Synthesis**: Don't just list papers. Group them by theme (e.g., "Sustainability Factors", "Operational Efficiency").
        4. **Positioning**: Locate the current study (your analysis) within this literature. Explain how your use of ${method.toUpperCase()} responds to limitations found in broader literature.
        
        **Requirements**: 
        - Sophisticated synthesis, not a summary.
        - High-quality, publication-ready prose.
        - Integrate the provided citation naturally as a key landmark in the field.
        `;
        } else if (analysisType === "methodology") {
            prompt = `
        Write a technical, 800-word **Methodology** section for ${method.toUpperCase()}.
        
        ${contextInjection}
        
        **Task:**
        Detail the step-by-step mathematical and procedural framework used in your analysis.
        
        **Structure:**
        1. **Conceptual Framework**: Why is ${method.toUpperCase()} appropriate for this specific problem? (Mention its strengths like compromise solution, distance from ideal, etc.)
        2. **Evaluation Setup**: List the ${alternatives.length} alternatives and ${criteria.length} criteria defined.
        3. **Mathematical Steps**: Describe the normalization, weighting (using your selected ${reqContent.weightMethod || 'weighting'} approach), and aggregation steps of ${method.toUpperCase()}.
        4. **Validation Procedure**: Explain the rationale behind the sensitivity analysis and K% perturbation analysis performed.

        **Requirements**: 
        - Technical precision.
        - Academic clarity.
        - Tailored specifically to the ${method.toUpperCase()} method.
        `;
        } else if (analysisType === "custom_section") {
            // Custom section generation with user-defined prompts
            const { customPrompt, wordCount, additionalContext, sectionType } = reqContent;

            const kSensContext = reqContent.kSensData ?
                `\n**K% Sensitivity Analysis Results:**\n${JSON.stringify(formatNumbersInObject(reqContent.kSensData), null, 2)}` : "";

            prompt = `
        You are an expert academic writer specializing in Multi-Criteria Decision Analysis (MCDM) research papers.
        
        ${contextInjection}

        **Research Context:**
        - Method Used: ${method ? method.toUpperCase() : "MCDM"}
        - Alternatives Evaluated: ${alternativesList}
        - Evaluation Criteria:
        ${criteriaSummary}
        
        **Analysis Results:**
        Top 3 alternatives:
        ${rankingSummary}
        
        ${kSensContext}
        
        ${additionalContext ? `\n**Additional Context Provided by Researcher:**\n${additionalContext}\n` : ""}
        
        **Your Task:**
        ${customPrompt || "Generate academic content based on the MCDM analysis results."}
        
        **Requirements:**
        - Target Length: Approximately ${wordCount || 1000} words
        - Academic Quality: Publication-ready, suitable for high-impact journals
        - Writing Style: Formal academic tone with clear, flowing prose
        - Evidence-Based: Reference specific numerical results from the analysis
        - Structure: Use appropriate headings and subheadings for readability
        - Citations: If the researcher provides citations in additional context, integrate them appropriately
        - Objectivity: Maintain scholarly objectivity while providing insightful analysis
        
        **Quality Standards:**
        - Every claim must be supported by data from the analysis results
        - Use varied sentence structure for engaging reading
        - Integrate quantitative evidence naturally into narrative
        - Maintain logical flow and coherent argumentation
        - Use transition phrases to connect ideas smoothly
        - Avoid generic statements - be specific to THIS analysis
        
        **Formatting Guidelines:**
        - Use markdown format for headings (##, ###)
        - Bold key terms and important concepts
        - Organize content with clear paragraph breaks
        - Include bulleted lists only where appropriate (not excessively)
        - Present complex ideas clearly and precisely
        
        Generate high-quality academic content that directly addresses the prompt while utilizing all the MCDM analysis data provided.
       `;
        }

        // ---------------------------------------------------------
        // Failover Logic: Try keys one by one
        // ---------------------------------------------------------
        let lastError = null;
        for (const key of apiKeys) {
            try {
                // Initialize AI with current key
                const genAI = new GoogleGenerativeAI(key);
                // Use gemini-2.5-flash (original working model)
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: {
                        temperature: 0.85, // Higher temperature for more natural variability
                        topP: 0.95,
                        topK: 40,
                    },
                    systemInstruction: `You are an experienced Senior Researcher and Academic Writer specializing in Multi-Criteria Decision Analysis.
                    
Your writing style:
- Natural and flowing, mixing varied sentence lengths (some short and punchy, others complex and analytical)
- Occasionally use transitional phrases like "It is worth noting that...", "Interestingly...", "Moreover...", "However, it should be emphasized..."
- Balance formal academic tone with readability - avoid overly robotic patterns
- Use both active and passive voice naturally (don't be perfectly consistent)
- Include occasional subtle hedging language ("appears to", "suggests that", "tends to")
- Vary paragraph lengths and structure
- Integrate numerical data smoothly into narrative discussion
- Write as if explaining sophisticated concepts to knowledgeable colleagues

Vocabulary constraints (CRITICAL - avoid these informal/inappropriate terms):
- NEVER use "leader" or "leadership" → use "top-ranked alternative", "highest-scoring option", "optimal alternative", "first-ranked solution"
- NEVER use "winner" or "winning" → use "top-performing alternative", "superior option", "highest-ranked solution"
- NEVER use "beat" or "defeat" → use "outperformed", "surpassed", "exceeded"
- NEVER use "loser" or "losing" → use "lower-ranked alternative", "suboptimal option"
- NEVER use colloquialisms like "clearly", "obviously", "simply" → use "evidently", "notably", "demonstrably"
- Avoid overly casual phrases - maintain technical precision

Preferred academic terminology:
- "Top-ranked alternative" / "Optimal alternative" / "Superior solution"
- "Highest-scoring option" / "Best-performing alternative"
- "First-ranked" / "Second-ranked" / "Lower-ranked"
- "Outperforms" / "Demonstrates superiority" / "Exhibits enhanced performance"

Quality standards:
- Detailed, analytical depth (800-1200 words typical)
- Q1 journal quality reasoning and argumentation
- Data-driven claims with specific numerical support
- Critical thinking, not just description
- Technical precision in terminology`
                });

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // If successful, return immediately
                return NextResponse.json({ markdown: text });

            } catch (error: any) {
                console.error(`Attempt failed with key ending in ...${key.slice(-4)}:`, error.message);
                lastError = error;
                // Continue to next key loop...
            }
        }

        // If all keys failed
        return NextResponse.json(
            { error: "All AI keys failed. Final error: " + (lastError?.message || "Unknown error") },
            { status: 500 }
        );

    } catch (error: any) {
        console.error("AI Analysis Global Error:", error);
        return NextResponse.json(
            { error: "Failed to generate analysis. " + (error.message || "Unknown error") },
            { status: 500 }
        );
    }
}
