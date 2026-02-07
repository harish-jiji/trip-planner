"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Trip = {
    id: string;
    title: string;
};

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login"); // Fixed: User mentioned /login previously, assuming exists or will exist or should redirect to auth page.
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        const fetchTrips = async () => {
            const q = query(
                collection(db, "trips"),
                where("ownerId", "==", user.uid)
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                title: doc.data().title,
            }));

            setTrips(data);
        };

        fetchTrips();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this trip?")) return;
        await deleteDoc(doc(db, "trips", id));
        setTrips(trips.filter((t) => t.id !== id));
    };

    if (loading) return <p>Loading...</p>;

    return (
        <main>
            <h1>My Trips</h1>

            <button onClick={() => router.push("/create-trip")}>
                + Create Trip
            </button>

            {trips.length === 0 && <p>No trips yet</p>}

            <ul>
                {trips.map((trip) => (
                    <li key={trip.id}>
                        {trip.title}
                        <button onClick={() => handleDelete(trip.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </main>
    );
}
