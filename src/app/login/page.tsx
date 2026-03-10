"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { useRouter } from "next/navigation";
import AuthBackground from "@/components/auth/AuthBackground";
import AuthCard from "@/components/auth/AuthCard";
import FloatingInput from "@/components/ui/FloatingInput";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="
      min-h-screen flex items-center justify-center
      bg-background-light dark:bg-background-dark
      relative p-4
    ">

            <AuthBackground />

            <AuthCard
                title="Welcome back"
                subtitle="Log in to manage your itineraries"
            >
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <FloatingInput
                        label="Email Address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <FloatingInput
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="
              w-full h-12
              bg-primary hover:bg-primary/90
              text-white font-semibold
              rounded-xl
              shadow-lg shadow-primary/20
              transition-all
              disabled:opacity-50
            "
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Don’t have an account?
                    <Link
                        href="/register"
                        className="text-primary font-semibold ml-1 hover:underline"
                    >
                        Create one
                    </Link>
                </div>
            </AuthCard>
        </div>
    );
}

