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
        <div style={heroBackdrop}></div>

        <div style={heroOverlay}></div>

        <div style={heroGlow}></div>

        <div style={heroContent}>
          <span style={badgeStyle}>🎞️ Collections</span>

          <h1 style={titleStyle}>Sagas CineZone HD</h1>

          <p style={textStyle}>
            Explore toutes les sagas disponibles sur CineZone HD 🎬
          </p>

          <div style={statsStyle}>
            <div style={statsCard}>
              <span style={statsIcon}>🎬</span>

              <div>
                <strong>{filteredSagas.length}</strong>

                <p style={statsText}>sagas disponibles</p>
              </div>
            </div>

            <div style={statsCard}>
              <span style={statsIcon}>📄</span>

              <div>
                <strong>
                  Page {page} / {totalPages}
                </strong>

                <p style={statsText}>résultats</p>
              </div>
            </div>
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
          {/* TOP BAR */}
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
                    page === totalPages
                      ? "not-allowed"
                      : "pointer",
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
                    "0 30px 80px rgba(0,198,255,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0) scale(1)";

                  e.currentTarget.style.boxShadow =
                    "0 20px 60px rgba(0,0,0,0.45)";
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

          {/* PAGINATION */}
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
                    page === totalPages
                      ? "not-allowed"
                      : "pointer",
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
  overflow: "hidden",
};

/* HERO */

const heroStyle: React.CSSProperties = {
  position: "relative",
  maxWidth: "1450px",
  margin: "0 auto 34px",
  minHeight: "320px",
  borderRadius: "34px",
  overflow: "hidden",
  border: "1px solid rgba(0,198,255,0.14)",
  boxShadow:
    "0 0 120px rgba(0,198,255,0.10), 0 30px 80px rgba(0,0,0,0.65)",
  background: "#020617",
};

const heroBackdrop: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    'url("https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  opacity: 0.35,
  transform: "scale(1.05)",
};

const heroOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: `
    linear-gradient(
      to right,
      rgba(2,6,23,0.96) 10%,
      rgba(2,6,23,0.70) 45%,
      rgba(2,6,23,0.96) 100%
    )
  `,
};

const heroGlow: React.CSSProperties = {
  position: "absolute",
  width: "700px",
  height: "700px",
  borderRadius: "999px",
  background:
    "radial-gradient(circle, rgba(0,198,255,0.18), transparent 70%)",
  top: "-250px",
  right: "-150px",
  filter: "blur(40px)",
};

const heroContent: React.CSSProperties = {
  position: "relative",
  zIndex: 5,
  padding: "42px",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  width: "fit-content",
  padding: "10px 18px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.24)",
  color: "#67e8f9",
  fontWeight: 900,
  backdropFilter: "blur(10px)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "68px",
  fontWeight: 900,
  lineHeight: 1,
  margin: "22px 0 14px",
  letterSpacing: "-3px",
  color: "#fff",
  textShadow: "0 0 30px rgba(0,198,255,0.20)",
};

const textStyle: React.CSSProperties = {
  color: "#dbeafe",
  fontSize: "18px",
  lineHeight: 1.7,
  maxWidth: "700px",
};

const statsStyle: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  marginTop: "30px",
  flexWrap: "wrap",
};

const statsCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "14px 18px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.10)",
  backdropFilter: "blur(14px)",
};

const statsIcon: React.CSSProperties = {
  fontSize: "22px",
};

const statsText: React.CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: "13px",
};

/* SEARCH */

const searchSectionStyle: React.CSSProperties = {
  maxWidth: "1450px",
  margin: "0 auto 24px",
};

const searchBoxStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "18px 22px",
  borderRadius: "18px",
  border: "1px solid rgba(0,198,255,0.14)",
  background: "rgba(15,23,42,0.82)",
  color: "#fff",
  fontSize: "15px",
  fontWeight: 700,
  outline: "none",
  backdropFilter: "blur(12px)",
};

const clearSearchButtonStyle: React.CSSProperties = {
  padding: "0 18px",
  borderRadius: "18px",
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
  borderRadius: "26px",
  overflow: "hidden",
  background:
    "linear-gradient(to bottom, rgba(15,23,42,0.96), rgba(2,6,23,0.98))",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  transition: "all 0.28s ease",
  backdropFilter: "blur(12px)",
};

const posterBox: React.CSSProperties = {
  position: "relative",
  aspectRatio: "2 / 3",
  overflow: "hidden",
};

const posterStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const posterOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: `
    linear-gradient(
      to top,
      rgba(2,6,23,0.92),
      transparent 45%
    )
  `,
};

const fallbackPoster: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "50px",
  background: "#000",
};

const cardContent: React.CSSProperties = {
  padding: "18px",
};

const cardTitle: React.CSSProperties = {
  fontSize: "20px",
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
