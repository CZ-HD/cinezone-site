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
      .select("id, title, content, icon")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) {
      setAnnouncements(data);
    }
  }

  if (announcements.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "22px",
        width: "100%",
        maxWidth: "1050px",
        display: "grid",
        gap: "14px",
      }}
    >
      {announcements.map((item) => (
        <div
          key={item.id}
          style={{
            padding: "18px",
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, rgba(0,25,55,.42), rgba(0,12,30,.52))",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(0,198,255,.18)",
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
              marginBottom: "12px",
              gap: "12px",
              flexWrap: "wrap",
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
                  fontSize: "24px",
                }}
              >
                {item.icon || "📢"}
              </span>

              <span
                style={{
                  color: "#69eaff",
                  fontWeight: 900,
                  fontSize: "20px",
                  textShadow: "0 0 10px rgba(0,198,255,.25)",
                }}
              >
                {item.title}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
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
                  boxShadow: "0 0 10px #59f38f",
                }}
              />

              Dernière annonce du staff
            </div>
          </div>

          {/* Séparateur */}

          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,.08)",
              marginBottom: "14px",
            }}
          />

          {/* Contenu */}

          <div
            style={{
              color: "#dbeafe",
              lineHeight: "28px",
              fontSize: "15px",
              whiteSpace: "pre-wrap",
            }}
          >
            {item.content}
          </div>

          {/* Signature */}

          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255,255,255,.06)",
              color: "#7dd3fc",
              fontSize: "13px",
              fontWeight: 700,
              textAlign: "right",
            }}
          >
            — Le Staff CineZone
          </div>
        </div>
      ))}
    </div>
  );
}
