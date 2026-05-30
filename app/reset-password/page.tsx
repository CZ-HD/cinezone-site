"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const updatePassword = async () => {
    if (!password || !confirmPassword) {
      setMessage("Remplis tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Mot de passe modifié avec succès.");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }

    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#050b14",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "30px",
          borderRadius: "20px",
          background: "#0b1220",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h1>Nouveau mot de passe</h1>

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "15px",
            marginBottom: "15px",
          }}
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
          }}
        />

        <button
          onClick={updatePassword}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            cursor: "pointer",
          }}
        >
          {loading ? "Modification..." : "Modifier le mot de passe"}
        </button>

        {message && (
          <p style={{ marginTop: "15px" }}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
