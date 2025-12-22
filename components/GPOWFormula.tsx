"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function GPOWFormula() {
    const latex = {
        step1: "n_{ij} = \\frac{x_{ij}}{\\sqrt{\\sum_{k=1}^{m} x_{kj}^2}} \\tag{1}",
        step2: "G_j = \\begin{cases} \\max_i(n_{ij}) & \\text{for beneficial criteria} \\\\ \\min_i(n_{ij}) & \\text{for non-beneficial criteria} \\end{cases} \\tag{2}",
        step3: "GD_j = \\sum_{i=1}^{m} |n_{ij} - G_j| \\tag{3}",
        step4: "w_j = \\frac{GD_j}{\\sum_{k=1}^{n} GD_k} \\tag{4}"
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
                <h1 className="text-2xl font-bold text-center mb-6">Goal Programming–based Objective Weights (GPOW)</h1>
                <p className="mb-4">
                    The <strong>Goal Programming–based Objective Weights (GPOW)</strong> method, proposed by <strong>Wang (2006)</strong>, is an objective weighting approach that determines criteria weights by minimizing the total deviation of alternatives from a desired goal level. It focuses on how far each alternative is from the ideal performance for each criterion.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Vector Normalization</h2>
                <p className="mb-2">Normalize the decision matrix using vector normalization:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Goal Determination</h2>
                <p className="mb-2">Identify the goal (ideal solution) for each criterion. For beneficial criteria, the goal is the maximum value; for non-beneficial, it is the minimum:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Goal Deviation Calculation</h2>
                <p className="mb-2">Calculate the absolute deviation of each alternative from its goal for each criterion:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
                </div>
                <p className="mb-4">
                    where <em>GD<sub>j</sub></em> represents the cumulative distance of all alternatives from the ideal state for criterion <em>j</em>.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Weight Determination</h2>
                <p className="mb-2">Normalize the goal deviations to obtain the final weights:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4}\\]` }} />
                </div>

                <div className="mt-6 text-xs text-gray-500">
                    Source: Wang, Y. M. (2006). A goal programming approach to determining weights of criteria in multi-attribute decision making. Computers & Industrial Engineering.
                </div>
            </div>
        </>
    )
}
