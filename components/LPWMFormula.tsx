"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function LPWMFormula() {
    const latex = {
        step1: "n_{ij} = \\frac{x_{ij}}{\\sqrt{\\sum_{k=1}^{m} x_{kj}^2}} \\tag{1}",
        step2: "L_j = \\begin{cases} \\min_i(n_{ij}) & \\text{for beneficial criteria} \\\\ \\max_i(n_{ij}) & \\text{for non-beneficial criteria} \\end{cases} \\tag{2}",
        step3: "LD_j = \\sum_{i=1}^{m} |n_{ij} - L_j| \\tag{3}",
        step4: "w_j = \\frac{LD_j}{\\sum_{k=1}^{n} LD_k} \\tag{4}"
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
                <h1 className="text-2xl font-bold text-center mb-6">Linear Programming Weight Method (LPWM)</h1>
                <p className="mb-4">
                    The <strong>Linear Programming Weight Method (LPWM)</strong>, attributed to <strong>Srinivas and Rao (2007)</strong>, determines objective weights by analyzing the deviation of alternatives from the anti-ideal (worst-case) solution. Criteria that show larger cumulative distance from the worst performance are assigned higher weights.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Vector Normalization</h2>
                <p className="mb-2">Normalize the decision matrix using vector normalization:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Anti-Ideal Determination</h2>
                <p className="mb-2">Identify the anti-ideal solution (worst case) for each criterion. For beneficial criteria, it is the minimum value; for non-beneficial, it is the maximum:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Deviation Calculation</h2>
                <p className="mb-2">Calculate the absolute deviation of each alternative from the anti-ideal solution for each criterion:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
                </div>
                <p className="mb-4">
                    where <em>LD<sub>j</sub></em> represents the cumulative distance of all alternatives from the worst possible state for criterion <em>j</em>.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Weight Determination</h2>
                <p className="mb-2">Normalize the deviations to obtain the final weights:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4}\\]` }} />
                </div>

                <div className="mt-6 text-xs text-gray-500">
                    Source: Srinivas, S. and Rao, R. V. (2007). Linear programming weight method for multi-attribute decision making. International Journal of Information Technology & Decision Making.
                </div>
            </div>
        </>
    )
}
