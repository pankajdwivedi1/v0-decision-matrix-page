"use client"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function WASPASFormula() {
  const latex = {
    decision_matrix: "X = [x_{ij}]_{m \\times n} = \\begin{bmatrix} x_{11} & x_{12} & \\dots & x_{1n} \\\\ x_{21} & x_{22} & \\dots & x_{2n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m1} & x_{m2} & \\dots & x_{mn} \\end{bmatrix} \\tag{1}",
    step1_benefit: "\\overline{x}_{ij} = \\frac{x_{ij}}{\\max_i x_{ij}} \\tag{2}",
    step1_cost: "\\overline{x}_{ij} = \\frac{\\min_i x_{ij}}{x_{ij}} \\tag{3}",
    step2_wsm: "Q_i^{(1)} = \\sum_{j=1}^{n} \\overline{x}_{ij} \\cdot w_j \\tag{4}",
    step3_wpm: "Q_i^{(2)} = \\prod_{j=1}^{n} (\\overline{x}_{ij})^{w_j} \\tag{5}",
    step4_formula: "Q_i = \\lambda Q_i^{(1)} + (1 - \\lambda) Q_i^{(2)}, \\quad \\lambda \\in [0,1] \\tag{6}",
    ranking: "\\text{Rank } A_i \\downarrow \\text{ by } Q_i \\text{ (Descending)}"
  }

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Robust MathJax loader copied from PROMETHEEFormula
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

  // Re-run typeset on updates
  useEffect(() => {
    setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .latex {
            font-size: 0.875rem !important;
            line-height: 2 !important; 
            margin: 1rem 0;
            display: block;
          }
          .latex mjx-container {
            font-size: 0.875rem !important;
            max-width: 100% !important;
            overflow-x: auto;
            overflow-y: hidden;
            
            margin: 0.75rem 0 !important;
            padding: 0.5rem 0 !important;
            text-align: center !important; 
          }
          .latex mjx-math {
            font-size: 0.875rem !important;
            outline: none !important;
          }
          /* Fix list item spacing */
          ol li {
            margin-bottom: 2rem !important;
            line-height: 1.8 !important;
          }
          /* Add more space to gray boxes */
          .bg-gray-50 {
            padding: 1.5rem !important;
            margin: 1rem 0 !important;
            display: block !important;
            width: 100% !important;
            overflow-x: auto;
          }

          /* Mobile adjustments */
          @media (max-width: 640px) {
            .bg-gray-50 {
              padding: 0.75rem !important;
              margin: 0.75rem 0 !important;
            }
            .latex {
              font-size: 0.75rem !important;
            }
            .latex mjx-container {
              margin: 0.5rem 0 !important;
              padding: 0.25rem 0 !important;
            }
            h1 {
              font-size: 1.25rem !important;
              margin-bottom: 1rem !important;
            }
            h2 {
              font-size: 1rem !important;
              margin-top: 1rem !important;
            }
            p, li {
              font-size: 0.875rem !important;
            }
          }
        `
      }} />
      <div ref={containerRef} style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
        <h1 className="text-2xl font-bold text-center mb-6">
          WASPAS (Weighted Aggregated Sum Product Assessment)
        </h1>

        <p className="mb-4">
          WASPAS combines Weighted Sum Model (WSM) and Weighted Product Model (WPM) for robust decision making.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
        <p className="mb-2">Construct the decision matrix where rows represent alternatives and columns represent criteria:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.decision_matrix}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Normalization</h2>
        <p className="mb-2">Normalize the decision matrix (Linear Normalization):</p>

        <p className="font-semibold mb-2 text-center">Beneficial criteria (Desirable or Maximum)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_benefit}\\]` }} />
        </div>

        <p className="font-semibold mb-2 text-center">Non-beneficial criteria (Undesirable or Minimum)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_cost}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Weighted Sum Model (WSM)</h2>
        <p className="mb-2">Calculate the additive weighted contribution:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_wsm}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Weighted Product Model (WPM)</h2>
        <p className="mb-2">Calculate the multiplicative weighted contribution:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_wpm}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. WASPAS Score</h2>
        <p className="mb-2">Calculate the aggregated score (typically λ = 0.5):</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_formula}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. Ranking</h2>
        <p className="mb-2">Rank alternatives in descending order (higher is better):</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Source: Zavadskas, E. K., Turskis, Z., & Antucheviciene, J. (2012). Optimization of Weighted Aggregated Sum Product Assessment.
        </div>
      </div>
    </>
  )
}
