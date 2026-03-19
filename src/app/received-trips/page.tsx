"use client";

import PlannerLayout from "@/components/PlannerLayout";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc } from "firebase/firestore";
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
                for (const d of snap.docs) {
                    const recData = d.data();
                    let tripTitle = "Private Trip";
                    let shareId = recData.tripId;
                    
                    try {
                        const tripSnap = await getDoc(doc(db, "trips", recData.tripId));
                        if(tripSnap.exists()) {
                            tripTitle = tripSnap.data().title || "Untitled Trip";
                            shareId = tripSnap.data().shareId || recData.tripId;
                        }
                    } catch (e) {
                        console.error("Failed to load underlying trip data:", e);
                    }

                    list.push({ 
                        id: d.id, 
                        ...recData, 
                        title: tripTitle,
                        shareId: shareId
                    });
                }

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
                isPublic: false,
                sharedWithFriends: [],
                createdAt: new Date(),
                shareId: Math.random().toString(36).substring(2, 10),
                copiedFrom: tripId
            });

            // Delete original received document avoiding duplicates
            await deleteDoc(doc(db, "receivedTrips", receivedTripId));

            alert("Trip successfully added to your Dashboard!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error adding trip:", error);
            alert("Failed to copy trip to your account.");
        } finally {
            setAdding(null);
        }
    };

    const handleDelete = async (receivedId: string) => {
        try {
            await deleteDoc(doc(db, "receivedTrips", receivedId));
            setTrips(prev => prev.filter(t => t.id !== receivedId));
            alert("Trip successfully removed!");
        } catch (err) {
            console.error(err);
            alert("Error deleting trip");
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
                            <div key={trip.id} className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize truncate pr-4">{trip.title}</h3>
                                    <span className="text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md shrink-0">
                                        from {trip.fromUserName || "friend"}
                                    </span>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Link
                                        href={`/trip/${trip.shareId}`}
                                        className="flex-1 min-w-[90px] text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                                    >
                                        View
                                    </Link>
                                    <button
                                        onClick={() => addTripToMyTrips(trip.tripId, trip.id)}
                                        disabled={adding === trip.id}
                                        className="flex-1 min-w-[90px] bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
                                    >
                                        {adding === trip.id ? "Cloning" : "Clone"}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(trip.id)}
                                        className="flex-1 min-w-[90px] bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold py-2.5 rounded-xl transition-colors text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-400">No shared trips</p>
                )}
            </div>
        </PlannerLayout>
    );
}
