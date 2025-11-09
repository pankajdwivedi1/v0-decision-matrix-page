import { useEffect } from 'react';

export const useMathJax = () => {
  const loadMathJax = () => {
    if (window.MathJax) {
      window.MathJax.typeset();
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      loadMathJax();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return { loadMathJax };
};
