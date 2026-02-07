"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicTripPage() {
    const { shareId } = useParams();
    const [trip, setTrip] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const ref = doc(db, "trips", shareId as string);
                const snap = await getDoc(ref);

                if (!snap.exists()) {
                    setError("Trip not found");
                    return;
                }

                setTrip(snap.data());
            } catch (err) {
                console.error(err);
                setError("Permission denied");
            }
        };

        fetchTrip();
    }, [shareId]);

    if (error) return <p>{error}</p>;
    if (!trip) return <p>Loading...</p>;

    return (
        <main>
            <h1>{trip.title}</h1>
            <p>{trip.description}</p>
            {/* <p>Locations: {trip.locations.length}</p> */}
        </main>
    );
}
