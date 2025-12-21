"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function MDMFormula() {
    const latex = {
        step1: "n_{ij} = \\frac{x_{ij}}{\\sqrt{\\sum_{k=1}^{m} x_{kj}^2}} \\tag{1}",
        step2: "D_j = \\sum_{i=1}^{m} \\sum_{k=1}^{m} |n_{ij} - n_{kj}| \\tag{2}",
        step3: "w_j = \\frac{D_j}{\\sum_{k=1}^{n} D_k} \\tag{3}"
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
                <h1 className="text-2xl font-bold text-center mb-6">Maximizing Deviation Method (MDM)</h1>
                <p className="mb-4">
                    The Maximizing Deviation Method (MDM) is an <strong>objective</strong> weighting method that assigns higher weights to criteria that show greater deviation between alternatives. The method is based on the principle that criteria with larger differences between alternatives should have more influence on the final decision.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Vector Normalization</h2>
                <p className="mb-2">Normalize the decision matrix using vector normalization:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
                </div>
                <p className="mb-4">
                    where <em>x<sub>ij</sub></em> is the original value, and <em>n<sub>ij</sub></em> is the normalized value for alternative <em>i</em> and criterion <em>j</em>.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Deviation Calculation</h2>
                <p className="mb-2">Calculate the total deviation for each criterion by summing the absolute differences between all pairs of alternatives:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2}\\]` }} />
                </div>
                <p className="mb-4">
                    where <em>D<sub>j</sub></em> represents the total deviation for criterion <em>j</em>. Higher deviation indicates greater discriminating power.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Weight Determination</h2>
                <p className="mb-2">Normalize the deviations to obtain the final weights:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
                </div>
                <p className="mb-4">
                    The weights sum to 1, and criteria with larger deviations receive higher weights, reflecting their greater importance in differentiating alternatives.
                </p>
            </div>
        </>
    )
}
