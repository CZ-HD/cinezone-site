
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AuthLinks() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (active) setIsLoggedIn(Boolean(data.user));
    }

    void checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoggedIn !== false) return null;

  return (
    <div style={styles.container}>
      <Link href="/login" style={styles.login}>
        🔑 Connexion
      </Link>

      <Link href="/register" style={styles.register}>
        ✨ Inscription
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  login: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    textDecoration: "none",
    color: "#67e8f9",
    fontSize: 13,
    fontWeight: 800,
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(0,198,255,0.12)",
    border: "1px solid rgba(0,198,255,0.65)",
    boxShadow: "0 0 14px rgba(0,198,255,0.12)",
  },
  register: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    textDecoration: "none",
    color: "#fff",
    fontSize: 13,
    fontWeight: 900,
    padding: "10px 14px",
    borderRadius: 999,
    background: "linear-gradient(135deg, #087bff, #713bff)",
    border: "1px solid rgba(100,170,255,0.7)",
    boxShadow: "0 0 18px rgba(0,114,255,0.25)",
  },
};
