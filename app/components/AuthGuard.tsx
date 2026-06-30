"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

// ✅ Activer / désactiver la maintenance ici
const MAINTENANCE_MODE = true;

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    async function checkUser() {
      setAllowed(false);

      const publicPages = [
  "/login",
  "/register",
  "/waiting",
  "/forgot-password",
  "/reset-password",
  "/contact",
];

      if (publicPages.includes(pathname)) {
        setAllowed(true);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // ✅ Les créateurs passent toujours
      if (user.email && CREATOR_EMAILS.includes(user.email)) {
        setAllowed(true);
        return;
      }

      // ✅ Maintenance pour les membres
      if (MAINTENANCE_MODE) {
        setMaintenance(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("status, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        router.push("/waiting");
        return;
      }

      if (profile.status !== "approved") {
        router.push("/waiting");
        return;
      }

      setAllowed(true);
    }

    checkUser();
  }, [pathname, router]);

  // ✅ PAGE MAINTENANCE
  if (maintenance) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(0,120,255,0.25), #000 60%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "30px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            padding: "50px",
            borderRadius: "30px",
            background: "rgba(10,15,25,0.72)",
            border: "1px solid rgba(0,198,255,0.18)",
            backdropFilter: "blur(18px)",
            boxShadow:
              "0 0 45px rgba(0,120,255,0.15), 0 25px 80px rgba(0,0,0,0.75)",
          }}
        >
          <div
            style={{
              fontSize: "75px",
              marginBottom: "20px",
            }}
          >
            🚧
          </div>

          <h1
            style={{
              fontSize: "52px",
              marginBottom: "18px",
              fontWeight: 900,
              background:
                "linear-gradient(135deg,#fff,#67e8f9,#00c6ff,#0072ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CineZone HD évolue
          </h1>

          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.8,
              color: "#cbd5e1",
            }}
          >
            Le site est actuellement en maintenance afin de préparer une
            nouvelle expérience plus moderne, immersive et communautaire.
          </p>

          <div
            style={{
              marginTop: "35px",
              height: "12px",
              borderRadius: "999px",
              overflow: "hidden",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: "72%",
                height: "100%",
                background:
                  "linear-gradient(90deg,#00c6ff,#0072ff,#3a00ff)",
                boxShadow: "0 0 25px rgba(0,120,255,0.6)",
              }}
            />
          </div>

          <p
            style={{
              marginTop: "28px",
              color: "#67e8f9",
              fontWeight: 900,
              fontSize: "17px",
            }}
          >
            Merci de votre patience 💙
          </p>
        </div>
      </main>
    );
  }

  // ✅ Chargement
  if (!allowed) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        Chargement...
      </main>
    );
  }

  return <>{children}</>;
}
