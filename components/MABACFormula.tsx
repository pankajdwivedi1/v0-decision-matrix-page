"use client"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function MABACFormula() {
  const latex = {
    step1: "X = [x_{ij}]_{m \\times n} \\tag{1}",
    step2_benefit: "n_{ij} = \\frac{x_{ij} - x_j^{\\min}}{x_j^{\\max} - x_j^{\\min}} \\tag{2}",
    step2_cost: "n_{ij} = \\frac{x_j^{\\max} - x_{ij}}{x_j^{\\max} - x_j^{\\min}} \\tag{3}",
    step3: "v_{ij} = w_j \\cdot n_{ij} + w_j \\tag{4}",
    step4: "g_j = (\\prod_{i=1}^{m} v_{ij})^{\\frac{1}{m}} \\tag{5}",
    step5: "q_{ij} = v_{ij} - g_j \\tag{6}",
    step6: "S_i = \\sum_{j=1}^{n} q_{ij} \\tag{7}"
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
      <style dangerouslySetInnerHTML={{__html: `
          .latex { font-size: 0.875rem !important; line-height: 2 !important; margin: 1rem 0; display: block; }
          .latex mjx-container { font-size: 0.875rem !important; max-width: 100% !important; overflow-x: auto; overflow-y: hidden; margin: 0.75rem 0 !important; padding: 0.5rem 0 !important; text-align: center !important; }
          .latex mjx-math { font-size: 0.875rem !important; outline: none !important; }
          ol li { margin-bottom: 2rem !important; line-height: 1.8 !important; }
          .bg-gray-50 { padding: 1.5rem !important; margin: 1rem 0 !important; display: block !important; width: 100% !important; overflow-x: auto; }
          @media (max-width: 640px) {
            .bg-gray-50 { padding: 0.75rem !important; margin: 0.75rem 0 !important; }
            .latex { font-size: 0.75rem !important; }
            .latex mjx-container { margin: 0.5rem 0 !important; padding: 0.25rem 0 !important; }
            h1 { font-size: 1.25rem !important; margin-bottom: 1rem !important; }
            h2 { font-size: 1rem !important; margin-top: 1rem !important; }
            p, li { font-size: 0.875rem !important; }
          }
        `}} />
      <div ref={containerRef} style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
        <h1 className="text-2xl font-bold text-center mb-6">
          MABAC Method (Multi-Attributive Border Approximation Area Comparison)
        </h1>

        <p className="mb-4">
          The MABAC method is based on the distance of alternatives from the border approximation area. The ranking is determined by these distances.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
        <p className="mb-2">The process begins with a decision matrix of alternatives vs. criteria:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
            <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Normalization</h2>
        <p className="mb-2">Normalize the decision matrix (Min-Max):</p>
        <p className="font-semibold mb-2 text-center">Beneficial criteria</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_benefit}\\]` }} />
        </div>
        <p className="font-semibold mb-2 text-center">Non-beneficial criteria</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_cost}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Weighted Matrix</h2>
        <p className="mb-2">Calculate the elements of the weighted matrix V:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Border Approximation Area (G)</h2>
        <p className="mb-2">Determine the border approximation area for each criterion:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. Distance Matrix (Q)</h2>
        <p className="mb-2">Calculate the distance of alternatives from the border approximation area:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step5}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. Ranking</h2>
        <p className="mb-2">Calculate the final scores for each alternative by summing the distances:</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step6}\\]` }} />
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Source: Pamučar, D., & Ćirović, G. (2015). The single valued neutrosophic MABAC method.
        </div>
      </div>
    </>
  )
}
