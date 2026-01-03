"use client"

import { useEffect, useRef } from "react"
import { translations } from "@/constants/translations"

declare global {
  interface Window {
    MathJax?: any;
  }
}

type SWIFormulaProps = {
  landingPage?: boolean;
  language?: string;
};

export default function SWIFormula({ landingPage = false, language = "EN" }: SWIFormulaProps) {
  const t = translations[language as keyof typeof translations].showcase.formulas
  const latex = {
    IDM: "\\quad A = [a_{i,j}]_{m\\times n} = \\begin{bmatrix} a_{1,1} & a_{1,2} & \\dots & a_{1,n} \\\\ a_{2,1} & a_{2,2} & \\dots & a_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m,1} & a_{m,2} & \\dots & a_{m,n} \\end{bmatrix}, \\quad \\quad a_{m,n}>0 \\tag{1}",
    normalizationBenefit: "\\overline {IDM}_{i,j} = \\frac{a_{i,j}}{\\sum_{i=1}^{m} a_{i,j}} \\tag{2}",
    normalizationCost: "\\overline {IDM}_{i,j} = \\frac{1 / a_{i,j}}{\\sum_{i=1}^{m} (1 / a_{i,j})} \\tag{3}",
    informationEntropy: "I_{i,j} = \\log_{2} \\left( \\frac{1}{\\overline {IDM}_{i,j}} \\right) \\tag{4}",
    weightedInformationSum: "SWI'_i = \\sum_{j=1}^{n} w_j \\, I_{i,j} \\tag{5}",
    ranking: "\\text{Rank}(A_i) \\uparrow \; \\text{as} \; SWI'_i \\downarrow"
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // Re-run typeset on updates
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
            color: currentColor;
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
          /* Add more space to formula boxes */
          .formula-box {
            padding: 1.5rem !important;
            margin: 1rem 0 !important;
            display: block !important;
            width: 100% !important;
            overflow-x: auto;
            border-radius: 0.5rem;
          }

          /* Mobile adjustments */
          @media (max-width: 640px) {
            .formula-box {
              padding: 0.5rem !important;
              margin: 0.5rem 0 !important;
            }
            .latex {
              font-size: 0.75rem !important;
            }
            .latex mjx-container {
              margin: 0.25rem 0 !important;
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
              font-size: 0.8125rem !important;
            }
          }
        `
      }} />
      <div ref={containerRef} style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className={`prose max-w-none text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed text-black ${landingPage ? '' : 'bg-white border border-gray-200 rounded-lg p-3 md:p-6'}`}>
        {landingPage ? (
          <div className="py-4 font-serif">
            <div className="flex flex-col items-center mb-4 sm:mb-8">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-2">Mathematical Framework</span>
              <h1 className="text-xl md:text-2xl font-bold text-center text-slate-900 m-0">
                {t.swiTitle}
              </h1>
            </div>

            <div className="border-y border-slate-900 py-6 sm:py-10 my-4 sm:my-8 overflow-x-auto bg-slate-50/30">
              <div className="latex text-center" dangerouslySetInnerHTML={{ __html: `\\[${latex.weightedInformationSum}\\]` }} />
            </div>

            <div className="mt-8 text-center">
              <h2 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-6">{t.rankingCriteria}</h2>
              <div className="text-lg md:text-xl text-slate-900 font-serif overflow-x-auto">
                {`\\[ ${t.rankAscending} \\]`}
              </div>
            </div>

            <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Ref: Dwivedi et al. (2025)</span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none text-center sm:text-right">DOI: 10.1111/itor.13609</span>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-6 text-black">
              SWI (Sum Weighted Information) Method
            </h1>

            <p className="mb-4 text-black">
              The SWI method is a multi-criteria decision-making (MCDM) approach based on information
              entropy. It evaluates alternatives by transforming performance data into weighted
              information measures. The procedure is as follows:
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-black">Step&nbsp;I. Decision Matrix Construction</h2>
            <p className="mb-4 text-black">
              Let the information decision matrix (IDM) be:
            </p>

            <div className="bg-gray-50 rounded-lg mb-4">
              <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.IDM}\\]` }} />
            </div>
            <p className="mb-4">
              {`where \\( i = 1, 2, \\dots, m \\) represents the alternatives and \\( j = 1, 2, \\dots, n \\) represents the criteria.`}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-black">Step&nbsp;II. Normalization</h2>
            <p className="mb-2 text-black">For each criterion \( C_j \), normalize the values as follows:</p>

            <ul className="list-disc ml-6 mb-4">
              <li>
                For benefit (desirable) criteria:
                <div className="bg-gray-50 formula-box my-2">
                  <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.normalizationBenefit}\\]` }} />
                </div>
              </li>
              <li>
                For cost (undesirable) criteria:
                <div className="bg-gray-50 formula-box my-2">
                  <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.normalizationCost}\\]` }} />
                </div>
              </li>
            </ul>

            <p className="mb-2">
              {`The value \\( \\overline {{IDM}}_{{i},{j}} \\) shows the probability distribution, where the sum of all probabilities of each alternative
          to the criteria will be 1, i.e., \\( \\sum_{{i}=1}^{{m}} \\overline {{IDM}}_{{i},{j}} = 1 \\) for both desirable criteria and undesirable criteria.`}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-black">Step&nbsp;III. Information Measure</h2>
            <p className="mb-4 text-black">
              The information score for each attributes is calculated as:
            </p>
            <div className="bg-gray-50 formula-box mb-4">
              <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.informationEntropy}\\]` }} />
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-black">Step&nbsp;IV. Sum Weighted Information </h2>
            <p className="mb-4 text-black">
              {`Assign a weight \\( w_{j} \\) to each criterion, where \\( i = 1, 2, ...., m \\) represents the alternatives and \\( j = 1, 2, ...., n \\)
        represents the criteria. The Sum Weighted Information for each alternative \\( A_i \\) is:`}
            </p>

            <div className="bg-gray-50 formula-box mb-4">
              <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.weightedInformationSum}\\]` }} />
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2 text-black">Step&nbsp;V. Ranking of Alternatives</h2>
            <p className="mb-4 text-black">
              The alternatives are ranked in ascending order of their \( SWI'_i \) values:
            </p>
            <div className="bg-gray-50 formula-box mb-4">
              <div className="latex text-sm text-center" style={{ fontSize: "0.875rem" }} dangerouslySetInnerHTML={{ __html: `\\[${latex.ranking}\\]` }} />
            </div>

            <p className="text-muted-foreground mt-6 italic">
              A smaller SWI score indicates a better (more desirable) alternative.
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              Source: SWI formulation (information-theoretic normalization & sum weighted aggregation). <a className="text-blue-500 underline font-bold" target="_blank" href="https://doi.org/10.1111/itor.13609"> (Article by Dr Pankaj Prasad Dwivedi et al. 2025)</a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
