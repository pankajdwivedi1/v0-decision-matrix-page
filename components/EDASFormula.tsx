"use client";

import React, { useEffect, useRef } from "react";

type EDASFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * EDASFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step EDAS formulas as LaTeX
 *
 * Usage:
 *   import EDASFormula from "@/components/EDASFormula";
 *   <EDASFormula />
 */
export default function EDASFormula({ compact = false }: EDASFormulaProps) {
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
    title: "\\textbf{EDAS (Evaluation based on Distance from Average Solution) — Steps}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Average Solution (AV):} \\quad \\text{Calculate the average solution for each criterion.}",
    step2_formula:
      "AV_j = \\frac{1}{m} \\sum_{i=1}^{m} x_{i,j}, \\quad j = 1, 2, \\ldots, n",
    step3_intro:
      "\\textbf{3. Positive Distance from Average (PDA):} \\quad \\text{Calculate the positive distance from average for beneficial and non-beneficial criteria.}",
    step3_benefit:
      "PDA_{i,j} = \\frac{\\max(0, x_{i,j} - AV_j)}{AV_j}, \\quad \\text{for benefit (max) criteria}",
    step3_cost:
      "PDA_{i,j} = \\frac{\\max(0, AV_j - x_{i,j})}{AV_j}, \\quad \\text{for cost (min) criteria}",
    step4_intro:
      "\\textbf{4. Negative Distance from Average (NDA):} \\quad \\text{Calculate the negative distance from average for beneficial and non-beneficial criteria.}",
    step4_benefit:
      "NDA_{i,j} = \\frac{\\max(0, AV_j - x_{i,j})}{AV_j}, \\quad \\text{for benefit (max) criteria}",
    step4_cost:
      "NDA_{i,j} = \\frac{\\max(0, x_{i,j} - AV_j)}{AV_j}, \\quad \\text{for cost (min) criteria}",
    step5_intro:
      "\\textbf{5. Weighted Sum of PDA and NDA:} \\quad \\text{Calculate the weighted sum of positive and negative distances.}",
    step5_pda:
      "SP_i = \\sum_{j=1}^{n} w_j \\, PDA_{i,j}, \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1",
    step5_nda:
      "SN_i = \\sum_{j=1}^{n} w_j \\, NDA_{i,j}",
    step6_intro:
      "\\textbf{6. Normalized Values:} \\quad \\text{Normalize SP and SN values.}",
    step6_sp:
      "NSP_i = \\frac{SP_i}{\\max_i SP_i}",
    step6_sn:
      "NSN_i = 1 - \\frac{SN_i}{\\max_i SN_i}",
    step7_intro:
      "\\textbf{7. Appraisal Score (AS):} \\quad \\text{Calculate the final appraisal score for each alternative.}",
    step7_formula:
      "AS_i = \\frac{1}{2} (NSP_i + NSN_i), \\quad i = 1, 2, \\ldots, m",
    ranking:
      "\\textbf{8. Ranking:} \\quad \\text{Alternatives are ranked in descending order of } AS_i. \\text{ (Higher } AS_i \\Rightarrow \\text{better alternative)}",
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
            Average Solution: Calculate the average solution for each criterion based on all alternatives.
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
          <div className="mb-2 font-semibold">Positive Distance from Average (PDA): Calculate how much each alternative exceeds the average solution.</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Benefit (Max) Criteria</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_benefit}\\)` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Cost (Min) Criteria</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_cost}\\)` }}
              />
            </div>
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">Negative Distance from Average (NDA): Calculate how much each alternative falls below the average solution.</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Benefit (Max) Criteria</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_benefit}\\)` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Cost (Min) Criteria</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_cost}\\)` }}
              />
            </div>
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Weighted Sum: Calculate the weighted sum of positive and negative distances from average.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Weighted Sum of PDA (SP_i)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_pda}\\)` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Weighted Sum of NDA (SN_i)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_nda}\\)` }}
              />
            </div>
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Normalization: Normalize the weighted sums to make them comparable.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Normalized SP (NSP_i)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step6_sp}\\)` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Normalized SN (NSN_i)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step6_sn}\\)` }}
              />
            </div>
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Appraisal Score: Calculate the final appraisal score as the average of normalized positive and negative distances.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step7_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Ranking: Rank alternatives based on their appraisal scores.
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
        Source: EDAS method formulation (Keshavarz Ghorabaee et al., 2015). The method evaluates
        alternatives based on their distance from the average solution, considering both positive
        and negative deviations.
      </div>
      </div>
    </>
  );
}

