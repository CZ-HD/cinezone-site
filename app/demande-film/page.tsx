"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CREATOR_EMAIL = "blackph4tom@gmail.com";

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

    if (
      data.user.email === CREATOR_EMAIL ||
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

  await supabase
    .from("demandes_films")
    .delete()
    .eq("id", id);

  loadDemandes();
}

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <section style={heroStyle}>
          <div>
            <span style={badgeStyle}>🎬 CineZone Request</span>
            <h1 style={heroTitle}>Demande de film</h1>
            <p style={heroText}>
              Propose un film à ajouter sur CineZone. Merci de remplir une
              demande claire, complète et facile à traiter.
            </p>
          </div>

          <div style={statsBox}>
            <strong>{demandes.length}</strong>
            <span>demande{demandes.length > 1 ? "s" : ""}</span>
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>🚀 Nouvelle demande</h2>

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

          {message && <p style={messageStyle}>{message}</p>}
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>📋 Demandes envoyées</h2>

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
                          <div>
                            <h3 style={demandeTitle}>{d.tmdb_link}</h3>
                            <p style={metaText}>
                              📅 {d.annee} · 🎞️ {d.codec}
                            </p>
                          </div>

                          <span style={d.admin_reply ? repliedBadge : statusBadge}>
                            {d.admin_reply ? "Répondu" : "En attente"}
                          </span>
                        </div>

                        <p style={commentText}>{d.commentaire}</p>

                        <p style={authorText}>
                          Demandé par : <strong>{d.email}</strong>
                        </p>

                        {d.admin_reply && (
                          <div style={replyBox}>
                            <strong style={{ color: "#67e8f9" }}>
                              💬 Réponse admin :
                            </strong>
                            <p style={{ margin: "8px 0 0", color: "#e5e7eb" }}>
                              {d.admin_reply}
                            </p>
                          </div>
                        )}

                        {isAdmin && replyId === d.id && (
                          <div style={{ marginTop: "12px" }}>
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

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "60px 30px",
  background: `
    linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.88)),
    url("https://images.unsplash.com/photo-1524985069026-dd778a71c7b4")
  `,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "960px",
  margin: "0 auto",
};

const heroStyle: React.CSSProperties = {
  padding: "34px",
  borderRadius: "28px",
  marginBottom: "28px",
  background: "rgba(5,10,18,0.76)",
  border: "1px solid rgba(0,198,255,0.35)",
  boxShadow: "0 0 60px rgba(0,198,255,0.15)",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  alignItems: "center",
  backdropFilter: "blur(14px)",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 14px",
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
};

const heroText: React.CSSProperties = {
  color: "#cbd5e1",
  marginTop: "12px",
  lineHeight: 1.6,
};

const statsBox: React.CSSProperties = {
  minWidth: "120px",
  padding: "18px",
  borderRadius: "20px",
  textAlign: "center",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const cardStyle: React.CSSProperties = {
  padding: "26px",
  borderRadius: "24px",
  background: "rgba(10,15,25,0.82)",
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

const formGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 150px 150px",
  gap: "14px",
  marginTop: "18px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#9ca3af",
  fontSize: "13px",
  fontWeight: 800,
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

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "18px",
  padding: "15px",
  borderRadius: "14px",
  background: "linear-gradient(135deg,#00c6ff,#0072ff,#3a00ff)",
  border: "none",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const messageStyle: React.CSSProperties = {
  marginTop: "14px",
  color: "#cbd5e1",
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "14px",
  marginTop: "18px",
};

const demandeCard: React.CSSProperties = {
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
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
};

const metaText: React.CSSProperties = {
  color: "#93c5fd",
  margin: "8px 0 0",
};

const commentText: React.CSSProperties = {
  color: "#e5e7eb",
  lineHeight: 1.6,
};

const authorText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
};

const statusBadge: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(255,215,0,0.15)",
  border: "1px solid rgba(255,215,0,0.35)",
  color: "#fde68a",
  fontSize: "12px",
  fontWeight: 900,
};

const repliedBadge: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(34,197,94,0.15)",
  border: "1px solid rgba(34,197,94,0.35)",
  color: "#86efac",
  fontSize: "12px",
  fontWeight: 900,
};

const replyBox: React.CSSProperties = {
  marginTop: "12px",
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(0,198,255,0.10)",
  border: "1px solid rgba(0,198,255,0.30)",
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
