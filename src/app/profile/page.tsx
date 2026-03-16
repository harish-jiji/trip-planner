"use client";

import PlannerLayout from "@/components/PlannerLayout";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    
    const [profile, setProfile] = useState<any>({
        name: "",
        username: "",
        email: "",
        dob: "",
        state: "",
        district: "",
        houseName: "",
        pincode: "",
        q1: "",
        q2: "",
        q3: "",
        addressVisibility: "public",
        verifiedProfile: false
    });

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.uid) return;
            
            try {
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);
                
                if (snap.exists()) {
                    setProfile({ ...profile, ...snap.data() });
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    const handleChange = (e: any) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
        setSuccess("");
        setError("");
    };

    const saveProfile = async (e: any) => {
        e.preventDefault();
        
        if (!user?.uid) return;
        setSaving(true);
        setError("");
        
        try {
            const ref = doc(db, "users", user.uid);
            
            const verified = Boolean(
                profile.dob &&
                profile.state &&
                profile.district &&
                profile.houseName &&
                profile.pincode &&
                profile.q1 &&
                profile.q2 &&
                profile.q3
            );

            await updateDoc(ref, {
                ...profile,
                verifiedProfile: verified
            });
            
            setProfile({ ...profile, verifiedProfile: verified });
            setSuccess("Profile updated successfully!");
        } catch (err: any) {
            setError(err.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const deleteAccount = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            const email = currentUser.email;
            if (!email) return;

            setDeleting(true);

            // REAUTHENTICATE FIRST
            const credential = EmailAuthProvider.credential(
                email,
                confirmPassword
            );
            await reauthenticateWithCredential(currentUser, credential);

            const uid = currentUser.uid;

            // 1. DELETE USER TRIPS
            const tripsQuery = query(collection(db, "trips"), where("ownerId", "==", uid));
            const tripsSnap = await getDocs(tripsQuery);
            for (const trip of tripsSnap.docs) {
                await deleteDoc(doc(db, "trips", trip.id));
            }

            // 2. DELETE FRIEND REQUESTS SENT
            const sentRequests = query(collection(db, "friendRequests"), where("fromUserId", "==", uid));
            const sentSnap = await getDocs(sentRequests);
            for (const req of sentSnap.docs) {
                await deleteDoc(doc(db, "friendRequests", req.id));
            }

            // 3. DELETE FRIEND REQUESTS RECEIVED
            const receivedRequests = query(collection(db, "friendRequests"), where("toUserId", "==", uid));
            const receivedSnap = await getDocs(receivedRequests);
            for (const req of receivedSnap.docs) {
                await deleteDoc(doc(db, "friendRequests", req.id));
            }

            // 4. DELETE FRIENDS
            const friendsA = query(collection(db, "friends"), where("userA", "==", uid));
            const friendsB = query(collection(db, "friends"), where("userB", "==", uid));
            const friendsSnapA = await getDocs(friendsA);
            const friendsSnapB = await getDocs(friendsB);
            
            for (const f of friendsSnapA.docs) {
                await deleteDoc(doc(db, "friends", f.id));
            }
            for (const f of friendsSnapB.docs) {
                await deleteDoc(doc(db, "friends", f.id));
            }

            // 5. DELETE RECEIVED TRIPS
            const receivedTrips = query(collection(db, "receivedTrips"), where("toUserId", "==", uid));
            const receivedTripsSnap = await getDocs(receivedTrips);
            for (const trip of receivedTripsSnap.docs) {
                await deleteDoc(doc(db, "receivedTrips", trip.id));
            }

            // 6. DELETE SHARED TRIPS
            const sharedTrips = query(collection(db, "receivedTrips"), where("fromUserId", "==", uid));
            const sharedTripsSnap = await getDocs(sharedTrips);
            for (const trip of sharedTripsSnap.docs) {
                await deleteDoc(doc(db, "receivedTrips", trip.id));
            }

            // 7. DELETE USER PROFILE
            await deleteDoc(doc(db, "users", uid));

            // 8. DELETE AUTH ACCOUNT
            await deleteUser(currentUser);

            alert("Account deleted permanently");
            router.replace("/");

        } catch (error: any) {
            console.error("Account deletion error:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                alert("Incorrect password. Please try again.");
            } else if (error.code === 'auth/requires-recent-login') {
                alert("For security purposes, please log out and log back in before deleting your account.");
            } else {
                alert("Failed to delete account. Please ensure your password is correct.");
            }
            setDeleting(false);
            setShowDelete(false);
        }
    };

    return (
        <PlannerLayout>
            <div className="p-6 md:p-8 max-w-4xl mx-auto w-full mb-20 lg:mb-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">User Profile</h1>
                            {profile.verifiedProfile && (
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-200 dark:border-green-800/50 flex items-center gap-1 shadow-sm">
                                    <span className="text-sm">✓</span> Verified
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Manage your personal settings, address, and security information.</p>
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
                ) : (
                    <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 relative"></div>
                        
                        <div className="px-8 pb-8">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8 relative">
                                <div className="w-32 h-32 bg-white dark:bg-[#0F172A] rounded-full p-2 shadow-lg">
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center text-5xl border border-gray-100 dark:border-gray-800">
                                        {profile.name?.charAt(0)?.toUpperCase() || "👤"}
                                    </div>
                                </div>
                                <div className="text-center sm:text-left mb-2">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{profile.name || "Traveler"}</h2>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">@{profile.username || "username"}</p>
                                </div>
                            </div>

                            <form onSubmit={saveProfile} className="space-y-8">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="text-blue-500">📋</span> Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Full Name</label>
                                            <input
                                                name="name"
                                                value={profile.name}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Username</label>
                                            <input
                                                name="username"
                                                value={profile.username}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="johndoe123"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email <span className="text-gray-400 font-normal">(Cannot be changed)</span></label>
                                            <input
                                                name="email"
                                                value={profile.email}
                                                disabled
                                                className="w-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Date of Birth</label>
                                            <input
                                                name="dob"
                                                value={profile.dob}
                                                onChange={handleChange}
                                                type="date"
                                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800" />

                                {/* Address */}
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="text-blue-500">📍</span> Address Details
                                        </h3>
                                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Visibility:</label>
                                            <select
                                                name="addressVisibility"
                                                value={profile.addressVisibility || "public"}
                                                onChange={handleChange}
                                                className="bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                                            >
                                                <option value="public" className="bg-white dark:bg-gray-800">Public</option>
                                                <option value="private" className="bg-white dark:bg-gray-800">Private</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">House Name / Apartment</label>
                                            <input
                                                name="houseName"
                                                value={profile.houseName}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="123 Travel Lane"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">District / City</label>
                                            <input
                                                name="district"
                                                value={profile.district}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="Metropolis"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">State / Province</label>
                                            <input
                                                name="state"
                                                value={profile.state}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="New York"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Pincode / Zip</label>
                                            <input
                                                name="pincode"
                                                value={profile.pincode}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="10001"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800" />

                                {/* Security Questions */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span className="text-blue-500">🔒</span> Password Recovery Security Questions
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">These questions are used to verify your identity if you ever forget your password.</p>
                                    
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Q1: Where was the destination of your most memorable school field trip?</label>
                                            <input
                                                name="q1"
                                                value={profile.q1}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="Your answer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Q2: What is the name of your favorite travel companion?</label>
                                            <input
                                                name="q2"
                                                value={profile.q2}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="Your answer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Q3: Where is your dream destination?</label>
                                            <input
                                                name="q3"
                                                value={profile.q3}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="Your answer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Messages */}
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold border border-red-100 dark:border-red-800/30">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-bold border border-green-100 dark:border-green-800/30 flex items-center justify-between">
                                        <span>{success}</span>
                                        {!profile.verifiedProfile && (
                                            <span className="text-xs opacity-75 hidden sm:inline">Fill all fields to earn your verification badge!</span>
                                        )}
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                                    >
                                        {saving ? "Saving Changes..." : "Save Profile Details"}
                                    </button>
                                </div>
                            </form>
                            
                            {/* Danger Zone */}
                            <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-8">
                                <h3 className="text-red-600 dark:text-red-500 font-bold mb-2 flex items-center gap-2">
                                    <span className="text-xl">⚠️</span> Danger Zone
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                    Permanently delete your account, your trips, and all relationships. This action is irreversible.
                                </p>
                                <button
                                    onClick={() => setShowDelete(true)}
                                    className="bg-white dark:bg-[#0F172A] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-6 py-3 rounded-xl font-bold transition-all shadow-sm block w-full sm:w-auto"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Warning Modal */}
            {showDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
                        
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center rounded-2xl text-3xl mb-6 shadow-sm border border-red-200 dark:border-red-800/30">
                            🗑️
                        </div>

                        <h2 className="text-2xl font-black mb-3 text-gray-900 dark:text-white">
                            Delete Account
                        </h2>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium leading-relaxed">
                            This will <strong className="text-gray-900 dark:text-white">permanently delete</strong> your account and all your data including your trips, friends, and received itineraries. This action cannot be undone.
                        </p>

                        <div className="mb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type <span className="text-red-600 select-none">DELETE</span> to confirm:</label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold text-center uppercase"
                                    placeholder="DELETE"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">For security, please enter your password to confirm account deletion:</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium placeholder-gray-400"
                                    placeholder="Enter your password..."
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={deleteAccount}
                                disabled={deleting || deleteConfirmText !== "DELETE"}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 text-white px-4 py-3 rounded-xl font-bold shadow-md shadow-red-500/20 transition-all shrink-0 order-1 sm:order-2"
                            >
                                {deleting ? "Deleting Data..." : "Permanently Delete"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDelete(false);
                                    setDeleteConfirmText("");
                                    setConfirmPassword("");
                                }}
                                disabled={deleting}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-bold transition-all order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PlannerLayout>
    );
}
