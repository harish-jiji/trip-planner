"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";

export default function RegisterPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) router.push("/dashboard");
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to register");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] font-sans flex text-gray-900 dark:text-white transition-colors duration-300">
            {/* Left Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 bg-white dark:bg-[#0F172A] relative w-full lg:w-1/2">
                <div className="w-full max-w-sm mx-auto">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-10 w-full">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl text-white shadow-xl shadow-blue-500/30">
                            ✈️
                        </div>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black mb-3 tracking-tight text-gray-900 dark:text-white">Create an account</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium pb-2 border-b border-gray-100 dark:border-gray-800">Start planning your dream trip today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 px-4 py-3.5 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                                    placeholder="hello@example.com"
                                />
                            </div>

                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 px-4 py-3.5 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                                    placeholder="••••••••"
                                />
                                <p className="text-xs text-gray-400 mt-2 font-medium">Must be at least 6 characters long.</p>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-4 focus:ring-blue-500/50 block text-lg"
                        >
                            {isSubmitting ? "Creating account..." : "Sign Up"}
                        </button>

                        <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-8">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 dark:text-[#38BDF8] font-bold hover:underline">
                                Log in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Right Side: Visual / Brand */}
            <div className="hidden lg:flex flex-1 relative bg-gradient-to-tr from-purple-800 via-indigo-700 to-blue-600 overflow-hidden shrink-0 w-1/2">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                
                {/* Abstract Shapes */}
                <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-pink-500/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
                <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-blue-400/30 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

                <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
                    <div className="flex justify-end w-full">
                        <Link href="/" className="flex items-center gap-3 text-white font-black text-2xl tracking-tight hover:opacity-80 transition-opacity w-max">
                            Wandr
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-lg border border-white/20">
                                ✈️
                            </div>
                        </Link>
                    </div>

                    <div className="max-w-md ml-auto text-right">
                        <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight drop-shadow-md">
                            Join the best travel community.
                        </h1>
                        <p className="text-lg text-blue-100/90 leading-relaxed font-medium">
                            Create, manage, and distribute travel itineraries in seconds. 100% Free.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-4 text-blue-100/60 font-medium text-sm">
                        Start planning today.
                        <div className="w-12 h-1 rounded-full bg-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
