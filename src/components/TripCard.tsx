"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash, Share2 } from "lucide-react";

export default function TripCard({
    trip,
    cost,
    onDelete,
    onShare,
    isDeleting,
}: {
    trip: any;
    cost: number;
    onDelete: (id: string, shareId: string) => void;
    onShare: (trip: any) => void;
    isDeleting: boolean;
}) {
    const router = useRouter();
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
                    {trip.sharedWithFriends && trip.sharedWithFriends.length > 0 && (
                        <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-100 dark:border-purple-800/30 flex items-center gap-1">
                            👥 Shared with {trip.sharedWithFriends.length} friend{trip.sharedWithFriends.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={(e) => { e.preventDefault(); router.push(`/trip/${trip.shareId}`); }} className="flex-1 min-w-[90px] flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold py-2.5 px-3 rounded-xl transition-colors border border-blue-100 dark:border-blue-800/30 text-sm">
                        <Eye size={16} /> View
                    </button>
                    <button onClick={(e) => { e.preventDefault(); router.push(`/edit-trip/${trip.id}`); }} className="flex-1 min-w-[90px] flex justify-center items-center gap-2 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 font-bold py-2.5 px-3 rounded-xl transition-colors border border-yellow-100 dark:border-yellow-800/30 text-sm">
                        <Pencil size={16} /> Edit
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onShare(trip); }} className="flex-1 min-w-[90px] flex justify-center items-center gap-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 font-bold py-2.5 px-3 rounded-xl transition-colors border border-green-100 dark:border-green-800/30 text-sm">
                        <Share2 size={16} /> Share
                    </button>
                    <button onClick={(e) => { e.preventDefault(); onDelete(trip.id, trip.shareId); }} className="flex-1 min-w-[90px] flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-3 rounded-xl transition-colors shadow-sm text-sm">
                        <Trash size={16} /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
