
import { Alternative } from "@/types/mcdm";
import { LINGUISTIC_SCALES } from "@/constants/fuzzy";

export const getProcessedAlternatives = (
  alternatives: Alternative[],
  fuzzyScaleType: 5 | 7 | 9 | 11,
  customScales: any,
  targetMethod?: string
) => {
  const currentScale = customScales[fuzzyScaleType];
  return alternatives.map(alt => {
    const processedScores: Record<string, any> = {};
    Object.entries(alt.scores).forEach(([critId, value]) => {
      // 1. Check if it's already a fuzzy triplet object
      if (typeof value === 'object' && value !== null && 'l' in value && 'm' in value && 'u' in value) {
        const isFuzzyMethod = targetMethod?.toLowerCase().startsWith("fuzzy") || false;
        if (isFuzzyMethod) {
          processedScores[critId] = value;
        } else {
          // Defuzzify using Chen's method for non-fuzzy methods
          const fn = value as any;
          processedScores[critId] = (fn.l + 4 * fn.m + fn.u) / 6;
        }
        return;
      }

      const linguisticItem = currentScale?.find((s: any) => s.value === value);
      if (linguisticItem) {
        // If it's a fuzzy method, send the triplet object
        // For standard methods in Fuzzy Mode, compute the accurate crisp equivalent via Chen's method (l + 4m + u)/6
        const isFuzzyMethod = targetMethod?.toLowerCase().startsWith("fuzzy") || false;
        const defuzzed = (linguisticItem.triplet.l + 4 * linguisticItem.triplet.m + linguisticItem.triplet.u) / 6;
        processedScores[critId] = isFuzzyMethod ? linguisticItem.triplet : defuzzed;
      } else {
        const numValue = Number(value);
        if (!isNaN(numValue) && value !== "" && value !== null) {
          const isFuzzyMethod = targetMethod?.toLowerCase().startsWith("fuzzy") || false;
          if (isFuzzyMethod) {
            let spread = 10;
            if (typeof window !== 'undefined') {
              const savedSpread = localStorage.getItem('fuzzy_crisp_spread');
              if (savedSpread) spread = parseFloat(savedSpread);
            }
            const spreadDecimal = spread / 100;
            processedScores[critId] = {
              l: numValue * (1 - spreadDecimal),
              m: numValue,
              u: numValue * (1 + spreadDecimal)
            };
          } else {
            processedScores[critId] = numValue;
          }
        } else {
          processedScores[critId] = value;
        }
      }
    });
    return { ...alt, scores: processedScores };
  });
};

export const formatDecisionMatrixValue = (
  value: any,
  isFuzzyMode: boolean,
  fuzzyScaleType: number,
  customScales: any
) => {
  if (value === undefined || value === "") return "-";
  
  if (isFuzzyMode) {
    const item = customScales[fuzzyScaleType]?.find((s: any) => s.value === value);
    if (item) {
      return `(${item.triplet.l}, ${item.triplet.m}, ${item.triplet.u})`;
    }
  }
  
  const num = Number(value);
  return isNaN(num) ? value : num.toString();
};
