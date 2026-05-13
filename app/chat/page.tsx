"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/adult-7.png";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

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

type MentionProfile = {
  id: string;
  email?: string | null;
  username?: string | null;
};

type ResolvedMentions = {
  safeContent: string;
  mentionedUsers: MentionProfile[];
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
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

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
                !(r.id.startsWith("temp-") &&
                  r.message_id === newReaction.message_id &&
                  r.user_id === newReaction.user_id &&
                  r.emoji === newReaction.emoji)
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
  const isAdmin = profile?.role === "admin" || CREATOR_EMAILS.includes(user?.email || "");

  const isAllowedImage = (file: File) => {
    return (
      file.type.includes("png") ||
      file.type.includes("jpeg") ||
      file.type.includes("jpg") ||
      file.type.includes("webp") ||
      file.type.includes("gif")
    );
  };

  const getCleanImageExt = (file: File) => {
    if (file.type.includes("png")) return "png";
    if (file.type.includes("webp")) return "webp";
    if (file.type.includes("gif")) return "gif";
    return "jpg";
  };

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

      if (!isAllowedImage(file)) {
        alert("Format image non supporté. PNG, JPG, WEBP ou GIF uniquement.");
        e.target.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Image trop lourde. Maximum autorisé : 2 Mo.");
        e.target.value = "";
        return;
      }

      const fileExt = getCleanImageExt(file);
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

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

      e.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const uploadChatImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !profile || !e.target.files?.[0]) return;

    try {
      setImageUploading(true);

      const file = e.target.files[0];

      if (!isAllowedImage(file)) {
        alert("Format image non supporté. PNG, JPG, WEBP ou GIF uniquement.");
        e.target.value = "";
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        alert("Image trop lourde. Maximum autorisé : 4 Mo.");
        e.target.value = "";
        return;
      }

      const fileExt = getCleanImageExt(file);
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(filePath, file, {
          contentType: file.type,
        });

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

  const resolveMentions = async (content: string): Promise<ResolvedMentions> => {
    if (!isAdmin || !user) {
      return { safeContent: content, mentionedUsers: [] };
    }

    const matches = [...content.matchAll(/@([^\s]+)/g)];

    if (matches.length === 0) {
      return { safeContent: content, mentionedUsers: [] };
    }

    let safeContent = content;
    const mentionedUsers: MentionProfile[] = [];
    const alreadyMentioned = new Set<string>();

if (content.includes("@everyone") || content.includes("@toutlemonde")) {
  const { data: members } = await supabase
    .from("profiles")
    .select("id")
    .eq("status", "approved");

  if (members?.length) {
    for (const member of members) {
      if (member.id === user.id) continue;
      if (alreadyMentioned.has(member.id)) continue;

      alreadyMentioned.add(member.id);
      mentionedUsers.push({ id: member.id });
    }
  }

  safeContent = safeContent
    .replaceAll("@everyone", "@tout le monde")
    .replaceAll("@toutlemonde", "@tout le monde");
}

      for (const match of matches) {
      const rawMention = match[0];
      const value = match[1].trim();

      if (!value) continue;

      const { data: mentionedUser } = await supabase
        .from("profiles")
        .select("id, username, email")
        .or(`username.eq.${value},email.eq.${value}`)
        .maybeSingle();

      if (!mentionedUser?.id) continue;
      if (mentionedUser.id === user.id) continue;
      if (alreadyMentioned.has(mentionedUser.id)) continue;

      alreadyMentioned.add(mentionedUser.id);
      mentionedUsers.push(mentionedUser);

      if (value.includes("@")) {
        safeContent = safeContent.replace(
          rawMention,
          mentionedUser.username ? `@${mentionedUser.username}` : "@membre"
        );
      }
    }

    return { safeContent, mentionedUsers };
  };

  const createMentionNotifications = async (
    mentionedUsers: MentionProfile[],
    messagePreview: string
  ) => {
    if (!user || !profile || mentionedUsers.length === 0) return;

    const senderName = profile.username || user.email || "Le staff";

    await supabase.from("notifications").insert(
  mentionedUsers.map((member) => ({
    user_id: member.id,
    type: "mention",
    title: "🔔 Mention dans le chat",
    message: `${senderName} t'a mentionné dans le chat.`,
    link: "/chat",
    read: false,
    read_at: null,
    created_at: new Date().toISOString(),
  }))
);

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    const originalMessage = text.trim();
    setText("");

    const { safeContent, mentionedUsers } = await resolveMentions(originalMessage);

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
        content: safeContent,
        image_url: null,
        pinned: false,
        reply_to: replyTo?.id || null,
      })
      .select("*")
      .single();

    if (error) {
      alert("Erreur message : " + error.message);
      setText(originalMessage);
      return;
    }

    if (insertedMessage) {
      setMessages((prev) =>
        prev.some((m) => m.id === insertedMessage.id)
          ? prev
          : [...prev, insertedMessage]
      );
    }

    await createMentionNotifications(mentionedUsers, safeContent);
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
        <p style={loadingText}>Chargement du chat...</p>
      </main>
    );
  }

  const displayName = profile?.username || user?.email || "Utilisateur";
  const avatarUrl = profile?.avatar || DEFAULT_AVATAR;

  return (
    <main style={pageStyle}>
      <div style={chatLayout}>
        <section style={chatBox}>
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
            <div style={headerTop}>
              <div>
                <h1 style={chatTitle}>💬 Chat CineZone</h1>
                <p style={chatSubtitle}>Échangez avec la communauté CineZone</p>
              </div>

              <div style={headerActions}>
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
                <img
                  src={avatarUrl}
                  alt="avatar"
                  style={avatarSmall}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
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
                <p style={connectedText}>
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
                    ...statusText,
                    color:
                      profile?.status_text === "🔴 Hors ligne"
                        ? "#ff7777"
                        : "#4cff9b",
                  }}
                >
                  {profile?.status_text || "🟢 En ligne"}
                </p>
              </div>
            </div>

            {showProfile && (
              <div style={profileBox}>
                <h3 style={{ marginTop: 0 }}>Modifier mon profil</h3>

                <label style={labelStyle}>Pseudo</label>
                <input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  style={inputStyle}
                  placeholder="Ton pseudo"
                />

                <label style={labelStyle}>Avatar</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={uploadAvatar}
                />
                {uploading && <p style={{ color: "#00c6ff" }}>Upload...</p>}

                <label style={labelStyle}>Statut</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={inputStyle}
                >
                  <option value="🟢 En ligne">🟢 En ligne</option>
                  <option value="🔴 Hors ligne">🔴 Hors ligne</option>
                  <option value="⛔ Occupé">⛔ Occupé</option>
                  <option value="🎬 Je regarde un film">🎬 Je regarde un film</option>
                  {isAdmin && (
                    <option value="👑 Admin disponible">👑 Admin disponible</option>
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
                  <p style={announcementSub}>Message officiel du chat CineZone</p>
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
                        <button style={announcementSaveBtn} onClick={saveAnnouncement}>
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
              <p style={emptyText}>Aucun message pour le moment.</p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.user_id === user?.id;
                const name = isMe
                  ? displayName
                  : msg.username || msg.email || "Utilisateur";
                const msgAvatar = isMe ? avatarUrl : msg.avatar || DEFAULT_AVATAR;
                const userIsOnline = onlineUserIds.includes(msg.user_id);
                const isStatusOffline = msg.status_text === "🔴 Hors ligne";
                const nameColor =
                  msg.role === "admin" ? "gold" : msg.role_color || "#00c6ff";
                const msgReactions = getMessageReactions(msg.id);
                const repliedMessage = getReplyMessage(msg.reply_to);
                const time = new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={msg.id}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                    style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                        maxWidth: "78%",
flexDirection: isMe ? "row-reverse" : "row",
paddingRight: isMe ? "16px" : "0",
                      }}
                    >
                      <div style={avatarWrapSmall}>
                        <img
                          src={msgAvatar}
                          alt="avatar"
                          style={avatarMsg}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_AVATAR;
                          }}
                        />
                        <span
                          style={{
                            ...onlineDotSmall,
                            background: isStatusOffline ? "#ff5c5c" : "#4cff9b",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isMe ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            ...messageMeta,
                            justifyContent: isMe ? "flex-end" : "flex-start",
                            textAlign: isMe ? "right" : "left",
                          }}
                        >
                          <span style={{ color: nameColor, fontWeight: 900 }}>
                            {name}
                          </span>
                          {msg.role === "admin" && (
                            <span style={adminBadge}>ADMIN</span>
                          )}
                          <span
                            style={{
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
                          </span>
                          <span style={{ color: "#7f8ea3" }}>{time}</span>
                        </div>

                        <div style={isMe ? myBubble : otherBubble}>
                          {msg.reply_to && (
                            <div style={replyPreviewBoxClean}>
                              <strong>
                                Réponse à{" "}
                                {repliedMessage?.username ||
                                  repliedMessage?.email ||
                                  "message supprimé"}
                              </strong>
                              <p style={{ margin: "6px 0 0" }}>
                                {repliedMessage?.content || "Message supprimé"}
                              </p>
                            </div>
                          )}

                          {msg.content && <div>{msg.content}</div>}

                          {msg.image_url && (
                            <a href={msg.image_url} target="_blank" rel="noreferrer">
                              <img
                                src={msg.image_url}
                                alt="image chat"
                                style={chatImageStyle}
                              />
                            </a>
                          )}
                        </div>

                        <div
                          style={{
                            ...reactionRow,
                            justifyContent: isMe ? "flex-end" : "flex-start",
                          }}
                        >
                          {REACTION_EMOJIS.map((emoji) => {
                            const count = msgReactions.filter(
                              (r) => r.emoji === emoji
                            ).length;
                            const active = msgReactions.some(
                              (r) => r.emoji === emoji && r.user_id === user?.id
                            );

                            if (count === 0 && !active && hoveredMessageId !== msg.id) {
                              return null;
                            }

                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => toggleReaction(msg.id, emoji)}
                                style={{
                                  ...reactionBtn,
                                  ...(active ? reactionBtnActive : {}),
                                  opacity:
                                    count === 0 && hoveredMessageId === msg.id
                                      ? 0.55
                                      : 1,
                                  transform:
                                    reactionPulse === `${msg.id}-${emoji}`
                                      ? "scale(1.4)"
                                      : active
                                      ? "scale(1.08)"
                                      : "scale(1)",
                                }}
                              >
                                <span
                                  style={active ? reactionEmojiActive : reactionEmoji}
                                >
                                  {emoji}
                                </span>
                                {count > 0 && <span style={reactionCount}>{count}</span>}
                              </button>
                            );
                          })}
                        </div>

                        <div
                          style={{
                            ...messageActions,
                            justifyContent: isMe ? "flex-end" : "flex-start",
                            opacity: hoveredMessageId === msg.id ? 1 : 0,
                            pointerEvents:
                              hoveredMessageId === msg.id ? "auto" : "none",
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
                  : isAdmin
                  ? "Écris ton message... (@email ou @pseudo pour notifier)"
                  : "Écris ton message..."
              }
              style={inputStyle}
            />

            <label style={imageUploadBtn}>
              {imageUploading ? "⏳" : "📎"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={uploadChatImage}
                style={{ display: "none" }}
                disabled={imageUploading}
              />
            </label>

            <button onClick={sendMessage} style={btnStyle}>
              Envoyer
            </button>
          </div>
        </section>

        <aside style={onlinePanel}>
          <h2 style={onlineTitle}>🟢 En ligne</h2>

          <p style={onlineCount}>
            {onlineMembers.length} membre
            {onlineMembers.length > 1 ? "s" : ""} connecté
            {onlineMembers.length > 1 ? "s" : ""}
          </p>

          <div style={onlineGrid}>
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
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
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
                      {member.role === "admin" && <span style={adminBadge}>ADMIN</span>}
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
  minHeight: "calc(100vh - 56px)",
  background: `
    radial-gradient(circle at 12% 15%, rgba(0, 198, 255, 0.18), transparent 34%),
    radial-gradient(circle at 86% 28%, rgba(120, 50, 255, 0.20), transparent 38%),
    radial-gradient(circle at 10% 88%, rgba(255, 0, 120, 0.10), transparent 36%),
    linear-gradient(135deg, #020617 0%, #040817 45%, #020617 100%)
  `,
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "80px 24px 32px",
  fontFamily: "Inter, Arial, sans-serif",
  position: "relative",
  overflow: "hidden",
};

const loadingText: React.CSSProperties = {
  padding: "14px 18px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(0,198,255,0.25)",
  boxShadow: "0 0 24px rgba(0,198,255,0.18)",
};

const chatLayout: React.CSSProperties = {
  width: "100%",
  maxWidth: "1240px",
  display: "grid",
  gridTemplateColumns: "1fr 310px",
  gap: "22px",
  alignItems: "stretch",
};

const chatBox: React.CSSProperties = {
  width: "100%",
  height: "80vh",
  background:
    "linear-gradient(180deg, rgba(9,14,28,0.92), rgba(2,6,15,0.96))",
  border: "1px solid rgba(0,198,255,0.28)",
  borderRadius: "28px",
  boxShadow:
    "0 35px 100px rgba(0,0,0,0.9), 0 0 55px rgba(0,198,255,0.16)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const onlinePanel: React.CSSProperties = {
  height: "80vh",
  padding: "22px",
  borderRadius: "28px",
  background:
    "linear-gradient(180deg, rgba(9,14,28,0.9), rgba(2,6,15,0.96))",
  border: "1px solid rgba(0,198,255,0.24)",
  boxShadow:
    "0 35px 90px rgba(0,0,0,0.75), 0 0 38px rgba(0,198,255,0.12)",
  overflowY: "auto",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const newMessageBadge: React.CSSProperties = {
  position: "absolute",
  top: "104px",
  right: "24px",
  zIndex: 20,
  padding: "9px 15px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "linear-gradient(135deg, #ff3b3b, #b00020)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 0 24px rgba(255,60,60,0.48)",
};

const headerStyle: React.CSSProperties = {
  padding: "22px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.12), rgba(124,58,237,0.14), rgba(0,0,0,0.18))",
};

const headerTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
};

const chatTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "22px",
  letterSpacing: "-0.03em",
};

const chatSubtitle: React.CSSProperties = {
  margin: "6px 0 0",
  color: "#9fb3c8",
  fontSize: "14px",
};

const headerActions: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const connectedBox: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  marginTop: "18px",
};

const connectedText: React.CSSProperties = {
  margin: 0,
  color: "#fff",
  fontWeight: "bold",
};

const statusText: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: "13px",
  fontWeight: 700,
};

const profileBox: React.CSSProperties = {
  marginTop: "18px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(0,0,0,0.42)",
  border: "1px solid rgba(255,255,255,0.12)",
  display: "grid",
  gap: "10px",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
};

const labelStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontWeight: 800,
  fontSize: "13px",
};

const announcementBox: React.CSSProperties = {
  margin: "14px 18px",
  padding: "16px 18px",
  borderRadius: "20px",
  background:
    "linear-gradient(135deg, rgba(255,60,90,0.13), rgba(130,0,255,0.08), rgba(0,0,0,0.32))",
  border: "1px solid rgba(255,70,100,0.38)",
  boxShadow:
    "0 0 28px rgba(255,70,100,0.16), inset 0 1px 0 rgba(255,255,255,0.06)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  color: "#fff",
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
  color: "#67e8f9",
  fontSize: "12px",
  fontWeight: 900,
  textShadow: "0 0 10px rgba(0,198,255,0.45)",
};

const announcementTextStyle: React.CSSProperties = {
  margin: "10px 0 0",
  whiteSpace: "pre-line",
  lineHeight: 1.5,
  fontSize: "14px",
  color: "#eef8ff",
};

const announcementActions: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const announcementEditBtn: React.CSSProperties = {
  padding: "8px 11px",
  borderRadius: "11px",
  border: "1px solid rgba(0,198,255,0.45)",
  background: "rgba(0,198,255,0.16)",
  color: "#67e8f9",
  fontWeight: 900,
  cursor: "pointer",
};

const announcementDeleteBtn: React.CSSProperties = {
  padding: "8px 11px",
  borderRadius: "11px",
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
  padding: "8px 11px",
  borderRadius: "11px",
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
  borderRadius: "14px",
  border: "1px solid rgba(0,198,255,0.35)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
  resize: "vertical",
  lineHeight: 1.5,
  boxSizing: "border-box",
};

const messagesBox: React.CSSProperties = {
  flex: 1,
  padding: "26px",
  overflowY: "auto",
  background:
    "radial-gradient(circle at 82% 18%, rgba(0,198,255,0.08), transparent 35%), linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.36))",
};

const emptyText: React.CSSProperties = {
  color: "#8ea0b6",
  textAlign: "center",
  marginTop: "42px",
};

const messageMeta: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  marginBottom: "6px",
  fontSize: "13px",
  flexWrap: "wrap",
};

const myBubble: React.CSSProperties = {
  maxWidth: "100%",
  padding: "13px 16px",
  borderRadius: "20px 20px 6px 20px",
  background:
    "linear-gradient(135deg, rgba(0,145,255,0.55), rgba(58,0,255,0.42))",
  border: "1px solid rgba(0,198,255,0.42)",
  color: "#fff",
  lineHeight: 1.5,
  fontSize: "15px",
  wordBreak: "break-word",
  whiteSpace: "pre-line",
  boxShadow: "0 12px 34px rgba(0,114,255,0.22)",
};

const otherBubble: React.CSSProperties = {
  maxWidth: "100%",
  padding: "13px 16px",
  borderRadius: "20px 20px 20px 6px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.105), rgba(255,255,255,0.045))",
  border: "1px solid rgba(255,255,255,0.13)",
  color: "#fff",
  lineHeight: 1.5,
  fontSize: "15px",
  wordBreak: "break-word",
  whiteSpace: "pre-line",
  boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
};

const replyPreviewBoxClean: React.CSSProperties = {
  marginBottom: "10px",
  padding: "9px 11px",
  borderLeft: "3px solid rgba(0,198,255,0.7)",
  color: "#9fb3c8",
  fontSize: "13px",
  background: "rgba(0,0,0,0.20)",
  borderRadius: "12px",
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
  gap: "5px",
  marginTop: "7px",
  flexWrap: "wrap",
};

const reactionBtn: React.CSSProperties = {
  height: "27px",
  minWidth: "30px",
  fontSize: "12px",
  padding: "3px 8px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.075)",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
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

const messageActions: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  marginTop: "7px",
  flexWrap: "wrap",
  transition: "opacity 0.16s ease",
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

const typingBox: React.CSSProperties = {
  padding: "9px 18px",
  color: "#67e8f9",
  fontSize: "13px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,198,255,0.06)",
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
  gap: "12px",
  padding: "18px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(2,6,15,0.88)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px",
  borderRadius: "16px",
  border: "1px solid rgba(0,198,255,0.26)",
  background: "rgba(3,8,18,0.92)",
  color: "#fff",
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
};

const imageUploadBtn: React.CSSProperties = {
  width: "52px",
  minWidth: "52px",
  borderRadius: "16px",
  border: "1px solid rgba(0,198,255,0.45)",
  background: "rgba(0,198,255,0.14)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "20px",
  fontWeight: 900,
  boxShadow: "0 0 18px rgba(0,198,255,0.12)",
};

const btnStyle: React.CSSProperties = {
  padding: "14px 20px",
  borderRadius: "16px",
  border: "none",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
  boxShadow: "0 12px 34px rgba(0,114,255,0.48)",
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

const avatarWrap: React.CSSProperties = {
  position: "relative",
  width: "52px",
  height: "52px",
};

const avatarSmall: React.CSSProperties = {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.8)",
  boxShadow: "0 0 20px rgba(0,198,255,0.75)",
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

const avatarWrapSmall: React.CSSProperties = {
  position: "relative",
  width: "44px",
  height: "44px",
  minWidth: "44px",
  flexShrink: 0,
};

const avatarMsg: React.CSSProperties = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.75)",
  boxShadow: "0 0 15px rgba(0,198,255,0.55)",
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

const onlineTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "18px",
};

const onlineCount: React.CSSProperties = {
  color: "#9ca3af",
  marginTop: "6px",
};

const onlineGrid: React.CSSProperties = {
  display: "grid",
  gap: "12px",
  marginTop: "18px",
};

const onlineMemberCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  padding: "11px",
  borderRadius: "18px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,198,255,0.05))",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
};
