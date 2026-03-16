"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import PlannerLayout from "@/components/PlannerLayout";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function MyTripsPage(){
    const { user, loading } = useAuth();
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (loading || !user) {
            setIsLoading(false);
            return;
        }

        const loadTrips = async () => {
            try {
                const q = query(
                    collection(db, "trips"),
                    where("ownerId", "==", user.uid)
                );

                const snap = await getDocs(q);

                const list: any[] = [];
                snap.forEach(doc => {
                    list.push({ id: doc.id, ...doc.data() });
                });

                // Sort by newest first locally
                list.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                    return dateB.getTime() - dateA.getTime();
                });

                setTrips(list);
            } catch (error) {
                console.error("Error loading trips:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTrips();
    }, [user, loading]);

    return (
        <PlannerLayout>
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full mb-24 lg:mb-0">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black mb-2 text-gray-900 dark:text-white tracking-tight">My Trips</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Browse, manage, and view your created itineraries.</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((skeleton) => (
                            <div key={skeleton} className="h-[340px] bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : trips.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map(trip => (
                            <div key={trip.id} className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[280px]">
                                <div>
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-[#38BDF8] rounded-2xl flex items-center justify-center text-xl mb-4 font-bold border border-blue-100 dark:border-blue-800/30">
                                        ✈️
                                    </div>
                                    <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-2 line-clamp-1">
                                        {trip.title || "Untitled Trip"}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                        {trip.description || "No description provided."}
                                    </p>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Link href={`/edit-trip/${trip.id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-xl transition-all text-center shadow-lg shadow-blue-500/30">
                                        Edit
                                    </Link>
                                    <Link href={`/trip/${trip.shareId}`} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold px-4 py-3 rounded-xl transition-all text-center border border-gray-200 dark:border-gray-700">
                                        View
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center shadow-sm max-w-2xl mx-auto">
                        <div className="text-5xl mb-4">🗺️</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No trips found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">You haven't created any trips yet. Start planning your first adventure!</p>
                        <Link href="/create-trip" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                            ➕ Create New Trip
                        </Link>
                    </div>
                )}
            </div>
        </PlannerLayout>
    );
}
