import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle2, BookOpen, Loader2, Table2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExtractedPaperData {
    citation: {
        title: string;
        authors: string;
        year: string;
        journal: string;
        doi: string;
    };
    researchContext: {
        topic: string;
        problemStatement: string;
        researchGap: string;
        methodology: string;
        domain: string;
    };
    criteria: Array<{
        name: string;
        description: string;
        unit: string;
        type: string;
        weight: number;
    }>;
    alternatives: Array<{
        name: string;
        description: string;
    }>;
    decisionMatrix: {
        hasMatrix: boolean;
        values: number[][] | null;
    };
    originalResults: {
        winner: string;
        ranking: string[] | null;
        keyFindings: string;
    };
    identifiedGaps: string[];
    suggestedContributions: string[];
}

interface PaperExtractorProps {
    onExtractComplete: (data: ExtractedPaperData) => void;
    onClose: () => void;
}

export default function PaperExtractor({ onExtractComplete, onClose }: PaperExtractorProps) {
    const [paperText, setPaperText] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedPaperData | null>(null);
    const [error, setError] = useState('');
    const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setFileName(file.name);
        setIsExtracting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/extract-pdf', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'PDF extraction failed');
            }

            // Now extract MCDM data from the text
            await extractFromText(result.text);

        } catch (err: any) {
            setError(err.message || 'Failed to process PDF file');
            setIsExtracting(false);
        }
    };

    const extractFromText = async (text: string) => {
        try {
            const response = await fetch('/api/extract-paper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paperText: text }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Extraction failed');
            }

            setExtractedData(result.data);
        } catch (err: any) {
            setError(err.message || 'Failed to extract paper data');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleExtract = async () => {
        if (!paperText.trim()) {
            setError('Please paste the paper text first');
            return;
        }

        setIsExtracting(true);
        setError('');
        await extractFromText(paperText);
    };

    const handleUseExtractedData = () => {
        if (extractedData) {
            onExtractComplete(extractedData);
        }
    };

    return (
        <div className="space-y-6">
            {!extractedData ? (
                <>
                    {/* Upload Method Toggle */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        <Button
                            variant={uploadMode === 'file' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setUploadMode('file')}
                            className="flex-1 text-xs"
                        >
                            📄 Upload PDF (Recommended)
                        </Button>
                        <Button
                            variant={uploadMode === 'text' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setUploadMode('text')}
                            className="flex-1 text-xs"
                        >
                            📝 Paste Text
                        </Button>
                    </div>

                    {uploadMode === 'file' ? (
                        <>
                            {/* PDF Upload Section */}
                            <Card className="border-blue-200 bg-blue-50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Upload className="w-4 h-4 text-blue-600" />
                                        Upload Published Paper (PDF)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-xs text-blue-900">
                                        Upload the PDF file of the research paper you want to analyze. AI will automatically extract all MCDM content.
                                    </p>

                                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-white">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <Upload className="w-12 h-12 mx-auto text-blue-400 mb-3" />
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            {fileName || 'Click to upload PDF file'}
                                        </p>
                                        <Button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isExtracting}
                                            variant="outline"
                                            className="bg-white"
                                        >
                                            {isExtracting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing PDF...
                                                </>
                                            ) : (
                                                <>
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    Select PDF File
                                                </>
                                            )}
                                        </Button>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Supported format: PDF only
                                        </p>
                                    </div>

                                    {isExtracting && (
                                        <div className="bg-white rounded-md p-3 border border-blue-200">
                                            <div className="flex items-center gap-2 text-sm text-blue-900">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <div>
                                                    <p className="font-medium">AI is analyzing your paper...</p>
                                                    <p className="text-xs text-blue-700">Extracting text, citations, criteria, and research gaps</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            {/* Text Paste Section */}
                            <Card className="border-blue-200 bg-blue-50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                        How to Extract from Published Papers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="text-xs space-y-2 text-blue-900">
                                        <li><strong>1. Open the published PDF</strong> in a PDF reader</li>
                                        <li><strong>2. Select and copy all text</strong> (Ctrl+A, then Ctrl+C)</li>
                                        <li><strong>3. Paste below</strong> and click "Extract with AI"</li>
                                        <li><strong>4. AI will analyze</strong> and extract all MCDM details</li>
                                        <li><strong>5. Review and use</strong> the extracted data for your comparative study</li>
                                    </ol>
                                </CardContent>
                            </Card>

                            {/* Text Input Area */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Paste Paper Text Here
                                </label>
                                <Textarea
                                    placeholder="Paste the full text of the research paper here... (Abstract, Introduction, Methodology, Results, etc.)"
                                    value={paperText}
                                    onChange={(e) => setPaperText(e.target.value)}
                                    className="min-h-[300px] font-mono text-xs"
                                />
                                <p className="text-xs text-gray-500">
                                    📊 {paperText.split(' ').filter(w => w.length > 0).length} words pasted
                                    {paperText.length > 1000 && ' - Good! More text = Better extraction'}
                                </p>
                            </div>

                            {/* Extract Button for Text Mode */}
                            <Button
                                onClick={handleExtract}
                                disabled={isExtracting || !paperText.trim()}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                            >
                                {isExtracting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analyzing Paper with AI...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Extract with AI 🤖
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Cancel Button */}
                    <Button onClick={onClose} variant="outline" className="w-full">
                        Cancel
                    </Button>
                </>
            ) : (
                <>
                    {/* Extraction Success - Show Results */}
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            <strong>🎉 Extraction Complete!</strong> AI successfully analyzed the paper.
                        </AlertDescription>
                    </Alert>

                    {/* Citation Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">📚 Original Paper Citation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            <div><strong>Title:</strong> {extractedData.citation.title}</div>
                            <div><strong>Authors:</strong> {extractedData.citation.authors}</div>
                            <div><strong>Year:</strong> {extractedData.citation.year}</div>
                            {extractedData.citation.journal !== 'Not found' && (
                                <div><strong>Published in:</strong> {extractedData.citation.journal}</div>
                            )}
                            {extractedData.citation.doi !== 'Not found' && (
                                <div><strong>DOI:</strong> {extractedData.citation.doi}</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Research Context */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">🎯 Research Context Extracted</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                            <div>
                                <strong className="text-blue-700">Topic/Domain:</strong>
                                <p className="mt-1 text-gray-700">{extractedData.researchContext.topic}</p>
                            </div>
                            <div>
                                <strong className="text-blue-700">Method Used:</strong>
                                <p className="mt-1 text-gray-700">{extractedData.researchContext.methodology}</p>
                            </div>
                            <div>
                                <strong className="text-blue-700">Problem Statement:</strong>
                                <p className="mt-1 text-gray-700 leading-relaxed">{extractedData.researchContext.problemStatement}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Extracted Criteria */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">📊 Criteria Extracted ({extractedData.criteria.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {extractedData.criteria.map((criterion, idx) => (
                                    <div key={idx} className="p-2 bg-gray-50 rounded border text-xs">
                                        <div className="flex items-center gap-2 mb-1">
                                            <strong>{criterion.name}</strong>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${criterion.type.toLowerCase() === 'beneficial'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {criterion.type.toLowerCase() === 'beneficial' ? '↑ Beneficial' : '↓ Non-Beneficial'}
                                            </span>
                                            {criterion.weight > 0 && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                    Weight: {criterion.weight}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600">{criterion.description}</p>
                                        {criterion.unit && <p className="text-gray-500 text-[10px] mt-1">Unit: {criterion.unit}</p>}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Extracted Alternatives */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">🔧 Alternatives Extracted ({extractedData.alternatives.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {extractedData.alternatives.map((alt, idx) => (
                                    <div key={idx} className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded text-xs">
                                        {alt.name}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Decision Matrix Status */}
                    {extractedData.decisionMatrix && extractedData.decisionMatrix.hasMatrix && (
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm text-green-900 flex items-center gap-2">
                                    <Table2 className="w-4 h-4" />
                                    Decision Matrix Found!
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-green-700">
                                    A numerical decision matrix was successfully extracted ({extractedData.alternatives.length} alternatives x {extractedData.criteria.length} criteria). These values will be automatically filled into your main interactive table.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Identified Gaps */}
                    <Card className="border-amber-200 bg-amber-50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-amber-900">🔍 Research Gaps Identified</CardTitle>
                            <CardDescription className="text-xs text-amber-700">
                                These gaps could justify your new comparative study
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-1 text-xs text-amber-900">
                                {extractedData.identifiedGaps.map((gap, idx) => (
                                    <li key={idx} className="flex gap-2">
                                        <span>❌</span>
                                        <span>{gap}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Suggested Contributions */}
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-green-900">💡 AI-Suggested Contributions</CardTitle>
                            <CardDescription className="text-xs text-green-700">
                                How you could extend this research
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-1 text-xs text-green-900">
                                {extractedData.suggestedContributions.map((contrib, idx) => (
                                    <li key={idx} className="flex gap-2">
                                        <span>✅</span>
                                        <span>{contrib}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleUseExtractedData}
                            className="flex-1 bg-green-600 hover:bg-green-700 font-bold py-6 text-base"
                        >
                            <CheckCircle2 className="w-5 h-5 mr-3" />
                            {extractedData.decisionMatrix?.hasMatrix
                                ? "Import Everything & Fill Matrix"
                                : "Fill Research Context & Use Data"}
                        </Button>
                        <Button onClick={() => setExtractedData(null)} variant="outline">
                            Extract Different Paper
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
