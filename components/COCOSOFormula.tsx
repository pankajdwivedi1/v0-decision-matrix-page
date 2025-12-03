"use client";

import React, { useEffect, useRef } from "react";

type COCOSOFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * COCOSOFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step COCOSO formulas as LaTeX
 *
 * Usage:
 *   import COCOSOFormula from "@/components/COCOSOFormula";
 *   <COCOSOFormula />
 */
export default function COCOSOFormula({ compact = false }: COCOSOFormulaProps) {
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
    title: "\\textbf{COCOSO (Combined Compromise Solution) — Steps}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using linear normalization.}",
    step2_benefit:
      "r_{i,j} = \\frac{x_{i,j}}{\\max_i x_{i,j}}, \\quad \\text{for benefit (max) criteria}",
    step2_cost:
      "r_{i,j} = \\frac{\\min_i x_{i,j}}{x_{i,j}}, \\quad \\text{for cost (min) criteria}",
    step3_intro:
      "\\textbf{3. Weighted Normalized Matrix:} \\quad \\text{Multiply each normalized value by its corresponding criterion weight.}",
    step3_formula:
      "v_{i,j} = w_j \\times r_{i,j}, \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1",
    step4_intro:
      "\\textbf{4. Weighted Sum (WSM):} \\quad \\text{Calculate the weighted sum model score for each alternative.}",
    step4_formula:
      "S_i = \\sum_{j=1}^{n} v_{i,j}, \\quad i = 1, 2, \\ldots, m",
    step5_intro:
      "\\textbf{5. Weighted Product (WPM):} \\quad \\text{Calculate the weighted product model score for each alternative.}",
    step5_formula:
      "P_i = \\prod_{j=1}^{n} (v_{i,j})^{w_j}, \\quad i = 1, 2, \\ldots, m",
    step6_intro:
      "\\textbf{6. Three Compromise Scores:} \\quad \\text{Calculate three different compromise scores using arithmetic, geometric, and harmonic means.}",
    step6_arithmetic:
      "k_{ia} = \\frac{S_i + P_i}{\\sum_{i=1}^{m} (S_i + P_i)}",
    step6_geometric:
      "k_{ib} = \\frac{S_i}{\\min_i S_i} + \\frac{P_i}{\\min_i P_i}",
    step6_harmonic:
      "k_{ic} = \\frac{\\lambda S_i + (1-\\lambda) P_i}{(\\lambda \\max_i S_i + (1-\\lambda) \\max_i P_i)}, \\quad \\lambda = 0.5",
    step7_intro:
      "\\textbf{7. Final COCOSO Score:} \\quad \\text{Calculate the final score as a combination of the three compromise scores.}",
    step7_formula:
      "k_i = \\frac{k_{ia} + k_{ib} + k_{ic}}{3} + (k_{ia} \\times k_{ib} \\times k_{ic})^{1/3}",
    ranking:
      "\\textbf{8. Ranking:} \\quad \\text{Alternatives are ranked in descending order of } k_i. \\text{ (Higher } k_i \\Rightarrow \\text{better alternative)}",
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
            Normalization: Normalize the decision matrix using linear normalization to make criteria
            comparable.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Benefit (Max) Criteria</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_benefit}\\)` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Cost (Min) Criteria</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_cost}\\)` }}
              />
            </div>
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
            Weighted Sum (WSM): Calculate the weighted sum model score for each alternative.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Weighted Product (WPM): Calculate the weighted product model score for each alternative.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">Three Compromise Scores: Calculate three different compromise scores using arithmetic, geometric, and harmonic approaches.</div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Arithmetic Mean (k<sub>ia</sub>)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_arithmetic}\\]` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Geometric Mean (k<sub>ib</sub>)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_geometric}\\]` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Harmonic Mean (k<sub>ic</sub>)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_harmonic}\\]` }}
              />
            </div>
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Final COCOSO Score: Calculate the final score as a combination of the three compromise scores.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\[${latex.step7_formula}\\]` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Ranking: Rank alternatives based on their COCOSO scores.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.ranking}\\)` }}
            />
          </div>
        </li>
      </ol>

      <div className="mt-4 text-xs text-gray-500">
        Source: COCOSO method formulation (Yazdani et al., 2019). The method combines three
        compromise solutions (arithmetic, geometric, and harmonic) to provide a robust ranking
        of alternatives based on weighted sum and weighted product models.
      </div>
      </div>
    </>
  );
}

