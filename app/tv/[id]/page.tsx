import Link from "next/link";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const BASE_URL = "https://api.themoviedb.org/3";

export default async function TvPage({ params }: any) {
  const res = await fetch(
    `${BASE_URL}/tv/${params.id}?api_key=${API_KEY}&language=fr-FR`,
    { cache: "no-store" }
  );

  const videoRes = await fetch(
    `${BASE_URL}/tv/${params.id}/videos?api_key=${API_KEY}&language=fr-FR`,
    { cache: "no-store" }
  );

  const tv = await res.json();
  const videosData = await videoRes.json();
  const videos = videosData?.results || [];

  const trailer = videos.find(
    (v: any) => v.type === "Trailer" && v.site === "YouTube"
  );

  return (
    <main
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Link href="/" style={{ color: "#3fc5ff" }}>
        ← Retour
      </Link>

      <h1 style={{ marginTop: "20px" }}>{tv.name}</h1>

      {trailer ? (
        <iframe
          width="100%"
          height="400"
          src={`https://www.youtube.com/embed/${trailer.key}`}
          allowFullScreen
          style={{ borderRadius: "10px", marginTop: "20px" }}
        />
      ) : (
        <p style={{ marginTop: "20px" }}>Pas de trailer disponible</p>
      )}

      <p style={{ marginTop: "20px" }}>{tv.overview}</p>
    </main>
  );
}