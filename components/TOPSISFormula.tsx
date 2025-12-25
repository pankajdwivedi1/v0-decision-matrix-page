"use client"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function TOPSISFormula() {
  const latex = {
    step1: "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step2_formula: "r_{i,j} = \\frac{x_{i,j}}{\\sqrt{\\sum_{i=1}^{m} x_{i,j}^2}} \\tag{2}",
    step3_formula: "v_{i,j} = w_j \\times r_{i,j}, \\quad \\sum_{j=1}^{n} w_j = 1 \\tag{3}",
    step4_ideal: "A^+ = \\{v_1^+, \\dots, v_n^+\\} = \\{ (\\max_i v_{i,j} | j \\in J), (\\min_i v_{i,j} | j \\in J') \\} \\tag{4}",
    step4_nadir: "A^- = \\{v_1^-, \\dots, v_n^-\\} = \\{ (\\min_i v_{i,j} | j \\in J), (\\max_i v_{i,j} | j \\in J') \\} \\tag{5}",
    step5_plus: "d_i^+ = \\sqrt{\\sum_{j=1}^{n} (v_{i,j} - v_j^+)^2} \\tag{6}",
    step5_minus: "d_i^- = \\sqrt{\\sum_{j=1}^{n} (v_{i,j} - v_j^-)^2} \\tag{7}",
    step6_formula: "C_i = \\frac{d_i^-}{d_i^+ + d_i^-}, \\quad 0 \\leq C_i \\leq 1 \\tag{8}",
    ranking: "\\text{Rank } A_i \\downarrow \\text{ by } C_i \\text{ (Descending)}"
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
      <div ref={containerRef} style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
        <h1 className="text-2xl font-bold text-center mb-6">
          TOPSIS (Technique for Order Preference by Similarity to Ideal Solution)
        </h1>

        <p className="mb-4">
          TOPSIS selects the alternative that is closest to the positive ideal solution and farthest from the negative ideal solution.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
        <p className="mb-2">Construct the decision matrix X:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Normalization</h2>
        <p className="mb-2">Calculate the normalized decision matrix:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_formula}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Weighted Normalized Matrix</h2>
        <p className="mb-2">Calculate the weighted normalized values:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_formula}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Ideal Solutions</h2>
        <p className="mb-2">Determine Positive Ideal (A⁺) and Negative Ideal (A⁻) solutions:</p>

        <p className="font-semibold mb-2 text-center">Positive Ideal (A⁺)</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_ideal}\\]` }} />
        </div>

        <p className="font-semibold mb-2 text-center">Negative Ideal (A⁻)</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_nadir}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. Separation Measures</h2>
        <p className="mb-2">Calculate Euclidean distances to ideal solutions:</p>

        <p className="font-semibold mb-2 text-center">Distance to A⁺</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_plus}\\]` }} />
        </div>

        <p className="font-semibold mb-2 text-center">Distance to A⁻</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_minus}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. Closeness Coefficient</h2>
        <p className="mb-2">Calculate the relative closeness to the ideal solution:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_formula}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 7. Ranking</h2>
        <p className="mb-2">Rank alternatives in descending order of Ci:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Source: Hwang & Yoon (1981). Multiple Attribute Decision Making: Methods and Applications.
        </div>
      </div>
    </>
  )
}
