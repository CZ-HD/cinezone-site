"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PresenceTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let interval: any;

    async function updatePresence() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar, role")
        .eq("id", user.id)
        .maybeSingle();

      await supabase.from("user_presence").upsert({
        user_id: user.id,
        email: user.email,
        username: profile?.username || user.email,
        avatar: profile?.avatar,
        role: profile?.role || "user",
        current_page: pathname,
        last_seen: new Date().toISOString(),
      });
    }

    updatePresence();
    interval = setInterval(updatePresence, 20000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
