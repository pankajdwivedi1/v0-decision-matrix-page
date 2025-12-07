"use client";

import React, { useEffect, useRef } from "react";

type TODIMFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * TODIMFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step TODIM formulas as LaTeX
 *
 * Usage:
 *   import TODIMFormula from "@/components/TODIMFormula";
 *   <TODIMFormula />
 */
export default function TODIMFormula({ compact = false }: TODIMFormulaProps) {
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
    title: "\\textbf{TODIM (Tomada de Decisão Interativa e Multicritério) — Steps}",
    intro: "\\text{TODIM is a multi-criteria decision-making method based on Prospect Theory. It evaluates alternatives by considering the relative dominance of each option over others, capturing decision-maker's risk preferences.}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using min-max normalization.}",
    step2_beneficial:
      "\\text{For beneficial criteria:} \\quad r_{i,j} = \\frac{x_{i,j} - \\min_i(x_{i,j})}{\\max_i(x_{i,j}) - \\min_i(x_{i,j})}",
    step2_nonbeneficial:
      "\\text{For non-beneficial criteria:} \\quad r_{i,j} = \\frac{\\max_i(x_{i,j}) - x_{i,j}}{\\max_i(x_{i,j}) - \\min_i(x_{i,j})}",
    step3_intro:
      "\\textbf{3. Relative Weights:} \\quad \\text{Calculate relative weights normalized by the maximum weight.}",
    step3_formula:
      "w_j^r = \\frac{w_j}{w_{\\max}}, \\quad \\text{where } w_{\\max} = \\max_j(w_j)",
    step4_intro:
      "\\textbf{4. Dominance Degree:} \\quad \\text{For each pair of alternatives } A_i \\text{ and } A_j \\text{ concerning criterion } C_k, \\text{ calculate the dominance degree using Prospect Theory value function.}",
    step4_formula:
      "\\Phi_k(A_i, A_j) = \\begin{cases} w_k^r \\cdot (z_{i,k} - z_{j,k})^\\alpha & \\text{if } z_{i,k} \\geq z_{j,k} \\text{ (gain)} \\\\ -\\lambda \\cdot w_k^r \\cdot (z_{j,k} - z_{i,k})^\\beta & \\text{if } z_{i,k} < z_{j,k} \\text{ (loss)} \\end{cases}",
    step4_params:
      "\\text{where } \\alpha = 0.88 \\text{ (gain parameter)}, \\quad \\beta = 0.88 \\text{ (loss parameter)}, \\quad \\lambda = 2.25 \\text{ (loss aversion coefficient)}",
    step5_intro:
      "\\textbf{5. Overall Dominance:} \\quad \\text{Calculate the overall dominance of alternative } A_i \\text{ over } A_j \\text{ by summing dominance degrees across all criteria.}",
    step5_formula:
      "\\delta(A_i, A_j) = \\sum_{k=1}^{n} \\Phi_k(A_i, A_j), \\quad i, j = 1, 2, \\ldots, m",
    step6_intro:
      "\\textbf{6. Global Value:} \\quad \\text{Calculate the global value for each alternative by summing its dominance over all other alternatives.}",
    step6_formula:
      "\\xi_i = \\sum_{j=1}^{m} \\delta(A_i, A_j), \\quad i = 1, 2, \\ldots, m",
    step7_intro:
      "\\textbf{7. Normalized Global Value:} \\quad \\text{Normalize the global values to obtain final scores.}",
    step7_formula:
      "\\xi_i^{norm} = \\frac{\\xi_i - \\xi_{\\min}}{\\xi_{\\max} - \\xi_{\\min}}, \\quad i = 1, 2, \\ldots, m",
    ranking:
      "\\textbf{8. Ranking:} \\quad \\text{Alternatives are ranked in descending order of } \\xi_i^{norm}. \\text{ (Higher } \\xi_i^{norm} \\Rightarrow \\text{better alternative)}",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{TODIM captures decision-maker's risk preferences through Prospect Theory. Higher scores indicate alternatives that dominate others more strongly across criteria.}",
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
              Normalization: Normalize the decision matrix using min-max normalization for each criterion.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_beneficial}\\)` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_nonbeneficial}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Relative Weights: Calculate relative weights normalized by the maximum weight.
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
              Dominance Degree: For each pair of alternatives, calculate the dominance degree using Prospect Theory value function.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_formula}\\)` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_params}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Overall Dominance: Calculate the overall dominance of each alternative over others by summing dominance degrees across all criteria.
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
              Global Value: Calculate the global value for each alternative by summing its dominance over all other alternatives.
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
              Normalized Global Value: Normalize the global values to obtain final scores.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step7_formula}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Ranking: Rank alternatives based on their normalized global values.
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
          Source: TODIM method formulation (Gomes & Lima, 1992). The method is based on Prospect Theory
          and evaluates alternatives by considering the relative dominance of each option over others
          across various criteria, effectively capturing the decision-maker's risk preferences through
          gain and loss functions.
        </div>
      </div>
    </>
  );
}



