"use client";

import { useEffect, useState } from "react";
import type { ThemeMode } from "@/types/offmenu";

export function useOffMenuTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    let frameId = 0;

    frameId = window.requestAnimationFrame(() => {
      let nextTheme: ThemeMode = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";

      try {
        const storedTheme = window.localStorage.getItem("offmenu-theme");
        if (storedTheme === "dark" || storedTheme === "light") {
          nextTheme = storedTheme;
        }
      } catch {}

      setThemeMode(nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      setThemeReady(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!themeReady) {
      return;
    }

    document.documentElement.classList.toggle("dark", themeMode === "dark");

    try {
      window.localStorage.setItem("offmenu-theme", themeMode);
    } catch {}
  }, [themeMode, themeReady]);

  return {
    themeMode,
    setThemeMode,
    themeReady,
  };
}
