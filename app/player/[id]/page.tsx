
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
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h1>🎬 Vidéo introuvable</h1>

        <p style={{ color: "#aaa", marginTop: "10px" }}>
          Le lecteur de ce film n'est pas encore disponible.
        </p>

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
            gap: "20px",
            flexWrap: "wrap",
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
              flexWrap: "wrap",
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
        {/* INFORMATIONS DU FILM */}

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
              alt={movie.title ?? "Affiche du film"}
              style={{
                width: "230px",
                maxWidth: "100%",
                borderRadius: "18px",
                boxShadow: "0 25px 60px rgba(0,0,0,.8)",
                objectFit: "cover",
              }}
            />
          )}

          <div style={{ flex: 1, minWidth: "250px" }}>
            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 52px)",
                lineHeight: 1.15,
                marginTop: 0,
                marginBottom: "20px",
                overflowWrap: "anywhere",
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

              {movie.release_date && (
                <span
                  style={{
                    background: "#111",
                    padding: "8px 14px",
                    borderRadius: "999px",
                  }}
                >
                  📅 {movie.release_date}
                </span>
              )}

              {movie.codec && (
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
              )}

              {movie.audio && (
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
              )}
            </div>
          </div>
        </div>

        {/* LECTEUR UPBOLT OU SEEKSTREAMING */}

        <section
          aria-label={`Lecteur vidéo : ${movie.title}`}
          style={{
            width: "100%",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 25px 80px rgba(0,0,0,.85)",
            background: "#000",
          }}
        >
          <iframe
            src={movie.stream_link}
            title={`Lecteur vidéo - ${movie.title}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              height: "auto",
              border: "none",
              display: "block",
              background: "#000",
            }}
          />
        </section>

        {/* RETOUR AU FILM */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "30px",
          }}
        >
          <Link
            href={`/movie/${params.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 22px",
              borderRadius: "999px",
              background: "rgba(0,198,255,.12)",
              border: "1px solid rgba(0,198,255,.35)",
              color: "#67e8f9",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Retour à la fiche du film
          </Link>
        </div>
      </div>
    </main>
  );
}
