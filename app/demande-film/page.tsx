"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CREATOR_EMAIL = "blackph4tom@gmail.com";

export default function DemandeFilmPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [demandes, setDemandes] = useState<any[]>([]);

  const [tmdbLink, setTmdbLink] = useState("");
  const [annee, setAnnee] = useState("");
  const [codec, setCodec] = useState("X264");
  const [commentaire, setCommentaire] = useState("");
  const [message, setMessage] = useState("");

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
    if (!tmdbLink || !annee || !codec || !commentaire) {
      setMessage("❌ Tous les champs sont obligatoires.");
      return;
    }

    const { error } = await supabase.from("demandes_films").insert({
      user_id: user.id,
      email: user.email,
      tmdb_link: tmdbLink,
      annee,
      codec,
      commentaire,
    });

    if (error) {
      setMessage("❌ Erreur : " + error.message);
      return;
    }

    setMessage("✅ Demande envoyée avec succès.");
    setTmdbLink("");
    setAnnee("");
    setCodec("X264");
    setCommentaire("");
    loadDemandes();
  }

  async function supprimerDemande(id: string) {
    if (!isAdmin) return;
    if (!confirm("Supprimer cette demande ?")) return;

    const { error } = await supabase
      .from("demandes_films")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erreur suppression : " + error.message);
      return;
    }

    loadDemandes();
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1>🎬 Demande de film</h1>

        <p style={textStyle}>
          Remplis ce formulaire avec politesse. Toute demande incomplète pourra
          être refusée.
        </p>

        <input
          value={tmdbLink}
          onChange={(e) => setTmdbLink(e.target.value)}
          placeholder="Lien ou n° ID TMDB"
          style={inputStyle}
        />

        <input
          value={annee}
          onChange={(e) => setAnnee(e.target.value)}
          placeholder="Année"
          style={inputStyle}
        />

        <select
          value={codec}
          onChange={(e) => setCodec(e.target.value)}
          style={inputStyle}
        >
          <option value="X264">X264</option>
          <option value="H265">H265</option>
        </select>

        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Petit commentaire"
          rows={5}
          style={inputStyle}
        />

        <button onClick={envoyerDemande} style={buttonStyle}>
          Envoyer la demande
        </button>

        {message && <p style={{ marginTop: "14px" }}>{message}</p>}
      </section>

      <section style={cardStyle}>
        <h2>📋 Demandes envoyées</h2>

        {demandes.length === 0 ? (
          <p style={textStyle}>Aucune demande pour le moment.</p>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {demandes.map((demande) => (
              <div key={demande.id} style={demandeCard}>
                <p>
                  <b>TMDB / Lien :</b> {demande.tmdb_link}
                </p>
                <p>
                  <b>Année :</b> {demande.annee}
                </p>
                <p>
                  <b>Codec :</b> {demande.codec}
                </p>
                <p>
                  <b>Commentaire :</b> {demande.commentaire}
                </p>
                <p style={{ color: "#8b95a7", fontSize: "13px" }}>
                  Demandé par : {demande.email}
                </p>

                {isAdmin && (
                  <button
                    onClick={() => supprimerDemande(demande.id)}
                    style={deleteButton}
                  >
                    🗑 Supprimer
                  </button>
                )}
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
  padding: "34px",
  color: "#fff",
  background: "radial-gradient(circle at top, rgba(0,120,255,0.18), #000 60%)",
  fontFamily: "Arial, sans-serif",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "850px",
  marginBottom: "28px",
  padding: "24px",
  borderRadius: "24px",
  background: "rgba(10,15,25,0.92)",
  border: "1px solid rgba(0,198,255,0.25)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
};

const textStyle: React.CSSProperties = {
  color: "#aab6c8",
  lineHeight: 1.6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px",
  marginTop: "12px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "16px",
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
};

const demandeCard: React.CSSProperties = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const deleteButton: React.CSSProperties = {
  marginTop: "10px",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,90,90,0.45)",
  background: "rgba(255,70,70,0.16)",
  color: "#ffb3b3",
  fontWeight: 800,
  cursor: "pointer",
};
