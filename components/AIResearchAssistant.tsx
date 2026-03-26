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

interface AIResearchAssistantProps {
    kSensData: any;
    criterionName: string;
    variationRange: string;
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
        description: 'Concise summary of the entire study',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 250,
        color: 'from-blue-600 to-cyan-600'
    },
    {
        id: 'introduction',
        name: '1. Introduction',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'Context, research gap, and objectives',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 1000,
        color: 'from-violet-600 to-purple-600'
    },
    {
        id: 'literature',
        name: '2. Literature Review',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'Review of relevant research',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 1200,
        color: 'from-indigo-600 to-blue-600'
    },
    {
        id: 'methodology',
        name: '3. Methodology',
        icon: <Target className="w-4 h-4" />,
        description: 'Research methods and procedures',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 1500,
        color: 'from-emerald-600 to-teal-600'
    },
    {
        id: 'results',
        name: '4. Results & Analysis',
        icon: <TrendingUp className="w-4 h-4" />,
        description: 'Presentation of findings',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 1500,
        color: 'from-amber-600 to-orange-600'
    },
    {
        id: 'discussion',
        name: '5. Discussion',
        icon: <Lightbulb className="w-4 h-4" />,
        description: 'Interpretation and implications',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 1500,
        color: 'from-pink-600 to-rose-600'
    },
    {
        id: 'conclusion',
        name: '6. Conclusion',
        icon: <FileText className="w-4 h-4" />,
        description: 'Summary and future directions',
        defaultPrompt: '', // Will be generated dynamically
        defaultWordCount: 700,
        color: 'from-purple-600 to-pink-600'
    },
    {
        id: 'references',
        name: 'References',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'APA style bibliography',
        defaultPrompt: 'Generate a complete, alphabetically ordered References section in APA style based on the provided Scholarly References. List only the sources relevant to the study. Ensure professional formatting.',
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

    const markedAssetsList = Array.from(markedAssets || []);
    const tablesCount = markedAssetsList.filter(k => 
        !k.includes('chart') && !k.includes('variation') && !k.includes('plot') && !k.includes('radar') && 
        !k.startsWith('method_') && !k.startsWith('weight_method_')
    ).length;
    
    const diagramsCount = markedAssetsList.filter(k => 
        (k.includes('chart') || k.includes('variation') || k.includes('plot') || k.includes('radar')) && 
        !k.startsWith('method_') && !k.startsWith('weight_method_')
    ).length;
    
    const selectedRankingMethods = markedAssetsList
        .filter(k => k.startsWith('method_'))
        .map(k => k.replace('method_', '').toUpperCase());
    
    const selectedWeightMethods = markedAssetsList
        .filter(k => k.startsWith('weight_method_'))
        .map(k => k.replace('weight_method_', '').toUpperCase());

    const methodsCount = selectedRankingMethods.length + selectedWeightMethods.length;
    const [showResult, setShowResult] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

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

    // Full Manuscript States
    const [isProcessingFull, setIsProcessingFull] = useState(false);
    const [fullProgress, setFullProgress] = useState(0);
    const [fullManuscriptData, setFullManuscriptData] = useState<Record<string, string>>({});
    const [manuscriptTitle, setManuscriptTitle] = useState('');
    const [technicalDepth, setTechnicalDepth] = useState<'standard' | 'mathematical'>(technicalDepthProp || 'standard');

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

    const getDynamicPrompt = (sectionId: string) => {
        const rankingMethodName = selectedRankingMethods.length > 0 ? selectedRankingMethods.join(' and ') : method.toUpperCase();
        const weightMethodName = selectedWeightMethods.length > 0 ? selectedWeightMethods.join(' and ') : weightMethod.toUpperCase();
        
        const comparisonMethodsList = comparisonMethods && comparisonMethods.length > 0 ? comparisonMethods.join(', ').toUpperCase() : '';
        const sensitivityDetails = sensitivityMethod ? `stability check using ${sensitivityMethod.toUpperCase()} with ${sensitivityWeightMethods?.join(', ').toUpperCase()} weight variations` : '';

        const spearmanText = spearmanCorrelation && Object.keys(spearmanCorrelation).length > 0
            ? "Statistical validation is performed using Spearman Rank Correlation and Kendall's Tau to ensure ranking consistency between methods."
            : "";

        const mathInstructions = technicalDepth === 'mathematical'
            ? "Include exact mathematical formulas (in LaTeX format) for normalization, weight calculation, and the final aggregation function. Use standard notation like $w_j$, $x_{ij}$, and normalization equations like $\\frac{x_{ij} - min}{max - min}$ for beneficial criteria."
            : "Use professional descriptive text to explain the methodology without heavy mathematical equations.";

        const noveltySuggestion = getBibliometricNovelty();

        switch (sectionId) {
            case 'abstract':
                return `Write a high-quality academic abstract for a Q1 journal. Structure: 
1. Context & Problem: Establish the domain and specific MCDM challenge. 
2. Research Gap: ${noveltySuggestion}
3. Solution: Introduce ${rankingMethodName} integrated with ${weightMethodName} weighting. 
4. Methodology: Describe criteria (${criteria.length}) and alternatives (${alternatives.length}). 
5. Statistical Validation: Mentions use of Spearman Rho and Kendall's Tau correlations.
6. Findings: Summarize final stable results.
7. Significance: Practical impact on decision-making. End with exactly 5-6 professional Keywords.`;
            case 'introduction':
                return `Write a scholarly introduction with hierarchical numbering (1.1, 1.2). 
Identify a "Literature Gap": ${noveltySuggestion}. 
Justify the dual application of ${rankingMethodName} for ranking and ${weightMethodName} for weighting. 
State the "Scientific Contributions" of this paper: (a) Integrated Ranking Framework, (b) Multi-model comparative analysis, and (c) Statistical validation via rank correlation.`;
            case 'literature':
                return `Write a systematic literature review (Section 2) with hierarchical numbering. 
Synthesize recent research (last 5 years) in the field. 
Critically analyze limitations and position this study's multi-method validation approach as the solution to the identified "Literature Gap" regarding the combination of ${criteria.length} criteria.`;
            case 'methodology':
                return `Write a technical methodology section (Section 3). ${mathInstructions}
Detail the procedural steps of ${rankingMethodName} and the weighting protocol of ${weightMethodName}. 
${selectedRankingMethods.length > 1 ? `Discuss the comparative rationale between ${selectedRankingMethods.join(', ')}.` : ""}
Detail the weighting protocol using ${weightMethodName}.
Describe the "Statistical Robustness Proof" using Spearman and Kendall coefficients.`;
            case 'results':
                return `Write a results section (Section 4). Discuss ranking results for ${alternatives.length} alternatives using ${rankingMethodName}. 
Discuss the results specifically for the methods and tables marked in the manifest.
Discuss ranking stability during the ${variationRange} variation.` +
                    (comparisonMethodsList ? ` Include comparison results with ${comparisonMethodsList}.` : '') +
                    (spearmanText ? ` Provide statistical validation, stating that a high correlation indicates strong methodological consensus.` : '');
            case 'discussion':
                return `Write an insightful discussion section (Section 5). Interpret findings, provide comparative insights between ${rankingMethodName} and other models, and highlight how the high correlation results increase decision-maker confidence.`;
            case 'conclusion':
                return `Write a strong conclusion (Section 6). Summarize findings of the ${rankingMethodName}-${weightMethodName} framework, restate the proven stability, and explain how this addresses the initial literature gap of ${noveltySuggestion.toLowerCase().split(':')[1]}.`;
            case 'references':
                return 'Generate a complete, alphabetically ordered References section in APA style based on provided Scholarly References and current MCDM literature trends.';
            default:
                return '';
        }
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

    const handleGenerate = async () => {
        setIsGenerating(true);
        setShowResult(true);
        setGeneratedContent('');

        try {
            const finalPrompt = customPrompt || currentTemplate.defaultPrompt;
            const userApiKey = localStorage.getItem("user_gemini_api_key") || "";

            const response = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userApiKey,
                    analysisType: 'custom_section',
                    sectionType: selectedSection,
                    customPrompt: finalPrompt,
                    wordCount: wordCount,
                    additionalContext: additionalContext,
                    kSensData: kSensData,
                    criterionName: criterionName,
                    variationRange: variationRange,
                    alternatives: alternatives,
                    criteria: criteria,
                    method: method,
                    assetLabels: assetLabels,
                    markedAssets: markedAssets ? Array.from(markedAssets) : [],
                    ranking: kSensData?.results?.['0']
                        ? Object.entries(kSensData.results['0']).map(([altName, score]: [string, any]) => ({
                            alternativeName: altName,
                            score: typeof score === 'number' ? score : 0
                        })).sort((a, b) => b.score - a.score)
                        : [],
                    researchContext: researchContext,
                    isLastSection: selectedSection === 'references'
                })
            });

            const result = await response.json();
            setGeneratedContent(result.markdown || result.error || 'Failed to generate content');
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
            const generatedTitle = (titleData.markdown || "Technical Analysis of Decision Criteria").replace(/[#*]/g, '').trim();
            setManuscriptTitle(generatedTitle);

            for (let i = 0; i < sectionsToGenerate.length; i++) {
                const section = sectionsToGenerate[i];
                setFullProgress(10 + Math.round((i / sectionsToGenerate.length) * 90));

                const response = await fetch('/api/ai-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userApiKey,
                        analysisType: 'custom_section',
                        sectionType: section.id,
                        customPrompt: getDynamicPrompt(section.id) + " CRITICAL: Start writing technical content DIRECTLY. Do NOT include any section titles, numbers, or headings at the start of your response. This is part of a professional research paper; ensure it flows naturally without repeating headers.",
                        wordCount: section.defaultWordCount,
                        additionalContext: additionalContext + (i > 0 ? " Previous section context: " + results[sectionsToGenerate[i - 1].id]?.substring(0, 500) : ""),
                        kSensData,
                        criterionName,
                        variationRange,
                        alternatives,
                        criteria,
                        method,
                        assetLabels: assetLabels,
                        markedAssets: markedAssets ? Array.from(markedAssets) : [],
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
                results[section.id] = result.markdown || "Section generation failed.";
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

                {/* Custom Prompt */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                        Generation Instructions
                    </Label>
                    <Textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Customize the generation instructions..."
                        className="min-h-[100px] text-sm"
                    />
                    <p className="text-xs text-gray-500">
                        Modify this prompt to customize the output. Be specific about what you want AI to include.
                    </p>
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
                        onClick={handleGenerateFullManuscript}
                        disabled={isGenerating || isProcessingFull}
                        variant="outline"
                        className="flex-1 h-12 text-sm font-bold border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 shadow-md"
                    >
                        {isProcessingFull ? (
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Writing Paper ({fullProgress}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 h-1 mt-1 rounded-full overflow-hidden">
                                    <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${fullProgress}%` }} />
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
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
