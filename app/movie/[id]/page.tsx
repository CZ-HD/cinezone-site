import Link from "next/link";
import FavoriteButton from "../../components/FavoriteButton";
import DownloadButton from "../../components/DownloadButton";
import Comments from "../../components/Comments";
import { supabase } from "@/lib/supabase";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const BASE_URL = "https://api.themoviedb.org/3";

function imageUrl(path?: string | null, size = "w500") {
  if (!path) return "https://via.placeholder.com/220x330?text=No+Image";
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export default async function MoviePage({ params }: any) {
  let movie: any = null;
  let trailer: any = null;

  const localResult = await supabase
    .from("downloads")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  const localMovie = localResult.data;

  const res = await fetch(
    `${BASE_URL}/movie/${params.id}?api_key=${API_KEY}&language=fr-FR`,
    { cache: "no-store" }
  );

  if (res.ok) {
    const tmdbMovie = await res.json();

    movie = {
      ...tmdbMovie,
      link: localMovie?.link || null,
    };

    const videoRes = await fetch(
      `${BASE_URL}/movie/${params.id}/videos?api_key=${API_KEY}&language=fr-FR`,
      { cache: "no-store" }
    );

    if (videoRes.ok) {
      const videosData = await videoRes.json();
      const videos = videosData?.results || [];

      trailer =
        videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube") ||
        videos.find((v: any) => v.site === "YouTube");
    }
  } else if (localMovie) {
    movie = {
      id: localMovie.id,
      title: localMovie.title || "Film sans titre",
      poster_path: localMovie.poster_path,
      backdrop_path: localMovie.backdrop_path || localMovie.poster_path,
      vote_average: localMovie.vote_average,
      release_date: localMovie.release_date,
      overview: localMovie.overview || "Film ajouté manuellement.",
      imdb_id: localMovie.imdb_id,
      link: localMovie.link,
    };
  } else {
    return (
      <main
        style={{
          background: "#000",
          color: "#fff",
          minHeight: "100vh",
          padding: "40px",
        }}
      >
        <Link href="/films" style={{ color: "#00c6ff" }}>
          ← Retour aux films
        </Link>
        <h1>Film introuvable</h1>
      </main>
    );
  }

  return (
    <main
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ position: "relative", height: "65vh", overflow: "hidden" }}>
        {(movie.backdrop_path || movie.poster_path) && (
          <img
            src={
              movie.backdrop_path
                ? imageUrl(movie.backdrop_path, "original")
                : imageUrl(movie.poster_path, "original")
            }
            alt={movie.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.35) blur(4px)",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, #000 20%, rgba(0,0,0,0.45), transparent)",
          }}
        />

        <Link
          href="/films"
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            color: "#fff",
            background: "rgba(0,0,0,0.7)",
            padding: "10px 16px",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Retour
        </Link>
      </div>

      <section
        style={{
          padding: "24px",
          marginTop: "-110px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
          <img
            src={imageUrl(movie.poster_path)}
            alt={movie.title}
            style={{
              width: "220px",
              height: "330px",
              objectFit: "cover",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            }}
          />

          <div style={{ maxWidth: "700px" }}>
            <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
              {movie.title}
            </h1>

            {movie.vote_average && <p>⭐ {movie.vote_average} / 10</p>}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "16px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <FavoriteButton item={movie} type="movie" />
              <DownloadButton movieId={Number(params.id)} />
            </div>

            {movie.release_date && (
              <p style={{ opacity: 0.7 }}>Date : {movie.release_date}</p>
            )}

            {/* IMDb caché */}

            <p style={{ color: "#ddd", lineHeight: 1.6 }}>
              {movie.overview || "Pas de résumé disponible."}
            </p>
          </div>
        </div>

        <div style={{ marginTop: "40px" }}>
          <h2>🎬 Bande-annonce</h2>

          {trailer ? (
            <iframe
              width="100%"
              height="480"
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="Bande-annonce"
              allowFullScreen
              style={{
                borderRadius: "16px",
                border: "none",
                marginTop: "10px",
              }}
            />
          ) : (
            <p style={{ color: "#aaa" }}>Pas de bande-annonce disponible.</p>
          )}
        </div>

        <Comments itemId={movie.id} itemType="movie" />
      </section>
    </main>
  );
}
