"use client";

import React, { useEffect, useRef } from "react";

type CriticFormulaProps = {
  compact?: boolean;
};

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

/**
 * CRITICFormula
 * - Loads MathJax (once)
 * - Renders the step-by-step CRITIC method formulas as LaTeX
 *
 * Usage:
 *   import CRITICFormula from "@/components/CRITICFormula";
 *   <CRITICFormula />
 */
export default function CRITICFormula({ compact = false }: CriticFormulaProps) {
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
    title: "\\textbf{CRITIC Method for Weight Calculation — Steps}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{ij}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using min-max normalization.}",
    step2_beneficial:
      "\\text{For beneficial criteria:} \\quad r_{ij} = \\frac{x_{ij} - \\min_i(x_{ij})}{\\max_i(x_{ij}) - \\min_i(x_{ij})}",
    step2_nonbeneficial:
      "\\text{For non-beneficial criteria:} \\quad r_{ij} = \\frac{\\max_i(x_{ij}) - x_{ij}}{\\max_i(x_{ij}) - \\min_i(x_{ij})}",
    step3_intro:
      "\\textbf{3. Standard Deviation:} \\quad \\text{Calculate the standard deviation for each criterion to measure contrast intensity.}",
    step3_mean:
      "\\bar{r}_j = \\frac{1}{m} \\sum_{i=1}^{m} r_{ij}",
    step3_std:
      "\\sigma_j = \\sqrt{\\frac{1}{m} \\sum_{i=1}^{m} (r_{ij} - \\bar{r}_j)^2}, \\quad j = 1, 2, \\ldots, n",
    step4_intro:
      "\\textbf{4. Correlation Matrix:} \\quad \\text{Calculate the correlation coefficient between each pair of criteria to measure conflict.}",
    step4_formula:
      "r_{jk} = \\frac{\\sum_{i=1}^{m} (r_{ij} - \\bar{r}_j)(r_{ik} - \\bar{r}_k)}{\\sqrt{\\sum_{i=1}^{m} (r_{ij} - \\bar{r}_j)^2 \\sum_{i=1}^{m} (r_{ik} - \\bar{r}_k)^2}}, \\quad j, k = 1, 2, \\ldots, n",
    step5_intro:
      "\\textbf{5. Amount of Information:} \\quad \\text{Calculate the amount of information for each criterion, combining contrast intensity and conflict.}",
    step5_formula:
      "C_j = \\sigma_j \\sum_{k=1}^{n} (1 - r_{jk}), \\quad j = 1, 2, \\ldots, n",
    step6_intro:
      "\\textbf{6. Weight Calculation:} \\quad \\text{Calculate the objective weights for each criterion based on the amount of information.}",
    step6_formula:
      "w_j = \\frac{C_j}{\\sum_{j=1}^{n} C_j}, \\quad j = 1, 2, \\ldots, n, \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{Higher } C_j \\text{ means more information content (higher contrast and lower correlation with other criteria), resulting in higher weight } w_j. \\text{ Lower } C_j \\text{ means less information, resulting in lower weight.}",
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
            Normalization: Normalize the decision matrix using min-max normalization for each criterion.
          </div>
          <div className="bg-gray-50 p-3 rounded space-y-2">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_beneficial}\\)` }}
            />
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_nonbeneficial}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Standard Deviation: Calculate the standard deviation for each criterion to measure contrast intensity.
          </div>
          <div className="bg-gray-50 p-3 rounded space-y-2">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_mean}\\)` }}
            />
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_std}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Correlation Matrix: Calculate the correlation coefficient between each pair of criteria to measure conflict.
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
            Amount of Information: Calculate the amount of information for each criterion, combining contrast intensity and conflict.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Weight Calculation: Calculate the objective weights for each criterion based on the amount of information.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step6_formula}\\)` }}
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
        Source: CRITIC (Criteria Importance Through Intercriteria Correlation) method for objective weight determination in multi-criteria decision making.
        The method uses both contrast intensity (standard deviation) and conflict (correlation) between criteria to determine weights.
        Higher information content (higher contrast and lower correlation) results in higher weights.
      </div>
      </div>
    </>
  );
}

