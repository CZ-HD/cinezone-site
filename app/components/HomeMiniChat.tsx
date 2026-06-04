"use client";

import Link from "next/link";

export default function HomeMiniChat() {
  return (
    <div
      style={{
        padding: "20px 24px",
        borderRadius: "18px",
        background:
          "linear-gradient(135deg, rgba(0,25,60,.55), rgba(0,45,95,.45))",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(0,198,255,.35)",
        boxShadow:
          "0 0 35px rgba(0,198,255,.15), inset 0 0 20px rgba(0,198,255,.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            color: "#67e8f9",
            fontWeight: 800,
            fontSize: "18px",
          }}
        >
          💬 Chat CineZone
        </div>

        <div
          style={{
            color: "#4ade80",
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          ● En ligne
        </div>
      </div>

      <div style={{ marginBottom: "10px", color: "#dbeafe" }}>
        <strong style={{ color: "#facc15" }}>👑 Vadrox</strong> :
        Bienvenue sur CineZone !
      </div>

      <div style={{ marginBottom: "10px", color: "#dbeafe" }}>
        <strong style={{ color: "#38bdf8" }}>🎬 Membre</strong> :
        Merci pour le dernier upload 👍
      </div>

      <div style={{ marginBottom: "20px", color: "#dbeafe" }}>
        <strong style={{ color: "#c084fc" }}>⭐ Staff</strong> :
        Les nouveautés arrivent bientôt.
      </div>

      <Link
        href="/chat"
        style={{
          display: "inline-block",
          padding: "10px 18px",
          borderRadius: "10px",
          background: "linear-gradient(135deg,#00c6ff,#0072ff)",
          color: "#fff",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        Ouvrir le chat →
      </Link>
    </div>
  );
}
