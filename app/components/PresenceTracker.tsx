"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PresenceTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function updatePresence() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar, role")
        .eq("id", user.id)
        .maybeSingle();

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
        {
          onConflict: "user_id",
        }
      );
    }

    updatePresence();
    setInterval(updatePresence, 10000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
