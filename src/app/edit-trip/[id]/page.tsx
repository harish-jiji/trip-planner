"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import TripForm, { TripFormData } from "@/components/TripForm";
import type { TravelMode } from "@/types/trip";
import PlannerLayout from "@/components/PlannerLayout";

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

        if (user) fetchTrip();
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
        return (
            <PlannerLayout>
                <div className="flex items-center justify-center h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
                    <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-[#38BDF8] rounded-full animate-spin"></div>
                </div>
            </PlannerLayout>
        );
    }

    return (
        <PlannerLayout>
            <div className="h-full relative">
                <TripForm
                    initialData={initialData}
                    isSaving={saving}
                    onSave={handleUpdate}
                    submitButtonText="💾 Save Changes"
                />
                
                <button
                    type="button"
                    onClick={() => {
                        const url = `${window.location.origin}/trip/${id}`;
                        navigator.clipboard.writeText(url);
                        alert("Public link copied to clipboard!\n" + url);
                    }}
                    className="absolute top-4 right-4 z-50 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-lg px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    🔗 Share Trip Link
                </button>
            </div>
        </PlannerLayout>
    );
}
