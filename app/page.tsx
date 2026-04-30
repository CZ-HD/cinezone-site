"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const BASE_URL = "https://api.themoviedb.org/3";

async function fetchMovies(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erreur API");
  return (await res.json()).results || [];
}

export default function Home() {
  const [trending, setTrending] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [action, setAction] = useState<any[]>([]);
  const [comedy, setComedy] = useState<any[]>([]);
  const [horror, setHorror] = useState<any[]>([]);
  const [romance, setRomance] = useState<any[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    async function loadHome() {
      const [trend, top, act, com, hor, rom] = await Promise.all([
        fetchMovies(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=fr-FR`),
        fetchMovies(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=fr-FR`),
        fetchMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&language=fr-FR`),
        fetchMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35&language=fr-FR`),
        fetchMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27&language=fr-FR`),
        fetchMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=10749&language=fr-FR`),
      ]);

      setTrending(trend);
      setTopRated(top);
      setAction(act);
      setComedy(com);
      setHorror(hor);
      setRomance(rom);
    }

    loadHome();
  }, []);

  useEffect(() => {
    if (trending.length === 0) return;

    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % trending.length);
    }, 25000);

    return () => clearInterval(timer);
  }, [trending]);

  const hero = trending[heroIndex];

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>
      {hero && (
        <section
          style={{
            height: "80vh",
            backgroundImage: `
              linear-gradient(to top, #000 8%, rgba(0,0,0,0.35), rgba(0,0,0,0.1)),
              url(https://image.tmdb.org/t/p/original${hero.backdrop_path})
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "flex-end",
            padding: "40px",
            transition: "background-image 0.8s ease-in-out",
          }}
        >
          <div>
            <h1 style={{ fontSize: "50px", marginBottom: "10px" }}>
              {hero.title}
            </h1>

            <p style={{ maxWidth: "560px", lineHeight: 1.6, color: "#ddd" }}>
              {hero.overview}
            </p>
          </div>
        </section>
      )}

      <div style={{ padding: "20px" }}>
        <Row title="🔥 Tendances" movies={trending} />
        <Row title="⭐ Top Rated" movies={topRated} />
        <Row title="🎬 Action" movies={action} />
        <Row title="😂 Comédie" movies={comedy} />
        <Row title="😱 Horreur" movies={horror} />
        <Row title="❤️ Romance" movies={romance} />
      </div>
    </main>
  );
}

function Row({ title, movies }: any) {
  return (
    <section style={{ marginBottom: "30px" }}>
      <h2>{title}</h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {movies.slice(0, 15).map((movie: any) => (
          <Link key={movie.id} href={`/movie/${movie.id}`}>
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                  : "https://via.placeholder.com/150x225?text=No+Image"
              }
              alt={movie.title || "Film"}
              style={{
                width: "150px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
