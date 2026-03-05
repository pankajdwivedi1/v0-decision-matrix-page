import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, FileText, X, BookOpen, Lightbulb, Target, TrendingUp, Check, Download } from 'lucide-react';
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

    const currentTemplate = SECTION_TEMPLATES.find(t => t.id === selectedSection) || SECTION_TEMPLATES[0];

    const getDynamicPrompt = (sectionId: string) => {
        const rankingMethodName = method.toUpperCase();
        const weightMethodName = weightMethod.toUpperCase();
        const comparisonMethodsList = comparisonMethods.length > 0 ? comparisonMethods.join(', ').toUpperCase() : '';
        const sensitivityDetails = sensitivityMethod ? `stability check using ${sensitivityMethod.toUpperCase()} with ${sensitivityWeightMethods.join(', ').toUpperCase()} weight variations` : '';

        const contextString = `This study utilizes the ${rankingMethodName} method for ranking and ${weightMethodName} for criteria weighting. ` +
            (comparisonMethodsList ? `The results are validated against ${comparisonMethodsList} methods. ` : '') +
            (sensitivityDetails ? `Robustness is examined through ${sensitivityDetails}. ` : '');

        switch (sectionId) {
            case 'abstract':
                return `Write a high-quality academic abstract. Structure: 1. Context & Problem: Describe the challenge and research gap. 2. Solution: Introduce ${rankingMethodName} integrated with ${weightMethodName} weighting. 3. Methodology: Describe criteria (${criteria.length}) and alternatives (${alternatives.length}). 4. Findings: Summarize final results and stability (${variationRange} variation). 5. Significance: Practical impact. End with exactly 5-6 professional Keywords.`;
            case 'introduction':
                return `Write a scholarly introduction with hierarchical numbering (e.g., 1.1 Background, 1.2 Gap). Establish global context and justify the dual application of ${rankingMethodName} and ${weightMethodName}.`;
            case 'literature':
                return `Write a literature review with hierarchical numbering. Synthesize research in the field and position this study using ${rankingMethodName} and ${weightMethodName} weighting.`;
            case 'methodology':
                return `Write a technical methodology section with hierarchical numbering. Detail the procedural framework of ${rankingMethodName}, criteria selection (${criteria.length} items), and the ${weightMethodName} weighing protocol. Describe the stability validation approach (${variationRange} perturbation).`;
            case 'results':
                return `Write a results section with hierarchical numbering. Discuss ranking results for ${alternatives.length} alternatives. Refer to criteria weights as Table 1 and final rankings as Table 2. Discuss ranking stability during the ${variationRange} variation (refer to as Figure 1).` + (comparisonMethodsList ? ` Include comparison results with ${comparisonMethodsList} in Table 3.` : '');
            case 'discussion':
                return `Write an insightful discussion section with hierarchical numbering. Interpret findings, provide comparative insights using ${comparisonMethodsList || rankingMethodName}, and highlight practical implications.`;
            case 'conclusion':
                return `Write a strong conclusion with hierarchical numbering. Summarize findings of the ${rankingMethodName}-${weightMethodName} framework, state final recommendations, and suggest future research.`;
            case 'references':
                return 'Generate a complete, alphabetically ordered References section in APA style based on the provided Scholarly References.';
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
    }, [selectedSection, method, weightMethod, comparisonMethods, sensitivityMethod, sensitivityWeightMethods]);

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
