"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import PlannerLayout from "@/components/PlannerLayout";
import TripCard from "@/components/TripCard";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoadingTrips, setIsLoadingTrips] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (!loading && !user) router.push("/login");
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;
        const fetchTrips = async () => {
            setIsLoadingTrips(true);
            try {
                const q = query(
                    collection(db, "trips"),
                    where("ownerId", "==", user.uid)
                );
                const snapshot = await getDocs(q);
                setTrips(snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })));
            } catch (error) {
                showToast("Failed to load trips");
            } finally {
                setIsLoadingTrips(false);
            }
        };
        fetchTrips();
    }, [user]);

    const handleDelete = async (id: string, shareId: string) => {
        if (!confirm("Delete this trip?")) return;
        setDeletingId(id);
        try {
            await deleteDoc(doc(db, "trips", shareId)); 
            setTrips((prev) => prev.filter((t) => t.id !== id));
            showToast("Trip deleted successfully");
        } catch (error) {
            showToast("Error deleting trip");
        } finally {
            setDeletingId(null);
        }
    };

    const copyShareLink = async (shareId: string) => {
        const link = `${window.location.origin}/trip/${shareId}`;
        try {
            await navigator.clipboard.writeText(link);
            showToast("Share link copied! 🔗");
        } catch (err) {
            showToast("Failed to copy link");
        }
    };

    const calculateCost = (locations: any[]) => {
        if (!locations) return 0;
        return locations.reduce((sum: number, loc: any) => {
            const exp = loc.expenses;
            if (!exp) return sum;
            return sum + (exp.entry || 0) + (exp.food || 0) + (exp.travel || 0) + (exp.other || 0);
        }, 0);
    }

    if (loading) return null;

    return (
        <PlannerLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-2">My Trips</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">Manage all your planned adventures</p>
                    </div>
                    <Link href="/create-trip">
                        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                            <span>+</span>
                            <span>Create New Trip</span>
                        </button>
                    </Link>
                </div>

                {isLoadingTrips ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[340px] bg-white dark:bg-[#1E293B] rounded-3xl animate-pulse shadow-sm border border-gray-100 dark:border-gray-800"></div>
                        ))}
                    </div>
                ) : trips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 px-4 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm border-dashed">
                        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">✈️</div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">No trips yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 text-lg">Start planning your next adventure today. Add locations, invite friends, and hit the road.</p>
                        <Link href="/create-trip">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg transition-transform hover:-translate-y-1">
                                Plan Your First Trip
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {trips.map((trip) => (
                            <TripCard 
                                key={trip.id} 
                                trip={trip} 
                                cost={calculateCost(trip.locations)}
                                onDelete={handleDelete}
                                onCopyShareLink={copyShareLink}
                                isDeleting={deletingId === trip.id}
                            />
                        ))}
                        
                        {/* Empty Slate / New Trip Card */}
                        <Link href="/create-trip" className="h-[340px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group cursor-pointer">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 flex items-center justify-center text-2xl text-gray-400 group-hover:text-blue-600 dark:text-gray-500 transition-colors mb-4">
                                ➕
                            </div>
                            <span className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">Plan new trip</span>
                        </Link>
                    </div>
                )}
            </div>
        </PlannerLayout>
    );
}
