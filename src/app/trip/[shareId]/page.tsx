"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import TripTimeline from "@/components/TripTimeline";

const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });

const ModeEmoji: Record<string, string> = { car: "🚗", bicycle: "🚲", walk: "🚶", motorbike: "🏍️" };
const ModeLabel: Record<string, string> = { car: "Car", bicycle: "Bicycle", walk: "Walking", motorbike: "Motorbike" };

export default function PublicTripPage() {
    const { shareId } = useParams();
    const router = useRouter();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [distance, setDistance] = useState("0");
    const [duration, setDuration] = useState("0");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchTrip = async () => {
            if (!shareId) return;
            const ref = doc(db, "trips", shareId as string);
            const snap = await getDoc(ref);
            if (!snap.exists() || !snap.data().isPublic) { 
                setLoading(false); 
                return; 
            }
            setTrip(snap.data());
            setLoading(false);
        };
        fetchTrip();
    }, [shareId]);

    useEffect(() => {
        if (!trip?.locations || trip.locations.length < 2) return;
        const fetchRoute = async () => {
            const coords = trip.locations.map((l: any) => `${l.lng},${l.lat}`).join(";");
            const mode = trip.mode || "car";
            const profile = mode === "bicycle" ? "bike" : mode === "walk" ? "foot" : "car";
            try {
                const res = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson`);
                const data = await res.json();
                if (data.routes?.length > 0) {
                    const distanceKm = (data.routes[0].distance / 1000).toFixed(2);
                    const speeds: Record<string, number> = { car: 50, motorbike: 45, bicycle: 15, walk: 5 };
                    const durationMin = Math.round((parseFloat(distanceKm) / (speeds[mode] || 50)) * 60);
                    setDistance(distanceKm);
                    setDuration(durationMin.toString());
                    setRoute(data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]));
                }
            } catch {}
        };
        fetchRoute();
    }, [trip]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalCost = (trip?.locations || []).reduce((sum: number, loc: any) => {
        const e = loc.expenses;
        return sum + (e ? (e.entry || 0) + (e.food || 0) + (e.travel || 0) + (e.other || 0) : 0);
    }, 0);

    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-[#38BDF8] rounded-full animate-spin mx-auto pb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading trip details...</p>
            </div>
        </div>
    );

    if (!trip) return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center px-4">
            <div className="text-center max-w-sm w-full bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-10 shadow-xl">
                <div className="text-6xl mb-6">🔒</div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Trip not found</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">This trip might be private, deleted, or the link may be incorrect.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] font-sans text-gray-900 dark:text-white pb-32">
            {/* Top Navigation Bar */}
            <nav className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl">
                <div className="flex items-center gap-3 w-max">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg pointer-events-none">✈️</div>
                    <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">Trip Planner</span>
                </div>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 font-semibold text-gray-700 dark:text-gray-300 transition-colors shadow-sm"
                >
                    {copied ? "✅ Copied!" : "🔗 Copy link"}
                </button>
            </nav>

            {/* Hero Section */}
            <div className="px-4 sm:px-8 max-w-5xl mx-auto pt-10">
                <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 dark:from-[#0F172A] dark:via-blue-950 dark:to-indigo-950 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl shadow-blue-900/20 mb-10 border border-blue-800/50 dark:border-gray-800">
                    {/* Glowing Orbs */}
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/30 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="relative z-10 max-w-3xl">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-md">
                            {trip.title}
                        </h1>
                        <p className="text-lg text-blue-100/80 leading-relaxed mb-8 max-w-2xl font-medium">
                            {trip.description || "A planned adventure."}
                        </p>
                        
                        <div className="flex flex-wrap gap-2.5">
                            <span className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm font-semibold text-white">
                                📍 {trip.locations?.length || 0} stops
                            </span>
                            {trip.mode && (
                                <span className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm font-semibold text-white">
                                    {ModeEmoji[trip.mode] || "🚗"} {ModeLabel[trip.mode] || trip.mode}
                                </span>
                            )}
                            {distance !== "0" && (
                                <span className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm font-semibold text-white">
                                    📏 {distance} km
                                </span>
                            )}
                            {duration !== "0" && (
                                <span className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm font-semibold text-white">
                                    ⏱️ ~{parseInt(duration) >= 60 ? `${Math.floor(parseInt(duration) / 60)}h ${parseInt(duration) % 60}m` : `${duration} min`}
                                </span>
                            )}
                            {totalCost > 0 && (
                                <span className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm font-semibold text-white">
                                    💰 ₹{totalCost.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-5xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Map Panel */}
                <div className="md:col-span-12 lg:col-span-7 xl:col-span-7">
                    <div className="bg-white dark:bg-[#1E293B] p-2 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-24">
                        <div className="h-[400px] md:h-[600px] w-full rounded-[1.5rem] overflow-hidden relative z-0 border border-gray-100 dark:border-gray-800">
                            <TripMap
                                locations={trip.locations}
                                route={route}
                            />
                        </div>
                    </div>
                </div>

                {/* Timeline Panel */}
                <div className="md:col-span-12 lg:col-span-5 xl:col-span-5">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 px-2 tracking-tight">Trip Itinerary</h2>
                    <div className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm rounded-3xl">
                        <TripTimeline
                            locations={trip.locations}
                        />
                    </div>
                    
                    <button
                      onClick={() => router.push("/")}
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-4 font-bold text-white shadow-xl shadow-blue-500/20 transition-all rounded-xl border-none outline-none transform hover:-translate-y-1"
                    >
                      🚀 Plan your own trip
                    </button>
                </div>
            </div>
        </div>
    );
}
