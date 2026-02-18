"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import TripForm, { TripFormData } from "@/components/TripForm";
import Navbar from "@/components/Navbar";
import { Container } from "@/components/ui/Container";

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
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <Container>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Trip</h1>
                <TripForm
                    isSaving={saving}
                    onSave={handleCreate}
                    submitButtonText="Create Trip"
                />
            </Container>
        </div>
    );
}
