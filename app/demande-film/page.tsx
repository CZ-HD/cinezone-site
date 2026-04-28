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

  const [editId, setEditId] = useState<string | null>(null);
  const [editTmdbLink, setEditTmdbLink] = useState("");
  const [editAnnee, setEditAnnee] = useState("");
  const [editCodec, setEditCodec] = useState("X264");
  const [editCommentaire, setEditCommentaire] = useState("");

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

    setMessage("✅ Demande envoyée !");
    setTmdbLink("");
    setAnnee("");
    setCodec("X264");
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
    const { error } = await supabase
      .from("demandes_films")
      .update({
        tmdb_link: editTmdbLink,
        annee: editAnnee,
        codec: editCodec,
        commentaire: editCommentaire,
      })
      .eq("id", editId);

    if (!error) {
      setEditId(null);
      loadDemandes();
    }
  }

  async function supprimerDemande(id: string) {
    if (!isAdmin) return;

    await supabase.from("demandes_films").delete().eq("id", id);
    loadDemandes();
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>

        {/* 🔥 HERO */}
        <div style={heroStyle}>
          <h1 style={heroTitle}>🎬 Demande de film</h1>
          <p style={heroText}>
            Propose un film à ajouter sur CineZone.  
            Merci de faire une demande claire et complète.
          </p>
        </div>

        {/* FORM */}
        <section style={cardStyle}>
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
            <option>X264</option>
            <option>H265</option>
          </select>

          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Petit commentaire"
            rows={5}
            style={inputStyle}
          />

          <button onClick={envoyerDemande} style={buttonStyle}>
            🚀 Envoyer la demande
          </button>

          {message && <p style={{ marginTop: 14 }}>{message}</p>}
        </section>

        {/* LISTE */}
        <section style={cardStyle}>
          <h2>📋 Demandes envoyées</h2>

          {demandes.length === 0 ? (
            <p style={textStyle}>Aucune demande.</p>
          ) : (
            demandes.map((d) => {
              const canEdit = d.user_id === user?.id;

              return (
                <div key={d.id} style={demandeCard}>
                  <p><b>{d.tmdb_link}</b> ({d.annee})</p>
                  <p>{d.codec}</p>
                  <p>{d.commentaire}</p>

                  <div style={buttonRow}>
                    {canEdit && (
                      <button onClick={() => startEdit(d)} style={btnBlue}>
                        ✏️ Modifier
                      </button>
                    )}

                    {isAdmin && (
                      <button onClick={() => supprimerDemande(d.id)} style={btnRed}>
                        🗑 Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}

/* 🔥 STYLE PREMIUM */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "60px 30px",
  background:
    "radial-gradient(circle at 20% 20%, rgba(0,198,255,0.25), transparent), radial-gradient(circle at 80% 0%, rgba(120,0,255,0.2), transparent), #000",
};

const containerStyle = {
  maxWidth: "900px",
  margin: "0 auto",
};

const heroStyle = {
  padding: "30px",
  borderRadius: "25px",
  marginBottom: "30px",
  background: "rgba(0,0,0,0.5)",
  border: "1px solid rgba(0,198,255,0.3)",
  boxShadow: "0 0 40px rgba(0,198,255,0.2)",
};

const heroTitle = {
  fontSize: "36px",
  margin: 0,
};

const heroText = {
  color: "#aaa",
  marginTop: "10px",
};

const cardStyle = {
  padding: "24px",
  borderRadius: "20px",
  background: "rgba(10,15,25,0.9)",
  marginBottom: "25px",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "12px",
  borderRadius: "12px",
  background: "#0b0f18",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.1)",
};

const buttonStyle = {
  width: "100%",
  marginTop: "16px",
  padding: "14px",
  borderRadius: "12px",
  background: "linear-gradient(135deg,#00c6ff,#0072ff)",
  border: "none",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const demandeCard = {
  padding: "16px",
  borderRadius: "15px",
  marginTop: "14px",
  background: "rgba(255,255,255,0.05)",
};

const buttonRow = {
  display: "flex",
  gap: "10px",
  marginTop: "10px",
};

const btnBlue = {
  background: "#00c6ff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  color: "#000",
  cursor: "pointer",
};

const btnRed = {
  background: "#ff1744",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  color: "#fff",
  cursor: "pointer",
};

const textStyle = {
  color: "#aaa",
};
