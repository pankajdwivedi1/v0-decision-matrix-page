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
        const { alternatives, criteria, ranking, method, analysisType, userApiKey: providedKey, assetLabels, isLastSection } = reqContent;

        // 1. Get List of Keys
        let apiKeys: string[] = [];
        if (providedKey && providedKey.trim().length > 0) {
            apiKeys = [providedKey.trim()];
        } else {
            const keysString = process.env.GEMINI_API_KEY || "";
            apiKeys = keysString.split(",").map(k => k.trim()).filter(k => k.length > 0);
        }

        if (apiKeys.length === 0) {
            return NextResponse.json(
                { error: "Gemini API Keys are missing. Please add GEMINI_API_KEY to your env variables or provide your own API key." },
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
            const { topic, researchGap, criteriaDefs, references } = reqContent.researchContext;
            const referencesText = references ? references : "No specific references provided. Use high-quality generic academic citations if needed.";

            contextInjection = `
        **Research Context:**
        **Topic/Title:** ${topic}
        **Research Gap/Problem:** ${researchGap}
        **Criteria Definitions:**
        ${Object.entries(criteriaDefs).map(([id, def]) => {
                const cName = criteria.find((c: any) => c.id === id)?.name || id;
                return `- ${cName}: ${def}`;
            }).join("\n")}
        
        **Available Scholarly References:**
        ${referencesText}
        `;
        }

        let assetLabelsInjection = "";
        if (assetLabels && typeof assetLabels === 'object') {
            const relevantAssets = Object.entries(assetLabels).filter(([key, label]) => {
                const k = key.toLowerCase();
                const isWeightingAsset = k.includes("weight") || k.includes("crit");
                const isRankingAsset = k.includes("ranking") || k.includes("result") || k.includes("score");
                const isComparisonAsset = k.includes("comparison") || k.includes("rho") || k.includes("tau") || k.includes("spearman") || k.includes("kendall");
                const isSensitivityAsset = k.includes("sensitiv") || k.includes("chart") || k.includes("variation") || k.includes("perturbation");
                
                // EXCLUSION POLICY: Strictly forbid Study-Specific Assets in Preliminary/Terminal sections
                const isPreliminarySection = ["introduction", "literature", "literature_review", "references", "manuscript_title", "abstract", "conclusion"].includes(analysisType) ||
                                           ["introduction", "literature", "literature_review", "references", "abstract", "conclusion"].includes(reqContent.sectionType || "");
                
                if (isPreliminarySection) {
                    // CRITICAL: Still allow Method Names to pass through for theoretical discussion/definitions
                    // This allows the AI to know WHICH methods to describe in Intro/Lit Review without inserting Table placeholders.
                    return k.startsWith('method_') || k.startsWith('weight_method_');
                }

                // Methodology only gets inputs (Matrix, Criteria), weight methods, and all comparison rank methods
                if (analysisType === "methodology" || reqContent.sectionType === "methodology") {
                    return !isRankingAsset && !isSensitivityAsset && !isComparisonAsset;
                }

                // Results & Discussion sections get Findings based on their specific type
                if (analysisType === "sensitivity" || analysisType === "k_sensitivity" || 
                    reqContent.sectionType === "sensitivity" || reqContent.sectionType === "k_sensitivity") {
                    return isSensitivityAsset;
                }

                if (analysisType === "ranking_comparison" || reqContent.sectionType === "ranking_comparison") {
                    return isRankingAsset || isComparisonAsset;
                }

                if (analysisType === "results" || reqContent.sectionType === "results") {
                    return isRankingAsset || isWeightingAsset;
                }

                return true; 
            });

            if (relevantAssets.length > 0) {
                const manifestEntries = relevantAssets.map(([key, label]) => {
                    // Human-friendly description based on key
                    let desc = "Decision-making data asset";
                    if (key.startsWith("method_")) desc = "MCDM Method: Provide technical definition and mathematical rationale.";
                    if (key.startsWith("weight_method_")) desc = "Weighting Method: Describe its calculation framework.";
                    if (key.includes("matrix")) desc = "Mathematical processing matrix";
                    if (key.includes("ranking") || key.includes("result")) desc = "Final selection outcomes";
                    if (key.includes("sensitiv")) desc = "Model robustness validation results";
                    if (key.includes("chart") || key.includes("variation")) desc = "Graphical visualization of results";
                    if (key.includes("weight") && !key.startsWith("weight_method_")) desc = "Criteria importance calculations";

                    return `- **Identifier:** \`${key}\` | **Refer to as:** \`${label}\` | **Description:** ${desc}`;
                }).join("\n");

                assetLabelsInjection = `
        **RESEARCH ASSET MANIFEST (STRATEGIC ITERATION MANDATE):**
        To meet Q1 academic standards, you MUST explicitly interpret and include placeholders for **EVERY SINGLE ASSET** listed below. This is a technical requirement: if the manifest provides 10 assets, the manuscript MUST contain exactly 10 distinct interpretations and 10 placeholders.
        
        **Available Research Assets:**
        ${manifestEntries}
        
        **STRICT EXECUTION RULES (NON-NEGOTIABLE):**
        1. **Checklist Interpretation:** You MUST treat the manifest above as a checklist. For each "Identifier", write a technical interpretation in the narrative flow. 
        2. **Explicit Mentions:** Use the "Refer to as" label directly in the text (e.g., "The results presented in Table 1 reveal...").
        3. **AUTOMATIC PLACEHOLDERS:** Immediately after discussing an asset, you MUST insert a new line containing exactly: **[Insert {Refer to as label}: {Description} here]**.
        4. **Anti-Omission Protocol:** You are STRICTLY FORBIDDEN from skipping assets or merging multiple assets into a single sentence. Interpret the numerical importance of each one individually.
        5. **Traceability:** Every statistical claim in your text MUST be traceable to an identifier in this manifest.
        `;
            } else {
                assetLabelsInjection = `
        **STRICT PROVISION (Q1 STANDARD):**
        - DO NOT mention any tables, figures, numerical ranking results, or sensitivity findings in this section.
        - DO NOT insert any placeholders in this section.
        `;
            }
        }

        // Identify which methods are explicitly "selected" via checkboxes (markedAssets)
        const selectedAssets = reqContent.selectedAssets || [];
        const markedMethods = selectedAssets
            .filter((key: string) => key.startsWith("method_"))
            .map((key: string) => key.replace("method_", ""));

        const markedWeightMethods = selectedAssets
            .filter((key: string) => key.startsWith("weight_method_"))
            .map((key: string) => key.replace("weight_method_", ""));

        // If the user hasn't explicitly marked any methods but provided a primary 'method', use that
        const finalMethodsToDescribe = markedMethods.length > 0 ? markedMethods : (method ? [method] : []);
        const finalWeightsToDescribe = markedWeightMethods.length > 0 ? markedWeightMethods : (reqContent.weightMethod ? [reqContent.weightMethod] : []);

        // ---------------------------------------------------------
        // METHODOLOGY SCOPE LOGIC (Anti-Hallucination)
        // ---------------------------------------------------------
        const activeRankingMethod = (method || "MCDM").toUpperCase();
        const activeWeightingMethod = (finalWeightsToDescribe[0] || "Assigned").toUpperCase();
        const hasSensitivityData = !!(reqContent.sensitivityData || reqContent.kSensData || analysisType === 'sensitivity' || analysisType === 'k_sensitivity');
        const hasComparisonData = !!(reqContent.comparisonData || analysisType === 'ranking_comparison');

        const sensitivityRule = hasSensitivityData
            ? "- Provide a deep technical analysis of the **Sensitivity Analysis** results using the provided data."
            : "- **STRICT PROHIBITION**: DO NOT mention Sensitivity Analysis or Perturbation Analysis. No data was provided.";

        const correlationRule = hasComparisonData
            ? "- Analyze the **Spearman Rank Correlation** and methodological consistency based on the comparison data."
            : "- **STRICT PROHIBITION**: DO NOT mention Spearman's Rank Correlation or Kendall's Tau. These validations were NOT performed for this study.";

        const commonMethodsArray = ["SWEI", "SWI", "EDAS", "TOPSIS", "VIKOR", "AHP", "ENTROPY", "CRITIC", "WASPAS", "VOIP", "MARCOS", "ARAS", "MABAC"];
        const forbiddenMethods = commonMethodsArray.filter(m => 
            m !== activeRankingMethod && 
            m !== activeWeightingMethod && 
            !markedMethods.some((mm: string) => mm.toUpperCase() === m) &&
            !markedWeightMethods.some((wm: string) => wm.toUpperCase() === m)
        );
        const isEdas = activeRankingMethod.includes("EDAS") || activeRankingMethod.includes("SWEI") || activeRankingMethod.includes("SWI");

        const methodScopeInjection = `
        **STRICT METHODOLOGY SCOPE:**
        - This study primarily employs **${activeRankingMethod}** for ranking and **${activeWeightingMethod}** for weighting.
        - **Validation Framework:** The study also includes results from ${markedMethods.length > 0 ? markedMethods.join(", ").toUpperCase() : "the primary method only"} for comparative validation.
        - Core Section Protocol: Descriptions of any other methods (like ${forbiddenMethods.slice(0, 5).join(", ")}) are strictly FORBIDDEN.
        ${isEdas ? "- Use full terminology for EDAS components: **Sum Weighted Information (SWI)** and **Sum Weighted Exponential Information (SWEI)**." : "- DO NOT mention SWI or SWEI as they are not part of the selected methodology."}
        - ${sensitivityRule}
        - ${correlationRule}
        - Hallucination Protocol: If a method's specific data (e.g., scores/ranks) is missing from the JSON context above, do NOT mention its specific numerical findings, but you MAY explain its mathematics if it is in the Asset Manifest.
        `;

        // ---------------------------------------------------------
        // RESEARCH SYNTHESIS LOGIC (Connecting Problem to Solution)
        // ---------------------------------------------------------
        const topic = reqContent.researchContext?.topic || "the specified research topic";
        const gap = reqContent.researchContext?.gap || "the need for a robust decision model in this domain";
        const justification = reqContent.researchContext?.methodologyJustification || "the unique technical accuracy of the " + activeRankingMethod + " framework";

        const researchSynthesisInjection = `
        **RESEARCH CONTEXT & NARRATIVE SYNTHESIS (Q1 QUALITY):**
        - **Core Topic:** ${topic}
        - **The Identified Research Gap:** ${gap}
        - **Methodological Justification:** ${justification}
        - **Logical Connection Protocol (CRITICAL):** In your Discussion and Results sections, you MUST explicitly describe how the ${activeRankingMethod} results provide a solution to the gap of "${gap.slice(0, 150)}...". Bridge the results back to the original problem.
        `;

        let methodDescriptionsInjection = "";
        if (finalMethodsToDescribe.length > 0) {
            methodDescriptionsInjection = `
        **SELECTED MCDM METHODS FOR ANALYSIS:**
        The researcher has specifically selected the following methods for this study. You MUST provide technical descriptions and mathematical rationale for these specific methods ONLY:
        ${finalMethodsToDescribe.map((m: any) => `- **${String(m).toUpperCase()}**: Provide its unique normalization logic and aggregation framework.`).join("\n")}
        `;
        }

        if (finalWeightsToDescribe.length > 0 && finalWeightsToDescribe[0]) {
            methodDescriptionsInjection += `
        **SELECTED WEIGHTING CRITERIA (METHODS):**
        ${finalWeightsToDescribe.map((w: any) => `- **${String(w).toUpperCase()} Weighting**: Describe how this method determines criteria importance.`).join("\n")}
        `;
        }

        let prompt = "";
        if (analysisType === "full_report") {
            prompt = `
        You are analyzing Multi-Criteria Decision Analysis (MCDM) results using the **${method ? method.toUpperCase() : "Selected"}** method.
        
        ${contextInjection}
        ${methodDescriptionsInjection}
        ${methodScopeInjection}
        ${researchSynthesisInjection}
        
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

        **1. Opening Summary & Strategic Alignment** (~150-200 words)
        Establish the problem domain and research significance. Present the optimal alternative (${topAlternatives[0]?.alternativeName || "the top-ranked alternative"}) and explicitly describe how this specific result provides a technical solution to the research gap of "**${gap}**" identified in this study.

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

        **MANDATORY RULES:**
        ${assetLabelsInjection}
        - Primary Methodology Focus: Only describe the mathematical steps for the active methods (**${activeRankingMethod}** and **${activeWeightingMethod}** weighting).
        - Whenever you mention a Table or Figure from the Manifest, you MUST immediately follow that sentence with a new line containing a placeholder in the format: **[Insert {Refer to as label}: {Description} here]**.
        - Example: If the manifest says Table 1 is "Decision Matrix", write: **[Insert Table 1: Decision Matrix here]** on its own line.
        - Ensure all sections use hierarchical numbering (e.g., 4.1, 4.2).
        - No "K%" terminology; use "Perturbation Analysis" or "+30% / -30% variation".
      `;
        } else if (analysisType === "manuscript_title") {
            prompt = `
        You are an expert academic editor.
        
        ${contextInjection}
        
        **Research Parameters:**
        - Method: ${method ? method.toUpperCase() : "MCDM"}
        - Alternatives: ${alternatives.length} (listed: ${alternatives.map((a: any) => a.name).join(", ")})
        - Research Focus: ${reqContent.researchContext?.topic || "Decision Intelligence"}
        
        **Your Task:**
        Generate ONE professional, technically valid, high-impact research title for this manuscript. It should be descriptive, formal, and suitable for a Q1 journal.
        
        Format: Return ONLY the title text, nothing else.
        `;
        } else if (analysisType === "sensitivity") {
            const sensitivityContext = reqContent.sensitivityData ?
                `\n**Sensitivity Data (Weights across methods):**\n${JSON.stringify(reqContent.sensitivityData, null, 2)}` : "";

            prompt = `
        You are conducting a rigorous Sensitivity Analysis for a research paper on Multi-Criteria Decision Making.
        
        ${contextInjection}
        ${methodScopeInjection}
        ${researchSynthesisInjection}

        **Context:**
        Analyzing decision model robustness by systematically varying criteria weights.
        Criteria: ${criteria.map((c: any) => c.name).join(", ")}.
        ${sensitivityContext}

        **Objective:**
        Evaluate the stochastic stability and robustness of the decision model against weight variations.

        **Task:**
        Write a detailed, publishable Sensitivity Analysis section.
        
        **MANDATORY RULES:**
        ${assetLabelsInjection}
        - Primary Methodology Focus: Only describe the mathematical steps for the active methods (**${activeRankingMethod}** and **${activeWeightingMethod}** weighting).
        - Whenever you mention a Table or Figure from the Manifest, you MUST immediately follow that sentence with a new line containing a placeholder in the format: **[Insert {Refer to as label}: {Description} here]**.
        
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
                `\n**Perturbation Analysis Data:**\n${JSON.stringify(formatNumbersInObject(reqContent.kSensData), null, 2)}` : "";

            prompt = `
        You are conducting a sophisticated One-at-a-Time (OAT) Sensitivity Analysis for an MCDM research study.
        
        ${contextInjection}
        ${methodScopeInjection}
        ${researchSynthesisInjection}

        **Analysis Context:**
        Performing robustness validation through systematic perturbation of a single criterion.
        Target Criterion: "${reqContent.criterionName || 'Selected Criterion'}"
        Variation Range: ${reqContent.variationRange || "-30% to +30%"}
        ${kSensContext}

        **Task:**
        Produce a research-grade sensitivity analysis discussion (Perturbation Analysis) suitable for publication.
        
        **MANDATORY RULES:**
        ${assetLabelsInjection}
        - Primary Methodology Focus: Only describe the mathematical steps for the active methods (**${activeRankingMethod}** and **${activeWeightingMethod}** weighting).
        - Whenever you mention a Table or Figure from the Manifest, you MUST immediately follow that sentence with a new line containing a placeholder in the format: **[Insert {Refer to as label}: {Description} here]**.
        
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
        ${methodScopeInjection}
        ${researchSynthesisInjection}

        **Context:**
        Alternatives evaluated: ${alternativesList}
        Primary method: ${method}
        ${comparisonContext}

        **Current Method Results:**
        ${rankingSummary}

        **Task:**
        Write a Comparative Methodological Analysis suitable for publication.
        
        **MANDATORY RULES:**
        ${assetLabelsInjection}
        - Primary Methodology Focus: Only describe the mathematical steps for the active methods (**${activeRankingMethod}** and **${activeWeightingMethod}** weighting).
        - Whenever you mention a Table or Figure from the Manifest, you MUST immediately follow that sentence with a new line containing a placeholder in the format: **[Insert {Refer to as label}: {Description} here]**.
        
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
                `\n**Perturbation Analysis Results (±30% Variation):**\n${JSON.stringify(formatNumbersInObject(reqContent.kSensData), null, 2)}` : "";

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
        
        **MANDATORY RULES:**
        ${assetLabelsInjection}
        
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
        Develop a compelling introduction that establishes the importance of **"${topic}"** and explicitly defines the research gap as **"${gap}"**. This study must be positioned as a robust methodological response to these specific challenges.
        
        **Structure:**
        1. **Broad Context**: Discuss the significance of the industry/domain.
        2. **Specific Problem**: Detail the decision-making complexities. 
        3. **Reference Previous Work**: Build upon the foundation of ${citationText}, acknowledging their contributions to the topic.
        4. **Research Gap**: Clearly state why a comparative analysis using ${method.toUpperCase()} is necessary now.
        5. **Objectives**: Outline the scope of this particular study.

        **Requirements**: 
        ${assetLabelsInjection}
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
        4. **Positioning**: Locate the current study (your analysis) within the context of the provided **Scholarly References**. Use these references specifically to justify the study.
        
        **Requirements**: 
        ${assetLabelsInjection}
        - Sophisticated synthesis, not a summary.
        - High-quality, publication-ready prose.
        - You MUST cite at least 5-8 sources from the "Available Scholarly References" list using [1], [2] format.
        - Ensure NO results of this study are mentioned here.
        `;
        } else if (analysisType === "methodology") {
            prompt = `
        ${contextInjection}
        ${methodDescriptionsInjection}
        ${methodScopeInjection}
        ${researchSynthesisInjection}
        
        **Task:**
        Detail the step-by-step mathematical and procedural framework used in your analysis.
        
        **Structure (SEQUENTIAL REFERENCING REQUIRED):**
        1. **Conceptual Framework**: Technical justification for ${method.toUpperCase()}.
        2. **Evaluation Setup & Input Data**: Introduce the decision matrix components and explicitly refer to the Table ID for the matrix (e.g., Table 1).
        3. **Mathematical Steps (Narrative-to-Table Linkage)**: For every step below, explicitly state which Table presents the data (e.g., "Table {X} presents the normalized matrix..."):
           - **Normalization**: Describe the process and refer to the specific table.
           - **Weighting Protocol**: Describe ${reqContent.weightMethod || 'the weighting'} step and refer to the weight table.
           - **Aggregation/Ranking**: Detail the final ${method.toUpperCase()} calculation. If the ranking table is provided in the available assets, reference it; otherwise just describe the math.
        4. **Validation Procedure**: ${hasSensitivityData || hasComparisonData ? "Explain the rationale behind the sensitivity analysis and the specific robustness check, referencing the corresponding validation tables." : "State that the reliability of the rankings is based on the technical soundness of the active MCDM framework applied. **DO NOT invent or describe theoretical validation procedures like Spearman's Rho or Kendall's Tau.**"}

        **MANDATORY RULES:**
        ${assetLabelsInjection}
        - Identify subsections using decimal numbering (e.g., 3.1, 3.2, 3.2.1).
        - **SEQUENTIAL TABLE REFERENCING (MANDATORY)**: You MUST narratively introduce every calculation step by referencing its table (e.g., "The evaluation parameters are presented in Table 1..."). You may ONLY reference tables that are EXPLICITLY listed in your Asset Manifest below.
        - **ABSOLUTE PROHIBITION**: Do NOT invent or describe theoretical validations (e.g., Spearman, Kendall) if their specific tables are not provided in your manifest. If no validation table is present, you MUST NOT write about statistical correlation.
        - Primary Methodology Focus: Only describe the mathematical steps for the active methods (**${activeRankingMethod}** and **${activeWeightingMethod}** weighting).
        - Whenever you mention a Table or Figure from the Manifest, you MUST immediately follow that sentence with a new line containing a placeholder in the format: **[Insert {Refer to as label}: {Description} here]**.
        `;
        } else if (analysisType === "references") {
            prompt = `
        ${contextInjection}
        
        **Your Task:**
        Generate a professional, vertical bibliography of **Scholarly References** for this manuscript. 
        
        **STRICT FORMATTING RULES (MANDATORY):**
        1. **ONLY LIST CITATIONS**: Return ONLY a numbered list of academic references (e.g., [1] Author, Title, Year...). 
        2. **ZERO DISCUSSION**: Do NOT write any summary paragraphs, concluding remarks, or descriptions of the calculations. 
        3. **NO RANKINGS**: Do NOT mention ${alternativesList} or any ranking results in this section. 
        4. **SOURCE MATERIAL**: Use the provided "Available Scholarly References" for citations. 
        `;
        } else if (analysisType === "custom_section") {
            // Custom section generation with user-defined prompts
            const { customPrompt, wordCount, additionalContext, sectionType } = reqContent;

            // If this is a references section, we MUST suppress numerical context to prevent "ghost" results sections
            const isReferences = sectionType === 'references';
            
            const kSensContext = (!isReferences && reqContent.kSensData) ?
                `\n**Type 2: Data Perturbation Analysis Results (±% Fluctuations):**\n${JSON.stringify(formatNumbersInObject(reqContent.kSensData), null, 2)}` : "";

            const sensitivityContext = (!isReferences && reqContent.sensitivityData) ?
                `\n**Type 1: Methodological Sensitivity Results (Weight Comparison):**\n${JSON.stringify(formatNumbersInObject(reqContent.sensitivityData), null, 2)}` : "";

            const comparisonContext = (!isReferences && reqContent.comparisonData) ?
                `\n**Ranking Comparison results (Different Ranking Methods):**\n${JSON.stringify(formatNumbersInObject(reqContent.comparisonData), null, 2)}` : "";

            const resultsContext = isReferences ? "" : `
        **Analysis Results:**
        Top 3 alternatives:
        ${rankingSummary}
        
        ${sensitivityContext}
        ${kSensContext}
        ${comparisonContext}
        `;

            prompt = `
        You are an expert academic writer specializing in Multi-Criteria Decision Analysis (MCDM) research papers.
        
        ${contextInjection}

        **Research Context:**
        - Method Used: ${method ? method.toUpperCase() : "MCDM"}
        - Alternatives Evaluated: ${alternativesList}
        ${isReferences ? "" : `- Evaluation Criteria:\n${criteriaSummary}`}
        
        ${resultsContext}
        
        ${additionalContext ? `\n**Additional Context Provided by Researcher:**\n${additionalContext}\n` : ""}
        
        **Your Task:**
        ${customPrompt || "Generate academic content based on the MCDM analysis results."}
        
        **Requirements:**
        - Target Length: Approximately ${wordCount || 1000} words
        - Academic Quality: Publication-ready, suitable for high-impact journals
        - Writing Style: Formal academic tone with clear, flowing prose
        ${isReferences ? "- NO DISCUSSION: Return ONLY the reference list. No headers for other sections." : "- Evidence-Based: Reference specific numerical results from the analysis"}
        - Structure: Use appropriate headings and subheadings for readability
        - Citations: If the researcher provides citations in additional context, integrate them appropriately
        ${assetLabelsInjection}
        - Objectivity: Maintain scholarly objectivity while providing insightful analysis
        
        **Quality Standards:**
        - Every claim must be supported by data from the analysis results
        - Use hierarchical numbering for sections and subsections (e.g., 1., 1.1, 1.2, 2., etc.)
        - Integrate quantitative evidence naturally into narrative
        - Maintain logical flow and coherent argumentation
        - Primary Methodology Focus: Only describe the mathematical steps for the active methods (**${activeRankingMethod}** and **${activeWeightingMethod}** weighting).
        - Avoid generic statements - be specific to THIS analysis
        
        **Formatting Guidelines:**
        - Use markdown format for headings (## for sections, ### for subsections)
        - **PLACEHOLDER RULE (MANDATORY)**: Whenever you mention a Table or Figure from the Manifest, you MUST immediately follow that sentence with a new line containing exactly: **[Insert {Refer to as label}: {Description} here]**.
        - Organize content with clear paragraph breaks
        - Present complex ideas clearly and precisely
        ${isReferences ? "**STRICT PROHIBITION**: Do NOT append any 'Results', 'Discussion', or 'Conclusion' sections after the bibliography. Return ONLY the citations." : ""}
        
        Generate high-quality academic content that directly addresses the prompt.
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
                // Use gemini-2.5-flash (as requested by user)
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
- **CITATION RULES (CRITICAL)**:
  1. If "Available Scholarly References" are provided in the prompt, you MUST use them for in-text citations.
  2. Use numerical square brackets for in-text citations (e.g., [1], [2], [3]).
  3. Ensure citations are used heavily in the **Introduction** and **Literature Review** sections.
  4. **STRICT LIMITATION ON REFERENCES LIST**: Do NOT include a "References" list or bibliography at the end of your response UNLESS specifically instructed to do so (i.e., when generating the final References section). 
  5. **STRICT LIMITATION ON TITLES**: Do NOT include the main section title (e.g., "1. Introduction") at the start of your response, as it is added by the system. Start directly with the technical content or subsection headers (e.g., 1.1).
  6. DO NOT cite the same paper for results/discussion unless it's a comparison. Statistical results should be stated as findings of THIS study.

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
- **STRUCTURAL INTEGRITY & Q1 COMPLIANCE (MANDATORY)**:
  1. **Zero Omission Policy**: You MUST interpret and include a placeholder for EVERY Table and Figure listed in the Research Asset Manifest. If 10 assets are provided, 10 placeholders must exist in the final text.
  2. **Data Traceability**: Every statistical claim must be backed by a clear reference to a provided asset. Do not invent or "hallucinate" numerical findings.
  3. **Methodological Exclusion**: ONLY describe methods that are active in the current session (refer to the STRICT METHODOLOGY SCOPE).
  4. **No Findings in Background (CRITICAL Q1 RULE)**: DO NOT include any rankings, scores, or empirical results of THIS study in the Introduction or Literature Review. This rule SPECIFICALLY applies to the 'Literature Gap and Novel Contributions' sub-section. Contributions listed there MUST describe the study METHODOLOGY, FRAMEWORK, and APPROACH only. Any mention of specific scores (e.g. 'Alternative X scored 0.81'), city/alternative rankings (e.g. 'Liverpool emerged as top-ranked'), or quantitative findings inside a contributions bullet point is an ABSOLUTE VIOLATION of Q1 academic writing standards.
  5. **Hierarchical Precision**: Ensure consistent section and subsection numbering (e.g., 4.1, 4.2.1).
  6. **TECHNICAL PURITY**: You are strictly FORBIDDEN from mentioning Spearman’s Rho, Kendall’s Tau, or Sensitivity Analysis (±30%) if the prompt does not contain their corresponding numerical data tables. Do not use them even as \"generic validation examples.\"
- **ANTI-HALLUCINATION POLICY (STRICT)**: You are FORBIDDEN from mentioning or explaining methods like SWEI, SWI, VOI, or Sensitivity Analysis if their corresponding data is not provided in the current prompt context. Do not use standard templates; write uniquely based on the provided inputs.
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
