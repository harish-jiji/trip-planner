"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { ACTIVITY_META } from "@/lib/activityIcons";
import TripTimeline from "@/components/TripTimeline";
import type { LocationStop, TravelMode, ActivityType } from "@/types/trip";

const TripMap = dynamic(() => import("@/components/TripMap"), {
    ssr: false,
});

// START OF DAY 6 CHANGES (Types moved to shared file)
// END OF DAY 6 CHANGES

export default function EditTripPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [locations, setLocations] = useState<LocationStop[]>([]);
    // END OF DAY 6 CHANGES
    const [route, setRoute] = useState<[number, number][]>([]);
    const [mode, setMode] = useState<TravelMode>("car"); // Strict type
    const [distance, setDistance] = useState("0");
    const [duration, setDuration] = useState("0");
    const routeRequestId = useRef(0); // Guard for async race conditions
    const dragIndex = useRef<number | null>(null); // For drag-and-drop

    // Day 9 Implementation
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // END OF DAY 9 CHANGES

    const fetchRoute = async (locations: any[], mode: TravelMode) => { // ... (rest of function) // Use TravelMode type
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
            setLoading(false);
        };

        if (user) {
            fetchTrip();
        } else {
            // If auth is still loading, we wait. If unauthenticated, AuthContext handles redirect or we show loading
            // For now assume loading implies auth check or fetch
        }
    }, [id, user, router]);

    // Helper calculate total cost
    const totalCost = locations.reduce((sum, loc) => {
        const exp = loc.expenses;
        if (!exp) return sum;
        return (
            sum +
            (exp.entry || 0) +
            (exp.food || 0) +
            (exp.travel || 0) +
            (exp.other || 0)
        );
    }, 0);

    // Helper to sanitize data for Firestore (removes undefined)
    const sanitizeLocations = (locations: any[]) => {
        return locations.map((loc) => {
            const cleanLoc: any = {
                lat: loc.lat,
                lng: loc.lng,
            };

            if (loc.name) cleanLoc.name = loc.name;

            if (loc.activities && loc.activities.length > 0) {
                cleanLoc.activities = loc.activities;
            }

            if (loc.time?.arrival || loc.time?.departure) {
                cleanLoc.time = {};
                if (loc.time.arrival) cleanLoc.time.arrival = loc.time.arrival;
                if (loc.time.departure) cleanLoc.time.departure = loc.time.departure;
            }

            if (loc.expenses) {
                const cleanExpenses: any = {};

                if (Number.isFinite(loc.expenses.entry)) cleanExpenses.entry = loc.expenses.entry;
                if (Number.isFinite(loc.expenses.food)) cleanExpenses.food = loc.expenses.food;
                if (Number.isFinite(loc.expenses.travel)) cleanExpenses.travel = loc.expenses.travel;
                if (Number.isFinite(loc.expenses.other)) cleanExpenses.other = loc.expenses.other;

                if (Object.keys(cleanExpenses).length > 0) {
                    cleanLoc.expenses = cleanExpenses;
                }
            }

            return cleanLoc;
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const cleanedLocations = sanitizeLocations(locations);

        await updateDoc(doc(db, "trips", id as string), {
            title,
            description,
            locations: cleanedLocations,
            mode,
        });

        setSaving(false);
        alert("Trip updated successfully!");
        // We stay on the page to allow further edits, or router.push("/dashboard") if preferred. 
        // User instructions said "Redirect to dashboard" was for DELETE. For update, "Show success feedback".
        // Though original code redirected to dashboard. User requirement "Show success feedback" implies staying or explicit alert. 
        // Instructions: Save -> success alert. Refresh -> persists.
        // So I will remove router.push for Update.
    };

    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Loading trip...</div>;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <form onSubmit={handleUpdate}>
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
                            setLocations={setLocations as any}
                            route={route}
                        />
                    </div>
                    <p style={{ marginTop: "5px", fontSize: "0.8rem", color: "#888" }}>
                        Click on the map to add stops.
                    </p>

                    {/* Detailed Stop Editor */}
                    <div style={{ marginTop: "20px" }}>
                        <h3>Stops & Activities</h3>

                        {locations.length === 0 && <p style={{ color: "#888" }}>No stops added yet.</p>}

                        {locations.map((loc, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={() => (dragIndex.current = index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                    if (dragIndex.current === null) return;

                                    const updated = [...locations];
                                    const draggedItem = updated.splice(dragIndex.current, 1)[0];
                                    updated.splice(index, 0, draggedItem);

                                    dragIndex.current = null;
                                    setLocations(updated);
                                }}
                                style={{
                                    border: "1px solid #ddd",
                                    padding: "12px",
                                    borderRadius: "6px",
                                    marginBottom: "10px",
                                    backgroundColor: "#f9f9f9",
                                    cursor: "grab",
                                }}
                            >
                                <div style={{ fontSize: "12px", color: "#999", marginBottom: "6px" }}>
                                    ⠿ Drag to reorder
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                    <h4 style={{ margin: 0 }}>
                                        📍 Stop {index + 1}
                                        {loc.name && (
                                            <span style={{ fontWeight: "normal", color: "#666" }}>
                                                {" "}– {loc.name}
                                            </span>
                                        )}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setLocations(locations.filter((_, idx) => idx !== index))}
                                        style={{ color: "red", border: "none", background: "none", cursor: "pointer", fontSize: "0.9rem" }}
                                    >
                                        Remove
                                    </button>
                                </div>

                                <input
                                    placeholder="Location name"
                                    value={loc.name || ""}
                                    onChange={(e) => {
                                        const copy = [...locations];
                                        copy[index].name = e.target.value;
                                        setLocations(copy);
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "6px",
                                        marginBottom: "6px",
                                        fontWeight: "500",
                                        borderRadius: "4px",
                                        border: "1px solid #ccc"
                                    }}
                                />

                                {/* Activities */}
                                <div style={{ marginTop: "8px" }}>
                                    <strong>Activities</strong>
                                    <div style={{ display: "flex", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
                                        {["sightseeing", "hiking", "food", "meetup"].map((act) => (
                                            <label key={act} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", cursor: "pointer" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={loc.activities?.includes(act as ActivityType) || false}
                                                    onChange={(e) => {
                                                        const copy = [...locations];
                                                        const set = new Set(copy[index].activities || []);
                                                        e.target.checked ? set.add(act as ActivityType) : set.delete(act as ActivityType);
                                                        copy[index].activities = Array.from(set) as ActivityType[];
                                                        setLocations(copy);
                                                    }}
                                                />
                                                <span>{ACTIVITY_META[act].icon}</span>
                                                <span>{ACTIVITY_META[act].label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Time Slots */}
                                <div style={{ marginTop: "8px", display: "flex", gap: "12px" }}>
                                    <label style={{ fontSize: "0.9rem" }}>
                                        Arrival
                                        <input
                                            type="time"
                                            value={loc.time?.arrival || ""}
                                            onChange={(e) => {
                                                const copy = [...locations];
                                                copy[index].time = { ...copy[index].time, arrival: e.target.value };
                                                setLocations(copy);
                                            }}
                                            style={{ marginLeft: "5px", padding: "4px" }}
                                        />
                                    </label>

                                    <label style={{ fontSize: "0.9rem" }}>
                                        Departure
                                        <input
                                            type="time"
                                            value={loc.time?.departure || ""}
                                            onChange={(e) => {
                                                const copy = [...locations];
                                                copy[index].time = { ...copy[index].time, departure: e.target.value };
                                                setLocations(copy);
                                            }}
                                            style={{ marginLeft: "5px", padding: "4px" }}
                                        />
                                    </label>
                                </div>

                                {/* Expenses */}
                                <div style={{ marginTop: "8px" }}>
                                    <strong>Expenses</strong>
                                    <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                                        {["entry", "food", "travel", "other"].map((key) => (
                                            <input
                                                key={key}
                                                type="number"
                                                placeholder={key}
                                                value={loc.expenses?.[key as keyof typeof loc.expenses] ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const copy = [...locations];
                                                    copy[index].expenses = {
                                                        ...(copy[index].expenses || {}),
                                                        [key]: value === "" ? undefined : Number(value),
                                                    };
                                                    setLocations(copy);
                                                }}
                                                style={{ width: "90px", padding: "6px", fontSize: "0.9rem" }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <h3 style={{ marginTop: "20px" }}>
                            💰 Total Estimated Cost: ₹{totalCost}
                        </h3>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: "10px 20px", background: "black", color: "white", border: "none", borderRadius: "5px", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
                >
                    {saving ? "Saving..." : "Save Updates"}
                </button>

                <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                        marginLeft: "10px",
                        background: "#ef4444",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Delete Trip
                </button>

                <button
                    type="button"
                    onClick={() => {
                        const url = `${window.location.origin}/trip/${id}`;
                        navigator.clipboard.writeText(url);
                        alert("Public link copied to clipboard!\n" + url);
                    }}
                    style={{
                        marginLeft: "10px",
                        background: "#3b82f6",
                        color: "white",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    🔗 Share
                </button>
            </form>

            {/* Day 8: Trip Timeline View */}
            <TripTimeline locations={locations} totalDistance={distance} totalDuration={duration} />

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "24px",
                            borderRadius: "12px",
                            width: "320px",
                            textAlign: "center",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#1f2937" }}>Delete this trip?</h3>
                        <p style={{ color: "#6b7280", marginBottom: "20px" }}>This action cannot be undone.</p>

                        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                            <button
                                onClick={async () => {
                                    try {
                                        await deleteDoc(doc(db, "trips", id as string));
                                        router.push("/dashboard");
                                    } catch (err) {
                                        console.error("Error deleting trip:", err);
                                        alert("Failed to delete trip. You might not have permission.");
                                    }
                                }}
                                style={{
                                    background: "#dc2626",
                                    color: "white",
                                    padding: "8px 16px",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "500"
                                }}
                            >
                                Yes, Delete
                            </button>

                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{
                                    padding: "8px 16px",
                                    border: "1px solid #d1d5db",
                                    background: "white",
                                    color: "#374151",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "500"
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
