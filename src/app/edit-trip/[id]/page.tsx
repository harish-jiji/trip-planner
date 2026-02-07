"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function EditTripPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const fetchTrip = async () => {
            const ref = doc(db, "trips", id as string);
            const snap = await getDoc(ref);

            if (!snap.exists()) return;
            if (snap.data().ownerId !== user?.uid) {
                router.push("/dashboard");
                return;
            }

            setTitle(snap.data().title);
            setDescription(snap.data().description || "");
        };

        if (user) fetchTrip();
    }, [id, user, router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        await updateDoc(doc(db, "trips", id as string), {
            title,
            description,
        });

        router.push("/dashboard");
    };

    return (
        <form onSubmit={handleUpdate}>
            <h1>Edit Trip</h1>

            <input
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit">Update</button>
        </form>
    );
}
