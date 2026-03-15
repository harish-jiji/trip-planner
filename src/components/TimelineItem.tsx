"use client";

import { ACTIVITY_META } from "@/lib/activityIcons";
import type { LocationStop } from "@/types/trip";

export default function TimelineItem({ loc, index, isLast }: { loc: LocationStop; index: number; isLast: boolean }) {
    const actKey = loc.activities?.[0] || "sightseeing";
    const emoji = ACTIVITY_META[actKey as keyof typeof ACTIVITY_META]?.icon || "📍";
    
    return (
        <div className="relative flex gap-6 pb-8">
            {!isLast && (
                <div className="absolute top-10 bottom-0 left-[23px] w-0.5 bg-gray-200 dark:bg-gray-800 z-0"></div>
            )}
            
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1E293B] border-2 border-blue-500 dark:border-[#38BDF8] flex items-center justify-center text-xl shadow-md z-10 shrink-0 relative">
                {emoji}
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                </div>
            </div>

            <div className="flex-1 pt-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{loc.name}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 font-medium bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-lg">
                        <span>🕒</span> 
                        {loc.time?.arrival || "Time TBD"} 
                        {loc.time?.departure ? ` - ${loc.time.departure}` : ""}
                    </span>
                    {loc.expenses && (
                        <span className="flex items-center gap-1.5 font-medium bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-lg">
                            <span>💰</span>
                            ₹{Object.values(loc.expenses).reduce((a, b) => (a || 0) + (b || 0), 0)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
