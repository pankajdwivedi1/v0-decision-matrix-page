"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function AHPFormula({
  criteria: externalCriteria,
  onWeightsCalculated,
  initialMatrix,
  onMatrixChange
}: {
  criteria?: { id: string; name: string }[];
  onWeightsCalculated?: (weights: Record<string, number>) => void;
  initialMatrix?: number[][];
  onMatrixChange?: (matrix: number[][]) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // MathJax loader
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
  };

  // Interactive Calculator State
  const n = externalCriteria ? externalCriteria.length : 3;
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [weights, setWeights] = useState<number[]>([]);
  const [consistency, setConsistency] = useState<{
    lambdaMax?: number;
    CI?: number;
    CR?: number;
  }>({});

  // Initialize matrix
  useEffect(() => {
    if (initialMatrix && initialMatrix.length === n) {
      setMatrix(initialMatrix);
    } else {
      const m = Array(n)
        .fill(0)
        .map(() => Array(n).fill(1));
      setMatrix(m);
    }
  }, [n, initialMatrix]);

  // Sync with external matrix changes
  useEffect(() => {
    if (initialMatrix && initialMatrix.length === n) {
      setMatrix(initialMatrix);
    }
  }, [initialMatrix, n]);

  const updateCell = (i: number, j: number, value: string) => {
    const v = parseFloat(value) || 1;
    const updated = matrix.map((row) => [...row]);
    updated[i][j] = v;
    updated[j][i] = 1 / v;
    setMatrix(updated);

    if (onMatrixChange) {
      onMatrixChange(updated);
    }
  };

  // Auto-calc weights and consistency
  useEffect(() => {
    if (matrix.length === 0) return;

    // Column sums
    const colSum = Array(n).fill(0);
    matrix.forEach((row) => row.forEach((val, j) => (colSum[j] += val)));

    // Normalize
    const norm = matrix.map((row) => row.map((val, j) => val / colSum[j]));

    // Weights
    const w = norm.map((row) => row.reduce((a, b) => a + b, 0) / n);
    setWeights(w);

    // Weighted sum vector
    const AW = matrix.map((row) => row.reduce((sum, val, j) => sum + val * w[j], 0));

    // Consistency vector
    const cv = AW.map((val, i) => val / w[i]);

    const lambdaMax = cv.reduce((a, b) => a + b, 0) / n;
    const CI = (lambdaMax - n) / (n - 1);

    const RI_values: Record<number, number> = {
      1: 0.0,
      2: 0.0,
      3: 0.58,
      4: 0.90,
      5: 1.12,
      6: 1.24,
      7: 1.32,
      8: 1.41,
      9: 1.45,
      10: 1.49,
    };

    const RI = RI_values[n] || 1.49;
    const CR = CI / RI;

    setConsistency({ lambdaMax, CI, CR });
  }, [matrix, n]);

  const handleApplyWeights = () => {
    if (onWeightsCalculated && externalCriteria && weights.length > 0) {
      const weightMap: Record<string, number> = {};
      weights.forEach((weight, i) => {
        if (externalCriteria[i]) {
          weightMap[externalCriteria[i].id] = weight;
        }
      });
      onWeightsCalculated(weightMap);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-2 md:p-6">
      {!externalCriteria && (
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
              ol li {
                margin-bottom: 2rem !important;
                line-height: 1.8 !important;
              }
              .bg-gray-50 {
                padding: 1.5rem !important;
                margin: 1rem 0 !important;
                display: block !important;
                width: 100% !important;
                overflow-x: auto;
              }
            `
          }} />

          <div
            ref={containerRef}
            className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 font-['Times_New_Roman',_Times,_serif]"
          >
            <div className="mb-4">
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
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
                dangerouslySetInnerHTML={{ __html: `\\[${latex.intro}\\]` }}
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
                    dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }}
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
                    dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_norm}\\]` }}
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
                    dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_weight}\\]` }}
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
                    dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_ci}\\]` }}
                  />
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-2 overflow-x-auto">
                  <div
                    className="latex text-sm text-center"
                    dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_cr}\\]` }}
                  />
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                  <div
                    className="latex text-sm text-center"
                    dangerouslySetInnerHTML={{ __html: `\\[${latex.info}\\]` }}
                  />
                </div>
              </li>
            </ol>

            <div className="mt-6 text-xs text-gray-500">
              Source: Saaty, T. L. (1980). The Analytic Hierarchy Process.
            </div>
          </div>

          <hr className="border-t border-gray-200" />
        </>
      )}

      {/* Interactive Calculator Section */}
      <div className="bg-white border-none md:border border-gray-200 rounded-lg p-0 md:p-6">
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-center mb-6 text-black">
          {externalCriteria ? "Calculate Weights (AHP)" : "AHP Real-Time Weight Calculator"}
        </motion.h2>

        <Card className="p-4 rounded-2xl shadow-md">
          <CardContent className="space-y-4 overflow-auto p-0">
            <div className="text-sm text-gray-600 mb-4">
              Enter pairwise comparison values (1-9 scale). The matrix will auto-update reciprocals.
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-center border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 border border-gray-200"></th>
                    {Array(n)
                      .fill(0)
                      .map((_, j) => (
                        <th key={j} className="p-2 border border-gray-200 font-semibold text-xs">
                          {externalCriteria ? externalCriteria[j].name : `C${j + 1}`}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-2 border border-gray-200 font-semibold text-xs bg-gray-50">
                        {externalCriteria ? externalCriteria[i].name : `C${i + 1}`}
                      </td>
                      {row.map((val, j) => (
                        <td key={j} className="p-1 border border-gray-200">
                          {i === j ? (
                            <span className="text-gray-500 text-sm">1</span>
                          ) : i < j ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0.11"
                              max="9"
                              value={val}
                              onChange={(e) => updateCell(i, j, e.target.value)}
                              className="text-center text-xs h-8 w-full"
                            />
                          ) : (
                            <span className="text-xs text-gray-600">{val.toFixed(3)}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {weights.length > 0 && (
          <>
            <Card className="p-4 rounded-2xl shadow-lg mt-6">
              <CardContent className="space-y-3 p-0">
                <h3 className="text-xl font-semibold mb-4">Weights (Real-Time)</h3>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Criterion</th>
                        <th className="px-4 py-2 text-right font-medium text-gray-700">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {weights.map((w, i) => (
                        <tr key={i} className="bg-white">
                          <td className="px-4 py-2 text-gray-900">
                            {externalCriteria ? externalCriteria[i].name : `C${i + 1}`}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-blue-600">{w.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 rounded-2xl shadow-lg mt-6">
              <CardContent className="space-y-2 p-0">
                <h3 className="text-lg font-bold mb-3">Consistency Check</h3>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-700">λmax:</span>
                  <span className="font-mono">{consistency.lambdaMax?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-700">CI:</span>
                  <span className="font-mono">{consistency.CI?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-700">CR:</span>
                  <span className="font-mono">{consistency.CR?.toFixed(4)}</span>
                </div>
                <div className="text-center font-semibold mt-4 p-3 rounded-lg">
                  {consistency.CR !== undefined && consistency.CR < 0.1 ? (
                    <span className="text-green-600 bg-green-50 px-4 py-2 rounded-lg">✔ Consistent</span>
                  ) : (
                    <span className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">✖ Revise Judgments</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {onWeightsCalculated && (
              <div className="mt-6">
                <Button
                  onClick={handleApplyWeights}
                  className="w-full p-4 text-lg rounded-2xl"
                  disabled={consistency.CR !== undefined && consistency.CR >= 0.1}
                >
                  Calculate & Apply Weights
                </Button>
                {consistency.CR !== undefined && consistency.CR >= 0.1 && (
                  <p className="text-xs text-red-600 text-center mt-2">
                    Please revise your judgments to achieve CR &lt; 0.1 before applying weights
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
