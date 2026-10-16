"use client";

import { useEffect } from "react";

export default function HalloweenThemeLoader() {
  useEffect(() => {
    let cancelled = false;

    async function loadTheme() {
      try {
        const response = await fetch("/api/halloween-theme", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          document.body.classList.toggle(
            "cz-halloween-active",
            data.enabled === true
          );
        }
      } catch (error) {
        console.error("Impossible de charger le thème Halloween :", error);
      }
    }

    loadTheme();

    return () => {
      cancelled = true;
      document.body.classList.remove("cz-halloween-active");
    };
  }, []);

  return null;
}
