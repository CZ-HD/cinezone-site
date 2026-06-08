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
  const [announcement, setAnnouncement] = useState<Announcement>({
    id: "",
    title: "Bienvenue sur CineZone HD",
    content: "Chargement des dernières nouveautés...",
    icon: "🎬",
  });

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

  const text = `🍿 ${announcement.content} ✦ `;

  return (
    <>
      <style jsx>{`
        @keyframes cinezoneTicker {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div
        style={{
          marginTop: "18px",
          width: "100%",
          maxWidth: "1050px",
          overflow: "hidden",
          position: "relative",
          borderRadius: "18px",
          background:
            "linear-gradient(90deg, rgba(0, 25, 55, 0.45), rgba(0, 12, 30, 0.55))",
          border: "1px solid rgba(0,198,255,.18)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow:
            "0 0 18px rgba(0,198,255,.08), inset 0 0 14px rgba(255,255,255,.02)",
        }}
      >
        {/* En-tête */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <span
            style={{
              fontSize: "20px",
            }}
          >
            {announcement.icon || "📢"}
          </span>

          <span
            style={{
              color: "#dbeafe",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: ".3px",
            }}
          >
            {announcement.title}
          </span>
        </div>

        {/* Bandeau défilant */}

        <div
          style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            padding: "14px 0 22px 0",
          }}
        >
          <div
            style={{
              display: "inline-block",
              color: "#dbeafe",
              fontWeight: 600,
              fontSize: "15px",
              paddingLeft: "18px",
              animation: "cinezoneTicker 45s linear infinite",
            }}
          >
            {text.repeat(12)}
          </div>
        </div>

        {/* Badge Staff */}

        <div
          style={{
            position: "absolute",
            right: "14px",
            bottom: "6px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(0,10,25,.94)",
            padding: "4px 10px",
            borderRadius: "999px",
            border: "1px solid rgba(89,243,143,.25)",
            color: "#6ef7a7",
            fontSize: "11px",
            fontWeight: 700,
            zIndex: 10,
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
    </>
  );
}
