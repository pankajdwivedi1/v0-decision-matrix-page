"use client";

import React, { useEffect, useRef } from "react";

type PROMETHEEFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function PROMETHEEFormula({ compact = false }: PROMETHEEFormulaProps) {
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
    title: "\\textbf{PROMETHEE (Preference Ranking Organization Method for Enrichment Evaluations) — Steps}",
    intro: "\\text{PROMETHEE evaluates alternatives by calculating preference degrees between pairs of alternatives and aggregating them into positive and negative flows, then computing net flow for complete ranking.}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using vector normalization.}",
    step2_formula:
      "r_{i,j} = \\frac{x_{i,j}}{\\sqrt{\\sum_{i=1}^{m} x_{i,j}^2}}, \\quad i = 1, 2, \\ldots, m, \\quad j = 1, 2, \\ldots, n",
    step3_intro:
      "\\textbf{3. Preference Degree:} \\quad \\text{For each pair of alternatives } (a, b) \\text{ and criterion } j, \\text{ calculate the preference degree using linear preference function.}",
    step3_formula:
      "P_j(a, b) = \\begin{cases} \\frac{r_{a,j} - r_{b,j}}{R_j} & \\text{if } r_{a,j} > r_{b,j} \\text{ (for beneficial)} \\text{ or } r_{b,j} > r_{a,j} \\text{ (for non-beneficial)} \\\\ 0 & \\text{otherwise} \\end{cases}",
    step3_range:
      "\\text{where } R_j = \\max_i r_{i,j} - \\min_i r_{i,j} \\text{ is the range of criterion } j",
    step4_intro:
      "\\textbf{4. Aggregated Preference Degree:} \\quad \\text{Calculate the aggregated preference degree by weighting preference degrees across all criteria.}",
    step4_formula:
      "\\pi(a, b) = \\sum_{j=1}^{n} w_j \\times P_j(a, b), \\quad \\text{where } \\sum_{j=1}^{n} w_j = 1",
    step5_intro:
      "\\textbf{5. Positive Flow:} \\quad \\text{Calculate the positive flow (outranking flow) for each alternative.}",
    step5_formula:
      "\\phi^+(a) = \\frac{1}{m-1} \\sum_{b \\neq a} \\pi(a, b), \\quad a = 1, 2, \\ldots, m",
    step6_intro:
      "\\textbf{6. Negative Flow:} \\quad \\text{Calculate the negative flow (outranked flow) for each alternative.}",
    step6_formula:
      "\\phi^-(a) = \\frac{1}{m-1} \\sum_{b \\neq a} \\pi(b, a), \\quad a = 1, 2, \\ldots, m",
    step7_intro:
      "\\textbf{7. Net Flow:} \\quad \\text{Calculate the net flow for each alternative.}",
    step7_formula:
      "\\phi(a) = \\phi^+(a) - \\phi^-(a), \\quad a = 1, 2, \\ldots, m",
    ranking:
      "\\textbf{8. Ranking:} \\quad \\text{Alternatives are ranked in descending order of } \\phi(a). \\text{ (Higher } \\phi(a) \\Rightarrow \\text{better alternative)}",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{PROMETHEE ranks alternatives based on net flow, which measures how much an alternative outranks others relative to how much it is outranked. Higher net flow indicates a better alternative.}",
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
            Decision Matrix Construction: Construct the decision matrix with alternatives as rows and criteria as columns.
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
            Normalization: Normalize the decision matrix using vector normalization to make criteria comparable.
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
            Preference Degree: For each pair of alternatives and criterion, calculate the preference degree using linear preference function.
          </div>
          <div className="bg-gray-50 p-3 rounded space-y-2">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_formula}\\)` }}
            />
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_range}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Aggregated Preference Degree: Calculate the aggregated preference degree by weighting preference degrees across all criteria.
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
            Positive Flow: Calculate the positive flow (outranking flow) for each alternative.
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
            Negative Flow: Calculate the negative flow (outranked flow) for each alternative.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step6_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Net Flow: Calculate the net flow for each alternative.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step7_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Ranking: Rank alternatives based on their net flow values.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.ranking}\\)` }}
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
        Source: PROMETHEE method formulation (Brans & Vincke, 1985). The method evaluates alternatives
        by calculating preference degrees between pairs of alternatives and aggregating them into
        positive and negative flows, then computing net flow for complete ranking.
      </div>
      </div>
    </>
  );
}

