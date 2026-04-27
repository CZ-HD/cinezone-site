"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AuthButton() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    }

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    window.location.href = "/";
  };

  if (!email) {
    return (
      <Link href="/login" style={authStyle}>
        Connexion
      </Link>
    );
  }

  return (
    <button onClick={logout} style={{ ...authStyle, cursor: "pointer" }}>
      Déconnexion
    </button>
  );
}

const authStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 800,
  padding: "10px 18px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, rgba(255,215,100,0.22), rgba(0,198,255,0.12))",
  border: "1px solid rgba(255,215,100,0.35)",
  boxShadow: "0 0 16px rgba(255,215,100,0.18)",
};