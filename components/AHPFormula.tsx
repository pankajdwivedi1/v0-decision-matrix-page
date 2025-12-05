"use client";

import React, { useEffect, useRef } from "react";

type AHPFormulaProps = {
  compact?: boolean;
};

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function AHPFormula({ compact = false }: AHPFormulaProps) {
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
    title: "\\textbf{AHP (Analytic Hierarchy Process) — Steps}",
    intro:
      "\\text{AHP derives criterion weights from a pairwise comparison matrix by computing the principal eigenvector and checking consistency. Here we derive the matrix from provided priority scores } w_i \\text{ via } a_{ij} = w_i / w_j.",
    step1:
      "\\textbf{1. Pairwise Matrix:} \\quad A = [a_{ij}]_{n\\times n}, \\quad a_{ij} = w_i / w_j, \\quad a_{ii} = 1, \\quad a_{ji} = 1 / a_{ij}",
    step2_intro:
      "\\textbf{2. Column Normalization:} \\quad \\text{Normalize each column of } A \\text{ to obtain } N.",
    step2_formula:
      "n_{ij} = \\frac{a_{ij}}{\\sum_{k=1}^{n} a_{kj}}, \\quad i,j = 1,\\ldots,n",
    step3_intro:
      "\\textbf{3. Priority Vector (Eigenvector Approximation):} \\quad \\text{Average rows of } N \\text{ to get weights } v.",
    step3_formula:
      "v_i = \\frac{1}{n} \\sum_{j=1}^{n} n_{ij}, \\quad i = 1,\\ldots,n, \\quad \\sum_{i=1}^{n} v_i = 1",
    step4_intro:
      "\\textbf{4. Principal Eigenvalue:} \\quad \\text{Compute } \\lambda_{\\max} \\text{ from } A v.",
    step4_formula:
      "\\lambda_{\\max} = \\frac{1}{n} \\sum_{i=1}^{n} \\frac{(A v)_i}{v_i}",
    step5_intro:
      "\\textbf{5. Consistency Index (CI):} \\quad \\text{Measure consistency of pairwise comparisons.}",
    step5_formula:
      "CI = \\frac{\\lambda_{\\max} - n}{n - 1}",
    step6_intro:
      "\\textbf{6. Consistency Ratio (CR):} \\quad \\text{Compare CI to Saaty's Random Index (RI).}",
    step6_formula:
      "CR = \\frac{CI}{RI_n}, \\quad \\text{where } RI_n \\text{ is the random consistency index for size } n",
    interpretation:
      "\\textbf{Interpretation:} \\quad \\text{Weights } v_i \\text{ give criterion priorities. } CR < 0.1 \\text{ is typically acceptable; higher } CR \\text{ suggests revisiting comparisons.}",
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
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
        `,
        }}
      />
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
            <div className="mb-2 font-semibold">Pairwise Matrix: Derive a consistent pairwise matrix from provided priority scores.</div>
            <div className="bg-gray-50 p-3 rounded">
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step1}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">Normalization: Normalize each column of the pairwise matrix.</div>
            <div className="bg-gray-50 p-3 rounded">
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step2_formula}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">Priority Vector: Average normalized rows to get weights.</div>
            <div className="bg-gray-50 p-3 rounded">
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step3_formula}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">Principal Eigenvalue: Compute λ_max from A v.</div>
            <div className="bg-gray-50 p-3 rounded">
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step4_formula}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">Consistency Index (CI): Measure consistency of comparisons.</div>
            <div className="bg-gray-50 p-3 rounded">
              <div
                className="latex text-sm"
                style={{ fontSize: "0.875rem" }}
                dangerouslySetInnerHTML={{ __html: `\\(${latex.step5_formula}\\)` }}
              />
            </div>
          </li>

          <li>
            <div className="mb-2 font-semibold">Consistency Ratio (CR): Compare CI to RI.</div>
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
          Source: Analytic Hierarchy Process (Saaty, 1980). Here, a consistent pairwise matrix is
          derived from provided priority scores to compute eigenvector weights and consistency ratio.
        </div>
      </div>
    </>
  );
}


