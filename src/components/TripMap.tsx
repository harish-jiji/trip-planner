"use client";

import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "@/lib/leafletIcon";
// We need to ensure the icon fix runs, but usually it's better done once globally or via a component.
// Since we created LeafletIconFix.tsx separately, let's use it or just embed the fix if needed. 
// However, the instructions suggested a src/lib/leafletIcon.ts approach, but I made a component. 
// Let's import the component and use it inside the map or layout. 
// Actually, for simplicity based on the prompt's instruction "Create this file: src/lib/leafletIcon.ts", I should have done that.
// But I made a component. Let's just put the fix inside this component's effect or import the lib file if I create it.
// The prompt said "created src/lib/leafletIcon.ts". Let me stick to that pattern for the "import '@/lib/leafletIcon';" line in the prompt's Step 4.
// Wait, I created a component `src/components/LeafletIconFix.tsx` in the previous step. 
// I should probably just use that or do the import side-effect style.
// Let's stick to the prompt's requested `src/lib/leafletIcon.ts` for strictly following instructions, 
// OR simpler: just put the fix code at the top of this file or in a useEffect.
// The prompted code for TripMap.tsx has `import "@/lib/leafletIcon";`.
// So I will create that file first to match the import.

type Location = {
    lat: number;
    lng: number;
};

type Props = {
    locations: Location[];
    setLocations: (locs: Location[]) => void;
    route: [number, number][];
};

function MapClickHandler({ setLocations, locations }: { setLocations: (l: Location[]) => void, locations: Location[] }) {
    useMapEvents({
        click(e) {
            setLocations([...locations, { lat: e.latlng.lat, lng: e.latlng.lng }]);
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
                <Marker key={idx} position={[loc.lat, loc.lng]} />
            ))}

            {route.length > 0 && <Polyline positions={route} color="#3b82f6" weight={4} />}
        </MapContainer>
    );
}
