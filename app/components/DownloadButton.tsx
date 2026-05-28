"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DownloadButton({ movieId }: { movieId: number }) {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    async function checkDownload() {
      const { data, error } = await supabase
        .from("downloads")
        .select("id")
        .eq("id", movieId)
        .maybeSingle();

      setAvailable(!!data && !error);
      setLoading(false);
    }

    checkDownload();
  }, [movieId]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/download/${movieId}`);
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    padding: "10px 22px",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "0.4px",
    textDecoration: "none",
    transition: "all 0.25s ease",
    userSelect: "none",
    WebkitUserSelect: "none",
    cursor: "pointer",
  };

  if (loading) {
    return (
      <button
        disabled
        style={{
          ...baseStyle,
          background: "rgba(255,255,255,0.07)",
          color: "#aaa",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        Chargement...
      </button>
    );
  }

  if (!available) {
    return (
      <button
        disabled
        style={{
          ...baseStyle,
          background: "rgba(255,255,255,0.06)",
          color: "#777",
          border: "1px solid rgba(255,255,255,0.12)",
          cursor: "not-allowed",
        }}
      >
        ⬇ Indisponible
      </button>
    );
  }

  return (
  <button
    onClick={handleDownload}
    onContextMenu={(e) => e.preventDefault()}
    onDragStart={(e) => e.preventDefault()}
    onCopy={(e) => e.preventDefault()}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => setHover(false)}
    style={{
      ...baseStyle,
      position: "relative",
      overflow: "hidden",
      padding: "12px 20px",
      borderRadius: "18px",
      border: "1px solid rgba(120,220,255,0.28)",
      background: `
        linear-gradient(
          135deg,
          rgba(0,198,255,0.14),
          rgba(0,114,255,0.16),
          rgba(138,43,226,0.18)
        )
      `,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      color: "#fff",
      transition: "all 0.25s ease",
      boxShadow: hover
        ? `
          0 0 16px rgba(0,198,255,0.65),
          0 0 30px rgba(138,43,226,0.30),
          inset 0 0 14px rgba(255,255,255,0.06)
        `
        : `
          0 0 10px rgba(0,198,255,0.22),
          inset 0 0 10px rgba(255,255,255,0.03)
        `,
      transform: hover
        ? "translateY(-2px) scale(1.03)"
        : "scale(1)",
    }}
  >
    {/* Reflet animé */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.10) 50%, transparent 80%)",
        transform: hover
          ? "translateX(180%)"
          : "translateX(-180%)",
        transition: "transform 0.9s ease",
      }}
    />

    {/* Icône */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 12px rgba(0,198,255,0.25)",
        fontSize: "18px",
      }}
    >
      ⬇
    </div>

    {/* Texte */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        lineHeight: 1.1,
      }}
    >
      <span
        style={{
          fontSize: "16px",
          fontWeight: 900,
          letterSpacing: "0.8px",
        }}
      >
        TÉLÉCHARGER
      </span>

      <span
        style={{
          fontSize: "11px",
          color: "#8be9ff",
          marginTop: "3px",
          letterSpacing: "0.4px",
        }}
      >
        Téléchargement rapide
      </span>
    </div>
  </button>
);
}
