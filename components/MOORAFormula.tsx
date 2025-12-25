"use client"
import { useEffect } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function MOORAFormula() {
  const latex = {
    step1: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step2_formula: "x_{i,j}^* = \\frac{x_{i,j}}{\\sqrt{\\sum_{i=1}^{m} x_{i,j}^2}} \\tag{2}",
    step3_formula: "y_{i,j} = w_j \\times x_{i,j}^*, \\quad \\sum_{j=1}^{n} w_j = 1 \\tag{3}",
    step4_beneficial: "y_i^+ = \\sum_{j \\in \\Omega_{max}} y_{i,j} \\tag{4}",
    step5_non_beneficial: "y_i^- = \\sum_{j \\in \\Omega_{min}} y_{i,j} \\tag{5}",
    step6_formula: "y_i = y_i^+ - y_i^- \\tag{6}",
    ranking: "\\text{Rank } A_i \\downarrow \\text{ by } y_i \\text{ (Descending)}"
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
          MOORA (Multi-Objective Optimization by Ratio Analysis)
        </h1>

        <p className="mb-4">
          MOORA optimizes two or more conflicting objectives (beneficial vs non-beneficial) simultaneously.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
        <p className="mb-2">Construct the decision matrix:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Normalization</h2>
        <p className="mb-2">Normalize using Vector Normalization:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_formula}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Weighted Normalized Matrix</h2>
        <p className="mb-2">Apply criterion weights:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_formula}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4 & 5. Criteria Sums</h2>
        <p className="mb-2">Calculate sums for beneficial and cost criteria:</p>

        <p className="font-semibold mb-2 text-center">Beneficial Sum (y+)</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_beneficial}\\]` }} />
        </div>

        <p className="font-semibold mb-2 text-center">Cost Sum (y-)</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_non_beneficial}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. MOORA Score</h2>
        <p className="mb-2">Calculate the net score (difference of sums):</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_formula}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 7. Ranking</h2>
        <p className="mb-2">Rank alternatives by score (higher is better):</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Source: Brauers & Zavadskas (2006).
        </div>
      </div>
    </>
  )
}
