"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const CREATOR_EMAIL = "blackph4tom@gmail.com";

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      if (user.email === CREATOR_EMAIL) {
        setIsAdmin(true);
        await loadPendingCount();
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin" && profile?.status === "approved") {
        setIsAdmin(true);
        await loadPendingCount();
      }
    }

    async function loadPendingCount() {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setPendingCount(count || 0);
    }

    checkAdmin();
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      style={{
        position: "relative",
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

      {pendingCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-7px",
            right: "-7px",
            minWidth: "18px",
            height: "18px",
            padding: "2px 5px",
            borderRadius: "999px",
            background: "#ff1744",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 950,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 12px rgba(255,23,68,0.8)",
          }}
        >
          {pendingCount}
        </span>
      )}
    </Link>
  );
}
