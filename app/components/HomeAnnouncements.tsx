"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Announcement = {
  id: string;
  title: string;
  content: string;
  icon: string;
};

export default function HomeAnnouncements() {
  const [announcement, setAnnouncement] =
    useState<Announcement | null>(null);

  useEffect(() => {
    loadAnnouncement();
  }, []);

  async function loadAnnouncement() {
    const { data } = await supabase
      .from("announcements")
      .select("id,title,content,icon")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setAnnouncement(data);
    }
  }

  if (!announcement) return null;

  return (
    <div
      style={{
        marginTop: "18px",
        width: "100%",
        maxWidth: "1050px",
        borderRadius: "18px",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, rgba(0,25,55,.55), rgba(0,12,30,.75))",
        border: "1px solid rgba(0,198,255,.18)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow:
          "0 0 18px rgba(0,198,255,.08), inset 0 0 14px rgba(255,255,255,.02)",
      }}
    >
      {/* En-tête */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
            }}
          >
            {announcement.icon || "🍿"}
          </span>

          <span
            style={{
              color: "#e8f5ff",
              fontWeight: 800,
              fontSize: "24px",
              textShadow: "0 0 10px rgba(0,198,255,.15)",
            }}
          >
            {announcement.title}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0,10,25,.85)",
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid rgba(89,243,143,.25)",
            color: "#6ef7a7",
            fontSize: "12px",
            fontWeight: 800,
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#59f38f",
              boxShadow: "0 0 8px #59f38f",
            }}
          />
          Staff CineZone
        </div>
      </div>

      {/* Contenu */}

      <div
        style={{
          padding: "20px",
          color: "#dbeafe",
          fontSize: "17px",
          lineHeight: "32px",
          fontWeight: 500,
          whiteSpace: "pre-wrap",
        }}
      >
        {announcement.content}
      </div>
    </div>
  );
}
