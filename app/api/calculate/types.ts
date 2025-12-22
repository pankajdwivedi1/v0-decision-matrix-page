export interface Criterion {
  id: string
  name: string
  weight: number
  type: "beneficial" | "non-beneficial"
}

export interface Alternative {
  id: string
  name: string
  scores: Record<string, number>
}

export interface CalculationRequest {
  method:
  | "swei"
  | "swi"
  | "topsis"
  | "vikor"
  | "waspas"
  | "edas"
  | "moora"
  | "multimoora"
  | "todim"
  | "codas"
  | "moosra"
  | "mairca"
  | "marcos"
  | "cocoso"
  | "copras"
  | "promethee"
  | "promethee1"
  | "promethee2"
  | "ahp"
  | "electre"
  | "electre1"
  | "electre2"
  | "entropy"
  | "mabac"
  | "gra"
  | "aras"
  alternatives: Alternative[]
  criteria: Criterion[]
  vikorVValue?: number
  waspasLambdaValue?: number
  codasTauValue?: number
}

export interface CalculationResponse {
  method: string
  results: Record<string, number>
  ranking: Array<{
    rank: number
    alternativeId: string
    alternativeName: string
    score: number
    percentage: string
  }>
  bestAlternative: {
    id: string
    name: string
    score: number
  }
  metrics?: Record<string, any>
}

export interface RankingWeightResult {
  weights: Record<string, number>
  ranks: Record<string, number>
}

export interface ROCResult extends RankingWeightResult { }
export interface RRResult extends RankingWeightResult { }
