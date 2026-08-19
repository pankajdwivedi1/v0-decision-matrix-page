"use client";

import React, { useEffect, useRef } from "react";

type ERVDFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function ERVDFormula({ compact = false }: ERVDFormulaProps) {
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
    title: "\\textbf{ERVD (Election based on Relative Value Distances) — Steps}",
    step1_formula: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step2_norm: "r_{i,j} = \\begin{cases} \\frac{x_{i,j}}{\\max_k x_{k,j}} & \\text{if beneficial} \\\\[1em] \\frac{\\min_k x_{k,j}}{x_{i,j}} & \\text{if non-beneficial} \\end{cases} \\tag{2}",
    step3_ref: "\\text{ref}_j = \\frac{1}{m} \\sum_{i=1}^{m} r_{i,j}, \\quad \\Delta_{i,j} = r_{i,j} - \\text{ref}_j \\tag{3}",
    step4_prospect: "v_{i,j} = \\begin{cases} (\\Delta_{i,j})^{\\alpha} & \\text{if } \\Delta_{i,j} \\ge 0 \\text{ (Psychological Gain)} \\\\[1em] -\\lambda (-\\Delta_{i,j})^{\\beta} & \\text{if } \\Delta_{i,j} < 0 \\text{ (Psychological Loss)} \\end{cases} \\tag{4}",
    step5_ervd: "V_i = \\sum_{j=1}^{n} w_j \\times v_{i,j}, \\quad (\\alpha=\\beta=0.88, \\lambda=2.25) \\tag{5}",
    ranking: "Rank(A_i) \\uparrow \\text{ as } V_i \\uparrow \\quad \\text{(Higher prospect value } \\Rightarrow \\text{ Best alternative)} \\tag{6}",
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

        <div className="mb-4 bg-rose-50 border border-rose-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            {"ERVD (Election based on Relative Value Distances) is an MCDM method proposed by Huan-Jyh Shyur that uses an S-shaped Prospect Theory value function to model bounded rationality, gain/loss perception, and decision-maker risk aversion relative to reference solutions."}
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
            <div className="mb-2 font-semibold">Step II. Matrix Normalization:</div>
            <p className="text-sm text-gray-600 mb-2">Normalize criterion values to the unit scale:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_norm}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step III. Dynamic Reference Point and Distance Deviations:</div>
            <p className="text-sm text-gray-600 mb-2">Determine the mean reference point and relative deviations for each criterion:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_ref}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step IV. S-Shape Prospect Value Function:</div>
            <p className="text-sm text-gray-600 mb-2">Transform deviations into psychological prospect gains and losses:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_prospect}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step V. Total Weighted Prospect Value:</div>
            <p className="text-sm text-gray-600 mb-2">Aggregate criterion prospect values with criteria weights:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_ervd}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step VI. Alternative Ranking:</div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
            </div>
          </li>
        </ol>

        <div className="mt-4 bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-rose-900 mb-2">Interpretation & Behavioral Characteristics</div>
          <p className="text-sm text-gray-700 leading-relaxed">
            By assigning higher penalty weights to psychological losses (\( \lambda = 2.25 \)), ERVD captures real human risk-averse behavior when evaluating high-stakes industrial and sustainability decisions.
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
          <strong>Reference:</strong> Shyur, H. J. (2015). &quot;A Multiple Criteria Decision Making Method Based on Relative Value Distances.&quot; <em>Foundations of Computing and Decision Sciences</em>, 40(4), 299–315.{" "}
          <a className="text-blue-600 underline font-semibold" target="_blank" rel="noreferrer" href="https://doi.org/10.1515/fcds-2015-0017">
            DOI: 10.1515/fcds-2015-0017
          </a>
        </div>
      </div>
    </>
  );
}
