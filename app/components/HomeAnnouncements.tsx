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

    if (data) setAnnouncement(data);
  }

  if (!announcement) return null;

  return (
    <div
      style={{
        marginTop: "18px",
        width: "100%",
        maxWidth: "980px",
        borderRadius: "16px",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, rgba(0,22,50,.72), rgba(0,10,28,.90))",
        border: "1px solid rgba(0,198,255,.15)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow:
          "0 0 18px rgba(0,198,255,.08), inset 0 0 14px rgba(255,255,255,.02)",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
            }}
          >
            {announcement.icon || "🎬"}
          </span>

          <span
            style={{
              color: "#74e8ff",
              fontWeight: 800,
              fontSize: "18px",
              letterSpacing: ".3px",
            }}
          >
            {announcement.title}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "999px",
            background: "rgba(0,15,30,.75)",
            border: "1px solid rgba(89,243,143,.18)",
            color: "#6ef7a7",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#59f38f",
              boxShadow: "0 0 8px #59f38f",
            }}
          />
          Staff CineZone
        </div>
      </div>

      {/* LIGNE */}

      <div
        style={{
          height: "1px",
          background: "rgba(255,255,255,.08)",
        }}
      />

      {/* CONTENU */}

      <div
        style={{
          padding: "16px 18px",
          color: "#d8e5f2",
          fontSize: "14px",
          lineHeight: "26px",
          fontWeight: 500,
        }}
      >
        {announcement.content}
      </div>
    </div>
  );
}
