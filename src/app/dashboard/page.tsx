"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

type Trip = {
    id: string;
    title: string;
    description?: string;
    shareId: string;
    locations?: any[];
};

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoadingTrips, setIsLoadingTrips] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
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
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setTrips(data);
            } catch (error) {
                console.error("Error fetching trips:", error);
                showToast("Failed to load trips");
            } finally {
                setIsLoadingTrips(false);
            }
        };

        fetchTrips();
    }, [user]);

    const handleDelete = async (id: string, shareId: string) => {
        if (!confirm("Delete this trip?")) return;
        try {
            await deleteDoc(doc(db, "trips", shareId)); // Using shareId as doc ID based on previous context
            // Fallback if that fails or if architecture is mixed, try deleting by ID if needed. 
            // Ideally we know the exact doc ID. Assuming shareId IS the doc ID as per architecture refactor.
            setTrips(trips.filter((t) => t.id !== id && t.shareId !== shareId));
            showToast("Trip deleted successfully");
        } catch (error) {
            console.error("Error deleting trip:", error);
            showToast("Error deleting trip");
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
        return locations.reduce((sum, loc) => {
            const exp = loc.expenses;
            if (!exp) return sum;
            return sum + (exp.entry || 0) + (exp.food || 0) + (exp.travel || 0) + (exp.other || 0);
        }, 0);
    }

    if (loading) return null;

    return (
        <Container>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Trips</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all your planned adventures</p>
                </div>
                <Link href="/create-trip">
                    <Button>+ Create Trip</Button>
                </Link>
            </div>

            {isLoadingTrips ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : trips.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✈️</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No trips yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Start planning your next adventure today.</p>
                    <Link href="/create-trip">
                        <Button>Create your first trip</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => {
                        const cost = calculateCost(trip.locations || []);
                        return (
                            <Card key={trip.id} className="flex flex-col h-full hover:scale-[1.02] active:scale-[0.98]">
                                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mb-4 flex flex-col justify-between p-4 text-white shadow-inner relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="text-4xl filter drop-shadow-md">🗺️</div>
                                    <h3 className="text-lg font-bold line-clamp-1 text-white drop-shadow-sm">{trip.title}</h3>
                                </div>

                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                                    {trip.description || "No description provided."}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                                    <span className="flex items-center gap-1 font-medium">💰 ₹{cost}</span>
                                    <span className="w-px h-4 bg-gray-300 dark:bg-gray-700"></span>
                                    <span className="flex items-center gap-1">📍 {(trip.locations?.length || 0)} Stops</span>
                                </div>

                                <div className="mt-auto flex gap-2">
                                    <Link href={`/edit-trip/${trip.id}`} className="flex-1">
                                        <Button variant="secondary" className="w-full text-sm py-1.5 ">Edit</Button>
                                    </Link>
                                    <Button variant="ghost" onClick={() => copyShareLink(trip.shareId)} className="aspect-square p-0 w-10 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400" title="Share">
                                        🔗
                                    </Button>
                                    <Button variant="ghost" onClick={() => handleDelete(trip.id, trip.shareId)} className="aspect-square p-0 w-10 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" title="Delete">
                                        🗑️
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </Container>
    );
}
