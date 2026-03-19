export type ActivityType = "sightseeing" | "hiking" | "food" | "meetup" | "rest_stop" | "destination" | "starting_point" | "splitting_point" | "custom";

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
    link?: string;
    showLinkInput?: boolean;
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
