"use client";

import React, { useEffect, useRef } from "react";

type MULTIMOORAFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * MULTIMOORAFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step MULTIMOORA formulas as LaTeX
 *
 * Usage:
 *   import MULTIMOORAFormula from "@/components/MULTIMOORAFormula";
 *   <MULTIMOORAFormula />
 */
export default function MULTIMOORAFormula({ compact = false }: MULTIMOORAFormulaProps) {
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
        // Configure MathJax for smaller fonts and wrapping
        if (window.MathJax) {
          window.MathJax.options = {
            ...window.MathJax.options,
            menuOptions: {
              ...window.MathJax.options?.menuOptions,
            },
          };
          window.MathJax.startup = {
            ...window.MathJax.startup,
            typeset: false,
          };
        }
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
    title: "\\textbf{MULTIMOORA (Multi-Objective Optimization by Ratio Analysis plus Full Multiplicative Form) — Steps}",
    intro: "\\text{MULTIMOORA combines three methods: Ratio System (RS), Reference Point (RP), and Full Multiplicative Form (FMF).}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using vector normalization.}",
    step2_formula:
      "r_{i,j} = \\frac{x_{i,j}}{\\sqrt{\\sum_{i=1}^{m} x_{i,j}^2}}, \\quad i = 1, 2, \\ldots, m, \\quad j = 1, 2, \\ldots, n",
    step3_intro:
      "\\textbf{3. Weighted Normalized Matrix:} \\quad \\text{Multiply each normalized value by its corresponding criterion weight.}",
    step3_formula:
      "v_{i,j} = w_j \\times r_{i,j}, \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1",
    step4a_intro:
      "\\textbf{4a. Ratio System (RS):} \\quad \\text{Calculate the score as the difference between beneficial and non-beneficial criteria sums.}",
    step4a_formula:
      "y_i^{RS} = \\sum_{j \\in \\text{beneficial}} v_{i,j} - \\sum_{j \\in \\text{non-beneficial}} v_{i,j}, \\quad i = 1, 2, \\ldots, m",
    step4b_intro:
      "\\textbf{4b. Reference Point (RP):} \\quad \\text{Calculate the Tchebycheff distance from each alternative to the reference point (ideal solution).}",
    step4b_reference:
      "v_j^* = \\begin{cases} \\max_i v_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\min_i v_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases}",
    step4b_formula:
      "z_i^{RP} = \\max_j |v_{i,j} - v_j^*|, \\quad i = 1, 2, \\ldots, m",
    step4c_intro:
      "\\textbf{4c. Full Multiplicative Form (FMF):} \\quad \\text{Calculate the ratio of product of beneficial criteria to product of non-beneficial criteria.}",
    step4c_formula:
      "u_i^{FMF} = \\frac{\\prod_{j \\in \\text{beneficial}} v_{i,j}}{\\prod_{j \\in \\text{non-beneficial}} v_{i,j}}, \\quad i = 1, 2, \\ldots, m",
    step5_intro:
      "\\textbf{5. Ranking:} \\quad \\text{Rank alternatives separately for each method:}",
    step5_rs:
      "\\text{RS: Rank in descending order of } y_i^{RS} \\text{ (higher is better)}",
    step5_rp:
      "\\text{RP: Rank in ascending order of } z_i^{RP} \\text{ (lower is better)}",
    step5_fmf:
      "\\text{FMF: Rank in descending order of } u_i^{FMF} \\text{ (higher is better)}",
    step6_intro:
      "\\textbf{6. Final Ranking:} \\quad \\text{Combine the three rankings using dominance theory. The final score is the average of the three rankings (lower average rank = better alternative).}",
    step6_formula:
      "\\text{Final Score}_i = \\frac{\\text{Rank}_{RS}(i) + \\text{Rank}_{RP}(i) + \\text{Rank}_{FMF}(i)}{3}",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{MULTIMOORA provides a robust ranking by combining three different approaches. The method that dominates in most rankings is considered the best alternative.}",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .latex {
            font-size: 0.875rem !important;
            line-height: 1.5;
          }
          .latex mjx-container {
            font-size: 0.875rem !important;
            max-width: 100% !important;
            overflow-x: visible !important;
            display: inline-block !important;
          }
          .latex mjx-math {
            font-size: 0.875rem !important;
          }
        `
      }} />
      <div
        ref={containerRef}
        className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-6 ${
          compact ? "text-sm" : "text-base"
        }`}
        style={{
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
      <div className="mb-4">
        <div>
          {/* Title */}
          <div style={{ fontSize: compact ? 18 : 20, fontWeight: 700 }}>
            <span
              className="latex"
              dangerouslySetInnerHTML={{ __html: `\\(${latex.title}\\)` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div
          className="latex text-sm"
          style={{ fontSize: "0.875rem" }}
          dangerouslySetInnerHTML={{ __html: `\\(${latex.intro}\\)` }}
        />
      </div>

      <ol className="space-y-4 list-decimal pl-5">
        <li>
          <div className="mb-2 font-semibold">
            Decision Matrix Construction: Construct the decision matrix with alternatives as rows and
            criteria as columns.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step1}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Normalization: Normalize the decision matrix using vector normalization to make criteria comparable.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Weighted Normalized Matrix: Apply criterion weights to the normalized matrix.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Ratio System (RS): Calculate the score as the difference between beneficial and non-beneficial criteria sums.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step4a_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Reference Point (RP): Calculate the Tchebycheff distance from each alternative to the reference point (ideal solution).
          </div>
          <div className="bg-gray-50 p-3 rounded space-y-2">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step4b_reference}\\)` }}
            />
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step4b_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Full Multiplicative Form (FMF): Calculate the ratio of product of beneficial criteria to product of non-beneficial criteria.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step4c_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Ranking: Rank alternatives separately for each method.
          </div>
          <div className="bg-gray-50 p-3 rounded space-y-2">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_rs}\\)` }}
            />
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_rp}\\)` }}
            />
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_fmf}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Final Ranking: Combine the three rankings using dominance theory.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step6_formula}\\)` }}
            />
          </div>
        </li>
      </ol>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-blue-900 mb-2">Interpretation</div>
        <div
          className="latex text-sm"
          style={{ fontSize: "0.875rem" }}
          dangerouslySetInnerHTML={{ __html: `\\(${latex.interpretation}\\)` }}
        />
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Source: MULTIMOORA method formulation (Brauers & Zavadskas, 2010). The method combines three
        different approaches (Ratio System, Reference Point, and Full Multiplicative Form) to provide
        a robust ranking of alternatives. The final ranking is determined by combining the three
        individual rankings using dominance theory.
      </div>
      </div>
    </>
  );
}

