"use client";

import { useEffect, useState } from "react";

export default function FavoriteButton({ item, type }: any) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("fav") || "[]");
    const exists = saved.find(
      (m: any) => m.id === item.id && m.media_type === type
    );

    setIsFav(!!exists);
  }, [item.id, type]);

  const toggleFavorite = () => {
    let saved = JSON.parse(localStorage.getItem("fav") || "[]");

    if (isFav) {
      saved = saved.filter(
        (m: any) => !(m.id === item.id && m.media_type === type)
      );
    } else {
      saved.push({
        id: item.id,
        title: item.title,
        name: item.name,
        poster_path: item.poster_path,
        media_type: type,
      });
    }

    localStorage.setItem("fav", JSON.stringify(saved));
    setIsFav(!isFav);
  };

  return (
  <button
    onClick={toggleFavorite}
    style={{
      position: "relative",
      overflow: "hidden",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "12px 20px",
      borderRadius: "18px",
      border: isFav
        ? "1px solid rgba(255,215,0,0.35)"
        : "1px solid rgba(120,220,255,0.25)",
      background: isFav
        ? `
          linear-gradient(
            135deg,
            rgba(255,215,0,0.18),
            rgba(255,140,0,0.14)
          )
        `
        : `
          linear-gradient(
            135deg,
            rgba(0,198,255,0.14),
            rgba(0,114,255,0.10)
          )
        `,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 800,
      letterSpacing: "0.4px",
      cursor: "pointer",
      transition: "all 0.25s ease",
      boxShadow: isFav
        ? `
          0 0 18px rgba(255,200,0,0.35),
          inset 0 0 12px rgba(255,255,255,0.05)
        `
        : `
          0 0 12px rgba(0,198,255,0.22),
          inset 0 0 10px rgba(255,255,255,0.04)
        `,
      transform: isFav ? "scale(1.02)" : "scale(1)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform =
        "translateY(-2px) scale(1.04)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform =
        isFav ? "scale(1.02)" : "scale(1)";
    }}
  >
    {/* Reflet animé */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)",
        opacity: 0.8,
      }}
    />

    {/* Icône */}
    <div
      style={{
        position: "relative",
        zIndex: 2,
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isFav
          ? "rgba(255,215,0,0.12)"
          : "rgba(255,255,255,0.06)",
        border: isFav
          ? "1px solid rgba(255,215,0,0.28)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isFav
          ? "0 0 12px rgba(255,215,0,0.35)"
          : "0 0 10px rgba(0,198,255,0.20)",
        fontSize: "18px",
      }}
    >
      {isFav ? "⭐" : "☆"}
    </div>

    {/* Texte */}
    <span
      style={{
        position: "relative",
        zIndex: 2,
      }}
        >
      {isFav ? "Ajouté" : "Favori"}
    </span>
  </button>
);
}
