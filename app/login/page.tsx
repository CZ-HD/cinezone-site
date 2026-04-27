"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      setMessage("Remplis tous les champs.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("❌ " + error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/";
  };

  return (
    <main style={pageStyle}>
      <div style={bgOverlay} />
      <div style={blueGlow} />
      <div style={goldGlow} />

      <section style={heroStyle}>
        <div style={brandBox}>
          <h1 style={logoStyle}>
            CineZone <span style={hdStyle}>HD</span>
          </h1>

          <p style={subtitleStyle}>
            Accède à ton espace privé, tes favoris et ton tchat en direct.
          </p>
        </div>

        <div style={cardStyle}>
          <div style={topLine} />

          <h2 style={{ margin: 0, fontSize: "26px" }}>Connexion</h2>
          <p style={{ color: "#aab6c8", marginTop: "8px" }}>
            Connecte-toi pour continuer
          </p>

          <input
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <div style={{ position: "relative" }}>
            <input
              placeholder="Mot de passe"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: "48px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") login();
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={eyeBtn}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button onClick={login} disabled={loading} style={buttonStyle}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          {message && (
            <p
              style={{
                marginTop: "14px",
                color: message.includes("❌") ? "#ff8b8b" : "#4cff9b",
              }}
            >
              {message}
            </p>
          )}

          <div style={separator}>
            <span style={separatorLine} />
            <span style={{ color: "#7f8da3", fontSize: "12px" }}>ou</span>
            <span style={separatorLine} />
          </div>

          <p style={{ color: "#b8c3d6", marginBottom: 0 }}>
            Pas encore de compte ?{" "}
            <Link href="/register" style={linkStyle}>
              Inscription →
            </Link>
          </p>
        </div>
      </section>
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
  background:
    "linear-gradient(135deg, #02050a 0%, #061528 45%, #000 100%)",
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

const heroStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: "980px",
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: "34px",
  alignItems: "center",
};

const brandBox: React.CSSProperties = {
  padding: "30px",
};

const logoStyle: React.CSSProperties = {
  fontSize: "56px",
  lineHeight: 1,
  fontWeight: 950,
  margin: 0,
  letterSpacing: "-1.5px",
  textShadow: "0 0 30px rgba(0,198,255,0.35)",
};

const hdStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg, #00c6ff 10%, #0072ff 55%, #ffd76a 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "18px",
  maxWidth: "520px",
  fontSize: "18px",
  lineHeight: 1.6,
  color: "#b8c3d6",
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  padding: "34px",
  borderRadius: "28px",
  background:
    "linear-gradient(180deg, rgba(13,20,34,0.92), rgba(5,8,14,0.9))",
  border: "1px solid rgba(0,198,255,0.28)",
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

const eyeBtn: React.CSSProperties = {
  position: "absolute",
  right: "10px",
  top: "24px",
  border: "none",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  fontSize: "18px",
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

const separator: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  margin: "22px 0",
};

const separatorLine: React.CSSProperties = {
  flex: 1,
  height: "1px",
  background: "rgba(255,255,255,0.12)",
};

const linkStyle: React.CSSProperties = {
  color: "#00c6ff",
  textDecoration: "none",
  fontWeight: 800,
};