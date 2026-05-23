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
        color: "#fff",
        background:
          "linear-gradient(135deg, rgba(0,198,255,0.45), rgba(0,114,255,0.45), rgba(138,43,226,0.45))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(120,220,255,0.6)",
        boxShadow: hover
          ? "0 0 22px rgba(0,198,255,0.75), 0 0 42px rgba(138,43,226,0.45)"
          : "0 0 14px rgba(0,198,255,0.42)",
        transform: hover ? "translateY(-1px) scale(1.04)" : "scale(1)",
      }}
    >
      <span>⬇</span>
      <span>TÉLÉCHARGER</span>
    </button>
  );
}
