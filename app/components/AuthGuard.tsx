"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

// true = maintenance pour les visiteurs et membres ordinaires
// false = site public normalement
const MAINTENANCE_MODE = false;

// Pages accessibles sans connexion
const PUBLIC_PAGES = [
  "/",
  "/login",
  "/register",
  "/waiting",
  "/forgot-password",
  "/reset-password",
  "/contact",
  "/films",
  "/sagas",
  "/demande-film",
];

// Pages et sous-pages qui nécessitent une connexion
const PROTECTED_PREFIXES = [
  "/compte",
  "/profil",
  "/notifications",
];

function isPublicPage(pathname: string) {
  return (
    PUBLIC_PAGES.includes(pathname) ||
    pathname.startsWith("/films/") ||
    pathname.startsWith("/sagas/")
  );
}

function isProtectedPage(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      setLoading(true);
      setMaintenance(false);
      setAuthorized(false);

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        const isCreator =
          !error &&
          !!user?.email &&
          CREATOR_EMAILS.includes(user.email.toLowerCase());

        // Les fondateurs gardent leur accès.
        if (isCreator) {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Pendant la maintenance, les visiteurs et membres ordinaires
        // ne peuvent pas accéder au site, y compris à la connexion.
        if (MAINTENANCE_MODE) {
          setMaintenance(true);
          setLoading(false);
          return;
        }

        // Les pages publiques ne nécessitent pas de connexion.
        if (isPublicPage(pathname)) {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Les autres pages restent accessibles uniquement aux membres
        // connectés et approuvés.
        if (error || !user) {
          window.location.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("status, role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (profileError || !profile || profile.status !== "approved") {
          window.location.replace("/waiting");
          return;
        }

        // Une demande de film reste réservée aux membres connectés.
        if (pathname === "/demande-film") {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Autorisation des pages protégées.
        if (isProtectedPage(pathname)) {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Les autres pages conservent le comportement normal :
        // membre connecté et approuvé.
        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error("Erreur de vérification des accès :", error);

        if (cancelled) return;

        if (MAINTENANCE_MODE) {
          setMaintenance(true);
          setLoading(false);
        } else if (isPublicPage(pathname)) {
          setAuthorized(true);
          setLoading(false);
        } else {
          window.location.replace("/login");
        }
      }
    }

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080d18",
          color: "#60a5fa",
          fontSize: "16px",
        }}
      >
        Chargement...
      </div>
    );
  }

  if (maintenance) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background:
            "radial-gradient(ellipse at top, #142b4b 0%, #080d18 65%)",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "620px",
            padding: "32px 26px",
            border: "1px solid rgba(96, 165, 250, 0.45)",
            borderRadius: "16px",
            background: "rgba(15, 23, 42, 0.96)",
            boxShadow: "0 0 40px rgba(37, 99, 235, 0.18)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "42px", marginBottom: "16px" }}>
            🎬
          </div>

          <h1
            style={{
              margin: "0 0 22px",
              color: "#60a5fa",
              fontSize: "clamp(22px, 4vw, 30px)",
              lineHeight: 1.35,
              fontWeight: 800,
            }}
          >
            CineZone Play prépare son ouverture au public !
          </h1>

          <p
            style={{
              margin: 0,
              color: "#e2e8f0",
              fontSize: "16px",
              lineHeight: 1.8,
            }}
          >
            Nous travaillons actuellement à la conversion du site vers
            un nouveau système de streaming avec lecture directement
            intégrée au lecteur vidéo. Le site sera prochainement
            accessible librement, sans inscription pour regarder
            les films disponibles.
          </p>

          <div
            style={{
              marginTop: "26px",
              paddingTop: "18px",
              borderTop: "1px solid rgba(148, 163, 184, 0.2)",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            Merci de votre patience et à très bientôt sur CineZone Play.
          </div>
        </section>
      </main>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
