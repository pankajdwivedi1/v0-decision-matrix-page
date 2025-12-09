"use client";

import React, { useEffect, useRef } from "react";

type ELECTRE2FormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function ELECTRE2Formula({ compact = false }: ELECTRE2FormulaProps) {
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
    title: "\\textbf{ELECTRE II (ÉLimination Et Choix Traduisant la REalité — Complete Ranking) — Steps}",
    intro: "\\text{ELECTRE II provides a complete ranking using strong and weak outranking relations. Unlike ELECTRE I which may have incomparabilities, ELECTRE II uses two sets of thresholds to establish a complete ranking.}",
    step1:
      "\\textbf{1. Decision Matrix:} \\quad X = [x_{i,j}]_{m\\times n} = \\begin{bmatrix} x_{1,1} & x_{1,2} & \\dots & x_{1,n} \\\\ x_{2,1} & x_{2,2} & \\dots & x_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m,1} & x_{m,2} & \\dots & x_{m,n} \\end{bmatrix}, \\quad \\text{where } i=1,2,\\dots,m \\text{ (alternatives)}, \\quad j=1,2,\\dots,n \\text{ (criteria)}",
    step2_intro:
      "\\textbf{2. Normalization:} \\quad \\text{For each criterion } j, \\text{ normalize the decision matrix using vector normalization.}",
    step2_formula:
      "r_{i,j} = \\frac{x_{i,j}}{\\sqrt{\\sum_{i=1}^{m} x_{i,j}^2}}, \\quad i = 1, 2, \\ldots, m, \\quad j = 1, 2, \\ldots, n",
    step3_intro:
      "\\textbf{3. Concordance Index:} \\quad \\text{For each pair of alternatives } (a, b), \\text{ calculate the concordance index.}",
    step3_formula:
      "C(a, b) = \\sum_{j \\in J^+} w_j, \\quad \\text{where } J^+ = \\{j: a_j \\geq b_j \\text{ (beneficial)} \\text{ or } a_j \\leq b_j \\text{ (non-beneficial)}\\}",
    step4_intro:
      "\\textbf{4. Discordance Index:} \\quad \\text{For each pair of alternatives } (a, b), \\text{ calculate the discordance index.}",
    step4_formula:
      "D(a, b) = \\max_j \\frac{|r_{b,j} - r_{a,j}|}{R_j}, \\quad \\text{where } R_j = \\max_i r_{i,j} - \\min_i r_{i,j}",
    step5_intro:
      "\\textbf{5. Strong Outranking Relation:} \\quad \\text{Build strong outranking relation using strict thresholds.}",
    step5_formula:
      "a \\text{ strongly outranks } b \\text{ if: } C(a, b) \\geq c_s \\text{ AND } D(a, b) \\leq d_s",
    step5_thresholds:
      "\\text{where } c_s = 0.6 \\text{ (strong concordance)}, \\quad d_s = 0.4 \\text{ (strong discordance)}",
    step6_intro:
      "\\textbf{6. Weak Outranking Relation:} \\quad \\text{Build weak outranking relation using relaxed thresholds.}",
    step6_formula:
      "a \\text{ weakly outranks } b \\text{ if: } C(a, b) \\geq c_w \\text{ AND } D(a, b) \\leq d_w",
    step6_thresholds:
      "\\text{where } c_w = 0.5 \\text{ (weak concordance)}, \\quad d_w = 0.5 \\text{ (weak discordance)}, \\quad \\text{and } c_s > c_w, \\quad d_s < d_w",
    step7_intro:
      "\\textbf{7. Score Calculation:} \\quad \\text{Calculate score based on strong outranking relations for complete ranking.}",
    step7_formula:
      "\\text{Score}(a) = |\\{b: a \\text{ strongly outranks } b\\}| - |\\{b: b \\text{ strongly outranks } a\\}|",
    ranking:
      "\\textbf{8. Ranking:} \\quad \\text{Alternatives are ranked in descending order of score. Higher score indicates a better alternative.}",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{ELECTRE II uses two sets of thresholds (strong and weak) to build outranking relations, ensuring a complete ranking. Higher score indicates an alternative that strongly outranks more alternatives and is strongly outranked by fewer alternatives.}",
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
        className={`prose max-w-none bg-white border border-gray-200 rounded-lg p-6 font-['Times_New_Roman',_Times,_serif] ${compact ? "text-sm" : "text-base"
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
          <div
            className="latex text-sm"
            style={{ fontSize: "0.875rem" }}
            dangerouslySetInnerHTML={{ __html: `\\[${latex.intro}\\]` }}
          />
        </div>

        <ol className="space-y-4 list-decimal pl-5">
          <li>
            <div className="mb-2 font-semibold">
              Decision Matrix Construction: Construct the decision matrix with alternatives as rows and criteria as columns.
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Normalization: Normalize the decision matrix using vector normalization.
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Concordance Index: Calculate the concordance index for each pair of alternatives.
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Discordance Index: Calculate the discordance index for each pair of alternatives.
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Strong Outranking Relation: Build strong outranking relation using strict thresholds.
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_formula}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_thresholds}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Weak Outranking Relation: Build weak outranking relation using relaxed thresholds.
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center mb-2"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_formula}\\]` }}
              />
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_thresholds}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Score Calculation: Calculate score based on strong outranking relations for complete ranking.
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div
                className="latex text-sm text-center"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\[${latex.step7_formula}\\]` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">
              Ranking: Rank alternatives based on their scores.
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
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
          <div
            className="latex text-sm"
            style={{ fontSize: "0.875rem" }}
            dangerouslySetInnerHTML={{ __html: `\\[${latex.interpretation}\\]` }}
          />
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Source: ELECTRE II method formulation (Roy & Bertier, 1973). The method uses two sets of
          thresholds (strong and weak) to build outranking relations, ensuring a complete ranking
          without incomparabilities.
        </div>
      </div>
    </>
  );
}


