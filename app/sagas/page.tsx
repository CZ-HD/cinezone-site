"use client";

import { useEffect, useState } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);

  const itemsPerPage = 12;

  const totalPages = Math.ceil(sagas.length / itemsPerPage);

  const paginatedSagas = sagas.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  useEffect(() => {
    loadSagas();
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user?.email) return;

    if (
      user.email === "blackph4tom@gmail.com" ||
      user.email === "lafooteusedu54@hotmail.fr"
    ) {
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
  }

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
      <section style={heroStyle}>
        <span style={badgeStyle}>🎞️ Collections</span>

        <h1 style={titleStyle}>Sagas CineZone HD</h1>

        <p style={textStyle}>
          Découvre toutes les sagas disponibles sur CineZone HD.
        </p>
      </section>

      {loading ? (
        <p style={loadingStyle}>Chargement des sagas...</p>
      ) : sagas.length === 0 ? (
        <section style={emptyStyle}>
          <h2>Aucune saga pour le moment</h2>
          <p>Tu pourras bientôt ajouter tes collections ici.</p>
        </section>
      ) : (
        <>
          <section style={topBarStyle}>
            <span>
              Page {page} sur {totalPages}

              {isAdmin && (
                <>
                  {" "}
                  — {sagas.length} saga
                  {sagas.length > 1 ? "s" : ""}
                </>
              )}
            </span>

            <div style={paginationButtonsStyle}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  ...pageButtonStyle,
                  opacity: page === 1 ? 0.45 : 1,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                Précédent
              </button>

              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page === totalPages}
                style={{
                  ...pageButtonStyle,
                  opacity: page === totalPages ? 0.45 : 1,
                  cursor:
                    page === totalPages
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Suivant
              </button>
            </div>
          </section>

          <section style={gridStyle}>
            {paginatedSagas.map((saga) => (
              <Link
                key={saga.id}
                href={`/sagas/${saga.slug}`}
                style={cardStyle}
              >
                <div style={posterBox}>
                  {saga.poster ? (
                    <img
                      src={saga.poster}
                      alt={saga.title}
                      style={posterStyle}
                    />
                  ) : (
                    <span style={{ fontSize: "42px" }}>🎬</span>
                  )}
                </div>

                <div>
                  <h2 style={cardTitle}>{saga.title}</h2>

                  <p style={cardText}>
                    Tous les films {saga.title}
                  </p>
                </div>
              </Link>
            ))}
          </section>

          {totalPages > 1 && (
            <section style={bottomPaginationStyle}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  ...pageButtonStyle,
                  opacity: page === 1 ? 0.45 : 1,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                Précédent
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
                  opacity: page === totalPages ? 0.45 : 1,
                  cursor:
                    page === totalPages
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Suivant
              </button>
            </section>
          )}
        </>
      )}
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "70px 30px",
  background:
    "radial-gradient(circle at top, rgba(0,198,255,0.18), #000 58%)",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
};

const heroStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto 34px",
  padding: "34px",
  borderRadius: "28px",
  background: "rgba(10,15,25,0.82)",
  border: "1px solid rgba(0,198,255,0.28)",
  boxShadow: "0 20px 70px rgba(0,0,0,0.6)",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "9px 16px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.35)",
  color: "#67e8f9",
  fontWeight: 900,
};

const titleStyle: React.CSSProperties = {
  fontSize: "42px",
  margin: "18px 0 10px",
};

const textStyle: React.CSSProperties = {
  color: "#cbd5e1",
  lineHeight: 1.6,
};

const loadingStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#94a3b8",
};

const topBarStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto 22px",
  padding: "14px 0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
  color: "#94a3b8",
  fontWeight: 700,
};

const paginationButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
};

const gridStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "18px",
};

const cardStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#fff",
  padding: "10px",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
  transition: "0.2s",
};

const posterBox: React.CSSProperties = {
  aspectRatio: "2 / 3",
  width: "100%",
  borderRadius: "18px",
  overflow: "hidden",
  background: "#000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "14px",
};

const posterStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  background: "#000",
};

const cardTitle: React.CSSProperties = {
  fontSize: "17px",
  margin: "0 0 8px",
};

const cardText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: 1.5,
};

const bottomPaginationStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "34px auto 0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const pageButtonStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "14px",
  border: "1px solid rgba(0,198,255,0.35)",
  background: "rgba(0,198,255,0.14)",
  color: "#fff",
  fontWeight: 900,
};

const pageTextStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontWeight: 700,
};

const emptyStyle: React.CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "40px",
  textAlign: "center",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.05)",
  border: "1px dashed rgba(255,255,255,0.18)",
};
