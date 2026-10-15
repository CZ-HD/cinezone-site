"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PresenceTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let updating = false;

    async function updatePresence() {
      // Évite de lancer une seconde mise à jour si la précédente est encore en cours.
      if (cancelled || updating) return;
      updating = true;

      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || cancelled || !data.user) return;

        const user = data.user;
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar, role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        await supabase.from("user_presence").upsert(
          {
            user_id: user.id,
            email: user.email,
            username: profile?.username || user.email || "Nouveau membre",
            avatar: profile?.avatar || null,
            role: profile?.role || "user",
            current_page: pathname || "/",
            last_seen: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      } catch (error) {
        console.error("Erreur de mise à jour de présence :", error);
      } finally {
        updating = false;
      }
    }

    void updatePresence();
    // 30 secondes suffisent pour actualiser la présence sans interroger Supabase toutes les 5 secondes.
    const interval = setInterval(() => void updatePresence(), 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
