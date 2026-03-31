export const journalQuartiles: Record<string, string> = {
    "Renewable and Sustainable Energy Reviews": "Q1",
    "Applied Energy": "Q1",
    "Energy Policy": "Q2",
    "Nature": "Q1",
    "Science": "Q1",
    "Journal of Cleaner Production": "Q1",
    "Expert Systems with Applications": "Q1",
    "Decision Support Systems": "Q1",
    "Energy": "Q1",
    "Computers & Operations Research": "Q1",
    "European Journal of Operational Research": "Q1",
    "Symmetry": "Q2",
    "Sustainability": "Q2",
    "Applied Soft Computing": "Q1",
    "Knowledge-Based Systems": "Q1",
    "IEEE Transactions on Fuzzy Systems": "Q1",
    "Technological Forecasting and Social Change": "Q1",
    "International Journal of Production Economics": "Q1",
    "Journal of Intelligent & Fuzzy Systems": "Q2",
    "Mathematical Problems in Engineering": "Q3",
    "Complexity": "Q2",
    "Information Sciences": "Q1",
    "Advanced Engineering Informatics": "Q1",
    "Systems": "Q2",
    "Algorithms": "Q2",
};

export function getQuartile(journalName: string): string | null {
    if (!journalName) return null;
    const normalized = journalName.toLowerCase().trim();
    for (const [name, q] of Object.entries(journalQuartiles)) {
        if (normalized.includes(name.toLowerCase())) return q;
    }
    return null;
}
