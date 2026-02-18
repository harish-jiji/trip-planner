"use client";

import { useState } from "react";
import { LocationStop } from "@/types/trip";
import { calculateTripCost } from "@/lib/tripUtils";
import { ACTIVITY_META } from "@/lib/activityIcons";
import { Card } from "@/components/ui/Card";

interface Props {
    locations: LocationStop[];
    totalDistance?: string;
    totalDuration?: string;
}

export default function TripTimeline({ locations, totalDistance, totalDuration }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const costs = calculateTripCost(locations);

    return (
        <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trip Timeline</h2>

            {/* Summary Header */}
            {(parseFloat(totalDistance || "0") > 0 || parseFloat(totalDuration || "0") > 0) && (
                <div className="flex flex-wrap gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    {parseFloat(totalDistance || "0") > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📏</span>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide">Distance</div>
                                <div className="font-bold text-gray-900 dark:text-gray-100">{totalDistance} km</div>
                            </div>
                        </div>
                    )}
                    {parseFloat(totalDuration || "0") > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-xl">⏱️</span>
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide">Time</div>
                                <div className="font-bold text-gray-900 dark:text-gray-100">
                                    {parseInt(totalDuration || "0") > 60
                                        ? `${(parseInt(totalDuration || "0") / 60).toFixed(1)} hrs`
                                        : `${totalDuration} mins`}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div className="relative pl-6 space-y-0">
                {/* Vertical Line Background */}
                <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700" />

                {locations.map((loc, idx) => {
                    const isOpen = openIndex === idx;
                    const hasTime = loc.time?.arrival || loc.time?.departure;

                    return (
                        <div key={idx} className="relative pl-8 pb-8 last:pb-0">
                            {/* Number Bullet */}
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : idx)}
                                className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 border-4 border-white dark:border-black transition-colors ${isOpen
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                            >
                                {idx + 1}
                            </button>

                            {/* Stop Card */}
                            <div
                                className={`
                                    bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border transaction-all cursor-pointer hover:shadow-md 
                                    ${isOpen
                                        ? "ring-2 ring-blue-50 dark:ring-blue-900/20 border-blue-100 dark:border-blue-800"
                                        : "border-gray-100 dark:border-gray-800"
                                    }
                                `}
                                onClick={() => setOpenIndex(isOpen ? null : idx)}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                        {loc.name || `Stop ${idx + 1}`}
                                    </h3>
                                    <span className={`text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? "rotate-90" : ""}`}>
                                        ▶
                                    </span>
                                </div>

                                {/* Expanded Content */}
                                {isOpen && (
                                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {hasTime && (
                                            <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md text-sm border border-gray-100 dark:border-gray-700">
                                                <span>⏰</span>
                                                {loc.time?.arrival && loc.time?.departure
                                                    ? `${loc.time?.arrival} – ${loc.time?.departure}`
                                                    : loc.time?.arrival
                                                        ? `Arrives ${loc.time?.arrival}`
                                                        : `Departs ${loc.time?.departure}`
                                                }
                                            </div>
                                        )}

                                        {/* Activities */}
                                        {loc.activities && loc.activities.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {loc.activities.map((act) => (
                                                    <span key={act} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                        <span>{ACTIVITY_META[act]?.icon}</span>
                                                        <span>{ACTIVITY_META[act]?.label}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Expenses */}
                                        {loc.expenses && (
                                            <div className="pt-3 border-t border-gray-50 dark:border-gray-800 grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                {loc.expenses.entry && <span>🎟️ Entry ₹{loc.expenses.entry}</span>}
                                                {loc.expenses.food && <span>🍴 Food ₹{loc.expenses.food}</span>}
                                                {loc.expenses.travel && <span>🚕 Travel ₹{loc.expenses.travel}</span>}
                                                {loc.expenses.other && <span>💸 Other ₹{loc.expenses.other}</span>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Cost Summary */}
            <Card className="mt-8 bg-gray-900 dark:bg-black text-white border-none p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <h3 className="text-lg font-medium mb-4 text-gray-300 relative z-10">Trip Expenses</h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6 relative z-10">
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Entry Fees</div>
                        <div className="text-xl font-bold">₹{costs.entry}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Food & Dining</div>
                        <div className="text-xl font-bold">₹{costs.food}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Travel</div>
                        <div className="text-xl font-bold">₹{costs.travel}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">Other</div>
                        <div className="text-xl font-bold">₹{costs.other}</div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-800 relative z-10">
                    <span className="text-gray-300 font-medium">Total Estimated Cost</span>
                    <span className="text-3xl font-bold text-white">₹{costs.total}</span>
                </div>
            </Card>
        </div>
    );
}
