
"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function GRAFormula() {
    const latex = {
        step1_matrix: "X = [x_{ij}]_{m \\times n} = \\begin{bmatrix} x_{11} & x_{12} & \\dots & x_{1n} \\\\ x_{21} & x_{22} & \\dots & x_{2n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ x_{m1} & x_{m2} & \\dots & x_{mn} \\end{bmatrix} \\tag{1}",
        step2_ben: "x_{ij}^* = \\frac{x_{ij} - \\min_i x_{ij}}{\\max_i x_{ij} - \\min_i x_{ij}} \\tag{2a}",
        step2_cost: "x_{ij}^* = \\frac{\\max_i x_{ij} - x_{ij}}{\\max_i x_{ij} - \\min_i x_{ij}} \\tag{2b}",
        step3_delta: "\\Delta_{ij} = |x_{0j} - x_{ij}^*|, \\quad \\text{where } x_{0j} = 1 \\tag{3}",
        step4_grc: "\\xi_{ij} = \\frac{\\Delta_{\\min} + \\zeta \\Delta_{\\max}}{\\Delta_{ij} + \\zeta \\Delta_{\\max}}, \\quad \\zeta = 0.5 \\tag{4}",
        step5_grg: "\\gamma_i = \\sum_{j=1}^n w_j \\xi_{ij} \\tag{5}"
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
                    GRA (Grey Relational Analysis)
                </h1>
                <p className="mb-4 text-black">
                    GRA measures the correlation between alternatives and the reference sequence (ideal solution).
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">Step 1. Decision Matrix</h2>
                <p className="mb-2 text-black">Construct the decision matrix consisting of m alternatives and n criteria.</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1_matrix}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">Step 2. Normalization</h2>
                <p className="mb-2 text-black">For beneficial criteria:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_ben}\\]` }} />
                </div>
                <p className="mb-2 text-black">For non-beneficial criteria:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_cost}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">Step 3. Deviation Sequence</h2>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_delta}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">Step 4. Grey Relational Coefficient (GRC)</h2>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_grc}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-black">Step 5. Grey Relational Grade (GRG)</h2>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_grg}\\]` }} />
                </div>

                <div className="mt-6 text-xs text-gray-500">
                    Source: Deng, J. L. (1982). Control problems of grey systems. Systems & Control Letters.
                </div>
            </div>
        </>
    )
}
