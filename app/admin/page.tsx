"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];
const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/Boss.png";

const MEMBERS_PER_PAGE = 24;

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

type Presence = {
  user_id: string;
  email?: string;
  username?: string;
  avatar?: string;
  role?: string;
  current_page?: string;
  last_seen?: string;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [id, setId] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");

  const [bulkInput, setBulkInput] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const [manualTitle, setManualTitle] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [manualPoster, setManualPoster] = useState("");
  const [manualBackdrop, setManualBackdrop] = useState("");
  const [manualVote, setManualVote] = useState("");
  const [manualImdb, setManualImdb] = useState("");
  const [manualLink, setManualLink] = useState("");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [searchMember, setSearchMember] = useState("");
  const [memberPage, setMemberPage] = useState(1);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    loadPresence();
    loadUsers();

    const timer = setInterval(() => {
      loadPresence();
      loadUsers();
    }, 15000);

    return () => clearInterval(timer);
  }, [isAdmin]);

  const addAffiliate = (url: string) => {
    const affiliate = "af=5257374";
    if (!url.includes("1fichier.com")) return url;
    if (url.includes("af=")) return url;
    return url.includes("?") ? `${url}&${affiliate}` : `${url}?${affiliate}`;
  };

  const cleanImdb = (value: string) => {
    const found = value.match(/tt\d+/);
    return found ? found[0] : value.trim();
  };

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (user.email && CREATOR_EMAILS.includes(user.email)) {
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

  const loadPresence = async () => {
    const { data } = await supabase.from("user_presence").select("*");
    setPresences(data || []);
  };

  const getPresence = (userId: string) =>
    presences.find((presence) => presence.user_id === userId);

  const isOnline = (userId: string) => {
    const presence = getPresence(userId);
    if (!presence?.last_seen) return false;
    return Date.now() - new Date(presence.last_seen).getTime() < 60000;
  };

  const seenAgo = (lastSeen?: string) => {
    if (!lastSeen) return "Jamais vu";

    const seconds = Math.floor(
      (Date.now() - new Date(lastSeen).getTime()) / 1000
    );

    if (seconds < 60) return "Vu à l’instant";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Vu il y a ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Vu il y a ${hours} h`;

    const days = Math.floor(hours / 24);
    return `Vu il y a ${days} j`;
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
        setMessage("❌ ID TMDB introuvable. Utilise l’ajout manuel.");
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
          release_year: movie.release_date
            ? Number(movie.release_date.substring(0, 4))
            : null,
          imdb_id: movie.imdb_id || null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage("❌ Erreur : " + result.error);
        return;
      }

      setMessage("✅ Film ajouté automatiquement avec TMDB !");
      setId("");
      setLink("");
    } catch {
      setMessage("❌ Erreur lors de l'ajout du film.");
    }
  };

  const saveBulkDownloads = async () => {
    if (!bulkInput.trim()) {
      setMessage("❌ Ajoute au moins une ligne.");
      return;
    }

    setBulkLoading(true);
    setMessage("📦 Ajout multiple en cours...");

    const lines = bulkInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let success = 0;
    let errors = 0;

    for (const line of lines) {
      let tmdbId = "";
      let downloadLink = "";

      if (line.includes("|")) {
        const parts = line.split("|");
        tmdbId = parts[0]?.trim();
        downloadLink = parts[1]?.trim();
      } else {
        const parts = line.trim().split(/\s+/);
        tmdbId = parts[0];
        downloadLink = parts.slice(1).join(" ");
      }

      if (!tmdbId || !downloadLink) {
        errors++;
        continue;
      }

      try {
        const movieRes = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}&language=fr-FR`
        );

        if (!movieRes.ok) {
          errors++;
          continue;
        }

        const movie = await movieRes.json();

        const res = await fetch("/api/downloads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: Number(tmdbId),
            link: addAffiliate(downloadLink),
            title: movie.title,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            release_year: movie.release_date
              ? Number(movie.release_date.substring(0, 4))
              : null,
            imdb_id: movie.imdb_id || null,
          }),
        });

        if (res.ok) {
          success++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }

    setBulkLoading(false);
    setBulkInput("");
    setMessage(
      `✅ Ajout terminé : ${success} film(s) ajouté(s), ${errors} erreur(s).`
    );
  };

  const saveManualDownload = async () => {
    if (!manualTitle || !manualYear || !manualPoster || !manualLink) {
      setMessage("❌ Remplis au minimum : titre, année, affiche et lien.");
      return;
    }

    setMessage("Ajout manuel du film en cours...");

    const res = await fetch("/api/downloads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        link: addAffiliate(manualLink),
        title: manualTitle,
        poster_path: manualPoster,
        backdrop_path: manualBackdrop || manualPoster,
        vote_average: manualVote ? Number(manualVote) : null,
        release_date: `${manualYear}-01-01`,
        release_year: Number(manualYear),
        imdb_id: manualImdb ? cleanImdb(manualImdb) : null,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setMessage("❌ Erreur : " + result.error);
      return;
    }

    setMessage("✅ Film ajouté manuellement !");
    setManualTitle("");
    setManualYear("");
    setManualPoster("");
    setManualBackdrop("");
    setManualVote("");
    setManualImdb("");
    setManualLink("");
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
            release_year: tmdb.release_date
              ? Number(tmdb.release_date.substring(0, 4))
              : null,
            imdb_id: tmdb.imdb_id || null,
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

  const filteredProfiles = profiles.filter((profile) => {
    const q = searchMember.toLowerCase();

    return (
      (profile.email || "").toLowerCase().includes(q) ||
      (profile.username || "").toLowerCase().includes(q) ||
      (profile.role || "").toLowerCase().includes(q) ||
      (profile.status || "").toLowerCase().includes(q)
    );
  });

  const totalMemberPages = Math.max(
    1,
    Math.ceil(filteredProfiles.length / MEMBERS_PER_PAGE)
  );

  const paginatedProfiles = filteredProfiles.slice(
    (memberPage - 1) * MEMBERS_PER_PAGE,
    memberPage * MEMBERS_PER_PAGE
  );

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
        <h2>🎬 Ajout automatique TMDB</h2>
        <p style={subText}>
          Utilise ton système actuel : ID TMDB + lien. L’affiliation reste automatique.
        </p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ID TMDB du film"
            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
          />

          <button
            type="button"
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              const found = text.match(/\/movie\/(\d+)/) || text.match(/^(\d+)/);

              if (found) {
                setId(found[1]);
              } else {
                alert("Aucun ID TMDB trouvé");
              }
            }}
            style={copyIdBtn}
          >
            📋
          </button>
        </div>

        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Lien de téléchargement"
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={saveDownload} style={btnBlue}>
            💾 Enregistrer avec TMDB
          </button>

          <button onClick={updateAllMovies} style={btnPurple}>
            🔄 Mettre à jour toutes les affiches
          </button>
        </div>

        {message && <p style={{ marginTop: "16px" }}>{message}</p>}
      </section>

      <section style={cardStyle}>
        <h2>📦 Ajout multiple TMDB</h2>
        <p style={subText}>
          Format : ID TMDB | lien de téléchargement. Un film par ligne.
        </p>

        <textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder={`12345 | https://lien-film-1.com
67890 | https://lien-film-2.com
11223 | https://lien-film-3.com`}
          style={textareaStyle}
        />

        <button
          onClick={saveBulkDownloads}
          style={{
            ...btnBlue,
            opacity: bulkLoading ? 0.6 : 1,
            cursor: bulkLoading ? "not-allowed" : "pointer",
          }}
          disabled={bulkLoading}
        >
          {bulkLoading ? "📦 Ajout en cours..." : "📦 Ajouter plusieurs films"}
        </button>
      </section>

      <section style={cardStyle}>
        <h2>✍️ Ajout manuel</h2>
        <p style={subText}>
          À utiliser seulement si TMDB ne trouve pas le film. IMDb est optionnel.
        </p>

        <input
          value={manualTitle}
          onChange={(e) => setManualTitle(e.target.value)}
          placeholder="Titre du film"
          style={inputStyle}
        />

        <div style={twoColumns}>
          <input
            value={manualYear}
            onChange={(e) => setManualYear(e.target.value)}
            placeholder="Année ex: 2026"
            style={inputStyle}
          />

          <input
            value={manualVote}
            onChange={(e) => setManualVote(e.target.value)}
            placeholder="Note ex: 7.5"
            style={inputStyle}
          />
        </div>

        <input
          value={manualPoster}
          onChange={(e) => setManualPoster(e.target.value)}
          placeholder="URL affiche / poster"
          style={inputStyle}
        />

        <input
          value={manualBackdrop}
          onChange={(e) => setManualBackdrop(e.target.value)}
          placeholder="URL image de fond optionnelle"
          style={inputStyle}
        />

        <input
          value={manualImdb}
          onChange={(e) => setManualImdb(e.target.value)}
          placeholder="ID IMDb optionnel ex: tt0111161"
          style={inputStyle}
        />

        <input
          value={manualLink}
          onChange={(e) => setManualLink(e.target.value)}
          placeholder="Lien de téléchargement"
          style={inputStyle}
        />

        <button onClick={saveManualDownload} style={btnGreen}>
          ✅ Enregistrer manuellement
        </button>
      </section>

      <section style={membersSectionStyle}>
        <div style={memberHeaderPremium}>
          <div>
            <h2 style={membersTitle}>👥 Membres inscrits</h2>
            <p style={subText}>Statut réel, page actuelle et dernière activité.</p>
          </div>

          <input
            value={searchMember}
            onChange={(e) => {
              setSearchMember(e.target.value);
              setMemberPage(1);
            }}
            placeholder="Rechercher un membre..."
            style={searchInputPremium}
          />
        </div>

        {filteredProfiles.length === 0 ? (
          <p style={{ color: "#aaa" }}>Aucun membre trouvé.</p>
        ) : (
          <>
            <div style={memberGridPremium}>
              {paginatedProfiles.map((member) => {
                const presence = getPresence(member.id);
                const connected = isOnline(member.id);
                const isCreator =
                  !!member.email && CREATOR_EMAILS.includes(member.email);
                const isMemberAdmin = member.role === "admin";
                const isApproved = member.status === "approved";
                const isBlocked = member.status === "blocked";

                return (
                  <article key={member.id} style={memberCardPremium}>
                    <div style={memberTopPremium}>
                      <img
                        src={member.avatar || DEFAULT_AVATAR}
                        alt="avatar"
                        style={{
                          ...avatarPremium,
                          border: connected
                            ? "2px solid rgba(34,197,94,0.95)"
                            : "2px solid rgba(255,80,80,0.58)",
                        }}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={nameRowPremium}>
                          <strong
                            style={{
                              color: isMemberAdmin
                                ? "gold"
                                : member.role_color || "#00c6ff",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "180px",
                            }}
                          >
                            {member.username || "Nouveau membre"}
                          </strong>

                          {isCreator && <span style={creatorBadge}>CRÉATEUR</span>}
                          {isMemberAdmin && !isCreator && (
                            <span style={adminBadge}>ADMIN</span>
                          )}
                        </div>

                        <p style={emailTextPremium}>
                          {member.email || presence?.email || "Email non stocké"}
                        </p>

                        <div style={statusRowPremium}>
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

                          <span
                            style={{
                              ...statusTextPill,
                              color: connected ? "#86efac" : "#ffabab",
                            }}
                          >
                            {connected ? "🟢 Connecté" : "🔴 Hors ligne"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={memberInfoBlock}>
                      <p style={presenceTextPremium}>
                        👀 Page : {presence?.current_page || "inconnue"}
                      </p>
                      <p style={presenceTextPremium}>
                        ⏱️ {connected ? "Actif maintenant" : seenAgo(presence?.last_seen)}
                      </p>
                      <p style={dateTextPremium}>
                        Inscrit le :{" "}
                        {member.created_at
                          ? new Date(member.created_at).toLocaleDateString("fr-FR")
                          : "date inconnue"}
                      </p>
                    </div>

                    <div style={buttonGridPremium}>
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
                          👑 {isMemberAdmin ? "Retirer" : "Admin"}
                        </button>
                      )}

                      {!isCreator && (
                        <button
                          style={btnRed}
                          onClick={() => deleteProfile(member.id)}
                        >
                          🗑 Supprimer
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div style={paginationBar}>
              <span style={paginationText}>
                Affichage{" "}
                {Math.min(
                  (memberPage - 1) * MEMBERS_PER_PAGE + 1,
                  filteredProfiles.length
                )}{" "}
                à {Math.min(memberPage * MEMBERS_PER_PAGE, filteredProfiles.length)} sur{" "}
                {filteredProfiles.length} membres
              </span>

              <div style={paginationButtons}>
                <button
                  style={{
                    ...pageBtn,
                    opacity: memberPage === 1 ? 0.45 : 1,
                    cursor: memberPage === 1 ? "not-allowed" : "pointer",
                  }}
                  disabled={memberPage === 1}
                  onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>

                <span style={activePageBtn}>{memberPage}</span>

                <button
                  style={{
                    ...pageBtn,
                    opacity: memberPage === totalMemberPages ? 0.45 : 1,
                    cursor:
                      memberPage === totalMemberPages ? "not-allowed" : "pointer",
                  }}
                  disabled={memberPage === totalMemberPages}
                  onClick={() =>
                    setMemberPage((p) => Math.min(totalMemberPages, p + 1))
                  }
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, rgba(0,120,255,0.2), #000 62%)",
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
  margin: "8px 0 14px",
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

const twoColumns: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "150px",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#111",
  color: "#fff",
  boxSizing: "border-box",
  resize: "vertical",
};

const membersSectionStyle: React.CSSProperties = {
  maxWidth: "1100px",
  marginBottom: "28px",
  padding: "24px",
  borderRadius: "24px",
  background:
    "linear-gradient(180deg, rgba(9,14,28,0.92), rgba(2,6,15,0.96))",
  border: "1px solid rgba(0,198,255,0.18)",
  boxShadow:
    "0 24px 80px rgba(0,0,0,0.72), 0 0 35px rgba(0,198,255,0.08)",
};

const memberHeaderPremium: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: "22px",
};

const membersTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
};

const searchInputPremium: React.CSSProperties = {
  minWidth: "300px",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(0,198,255,0.32)",
  background: "rgba(3,8,18,0.92)",
  color: "#fff",
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
};

const memberGridPremium: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(245px, 1fr))",
  gap: "12px",
};

const memberCardPremium: React.CSSProperties = {
  padding: "14px",
  borderRadius: "18px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.038))",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 30px rgba(0,0,0,0.28)",
};

const memberTopPremium: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
};

const avatarPremium: React.CSSProperties = {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  objectFit: "cover",
  boxShadow: "0 0 18px rgba(0,198,255,0.34)",
};

const nameRowPremium: React.CSSProperties = {
  display: "flex",
  gap: "7px",
  alignItems: "center",
  flexWrap: "wrap",
};

const emailTextPremium: React.CSSProperties = {
  color: "#a8b3c5",
  fontSize: "12px",
  margin: "5px 0 8px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const statusRowPremium: React.CSSProperties = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
};

const memberInfoBlock: React.CSSProperties = {
  marginTop: "12px",
  display: "grid",
  gap: "6px",
};

const presenceTextPremium: React.CSSProperties = {
  color: "#b7c4d8",
  fontSize: "12px",
  margin: 0,
};

const dateTextPremium: React.CSSProperties = {
  color: "#7f8ea3",
  fontSize: "12px",
  margin: "4px 0 0",
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

const buttonGridPremium: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "8px",
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

const btnBlue: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
};

const btnPurple: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #8e2de2, #4a00e0)",
};

const btnGreen: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #00c853, #009624)",
};

const btnOrange: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ff9800, #e65100)",
};

const btnGold: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ffd76a, #b8860b)",
  color: "#111",
};

const btnRed: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ff1744, #b00020)",
};

const copyIdBtn: React.CSSProperties = {
  width: "52px",
  height: "48px",
  borderRadius: "12px",
  border: "1px solid rgba(0,198,255,0.35)",
  background: "rgba(0,198,255,0.16)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "20px",
};

const paginationBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  flexWrap: "wrap",
  marginTop: "20px",
  color: "#9fb3c8",
};

const paginationText: React.CSSProperties = {
  fontSize: "13px",
};

const paginationButtons: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const pageBtn: React.CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 900,
};

const activePageBtn: React.CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  boxShadow: "0 0 18px rgba(0,198,255,0.35)",
};
