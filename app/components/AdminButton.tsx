"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin" && profile?.status === "approved") {
        setIsAdmin(true);
      }
    }

    checkAdmin();
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      style={{
        color: "#fff",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 900,
        padding: "10px 18px",
        borderRadius: "999px",
        background:
          "linear-gradient(135deg, rgba(255,215,100,0.35), rgba(255,140,0,0.22))",
        border: "1px solid rgba(255,215,100,0.55)",
        boxShadow: "0 0 18px rgba(255,215,100,0.35)",
      }}
    >
      👑 Admin
    </Link>
  );
}