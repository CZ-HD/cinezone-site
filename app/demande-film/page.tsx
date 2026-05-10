"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

export default function DemandeFilmPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [tmdbLink, setTmdbLink] = useState("");
  const [annee, setAnnee] = useState("");
  const [codec, setCodec] = useState("H264");
  const [commentaire, setCommentaire] = useState("");
  const [message, setMessage] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editTmdbLink, setEditTmdbLink] = useState("");
  const [editAnnee, setEditAnnee] = useState("");
  const [editCodec, setEditCodec] = useState("H264");
  const [editCommentaire, setEditCommentaire] = useState("");

  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

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

    setDemandes(data || []);
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

    if (!confirm("Supprimer cette demande ?")) {
      return;
    }

    await supabase.from("demandes_films").delete().eq("id", id);

    loadDemandes();
  }

  const waitingCount = demandes.filter((d) => !d.admin_reply).length;
  const repliedCount = demandes.filter((d) => d.admin_reply).length;

  return (
    <main style={pageStyle}>
      <div style={pageGlowOne} />
      <div style={pageGlowTwo} />

      <div style={containerStyle}>
        <section style={heroStyle}>
          <div style={heroContent}>
            <span style={badgeStyle}>🎬 CineZone Request</span>
            <h1 style={heroTitle}>Demande de film</h1>
            <p style={heroText}>
              Propose un film à ajouter sur CineZone. Plus ta demande est claire,
              plus elle sera facile à traiter.
            </p>

            <div style={heroStatsRow}>
              <span style={miniStat}>🟡 {waitingCount} en attente</span>
              <span style={miniStat}>🟢 {repliedCount} répondues</span>
            </div>
          </div>

          <div style={statsBox}>
            <strong>{demandes.length}</strong>
            <span>demande{demandes.length > 1 ? "s" : ""}</span>
          </div>
        </section>

        <section style={cardStyle}>
          <div style={cardHeaderRow}>
            <div>
              <h2 style={sectionTitle}>🚀 Nouvelle demande</h2>
              <p style={sectionSubText}>Lien TMDB, année, codec et précision demandée.</p>
            </div>
          </div>

          <div style={formGrid}>
            <div>
              <label style={labelStyle}>Lien ou ID TMDB</label>
              <input
                value={tmdbLink}
                onChange={(e) => setTmdbLink(e.target.value)}
                placeholder="Ex: https://www.themoviedb.org/movie/12345"
                style={inputStyle}
              />
            </div>

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
          </div>

          <div style={{ marginTop: "14px" }}>
            <label style={labelStyle}>Commentaire</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Qualité souhaitée, version, langue, remarque..."
              rows={5}
              style={textareaStyle}
            />
          </div>

          <button onClick={envoyerDemande} disabled={loading} style={buttonStyle}>
            {loading ? "Envoi en cours..." : "🚀 Envoyer la demande"}
          </button>

          <p style={helpText}>ℹ️ Une demande précise a plus de chances d’être acceptée.</p>

          {message && <p style={messageStyle}>{message}</p>}
        </section>

        <section style={cardStyle}>
          <div style={cardHeaderRow}>
            <div>
              <h2 style={sectionTitle}>📋 Demandes envoyées</h2>
              <p style={sectionSubText}>Suivi des demandes et réponses administrateur.</p>
            </div>
          </div>

          {demandes.length === 0 ? (
            <div style={emptyStyle}>
              <p>Aucune demande pour le moment.</p>
            </div>
          ) : (
            <div style={listStyle}>
              {demandes.map((d) => {
                const canEdit = d.user_id === user?.id;

                return (
                  <article key={d.id} style={demandeCard}>
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
                        <div style={demandeTop}>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={demandeTitle}>{d.tmdb_link}</h3>
                            <div style={metaRow}>
                              <span style={metaPill}>📅 {d.annee}</span>
                              <span style={metaPill}>🎞️ {d.codec}</span>
                              <span style={metaPill}>🗓️ {formatDate(d.created_at)}</span>
                            </div>
                          </div>

                          <span style={d.admin_reply ? repliedBadge : statusBadge}>
                            {d.admin_reply ? "Répondu" : "En attente"}
                          </span>
                        </div>

                        <div style={commentBox}>
                          <strong style={boxLabel}>💭 Commentaire membre</strong>
                          <p style={commentText}>{d.commentaire}</p>
                        </div>

                        <p style={authorText}>
                          Demandé par : <strong>{d.email}</strong>
                        </p>

                        {d.admin_reply && (
                          <div style={replyBox}>
                            <strong style={{ color: "#67e8f9" }}>
                              💬 Réponse admin
                            </strong>
                            <p style={{ margin: "8px 0 0", color: "#e5e7eb", lineHeight: 1.6 }}>
                              {d.admin_reply}
                            </p>
                          </div>
                        )}

                        {isAdmin && replyId === d.id && (
                          <div style={replyEditorBox}>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Écrire une réponse au membre..."
                              rows={3}
                              style={textareaStyle}
                            />

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

function formatDate(value?: string) {
  if (!value) return "date inconnue";
  return new Date(value).toLocaleDateString("fr-FR");
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
  position: "relative",
  overflow: "hidden",
};

const pageGlowOne: React.CSSProperties = {
  position: "fixed",
  width: "420px",
  height: "420px",
  borderRadius: "50%",
  background: "rgba(0,198,255,0.12)",
  filter: "blur(80px)",
  top: "-120px",
  left: "-140px",
  pointerEvents: "none",
};

const pageGlowTwo: React.CSSProperties = {
  position: "fixed",
  width: "420px",
  height: "420px",
  borderRadius: "50%",
  background: "rgba(92,0,255,0.14)",
  filter: "blur(90px)",
  bottom: "-120px",
  right: "-140px",
  pointerEvents: "none",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "980px",
  margin: "0 auto",
  position: "relative",
  zIndex: 2,
};

const heroStyle: React.CSSProperties = {
  padding: "36px",
  borderRadius: "30px",
  marginBottom: "28px",
  background:
    "linear-gradient(135deg, rgba(5,10,18,0.84), rgba(8,16,32,0.74))",
  border: "1px solid rgba(0,198,255,0.35)",
  boxShadow: "0 0 70px rgba(0,198,255,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  alignItems: "center",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

const heroContent: React.CSSProperties = {
  maxWidth: "720px",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "9px 16px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.13)",
  border: "1px solid rgba(0,198,255,0.38)",
  color: "#67e8f9",
  fontWeight: 900,
  marginBottom: "14px",
  boxShadow: "0 0 20px rgba(0,198,255,0.16)",
};

const heroTitle: React.CSSProperties = {
  fontSize: "44px",
  margin: 0,
  letterSpacing: "-0.04em",
};

const heroText: React.CSSProperties = {
  color: "#cbd5e1",
  marginTop: "12px",
  lineHeight: 1.6,
};

const heroStatsRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "16px",
};

const miniStat: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.11)",
  color: "#dbeafe",
  fontSize: "12px",
  fontWeight: 800,
};

const statsBox: React.CSSProperties = {
  minWidth: "124px",
  padding: "18px",
  borderRadius: "22px",
  textAlign: "center",
  background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
};

const cardStyle: React.CSSProperties = {
  padding: "28px",
  borderRadius: "26px",
  background:
    "linear-gradient(180deg, rgba(10,15,25,0.86), rgba(5,10,18,0.88))",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  marginBottom: "25px",
  border: "1px solid rgba(0,198,255,0.25)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const cardHeaderRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "flex-start",
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "23px",
};

const sectionSubText: React.CSSProperties = {
  margin: "7px 0 0",
  color: "#8ea0b6",
  fontSize: "13px",
};

const formGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 150px 160px",
  gap: "14px",
  marginTop: "20px",
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
  borderRadius: "16px",
  background: "rgba(5,10,18,0.92)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.13)",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: "10px",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "18px",
  padding: "16px",
  borderRadius: "16px",
  background: "linear-gradient(135deg,#00c6ff,#0072ff,#3a00ff)",
  border: "none",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 14px 34px rgba(0,114,255,0.35), 0 0 22px rgba(0,198,255,0.20)",
};

const helpText: React.CSSProperties = {
  color: "#8ea0b6",
  fontSize: "13px",
  textAlign: "center",
  margin: "12px 0 0",
};

const messageStyle: React.CSSProperties = {
  marginTop: "14px",
  color: "#cbd5e1",
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
  marginTop: "20px",
};

const demandeCard: React.CSSProperties = {
  padding: "20px",
  borderRadius: "20px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.038))",
  border: "1px solid rgba(255,255,255,0.11)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 34px rgba(0,0,0,0.28)",
};

const demandeTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  alignItems: "flex-start",
};

const demandeTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "17px",
  wordBreak: "break-word",
  color: "#fff",
};

const metaRow: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const metaPill: React.CSSProperties = {
  padding: "6px 9px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.10)",
  border: "1px solid rgba(0,198,255,0.20)",
  color: "#93c5fd",
  fontSize: "12px",
  fontWeight: 800,
};

const commentBox: React.CSSProperties = {
  marginTop: "14px",
  padding: "13px",
  borderRadius: "16px",
  background: "rgba(0,0,0,0.20)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const boxLabel: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: "13px",
};

const commentText: React.CSSProperties = {
  color: "#e5e7eb",
  lineHeight: 1.6,
  margin: "8px 0 0",
};

const authorText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
};

const statusBadge: React.CSSProperties = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(255,215,0,0.15)",
  border: "1px solid rgba(255,215,0,0.35)",
  color: "#fde68a",
  fontSize: "12px",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const repliedBadge: React.CSSProperties = {
  padding: "7px 11px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.15)",
  border: "1px solid rgba(34,197,94,0.35)",
  color: "#86efac",
  fontSize: "12px",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const replyBox: React.CSSProperties = {
  marginTop: "14px",
  padding: "14px",
  borderRadius: "16px",
  background: "linear-gradient(135deg, rgba(0,198,255,0.13), rgba(0,114,255,0.08))",
  border: "1px solid rgba(0,198,255,0.32)",
  boxShadow: "0 0 22px rgba(0,198,255,0.10)",
};

const replyEditorBox: React.CSSProperties = {
  marginTop: "14px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(0,0,0,0.24)",
  border: "1px solid rgba(255,255,255,0.09)",
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
  padding: "10px 14px",
  borderRadius: "12px",
  color: "#67e8f9",
  cursor: "pointer",
  fontWeight: 900,
};

const btnGray: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  padding: "10px 14px",
  borderRadius: "12px",
  color: "#e5e7eb",
  cursor: "pointer",
  fontWeight: 900,
};

const btnRed: React.CSSProperties = {
  background: "rgba(255,40,40,0.16)",
  border: "1px solid rgba(255,80,80,0.45)",
  padding: "10px 14px",
  borderRadius: "12px",
  color: "#ffabab",
  cursor: "pointer",
  fontWeight: 900,
};

const emptyStyle: React.CSSProperties = {
  padding: "38px",
  textAlign: "center",
  color: "#94a3b8",
  borderRadius: "20px",
  border: "1px dashed rgba(255,255,255,0.16)",
  marginTop: "20px",
  background: "rgba(255,255,255,0.035)",
};
