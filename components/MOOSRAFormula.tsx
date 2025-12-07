"use client";

import React, { useEffect, useRef } from "react";

type MOOSRAFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * MOOSRAFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step MOOSRA formulas as LaTeX
 *
 * Usage:
 *   import MOOSRAFormula from "@/components/MOOSRAFormula";
 *   <MOOSRAFormula />
 */
export default function MOOSRAFormula({ compact = false }: MOOSRAFormulaProps) {
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
    title: "\\textbf{MOOSRA (Multi-Objective Optimization on the basis of Simple Ratio Analysis) — Steps}",
    intro: "\\text{MOOSRA is a multi-criteria decision-making method that evaluates alternatives by calculating the ratio of weighted sum of beneficial criteria to weighted sum of non-beneficial criteria.}",
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
    step4_intro:
      "\\textbf{4. Sum for Beneficial Criteria:} \\quad \\text{Calculate the weighted sum of normalized values for beneficial (maximizing) criteria.}",
    step4_formula:
      "S_i^+ = \\sum_{j \\in \\theta_{\\max}} w_j \\, r_{i,j}, \\quad \\text{where } \\theta_{\\max} \\text{ is the set of beneficial criteria}",
    step5_intro:
      "\\textbf{5. Sum for Non-Beneficial Criteria:} \\quad \\text{Calculate the weighted sum of normalized values for non-beneficial (minimizing) criteria.}",
    step5_formula:
      "S_i^- = \\sum_{j \\in \\theta_{\\min}} w_j \\, r_{i,j}, \\quad \\text{where } \\theta_{\\min} \\text{ is the set of non-beneficial criteria}",
    step6_intro:
      "\\textbf{6. Performance Score:} \\quad \\text{Calculate the performance score as the ratio of beneficial sum to non-beneficial sum.}",
    step6_formula:
      "v_i = \\frac{S_i^+}{S_i^-}, \\quad i = 1, 2, \\ldots, m",
    ranking:
      "\\textbf{7. Ranking:} \\quad \\text{Alternatives are ranked in descending order of } v_i. \\text{ (Higher } v_i \\Rightarrow \\text{better alternative)}",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{MOOSRA evaluates alternatives by comparing the ratio of beneficial to non-beneficial criteria. Higher ratios indicate alternatives with better performance.}",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .latex {
            font-size: 0.875rem !important;
            line-height: 2 !important; 
            margin: 1rem 0;
            display: block;
          }
          .latex mjx-container {
            font-size: 0.875rem !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            display: block !important;
            margin: 0.75rem 0 !important;
            padding: 0.5rem 0 !important;
            text-align: center !important; 
          }
          .latex mjx-math {
            font-size: 0.875rem !important;
            outline: none !important;
          }
          /* Fix list item spacing */
          ol li {
            margin-bottom: 2rem !important;
            line-height: 1.8 !important;
          }
          /* Add more space to gray boxes */
          .bg-gray-50 {
            padding: 1.5rem !important;
            margin: 1rem 0 !important;
            display: block !important;
            width: 100% !important;
            overflow-x: auto;
          }

          /* Mobile adjustments */
          @media (max-width: 640px) {
            .bg-gray-50 {
              padding: 0.75rem !important;
              margin: 0.75rem 0 !important;
            }
            .latex {
              font-size: 0.75rem !important;
            }
            .latex mjx-container {
              margin: 0.5rem 0 !important;
              padding: 0.25rem 0 !important;
            }
            h1 {
              font-size: 1.25rem !important;
              margin-bottom: 1rem !important;
            }
            h2 {
              font-size: 1rem !important;
              margin-top: 1rem !important;
            }
            p, li {
              font-size: 0.875rem !important;
            }
          }
        `
      }} />
      <div
        ref={containerRef}
        className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 font-['Times_New_Roman',_Times,_serif] ${compact ? "text-sm" : "text-base"
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
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step1}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Normalization: Normalize the decision matrix using vector normalization to make criteria comparable.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_formula}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Weighted Normalized Matrix: Apply criterion weights to the normalized matrix.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_formula}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Sum for Beneficial Criteria: Calculate the weighted sum of normalized values for beneficial (maximizing) criteria.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_formula}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Sum for Non-Beneficial Criteria: Calculate the weighted sum of normalized values for non-beneficial (minimizing) criteria.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_formula}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Performance Score: Calculate the performance score as the ratio of beneficial sum to non-beneficial sum.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step6_formula}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Ranking: Rank alternatives based on their performance scores.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.ranking}\\)` }}
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
          Source: MOOSRA method formulation (Brauers & Zavadskas, 2006). The method evaluates
          alternatives by calculating the ratio of weighted sum of beneficial criteria to weighted sum
          of non-beneficial criteria, providing a simple and effective approach for multi-objective
          optimization.
        </div>
      </div>
    </>
  );
}


