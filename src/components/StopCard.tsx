"use client";

import { ACTIVITY_META } from "@/lib/activityIcons";
import type { LocationStop, ActivityType } from "@/types/trip";

interface Props {
    loc: LocationStop;
    index: number;
    dragIndex: React.MutableRefObject<number | null>;
    locations: LocationStop[];
    setLocations: (locs: LocationStop[]) => void;
    setReorderIndex: (idx: number) => void;
}

export default function StopCard({
    loc,
    index,
    dragIndex,
    locations,
    setLocations,
    setReorderIndex,
}: Props) {
    return (
        <div
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
            className="bg-white dark:bg-[#1E293B] shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 rounded-2xl p-5 cursor-grab active:cursor-grabbing transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                    <div
                        className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-[#38BDF8] flex items-center justify-center font-bold cursor-pointer shrink-0 transition-colors"
                        onClick={() => setReorderIndex(index)}
                        title="Click to reorder"
                    >
                        {index + 1}
                    </div>
                    <input
                        placeholder="Location name"
                        value={loc.name || ""}
                        onChange={(e) => {
                            const copy = [...locations];
                            copy[index].name = e.target.value;
                            setLocations(copy);
                        }}
                        className="text-lg font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 px-1 w-full placeholder-gray-300 dark:placeholder-gray-700 outline-none"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setLocations(locations.filter((_, idx) => idx !== index))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ml-2"
                >
                    ✕
                </button>
            </div>

            {/* Activities */}
            <div className="flex flex-wrap gap-2 mb-5">
                {["starting_point", "sightseeing", "hiking", "food", "meetup", "rest_stop", "splitting_point", "destination"].map((act) => {
                    const isActive = loc.activities?.includes(act as ActivityType);
                    return (
                        <label
                            key={act}
                            className={`text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-colors border select-none font-medium ${isActive
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                                    : "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                                    
                                    // Special logic: starting_point has no arrival
                                    if (act === "starting_point" && e.target.checked) {
                                        copy[index].time = { ...copy[index].time, arrival: undefined };
                                    }
                                    // Special logic: destination has no departure
                                    if (act === "destination" && e.target.checked) {
                                        copy[index].time = { ...copy[index].time, departure: undefined };
                                    }

                                    copy[index].activities = Array.from(set) as ActivityType[];
                                    setLocations(copy);
                                }}
                            />
                            <span className="mr-1.5">{ACTIVITY_META[act].icon}</span>
                            {ACTIVITY_META[act].label}
                        </label>
                    );
                })}
            </div>

            {/* Link Management */}
            <div className="mb-4">
                {!loc.showLinkInput && !loc.link && (
                    <button
                        type="button"
                        onClick={() => {
                            const copy = [...locations];
                            copy[index].showLinkInput = true;
                            // Optionally auto-fill mapping standard
                            copy[index].link = `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
                            setLocations(copy);
                        }}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium text-xs flex items-center gap-1 transition-colors"
                    >
                        <span className="text-[14px]">🔗</span> Add Link
                    </button>
                )}

                {(loc.showLinkInput || loc.link) && (
                    <div className="flex flex-col gap-1.5 mt-1 relative">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">External Link</label>
                        <input
                            type="text"
                            placeholder="Paste location link (e.g. Google Maps, Booking.com)..."
                            value={loc.link || ""}
                            onChange={(e) => {
                                const copy = [...locations];
                                copy[index].link = e.target.value;
                                setLocations(copy);
                            }}
                            className="bg-gray-50 dark:bg-[#0F172A] rounded-xl px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/50 outline-none w-full"
                        />
                    </div>
                )}
            </div>

            <div className={`grid gap-4 ${(!loc.activities?.includes("starting_point") && !loc.activities?.includes("destination")) ? "grid-cols-2" : "grid-cols-1"}`}>
                {!loc.activities?.includes("starting_point") && (
                    <div>
                        <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Arrival Time</label>
                        <input
                            type="time"
                            value={loc.time?.arrival || ""}
                            onChange={(e) => {
                                const copy = [...locations];
                                copy[index].time = { ...copy[index].time, arrival: e.target.value };
                                setLocations(copy);
                            }}
                            className="bg-gray-50 dark:bg-[#0F172A] rounded-xl px-3 py-2.5 w-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner"
                        />
                    </div>
                )}
                {!loc.activities?.includes("destination") && (
                    <div>
                        <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Departure Time</label>
                        <input
                            type="time"
                            value={loc.time?.departure || ""}
                            onChange={(e) => {
                                const copy = [...locations];
                                copy[index].time = { ...copy[index].time, departure: e.target.value };
                                setLocations(copy);
                            }}
                            className="bg-gray-50 dark:bg-[#0F172A] rounded-xl px-3 py-2.5 w-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner"
                        />
                    </div>
                )}
            </div>

            {/* Expenses */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <details className="group/details">
                    <summary className="text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-[#38BDF8] flex items-center select-none transition-colors">
                        <span className="mr-2">💰</span> 
                        Add Expected Expenses
                        <span className="ml-auto text-xs text-gray-400 group-open/details:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {["entry", "food", "travel", "other"].map((key) => (
                            <div key={key} className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{key} fee</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
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
                                        className="w-full bg-gray-50 dark:bg-[#0F172A] rounded-xl pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner font-medium"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            </div>
        </div>
    );
}
