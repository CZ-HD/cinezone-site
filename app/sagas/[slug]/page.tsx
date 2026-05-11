"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SagaDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [saga, setSaga] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    loadSaga();
  }, [slug]);

  async function loadSaga() {
    const { data: sagaData } = await supabase
      .from("sagas")
      .select("*")
      .eq("slug", slug)
      .single();

    setSaga(sagaData);

    if (!sagaData) return;

    const { data: movieData } = await supabase
      .from("downloads")
      .select("*")
      .eq("saga_id", sagaData.id)
      .order("release_year", { ascending: true });

    setMovies(movieData || []);
  }

  if (!saga) {
    return (
      <main style={pageStyle}>
        <p>Chargement de la saga...</p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section
        style={{
          ...heroStyle,
          background: saga.backdrop
            ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.85)), url("${saga.backdrop}")`
            : heroStyle.background,
        }}
      >
        <h1>{saga.title}</h1>
        <p>{saga.description}</p>
      </section>

      <section style={gridStyle}>
        {movies.length === 0 ? (
          <p>Aucun film lié à cette saga pour le moment.</p>
        ) : (
          movies.map((movie) => (
            <Link key={movie.id} href={`/movie/${movie.id}`} style={cardStyle}>
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  style={posterStyle}
                />
              ) : (
                <div style={fakePoster}>🎬</div>
              )}

              <h2 style={movieTitle}>{movie.title}</h2>
              <p style={yearText}>{movie.release_year}</p>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "70px 30px",
  background: "#000",
  color: "#fff",
};

const heroStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto 34px",
  padding: "45px",
  borderRadius: "28px",
  background: "rgba(10,15,25,0.82)",
  backgroundSize: "cover",
  backgroundPosition: "center",
  border: "1px solid rgba(0,198,255,0.28)",
};

const gridStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
  gap: "18px",
};

const cardStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "none",
};

const posterStyle: React.CSSProperties = {
  width: "100%",
  height: "255px",
  objectFit: "cover",
  borderRadius: "14px",
};

const fakePoster: React.CSSProperties = {
  height: "255px",
  display: "grid",
  placeItems: "center",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.08)",
  fontSize: "40px",
};

const movieTitle: React.CSSProperties = {
  fontSize: "15px",
  margin: "10px 0 4px",
};

const yearText: React.CSSProperties = {
  color: "#94a3b8",
  margin: 0,
};
