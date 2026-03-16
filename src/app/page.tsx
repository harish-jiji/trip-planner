"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace("/dashboard");
        }
    }, [user, loading, router]);
    return (
        <div className="min-h-screen bg-white dark:bg-[#0F172A] font-sans text-gray-900 dark:text-white transition-colors duration-300 overflow-x-hidden selection:bg-blue-500/30">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Abstract Background Design */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold px-4 py-1.5 rounded-full text-sm mb-8 shadow-sm">
                        <span>✨</span> 100% Free to use
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.1] mb-8 text-gray-900 dark:text-white drop-shadow-sm">
                        Plan trips.<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mt-2 block">
                            Travel better.
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                        The most intuitive way to build itineraries, manage your travel budget, and share beautiful trip plans with anyone.
                    </p>
                    
                    <div className="flex flex-col flex-wrap sm:flex-row justify-center gap-4 px-4">
                        <Link href="/register">
                            <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500/50">
                                Start planning free &rarr;
                            </button>
                        </Link>
                        <Link href="/login">
                            <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-[#1E293B] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800">
                                View dashboard
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Metrics */}
            <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0F172A]/50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">
                        <div className="py-4 md:py-0">
                            <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">100%</div>
                            <div className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-sm">Free Forever</div>
                        </div>
                        <div className="py-4 md:py-0">
                            <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">∞</div>
                            <div className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-sm">Trips You Can Plan</div>
                        </div>
                        <div className="py-4 md:py-0">
                            <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">1-Click</div>
                            <div className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-sm">Instant Sharing</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <span className="text-blue-600 dark:text-[#38BDF8] font-bold tracking-widest uppercase text-sm mb-4 block">What you get</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Everything you need to plan</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { icon: "🗺️", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/30", title: "Route planning", desc: "Add multiple stops to your trip and visualize the full route on an interactive map." },
                        { icon: "💰", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30", title: "Budget tracking", desc: "Track entry fees, food, travel costs, and misc expenses for every single stop." },
                        { icon: "🚗", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30", title: "Travel modes", desc: "Choose between car, motorbike, bicycle, or walking — get accurate distance and time." },
                        { icon: "🔗", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-900/30", title: "Instant sharing", desc: "Share a unique link with anyone. No login required to view your beautiful itinerary." },
                        { icon: "📍", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/30", title: "Location details", desc: "Add notes, images, and detailed info for each place you plan to visit." },
                        { icon: "✏️", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30", title: "Edit anytime", desc: "Plans change — update your trip at any time and your shared link stays the same." },
                    ].map(f => (
                        <div key={f.title} className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 hover:shadow-xl hover:shadow-gray-200 dark:hover:shadow-black/50 group">
                            <div className={`w-14 h-14 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner`}>
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-[#38BDF8] transition-colors">{f.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-900 to-indigo-900 dark:from-[#080d19] dark:to-[#0f1b33] border border-blue-800 dark:border-gray-800 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                        <div className="text-6xl mb-8">🌏</div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready for your next trip?</h2>
                        <p className="text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto font-medium">Create your first itinerary in minutes. No credit card required. Absolutely zero setup.</p>
                        <Link href="/register">
                            <button className="px-10 py-5 bg-white text-blue-900 hover:bg-gray-100 rounded-2xl font-black text-xl transition-transform hover:-translate-y-1 shadow-xl">
                                Get started free &rarr;
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="py-8 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 font-medium">
                <p>&copy; {new Date().getFullYear()} Trip Planner SaaS. Built with ❤️ for travelers.</p>
            </footer>
        </div>
    );
}
