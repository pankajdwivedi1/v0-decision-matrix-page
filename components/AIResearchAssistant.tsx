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
    onClose?: () => void;
}

// Pre-defined section templates
const SECTION_TEMPLATES = [
    {
        id: 'abstract',
        name: 'Abstract',
        icon: <FileText className="w-4 h-4" />,
        description: 'Concise summary of the entire study',
        defaultPrompt: 'Write a high-quality academic abstract following this exact structure: 1. Context & Problem: Start by describing the real-world challenge and the research gap (why is this study needed?). 2. Solution: Introduce the specific MCDM methodology as a tool to solve this specific problem. 3. Methodology: Describe how the criteria and alternatives were established. 4. Findings: Summarize the final rankings and the stability discovered in the sensitivity analysis. 5. Significance: Conclude with the practical impact for decision-makers. Also, at the very end, provide exactly 5-6 professional "Keywords" related to the study.',
        defaultWordCount: 300,
        color: 'from-blue-600 to-cyan-600'
    },
    {
        id: 'introduction',
        name: 'Introduction',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'Background, research gap, and objectives',
        defaultPrompt: 'Write a comprehensive scholarly introduction. Structure it to: 1. Background: Detail the significance of the decision-making problem in its specific field. 2. The Research Gap: Explain why current methods are insufficient or why a structured MCDM approach is necessary for this specific case. 3. Study Objective: State the goal of identifying the optimal choice through mathematical rigor. 4. Methodology Overview: Briefly justify the selection of the chosen weighting and ranking methods.',
        defaultWordCount: 3500,
        color: 'from-violet-600 to-purple-600'
    },
    {
        id: 'literature',
        name: 'Literature Review',
        icon: <BookOpen className="w-4 h-4" />,
        description: 'Review of relevant research and theories',
        defaultPrompt: 'Write a comprehensive literature review (3000-5000 words) covering: MCDM methodologies, relevant applications, theoretical foundations, and research gaps. Include structured sections for different aspects.',
        defaultWordCount: 4000,
        color: 'from-indigo-600 to-blue-600'
    },
    {
        id: 'methodology',
        name: 'Methodology',
        icon: <Target className="w-4 h-4" />,
        description: 'Detailed research methods and procedures',
        defaultPrompt: 'Write a detailed methodology section (2000-3000 words) explaining: research design, data collection, MCDM method implementation, criteria selection, sensitivity analysis approach, and validation procedures.',
        defaultWordCount: 2500,
        color: 'from-emerald-600 to-teal-600'
    },
    {
        id: 'results',
        name: 'Results & Analysis',
        icon: <TrendingUp className="w-4 h-4" />,
        description: 'Presentation and interpretation of findings',
        defaultPrompt: 'Write a comprehensive results section. You MUST follow these academic rules: 1. Refer to the final weights as "Table 1" and the ranking results as "Table 2". 2. Analyze specific numerical differences between alternatives. 3. Discuss any rank reversals observed during the sensitivity analysis (refer to this as "Figure 1"). 4. Use formal scholarly language (e.g., "The data indicates," "It is observed that"). 5. Discuss why the top alternative was chosen based on its performance across conflicting criteria.',
        defaultWordCount: 2500,
        color: 'from-amber-600 to-orange-600'
    },
    {
        id: 'discussion',
        name: 'Discussion',
        icon: <Lightbulb className="w-4 h-4" />,
        description: 'Interpretation and implications',
        defaultPrompt: 'Write an insightful discussion section (2000-3000 words) that: interprets the results, explains implications, compares with existing research, discusses practical applications, and highlights key insights.',
        defaultWordCount: 2500,
        color: 'from-pink-600 to-rose-600'
    },
    {
        id: 'conclusion',
        name: 'Conclusion',
        icon: <FileText className="w-4 h-4" />,
        description: 'Summary and future directions',
        defaultPrompt: 'Write a strong conclusion (600-800 words) that: summarizes key findings, states research contributions, discusses limitations, and suggests future research directions.',
        defaultWordCount: 700,
        color: 'from-purple-600 to-pink-600'
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

    // Full Manuscript States
    const [isProcessingFull, setIsProcessingFull] = useState(false);
    const [fullProgress, setFullProgress] = useState(0);
    const [fullManuscriptData, setFullManuscriptData] = useState<Record<string, string>>({});

    const currentTemplate = SECTION_TEMPLATES.find(t => t.id === selectedSection) || SECTION_TEMPLATES[0];

    // Update defaults when section changes
    React.useEffect(() => {
        setCustomPrompt(currentTemplate.defaultPrompt);
        setWordCount(currentTemplate.defaultWordCount);
        setGeneratedContent('');
        setShowResult(false);
        setIsCopied(false);
    }, [selectedSection]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setShowResult(true);
        setGeneratedContent('');

        try {
            const finalPrompt = customPrompt || currentTemplate.defaultPrompt;

            const response = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
                    ranking: kSensData?.results?.['0']
                        ? Object.entries(kSensData.results['0']).map(([altName, score]: [string, any]) => ({
                            alternativeName: altName,
                            score: typeof score === 'number' ? score : 0
                        })).sort((a, b) => b.score - a.score)
                        : []
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
        const results: Record<string, string> = {};

        const sectionsToGenerate = SECTION_TEMPLATES.filter(s => s.id !== 'custom');

        try {
            for (let i = 0; i < sectionsToGenerate.length; i++) {
                const section = sectionsToGenerate[i];
                setFullProgress(Math.round(((i) / sectionsToGenerate.length) * 100));

                const response = await fetch('/api/ai-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        analysisType: 'custom_section',
                        sectionType: section.id,
                        customPrompt: section.defaultPrompt + " This is part of a COMPLETE research paper. Ensure it flows correctly.",
                        wordCount: section.defaultWordCount,
                        additionalContext: additionalContext + (i > 0 ? " Previous section context: " + results[sectionsToGenerate[i - 1].id]?.substring(0, 500) : ""),
                        kSensData,
                        criterionName,
                        variationRange,
                        alternatives,
                        criteria,
                        method,
                        ranking: kSensData?.results?.['0']
                            ? Object.entries(kSensData.results['0']).map(([altName, score]: [string, any]) => ({
                                alternativeName: altName,
                                score: typeof score === 'number' ? score : 0
                            })).sort((a, b) => b.score - a.score)
                            : []
                    })
                });

                const result = await response.json();
                results[section.id] = result.markdown || "Section generation failed.";
            }

            setFullManuscriptData(results);
            setFullProgress(100);

            // Auto-assemble the content for display
            const assembled = sectionsToGenerate.map(s => `# ${s.name}\n\n${results[s.id]}`).join('\n\n---\n\n');
            setGeneratedContent(assembled);
            setShowResult(true);
            setSelectedSection('abstract'); // Reset to a valid template for font/style
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
                                        text: (titleInput || currentTemplate.name).toUpperCase(),
                                        bold: true,
                                        size: 28,
                                        font: "Times New Roman"
                                    }),
                                ],
                                heading: HeadingLevel.HEADING_1,
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 400 },
                            }),
                            ...content.split('\n').map(line => {
                                const cleanLine = line.trim();
                                if (!cleanLine) return new Paragraph({ spacing: { after: 120 } });

                                if (cleanLine.startsWith('# ')) {
                                    return new Paragraph({
                                        children: [new TextRun({ text: cleanLine.replace('# ', ''), bold: true, size: 26, font: "Times New Roman" })],
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
                                        children: [new TextRun({ text: cleanLine.replace('### ', ''), bold: true, size: 22, font: "Times New Roman" })],
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
                            max={8000}
                            step={100}
                            className="w-32 h-10"
                        />
                        <span className="text-sm text-gray-600">
                            words (100-8000)
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
                        <div className="prose prose-sm max-w-none">
                            {isGenerating ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                                </div>
                            ) : (
                                <div className="text-sm leading-relaxed text-gray-800">
                                    <ReactMarkdown>
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
