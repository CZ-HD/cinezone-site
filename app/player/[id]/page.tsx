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
        <h1>Vidéo introuvable</h1>

        <Link
          href={`/movie/${params.id}`}
          style={{
            color: "#00c6ff",
            marginTop: "20px",
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
          ? `linear-gradient(rgba(0,0,0,.82),rgba(0,0,0,.95)), url(${imageUrl(
              movie.backdrop_path
            )})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      <div
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          padding: "25px",
        }}
      >
        <Link
          href={`/movie/${params.id}`}
          style={{
            color: "#00c6ff",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          ← Retour à la fiche
        </Link>

        <div
          style={{
            display: "flex",
            gap: "30px",
            marginTop: "30px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          {movie.poster_path && (
            <img
              src={imageUrl(movie.poster_path, "w500")}
              alt={movie.title}
              style={{
                width: "220px",
                borderRadius: "16px",
                boxShadow: "0 20px 60px rgba(0,0,0,.8)",
              }}
            />
          )}

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "46px", marginBottom: "15px" }}>
              🎬 {movie.title}
            </h1>

            <p style={{ fontSize: "18px" }}>
              ⭐ {movie.vote_average ?? "-"} / 10
            </p>

            <p style={{ opacity: 0.8 }}>
              📅 {movie.release_date}
            </p>

            <p style={{ marginTop: "10px" }}>
              <strong>{movie.codec}</strong> • {movie.audio}
            </p>
          </div>
        </div>

        <iframe
          src={movie.stream_link}
          allowFullScreen
          style={{
            width: "100%",
            height: "82vh",
            border: "none",
            borderRadius: "18px",
            background: "#000",
            boxShadow: "0 0 50px rgba(0,0,0,.7)",
          }}
        />
      </div>
    </main>
  );
}
