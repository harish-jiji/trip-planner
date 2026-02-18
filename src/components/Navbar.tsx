"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
    const { user } = useAuth();
    const { dark, setDark } = useTheme() || { dark: false, setDark: () => { } };
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    Trip Planner
                </Link>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => setDark(!dark)}
                        className="text-lg p-2 rounded-full w-10 h-10 flex items-center justify-center"
                        aria-label="Toggle dark mode"
                    >
                        {dark ? "🌙" : "☀️"}
                    </Button>

                    {user ? (
                        <>
                            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">
                                {user.email}
                            </span>
                            <Button variant="ghost" onClick={handleSignOut} className="text-sm">
                                Sign Out
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" className="text-sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="primary" className="text-sm">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
