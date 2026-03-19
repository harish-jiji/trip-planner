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
    headerActions?: React.ReactNode;
}

export default function TripForm({ initialData, isSaving, onSave, submitButtonText = "Save Trip", headerActions }: Props) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [locations, setLocations] = useState<LocationStop[]>(initialData?.locations || []);
    const [mode, setMode] = useState<TravelMode>(initialData?.mode || "car");

    const [route, setRoute] = useState<[number, number][]>([]);
    const [distance, setDistance] = useState("0");
    const [duration, setDuration] = useState("0");
    const [segments, setSegments] = useState<any[]>([]);
    const [reorderIndex, setReorderIndex] = useState<number | null>(null);
    const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

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
        <form onSubmit={handleSubmit} className="flex flex-col min-h-screen lg:h-screen bg-[#0F172A] lg:overflow-hidden transition-all duration-300">
            {/* Global Search Bar - Natural flow on mobile, part of fixed layout on desktop */}
            <div className="flex-shrink-0 bg-slate-900 z-10">
                <MapSearch
                    onSelect={(place: any) => {
                        setLocations([
                            ...locations,
                            { lat: place.lat, lng: place.lng, name: place.name }
                        ]);
                        setSelectedPosition([place.lat, place.lng]);
                    }}
                />
            </div>

            <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden bg-[#0F172A]">
                {/* Map Area - Fixed height on mobile, but scrolls with page. Fills remaining on desktop. */}
                <div className="h-[40vh] flex-shrink-0 lg:h-full lg:flex-1 bg-slate-900 lg:order-2 relative border-b border-slate-800 lg:border-b-0 lg:border-l">
                    <div className="w-full h-full relative z-0">
                        <TripMap
                            locations={locations}
                            setLocations={setLocations}
                            route={route}
                            className="w-full h-full"
                            selectedPosition={selectedPosition}
                        />
                    </div>
                </div>

                {/* Content Panel - Scrolls with the rest of the page on mobile, scrollable only here on desktop. */}
                <div className="flex-1 lg:w-[480px] xl:w-[560px] flex-shrink-0 flex flex-col bg-slate-900 lg:bg-white lg:dark:bg-[#0F172A] lg:order-1 lg:overflow-hidden relative">
                    <div className="flex-1 lg:overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
                        {/* Header Info Card */}
                        <div className="bg-slate-800 lg:bg-white lg:dark:bg-[#1E293B] p-6 rounded-[32px] shadow-sm border border-slate-700 lg:border-gray-800 space-y-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            
                            <input
                                value={title}
                                required
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Name your trip..."
                                className="w-full text-3xl font-black bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-600 lg:placeholder:text-gray-300 text-white lg:text-gray-900 lg:dark:text-white relative z-10"
                            />
                            
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a short description..."
                                className="w-full text-base text-slate-400 lg:text-gray-500 bg-transparent border-none resize-none focus:ring-0 p-0 placeholder:text-slate-600 lg:placeholder:text-gray-300 min-h-[60px] relative z-10"
                            />

                            {headerActions && (
                                <div className="pt-2 relative z-10">
                                    {headerActions}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-5 border-t border-slate-700 lg:border-gray-800 relative z-10">
                                <select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value as TravelMode)}
                                    className="bg-blue-900/40 lg:bg-blue-50 text-blue-300 lg:text-blue-700 font-bold border-none rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                                >
                                    <option value="car" className="bg-slate-900 lg:bg-white text-white lg:text-gray-900">🚗 Car</option>
                                    <option value="motorbike" className="bg-slate-900 lg:bg-white text-white lg:text-gray-900">🏍️ Motorbike</option>
                                    <option value="bicycle" className="bg-slate-900 lg:bg-white text-white lg:text-gray-900">🚲 Bicycle</option>
                                    <option value="walk" className="bg-slate-900 lg:bg-white text-white lg:text-gray-900">🚶 Walk</option>
                                </select>

                                {parseFloat(distance) > 0 && (
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 lg:text-gray-500 bg-slate-900/50 lg:bg-gray-50 px-4 py-2.5 rounded-2xl border border-slate-700 lg:border-gray-100">
                                        <span className="flex items-center gap-1.5 uppercase"><span>📏</span> {distance}k</span>
                                        <span className="w-px h-3 bg-slate-700 lg:bg-gray-300"></span>
                                        <span className="flex items-center gap-1.5 uppercase"><span>⏱️</span> {parseInt(duration) > 60 ? `${(parseInt(duration) / 60).toFixed(1)}h` : `${duration}m`}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stops List */}
                        <div className="flex flex-col gap-5 pt-2 relative">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-black text-xl tracking-tight text-white lg:text-gray-900 lg:dark:text-white uppercase">Trip Route</h3>
                                <span className="text-[10px] font-black text-slate-500 lg:text-gray-400 uppercase tracking-[0.2em]">{locations.length} STOPS</span>
                            </div>

                            {locations.length === 0 && (
                                <div className="py-16 border-2 border-dashed border-slate-800 lg:border-gray-200 lg:dark:border-gray-800 rounded-[32px] text-center flex flex-col items-center">
                                    <div className="text-5xl mb-4 grayscale opacity-30">📍</div>
                                    <p className="text-slate-500 lg:text-gray-500 font-bold uppercase text-xs tracking-widest">Search the map to add stops</p>
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
                                            <div className="bg-slate-800 lg:bg-white shadow-md border border-slate-700 lg:border-gray-800 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 lg:text-gray-500 flex items-center gap-4">
                                                <span className="flex items-center gap-1.5 text-blue-400"><span>📏</span> {segments[index].distanceKm}km</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700 lg:bg-gray-300" />
                                                <span className="flex items-center gap-1.5 text-indigo-400"><span>⏱️</span> {segments[index].durationMin}m</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {/* Summary and Save Bar - Integrated into flow for mobile, fixed for desktop */}
                        <div className="mt-8 p-6 bg-slate-800 lg:bg-blue-50/50 dark:lg:bg-blue-900/10 rounded-[32px] border border-slate-700 lg:border-blue-500/20 shadow-sm flex flex-col gap-4">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-slate-500 lg:text-blue-500/60 font-black text-xs tracking-[0.1em] uppercase">Est. Trip Cost</span>
                                <span className="text-3xl font-black text-white lg:text-blue-600 lg:dark:text-blue-400">₹{totalCost.toLocaleString()}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-lg uppercase tracking-widest"
                            >
                                {isSaving ? "Saving Trip..." : submitButtonText}
                            </button>
                        </div>

                        {/* Mobile Bottom Padding to clear navigation */}
                        <div className="h-10 lg:hidden"></div>
                    </div>
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
