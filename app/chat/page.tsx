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
  reply_to?: string | null;
  image_url?: string | null;
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
  const [imageUploading, setImageUploading] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const [announcement, setAnnouncement] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<Record<string, any>>({});
  const userIdRef = useRef<string | null>(null);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const playNotificationSound = () => {
    if (!soundEnabledRef.current) return;

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

      userIdRef.current = data.user.id;
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
      setEditUsername(fixedProfile.username || "");
      setEditStatus(fixedProfile.status_text || "🟢 En ligne");

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      setMessages(msgs || []);

      const { data: reacts } = await supabase
        .from("message_reactions")
        .select("*");

      setReactions(reacts || []);

      const { data: announcementData } = await supabase
        .from("chat_announcement")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      setAnnouncement(announcementData?.content || "");
      setAnnouncementText(announcementData?.content || "");

      setLoading(false);
    }

    init();

    const channel = supabase
      .channel("chat-room-global")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as Message;

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          if (newMessage.user_id !== userIdRef.current) {
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
            const clean = prev.filter(
              (r) =>
                !(
                  r.id.startsWith("temp-") &&
                  r.message_id === newReaction.message_id &&
                  r.user_id === newReaction.user_id &&
                  r.emoji === newReaction.emoji
                )
            );

            if (clean.some((r) => r.id === newReaction.id)) return clean;
            return [...clean, newReaction];
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
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_announcement" },
        (payload) => {
          const updated = payload.new as { content?: string };
          setAnnouncement(updated.content || "");
          setAnnouncementText(updated.content || "");
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

  const saveAnnouncement = async () => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from("chat_announcement")
      .update({ content: announcementText })
      .eq("id", 1);

    if (error) {
      alert("Erreur annonce : " + error.message);
      return;
    }

    setAnnouncement(announcementText);
    setEditingAnnouncement(false);
  };

  const clearAnnouncement = async () => {
    if (!isAdmin) return;
    if (!confirm("Effacer l’annonce du chat ?")) return;

    const { error } = await supabase
      .from("chat_announcement")
      .update({ content: "" })
      .eq("id", 1);

    if (error) {
      alert("Erreur suppression annonce : " + error.message);
      return;
    }

    setAnnouncement("");
    setAnnouncementText("");
    setEditingAnnouncement(false);
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
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

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

  const uploadChatImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !profile || !e.target.files?.[0]) return;

    try {
      setImageUploading(true);

      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        alert("Choisis une image.");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(filePath, file);

      if (uploadError) {
        alert("Erreur image : " + uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("chat-images")
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;

      const { data: freshProfile } = await supabase
        .from("profiles")
        .select("username, avatar, role, role_color, status_text")
        .eq("id", user.id)
        .single();

      const { data: insertedMessage, error } = await supabase
        .from("messages")
        .insert({
          user_id: user.id,
          email: user.email,
          username: freshProfile?.username || user.email,
          avatar: freshProfile?.avatar || DEFAULT_AVATAR,
          role: freshProfile?.role || "user",
          role_color: freshProfile?.role_color || "#00c6ff",
          status_text: freshProfile?.status_text || "🟢 En ligne",
          content: text.trim(),
          image_url: imageUrl,
          pinned: false,
          reply_to: replyTo?.id || null,
        })
        .select("*")
        .single();

      if (error) {
        alert("Erreur message image : " + error.message);
        return;
      }

      if (insertedMessage) {
        setMessages((prev) =>
          prev.some((m) => m.id === insertedMessage.id)
            ? prev
            : [...prev, insertedMessage]
        );
      }

      setText("");
      setReplyTo(null);
      e.target.value = "";
    } finally {
      setImageUploading(false);
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

    const { data: insertedMessage, error } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        email: user.email,
        username: freshProfile?.username || user.email,
        avatar: freshProfile?.avatar || DEFAULT_AVATAR,
        role: freshProfile?.role || "user",
        role_color: freshProfile?.role_color || "#00c6ff",
        status_text: freshProfile?.status_text || "🟢 En ligne",
        content: message,
        image_url: null,
        pinned: false,
        reply_to: replyTo?.id || null,
      })
      .select("*")
      .single();

    if (error) {
      alert("Erreur message : " + error.message);
      return;
    }

    if (insertedMessage) {
      setMessages((prev) =>
        prev.some((m) => m.id === insertedMessage.id)
          ? prev
          : [...prev, insertedMessage]
      );
    }

    setReplyTo(null);
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

  const deleteMessage = async (messageId: string) => {
    if (!isAdmin) return;
    if (!confirm("Supprimer ce message ?")) return;

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      alert("Erreur suppression : " + error.message);
      return;
    }

    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const getMessageReactions = (messageId: string) =>
    reactions.filter((r) => r.message_id === messageId);

  const getReplyMessage = (replyId?: string | null) => {
    if (!replyId) return null;
    return messages.find((m) => m.id === replyId) || null;
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

  return (
    <main style={pageStyle}>
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

          {(announcement || isAdmin) && (
            <div style={announcementBox}>
              <div style={announcementHeader}>
                <div>
                  <strong>📌 Annonce Admin</strong>
                  <p style={announcementSub}>
                    Message officiel du chat CineZone
                  </p>
                </div>

                {isAdmin && (
                  <div style={announcementActions}>
                    {!editingAnnouncement ? (
                      <>
                        <button
                          style={announcementEditBtn}
                          onClick={() => {
                            setAnnouncementText(announcement);
                            setEditingAnnouncement(true);
                          }}
                        >
                          ✏️ Modifier
                        </button>

                        {announcement && (
                          <button
                            style={announcementDeleteBtn}
                            onClick={clearAnnouncement}
                          >
                            🗑 Effacer
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          style={announcementSaveBtn}
                          onClick={saveAnnouncement}
                        >
                          💾 Sauver
                        </button>

                        <button
                          style={announcementCancelBtn}
                          onClick={() => setEditingAnnouncement(false)}
                        >
                          Annuler
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editingAnnouncement ? (
                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Écris l’annonce admin du chat..."
                  style={announcementTextarea}
                />
              ) : (
                <p style={announcementTextStyle}>
                  {announcement || "Aucune annonce pour le moment."}
                </p>
              )}
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
                const repliedMessage = getReplyMessage(msg.reply_to);

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

                      {msg.reply_to && (
                        <div style={replyPreviewBox}>
                          <strong>
                            ↩️ Réponse à{" "}
                            {repliedMessage?.username ||
                              repliedMessage?.email ||
                              "message supprimé"}
                          </strong>
                          <p style={{ margin: "5px 0 0" }}>
                            {repliedMessage?.content || "Message supprimé"}
                          </p>
                        </div>
                      )}

                      {msg.content && <div style={messageText}>{msg.content}</div>}

                      {msg.image_url && (
                        <a
                          href={msg.image_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={msg.image_url}
                            alt="image chat"
                            style={chatImageStyle}
                          />
                        </a>
                      )}

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

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button onClick={() => setReplyTo(msg)} style={replyBtn}>
                          ↩️ Répondre
                        </button>

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

          {replyTo && (
            <div style={replyBar}>
              <span>
                ↩️ Réponse à <strong>{replyTo.username || replyTo.email}</strong>{" "}
                : {replyTo.content || "image"}
              </span>

              <button onClick={() => setReplyTo(null)} style={cancelReplyBtn}>
                ✖
              </button>
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
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                replyTo
                  ? `Répondre à ${replyTo.username || replyTo.email}...`
                  : "Écris ton message..."
              }
              style={inputStyle}
            />

            <label style={imageUploadBtn}>
              {imageUploading ? "⏳" : "📎"}
              <input
                type="file"
                accept="image/*"
                onChange={uploadChatImage}
                style={{ display: "none" }}
                disabled={imageUploading}
              />
            </label>

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
  background:
    "radial-gradient(circle at 20% 20%, rgba(120,0,255,0.25), transparent 35%), radial-gradient(circle at 80% 30%, rgba(0,198,255,0.22), transparent 35%), linear-gradient(135deg, #02030a 0%, #06111f 45%, #000 100%)",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  fontFamily: "Arial, sans-serif",
};

const chatLayout: React.CSSProperties = {
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
  background:
    "linear-gradient(180deg, rgba(8,13,25,0.94), rgba(3,6,12,0.96))",
  border: "1px solid rgba(0,198,255,0.35)",
  borderRadius: "26px",
  boxShadow:
    "0 30px 90px rgba(0,0,0,0.85), 0 0 35px rgba(0,198,255,0.18)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
};

const onlinePanel: React.CSSProperties = {
  height: "78vh",
  padding: "20px",
  borderRadius: "26px",
  background:
    "linear-gradient(180deg, rgba(8,13,25,0.94), rgba(3,6,12,0.96))",
  border: "1px solid rgba(0,198,255,0.35)",
  boxShadow:
    "0 30px 90px rgba(0,0,0,0.65), 0 0 30px rgba(0,198,255,0.14)",
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

const announcementBox: React.CSSProperties = {
  margin: "12px 16px",
  padding: "14px 16px",
  borderRadius: "18px",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.10), rgba(130,0,255,0.08), rgba(0,0,0,0.28))",
  border: "1px solid rgba(0,198,255,0.28)",
  borderLeft: "4px solid #00c6ff",
  boxShadow:
    "0 0 24px rgba(0,198,255,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  color: "#e6faff",
};

const announcementHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
  marginBottom: "8px",
};

const announcementSub: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#00c6ff",
  fontSize: "12px",
  fontWeight: 900,
  textShadow: "0 0 10px rgba(0,198,255,0.45)",
};

const announcementTextStyle: React.CSSProperties = {
  margin: "10px 0 0",
  whiteSpace: "pre-line",
  lineHeight: 1.45,
  fontSize: "14px",
  color: "#eef8ff",
};

const announcementActions: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const announcementEditBtn: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: "10px",
  border: "1px solid rgba(0,198,255,0.45)",
  background: "rgba(0,198,255,0.16)",
  color: "#67e8f9",
  fontWeight: 900,
  cursor: "pointer",
};

const announcementDeleteBtn: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: "10px",
  border: "1px solid rgba(255,90,90,0.45)",
  background: "rgba(255,70,70,0.16)",
  color: "#ffb3b3",
  fontWeight: 900,
  cursor: "pointer",
};

const announcementSaveBtn: React.CSSProperties = {
  ...announcementEditBtn,
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  color: "#fff",
};

const announcementCancelBtn: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const announcementTextarea: React.CSSProperties = {
  width: "100%",
  minHeight: "140px",
  marginTop: "12px",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid rgba(0,198,255,0.35)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
  resize: "vertical",
  lineHeight: 1.5,
  boxSizing: "border-box",
};

const typingBox: React.CSSProperties = {
  padding: "8px 18px",
  color: "#00c6ff",
  fontSize: "13px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,198,255,0.06)",
};

const onlineMemberCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  borderRadius: "16px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,198,255,0.05))",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
};

const headerStyle: React.CSSProperties = {
  padding: "20px",
  borderBottom: "1px solid rgba(0,198,255,0.18)",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.14), rgba(130,0,255,0.12), rgba(0,0,0,0.2))",
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
  boxShadow: "0 0 18px rgba(0,198,255,0.75)",
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
  background:
    "linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.38))",
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
  boxShadow: "0 0 14px rgba(0,198,255,0.55)",
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
  maxWidth: "72%",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(0,150,255,0.12)",
  border: "1px solid rgba(0,198,255,0.32)",
  boxShadow: "0 8px 26px rgba(0,0,0,0.35)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  color: "#fff",
};

const otherMessageBox: React.CSSProperties = {
  maxWidth: "72%",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 8px 26px rgba(0,0,0,0.32)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  color: "#f2f7ff",
};

const replyPreviewBox: React.CSSProperties = {
  marginTop: "10px",
  padding: "8px 10px",
  borderRadius: "10px",
  background: "rgba(0,0,0,0.28)",
  borderLeft: "3px solid #00c6ff",
  color: "#cbd5e1",
  fontSize: "12px",
};

const messageText: React.CSSProperties = {
  marginTop: "10px",
  lineHeight: 1.55,
  fontSize: "15px",
  color: "#fff",
  wordBreak: "break-word",
  whiteSpace: "pre-line",
};

const chatImageStyle: React.CSSProperties = {
  marginTop: "10px",
  maxWidth: "280px",
  maxHeight: "280px",
  borderRadius: "16px",
  objectFit: "cover",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  cursor: "zoom-in",
  display: "block",
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
  transition:
    "transform 0.22s cubic-bezier(.2,1.6,.4,1), filter 0.22s ease, box-shadow 0.22s ease",
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

const replyBtn: React.CSSProperties = {
  marginTop: "12px",
  background: "rgba(0,198,255,0.12)",
  color: "#67e8f9",
  border: "1px solid rgba(0,198,255,0.35)",
  borderRadius: "10px",
  padding: "7px 10px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
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

const replyBar: React.CSSProperties = {
  padding: "10px 16px",
  background: "rgba(0,198,255,0.1)",
  borderTop: "1px solid rgba(0,198,255,0.25)",
  color: "#dbeafe",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
  fontSize: "13px",
};

const cancelReplyBtn: React.CSSProperties = {
  border: "none",
  background: "rgba(255,60,60,0.2)",
  color: "#fff",
  borderRadius: "8px",
  padding: "5px 8px",
  cursor: "pointer",
};

const inputBox: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  padding: "16px",
  borderTop: "1px solid rgba(0,198,255,0.18)",
  background: "rgba(0,0,0,0.55)",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(0,198,255,0.22)",
  background: "rgba(3,8,18,0.92)",
  color: "#fff",
  outline: "none",
};

const imageUploadBtn: React.CSSProperties = {
  width: "50px",
  minWidth: "50px",
  borderRadius: "14px",
  border: "1px solid rgba(0,198,255,0.45)",
  background: "rgba(0,198,255,0.14)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "20px",
  fontWeight: 900,
};

const btnStyle: React.CSSProperties = {
  padding: "14px 20px",
  borderRadius: "14px",
  border: "none",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
  boxShadow: "0 10px 30px rgba(0,114,255,0.45)",
};

const profileBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(0,198,255,0.45)",
  color: "#fff",
  background: "rgba(0,198,255,0.14)",
  fontWeight: "bold",
  cursor: "pointer",
};

const soundBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  background: "rgba(255,255,255,0.08)",
  fontWeight: "bold",
  cursor: "pointer",
};
