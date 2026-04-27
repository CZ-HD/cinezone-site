"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const BASE_URL = "https://api.themoviedb.org/3";

export default function FilmsPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("downloads")
      .select("id, title, poster_path, vote_average, release_date")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const completedMovies = await Promise.all(
      (data || []).map(async (movie) => {
        if (movie.title && movie.poster_path) {
          return movie;
        }

        try {
          const res = await fetch(
            `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=fr-FR`
          );

          if (!res.ok) return movie;

          const tmdb = await res.json();

          return {
            ...movie,
            title: tmdb.title,
            poster_path: tmdb.poster_path,
            vote_average: tmdb.vote_average,
            release_date: tmdb.release_date,
          };
        } catch {
          return movie;
        }
      })
    );

    setMovies(completedMovies);
    setLoading(false);
  };

  const filteredMovies = movies.filter((movie) =>
    (movie.title || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "34px",
        color: "#fff",
        background:
          "radial-gradient(circle at top, rgba(0,120,255,0.16), #000 60%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>🎬 Films disponibles</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Rechercher un film..."
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "14px 16px",
          borderRadius: "14px",
          border: "1px solid rgba(0,198,255,0.28)",
          background: "#0b0f18",
          color: "#fff",
          outline: "none",
          margin: "20px 0 30px",
          boxShadow: "0 0 18px rgba(0,140,255,0.18)",
        }}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : filteredMovies.length === 0 ? (
        <p style={{ color: "#aaa" }}>Aucun film trouvé.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              style={{ color: "#fff", textDecoration: "none" }}
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={movie.title || "Film"}
                style={{
                  width: "100%",
                  height: "240px",
                  objectFit: "cover",
                  borderRadius: "16px",
                  boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
                }}
              />

              <h3 style={{ fontSize: "15px", marginTop: "12px" }}>
                {movie.title || `Film ${movie.id}`}
              </h3>

              {movie.vote_average && (
                <p style={{ opacity: 0.75 }}>⭐ {movie.vote_average} / 10</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}