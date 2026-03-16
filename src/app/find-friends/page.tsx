"use client";

import PlannerLayout from "@/components/PlannerLayout";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function FindFriendsPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sentRequests, setSentRequests] = useState<string[]>([]);
    const [friends, setFriends] = useState<any[]>([]);

    useEffect(() => {
        const loadFriends = async () => {
            if (!user?.uid) return;
            try {
                const q1 = query(collection(db, "friends"), where("userA", "==", user.uid));
                const q2 = query(collection(db, "friends"), where("userB", "==", user.uid));
                
                const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
                
                const friendIds: string[] = [];
                snap1.forEach(d => friendIds.push(d.data().userB));
                snap2.forEach(d => friendIds.push(d.data().userA));

                const loadedFriends: any[] = [];
                for (const fId of friendIds) {
                    const userRef = doc(db, "users", fId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        loadedFriends.push({ id: userSnap.id, ...userSnap.data() });
                    }
                }
                
                setFriends(loadedFriends);
            } catch (err) {
                console.error("Failed to load friends", err);
            }
        };
        loadFriends();
    }, [user]);

    const searchUser = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!search.trim()) return;
        
        setLoading(true);
        setError("");
        
        try {
            const usersRef = collection(db, "users");
            
            const q1 = query(usersRef, where("username", "==", search.trim()));
            const q2 = query(usersRef, where("email", "==", search.trim()));
            
            const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
            
            const listMap = new Map();
            
            snap1.forEach(doc => {
                if (doc.id !== user?.uid) {
                    listMap.set(doc.id, { id: doc.id, ...doc.data() });
                }
            });
            
            snap2.forEach(doc => {
                if (doc.id !== user?.uid) {
                    listMap.set(doc.id, { id: doc.id, ...doc.data() });
                }
            });
            
            const list = Array.from(listMap.values());
            setResults(list);
            
            if (list.length === 0) {
                setError("No users found matching that exact username or email.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to search users.");
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (targetUser: any) => {
        if (!user) return;
        
        try {
            const targetId = targetUser.uid || targetUser.id;
            await addDoc(collection(db, "friendRequests"), {
                fromUserId: user.uid,
                fromUserEmail: user.email,
                toUserId: targetId,
                status: "pending",
                createdAt: new Date()
            });
            setSentRequests([...sentRequests, targetId]);
        } catch (err) {
            console.error("Failed to send request", err);
        }
    };

    return (
        <PlannerLayout>
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Find Friends</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Search for travel buddies to share your next adventure.</p>
                    </div>
                    <Link href="/friend-requests" className="px-5 py-2.5 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-all text-gray-900 dark:text-white shrink-0">
                        <span>🔔</span> Requests
                    </Link>
                </div>

                {friends.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight flex items-center gap-2">
                            <span>🤝</span> My Friends
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {friends.map(friend => (
                                <div key={friend.id} className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center rounded-xl text-xl font-bold shadow-inner shrink-0 leading-none">
                                            {friend.name ? friend.name.charAt(0).toUpperCase() : "F"}
                                        </div>
                                        <div className="truncate">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm truncate capitalize">{friend.name || "Unknown User"}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">@{friend.username}</p>
                                        </div>
                                    </div>
                                    <Link href={`/user/${friend.id}`} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-lg border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors whitespace-nowrap shadow-sm">
                                        View
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm mb-8">
                    <form onSubmit={searchUser} className="flex flex-col md:flex-row gap-4 relative">
                        <div className="flex-1 relative">
                            <input
                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-5 py-4 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400"
                                placeholder="Search by exact username or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !search.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 shrink-0"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-4 font-bold px-2">{error}</p>}
                </div>

                {results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map(u => {
                            const targetId = u.uid || u.id;
                            const isSent = sentRequests.includes(targetId);
                            return (
                                <div key={u.id} className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center rounded-2xl text-2xl font-bold shadow-inner">
                                            {u.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-gray-900 dark:text-white capitalize">{u.name || "Unknown User"}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">@{u.username}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => !isSent && sendRequest(u)}
                                        disabled={isSent}
                                        className={`w-full py-3 rounded-xl font-bold transition-all ${isSent ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700' : 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'}`}
                                    >
                                        {isSent ? "Request Sent" : "Add Friend"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PlannerLayout>
    );
}
