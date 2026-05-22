"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Saga = {
  id: string;
  title: string;
  slug: string;
  poster?: string | null;
  backdrop?: string | null;
  description?: string | null;
  created_at?: string;
};

export default function SagasPage() {
  const [sagas, setSagas] = useState<Saga[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchSaga, setSearchSaga] = useState("");

  const itemsPerPage = 12;

  const filteredSagas = useMemo(() => {
    const q = searchSaga.toLowerCase().trim();

    if (!q) return sagas;

    return sagas.filter(
      (saga) =>
        saga.title.toLowerCase().includes(q) ||
        saga.slug.toLowerCase().includes(q) ||
        (saga.description || "").toLowerCase().includes(q)
    );
  }, [sagas, searchSaga]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSagas.length / itemsPerPage)
  );

  const paginatedSagas = filteredSagas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  useEffect(() => {
    loadSagas();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchSaga]);

  async function loadSagas() {
    const { data, error } = await supabase
      .from("sagas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }

    setSagas(data || []);
    setLoading(false);
  }

  return (
    <main style={pageStyle}>
      {/* HERO */}
      <section style={heroStyle}>
        <div style={heroOverlay}></div>

        <div style={heroContent}>
          <span style={badgeStyle}>🎞️ Collections</span>

          <h1 style={titleStyle}>Sagas CineZone HD</h1>

          <p style={textStyle}>
            Explore toutes les sagas disponibles sur CineZone HD 🎬
          </p>

          <div style={statsStyle}>
            <span style={statsBadge}>
              🎥 {filteredSagas.length} saga
              {filteredSagas.length > 1 ? "s" : ""}
            </span>

            <span style={statsBadge}>
              📄 Page {page} / {totalPages}
            </span>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section style={searchSectionStyle}>
        <div style={searchBoxStyle}>
          <input
            value={searchSaga}
            onChange={(e) => setSearchSaga(e.target.value)}
            placeholder="🔍 Rechercher une saga..."
            style={searchInputStyle}
          />

          {searchSaga && (
            <button
              type="button"
              onClick={() => setSearchSaga("")}
              style={clearSearchButtonStyle}
            >
              ✖
            </button>
          )}
        </div>
      </section>

      {/* LOADING */}
      {loading ? (
        <p style={loadingStyle}>Chargement des sagas...</p>
      ) : filteredSagas.length === 0 ? (
        <section style={emptyStyle}>
          <h2>Aucune saga trouvée</h2>

          <p>Essaie un autre mot-clé.</p>
        </section>
      ) : (
        <>
          {/* PAGINATION TOP */}
          <section style={topBarStyle}>
            <span style={topBarText}>
              🎬 {filteredSagas.length} saga
              {filteredSagas.length > 1 ? "s" : ""} disponible
              {filteredSagas.length > 1 ? "s" : ""}
            </span>

            <div style={paginationButtonsStyle}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  ...pageButtonStyle,
                  opacity: page === 1 ? 0.4 : 1,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                ← Précédent
              </button>

              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page === totalPages}
                style={{
                  ...pageButtonStyle,
                  opacity: page === totalPages ? 0.4 : 1,
                  cursor:
                    page === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Suivant →
              </button>
            </div>
          </section>

          {/* GRID */}
          <section style={gridStyle}>
            {paginatedSagas.map((saga) => (
              <Link
                key={saga.id}
                href={`/sagas/${saga.slug}`}
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-8px) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 25px 60px rgba(0,198,255,0.22)";
                  e.currentTarget.style.border =
                    "1px solid rgba(0,198,255,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 18px 50px rgba(0,0,0,0.45)";
                  e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.08)";
                }}
              >
                <div style={posterBox}>
                  {saga.poster ? (
                    <img
                      src={saga.poster}
                      alt={saga.title}
                      style={posterStyle}
                    />
                  ) : (
                    <div style={fallbackPoster}>
                      🎬
                    </div>
                  )}

                  <div style={posterOverlay}></div>
                </div>

                <div style={cardContent}>
                  <h2 style={cardTitle}>{saga.title}</h2>

                  <p style={cardText}>
                    Tous les films de la saga {saga.title}
                  </p>
                </div>
              </Link>
            ))}
          </section>

          {/* PAGINATION BOTTOM */}
          {totalPages > 1 && (
            <section style={bottomPaginationStyle}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  ...pageButtonStyle,
                  opacity: page === 1 ? 0.4 : 1,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                ← Précédent
              </button>

              <span style={pageTextStyle}>
                Page {page} sur {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page === totalPages}
                style={{
                  ...pageButtonStyle,
                  opacity: page === totalPages ? 0.4 : 1,
                  cursor:
                    page === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Suivant →
              </button>
            </section>
          )}
        </>
      )}
    </main>
  );
}

/* PAGE */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "60px 28px",
  background: `
    radial-gradient(circle at top, rgba(0,198,255,0.16), transparent 30%),
    radial-gradient(circle at bottom right, rgba(0,140,255,0.10), transparent 25%),
    #020617
  `,
  color: "#fff",
  position: "relative",
  overflow: "hidden",
};

/* HERO */

const heroStyle: React.CSSProperties = {
  position: "relative",
  maxWidth: "1450px",
  margin: "0 auto 30px",
  padding: "34px",
  borderRadius: "32px",
  overflow: "hidden",
  background: "rgba(8,12,20,0.82)",
  border: "1px solid rgba(0,198,255,0.16)",
  boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
  backdropFilter: "blur(12px)",
};

const heroOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to right, rgba(0,198,255,0.08), transparent)",
};

const heroContent: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 18px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.25)",
  color: "#67e8f9",
  fontWeight: 900,
  fontSize: "14px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "56px",
  fontWeight: 900,
  letterSpacing: "-2px",
  margin: "20px 0 10px",
  textShadow: "0 0 30px rgba(0,198,255,0.18)",
};

const textStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: "17px",
  lineHeight: 1.7,
  maxWidth: "700px",
};

const statsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginTop: "24px",
  flexWrap: "wrap",
};

const statsBadge: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontWeight: 700,
};

/* SEARCH */

const searchSectionStyle: React.CSSProperties = {
  maxWidth: "1450px",
  margin: "0 auto 24px",
};

const searchBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "18px 22px",
  borderRadius: "18px",
  border: "1px solid rgba(0,198,255,0.18)",
  background: "rgba(8,12,20,0.85)",
  color: "#fff",
  fontSize: "15px",
  fontWeight: 700,
  outline: "none",
  backdropFilter: "blur(10px)",
};

const clearSearchButtonStyle: React.CSSProperties = {
  padding: "16px 18px",
  borderRadius: "16px",
  border: "1px solid rgba(255,80,80,0.22)",
  background: "rgba(255,50,50,0.10)",
  color: "#ffb4b4",
  fontWeight: 900,
  cursor: "pointer",
};

/* TOP BAR */

const topBarStyle: React.CSSProperties = {
  maxWidth: "1450px",
  margin: "0 auto 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const topBarText: React.CSSProperties = {
  color: "#94a3b8",
  fontWeight: 700,
};

/* GRID */

const gridStyle: React.CSSProperties = {
  maxWidth: "1450px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: "24px",
};

const cardStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#fff",
  borderRadius: "24px",
  overflow: "hidden",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
  transition: "all 0.25s ease",
  backdropFilter: "blur(10px)",
};

const posterBox: React.CSSProperties = {
  position: "relative",
  aspectRatio: "2 / 3",
  overflow: "hidden",
  background: "#000",
};

const posterStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.35s ease",
};

const posterOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top, rgba(0,0,0,0.7), transparent 40%)",
};

const fallbackPoster: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "50px",
};

const cardContent: React.CSSProperties = {
  padding: "18px",
};

const cardTitle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 800,
  marginBottom: "10px",
};

const cardText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: 1.6,
};

/* PAGINATION */

const paginationButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
};

const pageButtonStyle: React.CSSProperties = {
  padding: "13px 18px",
  borderRadius: "14px",
  border: "1px solid rgba(0,198,255,0.18)",
  background: "rgba(0,198,255,0.10)",
  color: "#fff",
  fontWeight: 800,
  transition: "0.2s",
};

const bottomPaginationStyle: React.CSSProperties = {
  maxWidth: "1450px",
  margin: "40px auto 0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const pageTextStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontWeight: 700,
};

/* EMPTY */

const emptyStyle: React.CSSProperties = {
  maxWidth: "900px",
  margin: "40px auto",
  padding: "50px",
  textAlign: "center",
  borderRadius: "28px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

/* LOADING */

const loadingStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#94a3b8",
  marginTop: "50px",
};
