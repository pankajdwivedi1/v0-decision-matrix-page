"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function DEMATELFormula() {
    const latex = {
        step1: "A = [a_{i,j}]_{n \\times n}",
        step2_1: "\\alpha = \\max_i \\left( \\sum_{j=1}^n a_{i,j} \\right)",
        step2_2: "X = \\frac{1}{\\alpha} A",
        step3: "T = X(I - X)^{-1}",
        step4: "D_i = \\sum_{j=1}^n t_{i,j}, \\qquad R_i = \\sum_{j=1}^n t_{j,i}",
        step5_1: "P_i = D_i + R_i",
        step5_2: "E_i = D_i - R_i",
        step6: "w_i = \\frac{P_i}{\\sum_{k=1}^{n} P_k}, \\qquad \\sum_i w_i = 1"
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
          .bg-gray-50 {
            padding: 1.5rem !important;
            margin: 1rem 0 !important;
            display: block !important;
            width: 100% !important;
            overflow-x: auto;
          }
        `
            }} />
            <div ref={containerRef} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
                <h1 className="text-2xl font-bold text-center mb-6">
                    DEMATEL Weighting Method
                </h1>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Initial Direct-Relation Matrix</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Normalization</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_1}\\]` }} />
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2_2}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Total-Relation Matrix</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Influence and Dependence</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 5. Prominence and Relation</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_1}\\]` }} />
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step5_2}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 6. DEMATEL Weights</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
                    <div className="latex text-sm text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step6}\\]` }} />
                </div>
            </div>
        </>
    )
}
