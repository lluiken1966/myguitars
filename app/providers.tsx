"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem themes={["light", "dark", "vintage", "retro"]}>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
