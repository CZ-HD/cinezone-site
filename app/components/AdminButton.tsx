"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
].map((email) => email.toLowerCase());

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [demandeCount, setDemandeCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      const [pendingResult, demandesResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),

        supabase
          .from("demandes_films")
          .select("*", { count: "exact", head: true }),
      ]);

      if (cancelled) return;

      setPendingCount(pendingResult.count || 0);
      setDemandeCount(demandesResult.count || 0);
    }

    async function checkAdmin() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (cancelled || error || !user) return;

        const email = user.email?.toLowerCase() || "";

        // Les deux fondateurs conservent leur accès administrateur.
        if (CREATOR_EMAILS.includes(email)) {
          setIsAdmin(true);
          await loadCounts();
          return;
        }

        // Les autres comptes doivent avoir le rôle admin
        // et un compte approuvé dans Supabase.
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled || profileError || !profile) return;

        if (profile.role === "admin" && profile.status === "approved") {
          setIsAdmin(true);
          await loadCounts();
        }
      } catch (error) {
        console.error("Erreur de vérification administrateur :", error);
      }
    }

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isAdmin) return null;

  const totalAlerts = pendingCount + demandeCount;

  return (
    <Link
      href="/admin"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
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
        whiteSpace: "nowrap",
      }}
      title={`${pendingCount} membre(s) en attente, ${demandeCount} demande(s) de film`}
    >
      👑 Admin

      {totalAlerts > 0 && (
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
          {totalAlerts}
        </span>
      )}
    </Link>
  );
}
