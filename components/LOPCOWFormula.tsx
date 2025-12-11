
"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function LOPCOWFormula() {
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
            h3 {
                font-size: 0.875rem !important;
                margin-top: 1rem !important;
            }
            p, li {
              font-size: 0.875rem !important;
            }
          }
        `
            }} />
            <div ref={containerRef} style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
                <h2 className="text-xl font-bold text-center mb-6">LOPCOW Weighting Method</h2>

                <h3 className="text-lg font-semibold mt-6 mb-2">Step 1. Decision Matrix</h3>
                <p className="mb-2">Construct the decision matrix:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{
                        __html: `\\[
X = [x_{ij}]_{m \\times n}
\\]` }} />
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-2">Step 2. Normalization</h3>

                <p className="mb-2">Benefit criteria:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{
                        __html: `\\[
r_{ij}=\\frac{x_{ij}}{\\sqrt{\\sum_{i=1}^{m} x_{ij}^2}}
\\]` }} />
                </div>

                <p className="mb-2">Cost criteria:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{
                        __html: `\\[
r_{ij}=\\frac{\\frac{1}{x_{ij}}}{\\sqrt{\\sum_{i=1}^{m} \\left(\\frac{1}{x_{ij}}\\right)^2}}
\\]` }} />
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-2">Step 3. Geometric Mean</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{
                        __html: `\\[
GM_j = \\left( \\prod_{i=1}^{m} r_{ij} \\right)^{1/m}
\\]` }} />
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-2">Step 4. Logarithmic Percentage Change</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{
                        __html: `\\[
L_j = -\\ln (GM_j)
\\]` }} />
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-2">Step 5. LOPCOW Weights</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{
                        __html: `\\[
w_j = \\frac{L_j}{\\sum_{k=1}^{n} L_k}
\\]` }} />
                </div>

                <p className="mt-4 mb-2">Final weight vector:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{
                        __html: `\\[
\\mathbf{w} = (w_1, w_2, \\ldots, w_n)
\\]` }} />
                </div>

            </div>
        </>
    )
}
