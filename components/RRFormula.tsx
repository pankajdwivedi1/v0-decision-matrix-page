"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function RRFormula() {
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
        formula: "w_j = \\frac{1/r_j}{\\sum_{k=1}^{n} (1/r_k)}, \\quad j=1, \\dots, n",
        example: "w_1 = \\frac{1/1}{1+1/2+1/3} = \\frac{1}{1.833} = 0.545, \\quad w_2 = \\frac{1/2}{1.833} = 0.273, \\quad w_3 = \\frac{1/3}{1.833} = 0.182"
    }

    return (
        <div ref={containerRef} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
            <h1 className="text-2xl font-bold text-center mb-6">
                Rank Reciprocal (RR) Weight Method
            </h1>

            <p className="mb-4">
                The Rank Reciprocal (RR) method, also known as reciprocal weighting, assigns weights based on the reciprocal of the rank of each criterion.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Mathematical Formula</h2>
            <p className="mb-2" dangerouslySetInnerHTML={{ __html: "Weights are calculated as the normalize reciprocals of the ranks \(r_j\):" }} />
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center overflow-x-auto">
                <div className="text-lg" dangerouslySetInnerHTML={{ __html: `\\[ ${latex.formula} \\]` }} />
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Example (for \(n=3\))</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm overflow-x-auto leading-loose">
                <div dangerouslySetInnerHTML={{ __html: `\\[ ${latex.example} \\]` }} />
            </div>

            <div className="mt-6 text-xs text-gray-500">
                Source: Stillwell, W. G., Seaver, D. A., & Edwards, W. (1981). A comparison of weight approximation techniques in multiattribute utility decision making. Organizational Behavior and Human Performance, 28(1), 62-77.
            </div>
        </div>
    )
}
