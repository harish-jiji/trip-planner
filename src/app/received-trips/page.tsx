"use client";

import PlannerLayout from "@/components/PlannerLayout";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReceivedTripsPage() {
    const { user } = useAuth();
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        const loadTrips = async () => {
            try {
                const q = query(
                    collection(db, "receivedTrips"),
                    where("toUserId", "==", user.uid)
                );

                const snap = await getDocs(q);

                const list: any[] = [];
                snap.forEach(doc => {
                    list.push({ id: doc.id, ...doc.data() });
                });

                setTrips(list);
            } catch (error) {
                console.error("Failed to load received trips:", error);
            } finally {
                setLoading(false);
            }
        };

        loadTrips();
    }, [user]);

    const addTripToMyTrips = async (tripId: string, receivedTripId: string) => {
        if (!user) return;
        setAdding(receivedTripId);
        
        try {
            const tripRef = doc(db, "trips", tripId);
            const tripSnap = await getDoc(tripRef);

            if (!tripSnap.exists()) {
                alert("Original trip could not be found. It may have been deleted.");
                setAdding(null);
                return;
            }

            const data = tripSnap.data();

            // Clone to my trips
            await addDoc(collection(db, "trips"), {
                ...data,
                ownerId: user.uid,
                createdAt: new Date(),
                // Generate a new share ID since this is a new fork
                shareId: Math.random().toString(36).substring(2, 10)
            });

            alert("Trip successfully added to your Dashboard!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error adding trip:", error);
            alert("Failed to copy trip to your account.");
        } finally {
            setAdding(null);
        }
    };

    return (
        <PlannerLayout>
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Received Trips</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">View itineraries shared directly with you by other travelers.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>
                        </div>
                    </div>
                ) : trips.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {trips.map(trip => (
                            <div key={trip.id} className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-shadow gap-6 w-full">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-2xl text-2xl font-bold shadow-inner shrink-0">
                                        📥
                                    </div>
                                    <div className="text-left w-full">
                                        <p className="font-bold text-lg text-gray-900 dark:text-white">Trip from friend</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium font-mono bg-gray-50 dark:bg-gray-800 inline-block px-2 py-1 rounded-md mt-1 border border-gray-100 dark:border-gray-700">Trip ID: {trip.tripId}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                                    <Link
                                        href={`/trip/${trip.tripId}`}
                                        className="flex-1 sm:flex-none text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold px-6 py-3 rounded-xl transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => addTripToMyTrips(trip.tripId, trip.id)}
                                        disabled={adding === trip.id}
                                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-green-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 border border-green-500"
                                    >
                                        {adding === trip.id ? "Adding..." : "Clone Trip"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center shadow-sm">
                        <div className="text-5xl mb-4 opacity-50">📥</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Inbox Empty</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">No trips received yet. Trips shared by friends will appear here.</p>
                    </div>
                )}
            </div>
        </PlannerLayout>
    );
}
