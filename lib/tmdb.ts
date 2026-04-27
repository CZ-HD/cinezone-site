const API_KEY = "TA_CLE_API";

export async function getPopularMovies() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=fr-FR&page=1`,
    { cache: "no-store" }
  );

  const data = await res.json();
  return data.results;
}