"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

type RequestFilter = "all" | "pending" | "replied";

export default function DemandeFilmPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<RequestFilter>("all");

  const [tmdbLink, setTmdbLink] = useState("");
  const [annee, setAnnee] = useState("");
  const [codec, setCodec] = useState("H264");
  const [langue, setLangue] = useState("VF / VOSTFR");
  const [commentaire, setCommentaire] = useState("");
  const [message, setMessage] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editTmdbLink, setEditTmdbLink] = useState("");
  const [editAnnee, setEditAnnee] = useState("");
  const [editCodec, setEditCodec] = useState("H264");
  const [editCommentaire, setEditCommentaire] = useState("");

  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [movieData, setMovieData] = useState<Record<string, any>>({});

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/login";
      return;
    }

    setUser(data.user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", data.user.id)
      .single();

    const isCreator =
      data.user.email && CREATOR_EMAILS.includes(data.user.email);

    if (
      isCreator ||
      (profile?.role === "admin" && profile?.status === "approved")
    ) {
      setIsAdmin(true);
    }

    loadDemandes();
  }

  async function loadDemandes() {
    const { data } = await supabase
      .from("demandes_films")
      .select("*")
      .order("created_at", { ascending: false });

    const demandesData = data || [];
    setDemandes(demandesData);

    for (const demande of demandesData) {
      if (!demande?.id || !demande?.tmdb_link) continue;

      const info = await fetchMovieData(demande.tmdb_link);

      if (info) {
        setMovieData((prev) => ({
          ...prev,
          [demande.id]: info,
        }));
      }
    }
  }

  async function envoyerDemande() {
    if (!tmdbLink.trim() || !annee.trim() || !codec || !commentaire.trim()) {
      setMessage("❌ Tous les champs sont obligatoires.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("demandes_films").insert({
    user_id: user.id,
    email: user.email,
  tmdb_link: tmdbLink.trim(),
  annee: annee.trim(),
  codec,
  langue,
  commentaire: commentaire.trim(),
});

    setLoading(false);

    if (error) {
      setMessage("❌ Erreur : " + error.message);
      return;
    }

    setMessage("✅ Demande envoyée avec succès !");
    setTmdbLink("");
    setAnnee("");
    setCodec("H264");
    setLangue("VF / VOSTFR");
    setCommentaire("");
    loadDemandes();
  }

  function startEdit(demande: any) {
    setEditId(demande.id);
    setEditTmdbLink(demande.tmdb_link);
    setEditAnnee(demande.annee);
    setEditCodec(demande.codec);
    setEditCommentaire(demande.commentaire);
  }

  async function sauvegarderModification() {
    if (!editId) return;

    const { error } = await supabase
      .from("demandes_films")
      .update({
        tmdb_link: editTmdbLink,
        annee: editAnnee,
        codec: editCodec,
        commentaire: editCommentaire,
      })
      .eq("id", editId);

    if (error) {
      alert("Erreur modification : " + error.message);
      return;
    }

    setEditId(null);
    loadDemandes();
  }

  async function envoyerReponse(id: string) {
    if (!isAdmin) return;

    if (!replyText.trim()) {
      alert("Écris une réponse avant d’envoyer.");
      return;
    }

    const { error } = await supabase
      .from("demandes_films")
      .update({
        admin_reply: replyText.trim(),
        admin_reply_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert("Erreur réponse : " + error.message);
      return;
    }

    setReplyId(null);
    setReplyText("");
    loadDemandes();
  }

  async function supprimerDemande(id: string) {
    if (!isAdmin) return;

    if (!confirm("Supprimer cette demande ?")) return;

    await supabase.from("demandes_films").delete().eq("id", id);
    loadDemandes();
  }

  const waitingCount = demandes.filter((d) => !d.admin_reply).length;
  const repliedCount = demandes.filter((d) => !!d.admin_reply).length;

  const filteredDemandes = demandes.filter((d) => {
    if (filter === "pending") return !d.admin_reply;
    if (filter === "replied") return !!d.admin_reply;
    return true;
  });

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <section style={heroStyle}>
          <div style={heroOverlay} />
          <div style={heroContent}>
            <span style={badgeStyle}>🎬 CineZone Request</span>
            <h1 style={heroTitle}>Demande de film</h1>
            <p style={heroText}>Propose un film à ajouter sur CineZone HD.</p>
          </div>

          <div style={statsBox}>
            <strong>{demandes.length}</strong>
            <span>demande{demandes.length > 1 ? "s" : ""}</span>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>🚀 Nouvelle demande</h2>

          <div style={tmdbRow}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Lien ou ID TMDB</label>
              <div style={inputWithIcon}>
                <span style={inputIcon}>🔗</span>
                <input
                  value={tmdbLink}
                  onChange={(e) => setTmdbLink(e.target.value)}
                  placeholder="Ex : https://www.themoviedb.org/movie/12345 ou 12345"
                  style={inputInside}
                />
              </div>
            </div>

            <button
  type="button"
  style={pasteButton}
  onClick={async () => {
    try {
      const text = await navigator.clipboard.readText();

      setTmdbLink(text);

      const movie = await fetchMovieData(text);

      if (movie?.year) {
        setAnnee(movie.year.toString());
      }
    } catch {
      alert("Impossible de lire le presse-papiers.");
    }
  }}
>
  📋 Cliquer ici - Coller le lien
</button>
          </div>

          <div style={formGrid}>
            <div>
              <label style={labelStyle}>Année</label>
              <input
                value={annee}
                onChange={(e) => setAnnee(e.target.value)}
                placeholder="Ex: 2024"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Codec souhaité</label>
              <select
                value={codec}
                onChange={(e) => setCodec(e.target.value)}
                style={inputStyle}
              >
                <option>H264</option>
                <option>H265</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Langue</label>
              <select
  value={langue}
  onChange={(e) => setLangue(e.target.value)}
  style={inputStyle}
>
  <option>VF / VOSTFR</option>
  <option>VF</option>
  <option>VOSTFR</option>
</select>
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            <label style={labelStyle}>Commentaire</label>
            <div style={textareaWithIcon}>
              <span style={textareaIcon}>✎</span>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Qualité souhaitée, version, langue, remarque..."
                rows={5}
                style={textareaInside}
              />
            </div>
          </div>

          <button onClick={envoyerDemande} disabled={loading} style={buttonStyle}>
            {loading ? "Envoi en cours..." : "🚀 Envoyer la demande"}
          </button>

          <p style={helpText}>
            ⓘ Plus votre demande est précise, plus elle a de chances d’être acceptée !
          </p>
          {message && <p style={messageStyle}>{message}</p>}
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>📋 Demandes envoyées</h2>

          <div style={filterRow}>
            <button
              onClick={() => setFilter("all")}
              style={filter === "all" ? filterBtnActive : filterBtn}
            >
              Toutes <strong>{demandes.length}</strong>
            </button>
            <button
              onClick={() => setFilter("pending")}
              style={filter === "pending" ? filterBtnActive : filterBtn}
            >
              🏆 En attente <strong>{waitingCount}</strong>
            </button>
            <button
              onClick={() => setFilter("replied")}
              style={filter === "replied" ? filterBtnActive : filterBtn}
            >
              ✅ Répondues <strong>{repliedCount}</strong>
            </button>
          </div>

          {filteredDemandes.length === 0 ? (
            <div style={emptyStyle}>
              <p>Aucune demande pour le moment.</p>
            </div>
          ) : (
            <div style={listStyle}>
              {filteredDemandes.map((d) => {
                const canEdit = d.user_id === user?.id;
                const movie = movieData[d.id];

                return (
                  <article key={d.id} style={movieRequestCard}>
                    <div style={fakePoster}>
                      {movie?.poster ? (
                        <img
                          src={movie.poster}
                          alt={movie.title || "Affiche du film"}
                          style={posterImage}
                        />
                      ) : (
                        <span>🎬</span>
                      )}
                    </div>

                    <div style={requestContent}>
                      {editId === d.id ? (
                        <>
                          <input
                            value={editTmdbLink}
                            onChange={(e) => setEditTmdbLink(e.target.value)}
                            style={inputStyle}
                          />

                          <input
                            value={editAnnee}
                            onChange={(e) => setEditAnnee(e.target.value)}
                            style={inputStyle}
                          />

                          <select
                            value={editCodec}
                            onChange={(e) => setEditCodec(e.target.value)}
                            style={inputStyle}
                          >
                            <option>H264</option>
                            <option>H265</option>
                          </select>

                          <textarea
                            value={editCommentaire}
                            onChange={(e) => setEditCommentaire(e.target.value)}
                            rows={4}
                            style={textareaStyle}
                          />

                          <div style={buttonRow}>
                            <button onClick={sauvegarderModification} style={btnBlue}>
                              💾 Sauvegarder
                            </button>
                            <button onClick={() => setEditId(null)} style={btnGray}>
                              Annuler
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={requestTop}>
                            <div>
                              <h3 style={demandeTitle}>
                                {movie?.title || cleanTitle(d.tmdb_link)}
                              </h3>
                              <p style={tmdbText}>{d.tmdb_link}</p>
                            </div>

                            <span style={d.admin_reply ? repliedBadge : statusBadge}>
                              {d.admin_reply ? "✅ Répondu" : "🕒 En attente"}
                            </span>
                          </div>

                          <div style={infoGrid}>
                            <div style={infoBox}>
                              📅<span>Demandé le</span>
                              <strong>{formatDate(d.created_at)}</strong>
                            </div>
                            <div style={infoBox}>
                              🎞️<span>Codec</span>
                              <strong>{d.codec}</strong>
                            </div>
                            <div style={infoBox}>
                              🌐<span>Langue</span>
                              <strong>{d.langue || "VF/VOSTFR"}</strong>
                            </div>
                            <div style={infoBox}>
                              💬<span>Commentaire</span>
                              <strong>{d.commentaire}</strong>
                            </div>
                          </div>

                          <p style={authorText}>
                            Demandé par : <strong>{d.email}</strong>
                          </p>

                          {d.admin_reply && (
                            <div style={replyBox}>
                              <strong style={{ color: "#67e8f9" }}>
                                💬 Réponse admin
                              </strong>
                              <p
                                style={{
                                  margin: "8px 0 0",
                                  color: "#e5e7eb",
                                  lineHeight: 1.6,
                                }}
                              >
                                {d.admin_reply}
                              </p>
                            </div>
                          )}

                          {isAdmin && replyId === d.id && (
                            <div style={replyEditorBox}>
                              <div style={{ position: "relative" }}>
  {showMentions && mentionResults.length > 0 && (
    <div style={mentionBox}>
      {mentionResults.map((u) => (
        <button
          key={u.id}
          type="button"
          style={mentionItem}
          onClick={() => {
            const newText = replyText.replace(
              /@([^\s]*)$/,
              `@${
                u.username ||
                u.email?.split("@")[0] ||
                "Utilisateur"
              } `
            );

            setReplyText(newText);
            setShowMentions(false);
          }}
        >
          <img
  src={
    u.avatar &&
    u.avatar !== "null" &&
    u.avatar !== ""
      ? u.avatar
      : "/default-avatar.png"
  }
  alt="avatar"
  style={mentionAvatar}
/>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <span style={mentionUsername}>
              @{u.username || u.email?.split("@")[0]}
            </span>

            <span style={mentionEmail}>
              {u.email}
            </span>
          </div>
        </button>
      ))}
    </div>
  )}

  <textarea
    value={replyText}
    onChange={async (e) => {
      const value = e.target.value;

      setReplyText(value);

      const match = value.match(/@([^\s]*)$/);

      if (match) {
        const query = match[1];

        const { data } = await supabase
          .from("profiles")
          .select("id, username, avatar, email")
          .or(
            `username.ilike.%${query}%,email.ilike.%${query}%`
          )
          .limit(10);

        setMentionResults(data || []);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    }}
    placeholder="Écrire une réponse au membre..."
    rows={3}
    style={textareaStyle}
  />
</div>

                              <div style={buttonRow}>
                                <button
                                  onClick={() => envoyerReponse(d.id)}
                                  style={btnBlue}
                                >
                                  📩 Envoyer la réponse
                                </button>
                                <button
                                  onClick={() => setReplyId(null)}
                                  style={btnGray}
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}

                          <div style={buttonRow}>
                            {canEdit && (
                              <button onClick={() => startEdit(d)} style={btnBlue}>
                                ✏️ Modifier
                              </button>
                            )}

                            {isAdmin && (
  <>
    <button
      onClick={() => {
        setReplyId(d.id);
        setReplyText(d.admin_reply || "");
      }}
      style={btnBlue}
    >
      💬 Répondre
    </button>

    <button
      onClick={() => supprimerDemande(d.id)}
      style={btnRed}
    >
      🗑 Supprimer
    </button>
  </>
)}
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

async function fetchMovieData(tmdbLink: string) {
  try {
    const response = await fetch(
      `/api/tmdb/movie?id=${encodeURIComponent(tmdbLink)}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      ...data,
      year:
        data?.release_date?.split("-")[0] ||
        data?.year ||
        null,
    };
  } catch {
    return null;
  }
}
function formatDate(value?: string) {
  if (!value) return "date inconnue";
  return new Date(value).toLocaleDateString("fr-FR");
}

function cleanTitle(value?: string) {
  if (!value) return "Film demandé";
  const match = value.match(/\/movie\/(\d+)-?([^?/]*)/);
  if (match?.[2]) {
    return match[2]
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return "Film demandé";
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "60px 30px",
  background: `
    radial-gradient(circle at 15% 12%, rgba(0,198,255,0.18), transparent 34%),
    radial-gradient(circle at 85% 18%, rgba(105,40,255,0.18), transparent 34%),
    linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.9)),
    url("https://images.unsplash.com/photo-1524985069026-dd778a71c7b4")
  `,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "980px",
  margin: "0 auto",
};

const heroStyle: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  padding: "34px",
  borderRadius: "28px",
  marginBottom: "28px",
  minHeight: "140px",
  background: `
    linear-gradient(90deg, rgba(0,0,0,0.86), rgba(0,0,0,0.42)),
    url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba")
  `,
  backgroundSize: "cover",
  backgroundPosition: "center",
  border: "1px solid rgba(0,198,255,0.35)",
  boxShadow: "0 0 60px rgba(0,198,255,0.15)",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  alignItems: "center",
};

const heroOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at 65% 50%, rgba(0,198,255,0.16), transparent 38%)",
  pointerEvents: "none",
};

const heroContent: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "9px 16px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.32)",
  color: "#67e8f9",
  fontWeight: 900,
  marginBottom: "14px",
};

const heroTitle: React.CSSProperties = {
  fontSize: "42px",
  margin: 0,
  textShadow: "0 0 24px rgba(0,198,255,0.42)",
};

const heroText: React.CSSProperties = {
  color: "#cbd5e1",
  marginTop: "12px",
  lineHeight: 1.6,
};

const statsBox: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  minWidth: "120px",
  padding: "18px",
  borderRadius: "20px",
  textAlign: "center",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.18)",
};

const cardStyle: React.CSSProperties = {
  padding: "26px",
  borderRadius: "24px",
  background: "rgba(10,15,25,0.86)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  marginBottom: "25px",
  border: "1px solid rgba(0,198,255,0.25)",
  boxShadow: "0 20px 70px rgba(0,0,0,0.6)",
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
};

const tmdbRow: React.CSSProperties = {
  display: "flex",
  gap: "14px",
  alignItems: "flex-end",
  marginTop: "18px",
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "14px",
  marginTop: "18px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#a8b3c5",
  fontSize: "13px",
  fontWeight: 900,
  marginBottom: "7px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  borderRadius: "14px",
  background: "#0b0f18",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.12)",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: "10px",
};

const inputWithIcon: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "0 14px",
  borderRadius: "14px",
  background: "#0b0f18",
  border: "1px solid rgba(255,255,255,0.14)",
};

const inputIcon: React.CSSProperties = {
  opacity: 0.8,
};

const inputInside: React.CSSProperties = {
  flex: 1,
  padding: "15px 0",
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#fff",
  fontSize: "15px",
};

const pasteButton: React.CSSProperties = {
  height: "54px",
  minWidth: "185px",
  padding: "0 22px",
  borderRadius: "14px",
  background: "rgba(80,40,255,0.10)",
  border: "1px solid rgba(130,80,255,0.7)",
  color: "#fff",
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "default",
  userSelect: "none",
  marginBottom: "1px",
  opacity: 0.9,
};

const textareaWithIcon: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "#0b0f18",
  border: "1px solid rgba(255,255,255,0.12)",
};

const textareaIcon: React.CSSProperties = {
  paddingTop: "5px",
  opacity: 0.8,
};

const textareaInside: React.CSSProperties = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#fff",
  resize: "vertical",
  fontFamily: "Arial, sans-serif",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "18px",
  padding: "16px",
  borderRadius: "14px",
  background: "linear-gradient(135deg,#00c6ff,#0072ff,#3a00ff,#d946ef)",
  border: "none",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 0 30px rgba(0,198,255,0.32)",
};

const helpText: React.CSSProperties = {
  textAlign: "center",
  color: "#9ca3af",
  fontSize: "13px",
  marginTop: "12px",
};

const messageStyle: React.CSSProperties = {
  marginTop: "14px",
  color: "#cbd5e1",
};

const filterRow: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "20px",
  marginBottom: "18px",
};

const filterBtn: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.04)",
  color: "#d1d5db",
  cursor: "pointer",
};

const filterBtnActive: React.CSSProperties = {
  ...filterBtn,
  background: "linear-gradient(135deg,#00c6ff,#0072ff)",
  color: "#fff",
  boxShadow: "0 0 18px rgba(0,198,255,0.35)",
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "14px",
  marginTop: "18px",
};

const movieRequestCard: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "108px 1fr",
  gap: "14px",
  padding: "14px",
  borderRadius: "18px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.035))",
  border: "1px solid rgba(255,255,255,0.12)",
};

const fakePoster: React.CSSProperties = {
  height: "138px",
  borderRadius: "12px",
  overflow: "hidden",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.28), rgba(80,40,255,0.28), rgba(0,0,0,0.5))",
  border: "1px solid rgba(0,198,255,0.25)",
  display: "grid",
  placeItems: "center",
  fontSize: "34px",
};

const posterImage: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "12px",
};

const requestContent: React.CSSProperties = {
  minWidth: 0,
};

const requestTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "flex-start",
};

const demandeTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "20px",
  wordBreak: "break-word",
};

const tmdbText: React.CSSProperties = {
  margin: "5px 0 0",
  color: "#00c6ff",
  fontSize: "13px",
  wordBreak: "break-word",
};

const infoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "10px",
  marginTop: "16px",
};

const infoBox: React.CSSProperties = {
  padding: "10px",
  borderRadius: "12px",
  background: "rgba(0,0,0,0.22)",
  border: "1px solid rgba(255,255,255,0.07)",
  display: "grid",
  gap: "4px",
  color: "#e5e7eb",
};

const authorText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
};

const statusBadge: React.CSSProperties = {
  padding: "7px 12px",
  borderRadius: "999px",
  background: "rgba(255,215,0,0.15)",
  border: "1px solid rgba(255,215,0,0.35)",
  color: "#fde68a",
  fontSize: "12px",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const repliedBadge: React.CSSProperties = {
  padding: "7px 12px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.15)",
  border: "1px solid rgba(34,197,94,0.35)",
  color: "#86efac",
  fontSize: "12px",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const replyBox: React.CSSProperties = {
  marginTop: "12px",
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(0,198,255,0.10)",
  border: "1px solid rgba(0,198,255,0.30)",
};

const replyEditorBox: React.CSSProperties = {
  marginTop: "12px",
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  marginTop: "14px",
  flexWrap: "wrap",
};

const btnBlue: React.CSSProperties = {
  background: "rgba(0,198,255,0.16)",
  border: "1px solid rgba(0,198,255,0.45)",
  padding: "9px 13px",
  borderRadius: "10px",
  color: "#67e8f9",
  cursor: "pointer",
  fontWeight: 900,
};

const btnGray: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  padding: "9px 13px",
  borderRadius: "10px",
  color: "#e5e7eb",
  cursor: "pointer",
  fontWeight: 900,
};

const btnRed: React.CSSProperties = {
  background: "rgba(255,40,40,0.16)",
  border: "1px solid rgba(255,80,80,0.45)",
  padding: "9px 13px",
  borderRadius: "10px",
  color: "#ffabab",
  cursor: "pointer",
  fontWeight: 900,
};

const emptyStyle: React.CSSProperties = {
  padding: "35px",
  textAlign: "center",
  color: "#94a3b8",
  borderRadius: "18px",
  border: "1px dashed rgba(255,255,255,0.16)",
};
const mentionBox: React.CSSProperties = {
  position: "absolute",
  bottom: "105%",
  left: 0,
  width: "340px",
  maxHeight: "300px",
  overflowY: "auto",
  borderRadius: "16px",
  background: "#0b1220",
  border: "1px solid rgba(0,198,255,0.25)",
  boxShadow: "0 15px 40px rgba(0,0,0,0.45)",
  zIndex: 9999,
  padding: "6px",
};

const mentionItem: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  borderRadius: "12px",
  border: "none",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  textAlign: "left",
};

const mentionAvatar: React.CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  objectFit: "cover",
};

const mentionUsername: React.CSSProperties = {
  fontWeight: 900,
  color: "#fff",
  fontSize: "14px",
};

const mentionEmail: React.CSSProperties = {
  fontSize: "11px",
  color: "#94a3b8",
};
