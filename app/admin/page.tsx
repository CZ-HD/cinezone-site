"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const CREATOR_EMAIL = "blackph4tom@gmail.com";

type Profile = {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [id, setId] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    checkAdmin();
  }, []);

  const addAffiliate = (url: string) => {
    const affiliate = "af=5257374";

    if (!url.includes("1fichier.com")) return url;
    if (url.includes("af=")) return url;

    return url.includes("?") ? `${url}&${affiliate}` : `${url}?${affiliate}`;
  };

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (user.email === CREATOR_EMAIL) {
      setIsAdmin(true);
      setLoading(false);
      loadUsers();
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "admin" || profile.status !== "approved") {
      window.location.href = "/";
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    loadUsers();
  };

  const loadUsers = async () => {
    const { data, error, count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("❌ Erreur chargement utilisateurs : " + error.message);
      return;
    }

    setProfiles(data || []);
    setMemberCount(count || 0);
  };

  const saveDownload = async () => {
    if (!id || !link) {
      setMessage("Remplis l'ID TMDB et le lien.");
      return;
    }

    setMessage("Ajout du film en cours...");

    try {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=fr-FR`
      );

      if (!movieRes.ok) {
        setMessage("❌ ID TMDB introuvable.");
        return;
      }

      const movie = await movieRes.json();

      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(id),
          link: addAffiliate(link),
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage("❌ Erreur : " + result.error);
        return;
      }

      setMessage("✅ Film ajouté avec affiche automatiquement !");
      setId("");
      setLink("");
    } catch {
      setMessage("❌ Erreur lors de l'ajout du film.");
    }
  };

  const updateAllMovies = async () => {
    setMessage("🔄 Mise à jour des affiches en cours...");

    const { data: movies, error } = await supabase
      .from("downloads")
      .select("id");

    if (error || !movies) {
      setMessage("❌ Aucun film trouvé.");
      return;
    }

    for (const movie of movies) {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=fr-FR`
        );

        if (!res.ok) continue;

        const tmdb = await res.json();

        await supabase
          .from("downloads")
          .update({
            title: tmdb.title,
            poster_path: tmdb.poster_path,
            backdrop_path: tmdb.backdrop_path,
            vote_average: tmdb.vote_average,
            release_date: tmdb.release_date,
          })
          .eq("id", movie.id);
      } catch {
        console.log("Erreur film", movie.id);
      }
    }

    setMessage("✅ Toutes les affiches ont été mises à jour !");
  };

  const updateUser = async (userId: string, values: Partial<Profile>) => {
    const { error } = await supabase
      .from("profiles")
      .update(values)
      .eq("id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    loadUsers();
  };

  const deleteProfile = async (userId: string) => {
    if (!confirm("Supprimer ce profil ?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    loadUsers();
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <p>Chargement admin...</p>
      </main>
    );
  }

  if (!isAdmin) return null;

  return (
    <main style={pageStyle}>
      <h1>👑 Admin CineZone HD</h1>

      <div style={counterStyle}>👥 {memberCount} membres inscrits</div>

      <section style={cardStyle}>
        <h2>🎬 Ajouter / modifier un lien</h2>

        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="ID TMDB du film"
          style={inputStyle}
        />

        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Lien de téléchargement"
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={saveDownload} style={btnBlue}>
            💾 Enregistrer le lien
          </button>

          <button onClick={updateAllMovies} style={btnPurple}>
            🔄 Mettre à jour toutes les affiches
          </button>
        </div>

        {message && <p style={{ marginTop: "16px" }}>{message}</p>}
      </section>

      <section style={cardStyle}>
        <h2>🧾 Gestion utilisateurs</h2>

        {profiles.length === 0 ? (
          <p>Aucun utilisateur.</p>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {profiles.map((user) => (
              <div key={user.id} style={userCardStyle}>
                <div>
                  <strong>{user.email}</strong>
                  <p style={{ color: "#aaa" }}>
                    Role : <b>{user.role}</b> | Status : <b>{user.status}</b>
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    style={btnGreen}
                    onClick={() => updateUser(user.id, { status: "approved" })}
                  >
                    ✅ Valider
                  </button>

                  <button
                    style={btnOrange}
                    onClick={() => updateUser(user.id, { status: "blocked" })}
                  >
                    🚫 Bannir
                  </button>

                  <button
                    style={btnGold}
                    onClick={() =>
                      updateUser(user.id, {
                        role: user.role === "admin" ? "user" : "admin",
                      })
                    }
                  >
                    👑 {user.role === "admin" ? "Retirer admin" : "Admin"}
                  </button>

                  <button style={btnRed} onClick={() => deleteProfile(user.id)}>
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, rgba(0,120,255,0.18), #000 60%)",
  color: "#fff",
  padding: "34px",
  fontFamily: "Arial, sans-serif",
};

const counterStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 16px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.35)",
  color: "#fff",
  fontWeight: 900,
  boxShadow: "0 0 20px rgba(0,198,255,0.18)",
  marginBottom: "22px",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "900px",
  marginBottom: "28px",
  padding: "24px",
  borderRadius: "20px",
  background: "rgba(20,20,25,0.75)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
};

const userCardStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#111",
  color: "#fff",
  boxSizing: "border-box",
};

const baseBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "12px 16px",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const btnBlue = {
  ...baseBtn,
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
};

const btnPurple = {
  ...baseBtn,
  background: "linear-gradient(135deg, #8e2de2, #4a00e0)",
};

const btnGreen = {
  ...baseBtn,
  background: "linear-gradient(135deg, #00c853, #009624)",
};

const btnOrange = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ff9800, #e65100)",
};

const btnGold = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ffd76a, #b8860b)",
};

const btnRed = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ff1744, #b00020)",
};
