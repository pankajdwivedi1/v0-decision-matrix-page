"use client"
import { useEffect } from "react"
import "mathjax/es5/tex-mml-chtml.js"

export default function SWEIFormula() {
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise()
    }
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto text-justify font-[Century_Gothic] leading-relaxed">
      <h1 className="text-2xl font-bold text-center mb-6">
        SWEI (Sum Weighted Exponential Information) Method
      </h1>

      <p className="mb-4">
        The SWEI method is a multi-criteria decision-making (MCDM) approach based on information
        entropy. It evaluates alternatives by transforming performance data into weighted
        information measures. The procedure is as follows:
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;I. Decision Matrix Construction</h2>
      <p className="mb-4">
        Let the information decision matrix (IDM) be:
      </p>

      <p className="text-center mb-4">{"$$ IDM = [a_{ij}]_{m \\times n} $$"}</p>
      <p className="mb-4">
        where \( i = 1, 2, \dots, m \) represents the alternatives and \( j = 1, 2, \dots, n \)
        represents the criteria.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;II. Normalization</h2>
      <p className="mb-2">For each criterion \( C_j \), normalize the values as follows:</p>

      <ul className="list-disc ml-6 mb-4">
        <li>
          For benefit (desirable) criteria:
          <p className="text-center my-2">{"$$ IDM'_{ij} = \\frac{a_{ij}}{\\sum_{i=1}^{m} a_{ij}} \\tag{1a} $$"}</p>
        </li>
        <li>
          For cost (undesirable) criteria:
          <p className="text-center my-2">{"$$ IDM'_{ij} = \\frac{1 / a_{ij}}{\\sum_{i=1}^{m} (1 / a_{ij})} \\tag{1b} $$"}</p>
        </li>
      </ul>

      <p className="mb-4 text-center">
        {"$$ \\sum_{i=1}^{m} IDM'_{ij} = 1 $$"}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;III. Information Measure</h2>
      <p className="mb-4">
        The information entropy for each element is calculated as:
      </p>
      <p className="text-center mb-4">{"$$ I_{ij} = \\log_{2} \\left( \\frac{1}{IDM'_{ij}} \\right) \\tag{2} $$"}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;IV. Weighted Information Sum</h2>
      <p className="mb-4">
        Assign a weight \( w_j \) to each criterion, where \( \\sum_{j=1}^{n} w_j = 1 \).
        The Sum Weighted Information for each alternative \( A_i \) is:
      </p>

      <p className="text-center mb-4">
        {"$$ SWI_i = \\sum_{j=1}^{n} w_j \\, I_{ij} \\tag{3} $$"}
      </p>

      <p className="text-center mb-4">
        {"$$ SWI_i = \\sum_{j=1}^{n} w_j \\, \\log_{2} \\left( \\frac{1}{IDM'_{ij}} \\right) $$"}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Step&nbsp;V. Ranking of Alternatives</h2>
      <p className="mb-4">
        The alternatives are ranked in ascending order of their \( SWI_i \) values:
      </p>
      <p className="text-center mb-4">
        {"$$ \\text{Rank}(A_i) \\uparrow \\; \\text{as} \\; SWI_i \\downarrow $$"}
      </p>

      <p className="text-gray-700 mt-6 italic">
        A smaller SWEI score indicates a better (more desirable) alternative.
      </p>
    </div>
  )
}
