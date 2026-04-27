import Link from "next/link";
import FavoriteButton from "../../components/FavoriteButton";
import DownloadButton from "../../components/DownloadButton";
import Comments from "../../components/Comments";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const BASE_URL = "https://api.themoviedb.org/3";

export default async function MoviePage({ params }: any) {
  const res = await fetch(
    `${BASE_URL}/movie/${params.id}?api_key=${API_KEY}&language=fr-FR`,
    { cache: "no-store" }
  );

  const videoRes = await fetch(
    `${BASE_URL}/movie/${params.id}/videos?api_key=${API_KEY}&language=fr-FR`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Impossible de charger le film");
  }

  const movie = await res.json();
  const videosData = await videoRes.json();
  const videos = videosData?.results || [];

  const trailer =
    videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube") ||
    videos.find((v: any) => v.site === "YouTube");

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
        {movie.backdrop_path ? (
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.4)",
            }}
          />
        ) : (
          <div style={{ height: "100%", background: "#111" }} />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, #000 20%, rgba(0,0,0,0.4), transparent)",
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
            border: "1px solid rgba(255,255,255,0.15)",
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
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/220x330?text=No+Image"
            }
            alt={movie.title}
            style={{
              width: "220px",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            }}
          />

          <div style={{ maxWidth: "700px" }}>
            <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
              {movie.title}
            </h1>

            <p style={{ opacity: 0.9 }}>⭐ {movie.vote_average} / 10</p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "16px",
                marginBottom: "20px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <FavoriteButton item={movie} type="movie" />
              <DownloadButton movieId={Number(params.id)} />
            </div>

            {movie.release_date && (
              <p style={{ opacity: 0.7 }}>Date : {movie.release_date}</p>
            )}

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
            <p style={{ color: "#aaa" }}>
              Pas de bande-annonce disponible.
            </p>
          )}
        </div>

        <Comments itemId={movie.id} itemType="movie" />
      </section>
    </main>
  );
}