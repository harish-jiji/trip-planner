"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import TripForm, { TripFormData } from "@/components/TripForm";
import type { TravelMode } from "@/types/trip";

export default function EditTripPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [initialData, setInitialData] = useState<TripFormData | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTrip = async () => {
            const ref = doc(db, "trips", id as string);
            const snap = await getDoc(ref);

            if (!snap.exists()) return;
            if (snap.data().ownerId !== user?.uid) {
                router.push("/dashboard");
                return;
            }

            setInitialData({
                title: snap.data().title,
                description: snap.data().description || "",
                locations: snap.data().locations || [],
                mode: (snap.data().mode as TravelMode) || "car",
            });
            setLoading(false);
        };

        if (user) {
            fetchTrip();
        }
    }, [id, user, router]);

    const handleUpdate = async (data: TripFormData) => {
        setSaving(true);
        try {
            await updateDoc(doc(db, "trips", id as string), {
                title: data.title,
                description: data.description,
                locations: data.locations,
                mode: data.mode,
            });
            alert("Trip updated successfully!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error updating trip:", error);
            alert("Failed to update trip.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>Loading trip...</div>;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h1>Edit Trip</h1>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                <button
                    type="button"
                    onClick={() => {
                        const url = `${window.location.origin}/trip/${id}`;
                        navigator.clipboard.writeText(url);
                        alert("Public link copied to clipboard!\n" + url);
                    }}
                    style={{
                        background: "#3b82f6",
                        color: "white",
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "500"
                    }}
                >
                    🔗 Share Link
                </button>
            </div>

            <TripForm
                initialData={initialData}
                isSaving={saving}
                onSave={handleUpdate}
                submitButtonText="Save Updates"
            />
        </div>
    );
}
