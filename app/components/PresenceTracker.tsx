"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PresenceTracker() {
  useEffect(() => {
    let channel: any = null;
    let mounted = true;

    async function trackPresence() {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data.user;

        if (!mounted || !user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar, role, status_text")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        channel = supabase.channel("site-presence", {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        channel.subscribe(async (status: string) => {
          if (status !== "SUBSCRIBED" || !channel) return;

          await channel.track({
            user_id: user.id,
            email: user.email || "",
            username: profile?.username || user.email || "Utilisateur",
            avatar: profile?.avatar || "",
            role: profile?.role || "user",
            status_text: profile?.status_text || "🟢 En ligne",
          });
        });
      } catch (error) {
        console.error("PresenceTracker error:", error);
      }
    }

    trackPresence();

    return () => {
      mounted = false;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return null;
}
