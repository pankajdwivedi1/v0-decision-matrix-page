"use client"
import { useEffect } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function EDASFormula() {
  const latex = {
    step1: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad i=1,\\dots,m, \\quad j=1,\\dots,n",
    step2_formula: "AV_j = \\frac{1}{m} \\sum_{i=1}^{m} x_{i,j}",
    step3_benefit: "PDA_{i,j} = \\frac{\\max(0, x_{i,j} - AV_j)}{AV_j}",
    step3_cost: "PDA_{i,j} = \\frac{\\max(0, AV_j - x_{i,j})}{AV_j}",
    step4_benefit: "NDA_{i,j} = \\frac{\\max(0, AV_j - x_{i,j})}{AV_j}",
    step4_cost: "NDA_{i,j} = \\frac{\\max(0, x_{i,j} - AV_j)}{AV_j}",
    step5_pda: "SP_i = \\sum_{j=1}^{n} w_j \\, PDA_{i,j}, \\quad \\sum w_j = 1",
    step5_nda: "SN_i = \\sum_{j=1}^{n} w_j \\, NDA_{i,j}",
    step6_sp: "NSP_i = \\frac{SP_i}{\\max_i SP_i}",
    step6_sn: "NSN_i = 1 - \\frac{SN_i}{\\max_i SN_i}",
    step7_formula: "AS_i = \\frac{1}{2} (NSP_i + NSN_i)",
    ranking: "\\text{Rank } A_i \\downarrow \\text{ by } AS_i \\text{ (Descending)}"
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
          EDAS (Evaluation based on Distance from Average Solution)
        </h1>

        <p className="mb-4">
          EDAS evaluates alternatives based on their distance from the average solution, considering both positive (PDA) and negative (NDA) deviations.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
        <p className="mb-2">Construct the decision matrix:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step1} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Average Solution (AV)</h2>
        <p className="mb-2">Calculate the average value for each criterion:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step2_formula} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Positive Distance (PDA)</h2>
        <p className="mb-2">Calculate the positive distance from average:</p>

        <p className="font-semibold mb-2 text-center">Beneficial criteria (Desirable or Maximum)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step3_benefit} $$`}</p>
        </div>

        <p className="font-semibold mb-2 text-center">Non-beneficial criteria (Undesirable or Minimum)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step3_cost} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Negative Distance (NDA)</h2>
        <p className="mb-2">Calculate the negative distance from average:</p>

        <p className="font-semibold mb-2 text-center">Beneficial criteria (Desirable or Maximum)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step4_benefit} $$`}</p>
        </div>

        <p className="font-semibold mb-2 text-center">Non-beneficial criteria (Undesirable or Minimum)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step4_cost} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. Weighted Sums (SP & SN)</h2>
        <p className="mb-2">Calculate the weighted sums for PDA and NDA:</p>

        <p className="font-semibold mb-2 text-center">Weighted Sum PDA</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step5_pda} $$`}</p>
        </div>

        <p className="font-semibold mb-2 text-center">Weighted Sum NDA</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step5_nda} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. Normalization</h2>
        <p className="mb-2">Normalize the weighted sums:</p>

        <p className="font-semibold mb-2 text-center">Normalized SP (NSP)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step6_sp} $$`}</p>
        </div>

        <p className="font-semibold mb-2 text-center">Normalized SN (NSN)</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step6_sn} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 7. Appraisal Score (AS)</h2>
        <p className="mb-2">Calculate the final appraisal score:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.step7_formula} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 8. Ranking</h2>
        <p className="mb-2">Rank alternatives by AS (higher is better):</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <p className="text-center">{`$$ ${latex.ranking} $$`}</p>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Source: Keshavarz Ghorabaee et al. (2015). Multi-criteria inventory classification using a new method of evaluation based on distance from average solution (EDAS).
        </div>
      </div>

    </>
  )
}




