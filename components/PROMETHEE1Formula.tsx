"use client";

import React, { useEffect, useRef } from "react";

type PROMETHEE1FormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function PROMETHEE1Formula({ compact = false }: PROMETHEE1FormulaProps) {
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
      setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
  });

  const latex = {
    title: "\\textbf{PROMETHEE I (Preference Ranking Organization Method for Enrichment Evaluations — Partial Preorder) — Steps}",
    intro: "\\text{PROMETHEE I provides a partial preorder (partial ranking) based on positive and negative flows. Unlike PROMETHEE II which uses net flow for complete ranking, PROMETHEE I uses outranking relations.}",
    step1_matrix:
      "X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix} \\tag{1}",
    step1_explanation:
      "\\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using vector normalization.}",
    step2_formula:
      "r_{i,j} = \\frac{x_{i,j}}{\\sqrt{\\sum_{i=1}^{m} x_{i,j}^2}}, \\quad i = 1, 2, \\ldots, m, \\quad j = 1, 2, \\ldots, n \\tag{2}",
    step3_intro:
      "\\textbf{3. Preference Degree:} \\quad \\text{For each pair of alternatives } (a, b) \\text{ and criterion } j, \\text{ calculate the preference degree using linear preference function.}",
    step3_formula:
      "P_j(a, b) = \\begin{cases} \\frac{r_{a,j} - r_{b,j}}{R_j} & \\text{if } r_{a,j} > r_{b,j} \\text{ (for beneficial)} \\text{ or } r_{b,j} > r_{a,j} \\text{ (for non-beneficial)} \\\\ 0 & \\text{otherwise} \\end{cases} \\tag{3}",
    step4_intro:
      "\\textbf{4. Aggregated Preference Degree:} \\quad \\text{Calculate the aggregated preference degree by weighting preference degrees across all criteria.}",
    step4_formula:
      "\\pi(a, b) = \\sum_{j=1}^{n} w_j \\times P_j(a, b), \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1 \\tag{4}",
    step5_intro:
      "\\textbf{5. Positive Flow:} \\quad \\text{Calculate the positive flow (outranking flow) for each alternative.}",
    step5_formula:
      "\\phi^+(a) = \\frac{1}{m-1} \\sum_{b \\neq a} \\pi(a, b), \\quad a = 1, 2, \\ldots, m \\tag{5}",
    step6_intro:
      "\\textbf{6. Negative Flow:} \\quad \\text{Calculate the negative flow (outranked flow) for each alternative.}",
    step6_formula:
      "\\phi^-(a) = \\frac{1}{m-1} \\sum_{b \\neq a} \\pi(b, a), \\quad a = 1, 2, \\ldots, m \\tag{6}",
    step7_intro:
      "\\textbf{7. Outranking Relations:} \\quad \\text{Build outranking relations based on positive and negative flows.}",
    step7_formula:
      "a \\text{ outranks } b \\text{ if: } \\phi^+(a) \\geq \\phi^+(b) \\text{ AND } \\phi^-(a) \\leq \\phi^-(b) \\tag{7}",
    step8_intro:
      "\\textbf{8. Score Calculation:} \\quad \\text{Calculate score based on outranking relations.}",
    step8_formula:
      "\\text{Score}(a) = |\\{b: a \\text{ outranks } b\\}| - |\\{b: b \\text{ outranks } a\\}| \\tag{8}",
    ranking:
      "\\textbf{9. Ranking:} \\quad \\text{Alternatives are ranked in descending order of score. Higher score indicates a better alternative.}",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{PROMETHEE I provides a partial preorder where alternatives may be incomparable. Higher score indicates an alternative that outranks more alternatives and is outranked by fewer alternatives.}",
  };

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
      <div
        ref={containerRef}
        className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 font-['Times_New_Roman',_Times,_serif] ${compact ? "text-sm" : "text-base"
          }`}
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
                dangerouslySetInnerHTML={{ __html: `\\[${latex.title}\\]` }}
              />
            </div>
          </div>
        </div>

        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 leading-relaxed" style={{ fontSize: "0.875rem" }}>
            PROMETHEE I provides a partial preorder (partial ranking) based on positive and negative flows. Unlike PROMETHEE II which uses net flow for complete ranking, PROMETHEE I uses outranking relations.
          </p>
        </div>

        <ol className="space-y-4 list-decimal pl-5">
          <li>
            <div className="mb-2 font-semibold">
              Decision Matrix Construction: Construct the decision matrix with alternatives as rows and criteria as columns.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_matrix}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_explanation}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Normalization: Normalize the decision matrix using vector normalization.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Preference Degree: Calculate preference degrees between pairs of alternatives for each criterion.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Aggregated Preference Degree: Calculate aggregated preference degrees by weighting across all criteria.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Positive Flow: Calculate the positive flow (outranking flow) for each alternative.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Negative Flow: Calculate the negative flow (outranked flow) for each alternative.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Outranking Relations: Build outranking relations based on positive and negative flows.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step7_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Score Calculation: Calculate score based on outranking relations.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step8_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Ranking: Rank alternatives based on their scores.
            </div>
            <div className="bg-gray-50 rounded-lg mb-4">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }}
              />
            </div>
          </li>
        </ol>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-blue-900 mb-2">Interpretation</div>
          <p className="text-sm text-gray-700 leading-relaxed" style={{ fontSize: "0.875rem" }}>
            PROMETHEE I provides a partial preorder where alternatives may be incomparable. Higher score indicates an alternative that outranks more alternatives and is outranked by fewer alternatives.
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Source: PROMETHEE I method formulation (Brans & Vincke, 1985). The method provides a partial
          preorder based on positive and negative flows, allowing for incomparabilities between alternatives.
        </div>
      </div>
    </>
  );
}



