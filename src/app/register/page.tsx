"use client";

import Link from "next/link";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseAuth";
import { useRouter } from "next/navigation";
import AuthBackground from "@/components/auth/AuthBackground";
import AuthCard from "@/components/auth/AuthCard";
import FloatingInput from "@/components/ui/FloatingInput";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setError("Failed to create account. Email might be in use.");
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
                title="Create Account"
                subtitle="Start planning your next trip"
            >
                <form onSubmit={handleRegister} className="space-y-4">
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

                    <FloatingInput
                        label="Confirm Password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?
                    <Link
                        href="/login"
                        className="text-primary font-semibold ml-1 hover:underline"
                    >
                        Sign in
                    </Link>
                </div>
            </AuthCard>
        </div>
    );
}

