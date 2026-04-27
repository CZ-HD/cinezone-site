"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function FavorisPage() {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("fav") || "[]");
    setFavorites(saved);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "24px",
      }}
    >
      <h1>⭐ Mes favoris</h1>

      {favorites.length === 0 ? (
        <p>Aucun favori pour le moment.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: "20px",
          }}
        >
          {favorites.map((item: any) => {
            const href =
              item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;

            return (
              <Link
                key={`${item.media_type}-${item.id}`}
                href={href}
                style={{ textDecoration: "none", color: "white" }}
              >
                <div>
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : "https://via.placeholder.com/170x255?text=No+Image"
                    }
                    alt={item.title || item.name}
                    style={{ width: "100%", borderRadius: "12px" }}
                  />
                  <p>{item.title || item.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
