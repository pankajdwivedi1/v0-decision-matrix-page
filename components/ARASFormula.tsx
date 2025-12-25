
"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function ARASFormula() {
    const latex = {
        step1_matrix: `X = \\begin{bmatrix} x_{01} & x_{02} & \\dots & x_{0n} \\\\ x_{11} & x_{12} & \\dots & x_{1n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m1} & x_{m2} & \\dots & x_{mn} \\end{bmatrix}`,
        step2_ben: "x_{0j} = \\max_i (x_{ij})",
        step2_cost: "x_{0j} = \\min_i (x_{ij})",
        step3_ben: "\\bar{x}_{ij} = \\frac{x_{ij}}{\\sum_{i=0}^m x_{ij}}",
        step3_cost_recip: "x'_{ij} = \\frac{1}{x_{ij}}",
        step3_cost_norm: "\\bar{x}_{ij} = \\frac{x'_{ij}}{\\sum_{i=0}^m x'_{ij}}",
        step4_weight_vec: "\\textbf{w} = \\{w_1, w_2, \\dots, w_n\\}, \\quad \\sum_{j=1}^n w_j = 1",
        step4_weighted: "\\hat{x}_{ij} = w_j \\cdot \\bar{x}_{ij}",
        step5_S_i: "S_i = \\sum_{j=1}^n \\hat{x}_{ij}",
        step5_S_0: "S_0 = \\sum_{j=1}^n \\hat{x}_{0j}",
        step6_K_i: "K_i = \\frac{S_i}{S_0}, \\quad i = 1, 2, \\dots, m \\quad 0 \\le K_i \\le 1",
        step7_ranking: "A_{best} = \\arg \\max_i (K_i)",
        compact: "Rank(A_i) \\propto K_i"
    }

    const containerRef = useRef<HTMLDivElement | null>(null);

    // Robust MathJax loader copied from SWEIFormula
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

    // Re-run typeset on updates
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
            color: currentColor;
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
          }
        `
            }} />
            <div ref={containerRef} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed text-black">
                <h1 className="text-2xl font-bold text-center mb-6 text-black">
                    ARAS (Additive Ratio Assessment) Method – MathJax Version
                </h1>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">1. Decision Matrix</h2>
                <p className="mb-2 text-black">Let</p>
                <ul className="list-disc ml-6 mb-4 text-black">
                    <li>m be the number of alternatives</li>
                    <li>n be the number of criteria</li>
                </ul>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_matrix}\\]` }} />
                </div>
                <p className="mb-4 text-black">where \(A_0\) denotes the optimal (ideal) alternative.</p>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">2. Determination of the Optimal Alternative</h2>
                <p className="mb-2 text-black">For each criterion \(C_j\):</p>

                <p className="mb-2 font-semibold text-black">Benefit (MAX) criterion</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_ben}\\]` }} />
                </div>

                <p className="mb-2 font-semibold text-black">Cost (MIN) criterion</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_cost}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">3. Normalization of the Decision Matrix</h2>

                <h3 className="text-lg font-semibold mt-4 mb-2 text-black">3.1 Benefit (MAX) Criteria</h3>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_ben}\\]` }} />
                </div>

                <h3 className="text-lg font-semibold mt-4 mb-2 text-black">3.2 Cost (MIN) Criteria</h3>
                <p className="mb-2 text-black">First, compute the reciprocal:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_cost_recip}\\]` }} />
                </div>
                <p className="mb-2 text-black">Then normalize:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_cost_norm}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">4. Weighted Normalized Decision Matrix</h2>
                <p className="mb-2 text-black">Let the weight vector be:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_weight_vec}\\]` }} />
                </div>
                <p className="mb-2 text-black">The weighted normalized value is:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_weighted}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">5. Optimality Function</h2>
                <p className="mb-2 text-black">The overall performance score of alternative \(A_i\) is calculated as:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_S_i}\\]` }} />
                </div>
                <p className="mb-2 text-black">where:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_S_0}\\]` }} />
                </div>
                <p className="mb-4 text-black">is the score of the optimal alternative.</p>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">6. Utility Degree</h2>
                <p className="mb-2 text-black">The utility degree of each alternative is defined as:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step6_K_i}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">7. Ranking of Alternatives</h2>
                <p className="mb-2 text-black">Alternatives are ranked in descending order of the utility degree:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step7_ranking}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-8 mb-4 text-black">Compact Algorithm Representation</h2>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.compact}\\]` }} />
                </div>

                <div className="mt-6 text-xs text-gray-500">
                    Source: Zavadskas, E. K., & Turskis, Z. (2010). A new additive ratio assessment (ARAS) method in multicriteria decision-making. technological and economic development of economy.
                </div>
            </div>
        </>
    )
}
