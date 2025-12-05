"use client";

import React, { useEffect, useRef } from "react";

type ELECTRE1FormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function ELECTRE1Formula({ compact = false }: ELECTRE1FormulaProps) {
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
    title: "\\textbf{ELECTRE I (ÉLimination Et Choix Traduisant la REalité — Basic Outranking) — Steps}",
    intro: "\\text{ELECTRE I is the basic version that uses single thresholds for concordance and discordance to build outranking relations. It may produce partial rankings with incomparabilities.}",
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
      "\\textbf{5. Outranking Relation:} \\quad \\text{Build outranking relation based on single set of thresholds.}",
    step5_formula:
      "a \\text{ outranks } b \\text{ if: } C(a, b) \\geq c^* \\text{ AND } D(a, b) \\leq d^*",
    step5_thresholds:
      "\\text{where } c^* = 0.5 \\text{ (concordance threshold)}, \\quad d^* = 0.5 \\text{ (discordance threshold)}",
    step6_intro:
      "\\textbf{6. Score Calculation:} \\quad \\text{Calculate score based on outranking relations.}",
    step6_formula:
      "\\text{Score}(a) = |\\{b: a \\text{ outranks } b\\}| - |\\{b: b \\text{ outranks } a\\}|",
    ranking:
      "\\textbf{7. Ranking:} \\quad \\text{Alternatives are ranked in descending order of score. Higher score indicates a better alternative.}",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{ELECTRE I uses single thresholds for concordance and discordance, which may result in partial rankings with incomparabilities. Higher score indicates an alternative that outranks more alternatives and is outranked by fewer alternatives.}",
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
            Normalization: Normalize the decision matrix using vector normalization.
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
            Concordance Index: Calculate the concordance index for each pair of alternatives.
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_formula}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Discordance Index: Calculate the discordance index for each pair of alternatives.
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
            Outranking Relation: Build outranking relation based on single set of thresholds.
          </div>
          <div className="bg-gray-50 p-3 rounded space-y-2">
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_formula}\\)` }}
            />
            <div
              className="latex text-sm"
              style={{ fontSize: "0.875rem" }}
              dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_thresholds}\\)` }}
            />
          </div>
        </li>

        <li>
          <div className="mb-2 font-semibold">
            Score Calculation: Calculate score based on outranking relations.
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
            Ranking: Rank alternatives based on their scores.
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
        Source: ELECTRE I method formulation (Roy, 1968). The method uses single thresholds for
        concordance and discordance to build outranking relations, which may result in partial
        rankings with incomparabilities between alternatives.
      </div>
      </div>
    </>
  );
}

