"use client";

import React, { useEffect, useRef } from "react";

type CODASFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * CODASFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step CODAS formulas as LaTeX
 *
 * Usage:
 *   import CODASFormula from "@/components/CODASFormula";
 *   <CODASFormula />
 */
export default function CODASFormula({ compact = false }: CODASFormulaProps) {
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
  }, []);

  // LaTeX strings for each step
  const latex = {
    title: "\\textbf{CODAS (Combinative Distance-based Assessment) — Steps}",
    intro: "\\text{CODAS is a multi-criteria decision-making method that evaluates alternatives based on their distances from a negative-ideal solution, utilizing both Euclidean and Taxicab (Manhattan) distances.}",
    step1_matrix:
      "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step1_explanation:
      "\\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using linear normalization.}",
    step2_beneficial:
      "\\text{For beneficial criteria:} \\quad r_{i,j} = \\frac{x_{i,j} - \\min_i(x_{i,j})}{\\max_i(x_{i,j}) - \\min_i(x_{i,j})} \\tag{2}",
    step2_nonbeneficial:
      "\\text{For non-beneficial criteria:} \\quad r_{i,j} = \\frac{\\max_i(x_{i,j}) - x_{i,j}}{\\max_i(x_{i,j}) - \\min_i(x_{i,j})} \\tag{3}",
    step3_intro:
      "\\textbf{3. Negative-Ideal Solution (NIS):} \\quad \\text{Determine the worst performance values across all criteria to form the negative-ideal solution.}",
    step3_formula:
      "NIS_j = \\begin{cases} \\min_i r_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\max_i r_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases} \\tag{4}",
    step4_intro:
      "\\textbf{4. Euclidean Distance:} \\quad \\text{Calculate the weighted Euclidean distance of each alternative from the negative-ideal solution.}",
    step4_formula:
      "d_i^E = \\sqrt{\\sum_{j=1}^{n} w_j (r_{i,j} - NIS_j)^2}, \\quad i = 1, 2, \\ldots, m \\tag{5}",
    step5_intro:
      "\\textbf{5. Taxicab Distance:} \\quad \\text{Calculate the weighted Taxicab (Manhattan) distance of each alternative from the negative-ideal solution.}",
    step5_formula:
      "d_i^T = \\sum_{j=1}^{n} w_j |r_{i,j} - NIS_j|, \\quad i = 1, 2, \\ldots, m \\tag{6}",
    step6_intro:
      "\\textbf{6. Relative Assessment Score:} \\quad \\text{Calculate the relative assessment score by combining Euclidean and Taxicab distances.}",
    step6_formula:
      "RA_i = d_i^E + \\tau \\cdot d_i^T, \\quad i = 1, 2, \\ldots, m \\tag{7}",
    step6_param:
      "\\text{where } \\tau = 0.02 \\text{ (threshold parameter, typically } 0.01 \\text{ to } 0.05\\text{)}",
    ranking:
      "\\textbf{7. Ranking:} \\quad \\text{Alternatives are ranked in descending order of } RA_i. \\text{ (Higher } RA_i \\Rightarrow \\text{better alternative)}",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{CODAS uses Euclidean distance as the primary measure and Taxicab distance as a tiebreaker. Alternatives farther from the negative-ideal solution (higher scores) are preferred.}",
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
            overflow-x: auto;
            overflow-y: hidden;
            
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
          

          /* Mobile adjustments */
          @media (max-width: 640px) {
            
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
                dangerouslySetInnerHTML={{ __html: `\\[${latex.title}\\]` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 leading-relaxed" style={{ fontSize: "0.875rem" }}>
            CODAS is a multi-criteria decision-making method that evaluates alternatives based on their distances from a negative-ideal solution, utilizing both Euclidean and Taxicab (Manhattan) distances.
          </p>
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
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_matrix}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_explanation}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Normalization: Normalize the decision matrix using linear normalization for each criterion.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_beneficial}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_nonbeneficial}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Negative-Ideal Solution (NIS): Determine the worst performance values across all criteria to form the negative-ideal solution.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Euclidean Distance: Calculate the weighted Euclidean distance of each alternative from the negative-ideal solution.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Taxicab Distance: Calculate the weighted Taxicab (Manhattan) distance of each alternative from the negative-ideal solution.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Relative Assessment Score: Calculate the relative assessment score by combining Euclidean and Taxicab distances.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_formula}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_param}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Ranking: Rank alternatives based on their relative assessment scores.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }}
              />
            </div>
          </li>
        </ol>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-blue-900 mb-2">Interpretation</div>
          <p className="text-sm text-gray-700 leading-relaxed" style={{ fontSize: "0.875rem" }}>
            CODAS uses Euclidean distance as the primary measure and Taxicab distance as a tiebreaker. Alternatives farther from the negative-ideal solution (higher scores) are preferred.
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Source: CODAS method formulation (Keshavarz Ghorabaee et al., 2016). The method evaluates
          alternatives based on their distances from a negative-ideal solution, utilizing both
          Euclidean distance as the primary measure and Taxicab distance as a tiebreaker when
          alternatives are very similar.
        </div>
      </div>
    </>
  );
}



