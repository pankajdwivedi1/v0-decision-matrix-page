"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function PIPRECIAFormula({
  criteria: externalCriteria,
  onWeightsCalculated,
  initialScores,
  onScoresChange
}: {
  criteria?: { id: string; name: string }[];
  onWeightsCalculated?: (weights: Record<string, number>) => void;
  initialScores?: Record<number, string>;
  onScoresChange?: (scores: Record<number, string>) => void;
}) {
  // --- Original Description State & Logic ---
  const latex = {
    intro: "\\text{PIPRECIA: Rank criteria first: } C_1 \\succ C_2 \\succ \\dots \\succ C_n",
    formula_s: "s_1 = 1, \\qquad s_j = \\frac{1}{1 + k_j} \\quad (j = 2,\\dots,n), \\; k_j > 0 \\tag{1}",
    formula_q: "q_1 = s_1, \\qquad q_j = q_{j-1} \\cdot s_j \\quad (j = 2,\\dots,n) \\tag{2}",
    formula_w: "Q = \\sum_{j=1}^{n} q_j, \\qquad w_j = \\dfrac{q_j}{Q}, \\; \\sum_{j=1}^{n} w_j = 1 \\tag{3}",
    numeric_example_title: "Numerical example (n = 5, using the decreasing-importance case)",
    numeric_k: "\\{k_2,k_3,k_4,k_5\\} = \\{0.5,\\;1.0,\\;0.2,\\;0.5\\}",
    numeric_results:
      "\\begin{aligned}s_1 &= 1,\\\\ " +
      "s_2 &= \\dfrac{1}{1+0.5} = \\dfrac{2}{3},\\\\ " +
      "s_3 &= \\dfrac{1}{1+1.0} = \\dfrac{1}{2},\\\\ " +
      "s_4 &= \\dfrac{1}{1+0.2} = \\dfrac{5}{6},\\\\ " +
      "s_5 &= \\dfrac{1}{1+0.5} = \\dfrac{2}{3},\\\\[6pt]" +
      "q &= \\left[1,\\;\\dfrac{2}{3},\\;\\dfrac{1}{3},\\;\\dfrac{5}{18},\\;\\dfrac{5}{27}\\right],\\\\[6pt]" +
      "Q &= \\dfrac{133}{54},\\\\[6pt]" +
      "w &= \\left[\\dfrac{54}{133},\\;\\dfrac{36}{133},\\;\\dfrac{18}{133},\\;\\dfrac{15}{133},\\;\\dfrac{10}{133}\\right] \\\\ " +
      "&\\approx [0.4060,\\;0.2707,\\;0.1353,\\;0.1128,\\;0.0752]\\end{aligned} \\tag{Example}"
  };

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

  // --- Interactive Calculator State & Logic ---
  // If external criteria provided, use them. Otherwise default values.
  const [criteriaNames, setCriteriaNames] = useState<string[]>(
    externalCriteria ? externalCriteria.map(c => c.name) : ["C1", "C2", "C3"]
  );

  // Reset if external criteria change
  useEffect(() => {
    if (externalCriteria) {
      setCriteriaNames(externalCriteria.map(c => c.name));
      // Only reset scores if no initialScores provided or if we want to force reset on criteria change.
      // Ideally, if criteria change, scores might be invalid.
      // But for persistence, we might want to keep what matches.
      // For now, let's trust the parent or reset if the length mismatch?
      // Actually, relying on initialScores updates from parent is safer.
      if (!initialScores) {
        setScores({});
      }
      setWeights(null);
    }
  }, [externalCriteria, initialScores]);

  const [scores, setScores] = useState<Record<number, string>>(initialScores || {});
  const [weights, setWeights] = useState<number[] | null>(null);

  // Sync state with prop if it changes externally
  useEffect(() => {
    if (initialScores) {
      setScores(initialScores);
    }
  }, [initialScores]);

  const updateCriterion = (index: number, value: string) => {
    if (externalCriteria) return; // Read-only names if external
    const updated = [...criteriaNames];
    updated[index] = value;
    setCriteriaNames(updated);
  };

  const handleScoreInput = (index: number, val: string) => {
    const newScores = { ...scores, [index]: val };
    setScores(newScores);
    if (onScoresChange) {
      onScoresChange(newScores);
    }
  };

  const computeWeights = () => {
    const n = criteriaNames.length;
    // s[0] is 0
    const s = Array(n).fill(0).map((_, i) => (i === 0 ? 0 : parseFloat(scores[i] || "0")));

    const k = Array(n).fill(0);
    k[0] = 1;
    // User formula: k[i] = 1 - s[i] / 10
    for (let i = 1; i < n; i++) k[i] = 1 - s[i] / 10;

    const q = Array(n).fill(0);
    q[0] = k[0];
    for (let i = 1; i < n; i++) q[i] = q[i - 1] * k[i];

    const sumQ = q.reduce((a, b) => a + b, 0);
    const w = q.map((qi) => (sumQ === 0 ? 0 : qi / sumQ));

    return w;
  };

  // Auto-calculate weights for display whenever scores change
  useEffect(() => {
    const w = computeWeights();
    setWeights(w);
  }, [scores, criteriaNames]);

  const handleApplyWeights = () => {
    const w = computeWeights();
    setWeights(w);

    // If callback provided, format and return weights
    if (onWeightsCalculated && externalCriteria) {
      const weightMap: Record<string, number> = {};
      w.forEach((weight, i) => {
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
          {/* --- Description / Theory Section (Only show if not in modal mode or if desired) --- */}
          <div ref={containerRef} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
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
                .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace; }
              `
            }} />

            <h1 className="text-2xl font-bold text-center mb-6">PIPRECIA Weighting Method</h1>
            <p className="mb-4">PIPRECIA: Pivot Pairwise Relative Criteria Importance Assessment.</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.intro}\\]` }} />
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.formula_s}\\]` }} />
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.formula_q}\\]` }} />
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.formula_w}\\]` }} />
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Numeric example</h2>
            <p className="mb-2">{latex.numeric_example_title}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.numeric_k}\\]` }} />
              <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.numeric_results}\\]` }} />
            </div>
          </div>

          <hr className="border-t border-gray-200" />
        </>
      )}

      {/* --- Interactive Calculator Section --- */}
      <div className="bg-white border-none md:border border-gray-200 rounded-lg p-0 md:p-6">
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-center mb-6 text-black">
          {externalCriteria ? "Calculate Weights (PIPRECIA)" : "Interactive Calculator"}
        </motion.h2>

        <Card className="p-4 rounded-2xl shadow-sm border border-gray-100 bg-gray-50/50">
          <CardContent className="space-y-4 p-0">
            {criteriaNames.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-4 items-center">
                <Input
                  value={criteriaNames[i]}
                  onChange={(e) => updateCriterion(i, e.target.value)}
                  readOnly={!!externalCriteria}
                  className={`col-span-1 ${externalCriteria ? 'bg-gray-100 text-gray-700' : 'bg-white'}`}
                />
                {i > 0 ? (
                  <Input
                    type="number"
                    placeholder="Score vs previous"
                    value={scores[i] || ""}
                    onChange={(e) => handleScoreInput(i, e.target.value)}
                    className="col-span-2 bg-white"
                  />
                ) : (
                  <div className="col-span-2 text-xs text-gray-500 italic pl-2">
                    Reference criterion (s=1)
                  </div>
                )}
              </motion.div>
            ))}

            {!externalCriteria && (
              <Button onClick={() => setCriteriaNames([...criteriaNames, `C${criteriaNames.length + 1}`])} className="w-full rounded-2xl mt-4" variant="outline">
                + Add Criterion
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button onClick={handleApplyWeights} className="w-full p-4 text-lg rounded-2xl">
            {onWeightsCalculated ? "Calculate & Apply Weights" : "Calculate Weights"}
          </Button>
        </div>

        {weights && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card className="p-4 rounded-2xl shadow-md border-none bg-white">
              <CardContent className="space-y-3 p-0">
                <h3 className="text-xl font-semibold mb-4">Calculation Results</h3>
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
                          <td className="px-4 py-2 text-gray-900">{criteriaNames[i]}</td>
                          <td className="px-4 py-2 text-right font-mono text-blue-600">{w.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
