"use client"

import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

type SWEIFormulaProps = {
    compact?: boolean;
};

export default function SWEIFormula({ compact = false }: SWEIFormulaProps) {
    const latex = {
        step1: "IDM_{i,j} = [a_{i,j}]_{m\\times n} = \\begin{bmatrix} a_{1,1} & a_{1,2} & \\dots & a_{1,n} \\\\ a_{2,1} & a_{2,2} & \\dots & a_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m,1} & a_{m,2} & \\dots & a_{m,n} \\end{bmatrix} , \\quad \\quad a_{m,n}>0 \\tag{1}",
        step2_benefit: "\\overline {IDM}_{i,j} = \\frac{a_{i,j}}{\\sum_{i=1}^{m} a_{i,j}} \\tag{2}",
        step2_cost: "\\overline {IDM}_{i,j} = \\frac{1 / a_{i,j}}{\\sum_{i=1}^{m} 1/a_{i,j}} \\tag{3}",
        step3_info: "Info_{i,j} = \\log_{2} \\left( \\frac{1}{\\overline{IDM}_{i,j}} \\right) \\tag{4}",
        step3_swei: "Score_{i,j} = (Info_{i,j})^{w_j}, \\quad \\sum_{i=1}^{m} w_j = 1",
        step4_formula: "SWEI''_i = \\sum_{i=1}^{m} Score_{i,j}",
        step4_formula2: "SWEI''_i = \\sum_{j=1}^{n} \\left( \\log_{2} \\left\\{ \\frac{1}{\\overline{IDM}_{i,j}} \\right\\} \\right)^{w_j} \\tag{5}"
    }

    const containerRef = useRef<HTMLDivElement | null>(null);

    // Robust MathJax loader copied from PROMETHEEFormula
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
    });

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
            <div ref={containerRef} style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
                <h1 className="text-2xl font-bold text-center mb-6">
                    SWEI (Sum Weighted Exponential Information) Method
                </h1>

                <p className="mb-4">
                    SWEI uses information-theoretic normalization and exponential weighted aggregation to evaluate alternatives.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;I. Decision Matrix</h2>
                <p className="mb-2">
                    The decision-maker constructs the information decision matrix (IDM) in the first step,
                    {`which is \\( IDM_{{i},{j}} = [a_{i,j}]_{m\\times n} \\), to solve the MADM problem:`}
                </p>
                <div className="bg-gray-50 rounded-lg mb-4">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
                </div>
                <p className="mb-4">
                    {`where \\( i = 1, 2, \\dots, m \\) represents the alternatives and \\( j = 1, 2, \\dots, n \\) represents the criteria.`}
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;II. Normalization</h2>
                <p className="mb-2">Normalized the IDM values:</p>

                <ul className="list-disc ml-6 mb-4">
                    <li>
                        For benefit (desirable) criteria:
                        <div className="bg-gray-50 rounded-lg my-2">
                            <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_benefit}\\]` }} />
                        </div>
                    </li>
                    <li>
                        For cost (undesirable) criteria:
                        <div className="bg-gray-50 rounded-lg my-2">
                            <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_cost}\\]` }} />
                        </div>
                    </li>
                </ul>

                <p className="mb-2">
                    {`The value \\( \\overline {{IDM}}_{{i},{j}} \\) shows the probability distribution, where the sum of all probabilities of each alternative
                    to the criteria will be 1, i.e., \\( \\sum_{{i}=1}^{{m}} \\overline {{IDM}}_{{i},{j}} = 1 \\) for both desirable criteria and undesirable criteria.`}
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;III. Information Score</h2>
                <p className="mb-2">
                    Calculate the amount of information and weighted exponential information for all attributes:
                </p>
                <div className="bg-gray-50 rounded-lg mb-4 space-y-4">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_info}\\]` }} />
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step3_swei}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;IV. SWEI Scores</h2>
                <p className="mb-2">
                    Calculate the amount of information and weighted exponential information for all attributes:
                </p>
                <div className="bg-gray-50 rounded-lg mb-4 space-y-4">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_formula}\\]` }} />
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.step4_formula2}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;V. Ranking</h2>
                <p className="mb-2">
                    Finally, the alternative that had the lowest information score got the highest rank, and the
                    alternative that had the highest information score got the lowest rank.
                </p>
                <p className="text-center mb-4">
                    {`$$ Rank(A_i) \\uparrow \\text{ as } SWEI''_i \\downarrow \\text{ (Ascending)} $$`}
                </p>


                <div className="mt-8 text-xs text-gray-500">
                    Source: SWEI formulation (information-theoretic normalization & weighted exponential aggregation). <a className="text-blue-500 underline font-bold" target="_blank" href="https://doi.org/10.1016/j.rser.2025.115791"> (Article by Dr Pankaj Prasad Dwivedi et al. 2025)</a>
                </div>

            </div>
        </>
    )
}
