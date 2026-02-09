"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebaseAuth";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 🔐 basic validation
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            // 1️⃣ Create auth account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            // 2️⃣ Save extra profile data
            await setDoc(doc(db, "users", user.uid), {
                name,
                username,
                phone,
                email,
                createdAt: serverTimestamp(),
            });

            router.push("/dashboard");
        } catch (err: any) {
            console.error("Register error:", err);
            setError(err.code || err.message);
        }
    };

    return (
        <form onSubmit={handleRegister} style={{ maxWidth: 400 }}>
            <h1>Create Account</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
                type="text"
                placeholder="Full Name"
                required
                onChange={(e) => setName(e.target.value)}
            />

            <input
                type="text"
                placeholder="Username"
                required
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="tel"
                placeholder="Phone Number"
                onChange={(e) => setPhone(e.target.value)}
            />

            <input
                type="email"
                placeholder="Email Address"
                required
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <label style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                    type="checkbox"
                    onChange={() => setShowPassword(!showPassword)}
                />
                Show password
            </label>

            <button type="submit" style={{ marginTop: 16 }}>
                Register
            </button>
        </form>
    );
}
