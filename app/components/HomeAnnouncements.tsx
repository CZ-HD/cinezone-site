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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    const { data } = await supabase
      .from("announcements")
      .select("id,title,content,icon")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) setAnnouncements(data);
  }

  if (announcements.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "22px",
        width: "100%",
        maxWidth: "1050px",
        display: "grid",
        gap: "12px",
      }}
    >
      {announcements.map((item) => (
        <div
          key={item.id}
          style={{
            padding: "16px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, rgba(0,25,55,.45), rgba(0,12,30,.55))",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(0,198,255,.18)",
            boxShadow: "0 0 18px rgba(0,198,255,.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "22px" }}>
              {item.icon || "📢"}
            </span>

            <span
              style={{
                color: "#69eaff",
                fontWeight: 800,
                fontSize: "18px",
              }}
            >
              {item.title}
            </span>
          </div>

          <div
            style={{
              color: "#dbeafe",
              lineHeight: "24px",
              fontSize: "15px",
            }}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
