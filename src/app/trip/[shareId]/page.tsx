"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import TripTimeline from "@/components/TripTimeline";
import type { LocationStop } from "@/types/trip";

const TripMap = dynamic(() => import("@/components/TripMap"), {
    ssr: false,
});

export default function PublicTripPage() {
    const { shareId } = useParams();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [distance, setDistance] = useState("0");
    const [duration, setDuration] = useState("0");

    useEffect(() => {
        const fetchTrip = async () => {
            const q = query(
                collection(db, "trips"),
                where("shareId", "==", shareId)
            );

            const snap = await getDocs(q);

            if (!snap.empty) {
                const data = snap.docs[0].data();
                if (!data.isPublic) {
                    setLoading(false);
                    return;
                }
                setTrip(data);
            }

            setLoading(false);
        };

        if (shareId) fetchTrip();
    }, [shareId]);

    useEffect(() => {
        if (!trip?.locations || trip.locations.length < 2) return;

        const fetchRoute = async () => {
            const coords = trip.locations
                .map((l: any) => `${l.lng},${l.lat}`)
                .join(";");

            // Determine profile based on trip mode if available, default to car
            const mode = trip.mode || "car";
            let profile = "car";
            if (mode === "bicycle") profile = "bike";
            if (mode === "walk") profile = "foot";

            try {
                const res = await fetch(
                    `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson`
                );

                const data = await res.json();

                if (data.routes?.length > 0) {
                    const distanceKm = (data.routes[0].distance / 1000).toFixed(2);

                    const speeds: Record<string, number> = {
                        car: 50,
                        motorbike: 45,
                        bicycle: 15,
                        walk: 5,
                    };
                    const speed = speeds[mode as string] || 50;

                    const durationMin = Math.round(
                        (parseFloat(distanceKm) / speed) * 60
                    );

                    setDistance(distanceKm);
                    setDuration(durationMin.toString());

                    setRoute(
                        data.routes[0].geometry.coordinates.map(
                            ([lng, lat]: number[]) => [lat, lng]
                        )
                    );
                }
            } catch (e) {
                console.error("Route fetch error", e);
            }
        };

        fetchRoute();
    }, [trip]);

    if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Loading trip...</div>;
    if (!trip) return <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Trip not found or is private.</div>;

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
            <h1 style={{ marginBottom: "10px" }}>{trip.title}</h1>
            <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "20px" }}>{trip.description}</p>

            <div style={{ marginBottom: "20px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <TripMap
                    locations={trip.locations}
                    route={route}
                />
            </div>

            <TripTimeline
                locations={trip.locations}
                totalDistance={distance}
                totalDuration={duration}
            />
        </div>
    );
}
