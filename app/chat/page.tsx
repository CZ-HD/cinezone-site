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
  pinned?: boolean;
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

type OnlineMember = {
  user_id: string;
  username?: string;
  avatar?: string;
  role?: string;
  status_text?: string;
};

type TypingUser = {
  user_id: string;
  username: string;
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
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<Record<string, any>>({});

  const playNotificationSound = () => {
    if (!soundEnabled) return;

    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.05;

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch {}
  };

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
          const newMessage = payload.new as Message;

          setMessages((prev) => [...prev, newMessage]);

          if (newMessage.user_id !== user?.id) {
            setHasNewMessage(true);
            playNotificationSound();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
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

            if (withoutTemp.some((r) => r.id === newReaction.id)) {
              return withoutTemp;
            }

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
  }, [soundEnabled, user?.id]);

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

        const members = Object.values(state)
          .flat()
          .map((item: any) => ({
            user_id: item.user_id,
            username: item.username,
            avatar: item.avatar,
            role: item.role,
            status_text: item.status_text,
          }));

        const uniqueMembers = members.filter(
          (member, index, self) =>
            index === self.findIndex((m) => m.user_id === member.user_id)
        );

        setOnlineMembers(uniqueMembers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: user.id,
            username: profile.username,
            avatar: profile.avatar,
            role: profile.role,
            status_text: profile.status_text || "🟢 En ligne",
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user, profile]);

  useEffect(() => {
    if (!user || !profile) return;

    const typingChannel = supabase.channel("typing-room");

    typingChannel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (!payload?.user_id || payload.user_id === user.id) return;

        setTypingUsers((prev) => {
          const exists = prev.some((u) => u.user_id === payload.user_id);
          if (exists) return prev;

          return [
            ...prev,
            {
              user_id: payload.user_id,
              username: payload.username || "Quelqu’un",
            },
          ];
        });

        clearTimeout(typingTimeoutRef.current[payload.user_id]);

        typingTimeoutRef.current[payload.user_id] = setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter((u) => u.user_id !== payload.user_id)
          );
        }, 1800);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [user, profile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setHasNewMessage(false);
  }, [messages.length]);

  const onlineUserIds = onlineMembers.map((member) => member.user_id);
  const isAdmin = profile?.role === "admin";
  const pinnedMessage = messages.find((m) => m.pinned);

  const sendTyping = async () => {
    if (!user || !profile) return;

    await supabase.channel("typing-room").send({
      type: "broadcast",
      event: "typing",
      payload: {
        user_id: user.id,
        username: profile.username || user.email || "Quelqu’un",
      },
    });
  };

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
      pinned: false,
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

      if (error) alert("Erreur réaction : " + error.message);
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

  const togglePin = async (messageId: string) => {
    if (!isAdmin) return;

    const target = messages.find((m) => m.id === messageId);
    if (!target) return;

    const shouldPin = !target.pinned;

    if (shouldPin) {
      await supabase
        .from("messages")
        .update({ pinned: false })
        .neq("id", messageId);
    }

    const { error } = await supabase
      .from("messages")
      .update({ pinned: shouldPin })
      .eq("id", messageId);

    if (error) alert("Erreur épinglage : " + error.message);
  };

  const deleteMessage = async (messageId: string) => {
    if (!isAdmin) return;
    if (!confirm("Supprimer ce message ?")) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) alert("Erreur suppression : " + error.message);
  };

  const getMessageReactions = (messageId: string) =>
    reactions.filter((r) => r.message_id === messageId);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={backgroundImageStyle} />
        <div style={darkOverlayStyle} />
        <p style={{ position: "relative", zIndex: 2 }}>Chargement du chat...</p>
      </main>
    );
  }

  const displayName = profile?.username || user?.email || "Utilisateur";
  const avatarUrl = profile?.avatar || DEFAULT_AVATAR;

  return (
  <main style={pageStyle}>
    <div style={backgroundImageStyle} />
    <div style={darkOverlayStyle} />

      <div style={chatLayout}>
        <div style={chatBox}>
          {hasNewMessage && (
            <button
              onClick={() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                setHasNewMessage(false);
              }}
              style={newMessageBadge}
            >
              🔔 Nouveau message
            </button>
          )}

          <div style={headerStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <h1 style={{ margin: 0 }}>💬 Chat CineZone</h1>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  style={soundBtn}
                >
                  {soundEnabled ? "🔊 Son ON" : "🔇 Son OFF"}
                </button>

                <button
                  onClick={() => setShowProfile(!showProfile)}
                  style={profileBtn}
                >
                  ⚙️ Mon profil
                </button>
              </div>
            </div>

            <div style={connectedBox}>
              <div style={avatarWrap}>
                <img src={avatarUrl} alt="avatar" style={avatarSmall} />
                <span
                  style={{
                    ...onlineDot,
                    background:
                      profile?.status_text === "🔴 Hors ligne"
                        ? "#ff5c5c"
                        : "#4cff9b",
                  }}
                />
              </div>

              <div>
                <p style={{ margin: 0, color: "#fff", fontWeight: "bold" }}>
                  Connecté :{" "}
                  <span
                    style={{
                      color: isAdmin
                        ? "gold"
                        : profile?.role_color || "#00c6ff",
                    }}
                  >
                    {displayName}
                  </span>
                  {isAdmin && <span style={adminBadge}>ADMIN</span>}
                </p>

                <p
                  style={{
                    margin: "4px 0 0",
                    color:
                      profile?.status_text === "🔴 Hors ligne"
                        ? "#ff7777"
                        : "#4cff9b",
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

          {pinnedMessage && (
            <div style={pinnedBox}>
              <strong>📌 Message épinglé</strong>
              <p style={{ margin: "8px 0 0" }}>{pinnedMessage.content}</p>
            </div>
          )}

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
                const msgAvatar = isMe
                  ? avatarUrl
                  : msg.avatar || DEFAULT_AVATAR;
                const userIsOnline = onlineUserIds.includes(msg.user_id);
                const isStatusOffline = msg.status_text === "🔴 Hors ligne";
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
                    }}
                  >
                    <div style={isMe ? myMessageBox : otherMessageBox}>
                      <div style={messageHeader}>
                        <div style={avatarWrapSmall}>
                          <img src={msgAvatar} alt="avatar" style={avatarMsg} />
                          <span
                            style={{
                              ...onlineDotSmall,
                              background: isStatusOffline
                                ? "#ff5c5c"
                                : "#4cff9b",
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
                            {msg.pinned && (
                              <span style={pinnedBadge}>ÉPINGLÉ</span>
                            )}
                          </div>

                          <div
                            style={{
                              fontSize: "11px",
                              color: isStatusOffline
                                ? "#ff7777"
                                : userIsOnline
                                ? "#4cff9b"
                                : "#ff7777",
                            }}
                          >
                            {isStatusOffline
                              ? "🔴 Hors ligne"
                              : userIsOnline
                              ? "🟢 En ligne"
                              : "🔴 Hors ligne"}
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
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() => togglePin(msg.id)}
                            style={pinBtn}
                          >
                            {msg.pinned ? "📌 Désépingler" : "📌 Épingler"}
                          </button>

                          <button
                            onClick={() => deleteMessage(msg.id)}
                            style={deleteBtn}
                          >
                            🗑 Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div ref={bottomRef} />
          </div>

          {typingUsers.length > 0 && (
            <div style={typingBox}>
              ✍️ {typingUsers.map((u) => u.username).join(", ")}{" "}
              {typingUsers.length > 1 ? "écrivent..." : "écrit..."}
            </div>
          )}

          <div style={inputBox}>
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                sendTyping();
              }}
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

        <aside style={onlinePanel}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>🟢 En ligne</h2>

          <p style={{ color: "#9ca3af", marginTop: "6px" }}>
            {onlineMembers.length} membre
            {onlineMembers.length > 1 ? "s" : ""} connecté
            {onlineMembers.length > 1 ? "s" : ""}
          </p>

          <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
            {onlineMembers.length === 0 ? (
              <p style={{ color: "#888" }}>Aucun membre en ligne.</p>
            ) : (
              onlineMembers.map((member) => (
                <div key={member.user_id} style={onlineMemberCard}>
                  <div style={avatarWrapSmall}>
                    <img
                      src={member.avatar || DEFAULT_AVATAR}
                      alt="avatar"
                      style={avatarMsg}
                    />
                    <span
                      style={{
                        ...onlineDotSmall,
                        background:
                          member.status_text === "🔴 Hors ligne"
                            ? "#ff5c5c"
                            : "#4cff9b",
                      }}
                    />
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 900,
                        color: member.role === "admin" ? "gold" : "#fff",
                      }}
                    >
                      {member.username || "Utilisateur"}
                      {member.role === "admin" && (
                        <span style={adminBadge}>ADMIN</span>
                      )}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "12px",
                        color:
                          member.status_text === "🔴 Hors ligne"
                            ? "#ff7777"
                            : "#4cff9b",
                      }}
                    >
                      {member.status_text || "🟢 En ligne"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  fontFamily: "Arial, sans-serif",
  background: "#000",
};

const backgroundImageStyle: React.CSSProperties = {
  position: "absolute",
  inset: "-20px",
  backgroundImage: 'url("/Tchat.jpg")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  filter: "blur(6px)",
  opacity: 0.35, // 👈 règle ici la visibilité
  transform: "scale(1.04)",
  zIndex: 0,
};

const darkOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at center, rgba(0,40,70,0.15), rgba(0,0,0,0.6) 55%, rgba(0,0,0,0.9) 100%)",
  zIndex: 1,
};

const chatLayout: React.CSSProperties = {
  position: "relative",
  zIndex: 2, // 🔥 SUPER IMPORTANT
  width: "100%",
  maxWidth: "1180px",
  display: "grid",
  gridTemplateColumns: "1fr 280px",
  gap: "18px",
  alignItems: "stretch",
};

const chatBox: React.CSSProperties = {
  width: "100%",
  height: "78vh",
  background: "rgba(8,13,22,0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(0,198,255,0.34)",
  borderRadius: "24px",
  boxShadow:
    "0 25px 90px rgba(0,0,0,0.85), 0 0 40px rgba(0,198,255,0.13)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
};

const onlinePanel: React.CSSProperties = {
  height: "78vh",
  padding: "20px",
  borderRadius: "24px",
  background: "rgba(8,13,22,0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(0,198,255,0.34)",
  boxShadow:
    "0 25px 90px rgba(0,0,0,0.65), 0 0 30px rgba(0,198,255,0.12)",
  overflowY: "auto",
};

const newMessageBadge: React.CSSProperties = {
  position: "absolute",
  top: "94px",
  right: "24px",
  zIndex: 20,
  padding: "8px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "linear-gradient(135deg, #ff3b3b, #b00020)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 0 22px rgba(255,60,60,0.45)",
};

const headerStyle: React.CSSProperties = {
  padding: "20px",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.16), rgba(255,215,100,0.06))",
};
