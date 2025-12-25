"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function SWARAFormula() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Robust MathJax loader
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

    const latex = {
        step1: "C_1 \\succ C_2 \\succ \\dots \\succ C_n \\tag{1}",
        step2_k: "k_j = 1 + s_j, \\quad j=1,\\dots,n, \\quad \\text{with } k_1=1 \\tag{2}",
        step3_q1: "q_1 = 1 \\tag{3a}",
        step3_qj: "q_j = \\frac{q_{j-1}}{k_j} \\quad \\text{for } j=2,\\dots,n \\tag{3b}",
        step4: "w_j = \\frac{q_j}{\\sum_{t=1}^n q_t}, \\quad j=1,\\dots,n \\tag{4}",
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
            <div ref={containerRef} style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
                <h1 className="text-2xl font-bold text-center mb-6">
                    SWARA Weight Method
                </h1>

                <p className="mb-4">
                    SWARA (Step-wise Weight Assessment Ratio Analysis) determines weights based on expert assessment of the relative importance differences between criteria.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Order the criteria</h2>
                <p className="mb-2">Arrange criteria by decreasing importance:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Obtain comparative coefficients</h2>
                <p className="mb-2" dangerouslySetInnerHTML={{ __html: "For each criterion \\(j=2,\\dots,n\\), obtain an expert-assessed coefficient \\(s_j\\) representing the relative difference in importance between \\(C_j\\) and \\(C_{j-1}\\). For the first criterion, set \\(s_1 = 0\\)." }} />
                <p className="text-sm text-gray-600 mb-4">Note: If multiple experts provide values, aggregate by mean.</p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Compute step factors and preliminary weights</h2>
                <p className="mb-2">Define step factors:</p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_k}\\]` }} />
                </div>

                <p className="mb-2">Compute preliminary weights recursively:</p>
                <div className="bg-gray-50 rounded-lg mb-2">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_q1}\\]` }} />
                </div>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_qj}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Normalize to obtain final weights</h2>
                <p className="mb-2" dangerouslySetInnerHTML={{ __html: "Convert \\(q_j\\) to normalized weights that sum to 1:" }} />
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4}\\]` }} />
                </div>
                <p className="text-sm text-gray-600 text-center mb-4" dangerouslySetInnerHTML={{ __html: "The weight vector is \\(\\mathbf{w} = (w_1, w_2, \\dots, w_n)\\) with \\(\\sum_{j=1}^n w_j = 1\\)." }} />

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Practical Notes:</h3>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Choice of ordering matters — ensure criteria are correctly ranked before assigning coefficients.</li>
                        <li dangerouslySetInnerHTML={{ __html: "If all \\(s_j = 0\\), SWARA reduces to equal weights \\(w_j = 1/n\\)." }} />
                        <li>Typically used when expert knowledge about relative importance is available.</li>
                    </ul>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                    Source: Keršulienė, V., Zavadskas, E. K., & Turskis, Z. (2010). Selection of rational dispute resolution method by applying new step-wise weight assessment ratio analysis (SWARA).
                </div>
            </div>
        </>
    )
}
