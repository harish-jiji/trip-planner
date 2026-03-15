"use client";

import Sidebar from "./Sidebar";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PlannerLayout({ children, hideSidebar = false }: { children: React.ReactNode, hideSidebar?: boolean }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user } = useAuth();

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
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white">📊 Dashboard</Link>
                            <Link href="/create-trip" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium text-gray-900 dark:text-white">➕ New Trip</Link>
                        </div>
                    )}
                </>
            )}

            <main className={`flex-1 ${!hideSidebar && user ? "md:ml-64" : ""}`}>
                {children}
            </main>
        </div>
    );
}
