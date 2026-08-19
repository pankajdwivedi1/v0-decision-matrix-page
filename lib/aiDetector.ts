/**
 * AI Sentence Detector & Burstiness Analyzer
 */

export interface SentenceAnalysis {
    sentence: string;
    isAI: boolean;
    aiScore: number;
    reason: string;
}

export function sentenceVariance(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return 100;
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + (b - avg) ** 2, 0) / lengths.length;
    return variance;
}

export function lexicalDiversity(text: string): number {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return 1;
    const unique = new Set(words);
    return unique.size / words.length;
}

export function detectAISentences(text: string): SentenceAnalysis[] {
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    const results: SentenceAnalysis[] = [];

    const aiBuzzwords = [
        "furthermore", "moreover", "in conclusion", "it is noteworthy",
        "delves into", "testament to", "crucial role", "vital importance",
        "comprehensive analysis", "seamlessly", "holistic", "underscore"
    ];

    for (const raw of sentences) {
        const s = raw.trim();
        if (s.length < 15) continue;

        const words = s.toLowerCase().split(/\s+/);
        let score = 25; // baseline

        // Check for common AI patterns
        const buzzwordMatches = aiBuzzwords.filter(b => s.toLowerCase().includes(b));
        score += buzzwordMatches.length * 15;

        // Long sentences with uniform comma cadence
        const commas = (s.match(/,/g) || []).length;
        if (commas >= 3 && words.length > 25) {
            score += 15;
        }

        // Extremely uniform length
        if (words.length >= 18 && words.length <= 26) {
            score += 10;
        }

        const isAI = score >= 55;
        results.push({
            sentence: s,
            isAI,
            aiScore: Math.min(95, score),
            reason: isAI ? `Detected formal AI pattern with score ${score}%` : "Natural variation"
        });
    }

    return results;
}
