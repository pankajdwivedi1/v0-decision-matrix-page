"use client"
import { useEffect } from "react"
// import "mathjax/es5/tex-mml-chtml.js"

declare global {
  // MathJax global (loaded from CDN)
  interface Window {
    MathJax?: any;
  }
}

export default function SWIFormula() {
  const latex = {
    IDM: "\\quad A = [a_{i,j}]_{m\\times n} = \\begin{bmatrix} a_{1,1} & a_{1,2} & \\dots & a_{1,n} \\\\ a_{2,1} & a_{2,2} & \\dots & a_{2,n} \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ a_{m,1} & a_{m,2} & \\dots & a_{m,n} \\end{bmatrix}, \\quad \\quad a_{m,n}>0 \\tag{1}",
    normalizationBenefit: "\\overline {IDM}_{i,j} = \\frac{a_{i,j}}{\\sum_{i=1}^{m} a_{i,j}} \\tag{2}",
    normalizationCost: "\\overline {IDM}_{i,j} = \\frac{1 / a_{i,j}}{\\sum_{i=1}^{m} (1 / a_{i,j})} \\tag{3}",
    informationEntropy: "I_{i,j} = \\log_{2} \\left( \\frac{1}{\\overline {IDM}_{i,j}} \\right) \\tag{4}",
    weightedInformationSum: "SWI'_i = \\sum_{j=1}^{n} w_j \\, I_{i,j} \\tag{5}",
    ranking: "\\text{Rank}(A_i) \\uparrow \; \\text{as} \; SWI'_i \\downarrow"
  };

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
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
          }
          .latex mjx-container {
            font-size: 0.875rem !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            display: block !important;
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
          }
        `
      }} />
      <div style={{ overflowWrap: "break-word", wordBreak: "break-word" }} className="prose max-w-none bg-white border border-gray-200 rounded-lg p-3 md:p-6 text-justify font-['Times_New_Roman',_Times,_serif] leading-relaxed">
        <h1 className="text-2xl font-bold text-center mb-6">
          SWI (Sum Weighted Information) Method
        </h1>

        <p className="mb-4">
          The SWI method is a multi-criteria decision-making (MCDM) approach based on information
          entropy. It evaluates alternatives by transforming performance data into weighted
          information measures. The procedure is as follows:
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;I. Decision Matrix Construction</h2>
        <p className="mb-4">
          Let the information decision matrix (IDM) be:
        </p>

        <div className="bg-gray-50 rounded-lg mb-4">
          <p className="text-center">{`$$ ${latex.IDM} $$`}</p>
        </div>
        <p className="mb-4">
          where \( i = 1, 2, \dots, m \) represents the alternatives and \( j = 1, 2, \dots, n \)
          represents the criteria.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;II. Normalization</h2>
        <p className="mb-2">For each criterion \( C_j \), normalize the values as follows:</p>

        <ul className="list-disc ml-6 mb-4">
          <li>
            For benefit (desirable) criteria:
            <div className="bg-gray-50 rounded-lg my-2">
              <p className="text-center">{`$$ ${latex.normalizationBenefit} $$`}</p>
            </div>
          </li>
          <li>
            For cost (undesirable) criteria:
            <div className="bg-gray-50 rounded-lg my-2">
              <p className="text-center">{`$$ ${latex.normalizationCost} $$`}</p>
            </div>
          </li>
        </ul>

        <p className="mb-2">
          {`The value \\( \\overline {{IDM}}_{{i},{j}} \\) shows the probability distribution, where the sum of all probabilities of each alternative
          to the criteria will be 1, i.e., \\( \\sum_{{i}=1}^{{m}} \\overline {{IDM}}_{{i},{j}} = 1 \\) for both desirable criteria and undesirable criteria.`}
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;III. Information Measure</h2>
        <p className="mb-4">
          The information score for each attributes is calculated as:
        </p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <p className="text-center">{`$$ ${latex.informationEntropy} $$`}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;IV. Sum Weighted Information </h2>
        <p className="mb-4">
          {`Assign a weight \\( w_{j} \\) to each criterion, where \\( i = 1, 2, ...., m \\) represents the alternatives and \\( j = 1, 2, ...., n \\)
        represents the criteria. The Sum Weighted Information for each alternative \\( A_i \\) is:`}
        </p>

        <div className="bg-gray-50 rounded-lg mb-4">
          <p className="text-center">{`$$ ${latex.weightedInformationSum} $$`}</p>
        </div>

        {/* <p className="text-center mb-4">
        {`$$ SWI'_i = \sum_{j=1}^{n} w_j \, \log_{2} \left( \frac{1}{IDM'_{i,j}} \right) $$`}
      </p> */}

        <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;V. Ranking of Alternatives</h2>
        <p className="mb-4">
          The alternatives are ranked in ascending order of their \( SWI'_i \) values:
        </p>
        <div className="bg-gray-50 rounded-lg mb-4">
          <p className="text-center">{`$$ ${latex.ranking} $$`}</p>
        </div>

        <p className="text-gray-700 mt-6 italic">
          A smaller SWI score indicates a better (more desirable) alternative.
        </p>
        <div className="mt-4 text-xs text-gray-500">
          Source: SWI formulation (information-theoretic normalization & sum weighted aggregation). <a className="text-blue-500 underline font-bold" target="_blank" href=" https://doi.org/10.1111/itor.13609"> (Article by Dr Pankaj Prasad Dwivedi et al. 2025)</a>
        </div>
      </div>

    </>
  );
}




