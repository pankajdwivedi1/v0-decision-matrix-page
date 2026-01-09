import { MCDMMethod, WeightMethod } from "@/types/mcdm"

export const MCDM_METHODS: { value: MCDMMethod; label: string; description: string; formula: string }[] = [
    {
        value: "swei",
        label: "SWEI",
        description: "Sum Weighted Exponential Information",
        formula: "Score = Σ(log₂(1/IDM)^Weight)"
    },
    {
        value: "swi",
        label: "SWI",
        description: "Sum Weighted Information",
        formula: "Score = Σ(Normalized Score × Weight)"
    },
    {
        value: "topsis",
        label: "TOPSIS",
        description: "Technique for Order Preference by Similarity to Ideal Solution",
        formula: "Score = D⁻ / (D⁺ + D⁻)"
    },
    {
        value: "vikor",
        label: "VIKOR",
        description: "VlseKriterijumska Optimizacija I Kompromisno Resenje",
        formula: "Q = v(S-S*)/(S⁻-S*) + (1-v)(R-R*)/(R⁻-R*)"
    },
    {
        value: "waspas",
        label: "WASPAS",
        description: "Weighted Aggregated Sum Product Assessment",
        formula: "Q = λ × WSM + (1-λ) × WPM"
    },
    {
        value: "edas",
        label: "EDAS",
        description: "Evaluation based on Distance from Average Solution",
        formula: "AS = (PDA + NDA) / 2"
    },
    {
        value: "moora",
        label: "MOORA",
        description: "Multi-Objective Optimization by Ratio Analysis",
        formula: "y = Σ(beneficial) - Σ(non-beneficial)"
    },
    {
        value: "multimoora",
        label: "MULTIMOORA",
        description: "Multi-Objective Optimization by Ratio Analysis plus Full Multiplicative Form",
        formula: "Score = (Rank_RS + Rank_RP + Rank_FMF) / 3"
    },
    {
        value: "todim",
        label: "TODIM",
        description: "Tomada de Decisão Interativa e Multicritério (Interactive and Multicriteria Decision Making)",
        formula: "ξ_i^norm = (ξ_i - ξ_min) / (ξ_max - ξ_min)"
    },
    {
        value: "codas",
        label: "CODAS",
        description: "Combinative Distance-based Assessment",
        formula: "RA_i = d_i^E + τ × d_i^T"
    },
    {
        value: "moosra",
        label: "MOOSRA",
        description: "Multi-Objective Optimization on the basis of Simple Ratio Analysis",
        formula: "v_i = S_i^+ / S_i^-"
    },
    {
        value: "mairca",
        label: "MAIRCA",
        description: "Multi-Attributive Ideal-Real Comparative Analysis",
        formula: "G_p = Σ(T_pj - R_pj)"
    },
    {
        value: "mabac",
        label: "MABAC",
        description: "Multi-Attributive Border Approximation Area Comparison",
        formula: "S_i = Σ(v_ij - g_j)"
    },
    {
        value: "marcos",
        label: "MARCOS",
        description: "Measurement of Alternatives and Ranking according to Compromise Solution",
        formula: "f(K_i) = K_i^+ / (K_i^+ + K_i^-)"
    },
    {
        value: "cocoso",
        label: "COCOSO",
        description: "Combined Compromise Solution",
        formula: "Score = (kₐ × S + kb × P + kc × (S×P)/(S+P))"
    },
    {
        value: "copras",
        label: "COPRAS",
        description: "Complex Proportional Assessment",
        formula: "Q = S⁺ + adjusted S⁻ term"
    },
    {
        value: "promethee",
        label: "PROMETHEE",
        description: "Preference Ranking Organization Method for Enrichment Evaluations",
        formula: "φ = φ⁺ - φ⁻"
    },
    {
        value: "promethee1",
        label: "PROMETHEE I",
        description: "Preference Ranking Organization Method (Partial Preorder)",
        formula: "Score = Outranked - OutrankedBy (based on φ⁺ and φ⁻)"
    },
    {
        value: "promethee2",
        label: "PROMETHEE II",
        description: "Preference Ranking Organization Method (Complete Ranking)",
        formula: "φ = φ⁺ - φ⁻"
    },
    {
        value: "electre",
        label: "ELECTRE",
        description: "ÉLimination Et Choix Traduisant la REalité",
        formula: "Score = Outranked - OutrankedBy"
    },
    {
        value: "electre1",
        label: "ELECTRE I",
        description: "ÉLimination Et Choix Traduisant la REalité (Basic Outranking)",
        formula: "Score = Outranked - OutrankedBy"
    },
    {
        value: "electre2",
        label: "ELECTRE II",
        description: "ÉLimination Et Choix Traduisant la REalité (Complete Ranking)",
        formula: "Score = Strong Outranked - Strong OutrankedBy"
    },
    {
        value: "gra",
        label: "GRA",
        description: "Grey Relational Analysis",
        formula: "γ_i = Σ(w_j × ξ_ij)"
    },
    {
        value: "aras",
        label: "ARAS",
        description: "Additive Ratio Assessment",
        formula: "K_i = S_i / S_0"
    },
    {
        value: "wsm",
        label: "WSM",
        description: "Weighted Sum Model",
        formula: "Score = Σ(w_j × r_ij)"
    },
    {
        value: "wpm",
        label: "WPM",
        description: "Weighted Product Model",
        formula: "Score = Π(r_ij ^ w_j)"
    },
]

export const WEIGHT_METHODS: { value: WeightMethod; label: string; description: string }[] = [
    {
        value: "equal",
        label: "Equal Weight",
        description: "Assigns equal weight to all criteria.",
    },
    {
        value: "entropy",
        label: "Entropy Weight",
        description: "Entropy-based objective weighting method that calculates weights based on information content in the decision matrix.",
    },
    {
        value: "critic",
        label: "CRITIC Weight",
        description: "CRITIC (Criteria Importance Through Intercriteria Correlation) method that determines weights based on contrast intensity and conflict between criteria.",
    },
    {
        value: "ahp",
        label: "AHP Weight",
        description: "Analytic Hierarchy Process (AHP) derives weights from a pairwise comparison matrix; here derived from provided priority scores.",
    },
    {
        value: "piprecia",
        label: "PIPRECIA Weight",
        description: "Pivot Pairwise Relative Criteria Importance Assessment (PIPRECIA) determines weights based on subjective relative importance of criteria.",
    },
    {
        value: "merec",
        label: "MEREC Weight",
        description: "Method based on the Removal Effects of Criteria (MEREC) determines objective weights by analyzing the effect of removing each criterion.",
    },
    {
        value: "swara",
        label: "SWARA Weight",
        description: "Step-wise Weight Assessment Ratio Analysis (SWARA) determines weights based on expert assessment of relative importance differences between criteria.",
    },
    {
        value: "wenslo",
        label: "WENSLO Weight",
        description: "WENSLO weight method determines weights based on objective calculation similar to Entropy and MEREC.",
    },
    {
        value: "lopcow",
        label: "LOPCOW Weight",
        description: "LOPCOW (Logarithmic Percentage Change-driven Objective Weighting) method determines weights using the magnitude of data variability.",
    },
    {
        value: "dematel",
        label: "DEMATEL Weight",
        description: "DEMATEL (Decision Making Trial and Evaluation Laboratory) visualizes the structure of complex causal relationships between criteria.",
    },
    {
        value: "sd",
        label: "SD Weight",
        description: "Standard Deviation (SD) method assigns weights based on the dispersion of criteria values in the normalized matrix.",
    },
    {
        value: "variance",
        label: "Variance Weight",
        description: "Variance method determines weights based on the statistical variance of criteria values.",
    },
    {
        value: "mad",
        label: "MAD Weight",
        description: "Mean Absolute Deviation (MAD) method calculates weights using the average absolute deviation from the mean.",
    },

    {
        value: "dbw",
        label: "Distance-based Weight",
        description: "Distance-based Weighting (DBW) method calculates weights based on the pair-wise distances between alternatives for each criterion.",
    },
    {
        value: "svp",
        label: "SVP Weight",
        description: "Statistical Variance Procedure (SVP) uses variance on Min-Max normalized data to determine objective weights.",
    },
    {
        value: "mdm",
        label: "MDM Weight",
        description: "Maximizing Deviation Method (MDM) assigns higher weights to criteria with greater deviation between alternatives.",
    },
    {
        value: "lsw",
        label: "LSW Weight",
        description: "Least Squares Weighting Method (LSW) determines weights based on squared deviations from the ideal solution.",
    },
    {
        value: "gpow",
        label: "GPOW Weight",
        description: "Goal Programming–based Objective Weights (GPOW) method determines weights by minimizing total absolute deviation from the ideal goal.",
    },
    {
        value: "lpwm",
        label: "LPWM Weight",
        description: "Linear Programming Weight Method (LPWM) determines weights based on cumulative absolute deviation from the anti-ideal solution.",
    },
    {
        value: "pcwm",
        label: "PCWM Weight",
        description: "Pearson Correlation Weight Method (PCWM) Determines weights based on the degree of independence and conflict (correlation) between criteria.",
    },
    {
        value: "roc",
        label: "ROC Weight",
        description: "Rank Order Centroid (ROC) method calculates weights based on a pre-defined rank order of criteria (Barron & Barrett, 1996).",
    },
    {
        value: "rr",
        label: "RR Weight",
        description: "Rank Reciprocal (RR) method assigns weights based on the reciprocal of criteria ranks (Stillwell et al., 1981).",
    },
    {
        value: "custom",
        label: "Enter Own Weight",
        description: "Manually specify custom weights for each criterion based on your own judgment or external analysis.",
    },
]

export const CHART_COLORS = [
    "#2563eb",
    "#db2777",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#0ea5e9",
    "#6366f1",
    "#14b8a6",
    "#f97316",
]
