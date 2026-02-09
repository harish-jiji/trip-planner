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
    custom: {
        label: "Activity",
        icon: "⭐",
    },
};
