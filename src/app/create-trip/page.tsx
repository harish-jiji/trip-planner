"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";

export default function CreateTripPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const tripId = uuidv4();

        await setDoc(doc(db, "trips", tripId), {
            ownerId: user.uid,
            title,
            description,
            isPublic: true,
            shareId: tripId, // SAME as doc ID
            locations: [],
            createdAt: serverTimestamp(),
        });

        router.push("/dashboard");
    };

    return (
        <form onSubmit={handleCreate}>
            <h1>Create Trip</h1>

            <input
                type="text"
                placeholder="Trip title"
                required
                onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
                placeholder="Description (optional)"
                onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit">Create Trip</button>
        </form>
    );
}
