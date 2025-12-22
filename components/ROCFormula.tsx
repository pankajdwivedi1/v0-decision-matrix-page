"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function ROCFormula() {
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
                    window.MathJax.typesetPromise?.().catch((err: any) => console.log('MathJax error:', err))
                }
            };
        } else {
            window.MathJax?.typesetPromise?.().catch((err: any) => console.log('MathJax error:', err))
        }
    }, []);

    const latex = {
        formula: "w_j = \\frac{1}{n} \\sum_{i=j}^{n} \\frac{1}{i}, \\quad j=1, \\dots, n",
        example: "w_1 = \\frac{1}{3}(1 + \\frac{1}{2} + \\frac{1}{3}) = 0.6111, \\quad w_2 = \\frac{1}{3}(\\frac{1}{2} + \\frac{1}{3}) = 0.2778, \\quad w_3 = \\frac{1}{3}(\\frac{1}{3}) = 0.1111"
    }

    return (
        <div ref={containerRef} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
            <h1 className="text-2xl font-bold text-center mb-6">
                Rank Order Centroid (ROC) Weight Method
            </h1>

            <p className="mb-4">
                The Rank Order Centroid (ROC) method is a weight estimation technique that uses only the rank order of the criteria. It provides weights that are consistent with the centroid of the simplex defined by the rank ordering.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Mathematical Formula</h2>
            <p className="mb-2">If there are \(n\) criteria ranked from most important (\(j=1\)) to least important (\(j=n\)), the weight for the \(j\)-th criterion is:</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center overflow-x-auto">
                <div className="text-lg" dangerouslySetInnerHTML={{ __html: `\\[ ${latex.formula} \\]` }} />
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Example (for \(n=3\))</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm overflow-x-auto leading-loose">
                <div dangerouslySetInnerHTML={{ __html: `\\[ ${latex.example} \\]` }} />
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Key Properties:</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Requires only ordinal information (rank of importance).</li>
                    <li>Weights always sum to 1.</li>
                    <li>The spread between weights decreases as the number of criteria increases.</li>
                </ul>
            </div>

            <div className="mt-6 text-xs text-gray-500">
                Source: Barron, F. H., & Barrett, B. E. (1996). Decision Quality Using Ranking Methods. Management Science, 42(11), 1515-1523.
            </div>
        </div>
    )
}
