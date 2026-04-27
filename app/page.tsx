import Link from "next/link";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

async function fetchMovies(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Erreur API");
  return (await res.json()).results || [];
}

export default async function Home() {
  const trending = await fetchMovies(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=fr-FR`
  );

  const topRated = await fetchMovies(
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=fr-FR`
  );

  const action = await fetchMovies(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&language=fr-FR`
  );

  const comedy = await fetchMovies(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35&language=fr-FR`
  );

  const horror = await fetchMovies(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27&language=fr-FR`
  );

  const romance = await fetchMovies(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=10749&language=fr-FR`
  );

  const hero = trending[0];

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>
      {/* HERO */}
      {hero && (
        <section
          style={{
            height: "80vh",
            backgroundImage: `url(https://image.tmdb.org/t/p/original${hero.backdrop_path})`,
            backgroundSize: "cover",
            display: "flex",
            alignItems: "flex-end",
            padding: "40px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "50px" }}>{hero.title}</h1>
            <p style={{ maxWidth: "500px" }}>{hero.overview}</p>

            <Link href={`/movie/${hero.id}`}>
              <button
                style={{
                  marginTop: "10px",
                  padding: "10px 20px",
                  background: "#e50914",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ▶ Voir
              </button>
            </Link>
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
        }}
      >
        {movies.slice(0, 15).map((movie: any) => (
          <Link key={movie.id} href={`/movie/${movie.id}`}>
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                  : ""
              }
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