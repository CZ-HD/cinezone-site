"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/adult-7.png";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🔥"];

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

type Comment = {
  id: string;
  item_id: string;
  item_type: string;
  user_id: string;
  username: string;
  avatar: string;
  role: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
};

type CommentReaction = {
  id: string;
  comment_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
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

export default function Comments({
  itemId,
  itemType,
}: {
  itemId: string | number;
  itemType: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<CommentReaction[]>([]);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  // MENTIONS
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);

  const isAdmin =
    profile?.role === "admin" ||
    CREATOR_EMAILS.includes(user?.email || "");

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, email, username, avatar, role")
        .eq("id", data.user.id)
        .single();

      setProfile(profileData);

      await loadComments();
      await loadReactions();

      setLoading(false);
    }

    init();
  }, [itemId, itemType]);

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("item_id", String(itemId))
      .eq("item_type", itemType)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  const loadReactions = async () => {
    const { data } = await supabase
      .from("comment_reactions")
      .select("*");

    setReactions(data || []);
  };

  // SEARCH MENTIONS
  const searchMentions = async (query: string) => {
    if (!query.trim()) {
      setMentionResults([]);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar")
      .ilike("username", `%${query}%`)
      .limit(8);

    setMentionResults(data || []);
  };

  const resolveMentions = async (
    content: string
  ): Promise<ResolvedMentions> => {
    const matches = [...content.matchAll(/@([^\s]+)/g)];

    if (matches.length === 0) {
      return {
        safeContent: content,
        mentionedUsers: [],
      };
    }

    const mentionedUsers: MentionProfile[] = [];

    const alreadyMentioned = new Set<string>();

    for (const match of matches) {
      const value = match[1].trim();

      if (!value) continue;

      const { data: mentionedUser } = await supabase
        .from("profiles")
        .select("id, username, email")
        .or(`username.eq.${value},email.eq.${value}`)
        .maybeSingle();

      if (!mentionedUser?.id) continue;

      if (alreadyMentioned.has(mentionedUser.id))
        continue;

      alreadyMentioned.add(mentionedUser.id);

      mentionedUsers.push(mentionedUser);
    }

    return {
      safeContent: content,
      mentionedUsers,
    };
  };

  const createMentionNotifications = async (
    mentionedUsers: MentionProfile[]
  ) => {
    if (
      !user ||
      !profile ||
      mentionedUsers.length === 0
    )
      return;

    await supabase.from("notifications").insert(
      mentionedUsers.map((member) => ({
        user_id: member.id,
        type: "comment_mention",
        title: "🔔 Mention",
        message: `${
          profile?.username || user.email
        } vous a mentionné.`,
        link: `/movie/${itemId}`,
        read: false,
      }))
    );
  };

  const sendComment = async () => {
    if (!text.trim() || !user) return;

    const content = text.trim();

    setText("");

    const { safeContent, mentionedUsers } =
      await resolveMentions(content);

    const { error } = await supabase
      .from("comments")
      .insert({
        item_id: String(itemId),
        item_type: itemType,
        user_id: user.id,
        username:
          profile?.username || user.email,
        avatar:
          profile?.avatar || DEFAULT_AVATAR,
        role: profile?.role || "user",
        content: safeContent,
        parent_id: null,
      });

    if (error) {
      alert(error.message);
      setText(content);
      return;
    }

    await createMentionNotifications(
      mentionedUsers
    );

    await loadComments();
  };

  const sendReply = async () => {
    if (
      !replyText.trim() ||
      !replyTo ||
      !user
    )
      return;

    const content = replyText.trim();

    setReplyText("");

    const { safeContent, mentionedUsers } =
      await resolveMentions(content);

    const { error } = await supabase
      .from("comments")
      .insert({
        item_id: String(itemId),
        item_type: itemType,
        user_id: user.id,
        username:
          profile?.username || user.email,
        avatar:
          profile?.avatar || DEFAULT_AVATAR,
        role: profile?.role || "user",
        content: safeContent,
        parent_id: replyTo.id,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setReplyTo(null);

    await createMentionNotifications(
      mentionedUsers
    );

    await loadComments();
  };

  const deleteComment = async (
    commentId: string
  ) => {
    if (profile?.role !== "admin") return;

    const confirmDelete = confirm(
      "Supprimer ce commentaire ?"
    );

    if (!confirmDelete) return;

    await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    await loadComments();
  };

  const toggleReaction = async (
    commentId: string,
    emoji: string
  ) => {
    if (!user) return;

    const existing = reactions.find(
      (r) =>
        r.comment_id === commentId &&
        r.user_id === user.id &&
        r.emoji === emoji
    );

    if (existing) {
      await supabase
        .from("comment_reactions")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase
        .from("comment_reactions")
        .insert({
          comment_id: commentId,
          user_id: user.id,
          emoji,
        });
    }

    await loadReactions();
  };

  const getReactionCount = (
    commentId: string,
    emoji: string
  ) =>
    reactions.filter(
      (r) =>
        r.comment_id === commentId &&
        r.emoji === emoji
    ).length;

  const hasReacted = (
    commentId: string,
    emoji: string
  ) =>
    reactions.some(
      (r) =>
        r.comment_id === commentId &&
        r.user_id === user?.id &&
        r.emoji === emoji
    );

  const parentComments = comments.filter(
    (comment) => !comment.parent_id
  );

  const getReplies = (commentId: string) =>
    comments
      .filter(
        (comment) =>
          comment.parent_id === commentId
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );

  return (
    <section style={box}>
      <div style={header}>
        <div>
          <h2 style={{ margin: 0 }}>
            💬 Commentaires
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#9ca9bd",
            }}
          >
            {comments.length} commentaire
            {comments.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* INPUT */}
      <div
        style={{
          ...inputBox,
          position: "relative",
        }}
      >
        <input
          value={text}
          onChange={async (e) => {
            const value = e.target.value;

            setText(value);

            const match =
              value.match(/@(\w*)$/);

            if (match) {
              setShowMentions(true);

              await searchMentions(
                match[1]
              );
            } else {
              setShowMentions(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              sendComment();
          }}
          placeholder="Écrire un commentaire..."
          disabled={!user}
          style={input}
        />

        {/* POPUP MENTIONS */}
        {showMentions &&
          mentionResults.length > 0 && (
            <div style={mentionsBox}>
              {mentionResults.map(
                (member) => (
                  <div
                    key={member.id}
                    style={mentionItem}
                    onClick={() => {
                      const updated =
                        text.replace(
                          /@(\w*)$/,
                          `@${member.username} `
                        );

                      setText(updated);

                      setShowMentions(
                        false
                      );
                    }}
                  >
                    <img
                      src={
                        member.avatar ||
                        DEFAULT_AVATAR
                      }
                      alt=""
                      style={
                        mentionAvatar
                      }
                    />

                    <div>
                      <strong
                        style={{
                          color:
                            "#fff",
                        }}
                      >
                        {
                          member.username
                        }
                      </strong>

                      <div
                        style={{
                          color:
                            "#94a3b8",
                          fontSize:
                            "12px",
                        }}
                      >
                        @
                        {
                          member.username
                        }
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

        <button
          onClick={sendComment}
          disabled={!user}
          style={btn}
        >
          Envoyer
        </button>
      </div>

      {/* COMMENTAIRES */}
      {loading ? (
        <p style={{ color: "#aaa" }}>
          Chargement...
        </p>
      ) : parentComments.length === 0 ? (
        <p style={empty}>
          Aucun commentaire.
        </p>
      ) : (
        <div style={list}>
          {parentComments.map((comment) => {
            const replies = getReplies(
              comment.id
            );

            const isCommentAdmin =
              comment.role === "admin";

            return (
              <div key={comment.id}>
                <div style={card}>
                  <img
                    src={
                      comment.avatar ||
                      DEFAULT_AVATAR
                    }
                    alt=""
                    style={avatar}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={topRow}>
                      <strong
                        style={{
                          color:
                            isCommentAdmin
                              ? "gold"
                              : "#00c6ff",
                        }}
                      >
                        {comment.username}

                        {isCommentAdmin && (
                          <span
                            style={
                              adminBadge
                            }
                          >
                            ADMIN
                          </span>
                        )}
                      </strong>

                      <span
                        style={dateText}
                      >
                        {new Date(
                          comment.created_at
                        ).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>

                    <p style={contentStyle}>
                      {comment.content}
                    </p>

                    {/* REACTIONS */}
                    <div
                      style={reactionRow}
                    >
                      {REACTION_EMOJIS.map(
                        (emoji) => {
                          const count =
                            getReactionCount(
                              comment.id,
                              emoji
                            );

                          const active =
                            hasReacted(
                              comment.id,
                              emoji
                            );

                          return (
                            <button
                              key={emoji}
                              onClick={() =>
                                toggleReaction(
                                  comment.id,
                                  emoji
                                )
                              }
                              style={{
                                ...reactionBtn,
                                ...(active
                                  ? reactionBtnActive
                                  : {}),
                              }}
                            >
                              {emoji}

                              {count > 0 &&
                                count}
                            </button>
                          );
                        }
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div
                      style={actionRow}
                    >
                      <button
                        onClick={() =>
                          setReplyTo(
                            comment
                          )
                        }
                        style={replyBtn}
                      >
                        ↩️ Répondre
                      </button>

                      {profile?.role ===
                        "admin" && (
                        <button
                          onClick={() =>
                            deleteComment(
                              comment.id
                            )
                          }
                          style={
                            deleteBtn
                          }
                        >
                          🗑 Supprimer
                        </button>
                      )}
                    </div>

                    {/* INPUT REPONSE */}
                    {replyTo?.id ===
                      comment.id && (
                      <div
                        style={
                          replyInputBox
                        }
                      >
                        <div
                          style={
                            replyingTo
                          }
                        >
                          Réponse à{" "}
                          {
                            comment.username
                          }

                          <button
                            onClick={() =>
                              setReplyTo(
                                null
                              )
                            }
                            style={
                              cancelReplyBtn
                            }
                          >
                            Annuler
                          </button>
                        </div>

                        <div
                          style={
                            inputBox
                          }
                        >
                          <input
                            value={
                              replyText
                            }
                            onChange={(
                              e
                            ) =>
                              setReplyText(
                                e
                                  .target
                                  .value
                              )
                            }
                            onKeyDown={(
                              e
                            ) => {
                              if (
                                e.key ===
                                "Enter"
                              )
                                sendReply();
                            }}
                            placeholder="Répondre..."
                            style={input}
                          />

                          <button
                            onClick={
                              sendReply
                            }
                            style={btn}
                          >
                            Répondre
                          </button>
                        </div>
                      </div>
                    )}

                    {/* REPONSES */}
                    {replies.length >
                      0 && (
                      <div
                        style={
                          repliesBox
                        }
                      >
                        {replies.map(
                          (reply) => (
                            <div
                              key={
                                reply.id
                              }
                              style={
                                replyCard
                              }
                            >
                              <img
                                src={
                                  reply.avatar ||
                                  DEFAULT_AVATAR
                                }
                                alt=""
                                style={
                                  avatarSmall
                                }
                              />

                              <div
                                style={{
                                  flex: 1,
                                }}
                              >
                                <div
                                  style={
                                    topRow
                                  }
                                >
                                  <strong
                                    style={{
                                      color:
                                        reply.role ===
                                        "admin"
                                          ? "gold"
                                          : "#00c6ff",
                                    }}
                                  >
                                    {
                                      reply.username
                                    }
                                  </strong>

                                  <span
                                    style={
                                      dateText
                                    }
                                  >
                                    {new Date(
                                      reply.created_at
                                    ).toLocaleDateString(
                                      "fr-FR"
                                    )}
                                  </span>
                                </div>

                                <p
                                  style={
                                    replyContent
                                  }
                                >
                                  {
                                    reply.content
                                  }
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

const box: React.CSSProperties = {
  marginTop: "44px",
  padding: "24px",
  borderRadius: "24px",
  background:
    "linear-gradient(180deg, rgba(12,18,30,0.88), rgba(5,8,14,0.92))",
  border:
    "1px solid rgba(0,198,255,0.22)",
  boxShadow:
    "0 20px 70px rgba(0,0,0,0.65)",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "18px",
};

const inputBox: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
};

const input: React.CSSProperties = {
  flex: 1,
  padding: "15px",
  borderRadius: "16px",
  border:
    "1px solid rgba(255,255,255,0.14)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
};

const btn: React.CSSProperties = {
  padding: "15px 20px",
  borderRadius: "16px",
  border: "none",
  color: "#fff",
  fontWeight: 900,
  background:
    "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
  cursor: "pointer",
};

const list: React.CSSProperties = {
  display: "grid",
  gap: "14px",
  marginTop: "22px",
};

const card: React.CSSProperties = {
  display: "flex",
  gap: "14px",
  padding: "16px",
  borderRadius: "18px",
  background:
    "rgba(255,255,255,0.055)",
};

const avatar: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  objectFit: "cover",
};

const avatarSmall: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  objectFit: "cover",
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

const adminBadge: React.CSSProperties = {
  marginLeft: "6px",
  padding: "2px 6px",
  borderRadius: "999px",
  background: "gold",
  color: "#000",
  fontSize: "10px",
};

const dateText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
};

const contentStyle: React.CSSProperties = {
  color: "#fff",
  marginTop: "8px",
};

const reactionRow: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  marginTop: "12px",
};

const reactionBtn: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: "999px",
  border: "none",
  background:
    "rgba(255,255,255,0.08)",
  color: "#fff",
  cursor: "pointer",
};

const reactionBtnActive: React.CSSProperties = {
  background:
    "rgba(0,198,255,0.25)",
};

const actionRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  marginTop: "12px",
};

const replyBtn: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: "10px",
  border: "none",
  background:
    "rgba(0,198,255,0.15)",
  color: "#67e8f9",
  cursor: "pointer",
};

const deleteBtn: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: "10px",
  border: "none",
  background:
    "rgba(255,0,0,0.15)",
  color: "#ffb4b4",
  cursor: "pointer",
};

const replyInputBox: React.CSSProperties = {
  marginTop: "14px",
};

const replyingTo: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  color: "#94a3b8",
};

const cancelReplyBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#ff9b9b",
  cursor: "pointer",
};

const repliesBox: React.CSSProperties = {
  marginTop: "16px",
  paddingLeft: "14px",
  borderLeft:
    "2px solid rgba(0,198,255,0.2)",
  display: "grid",
  gap: "10px",
};

const replyCard: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  background:
    "rgba(255,255,255,0.04)",
  padding: "12px",
  borderRadius: "14px",
};

const replyContent: React.CSSProperties = {
  color: "#fff",
  marginTop: "6px",
};

const empty: React.CSSProperties = {
  color: "#94a3b8",
  textAlign: "center",
  padding: "20px",
};

const mentionsBox: React.CSSProperties = {
  position: "absolute",
  top: "62px",
  left: "0",
  width: "340px",
  maxHeight: "260px",
  overflowY: "auto",
  background: "#1c1f26",
  borderRadius: "18px",
  border:
    "1px solid rgba(255,255,255,0.08)",
  boxShadow:
    "0 20px 60px rgba(0,0,0,0.6)",
  zIndex: 9999,
  padding: "6px",
};

const mentionItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px",
  borderRadius: "12px",
  cursor: "pointer",
};

const mentionAvatar: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  objectFit: "cover",
};
