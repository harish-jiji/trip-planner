import L from "leaflet";
import { ACTIVITY_META } from "@/lib/activityIcons";

export const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

export const createActivityIcon = (activities?: string[]) => {
    if (!activities || activities.length === 0) {
        return defaultIcon;
    }

    const htmlIcons = activities
        .map((a) => (ACTIVITY_META[a] ? ACTIVITY_META[a].icon : "📍"))
        .join("");

    return L.divIcon({
        html: `<div class="activity-marker">${htmlIcons}</div>`,
        className: "", // important to clear default leaflet styling that adds white background/borders
        iconSize: [40, 40],
        iconAnchor: [20, 40], // Bottom center anchor for map markers
    });
};
