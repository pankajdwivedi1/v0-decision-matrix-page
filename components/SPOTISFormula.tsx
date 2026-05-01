"use client";

import React, { useEffect, useRef } from "react";

type SPOTISFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

/**
 * SPOTISFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step SPOTIS formulas as LaTeX
 */
export default function SPOTISFormula({ compact = false }: SPOTISFormulaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
        if (window.MathJax) {
          window.MathJax.startup = {
            ...window.MathJax.startup,
            typeset: false,
          };
        }
        setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
      };
    } else {
      setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
  }, []);

  const latex = {
    title: "\\textbf{SPOTIS (Stable Preference Ordering Towards Ideal Solution) — Steps}",
    intro: "\\text{SPOTIS is a distance-based multi-criteria decision-making method that defines bounds for each criterion to avoid rank reversal.}",
    step1_intro: "\\textbf{1. Bounds Identification:} \\quad \\text{Identify the minimum and maximum values for each criterion from the decision matrix.}",
    step1_formula: "S_{min,j} = \\min_i x_{i,j}, \\quad S_{max,j} = \\max_i x_{i,j} \\tag{1}",
    step2_intro: "\\textbf{2. Ideal Solution (Best Points):} \\quad \\text{Define the best value } S_{best,j} \\text{ based on the criterion type.}",
    step2_formula: "S_{best,j} = \\begin{cases} S_{max,j} & \\text{if beneficial} \\\\ S_{min,j} & \\text{if non-beneficial} \\end{cases} \\tag{2}",
    step3_intro: "\\textbf{3. Normalized Distance Calculation:} \\quad \\text{Calculate the normalized distance of each alternative from the ideal solution.}",
    step3_formula: "d_{i,j} = \\frac{|x_{i,j} - S_{best,j}|}{S_{max,j} - S_{min,j}} \\tag{3}",
    step4_intro: "\\textbf{4. Aggregate Score:} \\quad \\text{Sum the weighted distances for each alternative.}",
    step4_formula: "Score_i = \\sum_{j=1}^{n} w_j \\times d_{i,j} \\tag{4}",
    ranking: "\\textbf{5. Ranking:} \\quad \\text{Alternatives are ranked in ascending order. (Lower score } \\Rightarrow \\text{ better alternative)}",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .latex { font-size: 0.875rem !important; line-height: 2 !important; margin: 1rem 0; display: block; }
          .latex mjx-container { font-size: 0.875rem !important; max-width: 100% !important; overflow-x: auto; overflow-y: hidden; margin: 0.75rem 0 !important; padding: 0.5rem 0 !important; text-align: center !important; }
          .latex mjx-math { font-size: 0.875rem !important; outline: none !important; }
          ol li { margin-bottom: 2rem !important; line-height: 1.8 !important; }
        `
      }} />
      <div
        ref={containerRef}
        className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 font-['Times_New_Roman',_Times,_serif] ${compact ? "text-sm" : "text-base"}`}
      >
        <div className="mb-4">
          <div style={{ fontSize: compact ? 18 : 20, fontWeight: 700 }}>
            <span className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.title}\\]` }} />
          </div>
        </div>

        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            SPOTIS (Stable Preference Ordering Towards Ideal Solution) is a multi-criteria decision-making method that evaluates alternatives based on their normalized distance to an ideal solution within defined bounds, ensuring stability in ranking.
          </p>
        </div>

        <ol className="space-y-4 list-decimal pl-5">
          <li>
            <div className="mb-2 font-semibold">Bounds Identification: Identify min/max for each criterion.</div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Ideal Solution Definition: Determine the best point for each criterion.</div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Distance Normalization: Calculate normalized distances from the ideal.</div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Aggregation: Sum the weighted distances.</div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Ranking: Alternatives are ranked by ascending score.</div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
            </div>
          </li>
        </ol>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-blue-900 mb-2">Interpretation</div>
          <p className="text-sm text-gray-700 leading-relaxed">
            A lower SPOTIS score indicates an alternative is closer to the ideal solution relative to the defined criteria bounds.
          </p>
        </div>
      </div>
    </>
  );
}
