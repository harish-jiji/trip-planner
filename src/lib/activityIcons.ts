import type { ReactNode } from "react";

export const ACTIVITY_META: Record<
    string,
    { label: string; icon: string }
> = {
    sightseeing: {
        label: "Sightseeing",
        icon: "🏞",
    },
    hiking: {
        label: "Trekking",
        icon: "🏔️",
    },
    food: {
        label: "Food",
        icon: "🍴",
    },
    meetup: {
        label: "Meetup",
        icon: "👥",
    },
    rest_stop: {
        label: "Rest Stop",
        icon: "☕",
    },
    destination: {
        label: "Destination",
        icon: "🏁",
    },
    starting_point: {
        label: "Starting Point",
        icon: "🏠",
    },
    splitting_point: {
        label: "Splitting Point",
        icon: "🔀",
    },
    custom: {
        label: "Activity",
        icon: "⭐",
    },
};
