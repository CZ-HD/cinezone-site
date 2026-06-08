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

  const text = `${announcement.icon || "🍿"} ${announcement.content}   ✦   `;

  return (
    <>
      <style jsx>{`
        @keyframes cinezoneNews {
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
          whiteSpace: "nowrap",
          borderRadius: "14px",
          border: "1px solid rgba(0,198,255,.18)",
          background:
            "linear-gradient(90deg, rgba(0,25,55,.45), rgba(0,12,30,.55))",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow:
            "0 0 18px rgba(0,198,255,.08), inset 0 0 14px rgba(255,255,255,.02)",
          padding: "10px 0",
        }}
      >
        <div
          style={{
            display: "inline-block",
            paddingLeft: "100%",
            color: "#69eaff",
            fontSize: "15px",
            fontWeight: 700,
            textShadow: "0 0 8px rgba(0,198,255,.25)",
            animation: "cinezoneNews 32s linear infinite",
          }}
        >
          {text.repeat(6)}
        </div>
      </div>
    </>
  );
}
