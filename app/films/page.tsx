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
    () => Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i),
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
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`);

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
    const year = movie.release_year || (movie.release_date ? Number(String(movie.release_date).substring(0, 4)) : null);
    return Number.isFinite(Number(year)) ? Number(year) : null;
  };

  const filteredMovies = movies.filter((movie) => {
    const titleMatch = (movie.title || "").toLowerCase().includes(search.toLowerCase());
    const year = getMovieYear(movie);
    if (!titleMatch || !year) return false;
    return year >= minYear && year <= maxYear;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / itemsPerPage));

  const paginatedMovies = filteredMovies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            <small style={{ color: "#94a3b8" }}>{minYear} - {maxYear}</small>
          </div>

          <div style={filterRow}>
            <label style={labelStyle}>
              De
              <select value={minYear} onChange={(e) => { const value = Number(e.target.value); setMinYear(value); if (value > maxYear) setMaxYear(value); setCurrentPage(1); }} style={selectStyle}>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              À
              <select value={maxYear} onChange={(e) => { const value = Number(e.target.value); setMaxYear(value); if (value < minYear) setMinYear(value); setCurrentPage(1); }} style={selectStyle}>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>

            <button onClick={resetFilters} style={clearBtn}>Effacer</button>
          </div>
        </aside>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <section>
            <h2 style={sectionTitle}>
              🍿 Catalogue CineZone
              {isAdmin && ` — ${filteredMovies.length} film${filteredMovies.length > 1 ? "s" : ""}`}
            </h2>

            {filteredMovies.length === 0 ? (
              <p style={{ color: "#aaa" }}>Aucun film trouvé.</p>
            ) : (
              <>
                <Pagination {...{ currentPage, totalPages, itemsPerPage, totalItems: filteredMovies.length, isAdmin }} onPageChange={setCurrentPage} onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }} />

                <MovieGrid movies={paginatedMovies} local isAdmin={isAdmin} />

                <Pagination {...{ currentPage, totalPages, itemsPerPage, totalItems: filteredMovies.length, isAdmin }} onPageChange={setCurrentPage} onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }} />
              </>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function Pagination({ currentPage, totalPages, itemsPerPage, totalItems, isAdmin, onPageChange, onItemsPerPageChange }: any) {
  return (
    <div style={paginationStyle}>
      <div style={selectWrapperStyle}>
        <span>Éléments</span>
        <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))} style={selectStyle}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div style={pageInfoStyle}>
        Page {currentPage} sur {totalPages}
        {isAdmin && ` — ${totalItems} films`}
      </div>

      <div style={buttonsWrapperStyle}>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} style={buttonStyle}>Précédent</button>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} style={buttonStyle}>Suivant</button>
      </div>
    </div>
  );
}

function MovieGrid({ movies, local, isAdmin }: any) {
  return (
    <div style={gridStyle}>
      {movies.map((m: any) => (
        <Link key={m.id} href={local ? `/movie/${m.id}` : `/admin?tmdb=${m.id}`} style={{ textDecoration: "none", color: "#fff" }}>
          <img src={m.poster_path?.startsWith("http") ? m.poster_path : `https://image.tmdb.org/t/p/w500${m.poster_path}`} style={posterStyle} />
          <p>{m.title}</p>
          {isAdmin && <small>ID: {m.id}</small>}
        </Link>
      ))}
    </div>
  );
}

const pageStyle = { minHeight: "100vh", padding: "34px", color: "#fff", background: "#000" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "20px" };
const posterStyle = { width: "100%", borderRadius: "12px" };
const paginationStyle = { display: "flex", justifyContent: "space-between", marginTop: "20px" };
const selectWrapperStyle = { display: "flex", gap: "10px" };
const pageInfoStyle = { color: "#94a3b8" };
const buttonsWrapperStyle = { display: "flex", gap: "10px" };
const buttonStyle = { padding: "8px 12px", background: "#111", color: "#fff", border: "1px solid #333" };
const inputStyle = { padding: "12px", borderRadius: "10px", background: "#111", color: "#fff" };
const filterBox = { padding: "10px" };
const filterHeader = { display: "flex", justifyContent: "space-between" };
const filterRow = { display: "flex", gap: "10px" };
const labelStyle = { display: "flex", flexDirection: "column" };
const clearBtn = { padding: "6px 10px" };
const sectionTitle = { marginBottom: "10px" };
