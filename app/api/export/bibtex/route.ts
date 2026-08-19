import { NextRequest, NextResponse } from "next/server";

/**
 * BibTeX Export Route
 * Parses APA-style references from manuscript content and generates a .bib file.
 */

function escapeBibtex(str: string): string {
  return (str || "")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\$/g, "\\$")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}");
}

function generateBibKey(author: string, year: string): string {
  // Extract first author last name
  const firstAuthor = author.split(",")[0].split("&")[0].trim();
  const lastName = firstAuthor.split(" ").pop() || "Author";
  const cleanName = lastName.replace(/[^a-zA-Z]/g, "");
  return `${cleanName}${year}`;
}

interface ParsedReference {
  key: string;
  authors: string;
  year: string;
  title: string;
  journal: string;
  volume: string;
  pages: string;
  doi: string;
  raw: string;
}

function parseApaReference(line: string): ParsedReference | null {
  if (line.trim().length < 20) return null;

  // Pattern: Author, A., & Author, B. (YEAR). Title. Journal, volume(issue), pages. https://doi.org/...
  const yearMatch = line.match(/\((\d{4})\)/);
  if (!yearMatch) return null;

  const year = yearMatch[1];
  const authorPart = line.substring(0, line.indexOf(`(${year})`)).trim().replace(/\.$/, "");

  // Extract DOI
  const doiMatch = line.match(/(?:https?:\/\/doi\.org\/|doi:\s*)(10\.\S+)/i);
  const doi = doiMatch ? doiMatch[1] : "";

  // Extract title — text between year and journal (after the period following year)
  const afterYear = line.substring(line.indexOf(`(${year}).`) + `(${year}).`.length).trim();
  const titleEndIdx = afterYear.indexOf(". ");
  const title = titleEndIdx > 0 ? afterYear.substring(0, titleEndIdx).trim() : afterYear.split(".")[0].trim();

  // Extract journal — text after title
  const afterTitle = titleEndIdx > 0 ? afterYear.substring(titleEndIdx + 2) : "";
  const journalMatch = afterTitle.match(/^([^,\.]+)/);
  const journal = journalMatch ? journalMatch[1].trim() : "";

  // Extract volume and pages
  const volumeMatch = afterTitle.match(/,\s*(\d+)(?:\([\d\-]+\))?,\s*([\d\-–]+)/);
  const volume = volumeMatch ? volumeMatch[1] : "";
  const pages = volumeMatch ? volumeMatch[2] : "";

  const key = generateBibKey(authorPart, year);

  return {
    key,
    authors: authorPart,
    year,
    title: title.replace(/\*\*/g, "").replace(/\*/g, ""),
    journal,
    volume,
    pages,
    doi,
    raw: line.trim(),
  };
}

function formatAuthorsForBibtex(authors: string): string {
  // Convert APA style "Smith, J., & Jones, B." to BibTeX "Smith, J. and Jones, B."
  return authors
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

function buildBibEntry(ref: ParsedReference, index: number): string {
  // Ensure unique keys with index suffix
  const key = `${ref.key}_${index}`;

  let entry = `@article{${key},\n`;
  if (ref.authors) entry += `  author    = {${escapeBibtex(formatAuthorsForBibtex(ref.authors))}},\n`;
  if (ref.year)    entry += `  year      = {${ref.year}},\n`;
  if (ref.title)   entry += `  title     = {{${escapeBibtex(ref.title)}}},\n`;
  if (ref.journal) entry += `  journal   = {${escapeBibtex(ref.journal)}},\n`;
  if (ref.volume)  entry += `  volume    = {${ref.volume}},\n`;
  if (ref.pages)   entry += `  pages     = {${ref.pages}},\n`;
  if (ref.doi)     entry += `  doi       = {${ref.doi}},\n`;
  entry += `}\n`;

  return entry;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, references } = body;

    // Accept either pre-parsed references array or raw content to parse
    let parsedRefs: ParsedReference[] = [];

    if (references && Array.isArray(references) && references.length > 0) {
      // Use provided structured references
      parsedRefs = references.map((r: any, i: number) => ({
        key: generateBibKey(r.author || r.authors || "Author", r.year || "2024"),
        authors: r.author || r.authors || "",
        year: r.year || "2024",
        title: r.title || "",
        journal: r.journal || "",
        volume: r.volume || "",
        pages: r.pages || "",
        doi: r.doi || "",
        raw: r.raw || "",
      }));
    } else if (content) {
      // Parse from raw manuscript content
      const lines = content.split("\n");
      let inReferences = false;

      for (const line of lines) {
        const trimmed = line.trim();

        // Detect references section
        if (/^#{1,3}\s*(references|bibliography|works cited)/i.test(trimmed)) {
          inReferences = true;
          continue;
        }

        if (inReferences && trimmed.length > 20) {
          const parsed = parseApaReference(trimmed);
          if (parsed) parsedRefs.push(parsed);
        }
      }
    }

    if (parsedRefs.length === 0) {
      return NextResponse.json(
        { error: "No references found. Generate manuscript first or ensure the References section is included." },
        { status: 400 }
      );
    }

    // Build .bib file
    const header = `%% BibTeX References — Generated by Rankowise MCDM Platform
%% https://www.rankowise.online
%% Generated: ${new Date().toISOString()}
%% Total entries: ${parsedRefs.length}
%%
%% Usage: \\bibliography{references} in your LaTeX document
%%        \\bibliographystyle{elsarticle-num}
\n`;

    const entries = parsedRefs.map((ref, i) => buildBibEntry(ref, i + 1)).join("\n");
    const bibtexContent = header + entries;

    return NextResponse.json({
      bibtex: bibtexContent,
      count: parsedRefs.length,
      filename: "rankowise_references.bib",
      parsed: parsedRefs.map((r) => ({ key: r.key, title: r.title, year: r.year, doi: r.doi })),
    });
  } catch (err: any) {
    console.error("BibTeX export error:", err);
    return NextResponse.json({ error: err.message || "BibTeX generation failed" }, { status: 500 });
  }
}
