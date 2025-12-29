"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function WPMFormula() {
    const latex = {
        decision_matrix: "X = [x_{ij}]_{m \\times n} = \\begin{bmatrix} x_{11} & x_{12} & \\dots & x_{1n} \\\\ x_{21} & x_{22} & \\dots & x_{2n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m1} & x_{m2} & \\dots & x_{mn} \\end{bmatrix} \\tag{1}",
        step1_benefit: "\\overline{x}_{ij} = \\frac{x_{ij}}{\\max_i x_{ij}} \\tag{2}",
        step1_cost: "\\overline{x}_{ij} = \\frac{\\min_i x_{ij}}{x_{ij}} \\tag{3}",
        step2_wpm: "Score_i = \\prod_{j=1}^{n} (\\overline{x}_{ij})^{w_j} \\tag{4}",
        ranking: "\\text{Rank } A_i \\downarrow \\text{ by } Score_i \\text{ (Descending)}"
    }

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
          @media (max-width: 640px) {
            .latex { font-size: 0.75rem !important; }
          }
        `
            }} />
            <div ref={containerRef} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
                <h1 className="text-2xl font-bold text-center mb-6">Weighted Product Model (WPM)</h1>

                <p className="mb-4">
                    The Weighted Product Model (WPM) is a multicriteria decision-making method that evaluates alternatives by multiplying normalized criteria scores, each raised to the power of its corresponding weight.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Decision Matrix</h2>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.decision_matrix}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Normalization</h2>
                <p className="mb-2">Normalize the decision matrix using linear normalization:</p>
                <p className="font-semibold mb-2">Beneficial criteria (Max):</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_benefit}\\]` }} />
                </div>
                <p className="font-semibold mb-2">Non-beneficial criteria (Min):</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_cost}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Weighted Product</h2>
                <p className="mb-2">Calculate the weighted product score for each alternative:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_wpm}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Ranking</h2>
                <p className="mb-2">Rank alternatives in descending order based on their scores:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
                </div>

                <div className="mt-8 text-xs text-gray-500 border-t pt-4">
                    Proponent: Miller & Starr (1969).
                </div>
            </div>
        </>
    )
}
