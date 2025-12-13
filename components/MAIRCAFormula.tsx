"use client";

import React, { useEffect, useRef } from "react";

type MAIRCAFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * MAIRCAFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step MAIRCA formulas as LaTeX
 *
 * Usage:
 *   import MAIRCAFormula from "@/components/MAIRCAFormula";
 *   <MAIRCAFormula />
 */
export default function MAIRCAFormula({ compact = false }: MAIRCAFormulaProps) {
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
    title: "\\textbf{MAIRCA (Multi-Attributive Ideal-Real Comparative Analysis) — Steps}",
    intro: "\\text{MAIRCA is a multi-criteria decision-making method that evaluates alternatives by comparing their performance against ideal values, calculating the gap between theoretical (ideal) and real (actual) ratings.}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)} \\tag{1}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using linear normalization.}",
    step2_beneficial:
      "\\text{For beneficial criteria:} \\quad r_{i,j} = \\frac{x_{i,j} - \\min_i(x_{i,j})}{\\max_i(x_{i,j}) - \\min_i(x_{i,j})} \\tag{2}",
    step2_nonbeneficial:
      "\\text{For non-beneficial criteria:} \\quad r_{i,j} = \\frac{\\max_i(x_{i,j}) - x_{i,j}}{\\max_i(x_{i,j}) - \\min_i(x_{i,j})} \\tag{3}",
    step3_intro:
      "\\textbf{3. Theoretical Ratings:} \\quad \\text{Calculate theoretical ratings based on ideal values for each criterion.}",
    step3_ideal:
      "\\text{Ideal value:} \\quad r_j^* = \\begin{cases} \\max_i r_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\min_i r_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases} \\tag{4}",
    step3_formula:
      "T_{p,j} = w_j \\times r_j^*, \\quad p = 1, 2, \\ldots, m, \\quad j = 1, 2, \\ldots, n \\tag{5}",
    step4_intro:
      "\\textbf{4. Real Ratings:} \\quad \\text{Calculate real ratings based on actual normalized values for each alternative.}",
    step4_formula:
      "R_{p,j} = w_j \\times r_{p,j}, \\quad p = 1, 2, \\ldots, m, \\quad j = 1, 2, \\ldots, n \\tag{6}",
    step5_intro:
      "\\textbf{5. Gap Matrix:} \\quad \\text{Calculate the gap between theoretical and real ratings for each alternative-criterion pair.}",
    step5_formula:
      "g_{p,j} = T_{p,j} - R_{p,j}, \\quad p = 1, 2, \\ldots, m, \\quad j = 1, 2, \\ldots, n \\tag{7}",
    step6_intro:
      "\\textbf{6. Total Gap:} \\quad \\text{Calculate the total gap for each alternative by summing gaps across all criteria.}",
    step6_formula:
      "G_p = \\sum_{j=1}^{n} g_{p,j}, \\quad p = 1, 2, \\ldots, m \\tag{8}",
    ranking:
      "\\textbf{7. Ranking:} \\quad \\text{Alternatives are ranked in ascending order of } G_p. \\text{ (Lower } G_p \\Rightarrow \\text{better alternative)}",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{MAIRCA evaluates alternatives by measuring their deviation from ideal values. Lower total gap indicates an alternative that is closer to the ideal solution across all criteria.}",
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
            MAIRCA is a multi-criteria decision-making method that evaluates alternatives by comparing their performance against ideal values, calculating the gap between theoretical (ideal) and real (actual) ratings.
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
              Theoretical Ratings: Calculate theoretical ratings based on ideal values for each criterion.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_ideal}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Real Ratings: Calculate real ratings based on actual normalized values for each alternative.
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
              Gap Matrix: Calculate the gap between theoretical and real ratings for each alternative-criterion pair.
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
              Total Gap: Calculate the total gap for each alternative by summing gaps across all criteria.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Ranking: Rank alternatives based on their total gaps.
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
            MAIRCA evaluates alternatives by measuring their deviation from ideal values. Lower total gap indicates an alternative that is closer to the ideal solution across all criteria.
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Source: MAIRCA method formulation (Pamucar et al., 2014). The method evaluates alternatives
          by comparing their performance against ideal values, calculating the gap between theoretical
          (ideal) and real (actual) ratings. Alternatives with smaller total gaps are preferred as they
          are closer to the ideal solution.
        </div>
      </div>
    </>
  );
}



