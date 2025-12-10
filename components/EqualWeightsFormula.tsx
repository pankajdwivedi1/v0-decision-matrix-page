"use client"
import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function EqualWeightsFormula() {
  const [nValue, setNValue] = useState(5);

  const latex = {
    formula: "w_i = \\frac{1}{n} \\tag{1}",
    sum: "\\sum_{i=1}^{n} w_i = 1 \\tag{2}"
  }

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate weight based on n
  const weightValue = (1 / nValue).toFixed(4);

  // Generate weight vector string
  const generateWeightVector = () => {
    return Array(nValue).fill(weightValue).join(', ');
  };

  // Robust MathJax loader copied from PROMETHEEFormula
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

  // Re-run typeset on updates (including nValue changes)
  useEffect(() => {
    setTimeout(() => window.MathJax?.typesetPromise?.(), 50);
  }, [nValue]);

  const handleNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 100) val = 100;
    setNValue(val);
  };

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
          /* Card styling */
          .step-card {
            background: #fff;
            padding: 1rem 1.25rem;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
            margin-bottom: 1rem;
            border: 1px solid #e5e7eb;
          }
          .step-card h2 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #1f2937;
          }
          .step-card p {
            color: #4b5563;
            margin: 0;
          }
          /* Input styling */
          .n-input {
            padding: 8px 12px;
            width: 100px;
            font-size: 16px;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .n-input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
          /* Result box */
          .result-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 1px solid #bae6fd;
            border-radius: 10px;
            padding: 1rem 1.25rem;
            margin-top: 0.75rem;
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
            p, li {
              font-size: 0.875rem !important;
            }
            .step-card {
              padding: 0.75rem 1rem;
            }
            .step-card h2 {
              font-size: 1rem;
            }
          }
        `
      }} />
      <div ref={containerRef} style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
        <h1 className="text-2xl font-bold text-center mb-6">
          Equal Weight Calculation — Steps 1 to 5
        </h1>

        {/* Step 1 */}
        <div className="step-card">
          <h2>Step 1: Define the Decision Problem</h2>
          <p>The decision-making problem is identified and clearly defined. This establishes the purpose of evaluating criteria.</p>
        </div>

        {/* Step 2 */}
        <div className="step-card">
          <h2>Step 2: Identify the Alternatives</h2>
          <p>Alternatives</p>
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\( A = \\{A_1, A_2, \\dots, A_m\\} \\)` }} />
          <p>are listed, but this step does not affect weight calculation.</p>
        </div>

        {/* Step 3 */}
        <div className="step-card">
          <h2>Step 3: Identify the Criteria</h2>
          <p>Criteria</p>
          <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\( C = \\{C_1, C_2, \\dots, C_n\\} \\)` }} />
          <p>are determined. The total number of criteria <em>n</em> is used to compute equal weights.</p>
        </div>

        {/* Step 4 */}
        <div className="step-card">
          <h2>Step 4: Construct the Decision Matrix</h2>
          <p>The decision matrix is structured, but only the number of criteria <em>n</em> is required for equal-weight computation.</p>
        </div>

        {/* Step 5 - Interactive */}
        <div className="step-card">
          <h2>Step 5: Calculate Equal Weights for Each Criterion</h2>
          <p>The equal weight method assigns the same weight to every criterion:</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
            <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.formula}\\]` }} />
          </div>

          <div className="flex items-center gap-3 my-4 flex-wrap">
            <label className="font-semibold text-gray-700">Enter number of criteria (n):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={nValue}
              onChange={handleNChange}
              className="n-input"
            />
          </div>

          <div className="result-box">
            <div className="latex text-sm" style={{ fontSize: "0.875rem" }}
              key={`numeric-${nValue}`}
              dangerouslySetInnerHTML={{
                __html: `For \\( n = ${nValue} \\): \\quad \\( w_i = \\frac{1}{${nValue}} = ${weightValue} \\)`
              }}
            />

            <div className="latex text-sm mt-2" style={{ fontSize: "0.875rem" }}
              key={`vector-${nValue}`}
              dangerouslySetInnerHTML={{
                __html: `Weight vector: \\quad \\( \\mathbf{w} = (${generateWeightVector()}) \\)`
              }}
            />
          </div>
        </div>

        {/* Constraint */}
        <div className="mt-4">
          <p className="mb-2 font-semibold">Constraint (weight sum):</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 overflow-x-auto">
            <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.sum}\\]` }} />
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Note: The Equal Weights method is used when no prior information about criteria importance is available, treating all criteria as equally important.
        </div>
      </div>
    </>
  )
}
