"use client";

import Link from "next/link";

export default function TripCard({
    trip,
    cost,
    onDelete,
    onCopyShareLink,
    isDeleting,
}: {
    trip: any;
    cost: number;
    onDelete: (id: string, shareId: string) => void;
    onCopyShareLink: (shareId: string) => void;
    isDeleting: boolean;
}) {
    const stops = trip.locations?.length || 0;
    
    // Fallbacks
    const ModeEmoji: Record<string, string> = {
        car: "🚗",
        bicycle: "🚲",
        walk: "🚶",
        motorbike: "🏍️"
    };

    return (
        <div 
            className={`flex flex-col h-[340px] bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 ${isDeleting ? "opacity-50 scale-95" : ""}`}
        >
            <div className={`h-[140px] bg-gradient-to-br from-blue-500 via-[#38BDF8] to-purple-600 p-5 flex flex-col justify-between relative`}>
                <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 hover:opacity-100" />
                <div className="relative z-10 flex justify-between items-start">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/30">
                        {ModeEmoji[trip.mode || "car"] || "🗺️"}
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => { e.preventDefault(); onCopyShareLink(trip.shareId); }}
                            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all hover:scale-105"
                            title="Copy link"
                        >
                            🔗
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); onDelete(trip.id, trip.shareId); }}
                            className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all hover:scale-105"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-white text-xl line-clamp-1 truncate pr-4">{trip.title}</h3>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1 justify-between">
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                    {trip.description || "No description provided."}
                </p>

                <div className="flex flex-wrap gap-2 mt-4 mb-5">
                    <span className="bg-[#F8FAFC] dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-100 dark:border-gray-700">
                        💰 ₹{cost.toLocaleString()}
                    </span>
                    <span className="bg-[#F8FAFC] dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-100 dark:border-gray-700">
                        📍 {stops} stop{stops !== 1 ? "s" : ""}
                    </span>
                    {trip.mode && (
                        <span className="bg-[#F8FAFC] dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-100 dark:border-gray-700 capitalize">
                            {trip.mode}
                        </span>
                    )}
                </div>

                <Link href={`/edit-trip/${trip.id}`} className="mt-auto block">
                    <button className="w-full py-3 bg-gray-50 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-[#1E293B] hover:text-blue-600 dark:hover:text-[#38BDF8] text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all border border-gray-100 dark:border-gray-700">
                        Edit Trip →
                    </button>
                </Link>
            </div>
        </div>
    );
}
