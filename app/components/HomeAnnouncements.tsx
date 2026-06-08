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

  const text = `${announcement.icon || "📢"} ${
    announcement.title
  } • ${announcement.content} • `;

  return (
    <>
      <style jsx>{`
        @keyframes cinezoneTicker {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>

      <div
        style={{
          marginTop: "18px",
          width: "100%",
          maxWidth: "1050px",
          overflow: "hidden",
          borderRadius: "16px",
          background:
            "linear-gradient(90deg, rgba(0,25,55,.45), rgba(0,12,30,.55))",
          border: "1px solid rgba(0,198,255,.18)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow:
            "0 0 18px rgba(0,198,255,.08), inset 0 0 14px rgba(255,255,255,.02)",
          padding: "14px 0",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            color: "#69eaff",
            fontWeight: 900,
            fontSize: "18px",
            textShadow: "0 0 10px rgba(0,198,255,.25)",
          }}
        >
          📢
        </div>

        <div
          style={{
            whiteSpace: "nowrap",
            paddingLeft: "55px",
            color: "#dbeafe",
            fontWeight: 600,
            fontSize: "15px",
            animation: "cinezoneTicker 35s linear infinite",
          }}
        >
          {text.repeat(5)}
        </div>

        <div
  style={{
    position: "absolute",
    right: "16px",
    top: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#6ef7a7",
    fontSize: "12px",
    fontWeight: 800,
    background: "rgba(0,10,25,.85)",
    padding: "4px 10px",
    borderRadius: "999px",
    zIndex: 10,
    border: "1px solid rgba(89,243,143,.25)",
  }}
>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#59f38f",
              boxShadow: "0 0 10px #59f38f",
            }}
          />
          🟢 Staff CineZone
        </div>
      </div>
    </>
  );
}
