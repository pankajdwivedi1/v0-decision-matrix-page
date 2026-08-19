"use client";

import React, { useEffect, useRef } from "react";

type WISPFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function WISPFormula({ compact = false }: WISPFormulaProps) {
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
    title: "\\textbf{WISP (Integrated Simple Weighted Sum Product) — Steps}",
    step1_formula: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step2_formula: "r_{i,j} = \\frac{x_{i,j}}{\\max_k x_{k,j}} \\quad \\text{(Beneficial)}, \\quad r_{i,j} = \\frac{\\min_k x_{k,j}}{x_{i,j}} \\quad \\text{(Non-beneficial)} \\tag{2}",
    step3_ws: "WS_i = \\sum_{j \\in B} w_j r_{i,j}, \\quad WR_i = \\sum_{j \\in C} w_j r_{i,j} \\tag{3}",
    step3_wp: "WP_i = \\prod_{j \\in B} (r_{i,j})^{w_j}, \\quad WQ_i = \\prod_{j \\in C} (r_{i,j})^{w_j} \\tag{4}",
    step4_u12: "u_{1i} = \\frac{WS_i - WR_i}{\\max_k(WS - WR) - \\min_k(WS - WR)}, \\quad u_{2i} = \\frac{WP_i - WQ_i}{\\max_k(WP - WQ) - \\min_k(WP - WQ)} \\tag{5}",
    step4_u34: "u_{3i} = \\frac{WS_i / \\max WS}{1 + WR_i / \\min WR}, \\quad u_{4i} = \\frac{WP_i / \\max WP}{1 + WQ_i / \\min WQ} \\tag{6}",
    step5_formula: "IS_i = \\frac{u_{1i} + u_{2i} + u_{3i} + u_{4i}}{4} \\tag{7}",
    ranking: "Rank(A_i) \\uparrow \\text{ as } IS_i \\uparrow \\quad \\text{(Higher score } \\Rightarrow \\text{ Best alternative)} \\tag{8}",
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

        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            WISP (Weighted Integrated Sum Product) is a multi-criteria decision-making method developed by Stanujkić et al. that integrates four distinct utility formulations across additive and multiplicative measures, ensuring high ranking stability.
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
            <div className="mb-2 font-semibold">Step II. Linear Matrix Normalization:</div>
            <p className="text-sm text-gray-600 mb-2">Normalize the matrix elements for beneficial and non-beneficial criteria:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step III. Weighted Sums & Weighted Products Calculation:</div>
            <p className="text-sm text-gray-600 mb-2">Calculate sum and product terms for beneficial and non-beneficial criteria:</p>
            <div className="bg-gray-50 rounded-lg mb-4 space-y-2">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_ws}\\]` }} />
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_wp}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step IV. Four Utility Component Measures:</div>
            <p className="text-sm text-gray-600 mb-2">Compute four utility relationships combining differences and ratios:</p>
            <div className="bg-gray-50 rounded-lg mb-4 space-y-2">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_u12}\\]` }} />
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_u34}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step V. Overall Integrated Score:</div>
            <p className="text-sm text-gray-600 mb-2">Average the four utility measures into a unified prioritization score:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step VI. Alternative Ranking:</div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
            </div>
          </li>
        </ol>

        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-emerald-900 mb-2">Interpretation & Characteristics</div>
          <p className="text-sm text-gray-700 leading-relaxed">
            The WISP method balances both compensatory (additive) and non-compensatory (multiplicative) decision logics, making it exceptionally reliable for complex multi-objective optimization.
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
          <strong>Reference:</strong> Stanujkić, D., Popović, G., Karabašević, D., Meidutė-Kavaliauskienė, I., &amp; Zavadskas, E. K. (2021). &quot;An Integrated Simple Weighted Sum Product Method—WISP.&quot; <em>IEEE Transactions on Engineering Management</em>, 70(7), 2533–2544.{" "}
          <a className="text-blue-600 underline font-semibold" target="_blank" rel="noreferrer" href="https://doi.org/10.1109/TEM.2021.3075783">
            DOI: 10.1109/TEM.2021.3075783
          </a>
        </div>
      </div>
    </>
  );
}
