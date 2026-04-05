// ============================================================
// 📁 lib/manuscriptPrompts.ts
// MASTER PROMPT ENGINE — Anti-AI-Detection + Q1 Quality System
// ============================================================

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 1: MASTER REFINEMENT ROLE PROMPT
// ─────────────────────────────────────────────────────────────

export const MASTER_ROLE_PROMPT = `
You are a senior domain expert and journal editor refining an already-researched manuscript for Q1 journals (IF > 30).

OBJECTIVE:
Enhance intellectual depth, clarity, and authorial voice WITHOUT altering technical correctness.

CRITICAL PRESERVATION (NON-NEGOTIABLE):
* Do NOT change equations, symbols, variables, or mathematical meaning
* Do NOT change any numerical values, tables, or reported results
* Do NOT remove or alter citations (authors/years/DOIs)
* Do NOT rename methods (AHP, TOPSIS, VIKOR, WASPAS, etc.)
* Do NOT simplify technical terminology

ENHANCEMENT REQUIREMENTS:
1. Analytical Depth:
   - Explain WHY results occur (mechanisms, drivers, constraints)
   - Link outcomes to dataset characteristics and assumptions
   - Identify trade-offs and boundary conditions

2. Evidence Integration:
   - For each citation, add a brief linkage (agreement/contrast/reason)
   - Avoid citation dumping; integrate into arguments

3. Logical Flow:
   - Strengthen transitions and argument progression
   - Remove redundancy and generic phrasing

4. Authorial Voice:
   - Write as the original researcher interpreting their own findings
   - Maintain precise, critical, and confident tone (Q1 standard)

5. Specificity:
   - Anchor statements to "this dataset", "these criteria weights", "this model configuration"
   - Include concise quantitative cues where relevant

STYLE RULES:
* Vary sentence length and structure (avoid uniformity)
* Prefer precise verbs over filler phrases
* Avoid clichés: "in conclusion", "it is important to note", "overall", etc.

OUTPUT:
* A refined section with higher analytical rigor than input
* Same or improved technical accuracy
* No loss of information
`;

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 2: AI-AWARE WRITING MODE PROMPT (Anti-Detection)
// ─────────────────────────────────────────────────────────────

export const AI_AWARE_WRITING_PROMPT = `
AI-AWARE WRITING MODE (Q1 LEVEL) — ANTI-DETECTION ACTIVE:

You must continuously improve your writing for AI-like patterns during generation.

STRICT MANDATES (MANDATORY):
1. **100% CITATION COVERAGE**: Every single one of the "VERIFIED LIVE REFERENCES" provided in the prompt MUST be cited in the text for this section or throughout the manuscript. Do not leave any provided reference out.
2. **ZERO META-TALK**: DO NOT output "Self-reflection", "Word count", "Constraint checks", or any internal thought process. Start directly with the scientific text.
3. **SCIENTIFIC FORMATTING**: Use single asterisks (*) for italics ONLY for Journal names and book titles in the References section (APA 7th Edition).
4. **DOI MATCHING**: Ensure that every in-text citation (e.g., [1]) refers to the correct DOI provided in the source bank.

RULES:
1. DISTRIBUTION PROTOCOL:
   - For Sections (Intro, Lit Review, Discussion): Integrate the provided references naturally into the logical flow. 
   - Every paragraph MUST contain at least one unique citation from the provided bank until the entire list is exhausted.

2. AVOID AI-LIKE SENTENCES:
   - Eliminate generic openers: "this study aims", "in conclusion", "overall", "it is worth noting", "furthermore", "moreover", "the results show"
   - Break uniform sentence length patterns (the "AI signal").
   - Replace passive voice ("It was found that...") with active, data-driven claims.
   - Avoid generic phrases: "this study aims", "in conclusion", "overall", "it is worth noting", "furthermore", "moreover", "the results show"
   - Avoid uniform sentence structures (every sentence same length = AI signal)
   - Avoid passive constructions like "It can be seen that..." or "It should be noted that..."
3. ADD HUMAN EXPERT FEATURES:
   - Provide depth: Explain WHY results occur, not just WHAT they are.
   - Anchor to this data: Mention "these criteria weights" or "the specific scores in Table X".
4. PRESERVE:
   - All equations exactly as provided.
   - All numerical values exactly as computed.
   - All citations with author/year/DOI (formatted as plain text, no asterisks).
   - All technical terminology and method names.
OUTPUT:
- High-quality, professional Q1 manuscript language.
- Use (*) for italics for Journal names in the References section.
- 100% coverage of provided citations in strict APA 7th Edition style.
- Absolutely zero self-reflection or status notes.
`;

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 3: SECTION-WISE REFINEMENT PROMPTS
// ─────────────────────────────────────────────────────────────

export const SECTION_REFINEMENT_PROMPTS: Record<string, string> = {

  abstract: `
SECTION REFINEMENT — ABSTRACT (Q1 Level):

Refine the Abstract to Q1 level.
- Keep within target word count
- Structure: problem → gap → method → key quantitative results → contribution
- Include 1–2 concrete numeric outcomes (e.g., rank stability %, Spearman correlation value)
- Avoid generic claims; be specific to this study's dataset and criteria
- Maintain all citations and values exactly
- NO citation references in abstract (no author/year mentions)
- First sentence must immediately state the real-world problem — no warming up
`,

  introduction: `
SECTION REFINEMENT — INTRODUCTION (Q1 Level):

Refine the Introduction.
- Frame a precise, real-world problem context (not textbook-level generalizations)
- Critically position prior methods with brief limitations (1 sentence per method)
- Lead to a clear research gap (bullet points allowed)
- End with numbered contributions tied to THIS study's methods, data, and validation
- Integrate citations with short evaluative phrases (agree/contrast with label)
- Every paragraph must have at least 1 citation
- Final paragraph must end with: "This study proposes..."
`,

  literature: `
SECTION REFINEMENT — LITERATURE REVIEW (Q1 Level):

Refine the Literature Review.
- Group studies by method families (AHP, TOPSIS, VIKOR, WASPAS, ELECTRE, etc.)
- Compare strengths/limitations across method families (not mere summaries)
- Identify inconsistencies or gaps across studies
- Link identified gaps directly to your chosen approach
- Ensure every citation is interpreted with 1–2 lines of analytical insight
- End with: "Existing studies fail to..."
`,

  methodology: `
SECTION REFINEMENT — METHODOLOGY (Q1 Level):

Refine the Methodology.
- Preserve ALL equations and notation exactly as provided
- Add rationale for each design choice: normalization method, weight strategy, λ parameter, aggregation function
- State assumptions and constraints explicitly (e.g., criteria independence, complete preference information)
- Clarify reproducibility: inputs → processing steps → outputs
- Avoid introducing any method not used in computation
- Justify why each selected method is appropriate for this specific dataset
`,

  results: `
SECTION REFINEMENT — RESULTS & ANALYSIS (Q1 Level):

Refine Results & Analysis.
- Interpret rankings using THIS dataset's specific criteria weights and scores
- Explain the drivers behind top-performing and bottom-performing alternatives
- Use concise quantitative references (e.g., "Alternative A leads with a score of 0.847, outpacing B by 12.3%")
- Where citations appear, compare your outcomes with reported findings (agree/contrast)
- Avoid restating table values verbatim; focus on mechanistic explanation
- NO bibliography or reference list at the end of this section
`,

  sensitivity: `
SECTION REFINEMENT — SENSITIVITY ANALYSIS (Q1 Level):

Refine Sensitivity Analysis.
- Explain HOW perturbations affect rankings AND WHY (mechanistic reasoning)
- Identify thresholds where rank reversals occur (specific % or weight values)
- Discuss robustness and decision confidence with quantitative support
- Keep all numbers and perturbation procedures unchanged
- Distinguish between stable alternatives (rank-invariant across all scenarios) and volatile ones
- NO bibliography at the end of this section
`,

  discussion: `
SECTION REFINEMENT — DISCUSSION (Q1 Level):

Refine Discussion.
- Synthesize findings with literature (agreement/contrast with evidence)
- Provide domain-specific practical implications (what decision-makers SHOULD do — 3–5 actionable recommendations)
- Discuss limitations tied to data scope and model assumptions explicitly
- Avoid repeating Results section content verbatim
- Connect findings to real-world industrial or policy implications
- NO bibliography at the end of this section
`,

  conclusion: `
SECTION REFINEMENT — CONCLUSION (Q1 Level):

Refine Conclusion.
- Concise synthesis of contributions (methods used + key findings)
- Explicit limitations (data, scope, method constraints)
- Concrete future work directions (data expansion, hybrid models, domain transfer, AI-augmented MCDM)
- Maintain precision; no generic statements like "this study contributes to..."
- No new citations unless critical
`,

  references: `
SECTION REFINEMENT — REFERENCES (Q1 Level - APA 7th Edition):

Refine the reference list to strict APA style.
- MANDATORY FORMAT: Authors. (Year). Article title. *Journal Name*, Volume(Issue), Pages. https://doi.org/DOI
- ITALICS: Use single stars (*) around the Journal Name ONLY (e.g., *Energy Policy*).
- NO BOLD: Do not use double stars.
- ORDER: Sort alphabetically by the first author's last name.
- COVERAGE: Ensure 100% of the provided "VERIFIED LIVE REFERENCES" are listed.
- DOIs: Every reference must include its full DOI URL.
`,
};

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 4: AI SENTENCE DETECTOR
// ─────────────────────────────────────────────────────────────

export function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [];
}

const GENERIC_AI_PATTERNS = [
  "this study aims",
  "in conclusion",
  "it is important to note",
  "overall",
  "the results show",
  "furthermore",
  "moreover",
  "it is worth noting",
  "it should be noted",
  "the findings suggest",
  "this paper aims",
  "significant improvement",
  "plays a crucial role",
  "it can be seen",
  "as can be observed",
  "needless to say",
  "in summary",
  "to sum up",
  "last but not least",
];

export interface SentenceAnalysis {
  sentence: string;
  aiScore: number;
  isAI: boolean;
  suggestions: string[];
}

export function detectAISentences(text: string): SentenceAnalysis[] {
  const sentences = splitSentences(text);

  return sentences.map((sentence) => {
    let score = 0;

    // 1. Generic AI phrases
    GENERIC_AI_PATTERNS.forEach((p) => {
      if (sentence.toLowerCase().includes(p)) score += 20;
    });

    // 2. No numbers (low specificity)
    if (!/\d/.test(sentence)) score += 15;

    // 3. Too short or too long (patterned)
    const length = sentence.split(" ").length;
    if (length < 8 || length > 35) score += 10;

    // 4. No reasoning keywords
    if (!/(because|due to|therefore|however|whereas|consequently|notably|critically)/i.test(sentence)) {
      score += 15;
    }

    // 5. Passive-heavy
    if (/(it is|it was|it can be|it should be|it must be)/i.test(sentence)) score += 10;

    const isAI = score > 40;
    const partial = { sentence: sentence.trim(), aiScore: score, isAI };
    return {
      ...partial,
      suggestions: generateSuggestions(partial),
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 5: SUGGESTION GENERATOR
// ─────────────────────────────────────────────────────────────

export function generateSuggestions(
  sentenceObj: { sentence: string; aiScore: number; isAI: boolean }
): string[] {
  const suggestions: string[] = [];

  if (!/\d/.test(sentenceObj.sentence)) {
    suggestions.push("Add specific data or numerical values to anchor this claim.");
  }

  if (!/(because|due to|therefore|consequently)/i.test(sentenceObj.sentence)) {
    suggestions.push("Add causal reasoning — explain WHY or HOW this occurs.");
  }

  if (sentenceObj.sentence.split(" ").length < 10) {
    suggestions.push("Expand with technical detail or dataset-specific context.");
  }

  if (/this study|overall|in conclusion|it is important/i.test(sentenceObj.sentence)) {
    suggestions.push("Replace generic academic opener with a specific claim or finding.");
  }

  if (/(furthermore|moreover|additionally)/i.test(sentenceObj.sentence)) {
    suggestions.push("Replace additive connectors with analytical ones: 'however', 'whereas', 'consequently'.");
  }

  if (/(it is|it was|it can be|it should be)/i.test(sentenceObj.sentence)) {
    suggestions.push("Remove passive construction — rewrite in active voice anchored to dataset.");
  }

  return suggestions;
}

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 6: AI RISK LEVEL INDICATOR
// ─────────────────────────────────────────────────────────────

export type AIRiskLevel = "Low" | "Medium" | "High";

export function getAIRiskLevel(score: number): AIRiskLevel {
  if (score > 70) return "High";
  if (score > 40) return "Medium";
  return "Low";
}

export function getOverallAIRiskFromText(text: string): {
  level: AIRiskLevel;
  score: number;
  flaggedCount: number;
  totalCount: number;
} {
  const analysis = detectAISentences(text);
  const flagged = analysis.filter((s) => s.isAI);
  const avgScore =
    analysis.length > 0
      ? Math.round(analysis.reduce((a, b) => a + b.aiScore, 0) / analysis.length)
      : 0;
  return {
    level: getAIRiskLevel(avgScore),
    score: avgScore,
    flaggedCount: flagged.length,
    totalCount: analysis.length,
  };
}

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 7: PRESERVATION GUARD (Pre/Post Checks)
// ─────────────────────────────────────────────────────────────

export function countNumbers(text: string): number {
  return (text.match(/\b\d+(\.\d+)?\b/g) || []).length;
}

export function countCitations(text: string): number {
  return (text.match(/\([^)]+,\s*\d{4}\)/g) || []).length;
}

export interface PreservationCheckResult {
  numbers_ok: boolean;
  citations_ok: boolean;
  length_ratio: number;
  warnings: string[];
}

export function preservationCheck(
  before: string,
  after: string
): PreservationCheckResult {
  const numbersOk = countNumbers(before) === countNumbers(after);
  const citationsOk = countCitations(before) === countCitations(after);
  const ratio = after.length / (before.length || 1);

  const warnings: string[] = [];
  if (!numbersOk) warnings.push(`Number count changed: ${countNumbers(before)} → ${countNumbers(after)}`);
  if (!citationsOk) warnings.push(`Citation count changed: ${countCitations(before)} → ${countCitations(after)}`);
  if (ratio < 0.7) warnings.push(`Output significantly shorter than input (ratio: ${ratio.toFixed(2)})`);
  if (ratio > 2.0) warnings.push(`Output significantly longer than input (ratio: ${ratio.toFixed(2)})`);

  return {
    numbers_ok: numbersOk,
    citations_ok: citationsOk,
    length_ratio: ratio,
    warnings,
  };
}

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 8: POST-ENHANCEMENT (Quality Boost Heuristics)
// ─────────────────────────────────────────────────────────────

const BANNED_PHRASES: string[] = [
  "in conclusion",
  "it is important to note",
  "overall",
  "this study aims to",
  "needless to say",
  "last but not least",
  "in summary",
  "it is worth noting",
  "it should be noted that",
  "plays a crucial role",
  "significant improvement",
  "as can be observed",
];

const PHRASE_REPLACEMENTS: Record<string, string> = {
  "the results show": "the results in this dataset indicate",
  "results indicate": "the computed outcomes for this configuration indicate",
  "it was found that": "the analysis reveals that",
  "is shown in": "is detailed in",
  "is presented in": "is illustrated in",
  "as mentioned earlier": "as established in Section",
};

export function postEnhance(text: string): string {
  let result = text;

  // Remove banned phrases
  BANNED_PHRASES.forEach((phrase) => {
    const regex = new RegExp(phrase, "ig");
    result = result.replace(regex, "");
  });

  // Apply targeted replacements
  Object.entries(PHRASE_REPLACEMENTS).forEach(([original, replacement]) => {
    const regex = new RegExp(original, "ig");
    result = result.replace(regex, replacement);
  });

  // Clean up double spaces from removals
  result = result.replace(/\s{2,}/g, " ").trim();

  return result;
}

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 9: EXPERT DEPTH SIGNAL SCORER
// ─────────────────────────────────────────────────────────────

export function expertDepthScore(text: string): number {
  let score = 0;
  if (/\bbecause\b|\bdue to\b/i.test(text)) score += 10;
  if (/\bhowever\b|\bwhereas\b/i.test(text)) score += 10;
  if (/\bunder (these|this) (constraints|settings|conditions)\b/i.test(text)) score += 10;
  if (/\b\d+(\.\d+)?\b/.test(text)) score += 10;
  if (/\bconsequently\b|\bnotably\b|\bcritically\b/i.test(text)) score += 10;
  if (/\brank reversal\b|\bthreshold\b|\bsensitivity\b/i.test(text)) score += 10;
  if (/\bthis (dataset|configuration|framework|model)\b/i.test(text)) score += 10;
  return score; // Higher = more expert-like
}

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 10: FULL HUMANIZATION PROMPT BUILDER (per section)
// ─────────────────────────────────────────────────────────────

export function buildHumanizationPrompt(
  sectionId: string,
  content: string
): string {
  const sectionRefinement =
    SECTION_REFINEMENT_PROMPTS[sectionId] ||
    SECTION_REFINEMENT_PROMPTS["results"];

  return `
${MASTER_ROLE_PROMPT}

${AI_AWARE_WRITING_PROMPT}

${sectionRefinement}

---
ORIGINAL SECTION CONTENT TO REFINE:

${content}

---
INSTRUCTIONS:
1. Apply ALL rules above to refine the section
2. Preserve all numbers, equations, citations, and method names exactly
3. Replace generic AI-like phrases with specific, data-anchored ones
4. Vary sentence length and structure deliberately
5. Return ONLY the refined section — no preamble, no explanations
`;
}

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 11: SENTENCE-LEVEL REWRITE PROMPT (for Auto-Fix)
// ─────────────────────────────────────────────────────────────

export function buildSentenceRewritePrompt(sentence: string): string {
  return `
Rewrite this academic sentence to reduce AI-like patterns and improve Q1 journal quality.

Original Sentence:
"${sentence}"

Requirements:
- Add causal reasoning (WHY or HOW this occurs)
- Add specificity (numbers, dataset context, conditions if possible)
- Avoid generic phrases (e.g., "this study", "overall", "in conclusion")
- Keep ALL technical meaning, method names, and numerical values unchanged
- Vary sentence structure (do not match the original perfectly)
- Write as a domain expert, not a text generator

Return ONLY the rewritten sentence. No explanation.
`;
}

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 12: EXPORTS SUMMARY
// ─────────────────────────────────────────────────────────────
// Available exports:
//  - MASTER_ROLE_PROMPT           → Core editorial role definition
//  - AI_AWARE_WRITING_PROMPT      → Anti-AI-detection writing rules
//  - SECTION_REFINEMENT_PROMPTS   → Per-section Q1 refinement instructions
//  - detectAISentences()          → Flag AI-like sentences with score
//  - generateSuggestions()        → Per-sentence fix recommendations
//  - getAIRiskLevel()             → "Low" | "Medium" | "High"
//  - getOverallAIRiskFromText()   → Full text AI risk summary
//  - preservationCheck()          → Pre/post number+citation integrity check
//  - postEnhance()                → Remove banned phrases + targeted replacements
//  - expertDepthScore()           → Measure analytical depth of text
//  - buildHumanizationPrompt()    → Full per-section refinement prompt
//  - buildSentenceRewritePrompt() → Single sentence rewrite prompt

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 13: AI CONTENT DETECTION SYSTEM
// (Based on user-provided detection prompt architecture)
// ─────────────────────────────────────────────────────────────

// ── 13a. Core Forensic Detection Prompt ──────────────────────
export const AI_FORENSIC_DETECTION_PROMPT = (text: string): string => `
AI AUTHORSHIP ANALYSIS MODE

You are an expert forensic linguist and AI detection analyst.

TASK:
Evaluate the following academic text and estimate the probability that it was generated by AI.

ANALYSIS CRITERIA:

1. Linguistic Uniformity:
   - Are sentence structures repetitive or overly consistent?

2. Perplexity & Variation:
   - Does the text lack natural variation in tone and phrasing?
   - Does sentence length vary naturally (human "burstiness")?

3. Specificity:
   - Does the text contain concrete data, context, and constraints?
   - Or does it use vague generalizations?

4. Reasoning Depth:
   - Are explanations shallow or deeply analytical?
   - Does the author explain WHY results occur, not just WHAT they are?

5. Human Markers:
   - Presence of nuanced arguments, subtle inconsistencies, or subjective reasoning
   - Dataset-specific anchoring ("among the 8 alternatives evaluated...")
   - Mixed analytical connectors (however, whereas, consequently, critically)

6. AI Markers:
   - Generic phrases: "this study aims", "it is important to note", "overall"
   - Predictable transitions: "furthermore", "moreover", "in conclusion"
   - Overly smooth readability with uniform paragraph structure
   - Passive constructions: "it was found that", "it can be seen"

TEXT TO ANALYZE:
"""
${text.slice(0, 3000)}
"""

OUTPUT FORMAT (STRICT — RETURN EXACTLY THIS):
AI Likelihood: X%
Human Likelihood: Y%
Risk Level: Low

DO NOT explain. DO NOT add any extra sentences. ONLY return the three lines above.
Risk Level must be exactly one of: Low, Medium, High
`;

// ── 13b. Client-side Statistical Analysis ────────────────────

/**
 * Sentence length variance — low variance = AI-like (uniform length)
 * Human writing has high burstiness (varies a lot)
 */
export function computeSentenceVariance(text: string): number {
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);
  if (sentences.length < 2) return 100;
  const lengths = sentences.map((s) => s.trim().split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + (b - avg) ** 2, 0) / lengths.length;
  return Math.round(variance * 10) / 10;
}

/**
 * Lexical diversity (Type-Token Ratio) — low = AI-like (repetitive vocabulary)
 */
export function computeLexicalDiversity(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 1;
  const unique = new Set(words);
  return Math.round((unique.size / words.length) * 100) / 100;
}

// ── 13c. Fusion Model ─────────────────────────────────────────

export interface AIDetectionResult {
  aiPercent: number;
  humanPercent: number;
  risk: "Low" | "Medium" | "High";
  breakdown: {
    llmScore: number;
    statisticalPenalty: number;
    sentenceVariance: number;
    lexicalDiversity: number;
    varianceFlag: boolean;
    diversityFlag: boolean;
  };
}

/**
 * Client-side fusion: combines LLM score with statistical penalties
 */
export function fuseDetectionScore(
  llmScore: number,
  variance: number,
  diversity: number
): AIDetectionResult {
  let score = llmScore;
  const varianceFlag = variance < 20;
  const diversityFlag = diversity < 0.4;
  if (varianceFlag) score += 10;
  if (diversityFlag) score += 10;
  const finalScore = Math.min(100, Math.round(score));
  const humanScore = 100 - finalScore;
  const risk: "Low" | "Medium" | "High" =
    finalScore > 70 ? "High" : finalScore > 40 ? "Medium" : "Low";

  return {
    aiPercent: finalScore,
    humanPercent: humanScore,
    risk,
    breakdown: {
      llmScore,
      statisticalPenalty: finalScore - llmScore,
      sentenceVariance: variance,
      lexicalDiversity: diversity,
      varianceFlag,
      diversityFlag,
    },
  };
}

// ── 13d. Risk Color Mapping ───────────────────────────────────

export const DETECTION_RISK_COLORS = {
  Low: { bg: "#10b98118", border: "#10b98144", text: "#10b981", label: "✅ Low AI Risk" },
  Medium: { bg: "#f59e0b18", border: "#f59e0b44", text: "#f59e0b", label: "⚠️ Medium AI Risk" },
  High: { bg: "#ef444418", border: "#ef444444", text: "#ef4444", label: "🚨 High AI Risk" },
} as const;

// ─────────────────────────────────────────────────────────────
// 🔷 SECTION 14: AUTO-REWRITE & CITATION SAFETY SYSTEM
// Targeted refinement of high-risk sentences with expert validation.
// ─────────────────────────────────────────────────────────────

/**
 * Targeted Rewrite Prompt for High-Risk Sentences.
 */
export function buildTargetedRewritePrompt(sentence: string, score: number): string {
  const strength = score > 70 ? "STRICT REFINEMENT (STRONG)" : "GRADUAL IMPROVEMENT (LIGHT)";
  return `
TARGETED ACADEMIC REFINEMENT MODE (${strength})

You are a senior researcher refining ONLY the specific sentence flagged as high AI-risk.

TASK:
Rewrite ONLY the provided sentence to reduce AI-detection patterns while preserving full academic rigor.

STRICT RULES:
1. DO NOT MODIFY:
   - Equations, formulas, or technical notation
   - Numerical values, statistics, or results
   - Citations (author names, years, DOIs)
   - Method names (AHP, TOPSIS, etc.)

2. PRESERVE MEANING:
   - Keep scientific accuracy 100% intact.

3. IMPROVE:
   - Add analytical reasoning (why/how)
   - Add domain-specific context
   - Replace generic openers with precise academic claims
   - Ensure burstiness (varied sentence length)

INPUT:
Sentence: "${sentence}"

OUTPUT:
Return ONLY the improved sentence.
`;
}

/**
 * Citation Consistency Checker
 */
export function buildCitationMismatchPrompt(original: string, rewritten: string): string {
  return `
CITATION CONSISTENCY ANALYSIS MODE

Compare the original and rewritten text and detect if any citations were broken/removed.
Original: "${original}"
Rewritten: "${rewritten}"

OUTPUT:
Status: VALID / MISMATCH
Issues: [List any changes]
`;
}

/**
 * Final Intelligent Citation-Safe Rewrite Pipeline
 */
export function buildCitationSafePipelinePrompt(sentence: string): string {
  return `
INTELLIGENT CITATION SAFE REWRITE PIPELINE

1. Rewrite the sentence to reduce AI likelihood.
2. Preserve all citations EXACTLY.
3. If a citation is altered, CORRECT it in steps.

STRICT RULES: No meaning change, No number change.

INPUT: "${sentence}"
OUTPUT: Return ONLY the final corrected sentence.
`;
}

/**
 * Safety check for number and citation counts
 */
export function validateRewriteSafety(original: string, rewritten: string): boolean {
  const origNums = (original.match(/\d+/g) || []).length;
  const rewNums = (rewritten.match(/\d+/g) || []).length;
  const origCitations = (original.match(/\(\w+.*?\d{4}\)/g) || []).length;
  const rewCitations = (rewritten.match(/\(\w+.*?\d{4}\)/g) || []).length;
  return origNums === rewNums && origCitations === rewCitations;
}


/**
 * Citation Correction Prompt
 */
export function buildCitationCorrectionPrompt(sentence: string, errorMessage: string, suggestedDoi: string = ""): string {
  return `
CITATION CORRECTION MODE — STRICT ACADEMIC VALIDATION

TASK:
Correct ONLY invalid or mismatched citations in the given sentence using verified academic metadata.

STRICT RULES:
- Do NOT modify scientific meaning.
- Correct author names, year, and APA formatting ONLY.

INPUT:
Sentence: "${sentence}"
Detected Issue: "${errorMessage}"
Suggested DOI (if available): "${suggestedDoi || 'Not provided'}"

OUTPUT:
Return ONLY the corrected sentence. No explanation.
`;
}



