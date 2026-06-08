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
          "linear-gradient(135deg, rgba(0,22,50,.70), rgba(0,10,28,.88))",
        border: "1px solid rgba(0,198,255,.15)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow:
          "0 0 25px rgba(0,198,255,.08), inset 0 0 25px rgba(255,255,255,.02)",
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 22px",
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
              fontSize: "22px",
            }}
          >
            {announcement.icon || "🎬"}
          </span>

          <span
            style={{
              color: "#69eaff",
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: ".3px",
              textShadow: "0 0 10px rgba(0,198,255,.18)",
            }}
          >
            {announcement.title}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 12px",
            borderRadius: "999px",
            background: "rgba(0,12,25,.65)",
            border: "1px solid rgba(89,243,143,.18)",
            color: "#7af7b0",
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

      {/* Séparateur */}

      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)",
        }}
      />

      {/* Corps */}

      <div
        style={{
          padding: "22px",
          color: "#d4e2f0",
          fontSize: "15px",
          lineHeight: "30px",
          fontWeight: 500,
          whiteSpace: "pre-wrap",
        }}
      >
        {announcement.content}
      </div>
    </div>
  );
}
