# app/chat/page.tsx

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=0D1117&color=fff&name=User";

const CHAT_EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🔥",
  "👍",
  "❤️",
  "🎉",
  "😎",
  "🤝",
  "😭",
];

type Profile = {
  username?: string;
  avatar?: string;
  status_text?: string;
};

type Message = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  room?: string;
  reply_to?: string | null;
  profiles?: Profile;
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
  username: string;
  avatar?: string;
  status_text?: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [mentionUsers, setMentionUsers] = useState<OnlineMember[]>([]);
  const [showMentions, setShowMentions] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = useMemo(() => {
    return user?.email === "admin@cinezone.fr";
  }, [user]);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const initialize = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username, avatar, status_text")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      }

      const { data: messagesData } = await supabase
        .from("messages")
        .select(`
          *,
          profiles (
            username,
            avatar,
            status_text
          )
        `)
        .order("created_at", {
          ascending: true,
        });

      if (messagesData) {
        setMessages(messagesData as Message[]);
      }

      const { data: reactionsData } = await supabase
        .from("message_reactions")
        .select("*");

      if (reactionsData) {
        setReactions(reactionsData as Reaction[]);
      }

      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, username, avatar, status_text");

      if (usersData) {
        setOnlineMembers(
          usersData.map((u: any) => ({
            user_id: u.id,
            username: u.username,
            avatar: u.avatar,
            status_text: u.status_text,
          }))
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendTyping = () => {
    console.log("typing...");
  };

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    const originalMessage = text.trim();

    setText("");
    setShowMentions(false);

    try {
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: originalMessage,
        user_id: user.id,
        created_at: new Date().toISOString(),
        room: "general",
        reply_to: replyTo?.id || null,
        profiles: {
          username:
            profile?.username || "Utilisateur",
          avatar:
            profile?.avatar || DEFAULT_AVATAR,
          status_text:
            profile?.status_text ||
            "🟢 En ligne",
        },
      };

      setMessages((prev) => [
        ...prev,
        tempMessage,
      ]);

      const { data, error } = await supabase
        .from("messages")
        .insert({
          content: originalMessage,
          user_id: user.id,
          room: "general",
          reply_to: replyTo?.id || null,
        })
        .select(`
          *,
          profiles (
            username,
            avatar,
            status_text
          )
        `)
        .single();

      if (error) {
        console.error(error);

        setMessages((prev) =>
          prev.filter(
            (m) => m.id !== tempMessage.id
          )
        );

        setText(originalMessage);

        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempMessage.id ? data : m
        )
      );

      setReplyTo(null);
    } catch (error) {
      console.error(error);
      setText(originalMessage);
    }
  };

  const addReaction = async (
    messageId: string,
    emoji: string
  ) => {
    if (!user) return;

    const tempReaction: Reaction = {
      id: `temp-${Date.now()}`,
      message_id: messageId,
      user_id: user.id,
      emoji,
      created_at: new Date().toISOString(),
    };

    setReactions((prev) => [
      ...prev,
      tempReaction,
    ]);

    const { error } = await supabase
      .from("message_reactions")
      .insert({
        message_id: messageId,
        user_id: user.id,
        emoji,
      });

    if (error) {
      setReactions((prev) =>
        prev.filter(
          (r) => r.id !== tempReaction.id
        )
      );
    }
  };

  const deleteMessage = async (
    messageId: string
  ) => {
    if (!isAdmin) return;

    if (!confirm("Supprimer ce message ?")) {
      return;
    }

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      alert(error.message);
      return;
    }

    setMessages((prev) =>
      prev.filter((m) => m.id !== messageId)
    );
  };

  const getMessageReactions = (
    messageId: string
  ) => {
    return reactions.filter(
      (r) => r.message_id === messageId
    );
  };

  const displayName =
    profile?.username ||
    user?.email ||
    "Utilisateur";

  const avatarUrl =
    profile?.avatar || DEFAULT_AVATAR;

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={loadingCard}>
          Chargement du chat CineZone...
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <aside style={roomsPanel}>
          <div style={brandCard}>
            <div style={brandLogo}>CZ</div>

            <div>
              <h2 style={brandTitle}>
                CineZone
              </h2>

              <p style={brandSub}>
                Chat communautaire
              </p>
            </div>
          </div>
        </aside>

        <section style={chatPanel}>
          <div style={messagesContainer}>
            {messages.map((message) => {
              const messageReactions =
                getMessageReactions(message.id);

              return (
                <div
                  key={message.id}
                  style={messageCard}
                >
                  <img
                    src={
                      message.profiles?.avatar ||
                      DEFAULT_AVATAR
                    }
                    alt=""
                    style={avatarStyle}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={messageHeader}>
                      <strong>
                        @
                        {message.profiles
                          ?.username ||
                          "Utilisateur"}
                      </strong>

                      <span
                        style={messageDate}
                      >
                        {new Date(
                          message.created_at
                        ).toLocaleTimeString()}
                      </span>
                    </div>

                    <div style={messageText}>
                      {message.content}
                    </div>

                    <div style={reactionBar}>
                      {CHAT_EMOJIS.slice(0, 5).map(
                        (emoji) => (
                          <button
                            key={emoji}
                            style={reactionButton}
                            onClick={() =>
                              addReaction(
                                message.id,
                                emoji
                              )
                            }
                          >
                            {emoji}
                          </button>
                        )
                      )}

                      {messageReactions.map(
                        (reaction) => (
                          <span
                            key={reaction.id}
                            style={reactionView}
                          >
                            {reaction.emoji}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      style={deleteBtn}
                      onClick={() =>
                        deleteMessage(message.id)
                      }
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>

          <div style={inputBox}>
            <div
              style={{
                position: "relative",
              }}
            >
              <button
                type="button"
                style={plusBtn}
                onClick={() =>
                  setShowEmojiPicker(
                    (prev) => !prev
                  )
                }
              >
                +
              </button>

              {showEmojiPicker && (
                <div style={emojiPickerBox}>
                  {CHAT_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      style={emojiPickerBtn}
                      onClick={() => {
                        setText(
                          (prev) =>
                            `${prev}${emoji}`
                        );

                        setShowEmojiPicker(false);
                      }}
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
              }}
            >
              <input
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  sendTyping();

                  const value =
                    e.target.value;

                  if (value.includes("@")) {
                    const search = value
                      .split("@")
                      .pop()
                      ?.toLowerCase();

                    const filtered =
                      onlineMembers.filter(
                        (member) =>
                          member.username
                            .toLowerCase()
                            .includes(
                              search || ""
                            )
                      );

                    setMentionUsers(filtered);
                    setShowMentions(true);
                  } else {
                    setShowMentions(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Écris dans #général... (${displayName})`}
                style={inputStyle}
              />

              {showMentions &&
                mentionUsers.length > 0 && (
                  <div style={mentionsBox}>
                    {mentionUsers.map(
                      (member) => (
                        <button
                          key={member.user_id}
                          style={mentionBtn}
                          onClick={() => {
                            const beforeAt =
                              text.substring(
                                0,
                                text.lastIndexOf(
                                  "@"
                                )
                              );

                            setText(
                              `${beforeAt}@${member.username} `
                            );

                            setShowMentions(false);
                          }}
                        >
                          <img
                            src={
                              member.avatar ||
                              DEFAULT_AVATAR
                            }
                            alt=""
                            style={mentionAvatar}
                          />

                          <div>
                            <div>
                              @{member.username}
                            </div>

                            <div
                              style={{
                                fontSize: 12,
                                opacity: 0.7,
                              }}
                            >
                              {member.status_text ||
                                "🟢 En ligne"}
                            </div>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
            </div>

            <button
              style={sendBtn}
              onClick={sendMessage}
            >
              Envoyer
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  background: "#070B14",
  minHeight: "100vh",
  color: "white",
  padding: 20,
};

const shellStyle: React.CSSProperties = {
  display: "flex",
  gap: 20,
};

const roomsPanel: React.CSSProperties = {
  width: 260,
};

const brandCard: React.CSSProperties = {
  background: "#111827",
  borderRadius: 20,
  padding: 20,
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const brandLogo: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  background: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
};

const brandTitle: React.CSSProperties = {
  margin: 0,
};

const brandSub: React.CSSProperties = {
  opacity: 0.7,
  marginTop: 4,
};

const chatPanel: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const messagesContainer: React.CSSProperties = {
  background: "#111827",
  borderRadius: 20,
  padding: 20,
  height: "75vh",
  overflowY: "auto",
};

const messageCard: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginBottom: 18,
  background: "#1F2937",
  padding: 14,
  borderRadius: 16,
};

const avatarStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  objectFit: "cover",
};

const messageHeader: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const messageDate: React.CSSProperties = {
  opacity: 0.6,
  fontSize: 12,
};

const messageText: React.CSSProperties = {
  marginTop: 6,
};

const reactionBar: React.CSSProperties = {
  display: "flex",
  gap: 6,
  marginTop: 10,
  flexWrap: "wrap",
};

const reactionButton: React.CSSProperties = {
  background: "#374151",
  border: "none",
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
};

const reactionView: React.CSSProperties = {
  background: "#2563eb",
  borderRadius: 10,
  padding: "4px 8px",
};

const deleteBtn: React.CSSProperties = {
  background: "#dc2626",
  border: "none",
  color: "white",
  borderRadius: 10,
  padding: "8px 12px",
  cursor: "pointer",
};

const inputBox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#111827",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white",
  padding: 16,
  borderRadius: 16,
  outline: "none",
};

const sendBtn: React.CSSProperties = {
  background: "#2563eb",
  border: "none",
  color: "white",
  padding: "14px 18px",
  borderRadius: 16,
  cursor: "pointer",
};

const plusBtn: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 14,
  border: "none",
  background: "#1F2937",
  color: "white",
  cursor: "pointer",
};

const emojiPickerBox: React.CSSProperties = {
  position: "absolute",
  bottom: 58,
  left: 0,
  background: "#111827",
  borderRadius: 16,
  padding: 12,
  display: "grid",
  gridTemplateColumns: "repeat(5,1fr)",
  gap: 8,
  zIndex: 999,
};

const emojiPickerBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
};

const mentionsBox: React.CSSProperties = {
  position: "absolute",
  bottom: 58,
  left: 0,
  width: "100%",
  background: "#111827",
  borderRadius: 16,
  overflow: "hidden",
  zIndex: 999,
};

const mentionBtn: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  color: "white",
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: 12,
  cursor: "pointer",
};

const mentionAvatar: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: "50%",
};

const loadingCard: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  fontSize: 20,
};
```
