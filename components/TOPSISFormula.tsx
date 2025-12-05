"use client";

import React, { useEffect, useRef } from "react";

interface TOPSISFormulaProps {
  compact?: boolean;
}

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * TOPSISFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step TOPSIS formulas as LaTeX
 *
 * Usage:
 *   import TOPSISFormula from "@/components/TOPSISFormula";
 *   <TOPSISFormula />
 */
export default function TOPSISFormula({ compact = false }: TOPSISFormulaProps) {
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
    title: "\\textbf{TOPSIS (Technique for Order Preference by Similarity to Ideal Solution) — Steps}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{Where} \\quad i=1,2,3, \\dots m \\text{(alternatives)}, \\quad j=1,2,3, \\dots n \\text {(criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using vector normalization.}",
    step2_formula:
      "\\displaystyle r_{i,j} = \\frac{x_{i,j}}{\\sqrt{\\sum_{i=1}^{m} x_{i,j}^2}}, \\quad \\quad \\text{where } i = 1, 2, \\ldots, m \\text{ and } j = 1, 2, \\ldots, n",
    step3_intro:
      "\\textbf{3. Weighted Normalized Matrix:} \\quad \\text{Multiply each normalized value by its corresponding criterion weight.}",
    step3_formula:
      "\\displaystyle v_{i,j} = w_j \\times r_{i,j}, \\quad \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1",
    step4_intro:
      "\\textbf{4. Ideal and Negative-Ideal Solutions:} \\quad \\text{Determine the positive ideal solution } A^+ \\text{ and negative ideal solution } A^-.",
    step4_ideal:
      "A^+ = \\{v_1^+, v_2^+, \\ldots, v_n^+\\} \\\\ \\text{where } v_j^+ = \\begin{cases} \\max_i v_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\min_i v_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases}",
    step4_nadir:
      "A^- = \\{v_1^-, v_2^-, \\ldots, v_n^-\\} \\\\ \\text{where } v_j^- = \\begin{cases} \\min_i v_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\max_i v_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases}",
    step5_intro:
      "\\textbf{5. Separation Measures:} \\quad \\text{Calculate the Euclidean distance from each alternative to the ideal and negative-ideal solutions.}",
    step5_plus:
      "d_i^+ = \\sqrt{\\sum_{j=1}^{n} (v_{i,j} - v_j^+)^2} \\\\ \\text{where } i = 1, 2, \\ldots, m",
    step5_minus:
      "d_i^- = \\sqrt{\\sum_{j=1}^{n} (v_{i,j} - v_j^-)^2} \\\\ \\text{where } i = 1, 2, \\ldots, m",
    step6_intro:
      "\\textbf{6. Closeness Coefficient:} \\quad \\text{Calculate the relative closeness to the ideal solution.}",
    step6_formula:
      "\\displaystyle C_i = \\frac{d_i^-}{d_i^+ + d_i^-}, \\quad \\quad \\text{where } 0 \\leq C_i \\leq 1",
    ranking:
      "\\textbf{7. Ranking:} \\quad \\text{Alternatives are ranked in descending order of } C_i. \\text{(Higher } C_i \\Rightarrow \\text{better alternative)}",
    note: "Higher TOPSIS score (closeness coefficient) indicates better alternative ranking",
    swei_intro:
      "\\textbf{Connection to SWEI / SWI (Simple Weighted Evaluation / Index):} \\\\ \\text{In classical SWEI / SWI, a single score for each alternative } A_i \\text{ is computed as a weighted sum of (normalized) criterion values.}",
    swei_formula:
      "\\displaystyle S_i = \\sum_{j=1}^{n} w_j \\, r_{i,j}, \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1, \\; 0 \\leq r_{i,j} \\leq 1",
    swei_comment:
      "\\text{Here } S_i \\text{ is the overall SWEI / SWI score of alternative } A_i. \\text{ Higher } S_i \\Rightarrow \\text{ better alternative (similar to a weighted average).} \\\\ \\text{TOPSIS uses the same weighted normalized matrix } [v_{i,j}] \\text{, but ranks alternatives by their distance to } A^+ \\text{ and } A^- \\text{ instead of a simple sum.}",
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
            Normalization: Normalize the decision matrix using vector normalization to make criteria
            comparable.
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
          <div className="mb-2 font-semibold">Ideal Solutions: Determine the positive ideal solution (best possible) and negative ideal solution (worst possible).</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Positive Ideal Solution (A⁺)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_ideal}\\]` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Negative Ideal Solution (A⁻)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_nadir}\\]` }}
              />
            </div>
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">Separation Measures: Calculate the Euclidean distance from each alternative to both ideal solutions.</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Distance to Positive Ideal</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_plus}\\]` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Distance to Negative Ideal</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_minus}\\]` }}
              />
            </div>
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Closeness Coefficient: Calculate the relative closeness to the ideal solution for each
            alternative.
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
            Ranking: Rank alternatives based on their closeness coefficients.
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
        Source: TOPSIS method formulation (Hwang & Yoon, 1981). The method
        selects the alternative that is closest to the positive ideal solution
        and farthest from the negative ideal solution.
      </div>
      </div>
    </>
  );
}

