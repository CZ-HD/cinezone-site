"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
const getStatusColor = (status?: string) => {
  switch (status) {
    case "👻 Invisible":
    return "#7c3aed";


    case "⛔ Occupé":
return "#f59e0b";


    case "🎬 Je regarde un film":
      return "#a855f7";

    case "👑 Admin disponible":
      return "#4ade80";

    case "🟢 En ligne":
      return "#4ade80";

    default:
      return "#4ade80";
  }
};

const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/adult-7.png";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
const CHAT_EMOJIS = [
  "👍", "❤️", "🔥", "😂", "😎", "🎬",
  "🍿", "👑", "🙏", "💯", "⭐", "🚀",
  "😍", "😅", "🤣", "😱", "🤔", "👀",
  "😈", "🥶", "💀", "👌", "👏", "🙌",
  "🎉", "✨", "⚡", "💎", "🎭", "📽️",
  "🍕", "☕", "🫡", "🤝", "✅", "❌"
];

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

type ProfileMap = Record<
  string,
  {
    username?: string | null;
    avatar?: string | null;
    role?: string | null;
    role_color?: string | null;
    status_text?: string | null;
  }
>;

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
  const [profilesMap, setProfilesMap] = useState<ProfileMap>({});
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);

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

  const loadProfilesForMessages = async (messageList: Message[]) => {
    const userIds = [
      ...new Set(messageList.map((message) => message.user_id).filter(Boolean)),
    ];

    if (userIds.length === 0) {
      setProfilesMap({});
      return;
    }

    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("id, username, avatar, role, role_color, status_text")
      .in("id", userIds);

    if (error) {
      console.error("Erreur profils chat :", error.message);
      return;
    }

    const map: ProfileMap = {};

    (profilesData || []).forEach((item: any) => {
      map[item.id] = {
        username: item.username,
        avatar: item.avatar,
        role: item.role,
        role_color: item.role_color,
        status_text: item.status_text,
      };
    });

    setProfilesMap(map);
  };

  const addProfileToMap = (profileId: string, profileData: any) => {
    if (!profileId || !profileData) return;

    setProfilesMap((prev) => ({
      ...prev,
      [profileId]: {
        username: profileData.username,
        avatar: profileData.avatar,
        role: profileData.role,
        role_color: profileData.role_color,
        status_text: profileData.status_text,
      },
    }));
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
      addProfileToMap(data.user.id, fixedProfile);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      const messageList = (msgs || []) as Message[];
      setMessages(messageList);
      await loadProfilesForMessages(messageList);

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
        async (payload) => {
          const newMessage = payload.new as Message;

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          if (newMessage.user_id) {
            const { data: liveProfile } = await supabase
              .from("profiles")
              .select("id, username, avatar, role, role_color, status_text")
              .eq("id", newMessage.user_id)
              .maybeSingle();

            if (liveProfile?.id) {
              addProfileToMap(liveProfile.id, liveProfile);
            }
          }

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
  const isAdmin =
    profile?.role === "admin" || CREATOR_EMAILS.includes(user?.email || "");

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

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        username: editUsername || user.email,
        status_text: safeStatus || "🟢 En ligne",
      })
      .eq("id", user.id)
      .select("id, username, avatar, role, role_color, status_text")
      .single();

    if (error) {
      alert("Erreur sauvegarde : " + error.message);
      return;
    }

    setProfile((prev) => ({
      ...prev,
      username: updatedProfile?.username || editUsername || user.email,
      avatar: updatedProfile?.avatar || prev?.avatar || DEFAULT_AVATAR,
      role: updatedProfile?.role || prev?.role || "user",
      role_color: updatedProfile?.role_color || prev?.role_color || "#00c6ff",
      status_text: updatedProfile?.status_text || safeStatus || "🟢 En ligne",
    }));

    addProfileToMap(user.id, updatedProfile);
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

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({ avatar: publicUrl })
        .eq("id", user.id)
        .select("id, username, avatar, role, role_color, status_text")
        .single();

      if (error) {
        alert("Erreur sauvegarde avatar : " + error.message);
        return;
      }

      setProfile((prev) => ({
        ...prev,
        avatar: publicUrl,
      }));

      addProfileToMap(user.id, updatedProfile || { ...profile, avatar: publicUrl });
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
        .select("id, username, avatar, role, role_color, status_text")
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

      if (freshProfile?.id) {
        addProfileToMap(freshProfile.id, freshProfile);
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

    let safeContent = content;
    const mentionedUsers: MentionProfile[] = [];
    const alreadyMentioned = new Set<string>();

    const lowerContent = content.toLowerCase();

    const isEveryone =
      lowerContent.includes("@everyone") ||
      lowerContent.includes("@toutlemonde") ||
      lowerContent.includes("@tout le monde");

    if (isEveryone) {
      const { data: members, error } = await supabase
        .from("profiles")
        .select("id, username, email")
        .eq("status", "approved");

      if (error) {
        alert("Erreur mention tout le monde : " + error.message);
        return { safeContent, mentionedUsers: [] };
      }

      for (const member of members || []) {
        if (!member.id) continue;
        if (member.id === user.id) continue;
        if (alreadyMentioned.has(member.id)) continue;

        alreadyMentioned.add(member.id);
        mentionedUsers.push(member);
      }

      safeContent = safeContent
        .replaceAll("@everyone", "@tout le monde")
        .replaceAll("@toutlemonde", "@tout le monde");
    }

    const matches = [...content.matchAll(/@([^\s]+)/g)];

    for (const match of matches) {
      const rawMention = match[0];
      const value = match[1].trim();

      if (!value) continue;
      if (value.toLowerCase() === "everyone") continue;
      if (value.toLowerCase() === "toutlemonde") continue;
      if (value.toLowerCase() === "tout") continue;

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

    const { error: notifError } = await supabase
      .from("notifications")
      .insert(
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

    if (notifError) {
      console.error("Erreur notifications :", notifError);
      alert("Erreur notifications : " + notifError.message);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    const originalMessage = text.trim();
    setText("");

    const { safeContent, mentionedUsers } = await resolveMentions(originalMessage);

    const { data: freshProfile } = await supabase
      .from("profiles")
      .select("id, username, avatar, role, role_color, status_text")
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

    if (freshProfile?.id) {
      addProfileToMap(freshProfile.id, freshProfile);
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
        <div style={loadingCard}>
          <div style={loaderGlow}>CZ</div>
          <p style={loadingText}>Chargement du chat CineZone...</p>
        </div>
      </main>
    );
  }

  const displayName = profile?.username || user?.email || "Utilisateur";
  const avatarUrl = profile?.avatar || DEFAULT_AVATAR;

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <aside style={roomsPanel}>
          <div style={brandCard}>
            <div style={brandLogo}>CZ</div>
            <div>
              <h2 style={brandTitle}>CineZone</h2>
              <p style={brandSub}>Chat communautaire</p>
            </div>
          </div>

          <div style={miniProfileCard}>
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
    background: getStatusColor(
      profile?.status_text
    ),
    boxShadow: `0 0 10px ${getStatusColor(
      profile?.status_text
    )}`,
  }}
/>

  </div>

  <div style={{ minWidth: 0 }}>
    <p style={miniProfileName}>
      {displayName}

  {isAdmin && (
    <span style={adminBadge}>
      ADMIN
    </span>
  )}
</p>

<p
  style={{
    ...miniProfileStatus,
    color: getStatusColor(
      profile?.status_text
    ),
  }}
>
  {profile?.status_text || "🟢 En ligne"}
</p>

  </div>
</div>

<div
  style={{
    marginTop: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  }}
>
            <div
              style={{
                padding: "14px",
                borderRadius: "18px",
                background:
                  "linear-gradient(135deg, rgba(0,198,255,0.12), rgba(124,58,237,0.10))",
                border: "1px solid rgba(0,198,255,0.22)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  fontWeight: 950,
                  fontSize: "18px",
                  color: "#fff",
                  letterSpacing: "-0.03em",
                }}
              >
                CZ CineZone
              </div>

              <div
                style={{
                  marginTop: "6px",
                  color: "#67e8f9",
                  fontSize: "13px",
                  fontWeight: 900,
                }}
              >
                {onlineMembers.length} membre
                {onlineMembers.length > 1 ? "s" : ""} 🔥
              </div>
            </div>

            <div>
              <div
                style={{
                  marginBottom: "10px",
                  color: "#9fb3c8",
                  fontSize: "12px",
                  fontWeight: 950,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                💬 Discussion
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <button type="button" style={roomButtonActive}>
                  <span style={roomIcon}>💬</span>
                  <span style={roomLabel}># général</span>
                </button>

                <button type="button" style={roomButton}>
                  <span style={roomIcon}>📥</span>
                  <span style={roomLabel}># demandes</span>
                </button>
              </div>
            </div>

            <div>
              <div
                style={{
                  marginBottom: "10px",
                  color: "#9fb3c8",
                  fontSize: "12px",
                  fontWeight: 950,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                🎬 Cinéma
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <button type="button" style={roomButton}>
                  <span style={roomIcon}>🎬</span>
                  <span style={roomLabel}># films</span>
                </button>

                <button type="button" style={roomButton}>
                  <span style={roomIcon}>📚</span>
                  <span style={roomLabel}># sagas</span>
                </button>
              </div>
            </div>

            {isAdmin && (
              <div>
                <div
                  style={{
                    marginBottom: "10px",
                    color: "#9fb3c8",
                    fontSize: "12px",
                    fontWeight: 950,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  👑 Staff
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <button type="button" style={roomButton}>
                    <span style={roomIcon}>👑</span>
                    <span style={roomLabel}># staff</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={quickActionsCard}>
            <a href="/films" style={quickAction}>🎞️ Films</a>
            <a href="/demande-film" style={quickAction}>📥 Demander</a>
            <a href="/sagas" style={quickAction}>📚 Sagas</a>
          </div>
        </aside>

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

          <header style={chatHeader}>
            <div>
              <div style={channelTitleRow}>
                <span style={channelHash}>#</span>
                <h1 style={chatTitle}>général</h1>
              </div>
              <p style={chatSubtitle}>Salon principal de la communauté CineZone HD.</p>
            </div>

            <div style={headerActions}>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                style={soundBtn}
              >
                {soundEnabled ? "🔊 Son" : "🔇 Muet"}
              </button>

              <button
                onClick={() => setShowProfile(!showProfile)}
                style={profileBtn}
              >
                ⚙️ Profil
              </button>
            </div>
          </header>

          {showProfile && (
            <div style={profileBoxV2}>
              <div style={profileBoxHeader}>
                <strong>Modifier mon profil</strong>
                <button onClick={() => setShowProfile(false)} style={closeGhostBtn}>✕</button>
              </div>

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
                style={fileInputStyle}
              />
              {uploading && <p style={infoText}>Upload...</p>}

              <label style={labelStyle}>Statut</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="🟢 En ligne">🟢 En ligne</option>
                <option value="🔴 Invisible">🔴 Invisible </option>
                <option value="⛔ Occupé">⛔ Occupé</option>
                <option value="🎬 Je regarde un film">🎬 Je regarde un film</option>
                {isAdmin && <option value="👑 Admin disponible">👑 Admin disponible</option>}
              </select>

              <button onClick={saveProfile} style={btnStyle}>💾 Sauvegarder</button>
            </div>
          )}

          {(announcement || isAdmin) && (
            <div style={announcementBoxV2}>
              <div style={announcementHeader}>
                <div>
                  <strong>📢 Annonce CineZone</strong>
                  <p style={announcementSub}>Message officiel du chat</p>
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
                          Modifier
                        </button>

                        {announcement && (
                          <button style={announcementDeleteBtn} onClick={clearAnnouncement}>
                            Effacer
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button style={announcementSaveBtn} onClick={saveAnnouncement}>
                          Sauver
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
                  {announcement || "Bienvenue sur le chat CineZone. Respect, bonne ambiance et cinéma avant tout 🎬"}
                </p>
              )}
            </div>
          )}

          <div style={messagesBox}>
            {messages.length === 0 ? (
              <div style={emptyState}>
                <div style={emptyIcon}>💬</div>
                <p style={emptyText}>Aucun message pour le moment.</p>
                <span style={emptyHint}>Soyez le premier à lancer la discussion.</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.user_id === user?.id;

const liveProfile = profilesMap[msg.user_id];

const name = isMe
  ? displayName
  : liveProfile?.username ||
    msg.username ||
    msg.email ||
    "Utilisateur";

const msgAvatar = isMe
  ? avatarUrl
  : liveProfile?.avatar ||
    msg.avatar ||
    DEFAULT_AVATAR;

const liveRole =
  liveProfile?.role || msg.role;

const liveRoleColor =
  liveProfile?.role_color || msg.role_color;

const liveStatusText =
  liveProfile?.status_text || msg.status_text;

// 🔴 Vérifie si le membre est invisible
const isStatusOffline =
  liveStatusText === "🔴 Invisible";

// ✅ Online seulement si pas invisible
const userIsOnline =
  !isStatusOffline &&
  onlineUserIds.includes(msg.user_id);

const nameColor =
  liveRole === "admin"
    ? "gold"
    : liveRoleColor || "#00c6ff";

const msgReactions =
  getMessageReactions(msg.id);

const repliedMessage =
  getReplyMessage(msg.reply_to);

const time = new Date(msg.created_at).toLocaleTimeString(
  "fr-FR",
  {
    hour: "2-digit",
    minute: "2-digit",
  }
);

// ✅ Couleur dynamique du statut
const statusColor =
  liveStatusText === "🔴 Invisible"
    ? "#ff4d6d"
    : liveStatusText === "⛔ Occupé"
    ? "#ff4d6d"
    : liveStatusText === "🎬 Je regarde un film"
    ? "#a855f7"
    : liveStatusText === "👑 Admin disponible"
    ? "#4ade80"
    : "#4ade80";

                return (
                  <article
                    key={msg.id}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                    style={messageLine}
                  >
                    <div style={avatarWrapMsg}>
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

    background: getStatusColor(liveStatusText),

    boxShadow: `0 0 10px ${getStatusColor(
      liveStatusText
    )}`,
  }}
/>
</div>

<div style={messageContent}>
  <div style={messageMeta}>
  <span
    style={{
      color: nameColor,
      fontWeight: 900,
    }}
  >
    {name}
  </span>

  {liveRole === "admin" && (
    <span style={adminBadge}>ADMIN</span>
  )}

  <span style={messageTime}>
    {time}
  </span>

  <span
    style={{
      ...messageStatus,
      color: statusColor,
    }}
  >
    {liveStatusText || (userIsOnline ? "🟢 En ligne" : "🔴 Hors ligne")}
  </span>
</div>
                      <div style={messageBubbleV2}>
                        {msg.reply_to && (
                          <div style={replyPreviewBoxClean}>
                            <strong>
                              Réponse à {repliedMessage?.username || repliedMessage?.email || "message supprimé"}
                            </strong>
                            <p style={{ margin: "5px 0 0" }}>
                              {repliedMessage?.content || "Message supprimé"}
                            </p>
                          </div>
                        )}

                        {msg.content && <div>{msg.content}</div>}

                        {msg.image_url && (
                          <a href={msg.image_url} target="_blank" rel="noreferrer">
                            <img src={msg.image_url} alt="image chat" style={chatImageStyle} />
                          </a>
                        )}
                      </div>

                      <div style={reactionRow}>
                        {REACTION_EMOJIS.map((emoji) => {
                          const count = msgReactions.filter((r) => r.emoji === emoji).length;
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
                                opacity: count === 0 && hoveredMessageId === msg.id ? 0.58 : 1,
                                transform:
                                  reactionPulse === `${msg.id}-${emoji}`
                                    ? "scale(1.35)"
                                    : active
                                    ? "scale(1.06)"
                                    : "scale(1)",
                              }}
                            >
                              <span style={active ? reactionEmojiActive : reactionEmoji}>{emoji}</span>
                              {count > 0 && <span style={reactionCount}>{count}</span>}
                            </button>
                          );
                        })}
                      </div>

                      <div
                        style={{
                          ...messageActions,
                          opacity: hoveredMessageId === msg.id ? 1 : 0,
                          pointerEvents: hoveredMessageId === msg.id ? "auto" : "none",
                        }}
                      >
                        <button onClick={() => setReplyTo(msg)} style={replyBtn}>↩️ Répondre</button>
                        {isAdmin && (
                          <button onClick={() => deleteMessage(msg.id)} style={deleteBtn}>
                            🗑 Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {typingUsers.length > 0 && (
            <div style={typingBox}>
              <span style={typingDots}>● ● ●</span> {typingUsers.map((u) => u.username).join(", ")} {typingUsers.length > 1 ? "écrivent..." : "écrit..."}
            </div>
          )}

          {replyTo && (
            <div style={replyBar}>
              <span>
                ↩️ Réponse à <strong>{replyTo.username || replyTo.email}</strong> : {replyTo.content || "image"}
              </span>
              <button onClick={() => setReplyTo(null)} style={cancelReplyBtn}>✖</button>
            </div>
          )}

          <div style={inputBox}>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                style={plusBtn}
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                title="Ajouter un emoji"
              >
                ＋
              </button>

              {showEmojiPicker && (
                <div style={emojiPickerBox}>
                  {CHAT_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setText((prev) => `${prev}${emoji}`);
                        setShowEmojiPicker(false);
                      }}
                      style={emojiPickerBtn}
                      title={`Ajouter ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div
  style={{
    position: "relative",
    flex: 1,
    display: "flex",
    width: "100%",
  }}
>
  {showMentions && mentionResults.length > 0 && (
    <div style={mentionBox}>
      {mentionResults.map((u) => (
        <button
          key={u.id}
          type="button"
          style={mentionItem}
          onClick={() => {
            const newText = text.replace(
              /@([^\s]*)$/,
              `@${u.username} `
            );

            setText(newText);
            setShowMentions(false);
          }}
        >
          <img
  src={
    u.avatar &&
    u.avatar !== "null" &&
    u.avatar !== ""
      ? u.avatar
      : DEFAULT_AVATAR
  }
  alt="avatar"
  style={mentionAvatar}
  onError={(e) => {
    e.currentTarget.src = DEFAULT_AVATAR;
  }}
/>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <span style={mentionUsername}>
              @{u.username || u.email?.split("@")[0] || "Utilisateur"}
            </span>

            {u.email && (
              <span style={mentionEmail}>
                {u.email}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )}

  <input
    value={text}
    onChange={async (e) => {
      const value = e.target.value;

      setText(value);
      sendTyping();

      const match = value.match(/@([^\s]*)$/);

      if (match) {
        const query = match[1];

        const { data, error } = await supabase
  .from("profiles")
  .select("id, username, avatar, email")
  .or(
    `username.ilike.%${query}%,email.ilike.%${query}%`
  )
  .limit(12);

        if (!error) {
          setMentionResults(data || []);
          setShowMentions(true);
        }
      } else {
        setShowMentions(false);
      }
    }}
    onKeyDown={(e) => {
      if (e.key === "Escape") {
        setShowMentions(false);
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }}
    placeholder={
      replyTo
        ? `Répondre à ${replyTo.username || replyTo.email}...`
        : isAdmin
        ? "Écris dans #général... (@pseudo)"
        : "Écris dans #général..."
    }
    style={inputStyle}
  />
</div>

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

            <button onClick={sendMessage} style={btnStyle}>Envoyer</button>
          </div>
        </section>

              <aside style={onlinePanel}>
          <div style={onlineHeaderV2}>
            <div>
              <h2 style={onlineTitle}>Membres</h2>
              <p style={onlineCount}>
                🟢 {onlineMembers.length} connecté{onlineMembers.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div style={onlineGrid}>
            {onlineMembers.length === 0 ? (
              <p style={{ color: "#888" }}>Aucun membre en ligne.</p>
            ) : (
              onlineMembers.map((member) => {
                const statusColor = getStatusColor(member.status_text);
                const isInvisible = member.status_text === "🔴 Invisible";

                return (
                  <div key={member.user_id} style={onlineMemberCard}>
                    <div style={avatarWrapSmall}>
                      <img
                        src={member.avatar || DEFAULT_AVATAR}
                        alt="avatar"
                        style={avatarMember}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                      />
                      <span
                        style={{
                          ...onlineDotSmall,
                          background: statusColor,
                          boxShadow: `0 0 8px ${statusColor}`,
                        }}
                      />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 900,
                          color: member.role === "admin" ? "gold" : "#fff",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {member.username || "Utilisateur"}
                        {member.role === "admin" && <span style={adminBadge}>ADMIN</span>}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "12px",
                          fontWeight: 800,
                          color: statusColor,
                        }}
                      >
                        {member.status_text || "🟢 En ligne"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={activityCard}>
            <strong>Activité récente</strong>
            <p>🎬 Chat CineZone v2 actif</p>
            <p>📥 Les demandes se font depuis le bouton dédié</p>
            <p>🔥 Les nouveautés peuvent être annoncées ici</p>
          </div>
        </aside>  
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "calc(100vh - 56px)",
  background: `
    radial-gradient(circle at 10% 10%, rgba(0, 198, 255, 0.18), transparent 30%),
    radial-gradient(circle at 88% 18%, rgba(106, 55, 255, 0.22), transparent 34%),
    radial-gradient(circle at 18% 92%, rgba(255, 0, 130, 0.10), transparent 32%),
    linear-gradient(135deg, #020617 0%, #050816 45%, #020617 100%)
  `,
  color: "#fff",
  padding: "76px 18px 24px",
  fontFamily: "Inter, Arial, sans-serif",
  overflow: "hidden",
};

const loadingCard: React.CSSProperties = {
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: "14px",
};

const loaderGlow: React.CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: "22px",
  background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
  boxShadow: "0 0 36px rgba(0,198,255,0.65)",
};

const loadingText: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(0,198,255,0.25)",
  color: "#dff8ff",
  fontWeight: 800,
};

const shellStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "1540px",
  height: "calc(100vh - 110px)",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr) 300px",
  gap: "16px",
};

const panelBase: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(10,16,32,0.92), rgba(3,7,18,0.96))",
  border: "1px solid rgba(0,198,255,0.22)",
  boxShadow: "0 28px 90px rgba(0,0,0,0.75), 0 0 40px rgba(0,198,255,0.10)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

const roomsPanel: React.CSSProperties = {
  ...panelBase,
  borderRadius: "26px",
  padding: "18px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const brandCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  paddingBottom: "16px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const brandLogo: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "17px",
  background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
  boxShadow: "0 0 26px rgba(0,198,255,0.55)",
};

const brandTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "20px",
  letterSpacing: "-0.04em",
};

const brandSub: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#8fa3bd",
  fontSize: "12px",
  fontWeight: 700,
};

const miniProfileCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "16px",
  padding: "12px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(0,198,255,0.10), rgba(124,58,237,0.10))",
  border: "1px solid rgba(255,255,255,0.10)",
};

const miniProfileName: React.CSSProperties = {
  margin: 0,
  fontWeight: 950,
  color: "#fff",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const miniProfileStatus: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: "12px",
  fontWeight: 800,
};

const roomButton: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "26px 1fr auto",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  padding: "11px 12px",
  borderRadius: "14px",
  border: "1px solid transparent",
  background: "transparent",
  color: "#9fb3c8",
  cursor: "pointer",
  textAlign: "left",
  fontWeight: 800,
};

const roomButtonActive: React.CSSProperties = {
  ...roomButton,
  color: "#fff",
  background: "linear-gradient(135deg, rgba(0,198,255,0.20), rgba(80,54,255,0.22))",
  border: "1px solid rgba(0,198,255,0.35)",
  boxShadow: "0 0 22px rgba(0,198,255,0.14)",
};

const roomIcon: React.CSSProperties = {
  fontSize: "17px",
};

const roomLabel: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const quickActionsCard: React.CSSProperties = {
  marginTop: "auto",
  display: "grid",
  gap: "8px",
  paddingTop: "16px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const quickAction: React.CSSProperties = {
  color: "#dff8ff",
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: "13px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  fontWeight: 800,
};

const chatBox: React.CSSProperties = {
  ...panelBase,
  minWidth: 0,
  borderRadius: "26px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
};

const chatHeader: React.CSSProperties = {
  minHeight: "76px",
  padding: "18px 22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  background: "linear-gradient(135deg, rgba(0,198,255,0.10), rgba(124,58,237,0.10), rgba(0,0,0,0.12))",
};

const channelTitleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const channelHash: React.CSSProperties = {
  color: "#67e8f9",
  fontSize: "28px",
  fontWeight: 950,
};

const chatTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "24px",
  letterSpacing: "-0.04em",
};

const chatSubtitle: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#9fb3c8",
  fontSize: "13px",
};

const headerActions: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const soundBtn: React.CSSProperties = {
  padding: "10px 13px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "#fff",
  background: "rgba(255,255,255,0.08)",
  fontWeight: 900,
  cursor: "pointer",
};

const profileBtn: React.CSSProperties = {
  padding: "10px 13px",
  borderRadius: "999px",
  border: "1px solid rgba(0,198,255,0.42)",
  color: "#fff",
  background: "rgba(0,198,255,0.14)",
  fontWeight: 900,
  cursor: "pointer",
};

const profileBoxV2: React.CSSProperties = {
  margin: "14px 18px 0",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(0,0,0,0.38)",
  border: "1px solid rgba(0,198,255,0.24)",
  display: "grid",
  gap: "10px",
  boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
};

const profileBoxHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const closeGhostBtn: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.07)",
  color: "#fff",
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontWeight: 900,
  fontSize: "13px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "14px",
  borderRadius: "16px",
  border: "1px solid rgba(0,198,255,0.26)",
  background: "rgba(3,8,18,0.94)",
  color: "#fff",
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
};

const fileInputStyle: React.CSSProperties = {
  color: "#cbd5e1",
};

const infoText: React.CSSProperties = {
  color: "#67e8f9",
  margin: 0,
};

const announcementBoxV2: React.CSSProperties = {
  margin: "14px 18px 0",
  padding: "15px 17px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, rgba(125,58,237,0.18), rgba(0,198,255,0.08), rgba(0,0,0,0.25))",
  border: "1px solid rgba(125,58,237,0.45)",
  boxShadow: "0 0 28px rgba(125,58,237,0.16)",
};

const announcementHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
};

const announcementSub: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#67e8f9",
  fontSize: "12px",
  fontWeight: 900,
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
  minHeight: "120px",
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
  minHeight: 0,
  padding: "20px 22px",
  overflowY: "auto",
  background: "radial-gradient(circle at 82% 20%, rgba(0,198,255,0.07), transparent 34%), linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.28))",
};

const emptyState: React.CSSProperties = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  color: "#8ea0b6",
};

const emptyIcon: React.CSSProperties = {
  fontSize: "42px",
  marginBottom: "10px",
};

const emptyText: React.CSSProperties = {
  color: "#dbeafe",
  textAlign: "center",
  margin: 0,
  fontWeight: 900,
};

const emptyHint: React.CSSProperties = {
  marginTop: "6px",
  fontSize: "13px",
};

const messageLine: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "46px minmax(0, 1fr)",
  gap: "12px",
  padding: "9px 8px",
  borderRadius: "16px",
  marginBottom: "8px",
  transition: "background 0.16s ease",
};

const avatarWrapMsg: React.CSSProperties = {
  position: "relative",
  width: "44px",
  height: "44px",
  minWidth: "44px",
};

const avatarWrapSmall: React.CSSProperties = {
  position: "relative",
  width: "40px",
  height: "40px",
  minWidth: "40px",
  flexShrink: 0,
};

const avatarWrap: React.CSSProperties = {
  position: "relative",
  width: "48px",
  height: "48px",
  flexShrink: 0,
};

const avatarSmall: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.8)",
  boxShadow: "0 0 20px rgba(0,198,255,0.70)",
};

const avatarMsg: React.CSSProperties = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.75)",
  boxShadow: "0 0 15px rgba(0,198,255,0.48)",
};

const avatarMember: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.55)",
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

const onlineDotSmall: React.CSSProperties = {
  position: "absolute",
  right: "-1px",
  bottom: "-1px",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  border: "2px solid #07111f",
};

const messageContent: React.CSSProperties = {
  minWidth: 0,
};

const messageMeta: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  marginBottom: "5px",
  fontSize: "13px",
  flexWrap: "wrap",
};

const messageTime: React.CSSProperties = {
  color: "#7f8ea3",
  fontSize: "12px",
};

const messageStatus: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
};

const messageBubbleV2: React.CSSProperties = {
  display: "inline-block",
  maxWidth: "min(720px, 100%)",
  padding: "10px 13px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  lineHeight: 1.5,
  fontSize: "15px",
  wordBreak: "break-word",
  whiteSpace: "pre-line",
};

const replyPreviewBoxClean: React.CSSProperties = {
  marginBottom: "9px",
  padding: "8px 10px",
  borderLeft: "3px solid rgba(0,198,255,0.75)",
  color: "#9fb3c8",
  fontSize: "13px",
  background: "rgba(0,0,0,0.22)",
  borderRadius: "10px",
};

const chatImageStyle: React.CSSProperties = {
  marginTop: "10px",
  maxWidth: "300px",
  maxHeight: "300px",
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
  marginTop: "6px",
  flexWrap: "wrap",
};

const reactionBtn: React.CSSProperties = {
  height: "26px",
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
  transition: "transform 0.22s cubic-bezier(.2,1.6,.4,1), box-shadow 0.22s ease",
};

const reactionBtnActive: React.CSSProperties = {
  background: "rgba(0,198,255,0.20)",
  border: "1px solid rgba(0,198,255,0.75)",
  boxShadow: "0 0 16px rgba(0,198,255,0.50)",
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
  marginTop: "5px",
  flexWrap: "wrap",
  transition: "opacity 0.16s ease",
};

const replyBtn: React.CSSProperties = {
  background: "rgba(0,198,255,0.12)",
  color: "#67e8f9",
  border: "1px solid rgba(0,198,255,0.35)",
  borderRadius: "10px",
  padding: "6px 9px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
};

const deleteBtn: React.CSSProperties = {
  background: "rgba(255,70,70,0.16)",
  color: "#ffb3b3",
  border: "1px solid rgba(255,90,90,0.45)",
  borderRadius: "10px",
  padding: "6px 9px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
};

const typingBox: React.CSSProperties = {
  padding: "8px 18px",
  color: "#67e8f9",
  fontSize: "13px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,198,255,0.06)",
};

const typingDots: React.CSSProperties = {
  color: "#8b5cf6",
  marginRight: "6px",
};

const replyBar: React.CSSProperties = {
  padding: "10px 16px",
  background: "rgba(0,198,255,0.10)",
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
  padding: "14px 16px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(2,6,15,0.92)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const plusBtn: React.CSSProperties = {
  width: "46px",
  minWidth: "46px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.07)",
  color: "#fff",
  fontSize: "22px",
  cursor: "pointer",
};

const emojiPickerBox: React.CSSProperties = {
  position: "absolute",
  bottom: "58px",
  left: 0,
  width: "340px",
  padding: "12px",
  borderRadius: "18px",
  border: "1px solid rgba(0,198,255,0.32)",
  background:
    "linear-gradient(180deg, rgba(7,18,38,0.98), rgba(3,8,18,0.98))",
  boxShadow:
    "0 18px 45px rgba(0,0,0,0.55), 0 0 26px rgba(0,198,255,0.20)",
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "8px",
  zIndex: 999,
};

const emojiPickerBtn: React.CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: "20px",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};

const imageUploadBtn: React.CSSProperties = {
  width: "48px",
  minWidth: "48px",
  borderRadius: "16px",
  border: "1px solid rgba(0,198,255,0.45)",
  background: "rgba(0,198,255,0.14)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "19px",
  fontWeight: 900,
  boxShadow: "0 0 18px rgba(0,198,255,0.12)",
};

const btnStyle: React.CSSProperties = {
  padding: "13px 18px",
  borderRadius: "16px",
  border: "none",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
  background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
  boxShadow: "0 12px 30px rgba(0,114,255,0.42)",
};

const newMessageBadge: React.CSSProperties = {
  position: "absolute",
  top: "88px",
  right: "22px",
  zIndex: 20,
  padding: "9px 15px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "linear-gradient(135deg, #ff3b3b, #b00020)",
  color: "#fff",
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 0 24px rgba(255,60,60,0.45)",
};

const onlinePanel: React.CSSProperties = {
  ...panelBase,
  borderRadius: "26px",
  padding: "18px",
  overflowY: "auto",
};

const onlineHeaderV2: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const onlineTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "19px",
  letterSpacing: "-0.03em",
};

const onlineCount: React.CSSProperties = {
  color: "#9ca3af",
  margin: "5px 0 0",
  fontSize: "13px",
  fontWeight: 800,
};

const onlineGrid: React.CSSProperties = {
  display: "grid",
  gap: "10px",
  marginTop: "16px",
};

const onlineMemberCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  borderRadius: "16px",
  background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(0,198,255,0.045))",
  border: "1px solid rgba(255,255,255,0.10)",
};

const activityCard: React.CSSProperties = {
  marginTop: "18px",
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#dbeafe",
  fontSize: "13px",
  lineHeight: 1.45,
};

const adminBadge: React.CSSProperties = {
  color: "#000",
  background: "linear-gradient(135deg, #ffe58a, #ffb300)",
  fontSize: "10px",
  fontWeight: 950,
  marginLeft: "7px",
  padding: "3px 7px",
  borderRadius: "999px",
  boxShadow: "0 0 12px rgba(255,215,100,0.50)",
};
const mentionBox: React.CSSProperties = {
  position: "absolute",
  bottom: "62px",
  left: 0,
  width: "360px",
  maxHeight: "320px",
  overflowY: "auto",
  borderRadius: "18px",
  background:
    "linear-gradient(180deg, rgba(7,18,38,0.98), rgba(3,8,18,0.98))",
  border: "1px solid rgba(0,198,255,0.28)",
  boxShadow:
    "0 18px 45px rgba(0,0,0,0.55), 0 0 30px rgba(0,198,255,0.15)",
  zIndex: 9999,
  padding: "6px",
};

const mentionItem: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  borderRadius: "14px",
  border: "none",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
  textAlign: "left",
};

const mentionAvatar: React.CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.45)",
};

const mentionUsername: React.CSSProperties = {
  fontWeight: 900,
  color: "#fff",
  fontSize: "14px",
};

const mentionEmail: React.CSSProperties = {
  fontSize: "11px",
  color: "#8fa3bd",
};
