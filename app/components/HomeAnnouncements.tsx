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
  borderRadius: "22px",
  overflow: "hidden",
  position: "relative",

  background:
  "linear-gradient(135deg, rgba(5,15,40,.25), rgba(10,20,55,.45))",

  border: "1px solid rgba(0,198,255,.18)",

  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",

  boxShadow:
    "0 0 30px rgba(0,140,255,.12), 0 0 60px rgba(140,0,255,.06)",
}}
    >
      {/* Effet lumineux */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
  "radial-gradient(circle at top left, rgba(0,198,255,.08), transparent 45%)",
          pointerEvents: "none",
        }}
      />

      {/* HEADER */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Icône */}
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              background:
                "linear-gradient(135deg, #00c6ff 0%, #6a5cff 100%)",
              boxShadow:
                "0 0 25px rgba(0,198,255,.45)",
            }}
          >
            {announcement.icon || "📢"}
          </div>

          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "999px",
                background: "rgba(140,0,255,.18)",
                border: "1px solid rgba(140,0,255,.25)",
                color: "#d8b4ff",
                fontSize: "11px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              📢 ANNONCE OFFICIELLE
            </div>

            <h2
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {announcement.title}
            </h2>
          </div>
        </div>

        {/* Staff */}
        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              color: "#74e8ff",
              fontWeight: 800,
              fontSize: "15px",
            }}
          >
            👑 Staff CineZone
          </div>

          <div
            style={{
              marginTop: "4px",
              color: "#8fa8c7",
              fontSize: "12px",
            }}
          >
            {new Date().toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>

      {/* Séparateur */}
      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,.15), transparent)",
        }}
      />

      {/* Contenu */}
      {/* Contenu */}
<div
  style={{
    padding: "24px",
    color: "#e5eef8",
    fontSize: "15px",
    lineHeight: "30px",
    fontWeight: 500,
    whiteSpace: "pre-wrap",
  }}
>
  {announcement.content.split(/(\[.*?\])/g).map((part, index) => {

  // Films en badge bleu néon
  if (part.startsWith("[") && part.endsWith("]")) {
    return (
      <span
        key={index}
        style={{
          display: "inline-block",
          margin: "2px 4px",
          padding: "2px 8px",
          borderRadius: "6px",
          background: "rgba(0,198,255,.10)",
          border: "1px solid rgba(0,198,255,.25)",
          color: "#74e8ff",
          fontWeight: 700,
          fontSize: "14px",
          boxShadow: "0 0 8px rgba(0,198,255,.20)",
          transition: "all .25s ease",
        }}
      >
        {part.slice(1, -1)}
      </span>
    );
  }

  // Titre Nouveautés lumineux
  if (part.includes("🎬 Nouveautés sur CineZone HD !")) {
    return (
      <div
        key={index}
        style={{
          color: "#74e8ff",
          fontWeight: 800,
          fontSize: "22px",
          marginBottom: "12px",
          textShadow: `
            0 0 10px rgba(0,198,255,.55),
            0 0 20px rgba(0,198,255,.25)
          `,
        }}
      >
        {part}
      </div>
    );
  }

  return <span key={index}>{part}</span>;
})}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          padding: "0 24px 20px",
        }}
      >
        <div
          style={{
            background: "rgba(255,0,100,.15)",
            border: "1px solid rgba(255,0,100,.20)",
            padding: "6px 12px",
            borderRadius: "999px",
            color: "#ff84b7",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          ❤️ CineZone
        </div>

        <div
          style={{
            background: "rgba(0,198,255,.15)",
            border: "1px solid rgba(0,198,255,.20)",
            padding: "6px 12px",
            borderRadius: "999px",
            color: "#74e8ff",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          🎬 Nouveautés
        </div>

        <div
          style={{
            background: "rgba(89,243,143,.15)",
            border: "1px solid rgba(89,243,143,.20)",
            padding: "6px 12px",
            borderRadius: "999px",
            color: "#6ef7a7",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          🚀 Mise à jour
        </div>
      </div>
    </div>
  );
}
