"use client"
import { useEffect } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function VIKORFormula() {
  const latex = {
    step1: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad i=1,\\dots,m, \\quad j=1,\\dots,n",
    step2_benefit: "f_{i,j} = \\frac{x_{i,j}}{\\max_i x_{i,j}}",
    step2_cost: "f_{i,j} = \\frac{\\min_i x_{i,j}}{x_{i,j}}",
    step3_best: "f_j^* = \\begin{cases} \\max_i f_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\min_i f_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases}",
    step3_worst: "f_j^- = \\begin{cases} \\min_i f_{i,j} & \\text{if } j \\in \\text{beneficial} \\\\ \\max_i f_{i,j} & \\text{if } j \\in \\text{non-beneficial} \\end{cases}",
    step4_formula: "S_i = \\sum_{j=1}^{n} w_j \\frac{f_j^* - f_{i,j}}{f_j^* - f_j^-}, \\quad \\sum_{j=1}^{n} w_j = 1",
    step5_formula: "R_i = \\max_j \\left[ w_j \\frac{f_j^* - f_{i,j}}{f_j^* - f_j^-} \\right]",
    step6_formula: "Q_i = v \\frac{S_i - S^*}{S^- - S^*} + (1-v) \\frac{R_i - R^*}{R^- - R^*}, \\quad S^*=\\min S_i, R^*=\\min R_i",
    ranking: "\\text{Rank } A_i \\downarrow \\text{ by } Q_i \\text{ (Ascending)}"
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
          VIKOR (VlseKriterijumska Optimizacija I Kompromisno Resenje) Steps
        </h1>

        <p className="mb-4">
          VIKOR finds a compromise solution closest to the ideal, considering both group utility and individual regret.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
        <p className="mb-2">Construct the decision matrix:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step1} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Normalization</h2>
        <p className="mb-2">Normalize the values (Linear Normalization):</p>

        <p className="font-semibold mb-2 text-center">Beneficial criteria (Desirable or Maximum)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step2_benefit} $$`}</p>
        </div>

        <p className="font-semibold mb-2 text-center">Non-beneficial criteria (Undesirable or Minimum)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step2_cost} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Best and Worst Values</h2>
        <p className="mb-2">Determine best (f*) and worst (f-) values:</p>

        <p className="font-semibold mb-2 text-center">Best Value (f*)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step3_best} $$`}</p>
        </div>

        <p className="font-semibold mb-2 text-center">Worst Value (f-)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step3_worst} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Utility Measure (Si)</h2>
        <p className="mb-2">Calculate the weighted sum of normalized distances (Group Utility):</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step4_formula} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. Regret Measure (Ri)</h2>
        <p className="mb-2">Calculate the maximum weighted normalized distance (Individual Regret):</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step5_formula} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. VIKOR Index (Qi)</h2>
        <p className="mb-2">Calculate the compromise index (v ≈ 0.5):</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step6_formula} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 7. Ranking</h2>
        <p className="mb-2">Rank alternatives by Qi (lower is better):</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.ranking} $$`}</p>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Source: VIKOR method formulation (Opricovic, 1998).
        </div>
      </div>

    </>
  )
}




