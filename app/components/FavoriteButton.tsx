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
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "7px",
        padding: "9px 15px",
        borderRadius: "14px",
        border: isFav
          ? "1px solid rgba(255,215,0,0.45)"
          : "1px solid rgba(0,198,255,0.25)",
        background: isFav
          ? "linear-gradient(135deg, rgba(255,215,0,0.22), rgba(255,140,0,0.12))"
          : "linear-gradient(135deg, rgba(0,198,255,0.16), rgba(0,114,255,0.08))",
        color: "#fff",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: isFav
          ? "0 10px 26px rgba(255,180,0,0.18)"
          : "0 10px 26px rgba(0,114,255,0.18)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px) scale(1.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      <span>{isFav ? "⭐" : "☆"}</span>
      <span>{isFav ? "Ajouté" : "Favori"}</span>
    </button>
  );
}
