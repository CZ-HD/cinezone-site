"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/Boss.png";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

type Message = {
  id: string;
  user_id: string;
  email: string;
  username?: string;
  avatar?: string;
  role?: string;
  role_color?: string;
  status_text?: string;
  content: string;
  created_at: string;
};

type Profile = {
  username?: string;
  avatar?: string;
  role?: string;
  role_color?: string;
  status_text?: string;
};

type Reaction = {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [reactionPulse, setReactionPulse] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [showProfile, setShowProfile] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editStatus, setEditStatus] = useState("🟢 En ligne");
  const [uploading, setUploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setUser(data.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, avatar, role, role_color, status_text")
        .eq("id", data.user.id)
        .single();

      const fixedProfile = {
        username: profileData?.username || data.user.email,
        avatar: profileData?.avatar || DEFAULT_AVATAR,
        role: profileData?.role || "user",
        role_color: profileData?.role_color || "#00c6ff",
        status_text: profileData?.status_text || "🟢 En ligne",
      };

      setProfile(fixedProfile);
      setEditUsername(fixedProfile.username);
      setEditStatus(fixedProfile.status_text);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      setMessages(msgs || []);

      const { data: reacts } = await supabase
        .from("message_reactions")
        .select("*");

      setReactions(reacts || []);
      setLoading(false);
    }

    init();

    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          const deleted = payload.old as Message;
          setMessages((prev) => prev.filter((m) => m.id !== deleted.id));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message_reactions" },
        (payload) => {
          const newReaction = payload.new as Reaction;

          setReactions((prev) => {
            const withoutTemp = prev.filter(
              (r) =>
                !(
                  r.id.startsWith("temp-") &&
                  r.message_id === newReaction.message_id &&
                  r.user_id === newReaction.user_id &&
                  r.emoji === newReaction.emoji
                )
            );

            const alreadyExists = withoutTemp.some(
              (r) => r.id === newReaction.id
            );

            if (alreadyExists) return withoutTemp;

            return [...withoutTemp, newReaction];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "message_reactions" },
        (payload) => {
          const deleted = payload.old as Reaction;
          setReactions((prev) => prev.filter((r) => r.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!user || !profile) return;

    const presenceChannel = supabase.channel("online-chat", {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(Object.keys(state));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: user.id,
            username: profile.username,
            avatar: profile.avatar,
            role: profile.role,
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user, profile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, reactions]);

  const isAdmin = profile?.role === "admin";

  const saveProfile = async () => {
    if (!user) return;

    let safeStatus = editStatus;

    if (!isAdmin && editStatus === "👑 Admin disponible") {
      safeStatus = "🟢 En ligne";
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: editUsername || user.email,
        status_text: safeStatus || "🟢 En ligne",
      })
      .eq("id", user.id);

    if (error) {
      alert("Erreur sauvegarde : " + error.message);
      return;
    }

    setProfile((prev) => ({
      ...prev,
      username: editUsername || user.email,
      status_text: safeStatus || "🟢 En ligne",
    }));

    setShowProfile(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;

    try {
      setUploading(true);

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        alert("Erreur upload avatar : " + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error } = await supabase
        .from("profiles")
        .update({ avatar: publicUrl })
        .eq("id", user.id);

      if (error) {
        alert("Erreur sauvegarde avatar : " + error.message);
        return;
      }

      setProfile((prev) => ({
        ...prev,
        avatar: publicUrl,
      }));
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    const message = text.trim();
    setText("");

    const { data: freshProfile } = await supabase
      .from("profiles")
      .select("username, avatar, role, role_color, status_text")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("messages").insert({
      user_id: user.id,
      email: user.email,
      username: freshProfile?.username || user.email,
      avatar: freshProfile?.avatar || DEFAULT_AVATAR,
      role: freshProfile?.role || "user",
      role_color: freshProfile?.role_color || "#00c6ff",
      status_text: freshProfile?.status_text || "🟢 En ligne",
      content: message,
    });

    if (error) {
      alert("Erreur message : " + error.message);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    const pulseKey = `${messageId}-${emoji}`;
    setReactionPulse(pulseKey);
    setTimeout(() => setReactionPulse(null), 220);

    const existing = reactions.find(
      (r) =>
        r.message_id === messageId &&
        r.user_id === user.id &&
        r.emoji === emoji
    );

    if (existing) {
      setReactions((prev) => prev.filter((r) => r.id !== existing.id));

      const { error } = await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        alert("Erreur réaction : " + error.message);
      }

      return;
    }

    const tempReaction: Reaction = {
      id: `temp-${Date.now()}`,
      message_id: messageId,
      user_id: user.id,
      emoji,
      created_at: new Date().toISOString(),
    };

    setReactions((prev) => [...prev, tempReaction]);

    const { error } = await supabase.from("message_reactions").insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    });

    if (error) {
      alert("Erreur réaction : " + error.message);
      setReactions((prev) => prev.filter((r) => r.id !== tempReaction.id));
    }
  };

  const getMessageReactions = (messageId: string) => {
    return reactions.filter((r) => r.message_id === messageId);
  };

  const deleteMessage = async (messageId: string) => {
    if (!isAdmin) return;
    if (!confirm("Supprimer ce message ?")) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      alert("Erreur suppression : " + error.message);
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <p>Chargement du chat...</p>
      </main>
    );
  }

  const displayName = profile?.username || user?.email || "Utilisateur";
  const avatarUrl = profile?.avatar || DEFAULT_AVATAR;
  const realOnline = onlineUsers.includes(user?.id);

  return (
    <main style={pageStyle}>
      <div style={chatBox}>
        <div style={headerStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <h1 style={{ margin: 0 }}>💬 Chat CineZone</h1>

            <button
              onClick={() => setShowProfile(!showProfile)}
              style={profileBtn}
            >
              ⚙️ Mon profil
            </button>
          </div>

          <div style={connectedBox}>
            <div style={avatarWrap}>
              <img src={avatarUrl} alt="avatar" style={avatarSmall} />
              <span
                style={{
                  ...onlineDot,
                  background: realOnline ? "#4cff9b" : "#ff5c5c",
                }}
              />
            </div>

            <div>
              <p style={{ margin: 0, color: "#fff", fontWeight: "bold" }}>
                Connecté :{" "}
                <span
                  style={{
                    color: isAdmin ? "gold" : profile?.role_color || "#00c6ff",
                  }}
                >
                  {displayName}
                </span>
                {isAdmin && <span style={adminBadge}>ADMIN</span>}
              </p>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#4cff9b",
                  fontSize: "13px",
                }}
              >
                {profile?.status_text || "🟢 En ligne"}
              </p>
            </div>
          </div>

          {showProfile && (
            <div style={profileBox}>
              <h3 style={{ marginTop: 0 }}>Modifier mon profil</h3>

              <label>Pseudo</label>
              <input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                style={inputStyle}
                placeholder="Ton pseudo"
              />

              <label>Avatar</label>
              <input type="file" accept="image/*" onChange={uploadAvatar} />
              {uploading && <p style={{ color: "#00c6ff" }}>Upload...</p>}

              <label>Statut</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="🟢 En ligne">🟢 En ligne</option>
                <option value="🔴 Hors ligne">🔴 Hors ligne</option>
                <option value="⛔ Occupé">⛔ Occupé</option>
                <option value="🎬 Je regarde un film">
                  🎬 Je regarde un film
                </option>
                {isAdmin && (
                  <option value="👑 Admin disponible">
                    👑 Admin disponible
                  </option>
                )}
              </select>

              <button onClick={saveProfile} style={btnStyle}>
                💾 Sauvegarder
              </button>
            </div>
          )}
        </div>

        <div style={messagesBox}>
          {messages.length === 0 ? (
            <p style={{ color: "#888", textAlign: "center" }}>
              Aucun message pour le moment.
            </p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === user?.id;
              const name = isMe
                ? displayName
                : msg.username || msg.email || "Utilisateur";
              const msgAvatar = isMe ? avatarUrl : msg.avatar || DEFAULT_AVATAR;
              const userIsOnline = onlineUsers.includes(msg.user_id);
              const nameColor =
                msg.role === "admin" ? "gold" : msg.role_color || "#dbeafe";
              const msgReactions = getMessageReactions(msg.id);

              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    marginBottom: "16px",
                    animation: "fadeIn 0.25s ease",
                  }}
                >
                  <div style={isMe ? myMessageBox : otherMessageBox}>
                    <div style={messageHeader}>
                      <div style={avatarWrapSmall}>
                        <img src={msgAvatar} alt="avatar" style={avatarMsg} />
                        <span
                          style={{
                            ...onlineDotSmall,
                            background: userIsOnline ? "#4cff9b" : "#ff5c5c",
                          }}
                        />
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: isMe ? "#fff" : nameColor,
                            fontWeight: 900,
                          }}
                        >
                          {name}
                          {msg.role === "admin" && (
                            <span style={adminBadge}>ADMIN</span>
                          )}
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: userIsOnline ? "#4cff9b" : "#ff7777",
                          }}
                        >
                          {userIsOnline ? "🟢 En ligne" : "🔴 Hors ligne"}
                        </div>
                      </div>
                    </div>

                    <div style={messageText}>{msg.content}</div>

                    <div style={reactionRow}>
                      {REACTION_EMOJIS.map((emoji) => {
                        const count = msgReactions.filter(
                          (r) => r.emoji === emoji
                        ).length;

                        const active = msgReactions.some(
                          (r) => r.emoji === emoji && r.user_id === user?.id
                        );

                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => toggleReaction(msg.id, emoji)}
                            style={{
                              ...reactionBtn,
                              ...(active ? reactionBtnActive : {}),
                              transform:
  reactionPulse === `${msg.id}-${emoji}`
    ? "scale(1.55) rotate(-8deg)"
    : active
    ? "scale(1.15)"
    : "scale(1)",
filter:
  reactionPulse === `${msg.id}-${emoji}`
    ? "drop-shadow(0 0 14px #00c6ff)"
    : "none",
                            }}
                          >
                            <span
                              style={
                                active ? reactionEmojiActive : reactionEmoji
                              }
                            >
                              {emoji}
                            </span>
                            {count > 0 && (
                              <span style={reactionCount}>{count}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        style={deleteBtn}
                      >
                        🗑 Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        <div style={inputBox}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Écris ton message..."
            style={inputStyle}
          />

          <button onClick={sendMessage} style={btnStyle}>
            Envoyer
          </button>
        </div>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, rgba(0,120,255,0.22), #000 60%)",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  fontFamily: "Arial, sans-serif",
};

const chatBox: React.CSSProperties = {
  width: "100%",
  maxWidth: "900px",
  height: "78vh",
  background: "rgba(8,13,22,0.92)",
  border: "1px solid rgba(0,198,255,0.26)",
  borderRadius: "24px",
  boxShadow: "0 25px 80px rgba(0,0,0,0.78)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  padding: "20px",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.16), rgba(255,215,100,0.06))",
};

const connectedBox: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  marginTop: "12px",
};

const avatarWrap: React.CSSProperties = {
  position: "relative",
  width: "50px",
  height: "50px",
};

const avatarSmall: React.CSSProperties = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.8)",
  boxShadow: "0 0 18px rgba(0,198,255,0.65)",
};

const onlineDot: React.CSSProperties = {
  position: "absolute",
  right: "1px",
  bottom: "1px",
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  border: "2px solid #07111f",
};

const profileBox: React.CSSProperties = {
  marginTop: "18px",
  padding: "16px",
  borderRadius: "16px",
  background: "rgba(0,0,0,0.42)",
  border: "1px solid rgba(255,255,255,0.12)",
  display: "grid",
  gap: "10px",
};

const messagesBox: React.CSSProperties = {
  flex: 1,
  padding: "22px",
  overflowY: "auto",
};

const messageHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const avatarWrapSmall: React.CSSProperties = {
  position: "relative",
  width: "38px",
  height: "38px",
};

const avatarMsg: React.CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.75)",
  boxShadow: "0 0 14px rgba(0,198,255,0.5)",
};

const onlineDotSmall: React.CSSProperties = {
  position: "absolute",
  right: "-1px",
  bottom: "-1px",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  border: "2px solid #07111f",
};

const myMessageBox: React.CSSProperties = {
  maxWidth: "78%",
  padding: "14px 16px",
  borderRadius: "20px 20px 5px 20px",
  background:
    "linear-gradient(135deg, rgba(0,150,255,0.95), rgba(0,85,210,0.95))",
  border: "1px solid rgba(130,220,255,0.55)",
  boxShadow: "0 0 26px rgba(0,140,255,0.35)",
  color: "#fff",
};

const otherMessageBox: React.CSSProperties = {
  maxWidth: "78%",
  padding: "14px 16px",
  borderRadius: "20px 20px 20px 5px",
  background: "rgba(18,26,40,0.95)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
  color: "#f2f7ff",
};

const messageText: React.CSSProperties = {
  marginTop: "10px",
  lineHeight: 1.55,
  fontSize: "15px",
  color: "#fff",
  wordBreak: "break-word",
};

const reactionRow: React.CSSProperties = {
  display: "flex",
  gap: "7px",
  marginTop: "12px",
  flexWrap: "wrap",
};

const reactionBtn: React.CSSProperties = {
  minWidth: "36px",
  height: "30px",
  padding: "4px 9px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px",
  transition: "all 0.18s ease",
  position: "relative",
  zIndex: 10,
};

const reactionBtnActive: React.CSSProperties = {
  background: "rgba(0,198,255,0.2)",
  border: "1px solid rgba(0,198,255,0.75)",
  boxShadow: "0 0 16px rgba(0,198,255,0.55)",
};

const reactionEmoji: React.CSSProperties = {
  fontSize: "15px",
};

const reactionEmojiActive: React.CSSProperties = {
  fontSize: "17px",
  filter: "drop-shadow(0 0 8px rgba(0,198,255,0.9))",
};

const reactionCount: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 900,
  color: "#dbeafe",
};

const adminBadge: React.CSSProperties = {
  color: "#000",
  background: "linear-gradient(135deg, #ffe58a, #ffb300)",
  fontSize: "10px",
  fontWeight: 900,
  marginLeft: "7px",
  padding: "3px 7px",
  borderRadius: "999px",
  boxShadow: "0 0 12px rgba(255,215,100,0.55)",
};

const deleteBtn: React.CSSProperties = {
  marginTop: "12px",
  background: "rgba(255,70,70,0.16)",
  color: "#ffb3b3",
  border: "1px solid rgba(255,90,90,0.45)",
  borderRadius: "10px",
  padding: "7px 10px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
};

const inputBox: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  padding: "16px",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(0,0,0,0.4)",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
};

const btnStyle: React.CSSProperties = {
  padding: "14px 20px",
  borderRadius: "14px",
  border: "none",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
  boxShadow: "0 10px 30px rgba(0,114,255,0.35)",
};

const profileBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(0,198,255,0.35)",
  color: "#fff",
  background: "rgba(0,198,255,0.12)",
  fontWeight: "bold",
  cursor: "pointer",
};
