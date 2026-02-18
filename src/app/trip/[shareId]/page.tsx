"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import TripTimeline from "@/components/TripTimeline";
import { Container } from "@/components/ui/Container";

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
            if (!shareId) return;
            const ref = doc(db, "trips", shareId as string);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
                setLoading(false);
                return;
            }

            const data = snap.data();

            // Ensure public access
            if (!data.isPublic) {
                setLoading(false);
                return;
            }

            setTrip(data);
            setLoading(false);
        };

        fetchTrip();
    }, [shareId]);

    useEffect(() => {
        if (!trip?.locations || trip.locations.length < 2) return;

        const fetchRoute = async () => {
            const coords = trip.locations
                .map((l: any) => `${l.lng},${l.lat}`)
                .join(";");

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

    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center transition-colors">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
        </div>
    );

    if (!trip) return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center transition-colors">
            <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-md">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Trip Not Found</h3>
                <p className="text-gray-500 dark:text-gray-400">This trip might be private or deleted.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-20 transition-colors">
            <Container>
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 text-white rounded-3xl p-8 mb-8 shadow-lg transition-all hover:shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight relative z-10">{trip.title}</h1>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl leading-relaxed opacity-90 relative z-10">
                        {trip.description || "A planned adventure."}
                    </p>

                    <div className="flex items-center gap-4 mt-8 text-blue-100 text-sm font-medium relative z-10">
                        <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            🗓️ Trip Plan
                        </span>
                        {trip.mode && (
                            <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm capitalize">
                                🚗 {trip.mode}
                            </span>
                        )}
                    </div>
                </div>

                {/* Map Section */}
                <div className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
                    <TripMap
                        locations={trip.locations}
                        route={route}
                        className="h-[400px] md:h-[500px] w-full rounded-xl z-0"
                    />
                </div>

                {/* Timeline & Summary */}
                <TripTimeline
                    locations={trip.locations}
                    totalDistance={distance}
                    totalDuration={duration}
                />
            </Container>
        </div>
    );
}
