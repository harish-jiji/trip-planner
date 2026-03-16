"use client";

import Sidebar from "./Sidebar";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { useRouter, usePathname } from "next/navigation";

export default function PlannerLayout({ children, hideSidebar = false }: { children: React.ReactNode, hideSidebar?: boolean }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
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
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex gap-3"><span className="text-lg">📊</span> Dashboard</Link>
                            <Link href="/create-trip" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex gap-3"><span className="text-lg">➕</span> Create Trip</Link>
                            <Link href="/my-trips" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex gap-3"><span className="text-lg">🗺️</span> My Trips</Link>
                            <Link href="/received-trips" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex gap-3"><span className="text-lg">📥</span> Received Trips</Link>
                            <Link href="/find-friends" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex gap-3"><span className="text-lg">👥</span> Find Friends</Link>
                            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white flex gap-3"><span className="text-lg">👤</span> Profile</Link>
                            <button onClick={handleLogout} className="px-4 py-3 mt-auto border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl font-medium text-red-600 dark:text-red-400 flex gap-3 text-left w-full"><span className="text-lg">🚪</span> Logout</button>
                        </div>
                    )}

                    {/* Mobile Bottom Navigation Component */}
                    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0F172A] border-t border-gray-100 dark:border-gray-800 flex justify-around py-3 pb-6 z-50 px-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                        <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${pathname === '/dashboard' ? 'text-blue-600 dark:text-[#38BDF8]' : 'text-gray-500 dark:text-gray-400'}`}>
                            <span className="text-xl">📊</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Dash</span>
                        </Link>
                        <Link href="/create-trip" className={`flex flex-col items-center gap-1 ${pathname === '/create-trip' ? 'text-blue-600 dark:text-[#38BDF8]' : 'text-gray-500 dark:text-gray-400'}`}>
                            <span className="text-xl">➕</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Create</span>
                        </Link>
                        <Link href="/my-trips" className={`flex flex-col items-center gap-1 ${pathname === '/my-trips' ? 'text-blue-600 dark:text-[#38BDF8]' : 'text-gray-500 dark:text-gray-400'}`}>
                            <span className="text-xl">🗺️</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Trips</span>
                        </Link>
                        <Link href="/profile" className={`flex flex-col items-center gap-1 ${pathname === '/profile' ? 'text-blue-600 dark:text-[#38BDF8]' : 'text-gray-500 dark:text-gray-400'}`}>
                            <span className="text-xl">👤</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
                        </Link>
                        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-500 dark:text-red-400">
                            <span className="text-xl">🚪</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Logout</span>
                        </button>
                    </div>
                </>
            )}

            <main className={`flex-1 flex flex-col min-h-screen ${!hideSidebar && user ? "md:ml-64 pb-24 md:pb-8" : "pb-8"}`}>
                {children}
            </main>
        </div>
    );
}
