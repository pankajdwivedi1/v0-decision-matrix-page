"use client"
import { useEffect, useRef } from "react"

declare global {
    interface Window {
        MathJax?: any;
    }
}

export default function PCWMFormula() {
    const latex = {
        step1: "n_{ij} = \\frac{x_{ij}}{\\sqrt{\\sum_{k=1}^{m} x_{kj}^2}} \\tag{1}",
        step2: "r_{jk} = \\frac{\\sum_{i=1}^{m} (n_{ij} - \\bar{n}_j)(n_{ik} - \\bar{n}_k)}{\\sqrt{\\sum_{i=1}^{m} (n_{ij} - \\bar{n}_j)^2 \\sum_{i=1}^{m} (n_{ik} - \\bar{n}_k)^2}} \\tag{2}",
        step3: "C_j = \\sum_{k=1}^{n} (1 - r_{jk}) \\tag{3}",
        step4: "w_j = \\frac{C_j}{\\sum_{k=1}^{n} C_k} \\tag{4}"
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
                <h1 className="text-2xl font-bold text-center mb-6">Pearson Correlation Weight Method (PCWM)</h1>
                <p className="mb-4">
                    The <strong>Pearson Correlation Weight Method (PCWM)</strong> is an objective weighting approach that determines criteria weights based on the degree of independence and conflict between criteria. It utilizes the Pearson correlation coefficient, which was mathematically formalized and refined by <strong>Karl Pearson</strong> (from earlier concepts by <strong>Sir Francis Galton</strong> and <strong>Auguste Bravais</strong>), to quantify redundancy and ensure that criteria providing unique information are assigned appropriate importance.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 1. Vector Normalization</h2>
                <p className="mb-2">Normalize the decision matrix using vector normalization to bring all criteria to a common scale:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step1}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 2. Pearson Correlation Calculation</h2>
                <p className="mb-2">Calculate the Pearson correlation coefficient matrix <em>R = [r<sub>jk</sub>]</em> between all pairs of criteria <em>j</em> and <em>k</em>:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step2}\\]` }} />
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 3. Independence Measure (Conflict)</h2>
                <p className="mb-2">Determine the independence measure for each criterion by calculating the sum of its lack of correlation with all other criteria:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step3}\\]` }} />
                </div>
                <p className="mb-4">
                    where <em>C<sub>j</sub></em> represents the total conflict or uniqueness of criterion <em>j</em> relative to the entire criteria set.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Step 4. Weight Determination</h2>
                <p className="mb-2">Calculate the final objective weights by normalizing the independence measures:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.step4}\\]` }} />
                </div>

                <div className="mt-6 text-xs text-gray-500">
                    Source: Pearson, K. (1895). Notes on regression and inheritance in the case of two variables. Proceedings of the Royal Society of London. Based on earlier works by Francis Galton (1888) and Auguste Bravais (1844).
                </div>
            </div>
        </>
    )
}
