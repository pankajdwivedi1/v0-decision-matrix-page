import { Criterion } from "./types";

export function calculateEqual(criteria: Criterion[]) {
    const n = criteria.length;
    const weight = 1 / n;
    const weights: Record<string, number> = {};

    criteria.forEach(crit => {
        weights[crit.id] = weight;
    });

    return { weights };
}
