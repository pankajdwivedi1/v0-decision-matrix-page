"use client"
import { useEffect } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function COPRASFormula() {
  const latex = {
    step1: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad i=1,\\dots,m, \\quad j=1,\\dots,n",
    step2_formula: "\\bar{x}_{i,j} = \\frac{x_{i,j}}{\\sum_{i=1}^{m} x_{i,j}}",
    step3_formula: "d_{i,j} = w_j \\times \\bar{x}_{i,j}, \\quad \\sum_{j=1}^{n} w_j = 1",
    step4_formula: "S_i^+ = \\sum_{j=1}^{k} d_{i,j}, \\quad j \\in \\text{beneficial}",
    step5_formula: "S_i^- = \\sum_{j=k+1}^{n} d_{i,j}, \\quad j \\in \\text{non-beneficial}",
    step6_formula: "Q_i = S_i^+ + \\frac{\\sum_{i=1}^{m} S_i^-}{S_i^- \\sum_{i=1}^{m} \\frac{1}{S_i^-}}, \\quad S_{min}^- = \\min_i S_i^-",
    ranking: "\\text{Rank } A_i \\downarrow \\text{ by } Q_i \\text{ (Descending)}"
  }

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise?.()
    }
  })

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
            overflow-x: auto !important;
            overflow-y: visible !important;
            display: block !important;
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
      <div style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
        <h1 className="text-2xl font-bold text-center mb-6">
          COPRAS (Complex Proportional Assessment)
        </h1>

        <p className="mb-4">
          COPRAS evaluates alternatives by considering determining a solution with the best ratio to the ideal and worst ideal solution.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
        <p className="mb-2">Construct the decision matrix:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step1} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Normalization</h2>
        <p className="mb-2">Normalize the matrix (Linear Normalization):</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step2_formula} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Weighted Normalized Matrix</h2>
        <p className="mb-2">Apply criterion weights:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step3_formula} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Beneficial Sum (S+)</h2>
        <p className="mb-2">Sum of weighted values for beneficial criteria:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step4_formula} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. Non-Beneficial Sum (S-)</h2>
        <p className="mb-2">Sum of weighted values for non-beneficial criteria:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step5_formula} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. Relative Significance (Q)</h2>
        <p className="mb-2">Calculate priority based on S+ and S-:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step6_formula} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 7. Ranking</h2>
        <p className="mb-2">Rank alternatives by Qi (higher is better):</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.ranking} $$`}</p>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Source: Zavadskas & Kaklauskas (1996).
        </div>
      </div>

    </>
  )
}




