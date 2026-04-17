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

    const cycle: Record<string, string> = { light: "dark", dark: "vintage", vintage: "retro", retro: "light" };
    const icons: Record<string, string> = { light: "🌙", dark: "📷", vintage: "📻", retro: "☀️" };
    const labels: Record<string, string> = {
        light: "Switch to dark mode",
        dark: "Switch to vintage mode",
        vintage: "Switch to retro mode",
        retro: "Switch to light mode",
    };
    const currentTheme = theme ?? "light";
    const nextTheme = cycle[currentTheme] ?? "light";
    const icon = icons[currentTheme] ?? "☀️";
    const label = labels[currentTheme] ?? "Switch theme";

    return (
        <button
            className="btn btn-ghost btn-sm"
            onClick={() => setTheme(nextTheme)}
            aria-label={label}
            title={label}
        >
            {icon}
        </button>
    );
}
