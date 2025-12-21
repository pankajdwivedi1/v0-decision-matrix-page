"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function VarianceFormula() {
    const latex = {
        step1: "n_{ij} = \\frac{x_{ij}}{\\sum_{k=1}^{m} x_{kj}} \\tag{1}",
        step2: "V_j = \\frac{1}{m} \\sum_{i=1}^{m} (n_{ij} - \\bar{n}_j)^2 \\tag{2}",
        step3: "w_j = \\frac{V_j}{\\sum_{k=1}^{n} V_k} \\tag{3}"
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
          .latex { font-size: 0.875rem !important; line-height: 2 !important; margin: 1rem 0; display: block; }
          .latex mjx-container { font-size: 0.875rem !important; max-width: 100% !important; overflow-x: auto; margin: 0.75rem 0 !important; padding: 0.5rem 0 !important; text-align: center !important; }
        `
            }} />
            <div ref={containerRef} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
                <h1 className="text-2xl font-bold text-center mb-6">Variance Weight Method</h1>
                <p className="mb-4">
                    The Variance method is an <strong>objective</strong> weighting method that uses the statistical variance of the normalized data to determine criteria importance.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Normalization</h2>
                <p className="mb-2">Normalize the decision matrix:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Variance Calculation</h2>
                <p className="mb-2">Calculate the statistical variance (V_j) for each criterion:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Weight Determination</h2>
                <p className="mb-2">The weights are proportional to the variances:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
                </div>
            </div>
        </>
    )
}
