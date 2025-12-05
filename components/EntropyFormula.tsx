"use client";

import React, { useEffect, useRef } from "react";

type EntropyFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * EntropyFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step Entropy method formulas as LaTeX
 *
 * Usage:
 *   import EntropyFormula from "@/components/EntropyFormula";
 *   <EntropyFormula />
 */
export default function EntropyFormula({ compact = false }: EntropyFormulaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load MathJax if not present
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
        // Configure MathJax for smaller fonts and wrapping
        if (window.MathJax) {
          window.MathJax.options = {
            ...window.MathJax.options,
            menuOptions: {
              ...window.MathJax.options?.menuOptions,
            },
          };
          window.MathJax.startup = {
            ...window.MathJax.startup,
            typeset: false,
          };
        }
        setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
      };
    } else {
      // typeset if already loaded
      setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
    }
  }, []);

  // Re-typeset after every render (safe; MathJax caches)
  useEffect(() => {
    setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
  });

  // LaTeX strings for each step
  const latex = {
    title: "\\textbf{Entropy Method for Weight Calculation — Steps}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{ij}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix to obtain probability values.}",
    step2_formula:
      "p_{ij} = \\frac{x_{ij}}{\\sum_{i=1}^{m} x_{ij}}, \\quad \\text{for all criteria (both beneficial and non-beneficial)}",
    step3_intro:
      "\\textbf{3. Entropy Calculation:} \\quad \\text{Calculate the entropy value for each criterion to measure the information content.}",
    step3_formula:
      "E_j = -k \\sum_{i=1}^{m} p_{i,j} \\log_2 p_{i,j}, \\quad \\text{where } k = \\frac{1}{\\log_2 m} \\text{ and } j = 1, 2, \\ldots, n",
    step3_explanation:
      "\\text{where } k = \\frac{1}{\\log_2 m} \\text{ is a constant ensuring that } E_j \\text{ lies in the range } [0,1]",
    step4_intro:
      "\\textbf{4. Diversity Degree:} \\quad \\text{Calculate the diversity degree for each criterion, which represents the amount of information.}",
    step4_formula:
      "d_j = 1 - E_j, \\quad j = 1, 2, \\ldots, n",
    step5_intro:
      "\\textbf{5. Weight Calculation:} \\quad \\text{Calculate the objective weights for each criterion based on the diversity degree.}",
    step5_formula:
      "w_j = \\frac{d_j}{\\sum_{j=1}^{n} d_j}, \\quad j = 1, 2, \\ldots, n, \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{Higher entropy } E_j \\text{ means more uncertainty (less information), resulting in lower weight } w_j. \\text{ Lower entropy means more information content, resulting in higher weight.}",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .latex {
            font-size: 0.875rem !important;
            line-height: 1.5;
          }
          .latex mjx-container {
            font-size: 0.875rem !important;
            max-width: 100% !important;
            overflow-x: visible !important;
            display: inline-block !important;
          }
          .latex mjx-math {
            font-size: 0.875rem !important;
          }
        `
      }} />
      <div
        ref={containerRef}
        className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-6 ${
          compact ? "text-sm" : "text-base"
        }`}
        style={{
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
      <div className="mb-4">
        <div>
          {/* Title */}
          <div style={{ fontSize: compact ? 18 : 20, fontWeight: 700 }}>
            <span
              className="latex"
              dangerouslySetInnerHTML={{ __html: `\\(${latex.title}\\)` }}
            />
          </div>
        </div>
      </div>

      <ol className="space-y-4 list-decimal pl-5">
        <li>
          <div className="mb-2 font-semibold">
            Decision Matrix Construction: Construct the decision matrix with alternatives as rows and
            criteria as columns.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step1}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Normalization: Normalize the decision matrix to obtain probability values for each criterion.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Entropy Calculation: Calculate the entropy value for each criterion to measure the information content.
          </div>
          <div className="bg-gray-50 p-3 rounded space-y-2">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_formula}\\)` }}
            />
            <div
              className="latex text-xs text-gray-600"
              style={{ fontSize: "0.75rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_explanation}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Diversity Degree: Calculate the diversity degree for each criterion, which represents the amount of information.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Weight Calculation: Calculate the objective weights for each criterion based on the diversity degree.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_formula}\\)` }}
            />
          </div>
        </li>
      </ol>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-blue-900 mb-2">Interpretation</div>
        <div
          className="latex text-sm"
          style={{ fontSize: "0.875rem" }}
          dangerouslySetInnerHTML={{ __html: `\\(${latex.interpretation}\\)` }}
        />
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Source: Entropy method for objective weight determination in multi-criteria decision making.
        The method uses information theory to determine weights based on the amount of information
        contained in each criterion. Higher entropy indicates more uncertainty and less information,
        resulting in lower weights.
      </div>
      </div>
    </>
  );
}

