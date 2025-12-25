"use client"
import { useEffect } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function MULTIMOORAFormula() {
  const latex = {
    step1: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step2_norm: "r_{i,j} = \\frac{x_{i,j}}{\\sqrt{\\sum_{i=1}^{m} x_{i,j}^2}} \\tag{2}",
    step3_weight: "v_{i,j} = w_j \\times r_{i,j} \\tag{3}",
    step4_rs: "y_i = \\sum_{j \\in beneficial} v_{i,j} - \\sum_{j \\in cost} v_{i,j} \\tag{4}",
    step4_rp_ref: "r_j^* = \\begin{cases} \\max_i v_{i,j} & j \\in beneficial \\\\ \\min_i v_{i,j} & j \\in cost \\end{cases} \\tag{5}",
    step4_rp: "z_i = \\max_j | v_{i,j} - r_j^* | \\tag{6}",
    step4_fmf: "u_i = \\frac{\\prod_{j \\in beneficial} v_{i,j}}{\\prod_{j \\in cost} v_{i,j}} \\tag{7}",
    step5_combine: "\\text{Final Rank} = f(\\text{Rank}(y_i), \\text{Rank}(z_i), \\text{Rank}(u_i))"
  }

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise?.()
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = document.querySelector('script[data-mathjax="loaded"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      script.setAttribute("data-mathjax", "loaded");
      document.head.appendChild(script);
    }
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
          

          /* Mobile adjustments */
          @media (max-width: 640px) {
            
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
      <div style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
        <h1 className="text-2xl font-bold text-center mb-6">
          MULTIMOORA (Multi-Objective Optimization by Ratio Analysis plus Full Multiplicative Form)
        </h1>

        <p className="mb-4">
          MULTIMOORA combines three approaches (Ratio System, Reference Point, Full Multiplicative Form) for robust ranking.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1-3. Preparation</h2>
        <p className="mb-2">Construct matrix, normalize (Vector), and weight:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
        </div>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_norm}\\]` }} />
        </div>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_weight}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4a. Ratio System (RS)</h2>
        <p className="mb-2">Arithmetic weighted aggregation (like MOORA):</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_rs}\\]` }} />
        </div>
        <p className="text-sm text-gray-600 text-center mb-4">Rank Descending (Higher is better)</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4b. Reference Point (RP)</h2>
        <p className="mb-2">Maximal distance from reference point (Min-Max Metric):</p>

        <p className="mb-2 text-center">Reference Point:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_rp_ref}\\]` }} />
        </div>
        <p className="mt-4 mb-2 text-center">Distance:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_rp}\\]` }} />
        </div>
        <p className="text-sm text-gray-600 text-center mb-4">Rank Ascending (Lower distance is better)</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4c. Full Multiplicative Form (FMF)</h2>
        <p className="mb-2">Geometric weighted aggregation:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_fmf}\\]` }} />
        </div>
        <p className="text-sm text-gray-600 text-center mb-4">Rank Descending (Higher is better)</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. Final Ranking</h2>
        <p className="mb-2">Aggregate the three rankings using Dominance Theory (e.g., Copeland's method or average rank):</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_combine}\\]` }} />
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Source: Brauers & Zavadskas (2010).
        </div>
      </div>
    </>
  )
}
