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
  alternatives: Alternative[]
  criteria: Criterion[]
  vikorVValue?: number
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
