"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ACTIVITY_META } from "@/lib/activityIcons";

const TripMap = dynamic(() => import("@/components/TripMap"), {
    ssr: false,
});

export default function PublicTripPage() {
    const { shareId } = useParams();
    const [trip, setTrip] = useState<any>(null);
    const [error, setError] = useState("");
    const [route, setRoute] = useState<[number, number][]>([]);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const ref = doc(db, "trips", shareId as string);
                const snap = await getDoc(ref);

                if (!snap.exists()) {
                    setError("Trip not found");
                    return;
                }

                setTrip(snap.data());
            } catch (err) {
                console.error(err);
                setError("Permission denied");
            }
        };

        fetchTrip();
    }, [shareId]);

    // Calculate Route (Read-Only)
    useEffect(() => {
        if (!trip || !trip.locations || trip.locations.length < 2) return;

        const fetchRoute = async () => {
            const mode = trip.mode || "car";
            const profile = mode === "walk" ? "foot" : mode === "bicycle" ? "bike" : "car";

            const coords = trip.locations
                .map((l: any) => `${l.lng},${l.lat}`)
                .join(";");

            try {
                const res = await fetch(
                    `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson`
                );
                const data = await res.json();
                if (data.routes && data.routes.length > 0) {
                    setRoute(
                        data.routes[0].geometry.coordinates.map(
                            ([lng, lat]: number[]) => [lat, lng]
                        )
                    );
                }
            } catch (e) {
                console.error("Routing error", e);
            }
        };

        fetchRoute();
    }, [trip]);

    if (error) return <p>{error}</p>;
    if (!trip) return <p>Loading...</p>;

    // Derived Timeline Data
    const timeline = (trip.locations || [])
        .map((loc: any, index: number) => ({
            index,
            name: loc.name || `Stop ${index + 1}`,
            arrival: loc.time?.arrival,
            departure: loc.time?.departure,
            activities: loc.activities || [],
        }))
        .filter((t: any) => t.arrival || t.departure)
        .sort((a: any, b: any) => {
            if (!a.arrival) return 1;
            if (!b.arrival) return -1;
            return a.arrival.localeCompare(b.arrival);
        });

    // Derived Expense Summary
    const expenseSummary = (trip.locations || []).reduce(
        (acc: any, loc: any) => {
            if (!loc.expenses) return acc;
            acc.entry += loc.expenses.entry || 0;
            acc.food += loc.expenses.food || 0;
            acc.travel += loc.expenses.travel || 0;
            acc.other += loc.expenses.other || 0;
            return acc;
        },
        { entry: 0, food: 0, travel: 0, other: 0 }
    );

    const totalCost = expenseSummary.entry + expenseSummary.food + expenseSummary.travel + expenseSummary.other;

    return (
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h1 style={{ marginBottom: "10px" }}>{trip.title}</h1>
            <p style={{ color: "#666", marginBottom: "20px" }}>{trip.description}</p>

            {/* Read-Only Map */}
            <div style={{ height: "400px", marginBottom: "30px", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
                <TripMap
                    locations={trip.locations || []}
                    route={route}
                />
            </div>

            {/* Timeline View */}
            {timeline.length > 0 && (
                <div style={{ marginBottom: "30px" }}>
                    <h3>🕒 Trip Timeline</h3>
                    {timeline.map((t: any) => (
                        <div key={t.index} style={{ padding: "10px", borderLeft: "3px solid #333", marginBottom: "10px", background: "#fafafa" }}>
                            <strong>{t.name}</strong>
                            <div style={{ fontSize: "0.9rem", color: "#555" }}>
                                {t.arrival && <span>Arrival: {t.arrival} </span>}
                                {t.departure && <span> | Departure: {t.departure}</span>}
                            </div>
                            {t.activities.length > 0 && (
                                <div style={{ marginTop: "4px", display: "flex", gap: "6px" }}>
                                    {t.activities.map((act: string) => (
                                        <span key={act} title={ACTIVITY_META[act]?.label}>
                                            {ACTIVITY_META[act]?.icon || "#"}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Stops List */}
            <div style={{ marginBottom: "30px" }}>
                <h3>📍 Itinerary Details</h3>
                {trip.locations.map((loc: any, index: number) => (
                    <div
                        key={index}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "15px",
                            marginBottom: "12px",
                            background: "#fff",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                    >
                        <h4 style={{ margin: "0 0 8px 0" }}>
                            Stop {index + 1}
                            {loc.name && (
                                <span style={{ fontWeight: "normal", color: "#666" }}>
                                    {" "}– {loc.name}
                                </span>
                            )}
                        </h4>

                        {(loc.time?.arrival || loc.time?.departure) && (
                            <p style={{ fontSize: "0.9rem", color: "#555", margin: "0 0 8px 0" }}>
                                {loc.time?.arrival && <span>🕒 Arr: {loc.time.arrival}</span>}
                                {loc.time?.departure && <span style={{ marginLeft: "10px" }}>Dep: {loc.time.departure}</span>}
                            </p>
                        )}

                        {loc.activities && loc.activities.length > 0 && (
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {loc.activities.map((act: string) => (
                                    <span
                                        key={act}
                                        style={{
                                            padding: "4px 10px",
                                            borderRadius: "999px",
                                            background: "#f1f1f1",
                                            fontSize: "0.85rem",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        <span>{ACTIVITY_META[act]?.icon}</span>
                                        {ACTIVITY_META[act]?.label}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Expense Summary */}
            <div
                style={{
                    padding: "20px",
                    borderRadius: "12px",
                    background: "#111",
                    color: "#fff",
                }}
            >
                <h3 style={{ marginTop: 0, marginBottom: "15px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>💸 Expense Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
                    <p style={{ margin: 0 }}>🎟 Entry: ₹{expenseSummary.entry}</p>
                    <p style={{ margin: 0 }}>🍔 Food: ₹{expenseSummary.food}</p>
                    <p style={{ margin: 0 }}>🚕 Travel: ₹{expenseSummary.travel}</p>
                    <p style={{ margin: 0 }}>📦 Other: ₹{expenseSummary.other}</p>
                </div>
                <h3 style={{ margin: 0, textAlign: "right", color: "#4ade80" }}>
                    Total: ₹{totalCost}
                </h3>
            </div>
        </main>
    );
}
