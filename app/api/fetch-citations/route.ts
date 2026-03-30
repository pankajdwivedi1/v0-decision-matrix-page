import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Paper {
    title: string;
    authors: string;
    year: number | null;
    journal: string;
    doi: string;
}

// ─── Helper: CrossRef API ─────────────────────────────────────────────────────
async function fetchCrossRef(query: string): Promise<Paper[]> {
    try {
        const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=100&sort=relevance&filter=type:journal-article,from-pub-date:2018`;
        const res = await fetch(url, {
            headers: { "User-Agent": "DecisionAlgo/1.0 (mailto:research@decisionalgo.app)" },
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) return [];
        const data = await res.json();
        const topPublishers = ["elsevier", "springer", "ieee", "wiley", "nature", "mdpi", "taylor & francis", "oxford university press"];
        
        return (data.message?.items || [])
            .filter((p: any) => {
                const journal = (p["container-title"]?.[0] || "").toLowerCase();
                const publisher = (p.publisher || "").toLowerCase();
                const isTopPublisher = topPublishers.some(tp => journal.includes(tp) || publisher.includes(tp));
                return p.DOI && p.title?.[0] && p.author && p.author.length > 0 && isTopPublisher;
            })
            .map((p: any) => ({
                title: p.title?.[0] || "Untitled",
                authors: p.author
                    ? p.author.slice(0, 3).map((a: any) => `${a.family || ""}${a.given ? ", " + a.given.charAt(0) + "." : ""}`).join("; ") +
                      (p.author.length > 3 ? " et al." : "")
                    : "Unknown Authors",
                year: p.published?.["date-parts"]?.[0]?.[0] || null,
                journal: p["container-title"]?.[0] || p.publisher || "Unknown Journal",
                doi: p.DOI
            }));
    } catch {
        return [];
    }
}

// ─── Helper: Semantic Scholar API ────────────────────────────────────────────
async function fetchSemanticScholar(query: string): Promise<Paper[]> {
    try {
        const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=80&fields=title,authors,year,venue,externalIds,publicationTypes`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) return [];
        const data = await res.json();
        const topPublishers = ["elsevier", "springer", "ieee", "wiley", "nature", "mdpi", "taylor", "oxford", "sciencedirect"];
        
        return (data.data || [])
            .filter((p: any) => {
                const isArticle = (p.publicationTypes || []).includes("JournalArticle");
                const venue = (p.venue || "").toLowerCase();
                const isTopPublisher = topPublishers.some(tp => venue.includes(tp));
                return p.externalIds?.DOI && p.title && p.authors && p.authors.length > 0 && isArticle && (isTopPublisher || !p.publicationTypes);
            })
            .map((p: any) => ({
                title: p.title,
                authors: p.authors
                    ? p.authors.slice(0, 3).map((a: any) => a.name).join("; ") +
                      (p.authors.length > 3 ? " et al." : "")
                    : "No Data",
                year: p.year || null,
                journal: p.venue || "Unknown Journal",
                doi: p.externalIds.DOI
            }));
    } catch {
        return [];
    }
}

// ─── Main: Combine + Dedup ─────────────────────────────────────────────────
async function getPapers(query: string, limit: number = 80): Promise<Paper[]> {
    const [crossref, semantic] = await Promise.allSettled([
        fetchCrossRef(query),
        fetchSemanticScholar(query)
    ]);

    const crossrefResults = crossref.status === "fulfilled" ? crossref.value : [];
    const semanticResults = semantic.status === "fulfilled" ? semantic.value : [];

    const all = [...crossrefResults, ...semanticResults];

    // Deduplicate by DOI + Journal Diversity Filter
    const seenDois = new Set<string>();
    const journalCounts = new Map<string, number>();
    
    const dedupedAndDiverse = all.filter(p => {
        if (!p.doi) return false;
        
        // 1. DOI uniqueness
        const doiKey = p.doi.toLowerCase();
        if (seenDois.has(doiKey)) return false;

        // 2. Journal Diversity (max 2 per journal)
        const journalKey = (p.journal || "Unknown")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ""); // Clean string for comparison
        
        const count = journalCounts.get(journalKey) || 0;
        if (count >= 2) return false; // LIMIT: Max 2 papers per journal

        // If it passes both:
        seenDois.add(doiKey);
        journalCounts.set(journalKey, count + 1);
        return true;
    });

    // Filter: must have year, title, and preferably a real journal name
    const valid = dedupedAndDiverse
        .filter(p => p.year && p.year >= 2018 && p.title && p.title.length > 10)
        .slice(0, limit);

    return valid;
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const { query, limit = 30 } = await req.json();

        if (!query || typeof query !== "string" || query.trim().length < 3) {
            return NextResponse.json({ error: "A valid search query is required." }, { status: 400 });
        }

        const papers = await getPapers(query.trim(), limit);

        // Format into the citation injection string
        const citationContext = papers
            .map(p => `${p.authors} (${p.year}). ${p.title}. ${p.journal}. https://doi.org/${p.doi}`)
            .join("\n");

        return NextResponse.json({
            papers,
            citationContext,
            count: papers.length
        });

    } catch (error) {
        console.error("Citation fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch citations." }, { status: 500 });
    }
}
