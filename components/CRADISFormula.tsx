"use client";

import React, { useEffect, useRef } from "react";

type CRADISFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function CRADISFormula({ compact = false }: CRADISFormulaProps) {
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
    title: "\\textbf{CRADIS (Compromise Ranking of Alternatives from Distance to Ideal Solution) — Steps}",
    step1_formula: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step2_benefit: "n_{i,j} = \\frac{x_{i,j}}{\\max_k x_{k,j}} \\quad \\text{(for beneficial criteria)} \\tag{2}",
    step2_cost: "n_{i,j} = \\frac{\\min_k x_{k,j}}{x_{i,j}} \\quad \\text{(for non-beneficial criteria)} \\tag{3}",
    step3_formula: "v_{i,j} = w_j \\times n_{i,j}, \\quad \\sum_{j=1}^{n} w_j = 1 \\tag{4}",
    step4_formula: "t_j^+ = \\max_i v_{i,j}, \\quad t_j^- = \\min_i v_{i,j} \\tag{5}",
    step5_formula: "d_i^+ = \\sqrt{\\sum_{j=1}^{n} (v_{i,j} - t_j^+)^2}, \\quad d_i^- = \\sqrt{\\sum_{j=1}^{n} (v_{i,j} - t_j^-)^2} \\tag{6}",
    step6_formula: "Q_i = 0.5 \\times \\left( \\frac{d_i^-}{\\max_k d_k^-} \\right) + 0.5 \\times \\left( \\frac{\\min_k d_k^+}{d_i^+} \\right) \\tag{7}",
    ranking: "Rank(A_i) \\uparrow \\text{ as } Q_i \\uparrow \\quad \\text{(Higher score } \\Rightarrow \\text{ Best alternative)} \\tag{8}",
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
            CRADIS (Compromise Ranking of Alternatives from Distance to Ideal Solution) is a distance-based MCDM method developed by Puška, Stević, and Pamučar that evaluates alternatives by determining deviations from both the ideal positive solution (PIS) and the ideal negative solution (NIS).
          </p>
        </div>

        <ol className="space-y-4 list-decimal pl-5 text-black">
          <li>
            <div className="mb-2 font-semibold">Step I. Decision Matrix Formulation:</div>
            <p className="text-sm text-gray-600 mb-2">
              {"Formulate the initial decision matrix with m alternatives and n criteria:"}
            </p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step II. Matrix Normalization:</div>
            <p className="text-sm text-gray-600 mb-2">Normalize criterion values based on their orientation:</p>
            <div className="bg-gray-50 rounded-lg mb-4 space-y-2">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_benefit}\\]` }} />
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_cost}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step III. Weighted Normalized Decision Matrix:</div>
            <p className="text-sm text-gray-600 mb-2">Apply criteria weights to the normalized values:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step IV. Identification of Ideal Positive and Negative Solutions:</div>
            <p className="text-sm text-gray-600 mb-2">Determine maximum and minimum values across weighted criteria:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step V. Calculation of Euclidean Distances:</div>
            <p className="text-sm text-gray-600 mb-2">Calculate distances from ideal positive and negative solutions:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step VI. Compromise Utility Assessment:</div>
            <p className="text-sm text-gray-600 mb-2">Aggregate relative deviations into a final compromise score:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step VII. Alternative Ranking:</div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
            </div>
          </li>
        </ol>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-blue-900 mb-2">Interpretation & Characteristics</div>
          <p className="text-sm text-gray-700 leading-relaxed">
            A higher score signifies superior compromise performance, indicating that the alternative is simultaneously closer to the positive ideal and farther from the anti-ideal solution.
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
          <strong>Reference:</strong> Puška, A., Stević, Ž., &amp; Pamučar, D. (2022). &quot;Evaluation and selection of healthcare waste incinerators using extended sustainability criteria and multi-criteria analysis methods.&quot; <em>Environment, Development and Sustainability</em>, 24, 11195–11225.{" "}
          <a className="text-blue-600 underline font-semibold" target="_blank" rel="noreferrer" href="https://doi.org/10.1007/s10668-021-01902-2">
            DOI: 10.1007/s10668-021-01902-2
          </a>
        </div>
      </div>
    </>
  );
}
