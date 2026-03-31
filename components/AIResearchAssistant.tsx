import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, FileText, X, BookOpen, Lightbulb, Target, TrendingUp, Check, Download, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import {
    MASTER_ROLE_PROMPT,
    AI_AWARE_WRITING_PROMPT,
    SECTION_REFINEMENT_PROMPTS,
    postEnhance,
    preservationCheck,
    getOverallAIRiskFromText,
    computeSentenceVariance,
    computeLexicalDiversity,
    type AIDetectionResult,
    DETECTION_RISK_COLORS,
} from '@/lib/manuscriptPrompts';

interface AIResearchAssistantProps {
    kSensData?: any;
    criterionName?: string;
    variationRange?: string;
    sensitivityData?: any[];
    comparisonData?: any[];
    alternatives: any[];
    criteria: any[];
    method: string;
    weightMethod: string;
    comparisonMethods?: string[];
    comparisonWeightMethod?: string;
    sensitivityMethod?: string;
    sensitivityWeightMethods?: string[];
    spearmanCorrelation?: Record<string, Record<string, number>>;
    kendallTau?: Record<string, Record<string, number>>;
    technicalDepth?: 'standard' | 'mathematical';
    assetLabels?: Record<string, string>;
    markedAssets?: Set<string>;
    onClose?: () => void;
}

// Pre-defined section templates
const SECTION_TEMPLATES = [
    {
        id: 'abstract',
        name: 'Abstract',
        icon: <FileText className="w-4 h-4" />,
        description: 'Phased High-Impact Summary (Novelty focused)',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 250,
        color: 'from-blue-600 to-cyan-600'
    },
    {
        id: 'introduction',
        name: '1. Introduction',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'Problem Urgency & Strategic Novelty',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 1500,
        color: 'from-violet-600 to-purple-600'
    },
    {
        id: 'literature',
        name: '2. Literature Review',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'Bibliometric Trends & Critical Taxonomy',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 2000,
        color: 'from-indigo-600 to-blue-600'
    },
    {
        id: 'methodology',
        name: '3. Methodology',
        icon: <Target className="w-4 h-4" />,
        description: 'Axiomatic Rigor & Mathematical Steps',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 2000,
        color: 'from-emerald-600 to-teal-600'
    },
    {
        id: 'results',
        name: '4. Results & Analysis',
        icon: <TrendingUp className="w-4 h-4" />,
        description: 'Multi-Method Benchmarking & Thresholds',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 2000,
        color: 'from-amber-600 to-orange-600'
    },
    {
        id: 'sensitivity',
        name: '5. Sensitivity Analysis',
        icon: <TrendingUp className="w-4 h-4" />,
        description: 'Robustness Testing & OAT Perturbation',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 1500,
        color: 'from-orange-600 to-red-600'
    },
    {
        id: 'discussion',
        name: '6. Discussion',
        icon: <Lightbulb className="w-4 h-4" />,
        description: 'Managerial Governance & Policy Bridge',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 1800,
        color: 'from-pink-600 to-rose-600'
    },
    {
        id: 'conclusion',
        name: '7. Conclusion',
        icon: <FileText className="w-4 h-4" />,
        description: 'Scientific Contribution & Future Scope',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 800,
        color: 'from-purple-600 to-pink-600'
    },
    {
        id: 'references',
        name: 'References',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'Q1-Standard Clean Bibliography',
        defaultPrompt: 'Generate a professional, vertically ordered References section in APA/IEEE style. Return ONLY the citations.',
        defaultWordCount: 500,
        color: 'from-slate-700 to-gray-800'
    },
    {
        id: 'custom',
        name: 'Custom Section',
        icon: <Sparkles className="w-4 h-4" />,
        description: 'Write your own prompt',
        defaultPrompt: '',
        defaultWordCount: 1000,
        color: 'from-gray-600 to-slate-600'
    }
];

export function AIResearchAssistant({
    kSensData,
    criterionName,
    variationRange,
    sensitivityData,
    comparisonData,
    alternatives,
    criteria,
    method,
    weightMethod,
    comparisonMethods = [],
    comparisonWeightMethod = "",
    sensitivityMethod = "",
    sensitivityWeightMethods = [],
    spearmanCorrelation = {},
    kendallTau = {},
    technicalDepth: technicalDepthProp = 'standard',
    assetLabels,
    markedAssets,
    onClose
}: AIResearchAssistantProps) {
    const [selectedSection, setSelectedSection] = useState('abstract');
    const [customPrompt, setCustomPrompt] = useState('');
    const [wordCount, setWordCount] = useState(300);
    const [additionalContext, setAdditionalContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');

    // ── Manuscript Configuration States ────────────────────────────────────
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [manuscriptConfig, setManuscriptConfig] = useState({
        citations: 35,
        wordLimits: {
            abstract: 300,
            introduction: 1500,
            literature: 2000,
            methodology: 1800,
            results: 2000,
            sensitivity: 1500,
            discussion: 1600,
            conclusion: 800
        }
    });

    const distributeCitations = (total: number) => {
        return {
            introduction: Math.round(total * 0.25),
            literature: Math.round(total * 0.40),
            methodology: Math.round(total * 0.10),
            results: Math.round(total * 0.10),
            discussion: Math.round(total * 0.10),
            conclusion: Math.round(total * 0.05)
        };
    };

    const applyPreset = (type: 'short' | 'standard' | 'high') => {
        if (type === 'short') {
            setManuscriptConfig({
                citations: 20,
                wordLimits: { abstract: 250, introduction: 1000, literature: 1200, methodology: 1200, results: 1200, sensitivity: 1000, discussion: 1000, conclusion: 500 }
            });
        } else if (type === 'standard') {
            setManuscriptConfig({
                citations: 35,
                wordLimits: { abstract: 300, introduction: 1500, literature: 2000, methodology: 1800, results: 2000, sensitivity: 1500, discussion: 1600, conclusion: 800 }
            });
        } else {
            setManuscriptConfig({
                citations: 55,
                wordLimits: { abstract: 350, introduction: 2500, literature: 3500, methodology: 2500, results: 3000, sensitivity: 2000, discussion: 2500, conclusion: 1200 }
            });
        }
    };

    const trackGeminiUsage = (key: string) => {
        if (!key) return;
        const keyId = key.substring(0, 10);
        const statsStr = localStorage.getItem("gemini_usage_stats") || "{}";
        try {
            const stats = JSON.parse(statsStr);
            stats[keyId] = (stats[keyId] || 0) + 1;
            localStorage.setItem("gemini_usage_stats", JSON.stringify(stats));
            localStorage.setItem("gemini_stats_date", new Date().toDateString());
        } catch (e) { }
    };

    // ── Live Citation System ────────────────────────────────────────────────
    const fetchLiveCitations = async (topic: string): Promise<string> => {
        if (!topic || topic.trim().length < 3) return '';
        setIsFetchingCitations(true);
        try {
            const rankingM = selectedRankingMethods.length > 0 ? selectedRankingMethods[0] : method;
            const query = `${topic} ${rankingM} MCDM decision making`;
            const res = await fetch('/api/fetch-citations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, limit: manuscriptConfig.citations }) // LOCK: Fetch exact requested count
            });
            if (!res.ok) return '';
            const data = await res.json();
            setCitationCount(data.count || 0);
            setLiveCitations(data.citationContext || '');
            return data.citationContext || '';
        } catch {
            return '';
        } finally {
            setIsFetchingCitations(false);
        }
    };

    // ── AUTO CITATION VALIDATION CHECKER ───────────────────────────────
    const handleValidateCitations = async (content: string) => {
        if (!content) return;
        setIsValidatingCitations(true);
        setCitationValidation(null);
        try {
            const res = await fetch('/api/validate-citations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content })
            });
            if (!res.ok) return;
            const data = await res.json();
            setCitationValidation(data);
        } catch {
            // Silent fail - validation is non-blocking
        } finally {
            setIsValidatingCitations(false);
        }
    };

    // Full Manuscript States
    const [isProcessingFull, setIsProcessingFull] = useState(false);
    const [fullProgress, setFullProgress] = useState(0);
    const [fullManuscriptData, setFullManuscriptData] = useState<Record<string, string>>({});
    const [manuscriptTitle, setManuscriptTitle] = useState('');
    const [technicalDepth, setTechnicalDepth] = useState<'standard' | 'mathematical'>(technicalDepthProp || 'standard');
    const [computedAssetLabels, setComputedAssetLabels] = useState<Record<string, string>>({});

    // ── Live DOI Tracker States ──────────────────────────────────────────
    const [currentCitationCount, setCurrentCitationCount] = useState(0);
    const [doiTrackerSet, setDoiTrackerSet] = useState<Set<string>>(new Set());

    const extractDOIsFromText = (text: string) => {
        const regex = /\[DOI:(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\]/gi;
        const matches = text.match(regex) || [];
        return matches.map(m => m.replace(/\[DOI:/i, "").replace("]", "").trim().toLowerCase());
    };

    const updateLiveTracker = (newText: string) => {
        const found = extractDOIsFromText(newText);
        setDoiTrackerSet(prev => {
            const next = new Set(prev);
            found.forEach(d => next.add(d));
            setCurrentCitationCount(next.size);
            return next;
        });
    };

    const markedAssetsList = Array.from(markedAssets || []);

    const { tablesCount, diagramsCount, methodsCount, selectedRankingMethods, selectedWeightMethods } = React.useMemo(() => {

        const rankingMethods = markedAssetsList
            .filter(k => k.startsWith('method_'))
            .map(k => k.replace('method_', '').toUpperCase());

        const weightMethods = markedAssetsList
            .filter(k => k.startsWith('weight_method_'))
            .map(k => k.replace('weight_method_', '').toUpperCase());

        let tCount = 0;
        let dCount = 0;

        markedAssetsList.forEach(key => {
            if (key.startsWith('method_') || key.startsWith('weight_method_')) return;

            // Use the computed labels (Badges like "Table 1") for counting
            const label = computedAssetLabels[key] || "";
            if (label.startsWith('Table')) {
                tCount++;
            } else if (label.startsWith('Figure') || label.startsWith('Chart') || label.startsWith('Diagram')) {
                dCount++;
            } else {
                // Technical internal fallback
                const lowKey = key.toLowerCase();
                const isTable = (lowKey.includes('table') || lowKey.includes('matrix') || lowKey.includes('result_data')) && !lowKey.includes('chart');
                const isDiagram = (lowKey.includes('chart') || lowKey.includes('variation') || lowKey.includes('plot') || lowKey.includes('radar')) && !lowKey.includes('table');

                if (isTable) tCount++;
                else if (isDiagram) dCount++;
                else if (lowKey.includes('data') || lowKey.includes('step') || lowKey.includes('overall')) tCount++; // Default most data items to tables
            }
        });

        return {
            tablesCount: tCount,
            diagramsCount: dCount,
            methodsCount: rankingMethods.length + weightMethods.length,
            selectedRankingMethods: rankingMethods,
            selectedWeightMethods: weightMethods
        };
    }, [markedAssets, computedAssetLabels]);
    const [showResult, setShowResult] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Live Citation System state
    const [liveCitations, setLiveCitations] = useState<string>('');
    const [isFetchingCitations, setIsFetchingCitations] = useState(false);
    const [citationCount, setCitationCount] = useState(0);

    // Citation Validation state
    const [isValidatingCitations, setIsValidatingCitations] = useState(false);
    const [citationValidation, setCitationValidation] = useState<{
        summary: { total: number; valid: number; invalid: number; fake: number; passRate: string };
        results: { type: string; doi?: string; author?: string; year?: string; valid: boolean; reason?: string; title?: string; suggestedTitle?: string; suggestedDoi?: string }[];
        output: { author: string; year: string; valid: boolean }[];
        invalidCitations: { author: string; year: string; valid: boolean; reason?: string; suggestedTitle?: string; suggestedDoi?: string }[];
    } | null>(null);

    // AI Detection state
    const [isDetectingAI, setIsDetectingAI] = useState(false);
    const [isFixingAI, setIsFixingAI] = useState(false);
    const [aiDetectionResult, setAiDetectionResult] = useState<AIDetectionResult | null>(null);
    const [aiDetectionError, setAiDetectionError] = useState('');
    const [fixReport, setFixReport] = useState<any>(null);

    const [researchContext, setResearchContext] = useState<any>(null);

    // Load research context from localStorage on mount
    useEffect(() => {
        try {
            const topic = localStorage.getItem("ai_research_topic") || "";
            const gap = localStorage.getItem("ai_research_gap") || "";
            const refs = localStorage.getItem("ai_research_references") || "";
            const defsRaw = localStorage.getItem("ai_criteria_defs");
            const defs = defsRaw ? JSON.parse(defsRaw) : {};

            setResearchContext({
                topic,
                researchGap: gap,
                references: refs,
                criteriaDefs: defs
            });
        } catch (e) {
            console.error("Failed to load research context in AI assistant", e);
        }
    }, []);


    // Compute or sync asset labels
    useEffect(() => {
        if (assetLabels && Object.keys(assetLabels).length > 0) {
            setComputedAssetLabels(assetLabels);
            return;
        }

        // Reconstruct from markedAssets and localStorage
        const labels: Record<string, string> = {};
        let tableCount = 1;
        let figureCount = 1;

        Array.from(markedAssets || []).forEach(key => {
            const savedLabel = localStorage.getItem(`asset_label_${key}`);
            if (savedLabel) {
                labels[key] = savedLabel;
            } else {
                // Fallback naming logic
                if (key.includes('chart') || key.includes('variation') || key.includes('plot') || key.includes('radar') || key.includes('comparison')) {
                    labels[key] = `Figure ${figureCount++}`;
                } else if (key.includes('table') || key.includes('matrix') || key.includes('result')) {
                    labels[key] = `Table ${tableCount++}`;
                } else if (key.startsWith('method_')) {
                    labels[key] = `MCDM Method: ${key.replace('method_', '').toUpperCase()}`;
                } else if (key.startsWith('weight_method_')) {
                    labels[key] = `Weighting Method: ${key.replace('weight_method_', '').toUpperCase()}`;
                } else {
                    labels[key] = `Asset ${tableCount++}`;
                }
            }
        });

        setComputedAssetLabels(labels);
    }, [assetLabels, markedAssets]);

    useEffect(() => {
        if (technicalDepthProp) {
            setTechnicalDepth(technicalDepthProp);
        }
    }, [technicalDepthProp]);

    const currentTemplate = SECTION_TEMPLATES.find(t => t.id === selectedSection) || SECTION_TEMPLATES[0];

    const getBibliometricNovelty = () => {
        const critNames = criteria.map(c => c.name).join(', ');
        const altNames = alternatives.map(a => a.name).join(', ');
        return `Scanning for Literature Gap: Existing MCDM literature heavily focuses on ${method.toUpperCase()} in general contexts. However, applying it to ${altNames} specifically considering ${critNames} remains underexplored. Synthesize this as a 'novel contribution' to the field.`;
    };

    const getFormattedMasterPrompt = (sectionName: string, sectionKey: string) => {
        const dMatrix = kSensData?.results ? JSON.stringify(kSensData.results['0'] || {}, null, 2) : "Check Research Manifest";
        const criteriaDefsText = researchContext?.criteriaDefs
            ? Object.entries(researchContext.criteriaDefs).map(([id, def]) => {
                const cName = criteria.find(c => c.id === id)?.name || id;
                return `${cName}: ${def}`;
            }).join(', ')
            : criteria.map(c => c.name).join(', ');

        const altNames = alternatives.map(a => a.name).join(', ');
        const rankingMethodsUsed = [
            method.toUpperCase(),
            ...(comparisonMethods || [])
        ].filter(Boolean).join(', ');

        const weightMethodsUsed = [
            weightMethod.toUpperCase(),
            ...(sensitivityWeightMethods || [])
        ].filter(Boolean).join(', ');

        const sensResultsText = kSensData?.results ? "Provided in JSON manifest" : "Not provided";

        const isGlobalLiterature = sectionKey === 'introduction' || sectionKey === 'literature';
        const mode = isGlobalLiterature ? 'GLOBAL_LITERATURE' : 'STRICT_COMPUTATIONAL';

        const comparisonMethodsUsed = comparisonMethods && comparisonMethods.length > 0 ? comparisonMethods.join(', ').toUpperCase() : 'None';
        const sensitivityTypeUsed = sensitivityMethod || 'Perturbation Analysis';

        const citationDistribution = distributeCitations(manuscriptConfig.citations);
        const sectionCitations = (citationDistribution as any)[sectionKey] || 0;
        const sectionWordLimit = (manuscriptConfig.wordLimits as any)[sectionKey] || 500;

        return `🧠 REAL-TIME CITATION EMISSION PROTOCOL (STRICT):
* Every time you introduce a new citation:
  1. Add in-text citation: (Author et al., Year)
  2. Immediately append DOI in this exact format: [DOI:10.xxxx/xxxxx]

MANDATORY RULES:
- Target CITATIONS for THIS Section: EXACTLY ${sectionCitations} UNIQUE citations.
- Target TOTAL CITATIONS: EXACTLY ${manuscriptConfig.citations} UNIQUE citations.
- Each citation must include a UNIQUE DOI from the provided list.
- DO NOT repeat DOIs unless the section limit is already met.
- DO NOT skip DOI tagging in [DOI:...] format.

🧠 CITATION CONTROL SYSTEM (STRICT MODE):
Target Total Citations for THIS Section: ${sectionCitations} UNIQUE citations
Target Total Citations for ENTIRE Manuscript: ${manuscriptConfig.citations} UNIQUE citations

MANDATORY RULES:
1. EXACT COUNT RULE:
   - You MUST include EXACTLY ${sectionCitations} UNIQUE citations from the list provided below.
   - You must NOT use fewer than ${sectionCitations}.

2. UNIQUENESS RULE:
   - Each citation must refer to a DIFFERENT paper (unique DOI).
   - Repeated citations for the same paper are allowed only AFTER you have met the ${sectionCitations} unique requirement.

3. REALITY & NO-HALLUCINATION RULE:
   - EVERY citation MUST correspond to a REAL paper with DOI from the provided list.
   - DO NOT fabricate, guess, or use any citation outside the list provided in "VERIFIED LIVE REFERENCES".
   - IF YOU CANNOT FIND ENOUGH PAPERS, STATE SO, but do NOT invent ones.

4. DISTRIBUTION RULE:
   - This section must contain at least ${sectionCitations} UNIQUE in-text citations.
   - No section should be empty.

🔥 MASTER CONTROL PARAMETERS (STRICT):
* Target Word Count: ${sectionWordLimit} words (±5% tolerance)
* Assigned Citation Count: ${sectionCitations} real academic citations
* Total Bibliography Target: ${manuscriptConfig.citations} unique sources

STRICT RULES:
- Do NOT exceed or go below word limits by more than ±5%
- Maintain proportional citation distribution (Target: ${sectionCitations} for this section)
- Use ONLY the provided verified citations.

🔥 SECTION MODE CONTROL:
Mode = ${mode}

RULES:
GLOBAL_LITERATURE MODE:
- Discuss all relevant MCDA methods
- Include AHP, TOPSIS, VIKOR, WASPAS, etc.
- Identify research gaps
- Do NOT restrict to selected methods

STRICT_COMPUTATIONAL MODE:
- ONLY use methods selected by the user
- ONLY use data from decision matrix tables
- DO NOT introduce any new method
- DO NOT discuss unselected techniques

CRITICAL: If any unselected method appears in STRICT mode → REMOVE it.

🔥 METHOD FILTER PROMPT (DYNAMIC): SELECTED METHODS (STRICT USE):
Weight Methods:
${weightMethodsUsed}

Ranking Methods:
${rankingMethodsUsed}

Comparison Methods:
${comparisonMethodsUsed}

Sensitivity Type:
${sensitivityTypeUsed}

STRICT RULE:
Use ONLY above methods in computation sections. Any other method is strictly forbidden.

🎯 FINAL LOGIC (VERY IMPORTANT): 
IF section == Introduction OR Literature:
    allow_all_methods = TRUE
ELSE:
    allow_all_methods = FALSE
    restrict_to_selected = TRUE.

STEP 0: MASTER PROMPT (WITH REAL CITATIONS SYSTEM) (TARGET SECTION: ${sectionName}):

${MASTER_ROLE_PROMPT}

${AI_AWARE_WRITING_PROMPT}

${SECTION_REFINEMENT_PROMPTS[sectionKey] || ''}

You are a world-class academic researcher writing for top-tier Q1 journals (Impact Factor >30, e.g., Nature, Elsevier, IEEE, Springer).

STRICT RULES:
- No generic or AI-like writing — enforce AI_AWARE_WRITING_PROMPT rules above at all times
- Every claim must be supported by a REAL academic citation
- Use only high-quality journal papers (Scopus/WoS indexed)
- Prefer recent papers (2018–2025)
- Avoid fake or hallucinated references
- Write like a domain expert — NOT like an AI text generator

AUTO-CITATION SYSTEM (MANDATORY):
- Insert in-text citations using APA style:
  Example: (Saaty, 1980), (Dwivedi et al., 2025)
- Every major claim MUST include a citation
- Generate a final reference list:
  * Total references: ${manuscriptConfig.citations}
  * APA format
  * Include DOI for each reference
  * Ensure references are REAL and traceable
- Ensure consistency:
  * Every in-text citation must appear in reference list
  * No unused references

INPUT DATA:
- Decision Matrix: ${dMatrix}
- Criteria Definitions: ${criteriaDefsText}
- Alternatives Definitions: ${altNames}
- Weight Methods: ${weightMethodsUsed}
- Ranking Methods: ${rankingMethodsUsed}
- Sensitivity Results: ${sensResultsText}
- Domain: ${researchContext?.topic || "Technical Decision Analysis"}

OUTPUT REQUIREMENTS:
- Scientifically rigorous
- Mathematically grounded where needed
- Critically analytical
- Publication-ready for Q1 (>30 IF)
- LOW AI-detection signature (human expert writing style mandatory)

---
TECHNICAL SECTION INSTRUCTIONS:
`;
    };

    const getDynamicPrompt = (sectionId: string) => {
        const masterPrefix = getFormattedMasterPrompt(sectionId.charAt(0).toUpperCase() + sectionId.slice(1), sectionId);
        const rankingMethodName = selectedRankingMethods.length > 0 ? selectedRankingMethods.join(' and ') : method.toUpperCase();

        const weightMethodName = selectedWeightMethods.length > 0 ? selectedWeightMethods.join(' and ') : weightMethod.toUpperCase();

        const comparisonMethodsList = comparisonMethods && comparisonMethods.length > 0 ? comparisonMethods.join(', ').toUpperCase() : '';
        const hasType1 = sensitivityData && sensitivityData.length > 0;
        const hasType2 = kSensData && kSensData.results;

        let sensitivityStrategyText = "";
        if (hasType1 && hasType2) {
            sensitivityStrategyText = "A dual-stage validation is applied: (Type 1) Methodological Sensitivity via Weight Method Comparison and (Type 2) Data Perturbation Analysis via Criterion Variation.";
        } else if (hasType1) {
            sensitivityStrategyText = "Type 1: Methodological Sensitivity analysis is conducted to test ranking stability across different weighting schemes.";
        } else if (hasType2) {
            sensitivityStrategyText = "Type 2: Data Perturbation Analysis is conducted to determine the impact of criterion fluctuations on the final ranking.";
        }

        const isSpearmanMarked = Array.from(markedAssets || []).some((k: string) => k.includes('spearman') || k.includes('kendall'));
        const spearmanText = isSpearmanMarked
            ? "Statistical validation is performed using Spearman Rank Correlation and Kendall's Tau to ensure ranking consistency between methods."
            : "";

        const mathInstructions = technicalDepth === 'mathematical'
            ? "Include exact mathematical formulas (in LaTeX format) for normalization, weight calculation, and the final aggregation function. Use standard notation like $w_j$, $x_{ij}$, and normalization equations like $\\frac{x_{ij} - min}{max - min}$ for beneficial criteria."
            : "Use professional descriptive text to explain the methodology without heavy mathematical equations.";

        const noveltySuggestion = getBibliometricNovelty();

        let promptBody = "";
        switch (sectionId) {
            case 'abstract':
                const compareMethodsRaw = comparisonData && comparisonData.length > 0
                    ? Object.keys(comparisonData[0]).filter(k => k !== 'alternativeName' && k !== 'Rank')
                    : [];

                // ✅ FIX: Include weight method + comparison methods prop + comparisonData keys
                const allRankingMethods = Array.from(new Set([
                    method.toUpperCase(),
                    ...selectedRankingMethods,
                    ...compareMethodsRaw.map((m: string) => m.toUpperCase()),
                    ...(comparisonMethods || []).map((m: string) => m.toUpperCase())
                ])).filter(Boolean);

                const allWeightMethods = Array.from(new Set([
                    weightMethod.toUpperCase(),
                    ...selectedWeightMethods
                ])).filter(Boolean);

                const sensitivityRangeText = variationRange
                    ? `±${variationRange}%`
                    : (kSensData?.results ? '±50%' : '');

                const allParticipatingMethods = allRankingMethods.join(', ');
                const allWeightMethodsText = allWeightMethods.join(', ');
                const comparisonMethodsText = allRankingMethods.filter(m => m !== method.toUpperCase()).join(', ');

                promptBody = `STEP 1: ABSTRACT: Write a HIGH-IMPACT abstract (250–300 words).

STRUCTURE (STRICT):
- Problem context (3–4 lines)
- Specific research gap (NOT generic)
- Proposed methodology: You MUST explicitly name ALL of the following:
  * PRIMARY RANKING METHOD: ${method.toUpperCase()}
  * WEIGHTING METHOD: ${allWeightMethodsText}
  * COMPARISON/VALIDATION METHODS: ${comparisonMethodsText || 'none specified'}
  * SENSITIVITY ANALYSIS: Data Perturbation Analysis conducted at ${sensitivityRangeText || 'specified variation range'}
- Key numerical/analytical results
- Novel scientific contribution
- Practical/industrial implication

MANDATORY RULES:
- No vague words (e.g., "various", "several")
- Must sound innovative and technical
- Include at least one quantitative insight
- DO NOT INCLUDE ANY CITATIONS (e.g., [1], [2], or author names).
- You MUST explicitly mention: ${method.toUpperCase()}, ${allWeightMethodsText}${comparisonMethodsText ? `, and the comparative validation using ${comparisonMethodsText}` : ''}.
- You MUST mention the sensitivity perturbation range: ${sensitivityRangeText || 'as conducted'}.

FINAL LINE:
Include 5–7 keywords in alphabetical order.`;
                break;

            case 'introduction':
                promptBody = `STEP 2: INTRODUCTION: Write a Q1-level Introduction (1500–1600 words).

STRUCTURE:
- **Section 1.1- Global context (with citations)
- **Section 1.2- Problem definition
- **Section 1.3- Literature limitations
- **Section 1.4- Research gap (bullet points)
- **Section 1.5- Contributions (numbered)

AUTO-CITATION RULES:
- Minimum 12–18 citations
- Use recent Q1 sources from last 6 years till current date.
- Mix classical + recent works

MANDATORY RULES:
- Every paragraph must contain at least 1 citation
- Avoid generic statements
- Address the gap driving the use of ${rankingMethodName} and ${weightMethodName} for evaluating ${alternatives.length} alternatives.

END:
Conclude this section with the exact phrase: "This study proposes..."`;
                break;

            case 'literature':
                promptBody = `STEP 3: LITERATURE REVIEW (GLOBAL LITERATURE MODE): Write a CRITICAL literature review (2000–2100 words).

STRUCTURE:
- **Section 2.1 — Method-based grouping (AHP, SWEI TOPSIS, VIKOR, WASPAS, etc.)
- **Section 2.2 — Comparative analysis
- **Section 2.3 — Emerging trends (AI, GIS, hybrid MCDA)
- **Section 2.4 — Research gaps

AUTO-CITATION RULES:
- Minimum 20–30 citations
- Use high-impact journals
- Include comparative references

MANDATORY RULES:
- Discuss ALL major MCDA methods: AHP, TOPSIS, VIKOR, WASPAS, ELECTRE.
- DO NOT restrict to selected methods here.
- Then identify: WHY selected method (${rankingMethodName}) is better.
- Include comparison table (Method vs Limitations)
- Critically analyze papers (not summary)
- Establish the specific "blind spot" driving this ${rankingMethodName} and ${weightMethodName} study.

END: 
Conclude this section with exactly: "Existing studies fail to..."`;
                break;

            case 'methodology':
                promptBody = `STEP 4: METHODOLOGY (STRICT COMPUTATIONAL MODE): Write a mathematically rigorous Methodology (1500–2200 words).

STRUCTURE (Include the following):
- Decision matrix formulation
- Normalization equations
- Weight calculation equations (${weightMethodName})
- Final ranking model equations (${rankingMethodName})
- Algorithm (stepwise)

AUTO-CITATION RULES:
- Cite original methods where applicable (e.g., AHP (Saaty), SWEI (Dwivedi et al.), WASPAS (Zavadskas)).
- You MUST cite all other active methods (${rankingMethodName}, ${weightMethodName}).

MANDATORY RULES:
- Define ONLY selected methods mathematically.
- DO NOT include other MCDA methods. Use equations only for selected methods. If extra method appears → REMOVE it.
- Define all mathematical variables clearly
- Include precise equations for every calculation step
- Provide step-by-step technical justification
- ${mathInstructions}

FOCUS:
Scientific rigor + exact reproducibility.`;
                break;

            case 'results':
                promptBody = `STEP 5: RESULTS & ANALYSIS (STRICT COMPUTATIONAL MODE): Write a high-impact Results & Analysis section (2000–2200 words).

STRUCTURE (Include the following):
- **Section 5.1 — Ranking results
- **Section 5.2 — Cross-method comparison
- **Section 5.3 — Statistical validation
- **Section 5.4 — Interpretation

AUTO-CITATION RULES:
- Cite comparison studies
- Cite validation methods (Spearman, Kendall)

MANDATORY RULES:
- Use ONLY selected ranking methods.
- Explain results ONLY from computed tables.
- DO NOT mention: AHP, TOPSIS, VIKOR, ELECTRE (if not selected).
- Explain WHY results are correct
- Not just reporting data; critically interpret the outcomes.
- ${spearmanText}

FORBIDDEN:
- DO NOT include a bibliography, reference list, or citations list at the end of this section.
- DO NOT write any concluding remarks about the whole paper.

FOCUS:
Why ranking occurred + Stability of results + Comparison ONLY among selected methods.`;
                break;

            case 'sensitivity':
                promptBody = `STEP 6: SENSITIVITY ANALYSIS: Write a deep sensitivity analysis (1500–1600 words).

STRUCTURE (Include the following):
- Perturbation approach (${sensitivityStrategyText})
- Impact on ranking
- Stability discussion: Discuss how changes in criteria importance affect the strategic ranking for ${criterionName || 'critical criteria'}.

AUTO-CITATION RULES:
- Cite studies on robustness analysis in MCDA

MANDATORY RULES:
- Analytical explanation
- Identify stable solutions and rank reversals.

FORBIDDEN:
- DO NOT include a bibliography, reference list, or citations list at the end of this section.
- STOP writing immediately after the stability discussion.`;
                break;

            case 'discussion':
                promptBody = `STEP 7: DISCUSSION: Write a deep Discussion section (1600–1800 words).

STRUCTURE (Mandatory subsections with numbering):
- **Section 7.1 — Interpretation of Results:** Map findings directly back to the initial research gap. Explain specifically how the ${rankingMethodName} ranking resolves the problem stated in the Introduction.
- **Section 7.2 — Comparison with Existing Literature:** Cite supporting or conflicting studies. Where do this study's findings agree or diverge from prior MCDM research? Use APA citations.
- **Section 7.3 — Managerial & Policy Implications:** What should decision-makers, CEOs, or policy directors DO based on these results? Provide 3–5 concrete, actionable recommendations. State which alternative should be prioritized and WHY. Connect to real-world industrial or organizational decision-making.
- **Section 7.4 — Theoretical Contributions:** How does this study advance the Decision Science body of knowledge? Discuss the scalability of the ${rankingMethodName}-${weightMethodName} framework to other domains or data types (e.g., fuzzy sets, interval-valued criteria, AI-augmented MCDM).

AUTO-CITATION RULES:
- Cite supporting or conflicting studies (minimum 4–6 citations)
- Cite at least 1 policy/managerial application paper

MANDATORY RULES:
- No repetition of Results section content
- Must show deep insight into WHY the ${rankingMethodName} framework yielded these specific outcomes
- Managerial section must be concrete and actionable — NOT generic

FORBIDDEN:
- DO NOT include a bibliography or reference list at the end of this section.`;
                break;

            case 'conclusion':
                promptBody = `STEP 8: CONCLUSION: Write a strong Conclusion (800–1000 words).

STRUCTURE (Include the following):
- Contributions
- Key findings
- Limitations
- Future scope

AUTO-CITATION RULES:
- Optional but include 2–3 references if needed

MANDATORY RULES:
- Clearly state the definitive ranking list and findings without repeating earlier paragraphs word-for-word.

FOCUS:
Impact + future direction.`;
                break;
            case 'references':
                return `STEP 9: FINAL REFERENCES (CRITICAL): Generate a complete reference list.

REQUIREMENTS:
- Strictly up to 50 references (Use ONLY the verified sources provided below)
- APA style
- **SORTING: The entire bibliography MUST be sorted ALPHABETICALLY by the first author's last name (A to Z).**
- **Ensure [1] is the first name alphabetically (e.g., starting with A).**
- Include DOI for each reference
- Years: 2018–2025 (majority) and up to current date
- Journals: Q1, Q2 only

STRICT VALIDATION:
- **ZERO HALLUCINATION MANDATE**: Use ONLY the papers provided in the "VERIFIED LIVE REFERENCES" block.
- **DO NOT INVENT ANY PAPER**. If you reach the end of the provided list, STOP generating.
- All references must correspond to in-text citations from the earlier sections.
- NO FAKE OR PLACEHOLDER REFERENCES. They must be REAL DOIs and REAL papers.

FORMAT:
Author(s). (Year). Title. Journal. Volume(Issue), pages. DOI
Example: [1] Dwivedi, P. P., & Sharma, D. K. (2025). Quantitative assessment of photovoltaic thermal collectors to enhance energy efficiency in the power system by SWEI MCDM method. Renewable and Sustainable Energy Reviews, 217, 115791. https://doi.org/10.1016/j.rser.2025.115791

FORBIDDEN:
- **DO NOT use asterisks (*) or underscores (_) to indicate italics.**
- **DO NOT use any Markdown formatting in the bibliography.**
- **DO NOT include any reference with "Unknown Authors", "No Data", "Anonymous", or "Author Missing".**
- **Every citation MUST have real, fully attributed author names.**
- **Return ONLY clean plain text.**

**ABSOLUTE RULES — NO EXCEPTIONS:**
1. START IMMEDIATELY with the first citation [1], which MUST be the first alphabetically.
2. END IMMEDIATELY after the last citation — do not write any closing paragraph or remark.
3. FORBIDDEN CONTENT: You MUST NOT write any theoretical text, summaries, section headers, or methodology overview. Return ONLY the reference list.`;
            default:
                return '';
        }
        return masterPrefix + promptBody;
    };

    // Update defaults when section changes
    React.useEffect(() => {
        const dynamicPrompt = getDynamicPrompt(selectedSection);
        setCustomPrompt(dynamicPrompt);
        setWordCount(currentTemplate.defaultWordCount);
        setGeneratedContent('');
        setShowResult(false);
        setIsCopied(false);
    }, [selectedSection, method, weightMethod, comparisonMethods, sensitivityMethod, sensitivityWeightMethods, technicalDepth, variationRange]);

    // ── AI Content Detection Handler ────────────────────────────
    const handleDetectAI = async () => {
        if (!generatedContent) return;
        setIsDetectingAI(true);
        setAiDetectionResult(null);
        setAiDetectionError('');
        try {
            const userApiKey = localStorage.getItem('user_gemini_api_key') || '';

            // Client-side statistical pre-analysis
            const variance = computeSentenceVariance(generatedContent);
            const diversity = computeLexicalDiversity(generatedContent);

            const res = await fetch('/api/detect-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: generatedContent, userApiKey }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Detection failed');
            setAiDetectionResult(data);
        } catch (err: any) {
            setAiDetectionError(err.message || 'Detection failed. Please try again.');
        } finally {
            setIsDetectingAI(false);
        }
    };

    const handleFixAI = async () => {
        if (!generatedContent) return;
        setIsFixingAI(true);
        setFixReport(null);
        try {
            const userApiKey = localStorage.getItem('user_gemini_api_key') || '';
            const res = await fetch('/api/fix-ai-sentences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: generatedContent, userApiKey }),
            });
            const data = await res.json();
            if (data.fixedText) {
                setGeneratedContent(data.fixedText);
                setFixReport(data.report);
                // Re-detect AI automatically after fix
                // Small delay to ensure state update if needed
                setTimeout(() => handleDetectAI(), 500);
            }
        } catch (e) {
            console.error("AI fix failed:", e);
        } finally {
            setIsFixingAI(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setShowResult(true);
        setGeneratedContent('');

        try {
            // 🚀 Strictly use the Dynamic Scientific Manifest for the prompt
            const basePrompt = getDynamicPrompt(selectedSection);
            
            // 💡 Add Hidden Backend Logic for strict verification
            const hiddenValidationRule = "\n\nCRITICAL SYSTEM VALIDATION (HIDDEN):\nIf any method (e.g. AHP, PROMETHEE) or table/figure count not explicitly listed in the INPUT appears in your output → this response is considered INVALID. Strictly adhere to the provided assets and methods.";
            
            const finalPrompt = basePrompt + (additionalContext ? `\n\nADDITIONAL USER CONTEXT:\n${additionalContext}` : '') + hiddenValidationRule;
            
            const userApiKey = localStorage.getItem("user_gemini_api_key") || "";

            // 🔗 Fetch live citations before generating this section
            const topic = researchContext?.topic || method;
            const fetchedCitations = await fetchLiveCitations(topic);
            const citationBlock = fetchedCitations
                ? `\n\nVERIFIED LIVE REFERENCES (CrossRef + Semantic Scholar — USE THESE ONLY):\n${fetchedCitations}`
                : '';

            const response = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userApiKey,
                    analysisType: 'custom_section',
                    sectionType: selectedSection,
                    customPrompt: finalPrompt,
                    wordCount: wordCount,
                    kSensData: kSensData,
                    criterionName: criterionName,
                    variationRange: variationRange,
                    sensitivityData: sensitivityData,
                    comparisonData: comparisonData,
                    alternatives: alternatives,
                    criteria: criteria,
                    method: method,
                    assetLabels: Object.keys(computedAssetLabels).length > 0 ? computedAssetLabels : assetLabels,
                    selectedAssets: markedAssets ? Array.from(markedAssets) : [],
                    ranking: kSensData?.results?.['0']
                        ? Object.entries(kSensData.results['0']).map(([altName, score]: [string, any]) => ({
                            alternativeName: altName,
                            score: typeof score === 'number' ? score : 0
                        })).sort((a, b) => b.score - a.score)
                        : [],
                    researchContext: researchContext,
                    isLastSection: selectedSection === 'references',
                    additionalContext: (additionalContext || '') + citationBlock
                })
            });

            const result = await response.json();
            if (response.ok) {
                trackGeminiUsage(userApiKey);
            }
            // 🔷 AUTO POST-ENHANCEMENT: Remove banned phrases, replace generic patterns
            const rawContent = result.markdown || result.error || 'Failed to generate content';
            const enhancedContent = rawContent.startsWith('Error') || rawContent.startsWith('Failed')
                ? rawContent
                : postEnhance(rawContent);
            setGeneratedContent(enhancedContent);
        } catch (error) {
            setGeneratedContent('Error: Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateFullManuscript = async () => {
        setIsProcessingFull(true);
        setFullProgress(0);
        setGeneratedContent('');
        setManuscriptTitle('');
        const results: Record<string, string> = {};

        const sectionsToGenerate = SECTION_TEMPLATES.filter(s => s.id !== 'custom');

        try {
            const userApiKey = localStorage.getItem("user_gemini_api_key") || "";

            // 🔗 STEP: Fetch live citations ONCE before the entire manuscript run
            setFullProgress(3);
            const topic = researchContext?.topic || method;
            const fetchedCitations = await fetchLiveCitations(topic);
            const citationBlock = fetchedCitations
                ? `\nVERIFIED LIVE REFERENCES (CrossRef + Semantic Scholar — USE THESE ONLY):\n${fetchedCitations}`
                : '';

            // Step 0: Generate Title
            setFullProgress(5);
            const titleResponse = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userApiKey,
                    analysisType: 'manuscript_title',
                    alternatives,
                    criteria,
                    method,
                    ranking: kSensData?.results?.['0']
                        ? Object.entries(kSensData.results['0']).map(([altName, score]: [string, any]) => ({
                            alternativeName: altName,
                            score: typeof score === 'number' ? score : 0
                        })).sort((a, b) => b.score - a.score)
                        : [],
                    researchContext: researchContext
                })
            });
            const titleData = await titleResponse.json();
            if (titleResponse.ok) {
                trackGeminiUsage(userApiKey);
            }
            const generatedTitle = (titleData.markdown || "Technical Analysis of Decision Criteria").replace(/[#*]/g, '').trim();
            setManuscriptTitle(generatedTitle);

            for (let i = 0; i < sectionsToGenerate.length; i++) {
                const section = sectionsToGenerate[i];
                setFullProgress(10 + Math.round((i / sectionsToGenerate.length) * 90));

                const citationDistribution = distributeCitations(manuscriptConfig.citations);
                const assignedCitations = (citationDistribution as any)[section.id] || 0;
                const assignedWordCount = (manuscriptConfig.wordLimits as any)[section.id] || section.defaultWordCount;

                const response = await fetch('/api/ai-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userApiKey,
                        analysisType: 'custom_section',
                        sectionType: section.id,
                        customPrompt: getDynamicPrompt(section.id) + `\nCRITICAL CONSTRAINTS: Target Word Count: ${assignedWordCount}. Target Citations: ${assignedCitations}. Start writing technical content DIRECTLY. Do NOT include any section titles, numbers, or headings at the start of your response. This is part of a professional research paper; ensure it flows naturally without repeating headers.`,
                        wordCount: assignedWordCount,
                        additionalContext: (additionalContext || '') + citationBlock + (i > 0 ? " Previous section context: " + results[sectionsToGenerate[i - 1].id]?.substring(0, 500) : ""),
                        kSensData,
                        criterionName,
                        variationRange,
                        sensitivityData,
                        comparisonData,
                        alternatives,
                        criteria,
                        method,
                        assetLabels: Object.keys(computedAssetLabels).length > 0 ? computedAssetLabels : assetLabels,
                        selectedAssets: markedAssets ? Array.from(markedAssets) : [],
                        ranking: kSensData?.results?.['0']
                            ? Object.entries(kSensData.results['0']).map(([altName, score]: [string, any]) => ({
                                alternativeName: altName,
                                score: typeof score === 'number' ? score : 0
                            })).sort((a, b) => b.score - a.score)
                            : [],
                        researchContext: researchContext,
                        isLastSection: i === sectionsToGenerate.length - 1
                    })
                });

                const result = await response.json();
                if (response.ok) {
                    trackGeminiUsage(userApiKey);
                }
                const sectionContent = result.markdown || "Section generation failed.";
                results[section.id] = sectionContent;
                
                // 📊 Real-time DOI Extraction and Tracker Update
                updateLiveTracker(sectionContent);
            }

            setFullManuscriptData(results);
            setFullProgress(100);

            // Auto-assemble the content for display
            const assembled = [
                `# ${generatedTitle}`,
                ...sectionsToGenerate.map(s => `## ${s.name}\n\n${results[s.id]}`)
            ].join('\n\n');

            setGeneratedContent(assembled);
            setShowResult(true);
            setSelectedSection('abstract');
        } catch (error) {
            console.error("Full manuscript error:", error);
            alert("An error occurred while generating the full manuscript. Please try again.");
        } finally {
            setIsProcessingFull(false);
        }
    };

    const handleDownloadDocx = async (contentInput?: string, titleInput?: string) => {
        const content = contentInput || generatedContent;
        if (!content) return;

        // Helper to parse bold markdown and return TextRun array
        const parseMarkdownToRuns = (text: string) => {
            const parts = text.split(/(\*\*.*?\*\*)/g);
            return parts.map(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return new TextRun({
                        text: part.slice(2, -2),
                        bold: true,
                        size: 24,
                        font: "Times New Roman"
                    });
                }
                return new TextRun({
                    text: part,
                    size: 24,
                    font: "Times New Roman"
                });
            });
        };

        try {
            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: (titleInput || manuscriptTitle || "RESEARCH MANUSCRIPT").toUpperCase(),
                                        bold: true,
                                        size: 24, // 12pt
                                        font: "Times New Roman"
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 400 },
                            }),
                            ...content.split('\n').filter(line => line.trim() !== '---').map(line => {
                                const cleanLine = line.trim();
                                if (!cleanLine) return new Paragraph({ spacing: { after: 120 } });

                                // Placeholder check
                                if (cleanLine.startsWith('[Insert') && cleanLine.endsWith('here]')) {
                                    return new Paragraph({
                                        children: [new TextRun({
                                            text: cleanLine,
                                            italics: true,
                                            size: 20, // 10pt
                                            font: "Times New Roman",
                                            color: "555555"
                                        })],
                                        alignment: AlignmentType.CENTER,
                                        spacing: { before: 240, after: 240 }
                                    });
                                }

                                if (cleanLine.startsWith('# ')) {
                                    return new Paragraph({
                                        children: [new TextRun({ text: cleanLine.replace('# ', '').toUpperCase(), bold: true, size: 24, font: "Times New Roman" })],
                                        heading: HeadingLevel.HEADING_1,
                                        spacing: { before: 240, after: 120 }
                                    });
                                }
                                if (cleanLine.startsWith('## ')) {
                                    return new Paragraph({
                                        children: [new TextRun({ text: cleanLine.replace('## ', ''), bold: true, size: 24, font: "Times New Roman" })],
                                        heading: HeadingLevel.HEADING_2,
                                        spacing: { before: 200, after: 100 }
                                    });
                                }
                                if (cleanLine.startsWith('### ')) {
                                    return new Paragraph({
                                        children: [new TextRun({ text: cleanLine.replace('### ', ''), bold: true, size: 24, font: "Times New Roman" })],
                                        heading: HeadingLevel.HEADING_3,
                                        spacing: { before: 160, after: 80 }
                                    });
                                }

                                // Handling bullet points
                                if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
                                    return new Paragraph({
                                        children: parseMarkdownToRuns(cleanLine.substring(2)),
                                        bullet: { level: 0 },
                                        spacing: { after: 120 }
                                    });
                                }

                                return new Paragraph({
                                    children: parseMarkdownToRuns(cleanLine),
                                    spacing: { after: 200 },
                                    alignment: AlignmentType.JUSTIFIED
                                });
                            }),
                        ],
                    },
                ],
            });

            const blob = await Packer.toBlob(doc);
            const fileName = titleInput ? `Full_Research_Manuscript.docx` : `Research_Manuscript_${currentTemplate.id}.docx`;
            saveAs(blob, fileName);
        } catch (error) {
            console.error("Error generating docx:", error);
            alert("Failed to generate Word document. Please try again.");
        }
    };

    return (
        <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-600" />
                            AI Research Assistant
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                            Generate any section of your research paper with AI assistance
                        </CardDescription>
                    </div>
                    {onClose && (
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Marked Assets Summary */}
                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-900">Marked for AI:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {methodsCount > 0 && (
                            <span className="bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-700 font-semibold shadow-sm flex items-center gap-1.5">
                                <Cpu className="w-3 h-3" /> {methodsCount} Methods
                            </span>
                        )}
                        {tablesCount > 0 && (
                            <span className="bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-700 font-semibold shadow-sm flex items-center gap-1.5">
                                <FileText className="w-3 h-3" /> {tablesCount} Tables
                            </span>
                        )}
                        {diagramsCount > 0 && (
                            <span className="bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-700 font-semibold shadow-sm flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3" /> {diagramsCount} Diagrams
                            </span>
                        )}
                        {methodsCount === 0 && tablesCount === 0 && diagramsCount === 0 && (
                            <span className="text-indigo-400 italic">No assets marked yet - the AI will use default selection</span>
                        )}
                    </div>
                    {/* Live Citation System Status Badge */}
                    <div className="w-full flex items-center gap-2 mt-1">
                        {isFetchingCitations ? (
                            <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md font-medium animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                                Fetching live Q1 citations from CrossRef & Semantic Scholar...
                            </span>
                        ) : citationCount > 0 ? (
                            <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                🔗 {citationCount} verified live references loaded (CrossRef + Semantic Scholar)
                            </span>
                        ) : (
                            <span className="text-[11px] text-gray-400 italic">Live citations will be fetched automatically when you generate a section.</span>
                        )}
                    </div>
                    <p className="w-full text-[11px] text-indigo-600 font-medium italic">
                        The AI will synthesize descriptions ONLY for marked methods and reference ONLY checked tables/diagrams.
                    </p>
                </div>

                {/* Section Selector */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Select Section Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {SECTION_TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedSection(template.id)}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${selectedSection === template.id
                                    ? `bg-gradient-to-r ${template.color} text-white border-transparent shadow-md`
                                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {template.icon}
                                    <span className="font-semibold text-xs">{template.name}</span>
                                </div>
                                <p className={`text-[10px] leading-tight ${selectedSection === template.id ? 'text-white/90' : 'text-gray-500'
                                    }`}>
                                    {template.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Word Count */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Target Word Count</Label>
                    <div className="flex items-center gap-4">
                        <Input
                            type="number"
                            value={wordCount}
                            onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
                            min={100}
                            max={10000}
                            step={100}
                            className="w-32 h-10"
                        />
                        <span className="text-sm text-gray-600">
                            words (100-10000)
                        </span>
                    </div>
                </div>

                {/* Technical Depth & Novelty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-violet-50/50 p-4 rounded-xl border border-violet-100">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-violet-900 uppercase tracking-wider flex items-center gap-2">
                            <Cpu className="w-3 h-3" /> Technical Depth
                        </Label>
                        <Select value={technicalDepth} onValueChange={(v: any) => setTechnicalDepth(v)}>
                            <SelectTrigger className="h-9 text-xs bg-white border-violet-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard" className="text-xs">Standard (Descriptive)</SelectItem>
                                <SelectItem value="mathematical" className="text-xs">Mathematical (LaTeX Formulas)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-violet-600 italic">Determines if rigorous equations are included.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-violet-900 uppercase tracking-wider flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" /> Literature Novelty
                        </Label>
                        <div className="p-2 bg-white rounded border border-violet-200 text-[10px] text-gray-700 leading-tight">
                            {getBibliometricNovelty().replace('Scanning for Literature Gap: ', '')}
                        </div>
                    </div>
                </div>

                {/* 🚀 New Scientific Manifest UI — Replaces the old Generation Instructions block */}
                <div className="space-y-4 bg-white border-2 border-indigo-50 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                        <Label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                             🔥 GENERATION INSTRUCTIONS (STRICT MODE)
                        </Label>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Active Manuscript Engine
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Selected Methods Column */}
                        <div className="space-y-3">
                            <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Cpu className="w-3 h-3 text-indigo-400" /> Selected Methods
                            </h5>
                            <div className="space-y-2 text-xs">
                                <div>
                                    <span className="text-gray-500 mr-2">Weight:</span>
                                    <span className="font-bold text-indigo-700">{(selectedWeightMethods.length > 0 ? selectedWeightMethods.join(', ') : weightMethod.toUpperCase()) || 'Default'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 mr-2">Primary Ranking:</span>
                                    <span className="font-bold text-indigo-700">{(selectedRankingMethods.length > 0 ? selectedRankingMethods.join(', ') : method.toUpperCase()) || 'Default'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 mr-2">Comparison:</span>
                                    <span className="font-bold text-indigo-700">{comparisonMethods && comparisonMethods.length > 0 ? comparisonMethods.join(', ').toUpperCase() : 'None Marked'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 mr-2">Sensitivity:</span>
                                    <span className="font-bold text-indigo-700">{sensitivityMethod || 'Perturbation Analysis'} (±{variationRange || '30'}%)</span>
                                </div>
                            </div>
                        </div>

                        {/* Computed Output Column (Asset Manifest) */}
                        <div className="space-y-3">
                            <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3 text-emerald-400" /> Computed Output (Auto-Generated)
                            </h5>
                            <div className="p-3 bg-indigo-50/30 rounded-lg border border-indigo-100/50 space-y-2 text-xs">
                                <div className="flex justify-between items-center bg-white p-1 px-2 rounded border border-indigo-50">
                                    <span className="text-gray-600 font-medium">Tables</span>
                                    <span className="font-mono font-bold text-indigo-600">
                                        W:{markedAssetsList.filter((k: string) => k.includes('weight') && (computedAssetLabels[k]?.startsWith('Table') || k.includes('table'))).length} | 
                                        R:{markedAssetsList.filter((k: string) => k.startsWith('method_') && (computedAssetLabels[k]?.startsWith('Table') || k.includes('table'))).length} | 
                                        C:{markedAssetsList.filter((k: string) => k.includes('comparison') && (computedAssetLabels[k]?.startsWith('Table') || k.includes('table'))).length} | 
                                        S:{markedAssetsList.filter((k: string) => (k.includes('sensitivity') || k.includes('variation')) && (computedAssetLabels[k]?.startsWith('Table') || k.includes('table'))).length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-1 px-2 rounded border border-indigo-50">
                                    <span className="text-gray-600 font-medium">Figures</span>
                                    <span className="font-mono font-bold text-indigo-600">
                                        W:{markedAssetsList.filter((k: string) => k.includes('weight') && (computedAssetLabels[k]?.startsWith('Figure') || k.includes('chart') || k.includes('plot'))).length} | 
                                        R:{markedAssetsList.filter((k: string) => k.startsWith('method_') && (computedAssetLabels[k]?.startsWith('Figure') || k.includes('chart') || k.includes('plot'))).length} | 
                                        C:{markedAssetsList.filter((k: string) => k.includes('comparison') && (computedAssetLabels[k]?.startsWith('Figure') || k.includes('chart') || k.includes('plot'))).length} | 
                                        S:{markedAssetsList.filter((k: string) => (k.includes('sensitivity') || k.includes('variation')) && (computedAssetLabels[k]?.startsWith('Figure') || k.includes('chart') || k.includes('plot'))).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-indigo-50/50">
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1 uppercase tracking-wide">
                                ⚠️ RULES
                            </span>
                            <ul className="text-[10px] text-gray-500 space-y-0.5 leading-tight">
                                <li>• Use ONLY selected methods</li>
                                <li>• Do NOT introduce new methods</li>
                                <li>• Interpret precomputed results (no recalculation)</li>
                                <li>• Maintain exact consistency with tables & figures</li>
                            </ul>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 uppercase tracking-wide">
                                📄 STRUCTURE
                            </span>
                            <ul className="text-[10px] text-gray-500 space-y-0.5 leading-tight">
                                <li>• Problem context (3–4 lines)</li>
                                <li>• Specific research gap (non-generic)</li>
                                <li>• Methodology consistency across sections</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Additional Context */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                        Additional Context (Optional)
                    </Label>
                    <Textarea
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        placeholder="Add any additional context like specific citations, domain knowledge, or special requirements..."
                        className="min-h-[80px] text-sm"
                    />
                    <p className="text-xs text-gray-500">
                        Provide domain-specific details, citations, or any other context to improve quality.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || isProcessingFull || !customPrompt}
                        className={`flex-1 h-12 text-sm font-semibold bg-gradient-to-r ${currentTemplate.color} hover:opacity-90 text-white shadow-lg`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating {wordCount} words...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate {currentTemplate.name}
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={() => setShowConfigModal(true)}
                        disabled={isGenerating || isProcessingFull}
                        variant="outline"
                        className="flex-1 h-12 text-sm font-bold border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 shadow-md"
                    >
                        {isProcessingFull ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="flex items-center justify-between w-full mb-1">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span className="text-[10px]">Writing ({fullProgress}%)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-bold">
                                        📚 {currentCitationCount} / {manuscriptConfig.citations} citations
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden flex">
                                    <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${fullProgress}%` }} />
                                    <div className="bg-emerald-500 h-full opacity-50 transition-all duration-1000 ml-[-100%]" style={{ width: `${(currentCitationCount / manuscriptConfig.citations) * 100}%` }} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <BookOpen className="w-4 h-4 mr-2" />
                                🚀 Generate Full Manuscript
                            </>
                        )}
                    </Button>
                </div>

                {/* Manuscript Configuration Modal */}
                {showConfigModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-lg shadow-2xl border-2 border-indigo-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                            <CardHeader className="bg-indigo-600 text-white pb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-indigo-100" />
                                        <CardTitle className="text-xl">📄 Manuscript Configuration</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setShowConfigModal(false)} className="text-white hover:bg-indigo-700 h-8 w-8 p-0">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <CardDescription className="text-indigo-100 mt-1">Set your technical word limits and citation targets</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5 bg-white">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            🔢 Number of Citations
                                            <span className="text-[10px] font-normal text-gray-400 font-sans tracking-normal">(Target: {manuscriptConfig.citations} verified DOIs)</span>
                                        </Label>
                                        <Input
                                            type="number"
                                            value={manuscriptConfig.citations}
                                            onChange={(e) => setManuscriptConfig({ ...manuscriptConfig, citations: parseInt(e.target.value) || 0 })}
                                            className="h-10 border-indigo-100 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div className="col-span-2 pt-2 border-t border-gray-100">
                                        <Label className="text-sm font-bold text-gray-700 block mb-3">📝 Section Word Limits</Label>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                            {Object.entries(manuscriptConfig.wordLimits).map(([section, count]) => (
                                                <div key={section} className="flex flex-col gap-1">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 leading-none">{section}</span>
                                                    <Input
                                                        type="number"
                                                        value={count}
                                                        onChange={(e) => setManuscriptConfig({
                                                            ...manuscriptConfig,
                                                            wordLimits: { ...manuscriptConfig.wordLimits, [section]: parseInt(e.target.value) || 0 }
                                                        })}
                                                        className="h-8 text-xs border-gray-100"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <Label className="text-[11px] font-bold text-indigo-900/60 uppercase tracking-widest">⚡ Quick Presets</Label>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => applyPreset('short')} className="flex-1 text-[11px] h-8 border-indigo-100 text-indigo-600 hover:bg-indigo-50">Short Paper</Button>
                                        <Button variant="outline" size="sm" onClick={() => applyPreset('standard')} className="flex-1 text-[11px] h-8 border-indigo-100 text-indigo-600 hover:bg-indigo-50">Standard Q1</Button>
                                        <Button variant="outline" size="sm" onClick={() => applyPreset('high')} className="flex-1 text-[11px] h-8 border-indigo-100 text-indigo-600 hover:bg-indigo-50">High Impact</Button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-sm font-semibold h-11 border-gray-200 text-gray-600"
                                        onClick={() => {
                                            applyPreset('standard');
                                            setShowConfigModal(false);
                                            handleGenerateFullManuscript();
                                        }}
                                    >
                                        Use Default
                                    </Button>
                                    <Button
                                        className="flex-1 text-sm font-bold h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                                        onClick={() => {
                                            if (manuscriptConfig.citations >= 10 && manuscriptConfig.citations <= 100) {
                                                setShowConfigModal(false);
                                                handleGenerateFullManuscript();
                                            } else {
                                                alert("Citations must be between 10 and 100 for academic rigor.");
                                            }
                                        }}
                                    >
                                        Generate Manuscript 🚀
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Generated Content Display */}
                {showResult && (
                    <div className="mt-6 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                {currentTemplate.icon}
                                {fullProgress === 100 && Object.keys(fullManuscriptData).length > 0
                                    ? "Complete Research Manuscript"
                                    : `Generated ${currentTemplate.name}`}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                {fullProgress === 100 && Object.keys(fullManuscriptData).length > 0 && (
                                    <Button
                                        onClick={() => handleDownloadDocx(undefined, "Full Research Manuscript")}
                                        variant="default"
                                        size="sm"
                                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download Full Paper (.docx)
                                    </Button>
                                )}
                                <Button
                                    onClick={() => handleDownloadDocx()}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Word (.docx)
                                </Button>
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedContent);
                                        setIsCopied(true);
                                        setTimeout(() => setIsCopied(false), 2000);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 text-xs ${isCopied ? 'border-blue-500 text-blue-600' : ''}`}
                                >
                                    {isCopied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1 text-blue-600" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            📋 Copy
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => handleValidateCitations(generatedContent)}
                                    disabled={isValidatingCitations || !generatedContent || isGenerating}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5"
                                >
                                    {isValidatingCitations ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Validating...</>
                                    ) : (
                                        <>🔍 Validate Citations</>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleDetectAI}
                                    disabled={isDetectingAI || !generatedContent || isGenerating}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center gap-1.5"
                                >
                                    {isDetectingAI ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting...</>
                                    ) : (
                                        <>🤖 Check AI Content</>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="prose prose-sm max-w-none bg-white p-8 rounded shadow-inner border border-gray-100"
                            style={{
                                fontFamily: "'Times New Roman', Times, serif",
                                textAlign: 'justify'
                            }}>
                            {isGenerating ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                                </div>
                            ) : (
                                <div className="text-[16px] leading-[1.6] text-black research-article-view font-['Times_New_Roman',serif]">
                                    <ReactMarkdown components={{
                                        p: ({ node, ...props }) => {
                                            const content = Array.isArray(props.children) ? props.children.join('') : String(props.children);
                                            if (content.startsWith('[Insert') && content.endsWith('here]')) {
                                                return <div className="italic text-center text-blue-800 bg-blue-50/50 py-4 my-6 rounded-lg border-2 border-dashed border-blue-200 font-sans text-sm">{content}</div>;
                                            }
                                            return <p className="mb-6 leading-relaxed text-justify" {...props} />;
                                        },
                                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-center uppercase mb-8 mt-4 tracking-tight" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-5 mt-10 border-b border-gray-100 pb-2" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-4 mt-8" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="font-bold text-black" {...props} />,
                                    }}>
                                        {generatedContent}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>

                        {/* Citation Validation Results Panel */}
                        {citationValidation && (
                            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h4 className="text-sm font-bold text-emerald-900">🔍 Citation Validation Report</h4>
                                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">✅ {citationValidation.results.filter(r => r.valid && r.type === "doi").length} Validated DOIs</span>
                                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-300">❌ {citationValidation.summary.invalid} Invalid</span>
                                        {citationValidation.summary.fake > 0 && (
                                            <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full border border-orange-300">⚠️ {citationValidation.summary.fake} Fake</span>
                                        )}
                                        <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-300">Target: {manuscriptConfig.citations} refs</span>
                                    </div>
                                </div>

                                {/* APA Author/Year Results */}
                                {citationValidation.output && citationValidation.output.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-600 mb-1.5">📖 In-Text APA Citations (Author, Year)</p>
                                        <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                                            {citationValidation.output.map((r, i) => {
                                                const detail = citationValidation.results.find(d => d.type === "author" && d.author === r.author && d.year === r.year);
                                                return (
                                                    <div key={i} className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg border ${r.valid ? 'bg-white border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                                        <span className="flex-shrink-0 mt-0.5">{r.valid ? '✅' : '❌'}</span>
                                                        <div className="min-w-0 flex-1">
                                                            <span className="font-semibold text-gray-800">({r.author}, {r.year})</span>
                                                            {r.valid && detail?.suggestedTitle && <span className="ml-2 text-gray-500 text-[11px]">— {detail.suggestedTitle}</span>}
                                                            {!r.valid && detail?.reason && <span className="ml-2 italic text-red-700 text-[11px]">{detail.reason}</span>}
                                                            {!r.valid && detail?.suggestedDoi && (
                                                                <span className="ml-2 text-blue-600 text-[11px]">→ Suggested: <a href={`https://doi.org/${detail.suggestedDoi}`} target="_blank" rel="noreferrer" className="underline">{detail.suggestedDoi}</a></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* DOI Results */}
                                {citationValidation.results.filter(r => r.type === "doi").length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-600 mb-1.5">🔗 DOI Validation</p>
                                        <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                                            {citationValidation.results.filter(r => r.type === "doi").map((r, i) => (
                                                <div key={i} className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg border ${r.valid ? 'bg-white border-emerald-200 text-gray-700' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                    <span className="mt-0.5 flex-shrink-0">{r.valid ? '✅' : '❌'}</span>
                                                    <div className="min-w-0">
                                                        <span className="font-mono font-semibold break-all">{r.doi}</span>
                                                        {r.valid && r.title && <span className="ml-2 text-gray-500">— {r.title} ({r.year})</span>}
                                                        {!r.valid && r.reason && <span className="ml-2 italic">{r.reason}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {citationValidation.results.length === 0 && (
                                    <p className="text-xs text-emerald-700 italic">No citations detected. Ensure the AI included APA-style citations like (Author, 2025) and DOI links.</p>
                                )}
                            </div>
                        )}

                        {/* ── AI Content Detection Result Panel ── */}
                        {(aiDetectionResult || aiDetectionError) && (
                            <div
                                className="mt-4 rounded-xl border p-5 space-y-4"
                                style={{
                                    background: aiDetectionResult
                                        ? DETECTION_RISK_COLORS[aiDetectionResult.risk].bg
                                        : '#fef2f2',
                                    borderColor: aiDetectionResult
                                        ? DETECTION_RISK_COLORS[aiDetectionResult.risk].border
                                        : '#fecaca',
                                }}
                            >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h4 className="text-sm font-bold"
                                        style={{ color: aiDetectionResult ? DETECTION_RISK_COLORS[aiDetectionResult.risk].text : '#ef4444' }}
                                    >
                                        🤖 AI Content Detection Report
                                    </h4>
                                    {aiDetectionResult && (
                                        <div className="flex items-center gap-2">
                                            {aiDetectionResult.risk !== 'Low' && (
                                                <Button
                                                    onClick={handleFixAI}
                                                    disabled={isFixingAI || isGenerating}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold bg-white text-purple-700 hover:bg-purple-50 border border-purple-200 flex items-center gap-1 shadow-sm"
                                                >
                                                    {isFixingAI ? (
                                                        <><Loader2 className="w-3 h-3 animate-spin" /> Fixing...</>
                                                    ) : (
                                                        <>🤖 Fix High-Risk Sentences</>
                                                    )}
                                                </Button>
                                            )}
                                            <span
                                                className="text-xs font-bold px-3 py-1 rounded-full border"
                                                style={{
                                                    color: DETECTION_RISK_COLORS[aiDetectionResult.risk].text,
                                                    borderColor: DETECTION_RISK_COLORS[aiDetectionResult.risk].border,
                                                    background: DETECTION_RISK_COLORS[aiDetectionResult.risk].bg,
                                                }}
                                            >
                                                {DETECTION_RISK_COLORS[aiDetectionResult.risk].label}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {fixReport && (
                                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-800 animate-in fade-in slide-in-from-top-1 duration-500">
                                        <p className="font-bold mb-1 flex items-center gap-1.5">
                                            ✨ Auto-Fix Complete
                                        </p>
                                        <div className="flex gap-4">
                                            <span>Flagged: <b>{aiDetectionResult && aiDetectionResult.breakdown.llmScore > 50 ? 'Multiple' : 'High-risk'}</b></span>
                                            <span>Fixed: <b>{fixReport.length}</b> sentences</span>
                                            <span className="text-emerald-600 font-medium italic">Detection score updated below ↓</span>
                                        </div>
                                    </div>
                                )}

                                {aiDetectionError && (
                                    <p className="text-xs text-red-600">❌ {aiDetectionError}</p>
                                )}

                                {aiDetectionResult && (
                                    <>
                                        {/* Score Bars */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* AI Score */}
                                            <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold text-gray-600">🤖 AI Likelihood</span>
                                                    <span className="text-lg font-extrabold"
                                                        style={{ color: DETECTION_RISK_COLORS[aiDetectionResult.risk].text }}
                                                    >
                                                        {aiDetectionResult.aiPercent}%
                                                    </span>
                                                </div>
                                                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${aiDetectionResult.aiPercent}%`,
                                                            background: DETECTION_RISK_COLORS[aiDetectionResult.risk].text,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {/* Human Score */}
                                            <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold text-gray-600">✍️ Human Likelihood</span>
                                                    <span className="text-lg font-extrabold text-emerald-600">
                                                        {aiDetectionResult.humanPercent}%
                                                    </span>
                                                </div>
                                                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                                                        style={{ width: `${aiDetectionResult.humanPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Statistical Breakdown */}
                                        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                                            <p className="text-xs font-bold text-gray-600 mb-2">📊 Statistical Analysis</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">LLM Forensic Score</span>
                                                    <span className="font-semibold text-gray-800">{aiDetectionResult.breakdown.llmScore}%</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Statistical Penalty</span>
                                                    <span className={`font-semibold ${aiDetectionResult.breakdown.statisticalPenalty > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                        +{aiDetectionResult.breakdown.statisticalPenalty}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Sentence Variance</span>
                                                    <span className={`font-semibold ${aiDetectionResult.breakdown.varianceFlag ? 'text-orange-600' : 'text-emerald-600'}`}>
                                                        {aiDetectionResult.breakdown.sentenceVariance}
                                                        {aiDetectionResult.breakdown.varianceFlag && ' ⚠️'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Lexical Diversity</span>
                                                    <span className={`font-semibold ${aiDetectionResult.breakdown.diversityFlag ? 'text-orange-600' : 'text-emerald-600'}`}>
                                                        {aiDetectionResult.breakdown.lexicalDiversity}
                                                        {aiDetectionResult.breakdown.diversityFlag && ' ⚠️'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tips based on risk */}
                                        <div className="text-xs space-y-1">
                                            {aiDetectionResult.risk === 'High' && (
                                                <>
                                                    <p className="font-semibold text-red-700">🔴 High Risk — Action Required:</p>
                                                    <p className="text-gray-600">• Manually rewrite Abstract, Introduction & Conclusion sections</p>
                                                    <p className="text-gray-600">• Replace generic phrases with dataset-specific statements</p>
                                                    <p className="text-gray-600">• Break uniform sentence patterns — vary length deliberately</p>
                                                    <p className="text-gray-600">• Use the Prompt Engine page to refine flagged sentences</p>
                                                </>
                                            )}
                                            {aiDetectionResult.risk === 'Medium' && (
                                                <>
                                                    <p className="font-semibold text-amber-700">🟡 Medium Risk — Improvements Recommended:</p>
                                                    <p className="text-gray-600">• Focus rewriting on Conclusion and Discussion sections</p>
                                                    <p className="text-gray-600">• Add more numerical anchors and causal reasoning (WHY/HOW)</p>
                                                    <p className="text-gray-600">• Use Prompt Engine for sentence-level fixes</p>
                                                </>
                                            )}
                                            {aiDetectionResult.risk === 'Low' && (
                                                <>
                                                    <p className="font-semibold text-emerald-700">🟢 Low Risk — Good Quality Writing:</p>
                                                    <p className="text-gray-600">• Text shows human-like variation and specificity</p>
                                                    <p className="text-gray-600">• Review individual sections in Prompt Engine for final polish</p>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
