"use client";

import PlannerLayout from "@/components/PlannerLayout";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FriendProfile() {
    const { uid } = useParams();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (!uid || typeof uid !== "string") return;
            try {
                const snap = await getDoc(doc(db, "users", uid));
                if (snap.exists()) {
                    setUserProfile(snap.data());
                } else {
                    setUserProfile(null);
                }
            } catch (err) {
                console.error("Error loading user profile", err);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [uid]);

    return (
        <PlannerLayout>
            <div className="p-6 md:p-8 max-w-4xl mx-auto w-full mb-20 lg:mb-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium flex items-center gap-2 mb-4 transition-colors"
                        >
                            <span>←</span> Back
                        </button>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Traveler Profile</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">View details and information about this traveler.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm text-center">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 max-w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-4 max-w-full"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 max-w-full"></div>
                        </div>
                    </div>
                ) : !userProfile ? (
                    <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center shadow-sm">
                        <div className="text-5xl mb-4 opacity-50">👤</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">User not found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">The traveler you are looking for does not exist or their account has been deleted.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 h-32 relative"></div>
                        
                        <div className="px-8 pb-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8 relative">
                                <div className="w-32 h-32 bg-white dark:bg-[#0F172A] rounded-full p-2 shadow-lg">
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center text-5xl border border-gray-100 dark:border-gray-800">
                                        {userProfile.name?.charAt(0)?.toUpperCase() || "👤"}
                                    </div>
                                </div>
                                <div className="text-center sm:text-left mb-2">
                                    <div className="flex items-center justify-center sm:justify-start gap-3">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{userProfile.name || "Traveler"}</h2>
                                        {userProfile.verifiedProfile && (
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800/50 flex items-center gap-1 shadow-sm h-fit">
                                                <span className="text-xs">✓</span> Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">@{userProfile.username || "username"}</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="text-teal-500">📋</span> Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 p-4 rounded-xl">
                                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                                            <p className="text-gray-900 dark:text-white font-medium break-all">{userProfile.email || "N/A"}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 p-4 rounded-xl">
                                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Date of Birth</p>
                                            <p className="text-gray-900 dark:text-white font-medium">{userProfile.dob || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800" />

                                {/* Address View */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="text-teal-500">📍</span> Address Details
                                    </h3>
                                    
                                    {userProfile.addressVisibility === "public" ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="md:col-span-2 bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 p-4 rounded-xl">
                                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">House Name / Apartment</p>
                                                <p className="text-gray-900 dark:text-white font-medium">{userProfile.houseName || "N/A"}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 p-4 rounded-xl">
                                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">District / City</p>
                                                <p className="text-gray-900 dark:text-white font-medium">{userProfile.district || "N/A"}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 p-4 rounded-xl">
                                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">State / Region</p>
                                                <p className="text-gray-900 dark:text-white font-medium">{userProfile.state || "N/A"}</p>
                                            </div>
                                            <div className="md:col-span-2 bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 p-4 rounded-xl">
                                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Pincode / ZIP Code</p>
                                                <p className="text-gray-900 dark:text-white font-medium">{userProfile.pincode || "N/A"}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                                            <div className="text-3xl mb-2 opacity-50">🔒</div>
                                            <p className="font-bold text-gray-900 dark:text-white mb-1">Address is Private</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">This traveler has chosen to keep their location information private.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PlannerLayout>
    );
}
