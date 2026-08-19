"use client";

import React, { useEffect, useRef } from "react";

type LBWAFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function LBWAFormula({ compact = false }: LBWAFormulaProps) {
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
    title: "\\textbf{LBWA (Level Based Weight Assessment & Evaluation) — Steps}",
    step1_formula: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step2_norm: "r_{i,j} = \\begin{cases} \\frac{x_{i,j}}{\\max_k x_{k,j}} & \\text{if beneficial} \\\\[1em] \\frac{\\min_k x_{k,j}}{x_{i,j}} & \\text{if non-beneficial} \\end{cases} \\tag{2}",
    step3_level: "w_j^{\\text{raw}} = w_j \\times \\frac{1}{1 + (\\text{level}_j - 1) \\times r}, \\quad r = 0.5 \\tag{3}",
    step4_norm_w: "w_j^{\\text{LBWA}} = \\frac{w_j^{\\text{raw}}}{\\sum_{k=1}^{n} w_k^{\\text{raw}}}, \\quad \\sum_{j=1}^{n} w_j^{\\text{LBWA}} = 1 \\tag{4}",
    step5_score: "\\text{Score}_i = \\sum_{j=1}^{n} w_j^{\\text{LBWA}} \\times r_{i,j} \\tag{5}",
    ranking: "Rank(A_i) \\uparrow \\text{ as } \\text{Score}_i \\uparrow \\quad \\text{(Higher score } \\Rightarrow \\text{ Best alternative)} \\tag{6}",
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

        <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            LBWA (Level Based Weight Assessment) is a multi-criteria model developed by Žižović &amp; Pamučar that organizes criteria into hierarchical importance levels and uses elasticity coefficients to compute consistent weights and alternative utility rankings.
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
            <div className="mb-2 font-semibold">Step II. Linear Matrix Normalization:</div>
            <p className="text-sm text-gray-600 mb-2">Normalize criterion values according to beneficial and non-beneficial orientations:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_norm}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step III. Hierarchical Level Grouping & Elasticity Scaling:</div>
            <p className="text-sm text-gray-600 mb-2">Assign criteria into priority tiers and scale weights using elasticity coefficient r = 0.5:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_level}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step IV. LBWA Criteria Weight Normalization:</div>
            <p className="text-sm text-gray-600 mb-2">Normalize the raw level-scaled weights so they sum to 1.0:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_norm_w}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step V. Alternative Utility Scoring:</div>
            <p className="text-sm text-gray-600 mb-2">Aggregate normalized matrix values with the final LBWA weights:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_score}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step VI. Alternative Ranking:</div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
            </div>
          </li>
        </ol>

        <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-indigo-900 mb-2">Interpretation & Characteristics</div>
          <p className="text-sm text-gray-700 leading-relaxed">
            LBWA eliminates subjectivity and inconsistency in expert evaluations by substituting complex pairwise matrices with straightforward multi-tier elasticity levels.
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
          <strong>Reference:</strong> Žižović, M., &amp; Pamučar, D. (2019). &quot;New model for determining criteria weights: Level Based Weight Assessment (LBWA) model.&quot; <em>Decision Making: Applications in Management and Engineering</em>, 2(2), 126–137.{" "}
          <a className="text-blue-600 underline font-semibold" target="_blank" rel="noreferrer" href="https://doi.org/10.31181/dmame1902102z">
            DOI: 10.31181/dmame1902102z
          </a>
        </div>
      </div>
    </>
  );
}
