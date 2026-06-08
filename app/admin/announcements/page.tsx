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
      alert("✅ Annonce enregistrée avec succès !");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    marginTop: "8px",
    borderRadius: "12px",
    background: "#101826",
    color: "#ffffff",
    border: "1px solid rgba(0,198,255,.25)",
    outline: "none",
    caretColor: "#ffffff",
    fontSize: "15px",
    boxSizing: "border-box" as const,
  };

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "25px",
        color: "#fff",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(0,25,55,.55), rgba(0,12,30,.70))",
          border: "1px solid rgba(0,198,255,.15)",
          borderRadius: "22px",
          padding: "28px",
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 30px rgba(0,198,255,.08)",
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: "8px",
            fontSize: "30px",
          }}
        >
          📢 Gestion des annonces
        </h1>

        <p
          style={{
            color: "#8fa3bd",
            marginBottom: "30px",
          }}
        >
          Modifiez facilement le message affiché sur la page d'accueil de
          CineZone.
        </p>

        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              fontWeight: 700,
              color: "#dbeafe",
            }}
          >
            Titre
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            placeholder="Bienvenue sur CineZone HD"
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label
            style={{
              fontWeight: 700,
              color: "#dbeafe",
            }}
          >
            Icône
          </label>

          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            style={inputStyle}
            placeholder="📢"
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              fontWeight: 700,
              color: "#dbeafe",
            }}
          >
            Annonce
          </label>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "220px",
              fontFamily: "inherit",
            }}
            placeholder="Bonjour / Bonsoir à toutes et à tous ! Quelques nouveautés sont disponibles sur CineZone..."
          />
        </div>

        <button
          onClick={saveAnnouncement}
          disabled={loading}
          style={{
            padding: "14px 28px",
            border: "none",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg,#ffb300,#ff7b00)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 10px 30px rgba(255,180,0,.30)",
          }}
        >
          {loading
            ? "⏳ Enregistrement..."
            : "💾 Enregistrer l'annonce"}
        </button>
      </div>
    </main>
  );
}
