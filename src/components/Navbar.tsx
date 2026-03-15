"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function Navbar() {
    const { user, loading } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", h);
        return () => window.removeEventListener("scroll", h);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? "bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm" : "bg-transparent"
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                            ✈️
                        </div>
                        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                            Trip Planner
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {!loading && (
                            <>
                                {user ? (
                                    <Link href="/dashboard">
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">
                                            Dashboard
                                        </button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login" className="hidden sm:block text-gray-600 dark:text-gray-300 font-bold hover:text-gray-900 dark:hover:text-white px-4 py-2 transition-colors">
                                            Log in
                                        </Link>
                                        <Link href="/register">
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">
                                                Sign up free
                                            </button>
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
