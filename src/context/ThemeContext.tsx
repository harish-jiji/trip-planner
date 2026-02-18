"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ToastProvider } from "../components/ui/Toast";

type ThemeContextType = {
    dark: boolean;
    setDark: (dark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [dark, setDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDark(true);
        } else if (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setDark(true);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        if (dark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [dark, mounted]);

    // Avoid hydration mismatch by rendering children only after mount, 
    // or rendering with a default theme but ensuring valid HTML.
    // For now, simple return to avoid flash of wrong theme is okay, 
    // but better pattern is to use suppression or a script. 
    // We'll stick to simple mounted check to avoid hydration errors.
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{ dark, setDark }}>
            <ToastProvider>
                {children}
            </ToastProvider>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        // Fallback to avoid crashing if used outside provider (e.g. tests)
        return { dark: false, setDark: () => { } };
    }
    return context;
}
