"use client";

import React, { useEffect, useRef } from "react";

type WASPASFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * WASPASFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step WASPAS formulas as LaTeX
 *
 * Usage:
 *   import WASPASFormula from "@/components/WASPASFormula";
 *   <WASPASFormula />
 */
export default function WASPASFormula({ compact = false }: WASPASFormulaProps) {
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
        // typeset the initial content
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

  // LaTeX strings for each step of WASPAS
  const latex = {
    title: "\\textbf{WASPAS (Weighted Aggregated Sum Product Assessment) — Steps}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\\\ \\text{where } i = 1,2,\\dots,m \\text{ (alternatives)},\\; j = 1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{Normalize each criterion using linear normalization (benefit / cost).}",
    step2_benefit:
      "\\displaystyle x_{i,j}^* = \\frac{x_{i,j}}{\\max_i x_{i,j}}, \\quad \\text{for benefit (max) criteria}",
    step2_cost:
      "\\displaystyle x_{i,j}^* = \\frac{\\min_i x_{i,j}}{x_{i,j}}, \\quad \\text{for cost (min) criteria}",
    step3_intro:
      "\\textbf{3. Criteria Weights:} \\quad w_j \\ge 0, \\; \\sum_{j=1}^{n} w_j = 1.",
    step4_wsm_intro:
      "\\textbf{4. Weighted Sum Model (WSM) Score:} \\quad \\text{Compute the additive (sum) score for each alternative.}",
    step4_wsm_formula:
      "\\displaystyle Q_i^{(1)} = \\sum_{j=1}^{n} w_j \\, x_{i,j}^*, \\quad i = 1,2,\\dots,m",
    step5_wpm_intro:
      "\\textbf{5. Weighted Product Model (WPM) Score:} \\quad \\text{Compute the multiplicative (product) score for each alternative.}",
    step5_wpm_formula:
      "\\displaystyle Q_i^{(2)} = \\prod_{j=1}^{n} (x_{i,j}^*)^{w_j}, \\quad i = 1,2,\\dots,m",
    step6_intro:
      "\\textbf{6. WASPAS Aggregated Score:} \\quad \\text{Combine WSM and WPM scores with parameter } \\lambda \\in [0,1].",
    step6_formula:
      "\\displaystyle Q_i = \\lambda \\, Q_i^{(1)} + (1 - \\lambda) \\, Q_i^{(2)}, \\quad \\text{typically } \\lambda = 0.5",
    ranking:
      "\\textbf{7. Ranking:} \\quad \\text{Rank alternatives in descending order of } Q_i. \\; (\\text{Higher } Q_i \\Rightarrow \\text{better alternative})",
  };

  return (
    <div
      ref={containerRef}
      className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-6 ${
        compact ? "text-sm" : "text-base"
      }`}
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
            <div className="latex" dangerouslySetInnerHTML={{ __html: `\\(${latex.step1}\\)` }} />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Normalization: Normalize each criterion separately for benefit (max) and cost (min)
            criteria.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm italic mb-2">Benefit (desirable) criteria</div>
              <div
                className="latex"
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_benefit}\\)` }}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm italic mb-2">Cost (undesirable) criteria</div>
              <div
                className="latex"
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_cost}\\)` }}
              />
            </div>
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Criteria Weights: Specify or elicit the importance weights for each criterion.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="latex" dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_intro}\\)` }} />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Weighted Sum Model (WSM): Compute the additive score for each alternative.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex"
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_wsm_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Weighted Product Model (WPM): Compute the multiplicative score for each alternative.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex"
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_wpm_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            WASPAS Aggregated Score: Combine WSM and WPM using the parameter \\( \\lambda \\).
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex"
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step6_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">Ranking: Rank alternatives based on their \\( Q_i \\) values.</div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="latex" dangerouslySetInnerHTML={{ __html: `\\(${latex.ranking}\\)` }} />
          </div>
        </li>
      </ol>

      <div className="mt-4 text-xs text-gray-500">
        Source: WASPAS method formulation (Weighted Aggregated Sum Product Assessment). The method
        combines additive (WSM) and multiplicative (WPM) models through the parameter \\( \\lambda \\)
        to obtain a robust compromise ranking.
      </div>
    </div>
  );
}


