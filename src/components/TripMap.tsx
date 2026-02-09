"use client";

import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { reverseGeocode } from "@/lib/reverseGeocode";

type Location = {
    lat: number;
    lng: number;
    name?: string; // Add name support to component types
};

type Props = {
    locations: Location[];
    setLocations?: (locs: Location[]) => void;
    route: [number, number][];
};

function MapClickHandler({ setLocations, locations }: { setLocations?: (l: Location[]) => void, locations: Location[] }) {
    // Only enable click if setter is provided (Edit Mode)
    if (!setLocations) return null;

    useMapEvents({
        async click(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            const name = await reverseGeocode(lat, lng);

            setLocations([...locations, {
                lat,
                lng,
                name, // 🔥 AUTO NAME
            }]);
        },
    });
    return null;
}

export default function TripMap({ locations, setLocations, route }: Props) {
    return (
        <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "400px", width: "100%", borderRadius: "0.5rem", zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler setLocations={setLocations} locations={locations} />

            {locations.map((loc, idx) => (
                <Marker key={idx} position={[loc.lat, loc.lng]}>
                    <Popup>
                        <strong>{loc.name || "Unnamed stop"}</strong>
                    </Popup>
                </Marker>
            ))}

            {route.length > 0 && <Polyline positions={route} color="#3b82f6" weight={4} />}
        </MapContainer>
    );
}
