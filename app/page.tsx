"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

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
      try {
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
      } catch (error) {
        console.error(error);
      }
    }

    loadHome();
  }, []);

  useEffect(() => {
    if (trending.length === 0) return;

    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % trending.length);
    }, 45000);

    return () => clearInterval(timer);
  }, [trending]);

  const hero = trending[heroIndex];

  return (
    <main style={pageStyle}>
      {hero && (
        <section
          style={{
            ...heroStyle,
            backgroundImage: `
              linear-gradient(90deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.72) 34%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.78) 100%),
              linear-gradient(to top, #000 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.35) 100%),
              url(${IMG}/original${hero.backdrop_path})
            `,
          }}
        >
          <button
            onClick={() =>
              setHeroIndex((prev) =>
                prev === 0 ? trending.length - 1 : prev - 1
              )
            }
            style={{ ...arrowBtn, left: "22px" }}
          >
            ‹
          </button>

          <div style={heroContent}>
            <span style={badge}>🔥 FILM EN VEDETTE</span>

            <h1 style={heroTitle}>{hero.title}</h1>

            <div style={metaRow}>
              <span>⭐ {hero.vote_average?.toFixed(1)} / 10</span>
              <span>🎬 {hero.release_date?.slice(0, 4) || "N/A"}</span>
              <span style={qualityBadge}>HD</span>
            </div>

            <p style={heroText}>
              {hero.overview || "Aucune description disponible pour ce film."}
            </p>

            <div style={buttonRow}>
              <Link href={`/movie/${hero.id}`} style={primaryBtn}>
                ▶ Voir le film
              </Link>

              <Link href="/films" style={secondaryBtn}>
                Explorer le catalogue
              </Link>
            </div>
          </div>

          <button
            onClick={() =>
              setHeroIndex((prev) => (prev + 1) % trending.length)
            }
            style={{ ...arrowBtn, right: "22px" }}
          >
            ›
          </button>
        </section>
      )}

      <section style={quickCards}>
        <QuickCard icon="🔥" title="Tendances" text="Les films les plus regardés" />
        <QuickCard icon="🆕" title="Nouveautés" text="Les derniers ajouts" />
        <QuickCard icon="🎬" title="Films" text="Explorer le catalogue" />
        <QuickCard icon="💬" title="Chat" text="Communauté CineZone" />
      </section>

      <div style={contentStyle}>
        <Row title="🔥 Tendances" movies={trending} />
        <Row title="⭐ Top Rated" movies={topRated} />
        <Row title="⚔️ Action" movies={action} />
        <Row title="😂 Comédie" movies={comedy} />
        <Row title="😱 Horreur" movies={horror} />
        <Row title="❤️ Romance" movies={romance} />
      </div>
    </main>
  );
}

function QuickCard({ icon, title, text }: any) {
  return (
    <div style={quickCard}>
      <div style={quickIcon}>{icon}</div>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Row({ title, movies }: any) {
  return (
    <section style={rowStyle}>
      <h2 style={rowTitle}>{title}</h2>

      <div style={sliderStyle}>
        {movies.slice(0, 18).map((movie: any) => (
          <Link key={movie.id} href={`/movie/${movie.id}`} style={movieCard}>
            <img
              src={
                movie.poster_path
                  ? `${IMG}/w300${movie.poster_path}`
                  : "https://via.placeholder.com/300x450?text=No+Image"
              }
              alt={movie.title || "Film"}
              style={posterStyle}
            />

            <div style={movieInfo}>
              <strong>{movie.title}</strong>
              <span>⭐ {movie.vote_average?.toFixed(1) || "N/A"}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const pageStyle: React.CSSProperties = {
  background: "#000",
  color: "#fff",
  minHeight: "100vh",
  overflowX: "hidden",
};

const heroStyle: React.CSSProperties = {
  position: "relative",
  minHeight: "78vh",
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  alignItems: "center",
  padding: "70px 90px",
};

const heroContent: React.CSSProperties = {
  maxWidth: "620px",
  zIndex: 2,
};

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.18)",
  border: "1px solid rgba(0,198,255,0.45)",
  color: "#67e8f9",
  fontWeight: 900,
  marginBottom: "18px",
  boxShadow: "0 0 18px rgba(0,198,255,0.25)",
};

const heroTitle: React.CSSProperties = {
  fontSize: "64px",
  lineHeight: 1,
  margin: "0 0 16px",
  fontWeight: 950,
  textShadow: "0 0 28px rgba(0,0,0,0.85)",
};

const metaRow: React.CSSProperties = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  color: "#dbeafe",
  marginBottom: "18px",
  fontWeight: 800,
  flexWrap: "wrap",
};

const qualityBadge: React.CSSProperties = {
  padding: "4px 9px",
  borderRadius: "7px",
  border: "1px solid rgba(0,198,255,0.5)",
  color: "#67e8f9",
};

const heroText: React.CSSProperties = {
  color: "#d1d5db",
  lineHeight: 1.7,
  fontSize: "17px",
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: "14px",
  marginTop: "26px",
  flexWrap: "wrap",
};

const primaryBtn: React.CSSProperties = {
  padding: "14px 24px",
  borderRadius: "13px",
  background: "linear-gradient(135deg,#00c6ff,#0072ff,#3a00ff)",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 900,
  boxShadow: "0 0 25px rgba(0,114,255,0.45)",
};

const secondaryBtn: React.CSSProperties = {
  padding: "14px 24px",
  borderRadius: "13px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 900,
};

const arrowBtn: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 3,
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "rgba(0,0,0,0.45)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  fontSize: "32px",
  cursor: "pointer",
};

const quickCards: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  padding: "0 40px",
  marginTop: "-65px",
  position: "relative",
  zIndex: 4,
};

const quickCard: React.CSSProperties = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(15,23,42,0.82)",
  border: "1px solid rgba(0,198,255,0.18)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 20px 55px rgba(0,0,0,0.45)",
};

const quickIcon: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "16px",
  background: "rgba(0,198,255,0.16)",
  display: "grid",
  placeItems: "center",
  fontSize: "25px",
};

const contentStyle: React.CSSProperties = {
  padding: "35px 28px 70px",
};

const rowStyle: React.CSSProperties = {
  marginBottom: "38px",
};

const rowTitle: React.CSSProperties = {
  fontSize: "22px",
  margin: "0 0 14px",
};

const sliderStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  overflowX: "auto",
  paddingBottom: "16px",
};

const movieCard: React.CSSProperties = {
  minWidth: "155px",
  maxWidth: "155px",
  color: "#fff",
  textDecoration: "none",
  borderRadius: "15px",
  overflow: "hidden",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
};

const posterStyle: React.CSSProperties = {
  width: "100%",
  height: "232px",
  objectFit: "cover",
  display: "block",
};

const movieInfo: React.CSSProperties = {
  padding: "10px",
  display: "grid",
  gap: "6px",
  fontSize: "13px",
  color: "#dbeafe",
};
