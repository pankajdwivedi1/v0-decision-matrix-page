"use client";

import React, { useEffect, useRef } from "react";

type MARCOSFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * MARCOSFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step MARCOS formulas as LaTeX
 *
 * Usage:
 *   import MARCOSFormula from "@/components/MARCOSFormula";
 *   <MARCOSFormula />
 */
export default function MARCOSFormula({ compact = false }: MARCOSFormulaProps) {
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
    title: "\\textbf{MARCOS (Measurement of Alternatives and Ranking according to Compromise Solution) — Steps}",
    intro: "\\text{MARCOS is a multi-criteria decision-making method that evaluates alternatives by comparing them to both ideal and anti-ideal solutions, calculating utility degrees to determine the final ranking.}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Ideal and Anti-Ideal Solutions:} \\quad \\text{Determine the ideal (AI) and anti-ideal (AAI) solutions for each criterion.}",
    step2_ideal:
      "AI_j = \\begin{cases} \\max_i x_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\min_i x_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases}",
    step2_antiideal:
      "AAI_j = \\begin{cases} \\min_i x_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\max_i x_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases}",
    step3_intro:
      "\\textbf{3. Normalization:} \\quad \\text{Normalize the decision matrix using ideal values.}",
    step3_beneficial:
      "\\text{For beneficial criteria:} \\quad n_{i,j} = \\frac{x_{i,j}}{AI_j}",
    step3_nonbeneficial:
      "\\text{For non-beneficial criteria:} \\quad n_{i,j} = \\frac{AI_j}{x_{i,j}}",
    step4_intro:
      "\\textbf{4. Weighted Normalized Matrix:} \\quad \\text{Apply criterion weights to the normalized matrix.}",
    step4_formula:
      "v_{i,j} = w_j \\times n_{i,j}, \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1",
    step5_intro:
      "\\textbf{5. Sum of Weighted Values:} \\quad \\text{Calculate the sum of weighted normalized values for each alternative and reference solutions.}",
    step5_alternative:
      "S_i = \\sum_{j=1}^{n} v_{i,j}, \\quad i = 1, 2, \\ldots, m",
    step5_ideal:
      "S_{AI} = \\sum_{j=1}^{n} w_j \\times n_{AI,j}",
    step5_antiideal:
      "S_{AAI} = \\sum_{j=1}^{n} w_j \\times n_{AAI,j}",
    step6_intro:
      "\\textbf{6. Utility Degrees:} \\quad \\text{Calculate utility degrees relative to ideal and anti-ideal solutions.}",
    step6_plus:
      "K_i^+ = \\frac{S_i}{S_{AAI}}, \\quad i = 1, 2, \\ldots, m",
    step6_minus:
      "K_i^- = \\frac{S_i}{S_{AI}}, \\quad i = 1, 2, \\ldots, m",
    step7_intro:
      "\\textbf{7. Final Utility Function:} \\quad \\text{Calculate the final utility function for each alternative.}",
    step7_formula:
      "f(K_i) = \\frac{K_i^+}{K_i^+ + K_i^-}, \\quad i = 1, 2, \\ldots, m",
    ranking:
      "\\textbf{8. Ranking:} \\quad \\text{Alternatives are ranked in descending order of } f(K_i). \\text{ (Higher } f(K_i) \\Rightarrow \\text{better alternative)}",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{MARCOS ranks alternatives by comparing their utility to ideal and anti-ideal solutions. A higher utility value means the alternative is closer to the ideal solution}",
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
                dangerouslySetInnerHTML={{ __html: `\\[${latex.title}\\]` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 leading-relaxed" style={{ fontSize: "0.875rem" }}>
            MARCOS is a multi-criteria decision-making method that evaluates alternatives by comparing them to both ideal and anti-ideal solutions, calculating utility degrees to determine the final ranking.
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
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Ideal and Anti-Ideal Solutions: Determine the ideal (best) and anti-ideal (worst) solutions for each criterion.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_ideal}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_antiideal}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Normalization: Normalize the decision matrix using ideal values.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_beneficial}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_nonbeneficial}\\]` }}
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
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Sum of Weighted Values: Calculate the sum of weighted normalized values for each alternative and reference solutions.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_alternative}\\]` }}
              />
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_ideal}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_antiideal}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Utility Degrees: Calculate utility degrees relative to ideal and anti-ideal solutions.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_plus}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_minus}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Final Utility Function: Calculate the final utility function for each alternative.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step7_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Ranking: Rank alternatives based on their final utility values.
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
            MARCOS ranks alternatives by comparing their utility to ideal and anti-ideal solutions. A higher utility value means the alternative is closer to the ideal solution.
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Source: MARCOS method formulation (Stevic et al., 2020). The method evaluates alternatives
          by comparing them to both ideal and anti-ideal solutions, calculating utility degrees to
          determine the final ranking. Alternatives with higher utility values are preferred as they
          are closer to the ideal solution and farther from the anti-ideal solution.
        </div>
      </div>
    </>
  );
}



