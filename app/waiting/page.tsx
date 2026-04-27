"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function WaitingPage() {
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

      if (profile?.status === "approved") {
        router.push("/");
      }
    }

    check();
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Compte en attente</h1>
        <p>Ton compte doit être validé par l’administrateur.</p>
      </div>
    </main>
  );
}