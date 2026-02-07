"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

const TripMap = dynamic(() => import("@/components/TripMap"), {
    ssr: false,
});

// Define type strictly
type TravelMode = "car" | "motorbike" | "bicycle" | "walk";

export default function EditTripPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // START OF DAY 5 CHANGES
    const [locations, setLocations] = useState<{ lat: number; lng: number }[]>([]);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [mode, setMode] = useState<TravelMode>("car"); // Strict type
    const [distance, setDistance] = useState("0");
    const [duration, setDuration] = useState("0");
    const routeRequestId = useRef(0); // Guard for async race conditions
    // END OF DAY 5 CHANGES

    const fetchRoute = async (locations: any[], mode: TravelMode) => { // Use TravelMode type
        if (locations.length < 2) return null;

        const coords = locations
            .map((l) => `${l.lng},${l.lat}`)
            .join(";");

        let profile: "car" | "bike" | "foot";

        if (mode === "walk") profile = "foot";
        else if (mode === "bicycle") profile = "bike";
        else profile = "car"; // car & motorbike

        // 🔴 DEBUG LOG
        console.log("ROUTING MODE:", mode, "→ OSRM PROFILE:", profile);

        try {
            const res = await fetch(
                `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson`
            );
            const data = await res.json();

            if (!data.routes || data.routes.length === 0) return null;

            const distanceKm = data.routes[0].distance / 1000;

            const SPEED_KMPH = {
                car: 50,
                motorbike: 45,
                bicycle: 15,
                walk: 5,
            };

            const durationMin = Math.round(
                (distanceKm / SPEED_KMPH[mode]) * 60
            );

            return {
                distanceKm: distanceKm.toFixed(2),
                durationMin,
                geometry: data.routes[0].geometry.coordinates.map(
                    ([lng, lat]: number[]) => [lat, lng]
                ),
            };
        } catch (e) {
            console.error("Routing error", e);
            return null;
        }
    };

    useEffect(() => {
        const loadRoute = async () => {
            // Clear route if less than 2 points
            if (locations.length < 2) {
                setRoute([]);
                setDistance("0");
                setDuration("0");
                return;
            }

            const currentRequestId = ++routeRequestId.current;

            const result = await fetchRoute(locations, mode);
            if (!result) return;

            // ❗ Ignore outdated responses
            if (currentRequestId !== routeRequestId.current) return;

            setRoute(result.geometry);
            setDistance(result.distanceKm);
            setDuration(result.durationMin.toString());
        };

        loadRoute();
    }, [locations, mode]);

    useEffect(() => {
        const fetchTrip = async () => {
            const ref = doc(db, "trips", id as string);
            const snap = await getDoc(ref);

            if (!snap.exists()) return;
            if (snap.data().ownerId !== user?.uid) {
                router.push("/dashboard");
                return;
            }

            setTitle(snap.data().title);
            setDescription(snap.data().description || "");
            if (snap.data().locations) {
                setLocations(snap.data().locations);
            }
            // Ensure mode from DB matches new type, default to car
            setMode((snap.data().mode as TravelMode) || "car");
        };

        if (user) fetchTrip();
    }, [id, user, router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        await updateDoc(doc(db, "trips", id as string), {
            title,
            description,
            locations,
            mode,
        });

        router.push("/dashboard");
    };

    return (
        <form onSubmit={handleUpdate} style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h1>Edit Trip</h1>

            <div style={{ marginBottom: "20px" }}>
                <input
                    value={title}
                    required
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    style={{ width: "100%", padding: "10px", margin: "5px 0" }}
                />

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    style={{ width: "100%", padding: "10px", margin: "5px 0", minHeight: "100px" }}
                />
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h3 style={{ marginBottom: "10px" }}>Trip Route</h3>

                <div style={{ marginBottom: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
                    <label>Mode:</label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value as TravelMode)}
                        style={{ padding: "5px" }}
                    >
                        <option value="car">🚗 Car</option>
                        <option value="motorbike">🏍️ Motorbike</option>
                        <option value="bicycle">🚲 Bicycle</option>
                        <option value="walk">🚶 Walk</option>
                    </select>

                    {/* Display Distance & Duration */}
                    {parseFloat(distance) > 0 && (
                        <div style={{ marginLeft: "20px", fontSize: "0.9rem", color: "#666" }}>
                            <span>📏 {distance} km</span>
                            <span style={{ marginLeft: "15px" }}>
                                ⏱️ {parseInt(duration) > 60
                                    ? `${(parseInt(duration) / 60).toFixed(1)} hrs`
                                    : `${duration} mins`}
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
                    <TripMap
                        locations={locations}
                        setLocations={setLocations}
                        route={route}
                    />
                </div>
                <p style={{ marginTop: "5px", fontSize: "0.8rem", color: "#888" }}>
                    Click on the map to add stops.
                </p>

                {/* Location List (Optional but helpful) */}
                {locations.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                        <h4>Stops ({locations.length})</h4>
                        <ul style={{ paddingLeft: "20px" }}>
                            {locations.map((loc, i) => (
                                <li key={i}>
                                    Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}
                                    <button
                                        type="button" // important so it doesn't submit form
                                        onClick={() => setLocations(locations.filter((_, idx) => idx !== i))}
                                        style={{ marginLeft: "10px", color: "red", border: "none", background: "none", cursor: "pointer" }}
                                    >
                                        (Remove)
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <button
                type="submit"
                style={{ padding: "10px 20px", background: "black", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
                Save Updates
            </button>
        </form>
    );
}
