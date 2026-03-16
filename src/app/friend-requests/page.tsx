"use client";

import PlannerLayout from "@/components/PlannerLayout";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function FriendRequests() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        const loadRequests = async () => {
            try {
                const q = query(
                    collection(db, "friendRequests"),
                    where("toUserId", "==", user.uid),
                    where("status", "==", "pending")
                );

                const snap = await getDocs(q);

                const list: any[] = [];
                snap.forEach(d => {
                    list.push({ id: d.id, ...d.data() });
                });

                setRequests(list);
            } catch (error) {
                console.error("Error loading requests:", error);
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, [user]);

    const acceptRequest = async (req: any) => {
        try {
            await updateDoc(doc(db, "friendRequests", req.id), {
                status: "accepted"
            });

            // Prevent duplicate friendships
            const q1 = query(collection(db, "friends"), where("userA", "==", req.fromUserId), where("userB", "==", req.toUserId));
            const q2 = query(collection(db, "friends"), where("userA", "==", req.toUserId), where("userB", "==", req.fromUserId));
            const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

            if (snap1.empty && snap2.empty) {
                await addDoc(collection(db, "friends"), {
                    userA: req.fromUserId,
                    userB: req.toUserId,
                    createdAt: serverTimestamp()
                });
            }

            setRequests(prev => prev.filter(r => r.id !== req.id));
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const rejectRequest = async (req: any) => {
        try {
            await updateDoc(doc(db, "friendRequests", req.id), {
                status: "rejected"
            });

            setRequests(prev => prev.filter(r => r.id !== req.id));
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };

    return (
        <PlannerLayout>
            <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Friend Requests</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Manage pending invitations to connect with other travelers.</p>
                    </div>
                     <Link href="/find-friends" className="px-5 py-2.5 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-all text-gray-900 dark:text-white shrink-0">
                        <span>🔍</span> Search Users
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                        </div>
                    </div>
                ) : requests.length > 0 ? (
                    <div className="space-y-4">
                        {requests.map(req => (
                            <div key={req.id} className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center shadow-sm gap-4 transition-all hover:shadow-md">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-xl text-xl font-bold shadow-inner">
                                        👤
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-bold text-lg text-gray-900 dark:text-white">{req.fromUserEmail || "A traveler"}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">wants to connect!</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => acceptRequest(req)}
                                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-green-500/30 hover:-translate-y-0.5 transition-all outline-none"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => rejectRequest(req)}
                                        className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-bold px-6 py-2.5 rounded-xl transition-all outline-none"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center shadow-sm">
                        <div className="text-5xl mb-4 opacity-50">📬</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No pending requests</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">When other travelers send you friend requests, they will appear here.</p>
                    </div>
                )}
            </div>
        </PlannerLayout>
    );
}
