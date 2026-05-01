"use client";

import React, { useEffect, useRef } from "react";

type FUCOMFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

/**
 * FUCOMFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step FUCOM formulas as LaTeX
 * - Enhanced with professional styling and full mathematical model
 */
export default function FUCOMFormula({ compact = false }: FUCOMFormulaProps) {
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

  const latex = {
    step1: "C_{j(1)} > C_{j(2)} > \\dots > C_{j(n)} \\tag{1}",
    step2: "\\phi_{k/(k+1)} = \\frac{w_{j(k)}}{w_{j(k+1)}} \\tag{2}",
    step3_obj: "\\min \\chi",
    step3_const1: "|\\frac{w_{j(k)}}{w_{j(k+1)}} - \\phi_{k/(k+1)}| \\leq \\chi \\tag{3}",
    step3_const2: "|\\frac{w_{j(k)}}{w_{j(k+2)}} - \\phi_{k/(k+1)} \\times \\phi_{(k+1)/(k+2)}| \\leq \\chi \\tag{4}",
    step3_sum: "\\sum_{j=1}^{n} w_j = 1, \\quad w_j \\geq 0 \\tag{5}",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .latex { font-size: 0.875rem !important; line-height: 2 !important; margin: 1rem 0; display: block; }
          .latex mjx-container { font-size: 0.875rem !important; max-width: 100% !important; overflow-x: auto; overflow-y: hidden; margin: 0.75rem 0 !important; padding: 0.5rem 0 !important; text-align: center !important; }
          .latex mjx-math { font-size: 0.875rem !important; outline: none !important; }
          
          /* Mobile adjustments */
          @media (max-width: 640px) {
            .latex { font-size: 0.75rem !important; }
            h1 { font-size: 1.25rem !important; }
            h2 { font-size: 1rem !important; }
          }
        `
      }} />
      <div
        ref={containerRef}
        className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-4 md:p-8 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed ${compact ? "text-sm" : "text-base"}`}
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          FUCOM (Full Consistency Method)
        </h1>

        <p className="mb-4">
          The Full Consistency Method (FUCOM) is a subjective weighting method used to determine the weights of criteria in multi-criteria decision-making. It is based on the principles of pairwise comparison and mathematical optimization to ensure consistency.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 italic text-sm text-gray-700">
          FUCOM requires only \(n-1\) pairwise comparisons, significantly reducing the cognitive effort compared to other subjective methods while maintaining high stability.
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Ranking the Criteria</h2>
        <p className="mb-2">
          The criteria are ranked according to their significance, from the most important to the least important:
        </p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Comparative Priority</h2>
        <p className="mb-2">
          {"The comparative priority \\(\\phi_{k/(k+1)}\\) is determined between adjacent ranked criteria. It represents the ratio of the weight of the criterion \\(C_{j(k)}\\) to the weight of the criterion \\(C_{j(k+1)}\\):"}
        </p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2}\\]` }} />
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Mathematical Model</h2>
        <p className="mb-4">
          To calculate the final weights \(w_j\), a mathematical model is formulated to minimize the deviation from full consistency (\(\chi\)). The model must satisfy two main consistency conditions:
        </p>

        <div className="bg-gray-50 rounded-lg mb-6 p-4">
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_obj}\\]` }} />
          <p className="text-center font-medium my-2 text-gray-600 italic">subject to:</p>
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_const1}\\]` }} />
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_const2}\\]` }} />
          <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_sum}\\]` }} />
        </div>

        <p className="mb-4">
          By solving this model, we obtain the optimal weights \(w_1, w_2, \dots, w_n\) and the degree of consistency (\(\chi\)). A value of \(\chi\) closer to zero indicates higher consistency.
        </p>

        <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-500">
          Source: Pamučar, D., Stević, Ž., & Sremac, S. (2018). A New Model for Determining Weight Coefficients of Criteria in MCDM Models: Full Consistency Method (FUCOM). Symmetry.
        </div>
      </div>
    </>
  );
}
