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
          </div>
        )}
      </div>

      {showProfile && (
        <div style={overlay}>
          <div style={modal}>
            <button style={closeBtn} onClick={() => setShowProfile(false)}>
              ✕
            </button>

            <h2>👤 Profil</h2>

            <img src={profile.avatar || DEFAULT_AVATAR} style={bigAvatar} />

            <h3>{profile.username}</h3>
            <p style={{ color: "#9ca3af" }}>{user.email}</p>
            <p>Rôle : {profile.role}</p>
          </div>
        </div>
      )}

      {showEdit && (
        <div style={overlay}>
          <div style={modal}>
            <button style={closeBtn} onClick={() => setShowEdit(false)}>
              ✕
            </button>

            <h2>🖊️ Modifier mon profil</h2>

            <img src={profile.avatar || DEFAULT_AVATAR} style={bigAvatar} />

            <label style={labelStyle}>Avatar</label>
            <input type="file" accept="image/*" onChange={uploadAvatar} />
            {uploading && <p style={{ color: "#00c6ff" }}>Upload...</p>}

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
      )}
    </>
  );
}

const userBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(0,198,255,0.28)",
  background: "rgba(0,198,255,0.12)",
  cursor: "pointer",
  fontWeight: 800,
};

const avatar: React.CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  objectFit: "cover",
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "48px",
  right: 0,
  minWidth: "180px",
  padding: "10px",
  borderRadius: "14px",
  background: "#111827",
  border: "1px solid rgba(255,255,255,0.12)",
  zIndex: 9999,
};

const itemBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "none",
  background: "transparent",
  color: "#fff",
  textAlign: "left",
  cursor: "pointer",
  fontWeight: 800,
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
  width: "520px",
  maxWidth: "92vw",
  padding: "24px",
  borderRadius: "18px",
  background: "#111827",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#fff",
  position: "relative",
};

const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: "14px",
  right: "14px",
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: "20px",
  cursor: "pointer",
};

const bigAvatar: React.CSSProperties = {
  width: "130px",
  height: "130px",
  borderRadius: "50%",
  objectFit: "cover",
  display: "block",
  margin: "18px auto",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginTop: "14px",
  marginBottom: "6px",
  color: "#cbd5e1",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "#0b0f18",
  color: "#fff",
};

const saveBtn: React.CSSProperties = {
  marginTop: "18px",
  padding: "12px 18px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
