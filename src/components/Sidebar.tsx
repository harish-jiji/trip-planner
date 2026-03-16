"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebaseAuth";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    
    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.replace("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: "📊" },
        { href: "/create-trip", label: "Create Trip", icon: "➕" },
        { href: "/my-trips", label: "My Trips", icon: "🗺️" },
        { href: "/received-trips", label: "Received Trips", icon: "📥" },
        { href: "/find-friends", label: "Find Friends", icon: "👥" },
        { href: "/profile", label: "Profile", icon: "👤" },
    ];

    if (!user) return null;

    return (
        <aside className="w-64 bg-white dark:bg-[#0F172A] border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                        ✈️
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-[#38BDF8]">
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
                            <span className="text-lg">{link.icon}</span>
                            {link.label}
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
                    <span>🚪</span> Logout
                </button>
            </div>
        </aside>
    );
}
