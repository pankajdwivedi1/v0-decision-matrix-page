"use client";

import React, { useEffect, useRef } from "react";

type SWEIFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * SWEIFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step SWEI formulas as LaTeX
 *
 * Usage:
 *   import SWEIFormula from "@/components/SWEIFormula";
 *   <SWEIFormula />
 */
export default function SWEIFormula({ compact = false }: SWEIFormulaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load MathJax if not present
  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = document.querySelector('script[data-mathjax="loaded"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      script.setAttribute("data-mathjax", "loaded");
      document.head.appendChild(script);
      script.onload = () => {
        // typeset the initial content
        setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
      };
    } else {
      // typeset if already loaded
      setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
    }
  }, []);

  // Re-typeset after every render (safe; MathJax caches)
  useEffect(() => {
    setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
  });

  // LaTeX strings for each step
  const latex = {
    title: "\\textbf{SWEI (Sum Weighted Exponential Information) — Steps}",
    step1:
      "\\textbf{1. IDM:} \\quad A = [a_{i,j}]_{m\\times n} = \\begin{bmatrix} a_{1,1} & a_{1,2} & \\dots & a_{1,n} \\\\ a_{2,1} & a_{2,2} & \\dots & a_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m,1} & a_{m,2} & \\dots & a_{m,n} \\end{bmatrix}, \\quad \\text{Where} \\quad i=1,2,3, \\dots m \\text{(alternative)}, \\quad j=1,2,3, \\dots n \\text {(criteria)}, \\quad \\text {and} \\quad a_{m,n}>0", 
    step2_intro:
      "\\textbf{2. Normalization (Information Decision Matrix — IDM):}\\quad \\text{For each criterion } j, \\text{ compute } IDM_{i,j}.",
    step2_benefit:
      "\\displaystyle \\overline {IDM}_{i,j} = \\frac{a_{i,j}}{\\sum_{i=1}^{m} a_{i,j}},  \\quad \\quad \\text{where} \\sum_{i=1}^{m} \\overline {IDM}_{i,j}=1",
    step2_cost:
      "\\displaystyle \\overline {IDM}_{i,j} = \\frac{1/a_{i,j}}{\\sum_{i=1}^{m} 1/a_{i,j}}, \\quad \\quad \\text{where} \\sum_{i=1}^{m} \\overline {IDM}_{i,j}=1",
    step3_intro:
      "\\textbf{3a. Information per cell and attribute:} \\quad Info_{i,j} = \\log_{2}\\left(\\dfrac{1}{\\overline {IDM}_{i,j}}\\right)",
    step3_exp:
      "\\textbf{3b. Weighted exponential information (SWEI score):} \\quad Score_{i,j} = \\big( Info_{i,j} \\big)^{w_j}, \\quad \\text{where} \\sum_{j=1}^{n} {w}_{j}=1",
    step4:
      "\\textbf{4. SWEI score for alternative } i:\\quad SWEI''_i = \\sum_{j=1}^{n} Score_{i,j} = \\sum_{j=1}^{n}  \\left[ \\log_{2} \\left( \\dfrac{1}{\\overline {IDM}_{i,j}}\\right) \\right]^{w_j}",
    ranking:
      "\\textbf{5. Ranking:} \\quad \\text{Alternatives are ordered by } SWEI''_i. \\text{(}\\text{lower} \\; SWEI''_i \\Rightarrow \\text{better rank in the original paper)}",
    note: "Lower SWEI score indicates better alternative ranking",
  };

  return (
    <div
      ref={containerRef}
      className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-6 ${
        compact ? "text-sm" : "text-base"
      }`}
    >
      <div className="mb-4">
        <div>
          {/* Title */}
          <div style={{ fontSize: compact ? 18 : 20, fontWeight: 700 }}>
            <span
              className="latex"
              // math content in inline-block ensures MathJax finds it
              dangerouslySetInnerHTML={{ __html: `\\(${latex.title}\\)` }}
            />
          </div>
        </div>
      </div>

      <ol className="space-y-4 list-decimal pl-5">
        <li>
          <div className="mb-2 font-semibold">Information Decision Matrix(IDM): The decision-maker constructs the IDM in the first step to solve the MADM/MCDM problem.</div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="latex" dangerouslySetInnerHTML={{ __html: `\\(${latex.step1}\\)` }} />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">Normalization (IDM): The values are normalized in two steps; the first will be used for the desirable criteria, and the second will be used for the undesirable criteria.</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm italic mb-2">Benefit (desirable) criteria</div>
              <div className="latex" dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_benefit}\\)` }} />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm italic mb-2">Cost (undesirable) criteria</div>
              <div className="latex" dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_cost}\\)` }} />
            </div>
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">Information score: In the third step, calculate the amount of information and weighted exponential information for all attributes of the IDM.</div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="latex" dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_intro}\\)` }} />
            <div className="mt-2 latex" dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_exp}\\)` }} />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">SWEI score: In fourth step, sumup the total weighted exponential information for all atttributes.</div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="latex" dangerouslySetInnerHTML={{ __html: `\\(${latex.step4}\\)` }} />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">Ranking: Lastly rank the alternatives.</div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="latex" dangerouslySetInnerHTML={{ __html: `\\(${latex.ranking}\\)` }} />
          </div>
        </li>
      </ol>

      <div className="mt-4 text-xs text-gray-500">
        Source: SWEI formulation (information-theoretic normalization & exponential weighted aggregation). <a className="text-blue-500 underline font-bold" target="_blank" href="https://doi.org/10.1016/j.rser.2025.115791"> (Article by Dr Pankaj Prasad Dwivedi et al. 2025)</a>
      </div>
    </div>
  );
}
