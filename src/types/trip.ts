export type ActivityType = "sightseeing" | "hiking" | "food" | "meetup" | "custom";

export interface LocationStop {
    lat: number;
    lng: number;
    name?: string;
    activities?: ActivityType[];
    time?: {
        arrival?: string;
        departure?: string;
    };
    expenses?: {
        entry?: number;
        food?: number;
        travel?: number;
        other?: number;
    };
}

export type TravelMode = "car" | "motorbike" | "bicycle" | "walk";

export interface Trip {
    id: string;
    ownerId: string;
    title: string;
    description?: string;
    locations: LocationStop[];
    mode: TravelMode;
}
