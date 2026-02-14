import type { LocationStop } from "@/types/trip";

export type CostSummary = {
    entry: number;
    food: number;
    travel: number;
    other: number;
    total: number;
};

export function calculateTripCost(locations: LocationStop[]): CostSummary {
    return locations.reduce(
        (acc, loc) => {
            if (!loc.expenses) return acc;

            const entry = Number(loc.expenses.entry || 0);
            const food = Number(loc.expenses.food || 0);
            const travel = Number(loc.expenses.travel || 0);
            const other = Number(loc.expenses.other || 0);

            acc.entry += entry;
            acc.food += food;
            acc.travel += travel;
            acc.other += other;
            acc.total += entry + food + travel + other;

            return acc;
        },
        { entry: 0, food: 0, travel: 0, other: 0, total: 0 } as CostSummary
    );
}
