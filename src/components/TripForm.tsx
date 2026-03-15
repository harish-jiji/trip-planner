"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { LocationStop, TravelMode } from "@/types/trip";
import MapSearch from "@/components/MapSearch";
import StopCard from "@/components/StopCard";

const TripMap = dynamic(() => import("@/components/TripMap"), { ssr: false });

export interface TripFormData {
    title: string;
    description: string;
    locations: LocationStop[];
    mode: TravelMode;
}

interface Props {
    initialData?: TripFormData;
    isSaving: boolean;
    onSave: (data: TripFormData) => Promise<void>;
    submitButtonText?: string;
}

export default function TripForm({ initialData, isSaving, onSave, submitButtonText = "Save Trip" }: Props) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [locations, setLocations] = useState<LocationStop[]>(initialData?.locations || []);
    const [mode, setMode] = useState<TravelMode>(initialData?.mode || "car");

    const [route, setRoute] = useState<[number, number][]>([]);
    const [distance, setDistance] = useState("0");
    const [duration, setDuration] = useState("0");
    const [segments, setSegments] = useState<any[]>([]);
    const [reorderIndex, setReorderIndex] = useState<number | null>(null);

    const routeRequestId = useRef(0);
    const dragIndex = useRef<number | null>(null);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setLocations(initialData.locations);
            setMode(initialData.mode);
        }
    }, [initialData]);

    // Routing Logic
    const fetchRoute = async (locations: any[], mode: TravelMode) => {
        if (locations.length < 2) return null;
        const coords = locations.map((l) => `${l.lng},${l.lat}`).join(";");
        let profile = "car";
        if (mode === "walk") profile = "foot";
        else if (mode === "bicycle") profile = "bike";

        try {
            const res = await fetch(
                `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&steps=true&geometries=geojson`
            );
            const data = await res.json();
            if (!data.routes || data.routes.length === 0) return null;

            const distanceKm = data.routes[0].distance / 1000;
            const SPEED_KMPH = { car: 50, motorbike: 45, bicycle: 15, walk: 5 };
            const durationMin = Math.round((distanceKm / (SPEED_KMPH[mode] || 50)) * 60);

            const legs = data.routes[0].legs;
            const segmentsList = legs ? legs.map((leg: any) => ({
                distanceKm: (leg.distance / 1000).toFixed(2),
                durationMin: Math.round(leg.duration / 60),
            })) : [];

            return {
                distanceKm: distanceKm.toFixed(2),
                durationMin,
                segments: segmentsList,
                geometry: data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng]),
            };
        } catch (e) { return null; }
    };

    useEffect(() => {
        const loadRoute = async () => {
            if (locations.length < 2) {
                setRoute([]); setDistance("0"); setDuration("0"); setSegments([]);
                return;
            }
            const currentRequestId = ++routeRequestId.current;
            const result = await fetchRoute(locations, mode);
            if (!result || currentRequestId !== routeRequestId.current) return;

            setRoute(result.geometry);
            setDistance(result.distanceKm);
            setDuration(result.durationMin.toString());
            setSegments(result.segments || []);
        };
        loadRoute();
    }, [locations, mode]);

    const changeStopOrder = (currentIndex: number, newIndex: number) => {
        if (newIndex < 0 || newIndex >= locations.length) return;
        const updated = [...locations];
        const movedItem = updated.splice(currentIndex, 1)[0];
        updated.splice(newIndex, 0, movedItem);
        setLocations(updated);
    };

    const totalCost = locations.reduce((sum, loc) => {
        const exp = loc.expenses;
        if (!exp) return sum;
        return sum + (exp.entry || 0) + (exp.food || 0) + (exp.travel || 0) + (exp.other || 0);
    }, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanedLocations = locations.map(loc => {
            const cleanLoc: any = { lat: loc.lat, lng: loc.lng };
            if (loc.name) cleanLoc.name = loc.name;
            if (loc.activities?.length) cleanLoc.activities = loc.activities;
            if (loc.time?.arrival || loc.time?.departure) cleanLoc.time = loc.time;
            
            if (loc.expenses) {
                const cleanExpenses: any = {};
                ["entry", "food", "travel", "other"].forEach(k => {
                    const val = loc.expenses![k as keyof typeof loc.expenses];
                    if (Number.isFinite(val)) cleanExpenses[k] = val;
                });
                if (Object.keys(cleanExpenses).length > 0) cleanLoc.expenses = cleanExpenses;
            }
            return cleanLoc;
        });

        await onSave({ title, description, locations: cleanedLocations, mode });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-full min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
            {/* Left Column (Planner / Stops) */}
            <div className="w-full lg:w-[480px] xl:w-[560px] flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#0F172A] border-r border-gray-100 dark:border-gray-800 lg:h-screen lg:overflow-y-auto">
                <div className="p-6 md:p-8 flex flex-col gap-6">
                    {/* Header Info */}
                    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <input
                            value={title}
                            required
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Name your trip..."
                            className="w-full text-3xl font-black bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-300 dark:placeholder:text-gray-700 text-gray-900 dark:text-white relative z-10"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a short description about your travel..."
                            className="w-full text-base text-gray-500 dark:text-gray-400 bg-transparent border-none resize-none focus:ring-0 p-0 placeholder:text-gray-300 dark:placeholder:text-gray-700 min-h-[60px] relative z-10"
                        />
                        <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-800 relative z-10">
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value as TravelMode)}
                                className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-[#38BDF8] font-semibold border-none rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer transition-colors"
                            >
                                <option value="car">🚗 Car</option>
                                <option value="motorbike">🏍️ Motorbike</option>
                                <option value="bicycle">🚲 Bicycle</option>
                                <option value="walk">🚶 Walk</option>
                            </select>

                            {parseFloat(distance) > 0 && (
                                <div className="flex items-center gap-4 text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#0F172A] px-4 py-2 rounded-xl shadow-inner border border-gray-100 dark:border-gray-800">
                                    <span className="flex items-center gap-1.5"><span>📏</span> {distance}k</span>
                                    <span className="w-px h-4 bg-gray-300 dark:bg-gray-700"></span>
                                    <span className="flex items-center gap-1.5"><span>⏱️</span> {parseInt(duration) > 60 ? `${(parseInt(duration) / 60).toFixed(1)}h` : `${duration}m`}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stops List */}
                    <div className="flex flex-col gap-5 pt-2 relative pb-40 lg:pb-32">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">Trip Route</h3>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{locations.length} STOPS</span>
                        </div>

                        {locations.length === 0 && (
                            <div className="py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-center flex flex-col items-center">
                                <div className="text-4xl mb-3 opacity-50">📍</div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Search the map to add stops.</p>
                            </div>
                        )}

                        {locations.map((loc, index) => (
                            <div key={index} className="flex flex-col gap-3 relative">
                                <StopCard 
                                    loc={loc} 
                                    index={index} 
                                    dragIndex={dragIndex} 
                                    locations={locations} 
                                    setLocations={setLocations} 
                                    setReorderIndex={setReorderIndex} 
                                />

                                {segments[index] && (
                                    <div className="flex justify-center -my-1 z-10 relative">
                                        <div className="bg-white dark:bg-[#1E293B] shadow-sm border border-gray-100 dark:border-gray-800 px-4 py-2 rounded-full text-xs font-bold text-gray-500 flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-blue-600 dark:text-[#38BDF8]"><span>📏</span> {segments[index].distanceKm}km</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400"><span>⏱️</span> {segments[index].durationMin}m</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Action Bar (Fixed at bottom of left column on desktop, fixed bottom screen on mobile) */}
                <div className="fixed lg:sticky bottom-0 left-0 right-0 lg:left-auto lg:right-auto w-full lg:w-auto p-4 md:p-6 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-40 lg:mt-auto flex flex-col gap-3">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-gray-500 dark:text-gray-400 font-bold text-sm tracking-wide uppercase">Est. Trip Cost</span>
                        <span className="text-2xl font-black text-gray-900 dark:text-white">₹{totalCost.toLocaleString()}</span>
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        {isSaving ? "Saving Trip..." : submitButtonText}
                    </button>
                </div>
            </div>

            {/* Right Column (Map) */}
            <div className="flex-1 h-[60vh] lg:h-screen sticky top-0 md:top-[73px] lg:top-0 z-0 bg-gray-100 dark:bg-gray-900 flex flex-col order-first lg:order-last border-b lg:border-b-0 border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="absolute top-4 left-4 right-4 z-10 shadow-xl rounded-2xl overflow-hidden pointer-events-auto">
                    <MapSearch
                        onSelect={(place: any) => {
                            setLocations([
                                ...locations,
                                { lat: place.lat, lng: place.lng, name: place.name }
                            ]);
                        }}
                    />
                </div>
                
                <div className="w-full h-full relative z-0">
                    <TripMap
                        locations={locations}
                        setLocations={setLocations as any}
                        route={route}
                    />
                </div>
            </div>

            {/* Reorder Modal Overlay */}
            {reorderIndex !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-sm w-full p-8 shadow-2xl relative border border-gray-100 dark:border-gray-800">
                        <button 
                            type="button" 
                            onClick={() => setReorderIndex(null)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 font-bold transition-colors"
                        >✕</button>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Move {locations[reorderIndex]?.name} briefly...</h3>
                        
                        <div className="grid grid-cols-4 gap-3">
                            {locations.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        changeStopOrder(reorderIndex, idx);
                                        setReorderIndex(null);
                                    }}
                                    className={`py-4 rounded-2xl font-black text-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        reorderIndex === idx 
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105" 
                                            : "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
