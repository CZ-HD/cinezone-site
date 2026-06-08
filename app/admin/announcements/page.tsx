"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("📢");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnnouncement();
  }, []);

  async function loadAnnouncement() {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("active", true)
      .limit(1)
      .single();

    if (data) {
      setTitle(data.title || "");
      setIcon(data.icon || "📢");
      setContent(data.content || "");
    }
  }

  async function saveAnnouncement() {
    setLoading(true);

    const { error } = await supabase
      .from("announcements")
      .update({
        title,
        icon,
        content,
      })
      .eq("active", true);

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("✅ Annonce enregistrée !");
    }
  }

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
        color: "#fff",
      }}
    >
      <h1 style={{ marginBottom: "25px" }}>
        📢 Gestion des annonces
      </h1>

      <div style={{ marginBottom: "15px" }}>
        <label>Titre</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            borderRadius: "10px",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Icône</label>
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            borderRadius: "10px",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Annonce</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            borderRadius: "10px",
            resize: "vertical",
          }}
        />
      </div>

      <button
        onClick={saveAnnouncement}
        disabled={loading}
        style={{
          padding: "14px 24px",
          border: "none",
          borderRadius: "12px",
          background:
            "linear-gradient(135deg,#ffb300,#ff7b00)",
          color: "#fff",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        {loading ? "Enregistrement..." : "💾 Enregistrer"}
      </button>
    </main>
  );
}
