"use client"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function FuzzyTOPSISFormula() {
  const latex = {
    step1: "\\tilde{X} = [\\tilde{x}_{i,j}]_{m\\times n} = \\begin{bmatrix} \\tilde{x}_{1,1} & \\dots & \\tilde{x}_{1,n} \\\\ \\vdots & \\ddots & \\vdots \\\\ \\tilde{x}_{m,1} & \\dots & \\tilde{x}_{m,n} \\end{bmatrix}, \\quad \\tilde{x}_{i,j} = (l_{i,j}, m_{i,j}, u_{i,j}) \\tag{1}",
    step2_benefit: "\\tilde{r}_{i,j} = \\left( \\frac{l_{i,j}}{u_j^*}, \\frac{m_{i,j}}{u_j^*}, \\frac{u_{i,j}}{u_j^*} \\right), \\quad u_j^* = \\max_i u_{i,j} \\tag{2}",
    step2_cost: "\\tilde{r}_{i,j} = \\left( \\frac{l_j^-}{u_{i,j}}, \\frac{l_j^-}{m_{i,j}}, \\frac{l_j^-}{l_{i,j}} \\right), \\quad l_j^- = \\min_i l_{i,j} \\tag{3}",
    step3: "\\tilde{v}_{i,j} = \\tilde{r}_{i,j} \\otimes w_j = (l_{i,j}^r \\times w_j, m_{i,j}^r \\times w_j, u_{i,j}^r \\times w_j) \\tag{4}",
    step4_fpis: "\\tilde{A}^* = (\\tilde{v}_1^*, \\tilde{v}_2^*, \\dots, \\tilde{v}_n^*), \\quad \\tilde{v}_j^* = (\\max_i l_{v_{i,j}}, \\max_i m_{v_{i,j}}, \\max_i u_{v_{i,j}}) \\tag{5}",
    step4_fnis: "\\tilde{A}^- = (\\tilde{v}_1^-, \\tilde{v}_2^-, \\dots, \\tilde{v}_n^-), \\quad \\tilde{v}_j^- = (\\min_i l_{v_{i,j}}, \\min_i m_{v_{i,j}}, \\min_i u_{v_{i,j}}) \\tag{6}",
    step5_dist: "d(\\tilde{a}, \\tilde{b}) = \\sqrt{\\frac{1}{3} [(l_a-l_b)^2 + (m_a-m_b)^2 + (u_a-u_b)^2]} \\tag{7}",
    step5_total: "d_i^* = \\sum_{j=1}^n d(\\tilde{v}_{i,j}, \\tilde{v}_j^*), \\quad d_i^- = \\sum_{j=1}^n d(\\tilde{v}_{i,j}, \\tilde{v}_j^-) \\tag{8}",
    step6: "CC_i = \\frac{d_i^-}{d_i^* + d_i^-}, \\quad 0 \\leq CC_i \\leq 1 \\tag{9}",
    ranking: "\\text{Rank } A_i \\downarrow \\text{ by } CC_i \\text{ (Descending)}"
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
          ol li {
            margin-bottom: 2rem !important;
            line-height: 1.8 !important;
          }
          @media (max-width: 640px) {
            .latex { font-size: 0.75rem !important; }
            h1 { font-size: 1.25rem !important; }
            h2 { font-size: 1rem !important; }
            p, li { font-size: 0.875rem !important; }
          }
        `
      }} />
      <div ref={containerRef} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
        <h1 className="text-2xl font-bold text-center mb-6">
          Fuzzy TOPSIS Method
        </h1>

        <p className="mb-4">
          Fuzzy TOPSIS extends the classical TOPSIS method to handle uncertainty in decision-making by using Triangular Fuzzy Numbers (TFNs) for criteria weights and alternative scores.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Fuzzy Decision Matrix</h2>
        <p className="mb-2">Construct the fuzzy decision matrix where each element is a TFN triplet (l, m, u):</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Fuzzy Normalization</h2>
        <p className="mb-2">For beneficial criteria (more is better):</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_benefit}\\]` }} />
        </div>
        <p className="mb-2">For non-beneficial criteria (less is better):</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_cost}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Weighted Fuzzy Normalized Matrix</h2>
        <p className="mb-2">Calculate the weighted normalized fuzzy values:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Fuzzy Ideal Solutions</h2>
        <p className="mb-2">Determine the Fuzzy Positive Ideal Solution (FPIS) and Fuzzy Negative Ideal Solution (FNIS):</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_fpis}\\]` }} />
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_fnis}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. Distance Calculation (Vertex Method)</h2>
        <p className="mb-2">Calculate the distance between two triangular fuzzy numbers:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_dist}\\]` }} />
        </div>
        <p className="mb-2">Calculate the total distance from FPIS and FNIS for each alternative:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_total}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. Closeness Coefficient</h2>
        <p className="mb-2">Calculate the relative closeness of each alternative to the ideal solution:</p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step6}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 7. Ranking</h2>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Source: Chen (2000). Extensions of the TOPSIS for group decision-making under fuzzy environment. Fuzzy Sets and Systems.
        </div>
      </div>
    </>
  )
}
