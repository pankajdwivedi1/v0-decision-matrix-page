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
    IDM: "IDM = [a_{i,j}]_{m \\times n}",
    normalizationBenefit: "\\overline {IDM}_{i,j} = \\frac{a_{i,j}}{\\sum_{i=1}^{m} a_{i,j}} \\tag{1a}",
    normalizationCost: "\\overline {IDM}_{i,j} = \\frac{1 / a_{i,j}}{\\sum_{i=1}^{m} (1 / a_{i,j})} \\tag{1b}",
    informationEntropy: "I_{i,j} = \\log_{2} \\left( \\frac{1}{\\overline {IDM}_{i,j}} \\right) \\tag{2}",
    weightedInformationSum: "SWI'_i = \\sum_{j=1}^{n} w_j \\, I_{i,j} \\tag{3}",
    ranking: "\\text{Rank}(A_i) \\uparrow \; \\text{as} \; SWI'_i \\downarrow"
  };

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto text-justify font-[Century_Gothic] leading-relaxed">
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

      <p className="text-center mb-4">{`$$ ${latex.IDM} $$`}</p>
      <p className="mb-4">
        where \( i = 1, 2, \dots, m \) represents the alternatives and \( j = 1, 2, \dots, n \)
        represents the criteria.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;II. Normalization</h2>
      <p className="mb-2">For each criterion \( C_j \), normalize the values as follows:</p>

      <ul className="list-disc ml-6 mb-4">
        <li>
          For benefit (desirable) criteria:
          <p className="text-center my-2">{`$$ ${latex.normalizationBenefit} $$`}</p>
        </li>
        <li>
          For cost (undesirable) criteria:
          <p className="text-center my-2">{`$$ ${latex.normalizationCost} $$`}</p>
        </li>
      </ul>

      <p className="mb-4 text-center">
        {`$$ \\sum_{j=1}^{n} \\overline {IDM}_{i,j} = 1 $$`}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;III. Information Measure</h2>
      <p className="mb-4">
        The information score for each attributes is calculated as:
      </p>
      <p className="text-center mb-4">{`$$ ${latex.informationEntropy} $$`}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;IV. Sum Weighted Information </h2>
      <p className="mb-4">
        {`Assign a weight \\( w_{j} \\) to each criterion, where \\( i = 1, 2, ...., m \\) represents the alternatives and \\( j = 1, 2, ...., n \\)
        represents the criteria. The Sum Weighted Information for each alternative \\( A_i \\) is:`}
      </p>

      <p className="text-center mb-4">
        {`$$ ${latex.weightedInformationSum} $$`}</p>

      {/* <p className="text-center mb-4">
        {`$$ SWI'_i = \sum_{j=1}^{n} w_j \, \log_{2} \left( \frac{1}{IDM'_{i,j}} \right) $$`}
      </p> */}

      <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;V. Ranking of Alternatives</h2>
      <p className="mb-4">
        The alternatives are ranked in ascending order of their \( SWI'_i \) values:
      </p>
      <p className="text-center mb-4">
        {`$$ ${latex.ranking} $$`}
      </p>

      <p className="text-gray-700 mt-6 italic">
        A smaller SWI score indicates a better (more desirable) alternative.
      </p>
      <div className="mt-4 text-xs text-gray-500">
        Source: SWI formulation (information-theoretic normalization & sum weighted aggregation). <a className="text-blue-500 underline font-bold" target="_blank" href=" https://doi.org/10.1111/itor.13609"> (Article by Dr Pankaj Prasad Dwivedi et al. 2025)</a>
      </div>
    </div>
  );
}
