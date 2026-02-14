"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import TripForm, { TripFormData } from "@/components/TripForm";

export default function CreateTripPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const handleCreate = async (data: TripFormData) => {
        if (!user) return;
        setSaving(true);
        try {
            const shareId = uuidv4();

            await setDoc(doc(db, "trips", shareId), {
                shareId,
                ownerId: user.uid,
                title: data.title,
                description: data.description,
                mode: data.mode,
                locations: data.locations,
                isPublic: true,
                createdAt: serverTimestamp(),
            });

            router.push("/dashboard");
        } catch (error) {
            console.error("Error creating trip:", error);
            alert("Failed to create trip.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h1>Create New Trip</h1>
            <TripForm
                isSaving={saving}
                onSave={handleCreate}
                submitButtonText="Create Trip"
            />
        </div>
    );
}
