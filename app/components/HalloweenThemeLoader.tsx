
"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import HalloweenTheme from "./HalloweenTheme";

export default function HalloweenThemeLoader() {
  useEffect(() => {
    let cancelled = false;

    async function loadTheme() {
      const { data, error } = await supabase
        .from("site_theme_settings")
        .select("halloween_enabled")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        console.error(
          "Chargement du thème Halloween impossible :",
          error.message
        );
        return;
      }

      if (!cancelled) {
        document.body.classList.toggle(
          "cz-halloween-active",
          data?.halloween_enabled === true
        );
      }
    }

    void loadTheme();

    return () => {
      cancelled = true;
      document.body.classList.remove("cz-halloween-active");
    };
  }, []);

  return <HalloweenTheme />;
}
