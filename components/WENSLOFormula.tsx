"use client"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function WENSLOFormula() {
  const latex = {
    step1: "X = [x_{i,j}]_{m \\times n} \\tag{1}",
    step2: "d_j = \\begin{cases} +1, & \\text{benefit (MAX)}\\\\ -1, & \\text{cost (MIN)} \\end{cases} \\tag{2}",
    step3_benefit: "r_{i,j}=\\frac{x_{i,j}-\\min_i x_{i,j}}{\\max_i x_{i,j}-\\min_i x_{i,j}} \\tag{3}",
    step3_cost: "r_{i,j}=\\frac{\\max_i x_{i,j}-x_{i,j}}{\\max_i x_{i,j}-\\min_i x_{i,j}} \\tag{4}",
    step4: "s_j = \\sum_{i=1}^{m} r_{i,j} \\tag{5}",
    step5: "w_j = \\frac{s_j}{\\sum_{k=1}^{n} s_k}, \\qquad \\sum_{j=1}^{n} w_j = 1 \\tag{6}"
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
          WENSLO Weighting Method
        </h1>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
        <p className="mb-2">The decision matrix is defined as:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Criterion Type</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Normalization</h2>
        <p className="mb-2">For benefit criteria:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_benefit}\\]` }} />
        </div>
        <p className="mb-2">For cost criteria:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_cost}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Criterion Statistical Score</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. WENSLO Weights</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step5}\\]` }} />
        </div>
      </div>
    </>
  )
}
