"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

const MAINTENANCE_MODE = true;

const ADMIN_ROLES = [
  "admin",
  "administrator",
  "administrateur",
  "founder",
  "owner",
];

const PUBLIC_PAGES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/contact",
  "/actualites",
  "/films",
  "/sagas",
  "/series",
  "/tv",
  "/movie",
  "/player",
  "/downloads",
  "/download",
  "/soutenir",
  "/chat",
];

const PROTECTED_PREFIXES = [
  "/compte",
  "/profil",
  "/notifications",
  "/demande-film",
  "/favoris",
  "/perso",
  "/waiting",
];

function isPublicPage(pathname: string) {
  return (
    PUBLIC_PAGES.includes(pathname) ||
    pathname.startsWith("/films/") ||
    pathname.startsWith("/sagas/") ||
    pathname.startsWith("/series/") ||
    pathname.startsWith("/tv/") ||
    pathname.startsWith("/movie/") ||
    pathname.startsWith("/player/") ||
    pathname.startsWith("/downloads/") ||
    pathname.startsWith("/download/") ||
    pathname.startsWith("/actualites/")
  );
}

function isProtectedPage(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`)
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

  const checkAccess = useCallback(async () => {
    setLoading(true);
    setMaintenance(false);
    setAuthorized(false);

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      const normalizedEmail = user?.email?.trim().toLowerCase();

      const isCreator =
        !error &&
        !!normalizedEmail &&
        CREATOR_EMAILS.some(
          (email) => email.trim().toLowerCase() === normalizedEmail
        );

      // Les deux fondateurs ont toujours accès au site.
      if (isCreator) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // Pendant la maintenance, vérifier les administrateurs.
      if (MAINTENANCE_MODE) {
        if (!error && user) {
          const {
            data: profile,
            error: profileError,
          } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          const role = String(profile?.role ?? "")
            .trim()
            .toLowerCase();

          if (
            !profileError &&
            profile &&
            ADMIN_ROLES.includes(role)
          ) {
            setAuthorized(true);
            setLoading(false);
            return;
          }
        }

        // Autoriser la page de connexion pour permettre
        // aux fondateurs de se connecter pendant la maintenance.
        if (pathname === "/login") {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Les visiteurs et membres ordinaires restent bloqués.
        setMaintenance(true);
        setLoading(false);
        return;
      }

      // Fonctionnement normal lorsque la maintenance est désactivée.
      if (isPublicPage(pathname)) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      if (error || !user) {
        window.location.replace("/login");
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("status, role")
        .eq("id", user.id)
        .maybeSingle();

      if (
        profileError ||
        !profile ||
        profile.status !== "approved"
      ) {
        window.location.replace("/waiting");
        return;
      }

      setAuthorized(true);
      setLoading(false);
    } catch (error) {
      console.error("Erreur de vérification des accès :", error);

      if (MAINTENANCE_MODE && pathname !== "/login") {
        setMaintenance(true);
        setLoading(false);
        return;
      }

      if (MAINTENANCE_MODE && pathname === "/login") {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      if (isPublicPage(pathname)) {
        setAuthorized(true);
        setLoading(false);
      } else {
        window.location.replace("/login");
      }
    }
  }, [pathname]);

  useEffect(() => {
    let active = true;

    const runCheck = async () => {
      if (active) {
        await checkAccess();
      }
    };

    void runCheck();

    // Recontrôler les droits après une connexion ou déconnexion.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // Revalider les droits lors d'une vraie connexion/déconnexion.
      // TOKEN_REFRESHED renouvelle seulement le jeton : relancer checkAccess()
      // ici masquait toute la page avec « Chargement… » à chaque renouvellement.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setTimeout(() => {
          if (active) {
            void checkAccess();
          }
        }, 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [checkAccess]);

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
            Nous travaillons actuellement à la conversion du
            site vers un nouveau système de streaming avec
            lecture directement intégrée au lecteur vidéo.
            Le site sera prochainement accessible librement,
            sans inscription pour regarder les films disponibles.
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
            Merci de votre patience et à très bientôt sur
            CineZone Play.
          </div>
        </section>
      </main>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}
