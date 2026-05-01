"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const BASE_URL = "https://api.themoviedb.org/3";
const CREATOR_EMAIL = "blackph4tom@gmail.com";
const START_YEAR = 1900;
const END_YEAR = 2027;

export default function FilmsPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [minYear, setMinYear] = useState(START_YEAR);
  const [maxYear, setMaxYear] = useState(END_YEAR);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  const years = useMemo(
    () =>
      Array.from(
        { length: END_YEAR - START_YEAR + 1 },
        (_, i) => START_YEAR + i
      ),
    []
  );

  useEffect(() => {
    loadMovies();
    checkAdmin();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchTmdb(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) return;

    if (user.email === CREATOR_EMAIL) {
      setIsAdmin(true);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin" && profile?.status === "approved") {
      setIsAdmin(true);
    }
  };

  const loadMovies = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("downloads")
      .select("id, title, poster_path, vote_average, release_date, release_year")
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

  const getMovieYear = (movie: any) => {
    const year =
      movie.release_year ||
      (movie.release_date
        ? Number(String(movie.release_date).substring(0, 4))
        : null);

    return Number.isFinite(Number(year)) ? Number(year) : null;
  };

  const filteredMovies = movies.filter((movie) => {
    const titleMatch = (movie.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const year = getMovieYear(movie);

    if (!titleMatch) return false;
    if (!year) return false;

    return year >= minYear && year <= maxYear;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMovies.length / itemsPerPage)
  );

  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearch("");
    setMinYear(START_YEAR);
    setMaxYear(END_YEAR);
    setCurrentPage(1);
  };

  return (
    <main style={pageStyle}>
      <h1>🎬 Films disponibles</h1>

      <div style={topBarStyle}>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="🔍 Rechercher un film..."
          style={inputStyle}
        />

        <aside style={filterBox}>
          <div style={filterHeader}>
            <span>🎛️ Filtre année</span>
            <small style={{ color: "#94a3b8" }}>
              {minYear} - {maxYear}
            </small>
          </div>

          <div style={filterRow}>
            <label style={labelStyle}>
              De
              <select
                value={minYear}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setMinYear(value);

                  if (value > maxYear) setMaxYear(value);

                  setCurrentPage(1);
                }}
                style={selectStyle}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              À
              <select
                value={maxYear}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setMaxYear(value);

                  if (value < minYear) setMinYear(value);

                  setCurrentPage(1);
                }}
                style={selectStyle}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <button onClick={resetFilters} style={clearBtn}>
              Effacer
            </button>
          </div>
        </aside>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <section>
            <h2 style={sectionTitle}>
              🍿 Catalogue CineZone — {filteredMovies.length} film
              {filteredMovies.length > 1 ? "s" : ""}
            </h2>

            {filteredMovies.length === 0 ? (
              <p style={{ color: "#aaa" }}>Aucun film trouvé pour ce filtre.</p>
            ) : (
              <>
                <MovieGrid movies={paginatedMovies} local isAdmin={isAdmin} />

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
              </>
            )}
          </section>

          {search.trim().length >= 2 && (
            <section style={{ marginTop: "38px" }}>
              <h2 style={sectionTitle}>
                Résultats TMDB {tmdbLoading && "— recherche..."}
              </h2>

              {tmdbResults.length === 0 && !tmdbLoading ? (
                <p style={{ color: "#aaa" }}>Aucun résultat TMDB trouvé.</p>
              ) : (
                <MovieGrid movies={tmdbResults} local={false} isAdmin={isAdmin} />
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}

function MovieGrid({
  movies,
  local,
  isAdmin,
}: {
  movies: any[];
  local: boolean;
  isAdmin: boolean;
}) {
  const getYear = (movie: any) =>
    movie.release_year ||
    (movie.release_date ? String(movie.release_date).substring(0, 4) : "");

  return (
    <div style={gridStyle}>
      {movies.map((movie) => {
        const year = getYear(movie);

        return (
          <Link
            key={movie.id}
            href={local ? `/movie/${movie.id}` : `/admin?tmdb=${movie.id}`}
            style={{ color: "#fff", textDecoration: "none" }}
          >
            <div style={posterWrapStyle}>
              {year && <span style={yearBadge}>{year}</span>}

              <img
                src={
                  movie.poster_path
                    ? movie.poster_path.startsWith("http")
                      ? movie.poster_path
                      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=No+Image"
                }
                alt={movie.title || "Film"}
                style={posterStyle}
                loading="lazy"
              />
            </div>

            <h3 style={{ fontSize: "15px", marginTop: "12px" }}>
              {movie.title || `Film ${movie.id}`}
            </h3>

            {isAdmin && (
              <p style={{ opacity: 0.45, margin: "4px 0", fontSize: "12px" }}>
                🛠 ID : {movie.id}
              </p>
            )}

            {movie.vote_average && (
              <p style={{ opacity: 0.75 }}>⭐ {movie.vote_average} / 10</p>
            )}
          </Link>
        );
      })}
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

const topBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "18px",
  flexWrap: "wrap",
  margin: "20px 0 30px",
  justifyContent: "space-between",
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
  boxShadow: "0 0 18px rgba(0,140,255,0.18)",
};

const filterBox: React.CSSProperties = {
  marginLeft: "auto",
  minWidth: "300px",
  padding: "16px",
  borderRadius: "18px",
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.94), rgba(2,6,23,0.94))",
  border: "1px solid rgba(0,198,255,0.32)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  display: "grid",
  gap: "12px",
};

const filterHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  fontWeight: 900,
};

const filterRow: React.CSSProperties = {
  display: "flex",
  alignItems: "end",
  gap: "10px",
  flexWrap: "wrap",
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: "6px",
  color: "#cbd5e1",
  fontSize: "13px",
};

const clearBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 800,
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

const posterWrapStyle: React.CSSProperties = {
  position: "relative",
};

const yearBadge: React.CSSProperties = {
  position: "absolute",
  top: "8px",
  left: "8px",
  zIndex: 2,
  padding: "5px 9px",
  borderRadius: "8px",
  background: "linear-gradient(135deg, #ff1744, #b00020)",
  color: "#fff",
  fontSize: "12px",
  fontWeight: 900,
  boxShadow: "0 8px 20px rgba(0,0,0,0.45)",
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
