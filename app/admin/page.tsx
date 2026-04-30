"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const CREATOR_EMAIL = "blackph4tom@gmail.com";
const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/Boss.png";

type Profile = {
  id: string;
  email?: string;
  username?: string;
  avatar?: string;
  role?: string;
  role_color?: string;
  status?: string;
  status_text?: string;
  created_at?: string;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [id, setId] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [searchMember, setSearchMember] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
  if (!isAdmin) return;

  const channel = supabase.channel("site-presence");

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();

      const ids = Object.values(state)
        .flat()
        .map((item: any) => item.user_id);

      setOnlineUserIds([...new Set(ids)]);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [isAdmin]);

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
      setMessage("❌ Erreur chargement membres : " + error.message);
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

    const { data: movies, error } = await supabase.from("downloads").select("id");

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
    const { error } = await supabase.from("profiles").update(values).eq("id", userId);

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

  const filteredProfiles = profiles.filter((profile) => {
    const q = searchMember.toLowerCase();
    return (
      (profile.email || "").toLowerCase().includes(q) ||
      (profile.username || "").toLowerCase().includes(q) ||
      (profile.role || "").toLowerCase().includes(q) ||
      (profile.status || "").toLowerCase().includes(q)
    );
  });

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
      <section style={heroStyle}>
        <div>
          <span style={badgeStyle}>👑 Administration</span>
          <h1 style={titleStyle}>Admin CineZone HD</h1>
          <p style={subText}>Gestion des films, des membres et des accès.</p>
        </div>

        <div style={counterStyle}>
          <strong>{memberCount}</strong>
          <span>membres inscrits</span>
        </div>
      </section>

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
        <div style={memberHeader}>
          <div>
            <h2 style={{ margin: 0 }}>👥 Membres inscrits</h2>
            <p style={subText}>
              Tous les comptes créés sont affichés ici, même s’ils ne vont jamais dans le chat.
            </p>
          </div>

          <input
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            placeholder="Rechercher un membre..."
            style={searchInput}
          />
        </div>

        {filteredProfiles.length === 0 ? (
          <p style={{ color: "#aaa" }}>Aucun membre trouvé.</p>
        ) : (
          <div style={memberGrid}>
            {filteredProfiles.map((member) => {
              const isCreator = member.email === CREATOR_EMAIL;
              const isMemberAdmin = member.role === "admin";
              const isApproved = member.status === "approved";
              const isBlocked = member.status === "blocked";

              return (
                <article key={member.id} style={memberCardStyle}>
                  <div style={memberTop}>
                    <img
                      src={member.avatar || DEFAULT_AVATAR}
                      alt="avatar"
                      style={avatarStyle}
                    />

                    <div style={{ flex: 1 }}>
                      <div style={nameRow}>
                        <strong
                          style={{
                            color: isMemberAdmin
                              ? "gold"
                              : member.role_color || "#00c6ff",
                          }}
                        >
                          {member.username || "Utilisateur"}
                        </strong>

                        {isCreator && <span style={creatorBadge}>CRÉATEUR</span>}
                        {isMemberAdmin && !isCreator && (
                          <span style={adminBadge}>ADMIN</span>
                        )}
                      </div>

                      <p style={emailText}>{member.email || "Email non stocké"}</p>

                      <div style={statusRow}>
                        <span style={rolePill}>{member.role || "user"}</span>

                        <span
                          style={{
                            ...statusPill,
                            ...(isApproved
                              ? approvedPill
                              : isBlocked
                              ? blockedPill
                              : pendingPill),
                          }}
                        >
                          {member.status || "pending"}
                        </span>

                        <span style={statusTextPill}>
  Statut choisi : {member.status_text || "Aucun statut"}
</span>
                      </div>
                    </div>
                  </div>

                  <p style={dateText}>
                    Inscrit le :{" "}
                    {member.created_at
                      ? new Date(member.created_at).toLocaleDateString("fr-FR")
                      : "date inconnue"}
                  </p>

                  <div style={buttonRow}>
                    <button
                      style={btnGreen}
                      onClick={() => updateUser(member.id, { status: "approved" })}
                    >
                      ✅ Valider
                    </button>

                    <button
                      style={btnOrange}
                      onClick={() => updateUser(member.id, { status: "blocked" })}
                    >
                      🚫 Bannir
                    </button>

                    {!isCreator && (
                      <button
                        style={btnGold}
                        onClick={() =>
                          updateUser(member.id, {
                            role: isMemberAdmin ? "user" : "admin",
                          })
                        }
                      >
                        👑 {isMemberAdmin ? "Retirer admin" : "Admin"}
                      </button>
                    )}

                    {!isCreator && (
                      <button style={btnRed} onClick={() => deleteProfile(member.id)}>
                        🗑 Supprimer
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(0,120,255,0.2), #000 62%)",
  color: "#fff",
  padding: "34px",
  fontFamily: "Arial, sans-serif",
};

const heroStyle: React.CSSProperties = {
  maxWidth: "1100px",
  padding: "26px",
  borderRadius: "24px",
  marginBottom: "28px",
  background: "rgba(10,15,25,0.78)",
  border: "1px solid rgba(0,198,255,0.25)",
  boxShadow: "0 20px 70px rgba(0,0,0,0.55)",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  flexWrap: "wrap",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 13px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.35)",
  color: "#67e8f9",
  fontWeight: 900,
};

const titleStyle: React.CSSProperties = {
  fontSize: "38px",
  margin: "14px 0 8px",
};

const subText: React.CSSProperties = {
  color: "#9ca3af",
  margin: "8px 0 0",
};

const counterStyle: React.CSSProperties = {
  minWidth: "130px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  display: "grid",
  placeItems: "center",
  textAlign: "center",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "1100px",
  marginBottom: "28px",
  padding: "24px",
  borderRadius: "22px",
  background: "rgba(20,20,25,0.78)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
};

const memberHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const searchInput: React.CSSProperties = {
  minWidth: "260px",
  padding: "13px",
  borderRadius: "14px",
  border: "1px solid rgba(0,198,255,0.25)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
};

const memberGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
  gap: "16px",
};

const memberCardStyle: React.CSSProperties = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const memberTop: React.CSSProperties = {
  display: "flex",
  gap: "13px",
};

const avatarStyle: React.CSSProperties = {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.55)",
  boxShadow: "0 0 18px rgba(0,198,255,0.28)",
};

const nameRow: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  flexWrap: "wrap",
};

const emailText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  margin: "6px 0",
};

const statusRow: React.CSSProperties = {
  display: "flex",
  gap: "7px",
  flexWrap: "wrap",
};

const rolePill: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.28)",
  color: "#67e8f9",
  fontSize: "11px",
  fontWeight: 900,
};

const statusPill: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 900,
};

const approvedPill: React.CSSProperties = {
  background: "rgba(34,197,94,0.15)",
  border: "1px solid rgba(34,197,94,0.35)",
  color: "#86efac",
};

const blockedPill: React.CSSProperties = {
  background: "rgba(255,40,40,0.14)",
  border: "1px solid rgba(255,80,80,0.35)",
  color: "#ffabab",
};

const pendingPill: React.CSSProperties = {
  background: "rgba(255,215,0,0.12)",
  border: "1px solid rgba(255,215,0,0.3)",
  color: "#fde68a",
};

const statusTextPill: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontSize: "11px",
  fontWeight: 800,
};

const creatorBadge: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #ff4fd8, #7c3aed)",
  color: "#fff",
  fontSize: "10px",
  fontWeight: 900,
};

const adminBadge: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #ffe58a, #ffb300)",
  color: "#000",
  fontSize: "10px",
  fontWeight: 900,
};

const dateText: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "12px",
  marginTop: "12px",
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

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "14px",
};

const baseBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "10px 13px",
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
  color: "#111",
};

const btnRed = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ff1744, #b00020)",
};
