"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, avatar")
        .eq("id", data.user.id)
        .single();

      setProfile({
        username: profileData?.username || data.user.email,
        avatar: profileData?.avatar,
      });
    };

    getProfile();
  }, []);

  // fermer si clic extérieur
  useEffect(() => {
    const handleClick = (e: any) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  if (!profile) return null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* bouton */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
        }}
      >
        <img
          src={profile.avatar || "/default-avatar.png"}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
          }}
        />

        <span style={{ fontWeight: "bold" }}>
          {profile.username}
        </span>
      </div>

      {/* menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "45px",
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "10px",
            width: "180px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          <button style={itemStyle}>👤 Profil</button>
          <button style={itemStyle}>✏️ Modifier</button>
          <button
            style={itemStyle}
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

const itemStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  background: "transparent",
  border: "none",
  color: "#fff",
  textAlign: "left",
  cursor: "pointer",
  borderRadius: "8px",
};
