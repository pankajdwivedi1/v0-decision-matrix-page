"use client"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function MERECFormula() {
  const latex = {
    step1: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad i=1,\\dots,m, \\quad j=1,\\dots,n \\tag{1}",
    step2_benefit: "r_{ij} = \\dfrac{x_{ij}}{\\max_i x_{ij}} \\tag{2a}",
    step2_cost: "r_{ij} = \\dfrac{\\min_i x_{ij}}{x_{ij}} \\tag{2b}",
    step3: "S_i = \\sum_{j=1}^{n} r_{ij}, \\quad i = 1,\\dots,m \\tag{3}",
    step4: "S_i^{(-k)} = \\sum_{\\substack{j=1\\\\ j\\ne k}}^{n} r_{ij}, \\quad i=1,\\dots,m \\tag{4}",
    step5: "E_k = \\sum_{i=1}^{m} \\left| S_i - S_i^{(-k)} \\right|, \\quad k = 1,\\dots,n \\tag{5}",
    step6: "w_k = \\dfrac{E_k}{\\sum_{j=1}^{n} E_j}, \\quad \\sum_{k=1}^n w_k = 1 \\tag{6}"
  }

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Robust MathJax loader
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
          .muted {
            color: #6b7280;
            font-size: 0.875rem;
          }
        `
      }} />
      <div ref={containerRef} style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
        <h1 className="text-2xl font-bold text-center mb-6">
          MEREC Weight Method
        </h1>

        <p className="mb-4">
          The MEREC (Method based on the Removal Effects of Criteria) determines objective weights by analyzing the effect of removing each criterion on the alternatives' performance.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
        <p className="mb-2">Construct the decision matrix:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Normalize the decision matrix</h2>
        <p className="mb-2">Calculate the normalized values. For <strong>benefit</strong> criteria:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_benefit}\\]` }} />
        </div>
        <p className="mb-2">For <strong>cost</strong> criteria:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_cost}\\]` }} />
        </div>
        <p className="mb-2" dangerouslySetInnerHTML={{ __html: "Collect normalized values into \\( R = [r_{ij}]_{m\\times n} \\)." }} />

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Calculate overall performance of alternatives</h2>
        <p className="mb-2" dangerouslySetInnerHTML={{ __html: "Calculate the overall performance score \\(S_i\\) for each alternative:" }} />
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
        </div>
        <p className="text-sm text-gray-600 text-center mb-4" dangerouslySetInnerHTML={{ __html: "\\(S_i\\) is the baseline score for alternative \\(A_i\\) with all criteria included." }} />

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Calculation of performance with removing each criterion</h2>
        <p className="mb-2" dangerouslySetInnerHTML={{ __html: "Calculate the performance of each alternative when criterion \\(C_k\\) is removed:" }} />
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. Calculation of the removal effect</h2>
        <p className="mb-2">Compute the absolute deviation sum for each criterion:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step5}\\]` }} />
        </div>
        <p className="text-sm text-gray-600 text-center mb-4" dangerouslySetInnerHTML={{ __html: "Large \\(E_k\\) indicates criterion \\(C_k\\) has a strong effect when removed." }} />

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. Calculation of objective weights</h2>
        <p className="mb-2">Normalize the removal effects to obtain the final weights:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step6}\\]` }} />
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Source: Keshavarz-Ghorabaee, M., Amiri, M., Zavadskas, E. K., Turskis, Z., & Antucheviciene, J. (2021). Determination of Objective Weights using a New Method Based on the Removal Effects of Criteria (MEREC).
        </div>
      </div>
    </>
  )
}
