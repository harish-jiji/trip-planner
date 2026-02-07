"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Trip = {
    id: string;
    title: string;
    shareId: string;
};

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
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
                shareId: doc.data().shareId,
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

    const copyShareLink = async (shareId: string) => {
        const link = `${window.location.origin}/trip/${shareId}`;

        // Modern clipboard API
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(link);
            alert("Share link copied!");
            return;
        }

        // Fallback (older browsers)
        const textArea = document.createElement("textarea");
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        alert("Share link copied!");
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
                    <li key={trip.id} style={{ marginBottom: "1rem" }}>
                        <span style={{ marginRight: "1rem" }}>{trip.title}</span>
                        <button onClick={() => router.push(`/edit-trip/${trip.id}`)} style={{ marginRight: "0.5rem" }}>
                            Edit
                        </button>
                        <button
                            onClick={() => copyShareLink(trip.shareId)}
                            style={{ marginRight: "0.5rem" }}
                        >
                            Copy Share Link
                        </button>
                        <button onClick={() => handleDelete(trip.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </main>
    );
}
