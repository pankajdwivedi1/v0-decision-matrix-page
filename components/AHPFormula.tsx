"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function AHPFormula({ compact = false }: { compact?: boolean }) {
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
          window.MathJax.options = {
            ...window.MathJax.options,
            menuOptions: { ...window.MathJax.options?.menuOptions },
          };
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
  });

  const latex = {
    title: "\\textbf{Here are the step-by-step formulas used in AHP:}",
    intro: "\\text{AHP derives ratio scales from paired comparisons of criteria or alternatives to determine global weights and rankings.}",
    step1: "A = [a_{i,j}]_{n\\times n} = \\begin{bmatrix} 1 & a_{1,2} & \\dots & a_{1,n} \\\\ 1/a_{1,2} & 1 & \\dots & a_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ 1/a_{1,n} & 1/a_{2,n} & \\dots & 1 \\end{bmatrix}, \\quad a_{i,j} > 0, \\; a_{j,i} = 1/a_{i,j}",
    step2_norm: "\\overline{a}_{i,j} = \\frac{a_{i,j}}{\\sum_{k=1}^{n} a_{k,j}}",
    step3_weight: "w_i = \\frac{1}{n} \\sum_{j=1}^{n} \\overline{a}_{i,j}, \\quad \\sum w_i = 1",
    step4_ci: "CI = \\frac{\\lambda_{max} - n}{n - 1}",
    step4_cr: "CR = \\frac{CI}{RI}",
    info: "\\text{If } CR < 0.1, \\text{ the pairwise comparison is considered consistent.}"
  }

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
      <div
        ref={containerRef}
        className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 font-['Times_New_Roman',_Times,_serif] ${compact ? "text-sm" : "text-base"}`}
        style={{
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        <div className="mb-4">
          <div>
            <div style={{ fontSize: compact ? 18 : 20, fontWeight: 700 }}>
              <span
                className="latex"
                dangerouslySetInnerHTML={{ __html: `\\(${latex.title}\\)` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div
            className="latex text-sm"
            style={{ fontSize: "0.875rem" }}
            dangerouslySetInnerHTML={{ __html: `\\(${latex.intro}\\)` }}
          />
        </div>

        <ol className="space-y-4 list-decimal pl-5">
          <li>
            <div className="mb-2 font-semibold">
              Step 1. Pairwise Comparison Matrix: Construct the comparison matrix A (where a_ij represents relative importance).
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step1}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Step 2. Normalization: Normalize the matrix by dividing each value by its column sum.
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_norm}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Step 3. Priority Vector (Weights): Calculate the average of each row in the normalized matrix to get weights.
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_weight}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Step 4. Consistency Check: Calculate Consistency Index (CI) and Consistency Ratio (CR).
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-2 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_ci}\\)` }}
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-2 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_cr}\\)` }}
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.info}\\)` }}
              />
            </div>
          </li>
        </ol>

        <div className="mt-6 text-xs text-gray-500">
          Source: Saaty, T. L. (1980). The Analytic Hierarchy Process.
        </div>
      </div>
    </>
  )
}
