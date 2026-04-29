"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const BASE_URL = "https://api.themoviedb.org/3";

export default function FilmsPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tmdbLoading, setTmdbLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchTmdb(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const loadMovies = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("downloads")
      .select("id, title, poster_path, vote_average, release_date")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setMovies(data || []);
    setLoading(false);
  };

  const searchTmdb = async (query: string) => {
    if (query.trim().length < 2) {
      setTmdbResults([]);
      return;
    }

    setTmdbLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(
          query
        )}`
      );

      if (!res.ok) {
        setTmdbResults([]);
        return;
      }

      const data = await res.json();
      setTmdbResults((data.results || []).slice(0, 12));
    } catch {
      setTmdbResults([]);
    } finally {
      setTmdbLoading(false);
    }
  };

  const filteredMovies = movies.filter((movie) =>
    (movie.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / itemsPerPage));

  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main style={pageStyle}>
      <h1>🎬 Films disponibles</h1>

      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        placeholder="🔍 Rechercher un film..."
        style={inputStyle}
      />

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          {filteredMovies.length > 0 && (
            <section>
              <h2 style={sectionTitle}>🍿 Catalogue CineZone</h2>

              <MovieGrid movies={paginatedMovies} local />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredMovies.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            </section>
          )}

          {search.trim().length >= 2 && (
            <section style={{ marginTop: "38px" }}>
              <h2 style={sectionTitle}>
                Résultats TMDB {tmdbLoading && "— recherche..."}
              </h2>

              {tmdbResults.length === 0 && !tmdbLoading ? (
                <p style={{ color: "#aaa" }}>Aucun résultat TMDB trouvé.</p>
              ) : (
                <MovieGrid movies={tmdbResults} local={false} />
              )}
            </section>
          )}

          {filteredMovies.length === 0 &&
            tmdbResults.length === 0 &&
            search.trim().length < 2 && (
              <p style={{ color: "#aaa" }}>Aucun film trouvé.</p>
            )}
        </>
      )}
    </main>
  );
}

function MovieGrid({ movies, local }: { movies: any[]; local: boolean }) {
  return (
    <div style={gridStyle}>
      {movies.map((movie) => (
        <Link
          key={movie.id}
          href={local ? `/movie/${movie.id}` : `/admin?tmdb=${movie.id}`}
          style={{ color: "#fff", textDecoration: "none" }}
        >
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/300x450?text=No+Image"
            }
            alt={movie.title || "Film"}
            style={posterStyle}
            loading="lazy"
          />

          <h3 style={{ fontSize: "15px", marginTop: "12px" }}>
            {movie.title || `Film ${movie.id}`}
          </h3>

          <p style={{ opacity: 0.75, margin: "4px 0" }}>
            ID TMDB : {movie.id}
          </p>

          {movie.vote_average && (
            <p style={{ opacity: 0.75 }}>⭐ {movie.vote_average} / 10</p>
          )}
        </Link>
      ))}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}) {
  return (
    <div style={paginationStyle}>
      <div style={selectWrapperStyle}>
        <span style={{ color: "#cbd5e1" }}>Éléments par page</span>

        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={selectStyle}
        >
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div style={pageInfoStyle}>
        Page {currentPage} sur {totalPages} — {totalItems} films
      </div>

      <div style={buttonsWrapperStyle}>
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          style={{
            ...buttonStyle,
            opacity: currentPage === 1 ? 0.45 : 1,
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          Précédent
        </button>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{
            ...buttonStyle,
            opacity: currentPage === totalPages ? 0.45 : 1,
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "34px",
  color: "#fff",
  background: "radial-gradient(circle at top, rgba(0,120,255,0.16), #000 60%)",
  fontFamily: "Arial, sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "520px",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(0,198,255,0.28)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
  margin: "20px 0 30px",
  boxShadow: "0 0 18px rgba(0,140,255,0.18)",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "20px",
  marginBottom: "18px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "24px",
};

const posterStyle: React.CSSProperties = {
  width: "100%",
  height: "240px",
  objectFit: "cover",
  borderRadius: "16px",
  boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
};

const paginationStyle: React.CSSProperties = {
  marginTop: "36px",
  paddingTop: "22px",
  borderTop: "1px solid rgba(0,198,255,0.22)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "18px",
  flexWrap: "wrap",
};

const selectWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontSize: "14px",
};

const selectStyle: React.CSSProperties = {
  background: "#0b0f18",
  color: "#fff",
  border: "1px solid rgba(0,198,255,0.35)",
  borderRadius: "10px",
  padding: "10px 14px",
  outline: "none",
  cursor: "pointer",
};

const pageInfoStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "14px",
};

const buttonsWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(0,198,255,0.35)",
  background: "rgba(0,198,255,0.1)",
  color: "#67e8f9",
  fontWeight: 700,
};
