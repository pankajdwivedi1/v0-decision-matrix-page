"use client";

import React, { useEffect, useRef } from "react";

type MonteCarloFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function MonteCarloFormula({ compact = false }: MonteCarloFormulaProps) {
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
    title: "\\textbf{Monte Carlo Sensitivity Simulation & Rank Reversal Analysis — Steps}",
    step1_weights: "w_j^{(t)} = w_j^{(0)} \\times \\left( 1 + \\delta_j^{(t)} \\right), \\quad \\delta_j^{(t)} \\sim \\mathcal{U}(-\\Delta, +\\Delta) \\tag{1}",
    step2_norm_w: "\\widetilde{w}_j^{(t)} = \\frac{w_j^{(t)}}{\\sum_{k=1}^{n} w_k^{(t)}}, \\quad \\sum_{j=1}^{n} \\widetilde{w}_j^{(t)} = 1 \\tag{2}",
    step3_topsis: "C_i^{(t)} = \\frac{D_i^{-(t)}}{D_i^{+(t)} + D_i^{-(t)}}, \\quad t = 1, 2, \\dots, N \\tag{3}",
    step4_stability: "\\text{Stability}(A_i, r) = \\frac{1}{N} \\sum_{t=1}^{N} \\mathbb{I}\\left( \\text{Rank}^{(t)}(A_i) = r \\right) \\times 100\\% \\tag{4}",
    step5_reversal: "P_{\\text{Reversal}} = \\frac{1}{N} \\sum_{t=1}^{N} \\mathbb{I}\\left( \\text{Winner}^{(t)} \\neq A_{\\text{base}}^* \\right) \\times 100\\% \\tag{5}",
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
            Monte Carlo Sensitivity Simulation tests the stability and robustness of decision results against random weight perturbations, providing statistical evidence required by reviewers in high-impact academic journals.
          </p>
        </div>

        <ol className="space-y-4 list-decimal pl-5 text-black">
          <li>
            <div className="mb-2 font-semibold">Step I. Random Criteria Weight Perturbation:</div>
            <p className="text-sm text-gray-600 mb-2">
              {"For each iteration t = 1, ..., N (typically N = 1,000), perturb each baseline weight by a uniform random variation in [-Δ, +Δ]:"}
            </p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_weights}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step II. Weight Vector Normalization:</div>
            <p className="text-sm text-gray-600 mb-2">Re-normalize the perturbed criteria weights so they strictly sum to 1.0:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_norm_w}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step III. Iterative Decision Evaluation:</div>
            <p className="text-sm text-gray-600 mb-2">Evaluate all alternatives under the perturbed weight vector:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_topsis}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step IV. Rank Stability Probability Calculation:</div>
            <p className="text-sm text-gray-600 mb-2">Compute the empirical probability that an alternative maintains its baseline rank:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_stability}\\]` }} />
            </div>
          </li>
          <li>
            <div className="mb-2 font-semibold">Step V. Rank Reversal Probability:</div>
            <p className="text-sm text-gray-600 mb-2">Calculate the frequency with which the top-ranked alternative changes across trials:</p>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_reversal}\\]` }} />
            </div>
          </li>
        </ol>

        <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-indigo-900 mb-2">Statistical Decision Robustness Thresholds</div>
          <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
            <li><strong>High Robustness (&ge; 80%):</strong> The optimal alternative remains invariant under significant weight shifts.</li>
            <li><strong>Moderate Robustness (50% - 79%):</strong> The ranking is generally stable but sensitive to specific high-weight criteria.</li>
            <li><strong>Sensitive (&lt; 50%):</strong> High risk of rank reversal; further expert weight validation is recommended.</li>
          </ul>
        </div>

        <div className="mt-6 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
          <strong>Reference:</strong> Butler, J., Jia, J., &amp; Dyer, J. (1997). &quot;Simulation techniques for the sensitivity analysis of multi-criteria decision models.&quot; <em>European Journal of Operational Research</em>, 103(3), 531–546.{" "}
          <a className="text-blue-600 underline font-semibold" target="_blank" rel="noreferrer" href="https://doi.org/10.1016/S0377-2217(96)00307-4">
            DOI: 10.1016/S0377-2217(96)00307-4
          </a>
        </div>
      </div>
    </>
  );
}
