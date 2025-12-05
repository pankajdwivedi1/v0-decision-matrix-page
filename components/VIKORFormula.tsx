"use client";

import React, { useEffect, useRef } from "react";

type VIKORFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * VIKORFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step VIKOR formulas as LaTeX
 *
 * Usage:
 *   import VIKORFormula from "@/components/VIKORFormula";
 *   <VIKORFormula />
 */
export default function VIKORFormula({ compact = false }: VIKORFormulaProps) {
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
    title: "\\textbf{VIKOR (VlseKriterijumska Optimizacija I Kompromisno Resenje) — Steps}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using linear normalization.}",
    step2_benefit:
      "f_{i,j} = \\frac{x_{i,j}}{\\max_i x_{i,j}}, \\quad \\text{for benefit (max) criteria}",
    step2_cost:
      "f_{i,j} = \\frac{\\min_i x_{i,j}}{x_{i,j}}, \\quad \\text{for cost (min) criteria}",
    step3_intro:
      "\\textbf{3. Best and Worst Values:} \\quad \\text{Determine the best } f_j^* \\text{ and worst } f_j^- \\text{ values for each criterion.}",
    step3_best:
      "f_j^* = \\begin{cases} \\max_i f_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\min_i f_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases}",
    step3_worst:
      "f_j^- = \\begin{cases} \\min_i f_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\max_i f_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases}",
    step4_intro:
      "\\textbf{4. Utility Measure (S_i):} \\quad \\text{Calculate the weighted sum of normalized distances for each alternative.}",
    step4_formula:
      "S_i = \\sum_{j=1}^{n} w_j \\frac{f_j^* - f_{i,j}}{f_j^* - f_j^-}, \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1",
    step5_intro:
      "\\textbf{5. Regret Measure (R_i):} \\quad \\text{Calculate the maximum weighted normalized distance for each alternative.}",
    step5_formula:
      "R_i = \\max_j \\left[ w_j \\frac{f_j^* - f_{i,j}}{f_j^* - f_j^-} \\right]",
    step6_intro:
      "\\textbf{6. VIKOR Index (Q_i):} \\quad \\text{Calculate the compromise solution index using parameter } v \\in [0,1].",
    step6_formula:
      "Q_i = v \\frac{S_i - S^*}{S^- - S^*} + (1-v) \\frac{R_i - R^*}{R^- - R^*} \\\\ \\text{where } S^* = \\min_i S_i, \\; S^- = \\max_i S_i, \\; R^* = \\min_i R_i, \\; R^- = \\max_i R_i",
    ranking:
      "\\textbf{7. Ranking:} \\quad \\text{Alternatives are ranked in ascending order of } Q_i. \\text{ (Lower } Q_i \\Rightarrow \\text{better alternative)}",
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
          <div className="mb-2 font-semibold">Best and Worst Values: Determine the best and worst values for each criterion.</div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Best Value (f_j*)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_best}\\]` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs italic mb-2">Worst Value (f_j⁻)</div>
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_worst}\\]` }}
              />
            </div>
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Utility Measure (S_i): Calculate the weighted sum of normalized distances for each alternative.
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
            Regret Measure (R_i): Calculate the maximum weighted normalized distance for each alternative.
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
            VIKOR Index (Q_i): Calculate the compromise solution index using parameter v (typically v = 0.5).
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_formula}\\]` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Ranking: Rank alternatives based on their VIKOR index values.
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
        Source: VIKOR method formulation (Opricovic, 1998). The method finds a compromise solution
        that is closest to the ideal solution, considering both group utility (majority rule) and
        individual regret (opponent).
      </div>
      </div>
    </>
  );
}

