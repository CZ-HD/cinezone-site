import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function imageUrl(path?: string | null, size = "original") {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export default async function PlayerPage({ params }: any) {
  const { data: movie } = await supabase
    .from("downloads")
    .select(`
      id,
      title,
      stream_link,
      poster_path,
      backdrop_path,
      vote_average,
      release_date,
      codec,
      audio
    `)
    .eq("id", Number(params.id))
    .single();

  if (!movie || !movie.stream_link) {
    return (
      <main
        style={{
          background: "#000",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <h1>🎬 Vidéo introuvable</h1>

        <Link
          href={`/movie/${params.id}`}
          style={{
            color: "#00c6ff",
            marginTop: "20px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Retour au film
        </Link>
      </main>
    );
  }

  return (
    <main
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        backgroundImage: movie.backdrop_path
          ? `linear-gradient(rgba(0,0,0,.80),rgba(0,0,0,.95)), url(${imageUrl(
              movie.backdrop_path
            )})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 35px",
          background: "rgba(8,12,20,.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <Link
          href="/"
          style={{
            color: "#fff",
            fontSize: "30px",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          🎬 CineZone HD
        </Link>

        <div
          style={{
            display: "flex",
            gap: "25px",
            alignItems: "center",
          }}
        >
          <Link
            href="/films"
            style={{
              color: "#ddd",
              textDecoration: "none",
            }}
          >
            Films
          </Link>

          <Link
            href={`/movie/${params.id}`}
            style={{
              color: "#00c6ff",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            ← Retour au film
          </Link>
        </div>
      </header>

      {/* CONTENU */}

      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "30px",
        }}
      >
        {/* INFOS FILM */}

        <div
          style={{
            display: "flex",
            gap: "35px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          {movie.poster_path && (
            <img
              src={imageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              style={{
                width: "220px",
                borderRadius: "18px",
                boxShadow: "0 25px 60px rgba(0,0,0,.8)",
              }}
            />
          )}

          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "48px",
                marginBottom: "15px",
              }}
            >
              🎬 {movie.title}
            </h1>

            <div
              style={{
                display: "flex",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "15px",
              }}
            >
              <span>⭐ {movie.vote_average ?? "-"} /10</span>

              <span>📅 {movie.release_date}</span>

              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  background: "#111",
                  border: "1px solid #333",
                }}
              >
                {movie.codec}
              </span>

              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  background: "#07263d",
                  border: "1px solid #00c6ff",
                }}
              >
                {movie.audio}
              </span>
            </div>
          </div>
        </div>

        {/* LECTEUR */}

        <div
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 30px 80px rgba(0,0,0,.8)",
            background: "#000",
          }}
        >
          <iframe
            src={movie.stream_link}
            allowFullScreen
            style={{
              width: "100%",
              height: "86vh",
              border: "none",
              display: "block",
            }}
          />
        </div>
      </div>
    </main>
  );
}
