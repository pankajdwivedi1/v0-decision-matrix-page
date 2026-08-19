"use client";

import React, { useEffect, useRef } from "react";

type AROMANFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function AROMANFormula({ compact = false }: AROMANFormulaProps) {
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
    title: "\\textbf{AROMAN (Alternative Ranking Order Method Accounting for Two-Step Normalization) — Steps}",
    step1_formula: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step2_linear_ben: "r_{i,j}^{(1)} = \\frac{x_{i,j} - \\min_k x_{k,j}}{\\max_k x_{k,j} - \\min_k x_{k,j}} \\quad \\text{(Beneficial criteria)} \\tag{2}",
    step2_linear_cost: "r_{i,j}^{(1)} = \\frac{\\max_k x_{k,j} - x_{i,j}}{\\max_k x_{k,j} - \\min_k x_{k,j}} \\quad \\text{(Non-beneficial criteria)} \\tag{3}",
    step3_vector: "r_{i,j}^{(2)} = \\frac{r_{i,j}^{(1)} + \\varepsilon}{\\sqrt{\\sum_{k=1}^m (r_{k,j}^{(1)} + \\varepsilon)^2}}, \\quad \\varepsilon = 0.001 \\tag{4}",
    step4_sum_prod: "S_i = \\sum_{j=1}^{n} w_j r_{i,j}^{(2)}, \\quad P_i = \\prod_{j=1}^{n} (r_{i,j}^{(2)})^{w_j} \\tag{5}",
    step5_formula: "f_i = \\beta S_i + (1 - \\beta) P_i, \\quad \\beta = 0.5 \\tag{6}",
    ranking: "Rank(A_i) \\uparrow \\text{ as } f_i \\uparrow \\quad \\text{(Higher score } \\Rightarrow \\text{ Best alternative)} \\tag{7}",
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

        <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            AROMAN (Alternative Ranking Order Method Accounting for Two-Step Normalization) employs a double normalization paradigm (Linear Min-Max followed by Vector normalization) to eliminate scaling bias in complex decision systems.
          </p>
        </div>

        <ol className="space-y-4 list-decimal pl-5 text-black">
          <li>
            <div className="mb-2 font-semibold">Step I. Initial Decision Matrix Formulation:</div>
            <p className="text-sm text-gray-600 mb-2">
              {"Formulate the initial decision matrix with m alternatives and n criteria:"}
            </p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_formula}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step II. First-Step Linear Normalization:</div>
            <p className="text-sm text-gray-600 mb-2">Transform raw scores to a unit range using min-max scaling:</p>
            <div className="bg-gray-50 rounded-lg mb-4 space-y-2">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_linear_ben}\\]` }} />
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_linear_cost}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step III. Second-Step Vector Normalization:</div>
            <p className="text-sm text-gray-600 mb-2">Apply vector normalization on the first-step normalized values with stability parameter epsilon:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_vector}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step IV. Linear Sum and Product Calculation:</div>
            <p className="text-sm text-gray-600 mb-2">Calculate the weighted additive sum and weighted multiplicative product:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_sum_prod}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step V. Final Compromise Score:</div>
            <p className="text-sm text-gray-600 mb-2">Combine additive and multiplicative components using weighting coefficient beta = 0.5:</p>
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

        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-purple-900 mb-2">Interpretation & Characteristics</div>
          <p className="text-sm text-gray-700 leading-relaxed">
            By integrating two-step normalization, AROMAN preserves the relative distances between alternatives while reducing distortion from extreme criterion values.
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
          <strong>Reference:</strong> Jovčić, S., Tešić, D., &amp; Marinković, D. (2023). &quot;An Alternative Ranking Order Method Accounting for Two-Step Normalization (AROMAN)—A Case Study of the Electric Vehicle Selection Problem.&quot; <em>IEEE Access</em>, 11, 39688–39700.{" "}
          <a className="text-blue-600 underline font-semibold" target="_blank" rel="noreferrer" href="https://doi.org/10.1109/ACCESS.2023.3265818">
            DOI: 10.1109/ACCESS.2023.3265818
          </a>
        </div>
      </div>
    </>
  );
}
