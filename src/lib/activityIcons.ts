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
        label: "Hiking",
        icon: "🥾",
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
    custom: {
        label: "Activity",
        icon: "⭐",
    },
};
