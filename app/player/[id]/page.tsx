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
            marginTop: 20,
            color: "#00c6ff",
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
        minHeight: "100vh",
        color: "#fff",
        backgroundColor: "#000",
        backgroundImage: movie.backdrop_path
          ? `linear-gradient(rgba(0,0,0,.82),rgba(0,0,0,.95)),url(${imageUrl(
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
          backdropFilter: "blur(12px)",
          background: "rgba(0,0,0,.82)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            maxWidth: "1700px",
            margin: "0 auto",
            padding: "18px 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 900,
              fontSize: "32px",
            }}
          >
            🎬 CineZone HD
          </Link>

          <div
            style={{
              display: "flex",
              gap: "30px",
              alignItems: "center",
            }}
          >
            <Link
              href="/films"
              style={{
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Films
            </Link>

            <Link
              href={`/movie/${params.id}`}
              style={{
                color: "#00c6ff",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              ← Retour au film
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENU */}

      <div
        style={{
          maxWidth: "1700px",
          margin: "0 auto",
          padding: "35px",
        }}
      >
        {/* INFOS */}

        <div
          style={{
            display: "flex",
            gap: "35px",
            flexWrap: "wrap",
            alignItems: "flex-start",
            marginBottom: "30px",
          }}
        >
          {movie.poster_path && (
            <img
              src={imageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              style={{
                width: "230px",
                borderRadius: "18px",
                boxShadow: "0 25px 60px rgba(0,0,0,.8)",
              }}
            />
          )}

          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "52px",
                marginBottom: "20px",
              }}
            >
              {movie.title}
            </h1>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <span
                style={{
                  background: "#111",
                  padding: "8px 14px",
                  borderRadius: "999px",
                }}
              >
                ⭐ {movie.vote_average ?? "-"} /10
              </span>

              <span
                style={{
                  background: "#111",
                  padding: "8px 14px",
                  borderRadius: "999px",
                }}
              >
                📅 {movie.release_date}
              </span>

              <span
                style={{
                  background:
                    movie.codec === "H265"
                      ? "rgba(0,255,170,.18)"
                      : "rgba(255,255,255,.08)",
                  color:
                    movie.codec === "H265"
                      ? "#00ffaa"
                      : "#fff",
                  borderRadius: "999px",
                  padding: "8px 14px",
                }}
              >
                {movie.codec}
              </span>

              <span
                style={{
                  background: "rgba(0,198,255,.18)",
                  color: "#67e8f9",
                  borderRadius: "999px",
                  padding: "8px 14px",
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
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 25px 80px rgba(0,0,0,.85)",
            background: "#000",
          }}
        >
          <iframe
            src={movie.stream_link}
            allowFullScreen
            loading="lazy"
            style={{
              width: "100%",
              height: "88vh",
              border: "none",
              display: "block",
            }}
          />
        </div>
      </div>
    </main>
  );
}
