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

  useEffect(() => {
    loadSagas();
  }, []);

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
        <p style={textStyle}>Chargement des sagas...</p>
      ) : sagas.length === 0 ? (
        <section style={emptyStyle}>
          <h2>Aucune saga pour le moment</h2>
          <p>Tu pourras bientôt ajouter tes collections ici.</p>
        </section>
      ) : (
        <section style={gridStyle}>
          {sagas.map((saga) => (
            <Link
              key={saga.id}
              href={`/sagas/${saga.slug}`}
              style={cardStyle}
            >
              <div style={posterBox}>
                {saga.poster ? (
                  <img src={saga.poster} alt={saga.title} style={posterStyle} />
                ) : (
                  <span style={{ fontSize: "42px" }}>🎬</span>
                )}
              </div>

              <div>
                <h2 style={cardTitle}>{saga.title}</h2>
                <p style={cardText}>
                  {saga.description || "Voir les films de cette saga"}
                </p>
              </div>
            </Link>
          ))}
        </section>
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
  padding: "14px",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
};

const posterBox: React.CSSProperties = {
  height: "310px",
  borderRadius: "18px",
  overflow: "hidden",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.24), rgba(80,40,255,0.24), rgba(0,0,0,0.5))",
  display: "grid",
  placeItems: "center",
  marginBottom: "14px",
};

const posterStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const cardTitle: React.CSSProperties = {
  fontSize: "20px",
  margin: "0 0 8px",
};

const cardText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: 1.5,
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
