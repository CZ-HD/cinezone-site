"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/Boss.png";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [uploading, setUploading] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    setUser(data.user);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("username, avatar, role")
      .eq("id", data.user.id)
      .maybeSingle();

    const fixedProfile = {
      username: profileData?.username || data.user.email,
      avatar: profileData?.avatar || DEFAULT_AVATAR,
      role: profileData?.role || "user",
    };

    setProfile(fixedProfile);
    setUsername(fixedProfile.username);
  };

  const saveProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: username || user.email,
      })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadUser();
    setShowEdit(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;

    try {
      setUploading(true);

      const file = e.target.files[0];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error } = await supabase
        .from("profiles")
        .update({ avatar: data.publicUrl })
        .eq("id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      await loadUser();
    } finally {
      setUploading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (!user || !profile) return null;

  return (
    <>
      <div ref={ref} style={{ position: "relative" }}>
        <button onClick={() => setOpen(!open)} style={userBtn}>
          <img src={profile.avatar || DEFAULT_AVATAR} alt="avatar" style={avatar} />
          <span>{profile.username}</span>
          <span>▾</span>
        </button>

        {open && (
          <div style={dropdown}>
            <button
              style={itemBtn}
              onClick={() => {
                setShowProfile(true);
                setOpen(false);
              }}
            >
              👤 Profil
            </button>

            <button
              style={itemBtn}
              onClick={() => {
                setShowEdit(true);
                setOpen(false);
              }}
            >
              🖊️ Modifier
            </button>

            <button style={logoutBtn} onClick={logout}>
              🚪 Déconnexion
            </button>
          </div>
        )}
      </div>

      {showProfile && (
        <div style={overlay}>
          <div style={modal}>
            <button style={closeBtn} onClick={() => setShowProfile(false)}>
              ✕
            </button>

            <h2 style={modalTitle}>👤 Mon profil</h2>

            <div style={profileCard}>
              <img src={profile.avatar || DEFAULT_AVATAR} style={bigAvatar} />

              <div>
                <h3 style={{ margin: "0 0 6px" }}>{profile.username}</h3>
                <p style={muted}>{user.email}</p>

                <span style={profile.role === "admin" ? adminBadge : userBadge}>
                  {profile.role === "admin" ? "ADMIN" : "USER"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEdit && (
        <div style={overlay}>
          <div style={modal}>
            <button style={closeBtn} onClick={() => setShowEdit(false)}>
              ✕
            </button>

            <h2 style={modalTitle}>🖊️ Modifier mon profil</h2>

            <div style={editGrid}>
              <div>
                <img src={profile.avatar || DEFAULT_AVATAR} style={bigAvatar} />

                <label style={uploadBtn}>
                  📷 Changer avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    style={{ display: "none" }}
                  />
                </label>

                {uploading && <p style={{ color: "#00c6ff" }}>Upload...</p>}
              </div>

              <div>
                <label style={labelStyle}>Pseudo</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle}
                />

                <button onClick={saveProfile} style={saveBtn}>
                  💾 Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const userBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  color: "#fff",
  padding: "8px 13px",
  borderRadius: "999px",
  border: "1px solid rgba(0,198,255,0.35)",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.18), rgba(6,20,40,0.8))",
  cursor: "pointer",
  fontWeight: 900,
  boxShadow: "0 0 18px rgba(0,198,255,0.18)",
};

const avatar: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "1px solid rgba(0,198,255,0.7)",
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "50px",
  right: 0,
  minWidth: "210px",
  padding: "10px",
  borderRadius: "16px",
  background: "rgba(8,13,22,0.98)",
  border: "1px solid rgba(0,198,255,0.25)",
  boxShadow: "0 22px 70px rgba(0,0,0,0.85)",
  zIndex: 9999,
};

const itemBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "12px",
  background: "transparent",
  color: "#fff",
  textAlign: "left",
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "15px",
};

const logoutBtn: React.CSSProperties = {
  ...itemBtn,
  color: "#ffb3b3",
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.72)",
  zIndex: 99999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal: React.CSSProperties = {
  width: "620px",
  maxWidth: "92vw",
  padding: "26px",
  borderRadius: "22px",
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(8,13,22,0.98))",
  border: "1px solid rgba(0,198,255,0.25)",
  color: "#fff",
  position: "relative",
  boxShadow: "0 30px 90px rgba(0,0,0,0.85)",
};

const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: "14px",
  right: "14px",
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: "22px",
  cursor: "pointer",
};

const modalTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: "22px",
};

const profileCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "22px",
};

const editGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  gap: "26px",
  alignItems: "center",
};

const bigAvatar: React.CSSProperties = {
  width: "150px",
  height: "150px",
  borderRadius: "50%",
  objectFit: "cover",
  display: "block",
  boxShadow: "0 0 28px rgba(0,198,255,0.25)",
  border: "2px solid rgba(0,198,255,0.25)",
};

const muted: React.CSSProperties = {
  color: "#9ca3af",
  margin: "0 0 12px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  color: "#cbd5e1",
  fontWeight: 800,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "#0b0f18",
  color: "#fff",
  fontSize: "16px",
  boxSizing: "border-box",
};

const uploadBtn: React.CSSProperties = {
  display: "inline-block",
  marginTop: "14px",
  padding: "10px 12px",
  borderRadius: "12px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.35)",
  cursor: "pointer",
  fontWeight: 900,
};

const saveBtn: React.CSSProperties = {
  marginTop: "18px",
  padding: "13px 18px",
  borderRadius: "13px",
  border: "none",
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const userBadge: React.CSSProperties = {
  display: "inline-block",
  background: "#3b82f6",
  color: "#fff",
  padding: "4px 9px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 900,
};

const adminBadge: React.CSSProperties = {
  display: "inline-block",
  background: "linear-gradient(135deg, #ffe58a, #ffb300)",
  color: "#000",
  padding: "4px 9px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 900,
};
