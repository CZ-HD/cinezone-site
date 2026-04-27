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

          <div style={featuresStyle}>
            <div style={featureItem}>
              <div style={featureIcon}>🛡️</div>
              <strong>Sécurisé</strong>
              <span>Données protégées</span>
            </div>

            <div style={featureItem}>
              <div style={featureIcon}>⚡</div>
              <strong>Rapide</strong>
              <span>Accès en un clic</span>
            </div>

            <div style={featureItem}>
              <div style={featureIcon}>💗</div>
              <strong>Personnalisé</strong>
              <span>Ton univers, ton style</span>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={topLine} />

          <h2 style={titleStyle}>Connexion</h2>

          <p style={cardSubtitle}>
            Connecte-toi pour continuer
          </p>

          <div style={fieldBox}>
            <span style={fieldIcon}>✉️</span>
            <input
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldBox}>
            <span style={fieldIcon}>🔒</span>
            <input
              placeholder="Mot de passe"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: "45px" }}
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

          <div style={forgotBox}>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/forgot-password";
              }}
              style={forgotLink}
            >
              🔐 J’ai oublié mon mot de passe
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
                fontWeight: 700,
              }}
            >
              {message}
            </p>
          )}

          <div style={separator}>
            <span style={separatorLine} />
            <span style={{ color: "#7f8da3", fontSize: "14px" }}>ou</span>
            <span style={separatorLine} />
          </div>

          <Link href="/register" style={createAccountBtn}>
            👥 Créer un compte
          </Link>

          <p style={bottomText}>
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
  background: "linear-gradient(135deg, #02050a 0%, #061528 45%, #000 100%)",
};

const bgOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at top left, rgba(0,198,255,0.26), transparent 38%), radial-gradient(circle at bottom right, rgba(255,215,100,0.14), transparent 30%)",
};

const blueGlow: React.CSSProperties = {
  position: "absolute",
  width: "520px",
  height: "520px",
  borderRadius: "50%",
  background: "rgba(0,140,255,0.28)",
  filter: "blur(100px)",
  top: "13%",
  left: "7%",
};

const goldGlow: React.CSSProperties = {
  position: "absolute",
  width: "360px",
  height: "360px",
  borderRadius: "50%",
  background: "rgba(255,215,100,0.13)",
  filter: "blur(100px)",
  bottom: "9%",
  right: "10%",
};

const heroStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: "1180px",
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: "55px",
  alignItems: "center",
};

const brandBox: React.CSSProperties = {
  padding: "30px",
};

const logoStyle: React.CSSProperties = {
  fontSize: "62px",
  lineHeight: 1,
  fontWeight: 950,
  margin: 0,
  letterSpacing: "-1.5px",
  textShadow: "0 0 34px rgba(0,198,255,0.38)",
};

const hdStyle: React.CSSProperties = {
  background:
    "linear-gradient(135deg, #00c6ff 10%, #0072ff 55%, #ffd76a 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "22px",
  maxWidth: "540px",
  fontSize: "22px",
  lineHeight: 1.55,
  color: "#b8c3d6",
};

const featuresStyle: React.CSSProperties = {
  marginTop: "58px",
  display: "flex",
  gap: "58px",
  color: "#b8c3d6",
  textAlign: "center",
};

const featureItem: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontSize: "18px",
};

const featureIcon: React.CSSProperties = {
  fontSize: "38px",
  marginBottom: "8px",
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  padding: "48px",
  borderRadius: "32px",
  background:
    "linear-gradient(180deg, rgba(13,20,34,0.96), rgba(5,8,14,0.94))",
  border: "1px solid rgba(0,198,255,0.38)",
  boxShadow:
    "0 34px 110px rgba(0,0,0,0.86), 0 0 42px rgba(0,140,255,0.2)",
  backdropFilter: "blur(18px)",
};

const topLine: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: "30px",
  right: "30px",
  height: "2px",
  background:
    "linear-gradient(90deg, transparent, #00c6ff, #ffd76a, transparent)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "42px",
  fontWeight: 950,
};

const cardSubtitle: React.CSSProperties = {
  color: "#aab6c8",
  marginTop: "18px",
  marginBottom: "26px",
  fontSize: "20px",
};

const fieldBox: React.CSSProperties = {
  position: "relative",
  marginTop: "16px",
};

const fieldIcon: React.CSSProperties = {
  position: "absolute",
  left: "20px",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "21px",
  opacity: 0.75,
  zIndex: 2,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "21px 58px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(4,8,15,0.92)",
  color: "#fff",
  outline: "none",
  fontSize: "18px",
};

const eyeBtn: React.CSSProperties = {
  position: "absolute",
  right: "18px",
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  fontSize: "19px",
};

const forgotBox: React.CSSProperties = {
  marginTop: "18px",
  textAlign: "right",
};

const forgotLink: React.CSSProperties = {
  color: "#00c6ff",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: "8px",
  fontSize: "17px",
  fontWeight: 900,
  textShadow: "0 0 18px rgba(0,198,255,0.45)",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "32px",
  padding: "22px",
  borderRadius: "18px",
  border: "none",
  color: "#fff",
  fontWeight: 950,
  fontSize: "22px",
  cursor: "pointer",
  background:
    "linear-gradient(135deg, #00c6ff 0%, #0072ff 55%, #3a00ff 100%)",
  boxShadow: "0 16px 46px rgba(0,114,255,0.48)",
};

const separator: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  margin: "28px 0",
};

const separatorLine: React.CSSProperties = {
  flex: 1,
  height: "1px",
  background: "rgba(255,255,255,0.14)",
};

const createAccountBtn: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "20px",
  borderRadius: "18px",
  border: "1px solid rgba(0,198,255,0.65)",
  color: "#fff",
  textDecoration: "none",
  textAlign: "center",
  fontWeight: 950,
  fontSize: "21px",
  background: "rgba(0,0,0,0.18)",
};

const bottomText: React.CSSProperties = {
  color: "#b8c3d6",
  marginTop: "28px",
  marginBottom: 0,
  fontSize: "19px",
};

const linkStyle: React.CSSProperties = {
  color: "#00c6ff",
  textDecoration: "none",
  fontWeight: 950,
};
