"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const publicPages = [
        "/login",
        "/register",
        "/waiting",
        "/forgot-password",
        "/reset-password",
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

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("status, role")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        router.push("/waiting");
        return;
      }

      if (profile.status !== "approved") {
        router.push("/waiting");
        return;
      }

      setAllowed(true);
    }

    setAllowed(false);
    checkUser();
  }, [pathname, router]);

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
        }}
      >
        Chargement...
      </main>
    );
  }

  return <>{children}</>;
}
