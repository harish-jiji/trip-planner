"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { ACTIVITY_META } from "@/lib/activityIcons";
import type { LocationStop, TravelMode, ActivityType } from "@/types/trip";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const TripMap = dynamic(() => import("@/components/TripMap"), {
    ssr: false,
});

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
    const routeRequestId = useRef(0);
    const dragIndex = useRef<number | null>(null);

    // If initialData loads late (e.g. fetch), update state
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setLocations(initialData.locations);
            setMode(initialData.mode);
        }
    }, [initialData]);

    // --- Routing Logic ---
    const fetchRoute = async (locations: any[], mode: TravelMode) => {
        if (locations.length < 2) return null;

        const coords = locations
            .map((l) => `${l.lng},${l.lat}`)
            .join(";");

        let profile: "car" | "bike" | "foot";

        if (mode === "walk") profile = "foot";
        else if (mode === "bicycle") profile = "bike";
        else profile = "car";

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
            if (locations.length < 2) {
                setRoute([]);
                setDistance("0");
                setDuration("0");
                return;
            }

            const currentRequestId = ++routeRequestId.current;

            const result = await fetchRoute(locations, mode);
            if (!result) return;

            if (currentRequestId !== routeRequestId.current) return;

            setRoute(result.geometry);
            setDistance(result.distanceKm);
            setDuration(result.durationMin.toString());
        };

        loadRoute();
    }, [locations, mode]);


    // --- Cost Calculation ---
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


    // --- Handlers ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Helper to sanitize data
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
                    if (Object.keys(cleanExpenses).length > 0) cleanLoc.expenses = cleanExpenses;
                }
                return cleanLoc;
            });
        };

        const cleanedLocations = sanitizeLocations(locations);

        await onSave({
            title,
            description,
            locations: cleanedLocations,
            mode
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[calc(100vh-140px)]">
            {/* Left Column: Form & Timeline - Scrollable */}
            <div className="lg:overflow-y-auto pr-1 space-y-6 pb-20 lg:pb-0">
                <Card className="space-y-4">
                    <div>
                        <input
                            value={title}
                            required
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Trip Title"
                            className="w-full text-2xl font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 pb-2 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your trip..."
                            className="w-full text-gray-600 dark:text-gray-300 bg-transparent border-none resize-none focus:ring-0 p-0 placeholder:text-gray-300 dark:placeholder:text-gray-600"
                            rows={3}
                        />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value as TravelMode)}
                            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        >
                            <option value="car">🚗 Car</option>
                            <option value="motorbike">🏍️ Motorbike</option>
                            <option value="bicycle">🚲 Bicycle</option>
                            <option value="walk">🚶 Walk</option>
                        </select>

                        {parseFloat(distance) > 0 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="mr-4">📏 {distance} km</span>
                                <span>
                                    ⏱️ {parseInt(duration) > 60
                                        ? `${(parseInt(duration) / 60).toFixed(1)} hrs`
                                        : `${duration} mins`}
                                </span>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Itinerary</h3>
                    {locations.length === 0 && <p className="text-gray-500 italic text-sm">Click on the map to add stops.</p>}

                    {locations.map((loc, index) => (
                        <Card
                            key={index}
                            draggable
                            onDragStart={() => (dragIndex.current = index)}
                            onDragOver={(e: any) => e.preventDefault()}
                            onDrop={() => {
                                if (dragIndex.current === null) return;
                                const updated = [...locations];
                                const draggedItem = updated.splice(dragIndex.current, 1)[0];
                                updated.splice(index, 0, draggedItem);
                                dragIndex.current = null;
                                setLocations(updated);
                            }}
                            className="bg-white dark:bg-gray-900 cursor-grab active:cursor-grabbing group p-4"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                                        {index + 1}
                                    </span>
                                    <input
                                        placeholder="Location name"
                                        value={loc.name || ""}
                                        onChange={(e) => {
                                            const copy = [...locations];
                                            copy[index].name = e.target.value;
                                            setLocations(copy);
                                        }}
                                        className="font-medium text-gray-900 dark:text-gray-100 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-1 w-full"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setLocations(locations.filter((_, idx) => idx !== index))}
                                    className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Activities */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {["sightseeing", "hiking", "food", "meetup"].map((act) => {
                                    const isActive = loc.activities?.includes(act as ActivityType);
                                    return (
                                        <label
                                            key={act}
                                            className={`text-xs px-3 py-1 rounded-full cursor-pointer transition-colors border select-none ${isActive
                                                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isActive || false}
                                                onChange={(e) => {
                                                    const copy = [...locations];
                                                    const set = new Set(copy[index].activities || []);
                                                    e.target.checked ? set.add(act as ActivityType) : set.delete(act as ActivityType);
                                                    copy[index].activities = Array.from(set) as ActivityType[];
                                                    setLocations(copy);
                                                }}
                                            />
                                            <span className="mr-1">{ACTIVITY_META[act].icon}</span>
                                            {ACTIVITY_META[act].label}
                                        </label>
                                    );
                                })}
                            </div>

                            {/* Time & Expense Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Arrival</label>
                                    <input
                                        type="time"
                                        value={loc.time?.arrival || ""}
                                        onChange={(e) => {
                                            const copy = [...locations];
                                            copy[index].time = { ...copy[index].time, arrival: e.target.value };
                                            setLocations(copy);
                                        }}
                                        className="bg-gray-50 dark:bg-gray-800 rounded px-2 py-1.5 w-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Departure</label>
                                    <input
                                        type="time"
                                        value={loc.time?.departure || ""}
                                        onChange={(e) => {
                                            const copy = [...locations];
                                            copy[index].time = { ...copy[index].time, departure: e.target.value };
                                            setLocations(copy);
                                        }}
                                        className="bg-gray-50 dark:bg-gray-800 rounded px-2 py-1.5 w-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Simplified Expenses */}
                            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800">
                                <details className="group/details">
                                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-blue-600 flex items-center gap-1 select-none">
                                        💰 Expenses
                                    </summary>
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        {["entry", "food", "travel", "other"].map((key) => (
                                            <div key={key} className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 capitalize w-12">{key}</span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
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
                                                    className="w-full bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:border-blue-400 outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="sticky bottom-0 bg-gray-50 dark:bg-black/50 backdrop-blur-sm pt-4 pb-2 border-t border-gray-200 dark:border-gray-800 z-10 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Total Cost</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">₹{totalCost}</span>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                    >
                        {isSaving ? "Saving..." : submitButtonText}
                    </Button>
                </div>
            </div>

            {/* Right Column: Map - Sticky/Fixed */}
            <div className="order-first lg:order-last h-[400px] lg:h-full lg:sticky lg:top-20 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 relative z-0">
                <TripMap
                    locations={locations}
                    setLocations={setLocations as any}
                    route={route}
                />
            </div>
        </form>
    );
}
