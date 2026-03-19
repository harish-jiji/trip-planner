"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, arrayUnion } from "firebase/firestore";
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
    
    // Sharing State
    const [tripShareId, setTripShareId] = useState("");
    const [shareModal, setShareModal] = useState(false);
    const [friends, setFriends] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        const loadFriends = async () => {
            try {
                const q1 = query(collection(db, "friends"), where("userA", "==", user.uid));
                const q2 = query(collection(db, "friends"), where("userB", "==", user.uid));
                const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
                
                const friendIds: string[] = [];
                snap1.forEach(doc => friendIds.push(doc.data().userB));
                snap2.forEach(doc => friendIds.push(doc.data().userA));

                const loadedFriends: any[] = [];
                for (const fId of friendIds) {
                    const userRef = doc(db, "users", fId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        loadedFriends.push({ id: userSnap.id, ...userSnap.data() });
                    }
                }
                setFriends(loadedFriends);
            } catch (error) {
                console.error("Failed to load friends", error);
            }
        };
        loadFriends();
    }, [user]);

    useEffect(() => {
        const fetchTrip = async () => {
            const ref = doc(db, "trips", id as string);
            const snap = await getDoc(ref);

            if (!snap.exists()) return;
            if (snap.data().ownerId !== user?.uid) {
                router.push("/dashboard");
                return;
            }

            setTripShareId(snap.data().shareId || id);
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

    const shareTripWithFriend = async (friend: any) => {
        if (!user) return;
        try {
            const friendId = friend.id;

            await addDoc(collection(db, "receivedTrips"), {
                tripId: id,
                fromUserId: user.uid,
                fromUserName: user.displayName || user.email,
                toUserId: friendId,
                createdAt: new Date()
            });

            await updateDoc(doc(db, "trips", id as string), {
                sharedWithFriends: arrayUnion(friendId)
            });

            alert("Trip successfully shared with friend!");
            setShareModal(false);
        } catch (error) {
            console.error("Error sharing trip with friend:", error);
            alert("Failed to share trip.");
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
                <div className="absolute top-4 right-4 z-40 flex flex-wrap gap-2 justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            const url = `${window.location.origin}/trip/${tripShareId}`;
                            navigator.clipboard.writeText(url);
                            alert("Public link copied to clipboard!\n" + url);
                        }}
                        className="bg-blue-600 dark:bg-blue-600 border border-blue-500 hover:bg-blue-700 text-white shadow-lg px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                        🔗 Copy Link
                    </button>
                    <button
                        type="button"
                        onClick={() => setShareModal(true)}
                        className="bg-purple-600 dark:bg-purple-600 border border-purple-500 hover:bg-purple-700 text-white shadow-lg px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                        👥 Share With Friend
                    </button>
                </div>

                {shareModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Share With Friend</h3>
                                <button onClick={() => setShareModal(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-xl">✕</button>
                            </div>
                            
                            {friends.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-4">You have no friends on your list yet.</p>
                            ) : (
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {friends.map(friend => (
                                        <div key={friend.id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                                                    {friend.name ? friend.name.charAt(0).toUpperCase() : "F"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm capitalize">{friend.name || "Unknown User"}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[120px]">@{friend.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => shareTripWithFriend(friend)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-green-500/20 transition-all shrink-0"
                                            >
                                                Share
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PlannerLayout>
    );
}
