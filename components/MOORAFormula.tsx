"use client";

import React, { useEffect, useRef } from "react";

type MOORAFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * MOORAFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step MOORA formulas as LaTeX
 *
 * Usage:
 *   import MOORAFormula from "@/components/MOORAFormula";
 *   <MOORAFormula />
 */
export default function MOORAFormula({ compact = false }: MOORAFormulaProps) {
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
    title: "\\textbf{MOORA (Multi-Objective Optimization by Ratio Analysis) — Steps}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization (Ratio System):} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using ratio analysis.}",
    step2_formula:
      "x_{i,j}^* = \\frac{x_{i,j}}{\\sqrt{\\sum_{i=1}^{m} x_{i,j}^2}}, \\quad i = 1, 2, \\ldots, m, \\quad j = 1, 2, \\ldots, n",
    step3_intro:
      "\\textbf{3. Weighted Normalized Matrix:} \\quad \\text{Multiply each normalized value by its corresponding criterion weight.}",
    step3_formula:
      "y_{i,j} = w_j \\times x_{i,j}^*, \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1",
    step4_intro:
      "\\textbf{4. Sum for Beneficial Criteria:} \\quad \\text{Calculate the sum of weighted normalized values for beneficial (maximizing) criteria.}",
    step4_formula:
      "y_i^+ = \\sum_{j=1}^{k} y_{i,j}, \\quad \\text{where } k \\text{ is the number of beneficial criteria}",
    step5_intro:
      "\\textbf{5. Sum for Non-Beneficial Criteria:} \\quad \\text{Calculate the sum of weighted normalized values for non-beneficial (minimizing) criteria.}",
    step5_formula:
      "y_i^- = \\sum_{j=k+1}^{n} y_{i,j}, \\quad \\text{where } n-k \\text{ is the number of non-beneficial criteria}",
    step6_intro:
      "\\textbf{6. MOORA Score:} \\quad \\text{Calculate the final score as the difference between beneficial and non-beneficial sums.}",
    step6_formula:
      "y_i = y_i^+ - y_i^-, \\quad i = 1, 2, \\ldots, m",
    ranking:
      "\\textbf{7. Ranking:} \\quad \\text{Alternatives are ranked in descending order of } y_i. \\text{ (Higher } y_i \\Rightarrow \\text{better alternative)}",
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
            Normalization (Ratio System): Normalize the decision matrix using ratio analysis (vector normalization) to make criteria comparable.
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
            Sum for Beneficial Criteria: Calculate the sum of weighted normalized values for beneficial (maximizing) criteria.
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
            Sum for Non-Beneficial Criteria: Calculate the sum of weighted normalized values for non-beneficial (minimizing) criteria.
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
          <div className="mb-2 font-semibold">
            MOORA Score: Calculate the final score as the difference between beneficial and non-beneficial sums.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step6_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Ranking: Rank alternatives based on their MOORA scores.
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
        Source: MOORA method formulation (Brauers & Zavadskas, 2006). The method optimizes multiple
        objectives simultaneously by using ratio analysis, where beneficial criteria are maximized
        and non-beneficial criteria are minimized.
      </div>
      </div>
    </>
  );
}

