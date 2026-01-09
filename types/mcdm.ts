export interface Criterion {
    id: string
    name: string
    weight: number
    type: "beneficial" | "non-beneficial"
}

export interface Alternative {
    id: string
    name: string
    scores: Record<string, number | "">
}

export type MCDMMethod = "wsm" | "wpm" | "swei" | "swi" | "topsis" | "vikor" | "waspas" | "edas" | "moora" | "multimoora" | "todim" | "codas" | "moosra" | "mairca" | "marcos" | "cocoso" | "copras" | "promethee" | "promethee1" | "promethee2" | "electre" | "electre1" | "electre2" | "mabac" | "gra" | "aras"

export type WeightMethod = "equal" | "entropy" | "critic" | "ahp" | "piprecia" | "merec" | "swara" | "wenslo"
    | "lopcow"
    | "dematel"
    | "sd"
    | "variance"
    | "mad"
    | "dbw"
    | "svp"
    | "mdm"
    | "lsw"
    | "gpow"
    | "lpwm"
    | "pcwm"
    | "roc"
    | "rr"
    | "custom"

export type PageStep = "home" | "input" | "table" | "matrix" | "calculate"

export interface ComparisonResult {
    method: MCDMMethod
    label: string
    ranking: { alternativeName: string; rank: number; score: number | string }[]
}

export interface PipreciaResult {
    weights: Record<string, number>
    s_values: Record<string, number>
    k_values: Record<string, number>
    q_values: Record<string, number>
}

export interface EntropyResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    entropyValues: Record<string, number>
    diversityValues: Record<string, number>
    entropyMatrix: Record<string, Record<string, number>>
}

export interface SensitivityRankingItem {
    alternativeName: string;
    rank: number;
    score: number | string;
}

export interface SensitivityResult {
    weight: number;
    weightLabel: string;
    ranking: SensitivityRankingItem[];
}

export interface CriticResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    standardDeviations: Record<string, number>
    correlationMatrix: Record<string, Record<string, number>>
    informationAmounts: Record<string, number>
}

export interface AHPResult {
    weights: Record<string, number>
    pairwiseMatrix: number[][]
    normalizedMatrix: number[][]
    lambdaMax: number
    consistencyIndex: number
    consistencyRatio: number
}

export interface MERECResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    performanceScores: Record<string, number>
    removalScores: Record<string, Record<string, number>>
    removalEffects: Record<string, number>
}

export interface SWARAResult {
    weights: Record<string, number>
    stepFactors: Record<string, number>
    preliminaryWeights: Record<string, number>
    coefficients: Record<string, number>
}

export interface WensloResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    wensloValues: Record<string, number>
    diversityValues: Record<string, number>
}

export interface LopcowResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    geometricMeans: Record<string, number>
    logPercentages: Record<string, number>
}

export interface DematelResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    directRelationMatrix: Record<string, Record<string, number>>
    totalRelationMatrix: Record<string, Record<string, number>>
    dValues: Record<string, number>
    rValues: Record<string, number>
    pValues: Record<string, number>
    eValues: Record<string, number>
}

export interface SDResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    sigmaValues: Record<string, number>
}

export interface VarianceResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    varianceValues: Record<string, number>
}

export interface MADResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    madValues: Record<string, number>
}

export interface DBWResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    distanceValues: Record<string, number>
}

export interface SVPResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    varianceValues: Record<string, number>
}

export interface MDMResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    deviationValues: Record<string, number>
}

export interface LSWResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    leastSquaresValues: Record<string, number>
    idealSolution: Record<string, number>
}

export interface GPOWResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    goalDeviationValues: Record<string, number>
    goalValues: Record<string, number>
}

export interface LPWMResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    lowerDeviationValues: Record<string, number>
    antiIdealValues: Record<string, number>
}

export interface PCWMResult {
    weights: Record<string, number>
    normalizedMatrix: Record<string, Record<string, number>>
    correlationMatrix: Record<string, Record<string, number>>
    independenceMeasures: Record<string, number>
}

export interface RankingWeightResult {
    weights: Record<string, number>
    ranks: Record<string, number>
}

export interface ROCResult extends RankingWeightResult { }
export interface RRResult extends RankingWeightResult { }
