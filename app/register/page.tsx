"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!email || !password) {
      setMessage("Remplis tous les champs.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage("❌ " + error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert({
  id: user.id,
  email: user.email,
  role: "user",
  status: "pending",
  username: null,
  avatar: null,
  status_text: "🔴 Hors ligne",
  role_color: null,
});

      if (profileError) {
        setMessage("❌ Profil non créé : " + profileError.message);
        setLoading(false);
        return;
      }
    }

    setMessage("✅ Compte créé ! En attente de validation admin.");
    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0,120,255,0.2), #000 60%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          background: "rgba(20,20,25,0.65)",
          borderRadius: "20px",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Créer un compte</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "14px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "#111",
            color: "#fff",
          }}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "#111",
            color: "#fff",
          }}
        />

        <button
          onClick={register}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            color: "#fff",
            background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
            boxShadow: "0 10px 30px rgba(0,114,255,0.4)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Création..." : "S’inscrire"}
        </button>

        {message && (
          <p
            style={{
              marginTop: "16px",
              color: message.includes("❌") ? "#ff8080" : "#4cffb0",
            }}
          >
            {message}
          </p>
        )}

        <p style={{ marginTop: "18px", opacity: 0.8 }}>Déjà un compte ?</p>

        <Link
          href="/login"
          style={{
            display: "inline-block",
            marginTop: "6px",
            color: "#00c6ff",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Connexion →
        </Link>
      </div>
    </main>
  );
}
