"use client"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function FuzzySWIFormula() {
  const latex = {
    step1: "\\tilde{X} = [\\tilde{x}_{i,j}]_{m\\times n} = \\begin{bmatrix} \\tilde{x}_{1,1} & \\dots & \\tilde{x}_{1,n} \\\\ \\tilde{x}_{2,1} & \\dots & \\tilde{x}_{2,n} \\\\ \\vdots & \\ddots & \\vdots \\\\ \\tilde{x}_{m,1} & \\dots & \\tilde{x}_{m,n} \\end{bmatrix}, \\quad \\tilde{x}_{i,j} > 0, \\quad \\tilde{x}_{i,j} = (l_{i,j}, m_{i,j}, u_{i,j}) \\tag{1}",
    step2_benefit: "\\tilde{r}_{i,j} = \\left( \\frac{l_{i,j}}{\\sum u_{i,j}}, \\frac{m_{i,j}}{\\sum m_{i,j}}, \\frac{u_{i,j}}{\\sum l_{i,j}} \\right) \\tag{2}",
    step2_cost: "\\tilde{r}_{i,j} = \\frac{1/\\tilde{x}_{i,j}}{\\sum_{i=1}^m 1/\\tilde{x}_{i,j}} \\tag{3}",
    step2_cost_expanded: "\\tilde{r}_{i,j} = \\left( \\frac{1/u_{i,j}}{\\sum 1/l_{i,j}}, \\frac{1/m_{i,j}}{\\sum 1/m_{i,j}}, \\frac{1/l_{i,j}}{\\sum 1/u_{i,j}} \\right) \\tag{4}",
    step3: "\\tilde{I}_{i,j} = \\log_2 \\left( \\frac{1}{\\tilde{r}_{i,j}} \\right) = (\\log_2(1/u_{r_{i,j}}), \\log_2(1/m_{r_{i,j}}), \\log_2(1/l_{r_{i,j}})) \\tag{5}",
    step4: "\\tilde{v}_{i,j} = \\tilde{I}_{i,j} \\otimes w_j = (l_{I_{i,j}} \\times w_j, m_{I_{i,j}} \\times w_j, u_{I_{i,j}} \\times w_j) \\tag{6}",
    step5: "S_i = \\sum_{j=1}^n \\tilde{v}_{i,j} \\tag{7}",
    step6: "F-SWI_i' = \\text{Defuzzify}(S_i) = \\frac{l_{S_i} + m_{S_i} + u_{S_i}}{3} \\tag{8}",
    ranking: "Rank(X_i) \\uparrow \\text{ as } F-SWI_i' \\downarrow \\text{ (Ascending)}"
  }

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
        if (window.MathJax) window.MathJax.startup = { ...window.MathJax.startup, typeset: false };
        setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
      };
    } else {
      setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .latex { font-size: 0.875rem !important; line-height: 2 !important; margin: 1rem 0; display: block; }
          .latex mjx-container { font-size: 0.875rem !important; max-width: 100% !important; overflow-x: auto; overflow-y: hidden; margin: 0.75rem 0 !important; padding: 0.5rem 0 !important; text-align: center !important; }
          @media (max-width: 640px) { .latex { font-size: 0.75rem !important; } h1 { font-size: 1.25rem !important; } h2 { font-size: 1rem !important; } p, li { font-size: 0.875rem !important; } }
        `
      }} />
      <div ref={containerRef} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
        <h1 className="text-2xl font-bold text-center mb-6">Fuzzy SWI Method</h1>
        <p className="mb-4">Fuzzy SWI (Sum Weighted Information) evaluates alternatives by summing the weighted information content derived from fuzzy decision values.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Fuzzy Decision Matrix</h2>
        <p className="mb-2">The decision-maker constructs the information fuzzy decision matrix (IDM) in the first step, where each element is a TFN triplet (l, m, u):</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
        </div>
        <p className="text-sm italic mb-4">where i = 1, 2, ..., m represents the alternatives and j = 1, 2, ..., n represents the criteria.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Fuzzy Normalization</h2>
        <p className="mb-2">For beneficial criteria:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_benefit}\\]` }} />
        </div>
        <p className="mb-2">For non-beneficial criteria (cost):</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_cost}\\]` }} />
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_cost_expanded}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Fuzzy Information Matrix</h2>
        <p className="mb-2">Calculate the information content using base-2 logarithm:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Weighted Information Matrix</h2>
        <p className="mb-2">Multiply the fuzzy information content by the criterion weight:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. Total Fuzzy Score</h2>
        <p className="mb-2">Sum the weighted information values for each alternative:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. Defuzzification and Final Ranking</h2>
        <p className="mb-2">Defuzzify the total score to obtain a crisp value for final ranking:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step6}\\]` }} />
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
        </div>
      </div>
    </>
  )
}
