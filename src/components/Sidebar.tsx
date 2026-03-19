"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { auth } from "@/lib/firebaseAuth";
import { LayoutDashboard, PlusCircle, Map, Inbox, Users, User, LogOut } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { notifications } = useNotifications();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    const handleLogout = async () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        try {
            await auth.signOut();
            router.replace("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const links = [
        { href: "/dashboard", label: "Dashboard", key: "dashboard", icon: <LayoutDashboard size={20} /> },
        { href: "/create-trip", label: "Create Trip", key: "create-trip", icon: <PlusCircle size={20} /> },
        { href: "/received-trips", label: "Received Trips", key: "received-trips", icon: <Inbox size={20} /> },
        { href: "/find-friends", label: "Find Friends", key: "find-friends", icon: <Users size={20} /> },
        { href: "/profile", label: "Profile", key: "profile", icon: <User size={20} /> },
    ];

    if (!user) return null;

    return (
        <aside className="w-64 bg-white dark:bg-[#0F172A] border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        <Map size={24} />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-[#38BDF8] tracking-tight">
                        Trip Planner
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                                isActive 
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-[#38BDF8]" 
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{link.icon}</span>
                                {link.label}
                            </div>
                            
                            {/* Notifications Badges */}
                            {link.key === "received-trips" && notifications.receivedTrips > 0 && (
                                <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    {notifications.receivedTrips}
                                </span>
                            )}
                            {link.key === "find-friends" && notifications.friendRequests > 0 && (
                                <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                    {notifications.friendRequests}
                                </span>
                            )}
                            {link.key === "profile" && notifications.profileIncomplete && (
                                <div className="ml-auto bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-400/50 shadow-sm flex items-center gap-1">
                                    <span className="text-[10px]">⚠️</span> Fix
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                    {user.email}
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>

            {mounted && showLogoutModal && createPortal(
                <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-slate-900 p-6 rounded-xl w-[90%] max-w-sm shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2">Logout</h2>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to log out?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmLogout} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </aside>
    );
}
