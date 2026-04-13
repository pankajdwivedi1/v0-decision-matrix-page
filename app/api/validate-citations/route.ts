import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DoiResult {
    type: "doi";
    doi: string;
    valid: boolean;
    reason?: string;
    title?: string;
    year?: number;
    journal?: string;
}

interface AuthorResult {
    type: "author";
    author: string;
    year: string;
    valid: boolean;
    suggestedTitle?: string;
    suggestedDoi?: string;
    reason?: string;
}

type ValidationResult = DoiResult | AuthorResult;

// ─── Step 1: Extract APA in-text citations (Author, Year) ────────────────────
function extractCitations(text: string): { author: string; year: string }[] {
    // Matches: (Smith, 2023), (Dwivedi et al., 2025), (van der Berg & Lee, 2022)
    const regex = /\(([A-Z][a-zA-Z\s,\.&]+),\s*(\d{4}[a-c]?)\)/g;
    const matches: { author: string; year: string }[] = [];
    const seen = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
        const author = match[1].trim();
        const year = match[2].trim();
        const key = `${author.toLowerCase()}_${year}`;
        if (!seen.has(key) && parseInt(year) >= 1900 && parseInt(year) <= 2030) {
            seen.add(key);
            matches.push({ author, year });
        }
    }
    return matches;
}

// ─── Step 2: Validate a single APA citation via CrossRef ─────────────────────
async function validateCitation(author: string, year: string): Promise<AuthorResult> {
    try {
        const query = `${author} ${year}`;
        const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=3`;
        const res = await fetch(url, {
            headers: { "User-Agent": "DecisionAlgo/1.0 (mailto:research@decisionalgo.app)" },
            signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) {
            return { type: "author", author, year, valid: false, reason: `CrossRef HTTP ${res.status}` };
        }
        const data = await res.json();
        const items = data.message?.items || [];
        if (items.length === 0) {
            return { type: "author", author, year, valid: false, reason: "No matching paper found — may be fake or misspelled." };
        }
        // Check if any returned item roughly matches the author + year
        const authorLast = author.split(/[\s,]/)[0].toLowerCase();
        const matched = items.find((item: any) => {
            const itemYear = item.published?.["date-parts"]?.[0]?.[0];
            const itemAuthors = (item.author || []).map((a: any) => (a.family || "").toLowerCase());
            const yearClose = itemYear && Math.abs(itemYear - parseInt(year)) <= 1;
            const authorMatch = itemAuthors.some((a: string) => a.includes(authorLast) || authorLast.includes(a));
            return authorMatch && yearClose;
        });
        if (matched) {
            return {
                type: "author", author, year, valid: true,
                suggestedTitle: matched.title?.[0],
                suggestedDoi: matched.DOI
            };
        }
        // Partial match — flag as unverified
        return {
            type: "author", author, year, valid: false,
            reason: "Closest CrossRef match does not align with this author/year combination.",
            suggestedTitle: items[0]?.title?.[0],
            suggestedDoi: items[0]?.DOI
        };
    } catch (err: any) {
        return {
            type: "author", author, year, valid: false,
            reason: err?.name === "TimeoutError" ? "Request timed out" : "Network error"
        };
    }
}

// ─── DOI extractor ───────────────────────────────────────────────────────────
function extractDoisFromText(text: string): string[] {
    const patterns = [
        /https?:\/\/doi\.org\/([^\s,;"')]+)/gi,
        /\bdoi:\s*([^\s,;"')]+)/gi,
        /(10\.\d{4,9}\/[^\s,;"')]+)/gi
    ];
    const found = new Set<string>();
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const raw = match[1].replace(/[.,;:'")\]]+$/, "");
            if (raw.startsWith("10.")) found.add(raw);
        }
    }
    return Array.from(found);
}

// ─── DOI validator ───────────────────────────────────────────────────────────
async function validateDoi(doi: string): Promise<DoiResult & { quartile?: string | null }> {
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//i, "").trim();
    const { getQuartile } = await import("@/lib/journalData");

    try {
        const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;
        const res = await fetch(url, {
            headers: { "User-Agent": "DecisionAlgo/1.0 (mailto:research@decisionalgo.app)" },
            signal: AbortSignal.timeout(6000)
        });
        if (res.status === 404) return { type: "doi", doi: cleanDoi, valid: false, reason: "DOI not found — may be fake or mistyped." };
        if (!res.ok) return { type: "doi", doi: cleanDoi, valid: false, reason: `CrossRef HTTP ${res.status}` };
        const data = await res.json();
        const item = data.message;
        const journal = item["container-title"]?.[0] || item.publisher;
        const quartile = getQuartile(journal);

        return {
            type: "doi", doi: cleanDoi, valid: true,
            title: item.title?.[0],
            year: item.published?.["date-parts"]?.[0]?.[0],
            journal,
            quartile
        };
    } catch (err: any) {
        return { type: "doi", doi: cleanDoi, valid: false, reason: err?.name === "TimeoutError" ? "Request timed out" : "Network error" };
    }
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const { text, dois, referenceLibrary = "", targetCount = 0, mode = "both" } = await req.json();
        
        if (!text && !dois) {
            return NextResponse.json({ error: "Provide text or dois array." }, { status: 400 });
        }

        // Step 1: Pre-parse the library for fast matching
        const libraryCitations = extractCitations(referenceLibrary);
        const libraryDois = extractDoisFromText(referenceLibrary);

        const results: ValidationResult[] = [];

        // Step 2: Full APA Author/Year validation
        if ((mode === "both" || mode === "author") && text) {
            const citations = extractCitations(text);
            
            // LIMIT to target count if requested
            const citationsToValidate = targetCount > 0 ? citations.slice(0, targetCount) : citations;

            const CONCURRENCY = 4;
            for (let i = 0; i < citationsToValidate.length; i += CONCURRENCY) {
                const batch = citationsToValidate.slice(i, i + CONCURRENCY);
                const batchResults = await Promise.all(batch.map(async (c) => {
                    // LIBRARY MATCH FIRST
                    const inLibrary = libraryCitations.find(lc => 
                        lc.author.toLowerCase().includes(c.author.toLowerCase().split(',')[0]) && 
                        lc.year === c.year
                    );

                    if (inLibrary) {
                        return { 
                            type: "author", 
                            author: c.author, 
                            year: c.year, 
                            valid: true,
                            suggestedTitle: "Verified in Source Library" 
                        } as AuthorResult;
                    }

                    // FALLBACK TO CROSSREF
                    return validateCitation(c.author, c.year);
                }));
                results.push(...batchResults);
            }
        }

        // Step 3: DOI validation
        if (mode === "both" || mode === "doi") {
            const rawDois = dois && Array.isArray(dois) ? dois : (text ? extractDoisFromText(text) : []);
            
            // Filter to only those in the text AND limit by targetCount relative to remaining space
            const remainingCount = targetCount > 0 ? Math.max(0, targetCount - results.length) : rawDois.length;
            const doisToCheck = rawDois.slice(0, remainingCount);

            const CONCURRENCY = 5;
            for (let i = 0; i < doisToCheck.length; i += CONCURRENCY) {
                const batch = doisToCheck.slice(i, i + CONCURRENCY);
                const batchResults = await Promise.all(batch.map(async (doi: string) => {
                    // LIBRARY MATCH FIRST
                    if (libraryDois.some(ld => ld.toLowerCase() === doi.toLowerCase())) {
                        return { 
                            type: "doi", 
                            doi, 
                            valid: true, 
                            title: "Verified in Source Library" 
                        } as DoiResult;
                    }
                    return validateDoi(doi);
                }));
                results.push(...batchResults);
            }
        }

        // Final trimming to match targetCount exactly if exceeded
        const finalResults = targetCount > 0 ? results.slice(0, targetCount) : results;

        const validCount = finalResults.filter(r => r.valid).length;
        const invalidCount = finalResults.filter(r => !r.valid).length;
        const fakeCount = finalResults.filter(r => !r.valid && (r.reason?.includes("not found") || r.reason?.includes("fake"))).length;

        const output = finalResults
            .filter(r => r.type === "author")
            .map(r => {
                const ar = r as AuthorResult;
                return { author: ar.author, year: ar.year, valid: ar.valid };
            });

        return NextResponse.json({
            results: finalResults,
            output,
            summary: {
                total: finalResults.length,
                valid: validCount,
                invalid: invalidCount,
                fake: fakeCount,
                passRate: finalResults.length > 0 ? ((validCount / finalResults.length) * 100).toFixed(1) + "%" : "N/A"
            },
            invalidCitations: finalResults
                .filter(r => !r.valid && r.type === "author")
                .map(r => {
                    const ar = r as AuthorResult;
                    return { author: ar.author, year: ar.year, valid: false, reason: ar.reason, suggestedTitle: ar.suggestedTitle, suggestedDoi: ar.suggestedDoi };
                })
        });

    } catch (error) {
        console.error("Citation validation error:", error);
        return NextResponse.json({ error: "Failed to validate citations." }, { status: 500 });
    }
}
