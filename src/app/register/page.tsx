"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";
import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric and underscores only"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password")
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) router.push("/dashboard");
    }, [user, loading, router]);

    const checkUsername = async (username: string) => {
        const q = query(
            collection(db, "users"),
            where("username", "==", username)
        );
        const snap = await getDocs(q);
        return snap.empty;
    };

    const onSubmit = async (data: RegisterFormData) => {
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );

            // Now that we are authenticated, we can safely query the users collection
            const usernameAvailable = await checkUsername(data.username);
            
            if (!usernameAvailable) {
                // Username taken, rollback the created auth user
                await userCredential.user.delete();
                setError("Username already taken. Please choose another one.");
                setIsSubmitting(false);
                return;
            }

            const uid = userCredential.user.uid;

            await setDoc(doc(db, "users", uid), {
                uid,
                name: data.name,
                username: data.username,
                email: data.email,

                dob: "",
                state: "",
                district: "",
                houseName: "",
                pincode: "",

                q1: "",
                q2: "",
                q3: "",

                addressVisibility: "public",
                verifiedProfile: false,
                createdAt: new Date()
            });

            setSuccess("Registration Successful. Please login...");

            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (err: any) {
            setError(err.message || "Failed to register");
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
                        <h2 className="text-3xl font-black mb-3 tracking-tight text-gray-900 dark:text-white">Create an account</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium pb-4 border-b border-gray-100 dark:border-gray-800">Start planning your dream trip today.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-3 shadow-sm">
                                <span className="text-xl">⚠️</span> {error}
                            </div>
                        )}
                        
                        {success && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-xl font-bold border border-green-100 dark:border-green-900/30 flex items-center gap-3 shadow-sm">
                                <span className="text-xl">✅</span> {success}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Full Name</label>
                                <input
                                    type="text"
                                    {...register("name")}
                                    className={`w-full bg-gray-50 dark:bg-[#1E293B] border px-4 py-3.5 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400 hover:border-gray-300 dark:hover:border-gray-700 ${errors.name ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800'}`}
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.name.message}</p>}
                            </div>

                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Username</label>
                                <input
                                    type="text"
                                    {...register("username")}
                                    className={`w-full bg-gray-50 dark:bg-[#1E293B] border px-4 py-3.5 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400 hover:border-gray-300 dark:hover:border-gray-700 ${errors.username ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800'}`}
                                    placeholder="johndoe123"
                                />
                                {errors.username && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.username.message}</p>}
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Email Address</label>
                            <input
                                type="email"
                                {...register("email")}
                                className={`w-full bg-gray-50 dark:bg-[#1E293B] border px-4 py-3.5 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400 hover:border-gray-300 dark:hover:border-gray-700 ${errors.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800'}`}
                                placeholder="hello@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.email.message}</p>}
                        </div>

                        <div className="relative group">
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    className={`w-full bg-gray-50 dark:bg-[#1E293B] border pl-4 pr-12 py-3.5 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400 hover:border-gray-300 dark:hover:border-gray-700 ${errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800'}`}
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
                            {errors.password ? (
                                <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.password.message}</p>
                            ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-medium">Must be at least 6 characters.</p>
                            )}
                        </div>

                        <div className="relative group">
                            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    {...register("confirmPassword")}
                                    className={`w-full bg-gray-50 dark:bg-[#1E293B] border pl-4 pr-12 py-3.5 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder-gray-400 hover:border-gray-300 dark:hover:border-gray-700 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 dark:border-gray-800'}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:hover:text-[#38BDF8] transition-colors p-1"
                                    title={showConfirm ? "Hide password" : "Show password"}
                                >
                                    {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.confirmPassword.message}</p>}
                        </div>


                        <button 
                            type="submit" 
                            disabled={isSubmitting || success !== ""}
                            className="w-full py-4 px-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed outline-none focus:ring-4 focus:ring-blue-500/50 block text-lg"
                        >
                            {isSubmitting ? "Creating account..." : success ? "Redirecting..." : "Sign Up"}
                        </button>

                        <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-8 pt-6">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 dark:text-[#38BDF8] font-bold hover:underline">
                                Log in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Right Side: Visual / Brand */}
            <div className="hidden md:flex flex-col relative bg-gradient-to-tr from-purple-800 via-indigo-700 to-blue-600 overflow-hidden w-full">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                
                {/* Abstract Shapes */}
                <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-pink-500/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
                <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-blue-400/30 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

                <div className="relative z-10 p-16 flex flex-col justify-center items-center text-center h-full w-full">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tight drop-shadow-md">
                            Join the best travel community.
                        </h2>
                        <p className="text-lg text-blue-100/90 leading-relaxed font-medium">
                            Create, manage, and distribute travel itineraries in seconds. 100% Free.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-blue-100/60 font-medium text-sm mt-12">
                        <div className="w-12 h-1 rounded-full bg-white/20" />
                        Start planning today.
                    </div>
                </div>
            </div>
        </div>
    );
}
