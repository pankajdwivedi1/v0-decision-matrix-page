"use client";

import React, { useEffect, useRef } from "react";

/**
 * SWIFormula.tsx
 * — Displays the full theoretical formulation of the SWI (Sum Weighted Information) MCDM method
 * — Based on Dr. Pankaj Prasad Dwivedi et al., Renewable & Sustainable Energy Reviews (2025)
 */

type SWIFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function SWIFormula({ compact = false }: SWIFormulaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load MathJax
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = document.querySelector('script[data-mathjax="loaded"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      script.setAttribute("data-mathjax", "loaded");
      document.head.appendChild(script);
      script.onload = () => setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
    } else {
      setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
  });

  // --- LaTeX Content ---
  const latex = {
    title: "\\textbf{Sum Weighted Information (SWI) Method — Theoretical Formulation}",

    step1: `
    \\textbf{I. Decision Matrix:}\\\\
    \\text{The decision-maker constructs the information decision matrix (IDM):} \\\\
    IDM_{i,j} = [a_{i,j}]_{m \\times n}, \\quad
    \\text{where } i = 1,2,\\dots,m \\text{ and } j = 1,2,\\dots,n. \\\\
    X = 
    \\begin{bmatrix}
    a_{1,1} & a_{1,2} & \\dots & a_{1,n} \\\\
    a_{2,1} & a_{2,2} & \\dots & a_{2,n} \\\\
    \\vdots & \\vdots & \\ddots & \\vdots \\\\
    a_{m,1} & a_{m,2} & \\dots & a_{m,n}
    \\end{bmatrix}
    \\tag{1}
    `,

    step2: `
    \\textbf{II. Normalization:}\\\\
    \\text{The criteria are normalized to convert raw data into a probability distribution.}\\\\
    \\text{For desirable (benefit) criteria:}\\\\
    IDM_{i,j} = \\dfrac{a_{i,j}}{\\sum_{i=1}^{m} a_{i,j}} \\tag{2}
    \\\\[6pt]
    \\text{For undesirable (cost) criteria:}\\\\
    IDM_{i,j} = \\dfrac{1/a_{i,j}}{\\sum_{i=1}^{m} (1/a_{i,j})} \\tag{3}
    \\\\[6pt]
    \\text{Here, } IDM_{i,j} \\text{ represents the probability distribution satisfying } 
    \\sum_{i=1}^{m} IDM_{i,j} = 1.
    `,

    step3: `
    \\textbf{III. Weighted Information:}\\\\
    \\text{The information amount for each alternative is computed using the normalized probabilities and criterion weights.}\\\\
    \\text{For the } i^{th} \\text{ alternative:}\\\\
    IDM_{i}^{'} = 
    \\left( \\log_{2}\\frac{1}{IDM_{i,1}} \\right)^{w_1} + 
    \\left( \\log_{2}\\frac{1}{IDM_{i,2}} \\right)^{w_2} + \\dots +
    \\left( \\log_{2}\\frac{1}{IDM_{i,n}} \\right)^{w_n}
    \\tag{4}
    `,

    step4: `
    \\textbf{IV. Information Score:}\\\\
    \\text{The SWI information score for the } i^{th} \\text{ alternative is given by:}\\\\
    SWI_i = \\sum_{j=1}^{n} \\left[ \\log_{2}\\left( \\dfrac{1}{IDM_{i,j}} \\right) \\right]^{w_j}
    \\tag{5}
    `,

    step5: `
    \\textbf{V. Ranking:}\\\\
    \\text{Alternatives are ranked in ascending order of } SWI_i.\\\\
    \\text{The alternative with the lowest SWI value is considered the best.}
    `,
  };

  // --- JSX Render ---
  return (
    <div
      ref={containerRef}
      className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${
        compact ? "text-sm" : "text-base"
      }`}
    >
      <h2 className="text-xl font-bold mb-4 text-center">
        <span
          className="latex"
          dangerouslySetInnerHTML={{ __html: `\\(${latex.title}\\)` }}
        />
      </h2>

      <ol className="space-y-6 list-decimal pl-5">
        {[latex.step1, latex.step2, latex.step3, latex.step4, latex.step5].map((step, i) => (
          <li key={i}>
            <div
              className="latex bg-gray-50 p-4 rounded"
              dangerouslySetInnerHTML={{ __html: `\\(${step}\\)` }}
            />
          </li>
        ))}
      </ol>

      <div className="mt-5 text-xs text-gray-600 text-center">
        Source: Dr Pankaj Prasad Dwivedi et al., “Sum Weighted Information (SWI) MCDM Method,”
        <br />
        <em>Renewable & Sustainable Energy Reviews</em>, 2025.
      </div>
    </div>
  );
}
