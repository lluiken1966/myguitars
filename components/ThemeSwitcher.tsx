"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ width: '28px', height: '28px' }}></div>; // placeholder
    }

    return (
        <button
            className="btn btn-ghost btn-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle Dark Mode"
        >
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    );
}
