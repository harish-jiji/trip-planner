"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!loading && user) router.push("/dashboard");
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            if (err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
                setError("User not found");
            } else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                // adding invalid-credential mapping as it is commonly used by newer firebase auth versions instead of wrong-password fallback
                setError("Incorrect password");
            } else {
                setError("Login failed");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="grid md:grid-cols-2 min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] font-sans text-gray-900 dark:text-white transition-colors duration-300">
            {/* Left Side: Form */}
            <div className="flex flex-col justify-center px-4 sm:px-12 lg:px-24 bg-white dark:bg-[#0F172A] relative w-full py-12 md:py-0 overflow-y-auto">
                <div className="w-full max-w-md mx-auto">
                    {/* Top Logo */}
                    <div className="flex items-center gap-2 mb-8 hover:scale-105 transition-transform duration-300 w-fit">
                        <div className="text-3xl animate-pulse">✈️</div>
                        <div className="text-gray-900 dark:text-white font-black text-2xl tracking-tight drop-shadow-sm">Trip Planner</div>
                    </div>

                    <div className="mb-10 text-left">
                        <h2 className="text-3xl font-black mb-3 tracking-tight text-gray-900 dark:text-white">Welcome back</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium pb-4 border-b border-gray-100 dark:border-gray-800">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-2 shadow-sm">
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
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Password</label>
                                    <Link href="/reset-password" className="flex text-xs font-bold text-blue-600 dark:text-[#38BDF8] hover:underline">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 pl-4 pr-12 py-3.5 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:hover:text-[#38BDF8] transition-colors p-1"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-4 focus:ring-blue-500/50 block text-lg"
                        >
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </button>

                        <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-8">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-blue-600 dark:text-[#38BDF8] font-bold hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Right Side: Visual / Brand */}
            <div className="hidden md:flex flex-col relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden w-full">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                
                {/* Abstract Shapes */}
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-pink-500/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-blue-400/30 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
                <div className="absolute top-[30%] left-[20%] w-[30rem] h-[30rem] bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

                <div className="relative z-10 p-16 flex flex-col justify-center items-center h-full w-full">
                    <div className="max-w-md mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tight drop-shadow-md">
                            Your next journey starts here.
                        </h2>
                        <p className="text-lg text-blue-100/90 leading-relaxed font-medium">
                            Plan routes, track budgets, and share your itineraries natively. All in one place.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-blue-100/60 font-medium text-sm mt-12">
                        <div className="w-12 h-1 rounded-full bg-white/20" />
                        Built for travelers.
                    </div>
                </div>
            </div>
        </div>
    );
}
