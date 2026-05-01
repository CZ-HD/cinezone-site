"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/Boss.png";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
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

    const newUsername = username || user.email;

    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    setProfile((prev: any) => ({
      ...prev,
      username: newUsername,
    }));

    setEditing(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;

    try {
      setUploading(true);

      const file = e.target.files[0];
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const newAvatar = data.publicUrl;

      const { error } = await supabase
        .from("profiles")
        .update({ avatar: newAvatar })
        .eq("id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      setProfile((prev: any) => ({
        ...prev,
        avatar: newAvatar,
      }));
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
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={userBtn}>
        <img src={profile.avatar || DEFAULT_AVATAR} alt="avatar" style={avatarSmall} />
        <span>{profile.username}</span>
        <span>▾</span>
      </button>

      {open && (
        <div style={dropdown}>
          <div style={profileTop}>
            <img src={profile.avatar || DEFAULT_AVATAR} alt="avatar" style={avatarBig} />

            <div>
              <strong>{profile.username}</strong>
              <p style={muted}>{user.email}</p>

              <span style={profile.role === "admin" ? adminBadge : userBadge}>
                {profile.role === "admin" ? "ADMIN" : "USER"}
              </span>
            </div>
          </div>

          {!editing ? (
            <>
              <button style={itemBtn} onClick={() => setEditing(true)}>
                🖊️ Modifier profil
              </button>

              <button style={logoutBtn} onClick={logout}>
                🚪 Déconnexion
              </button>
            </>
          ) : (
            <div style={editBox}>
              <label style={labelStyle}>Avatar</label>

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

              <label style={labelStyle}>Pseudo</label>

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
              />

              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button onClick={saveProfile} style={saveBtn}>
                  💾 Sauvegarder
                </button>

                <button onClick={() => setEditing(false)} style={cancelBtn}>
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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
};

const avatarSmall: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  objectFit: "cover",
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "52px",
  right: 0,
  width: "340px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(8,13,22,0.98)",
  border: "1px solid rgba(0,198,255,0.3)",
  boxShadow: "0 22px 70px rgba(0,0,0,0.85)",
  zIndex: 999999,
};

const profileTop: React.CSSProperties = {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  paddingBottom: "14px",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  marginBottom: "12px",
};

const avatarBig: React.CSSProperties = {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  objectFit: "cover",
};

const muted: React.CSSProperties = {
  color: "#9ca3af",
  margin: "4px 0 8px",
  fontSize: "13px",
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
};

const logoutBtn: React.CSSProperties = {
  ...itemBtn,
  color: "#ffb3b3",
};

const editBox: React.CSSProperties = {
  display: "grid",
  gap: "8px",
};

const labelStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontWeight: 800,
  fontSize: "13px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "#0b0f18",
  color: "#fff",
  boxSizing: "border-box",
};

const uploadBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 12px",
  borderRadius: "12px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.35)",
  cursor: "pointer",
  fontWeight: 900,
};

const saveBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const cancelBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const userBadge: React.CSSProperties = {
  display: "inline-block",
  background: "#3b82f6",
  color: "#fff",
  padding: "3px 8px",
  borderRadius: "999px",
  fontSize: "10px",
  fontWeight: 900,
};

const adminBadge: React.CSSProperties = {
  display: "inline-block",
  background: "linear-gradient(135deg, #ffe58a, #ffb300)",
  color: "#000",
  padding: "3px 8px",
  borderRadius: "999px",
  fontSize: "10px",
  fontWeight: 900,
};
