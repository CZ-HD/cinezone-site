"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PresenceTracker() {
  useEffect(() => {
    let channel: any;

    async function trackPresence() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar, role, status_text")
        .eq("id", user.id)
        .single();

      channel = supabase.channel("site-presence", {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channel.subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user.id,
            email: user.email,
            username: profile?.username || user.email,
            avatar: profile?.avatar,
            role: profile?.role || "user",
            status_text: profile?.status_text || "🟢 En ligne",
          });
        }
      });
    }

    trackPresence();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
