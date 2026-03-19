"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { reverseGeocode } from "@/lib/reverseGeocode";
import { ActivityType } from "@/types/trip";
import { renderToString } from "react-dom/server";
import { 
    Utensils, 
    Camera, 
    ShoppingBag, 
    Hotel, 
    Map as MapIcon 
} from "lucide-react";

type Location = {
    lat: number;
    lng: number;
    name?: string;
    activities?: ActivityType[];
};

type Props = {
    locations: Location[];
    setLocations?: (locs: Location[]) => void;
    route: [number, number][]; // [lat, lng] array
    className?: string;
    selectedPosition?: [number, number] | null; 
};

/**
 * Creates a Leaflet divIcon using Lucide icons natively matched to activities
 */
const createLucideIcon = (activities?: ActivityType[]) => {
    let IconComponent = MapIcon;
    if (activities?.includes("food")) IconComponent = Utensils;
    else if (activities?.includes("sightseeing")) IconComponent = Camera;
    else if (activities?.includes("rest_stop")) IconComponent = Hotel;
    else if (activities?.includes("custom")) IconComponent = ShoppingBag;

    const iconHtml = renderToString(
        <div className="bg-blue-600 text-white p-2 text-center rounded-full shadow-lg border-2 border-white transform hover:scale-110 transition-transform flex items-center justify-center w-10 h-10">
            <IconComponent size={20} />
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: "", // Clear default leaflet styling
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};

function MapClickHandler({ setLocations, locations }: { setLocations?: (l: Location[]) => void, locations: Location[] }) {
    if (!setLocations) return null;

    useMapEvents({
        async click(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            const name = await reverseGeocode(lat, lng);

            setLocations([...locations, {
                lat,
                lng,
                name,
            }]);
        },
    });
    return null;
}

const FlyToLocation = ({ position }: { position?: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 13);
        }
    }, [position, map]);
    return null;
};

const FitBounds = ({ locations }: { locations: Location[] }) => {
    const map = useMap();
    useEffect(() => {
        if (locations.length < 2) return;
        const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
    }, [locations, map]);
    return null;
};

const RouteDrawer = ({ stops }: { stops: Location[] }) => {
    const map = useMap();
    const routingRef = useRef<any>(null);

    useEffect(() => {
        if (!map || stops.length < 2) return;
        
        // Remove old route properly
        if (routingRef.current) {
            try {
                routingRef.current.getPlan().setWaypoints([]);
                map.removeControl(routingRef.current);
            } catch (e) {
                console.log("Routing already removed");
            }
        }
        
        const routingOptions: any = {
            waypoints: stops.map(s => L.latLng(s.lat, s.lng)),
            router: L.Routing.osrmv1({ profile: 'driving' }),
            lineOptions: {
                styles: [{ color: "#3b82f6", weight: 5 }],
                extendToWaypoints: true,
                missingRouteTolerance: 10
            },
            show: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: false,
            routeWhileDragging: false,
            createMarker: () => null
        };
        
        const routing = L.Routing.control(routingOptions).addTo(map);
        routingRef.current = routing;

        return () => {
            if (map && routingRef.current) {
                try {
                    routingRef.current.getPlan().setWaypoints([]);
                    map.removeControl(routingRef.current);
                } catch (e) {
                    console.log("Routing already removed on unmount");
                }
            }
        };
    }, [stops, map]);
    return null;
};

export default function TripMap({ locations, setLocations, route, className = "h-[400px] w-full", selectedPosition }: Props) {
    return (
        <MapContainer
            center={locations.length > 0 ? [locations[0].lat, locations[0].lng] : [20.5937, 78.9629]}
            zoom={locations.length > 0 ? 12 : 5}
            // Use className for sizing, style only for zIndex if needed
            className={`${className} z-0 rounded-lg`}
            style={{ zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler setLocations={setLocations} locations={locations} />

            <FlyToLocation position={selectedPosition} />
            <FitBounds locations={locations} />

            {locations.map((loc, idx) => (
                <Marker key={idx} position={[loc.lat, loc.lng]} icon={createLucideIcon(loc.activities)}>
                    <Popup>
                        <strong>{loc.name || "Unnamed stop"}</strong>
                    </Popup>
                </Marker>
            ))}

            <RouteDrawer stops={locations} />
        </MapContainer>
    );
}
