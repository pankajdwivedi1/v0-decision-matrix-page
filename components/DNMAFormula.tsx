"use client";

import React, { useEffect, useRef } from "react";

type DNMAFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function DNMAFormula({ compact = false }: DNMAFormulaProps) {
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
    title: "\\textbf{DNMA (Double Normalization-based Multiple Aggregation) — Steps}",
    step1_formula: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step2_linear: "L_{i,j} = \\begin{cases} \\frac{x_{i,j} - \\min_k x_{k,j}}{\\max_k x_{k,j} - \\min_k x_{k,j}} & \\text{if beneficial} \\\\[1em] \\frac{\\max_k x_{k,j} - x_{i,j}}{\\max_k x_{k,j} - \\min_k x_{k,j}} & \\text{if non-beneficial} \\end{cases} \\tag{2}",
    step2_vector: "V_{i,j} = \\frac{x_{i,j}}{\\sqrt{\\sum_{k=1}^m x_{k,j}^2}} \\tag{3}",
    step3_sl: "SL_i = \\sum_{j=1}^{n} w_j L_{i,j} \\tag{4}",
    step3_sv: "SV_i = \\sum_{j=1}^{n} w_j \\times (\\pm V_{i,j}) \\tag{5}",
    step4_dnma: "DNMA_i = 0.5 \\times SL_i + 0.5 \\times \\left( \\frac{SV_i + 1}{2} \\right) \\tag{6}",
    ranking: "Rank(A_i) \\uparrow \\text{ as } DNMA_i \\uparrow \\quad \\text{(Higher score } \\Rightarrow \\text{ Best alternative)} \\tag{7}",
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

        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            DNMA (Double Normalization-based Multiple Aggregation) is an advanced MCDM method developed by Liao &amp; Wu that runs simultaneous linear target-based normalization and vector normalization, calculating multiple subordinate ranks to guarantee compromise stability.
          </p>
        </div>

        <ol className="space-y-4 list-decimal pl-5 text-black">
          <li>
            <div className="mb-2 font-semibold">Step I. Decision Matrix Construction:</div>
            <p className="text-sm text-gray-600 mb-2">
              {"Construct the initial decision matrix with m alternatives and n criteria:"}
            </p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step II. Dual Normalization Process:</div>
            <p className="text-sm text-gray-600 mb-2">
              {"Simultaneously compute Linear Normalization and Vector Normalization:"}
            </p>
            <div className="bg-gray-50 rounded-lg mb-4 space-y-2">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_linear}\\]` }} />
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_vector}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step III. Subordinate Function Computations:</div>
            <p className="text-sm text-gray-600 mb-2">
              {"Aggregate weighted linear values and weighted vector values:"}
            </p>
            <div className="bg-gray-50 rounded-lg mb-4 space-y-2">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_sl}\\]` }} />
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_sv}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step IV. Comprehensive Multi-Aggregation Score:</div>
            <p className="text-sm text-gray-600 mb-2">
              {"Fuse the subordinate scores into the final DNMA index:"}
            </p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_dnma}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step V. Alternative Ranking:</div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
            </div>
          </li>
        </ol>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-amber-900 mb-2">Interpretation & Characteristics</div>
          <p className="text-sm text-gray-700 leading-relaxed">
            DNMA synthesizes both the absolute gap from the ideal benchmark and the relative Euclidean distance, overcoming individual normalization vulnerabilities.
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
          <strong>Reference:</strong> Liao, H., &amp; Wu, X. (2020). &quot;DNMA: A double normalization-based multiple aggregation method for multi-expert multi-criteria decision making.&quot; <em>Omega</em>, 94, 102058.{" "}
          <a className="text-blue-600 underline font-semibold" target="_blank" rel="noreferrer" href="https://doi.org/10.1016/j.omega.2019.04.001">
            DOI: 10.1016/j.omega.2019.04.001
          </a>
        </div>
      </div>
    </>
  );
}
