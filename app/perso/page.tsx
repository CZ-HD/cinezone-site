"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const filmsPerso = [
  {
    id: 2135,
    titre: "La Machine à explorer le temps",
    annee: "2002",
    jaquette: "https://image.tmdb.org/t/p/w500/9QB6wIc6XOtoi02uUCLSvY0onSL.jpg",
    fond: "https://image.tmdb.org/t/p/original/6p2lYhS6rXn2C9b0tG6HjV5Zc5K.jpg",
    page: "/movie/2135",
    download: "https://1fichier.com/?m6ysu2mk8o3vuoccsj4t&af=5257374",
  },
];

export default function PersoPage() {
  const [profile, setProfile] = useState<any>(null);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(prof);

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    setMessageCount(count || 0);
  }

  return (
    <main style={pageStyle}>
      {profile && (
        <section style={profileCard}>
          <img
            src={profile.avatar}
            alt="avatar"
            style={avatarStyle}
          />

          <div>
            <h1 style={{ margin: 0, fontSize: "30px" }}>
              {profile.username || "Utilisateur"}

              {profile.role === "admin" && (
                <span style={adminBadge}>ADMIN</span>
              )}
            </h1>

            <p style={{ margin: "8px 0", color: "#4cff9b" }}>
              {profile.status_text || "🟢 En ligne"}
            </p>

            <div style={statsRow}>
              <div style={statBox}>💬 {messageCount} messages</div>
              <div style={statBox}>🎬 {filmsPerso.length} film perso</div>
              <div style={statBox}>⭐ Favoris bientôt</div>
            </div>
          </div>
        </section>
      )}

      <h1 style={{ fontSize: "42px", marginBottom: "8px" }}>
        🎬 Mes films perso
      </h1>

      <p style={{ color: "#aaa", marginBottom: "30px" }}>
        Ma collection privée avec téléchargement direct.
      </p>

      <div style={gridStyle}>
        {filmsPerso.map((film) => (
          <div key={film.id} style={filmCard}>
            <img
              src={film.jaquette}
              alt={film.titre}
              style={posterStyle}
            />

            <div style={{ padding: "16px" }}>
              <h2 style={{ fontSize: "18px", margin: "0 0 6px" }}>
                {film.titre}
              </h2>

              <p style={{ color: "#3fc5ff", margin: "0 0 14px" }}>
                {film.annee}
              </p>

              <Link href={film.page} style={{ textDecoration: "none" }}>
                <button style={viewBtn}>▶ Voir</button>
              </Link>

              <a
                href={film.download}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button style={downloadBtn}>⬇ Télécharger</button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(63,197,255,0.18), #000 45%)",
  color: "#fff",
  padding: "30px",
  fontFamily: "Arial, sans-serif",
};

const profileCard: React.CSSProperties = {
  marginBottom: "34px",
  padding: "22px",
  borderRadius: "24px",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.14), rgba(0,0,0,0.55))",
  border: "1px solid rgba(0,198,255,0.35)",
  display: "flex",
  alignItems: "center",
  gap: "18px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
};

const avatarStyle: React.CSSProperties = {
  width: "82px",
  height: "82px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid #00c6ff",
  boxShadow: "0 0 22px rgba(0,198,255,0.65)",
};

const adminBadge: React.CSSProperties = {
  marginLeft: "12px",
  background: "linear-gradient(135deg, #ffe58a, #ffb300)",
  color: "#000",
  padding: "4px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 900,
};

const statsRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "12px",
};

const statBox: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#dbeafe",
  fontWeight: 800,
  fontSize: "13px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "24px",
};

const filmCard: React.CSSProperties = {
  background: "linear-gradient(180deg, #151515, #070707)",
  borderRadius: "18px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
};

const posterStyle: React.CSSProperties = {
  width: "100%",
  height: "330px",
  objectFit: "contain",
  background: "#111",
  display: "block",
};

const viewBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  marginBottom: "10px",
};

const downloadBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "#e50914",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};
