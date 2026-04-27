"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendResetEmail = async () => {
    if (!email) {
      setMessage("Entre ton adresse email.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://cinezone-hd.fr/reset-password",
    });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Email envoyé. Vérifie ta boîte mail.");
    }

    setLoading(false);
  };

  return (
    <main style={pageStyle}>
      <div style={bgOverlay} />
      <div style={blueGlow} />
      <div style={goldGlow} />

      <div style={cardStyle}>
        <div style={topLine} />

        <h1 style={titleStyle}>Mot de passe oublié</h1>

        <p style={textStyle}>
          Entre ton email et tu recevras un lien pour réinitialiser ton mot de passe.
        </p>

        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <button onClick={sendResetEmail} disabled={loading} style={buttonStyle}>
          {loading ? "Envoi..." : "Envoyer le lien"}
        </button>

        {message && (
          <p
            style={{
              marginTop: "16px",
              color: message.includes("❌") ? "#ff8b8b" : "#4cff9b",
            }}
          >
            {message}
          </p>
        )}

        <a href="/login" style={backLink}>
          ← Retour connexion
        </a>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
  background: "linear-gradient(135deg, #02050a 0%, #061528 45%, #000 100%)",
};

const bgOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at top left, rgba(0,198,255,0.22), transparent 35%), radial-gradient(circle at bottom right, rgba(255,215,100,0.12), transparent 30%)",
};

const blueGlow: React.CSSProperties = {
  position: "absolute",
  width: "420px",
  height: "420px",
  borderRadius: "50%",
  background: "rgba(0,140,255,0.22)",
  filter: "blur(80px)",
  top: "10%",
  left: "10%",
};

const goldGlow: React.CSSProperties = {
  position: "absolute",
  width: "320px",
  height: "320px",
  borderRadius: "50%",
  background: "rgba(255,215,100,0.13)",
  filter: "blur(80px)",
  bottom: "12%",
  right: "12%",
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: "430px",
  padding: "34px",
  borderRadius: "28px",
  background:
    "linear-gradient(180deg, rgba(13,20,34,0.95), rgba(5,8,14,0.95))",
  border: "1px solid rgba(0,198,255,0.35)",
  boxShadow:
    "0 30px 100px rgba(0,0,0,0.82), 0 0 35px rgba(0,140,255,0.18)",
  backdropFilter: "blur(18px)",
};

const topLine: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: "24px",
  right: "24px",
  height: "2px",
  background:
    "linear-gradient(90deg, transparent, #00c6ff, #ffd76a, transparent)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "28px",
};

const textStyle: React.CSSProperties = {
  color: "#aab6c8",
  lineHeight: 1.6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "15px",
  marginTop: "14px",
  borderRadius: "15px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(4,8,15,0.92)",
  color: "#fff",
  outline: "none",
  fontSize: "15px",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "18px",
  padding: "15px",
  borderRadius: "16px",
  border: "none",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  background:
    "linear-gradient(135deg, #00c6ff 0%, #0072ff 55%, #3a00ff 100%)",
  boxShadow: "0 14px 40px rgba(0,114,255,0.45)",
};

const backLink: React.CSSProperties = {
  display: "block",
  marginTop: "24px",
  color: "#00c6ff",
  textDecoration: "none",
  fontWeight: 800,
  textAlign: "center",
};
