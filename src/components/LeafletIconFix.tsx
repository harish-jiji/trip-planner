"use client";

import L from "leaflet";
import { useEffect } from "react";

const LeafletIconFix = () => {
    useEffect(() => {
        // Fix Leaflet icon issue in React
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;

        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
    }, []);

    return null;
};

export default LeafletIconFix;
