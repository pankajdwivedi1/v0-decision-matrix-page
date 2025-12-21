"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function LSWFormula() {
    const latex = {
        step1: "n_{ij} = \\frac{x_{ij}}{\\sqrt{\\sum_{k=1}^{m} x_{kj}^2}} \\tag{1}",
        step2beneficial: "A_j^* = \\max_i(n_{ij}) \\quad \\text{for beneficial criteria} \\tag{2a}",
        step2nonbeneficial: "A_j^* = \\min_i(n_{ij}) \\quad \\text{for non-beneficial criteria} \\tag{2b}",
        step3: "LS_j = \\sum_{i=1}^{m} (n_{ij} - A_j^*)^2 \\tag{3}",
        step4: "w_j = \\frac{LS_j}{\\sum_{k=1}^{n} LS_k} \\tag{4}"
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
                <h1 className="text-2xl font-bold text-center mb-6">Least Squares Weighting Method (LSW)</h1>
                <p className="mb-4">
                    The Least Squares Weighting Method (LSW) is an <strong>objective</strong> weighting method that determines criterion weights based on the squared deviations from the ideal solution. Criteria with larger deviations from the ideal receive higher weights, as they have more room for improvement and thus greater discriminating power.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Vector Normalization</h2>
                <p className="mb-2">Normalize the decision matrix using vector normalization:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
                </div>
                <p className="mb-4">
                    where <em>x<sub>ij</sub></em> is the original value, and <em>n<sub>ij</sub></em> is the normalized value for alternative <em>i</em> and criterion <em>j</em>.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Ideal Solution Determination</h2>
                <p className="mb-2">Determine the ideal solution for each criterion based on its type:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2beneficial}\\]` }} />
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2nonbeneficial}\\]` }} />
                </div>
                <p className="mb-4">
                    where <em>A<sub>j</sub>*</em> represents the ideal value for criterion <em>j</em>.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Least Squares Calculation</h2>
                <p className="mb-2">Calculate the sum of squared deviations from the ideal solution for each criterion:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
                </div>
                <p className="mb-4">
                    where <em>LS<sub>j</sub></em> represents the least squares value for criterion <em>j</em>. Higher values indicate greater potential for improvement.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Weight Determination</h2>
                <p className="mb-2">Normalize the least squares values to obtain the final weights:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4}\\]` }} />
                </div>
                <p className="mb-4">
                    The weights sum to 1, and criteria with larger deviations from the ideal solution receive higher weights, reflecting their greater importance in the decision-making process.
                </p>
            </div>
        </>
    )
}
