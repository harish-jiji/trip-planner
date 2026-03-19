"use client";

import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Users, User, LogOut, Inbox, Map as MapIcon } from "lucide-react";

export default function PlannerLayout({ children, hideSidebar = false }: { children: React.ReactNode, hideSidebar?: boolean }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    const { user } = useAuth();
    const { notifications } = useNotifications();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        setShowLogoutModal(true);
        setIsMobileMenuOpen(false);
    };

    const confirmLogout = async () => {
        try {
            await signOut(auth);
            router.replace("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] font-sans transition-colors">
            {!hideSidebar && user && (
                <>
                    <Sidebar />
                    {/* Mobile Header */}
                    <header className="md:hidden bg-white dark:bg-[#0F172A] border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-50">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                ✈️
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">Trip Planner</span>
                        </Link>
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-600 dark:text-gray-400"
                        >
                            {isMobileMenuOpen ? "✕" : "☰"}
                        </button>
                    </header>
                    
                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden fixed inset-0 top-[65px] bg-white dark:bg-[#0F172A] z-40 p-4 flex flex-col gap-2">
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-blue-500"><LayoutDashboard size={20} /></span> Dashboard
                            </Link>
                            <Link href="/create-trip" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="text-blue-500"><PlusCircle size={20} /></span> Create Trip
                            </Link>
                            <Link href="/received-trips" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex items-center gap-3 flex-1 flex-row justify-between">
                                <div className="flex items-center gap-3"><span className="text-blue-500"><Inbox size={20} /></span> Received Trips</div>
                                {notifications.receivedTrips > 0 && <span className="bg-red-600 text-xs text-white px-2 py-0.5 rounded-full">{notifications.receivedTrips}</span>}
                            </Link>
                            <Link href="/find-friends" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex items-center gap-3 flex-1 flex-row justify-between">
                                <div className="flex items-center gap-3"><span className="text-blue-500"><Users size={20} /></span> Find Friends</div>
                                {notifications.friendRequests > 0 && <span className="bg-red-600 text-xs text-white px-2 py-0.5 rounded-full">{notifications.friendRequests}</span>}
                            </Link>
                            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex items-center gap-3 flex-1 flex-row justify-between">
                                <div className="flex items-center gap-3"><span className="text-blue-500"><User size={20} /></span> Profile</div>
                                {notifications.profileIncomplete && <span className="bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-400/50">⚠️ Fix</span>}
                            </Link>
                            <button onClick={handleLogout} className="px-4 py-3 mt-auto border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl font-medium text-red-600 dark:text-red-400 flex items-center gap-3 text-left w-full">
                                <span><LogOut size={20} /></span> Logout
                            </button>
                        </div>
                    )}

                    {/* Mobile Bottom Navigation Component */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0F172A] border-t border-gray-100 dark:border-gray-800 flex justify-around py-3 pb-6 z-50 px-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                        <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${pathname === '/dashboard' ? 'text-blue-600 dark:text-[#38BDF8]' : 'text-gray-500 dark:text-gray-400'}`}>
                            <LayoutDashboard size={20} strokeWidth={pathname === '/dashboard' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Dash</span>
                        </Link>
                        <Link href="/create-trip" className={`flex flex-col items-center gap-1 ${pathname === '/create-trip' ? 'text-blue-600 dark:text-[#38BDF8]' : 'text-gray-500 dark:text-gray-400'}`}>
                            <PlusCircle size={20} strokeWidth={pathname === '/create-trip' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Create</span>
                        </Link>
                        <Link href="/find-friends" className={`flex flex-col items-center gap-1 relative ${pathname === '/find-friends' ? 'text-blue-600 dark:text-[#38BDF8]' : 'text-gray-500 dark:text-gray-400'}`}>
                            {notifications.friendRequests > 0 && <span className="absolute -top-1 -right-2 bg-red-600 w-2 h-2 rounded-full"></span>}
                            <Users size={20} strokeWidth={pathname === '/find-friends' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Friends</span>
                        </Link>
                        <Link href="/profile" className={`flex flex-col items-center gap-1 relative ${pathname === '/profile' ? 'text-blue-600 dark:text-[#38BDF8]' : 'text-gray-500 dark:text-gray-400'}`}>
                            {notifications.profileIncomplete && <span className="absolute -top-1 -right-2 bg-yellow-400 w-2 h-2 rounded-full"></span>}
                            <User size={20} strokeWidth={pathname === '/profile' ? 2.5 : 2} />
                            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Profile</span>
                        </Link>
                        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-500 dark:text-red-400">
                            <LogOut size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Logout</span>
                        </button>
                    </div>
                </>
            )}

            <main className={`flex-1 flex flex-col min-h-screen ${!hideSidebar && user ? "md:ml-64 pb-24 md:pb-8" : "pb-8"}`}>
                {children}
            </main>

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
        </div>
    );
}
