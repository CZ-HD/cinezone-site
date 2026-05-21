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

  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);

  const isAdmin =
    profile?.role === "admin" ||
    CREATOR_EMAILS.includes(user?.email || "");

  useEffect(() => {
    init();

    const commentsChannel = supabase
      .channel("comments-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
        },
        async () => {
          await loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
    };
  }, [itemId, itemType]);

  async function init() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      setLoading(false);
      return;
    }

    setUser(data.user);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    setProfile(profileData);

    await loadComments();
    await loadReactions();

    setLoading(false);
  }

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("item_id", String(itemId))
      .eq("item_type", itemType)
      .order("created_at", { ascending: true });

    setComments(data || []);
  };

  const loadReactions = async () => {
    const { data } = await supabase
      .from("comment_reactions")
      .select("*");

    setReactions(data || []);
  };

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

  const sendComment = async () => {
    if (!text.trim() || !user) return;

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
        content: text.trim(),
        parent_id: null,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setText("");

    await loadComments();
  };

  const sendReply = async () => {
    if (!replyText.trim() || !replyTo || !user)
      return;

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
        content: replyText.trim(),
        parent_id: replyTo.id,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setReplyText("");
    setReplyTo(null);

    await loadComments();
  };

  const deleteComment = async (
    commentId: string
  ) => {
    if (!isAdmin) return;

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
    comments.filter(
      (comment) =>
        comment.parent_id === commentId
    );

  return (
    <section style={box}>
      <h2 style={{ color: "#fff" }}>
        💬 Commentaires ({comments.length})
      </h2>

      <div style={{ ...inputBox, position: "relative" }}>
        <input
          value={text}
          onChange={async (e) => {
            const value = e.target.value;

            setText(value);

            const match =
              value.match(
                /@([a-zA-Z0-9._-]*)$/
              );

            if (match) {
              setShowMentions(true);
              await searchMentions(match[1]);
            } else {
              setShowMentions(false);
            }
          }}
          placeholder="Écrire un commentaire..."
          style={input}
        />

        {showMentions &&
          mentionResults.length > 0 && (
            <div style={mentionsBox}>
              {mentionResults.map((member) => (
                <div
                  key={member.id}
                  style={mentionItem}
                  onClick={() => {
                    setText(
                      text.replace(
                        /@([a-zA-Z0-9._-]*)$/,
                        `@${member.username} `
                      )
                    );

                    setShowMentions(false);
                  }}
                >
                  <img
                    src={
                      member.avatar ||
                      DEFAULT_AVATAR
                    }
                    style={mentionAvatar}
                  />

                  <span style={{ color: "#fff" }}>
                    @{member.username}
                  </span>
                </div>
              ))}
            </div>
          )}

        <button
          onClick={sendComment}
          style={btn}
        >
          Envoyer
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#aaa" }}>
          Chargement...
        </p>
      ) : (
        <div style={list}>
          {parentComments.map((comment) => {
            const replies = getReplies(
              comment.id
            );

            return (
              <div
                key={comment.id}
                style={card}
              >
                <img
                  src={
                    comment.avatar ||
                    DEFAULT_AVATAR
                  }
                  style={avatar}
                />

                <div style={{ flex: 1 }}>
                  <div style={topRow}>
                    <strong
                      style={{
                        color:
                          comment.role ===
                          "admin"
                            ? "gold"
                            : "#00c6ff",
                      }}
                    >
                      {comment.username}
                    </strong>

                    <span style={dateText}>
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

                  <div style={reactionRow}>
                    {REACTION_EMOJIS.map(
                      (emoji) => (
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
                            ...(hasReacted(
                              comment.id,
                              emoji
                            )
                              ? reactionBtnActive
                              : {}),
                          }}
                        >
                          {emoji}{" "}
                          {getReactionCount(
                            comment.id,
                            emoji
                          ) || ""}
                        </button>
                      )
                    )}
                  </div>

                  <div style={actionRow}>
                    <button
                      style={replyBtn}
                      onClick={() =>
                        setReplyTo(comment)
                      }
                    >
                      Répondre
                    </button>

                    {isAdmin && (
                      <button
                        style={deleteBtn}
                        onClick={() =>
                          deleteComment(
                            comment.id
                          )
                        }
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  {replyTo?.id ===
                    comment.id && (
                    <div
                      style={
                        replyInputBox
                      }
                    >
                      <input
                        value={replyText}
                        onChange={(e) =>
                          setReplyText(
                            e.target.value
                          )
                        }
                        style={input}
                        placeholder="Réponse..."
                      />

                      <button
                        onClick={
                          sendReply
                        }
                        style={btn}
                      >
                        Envoyer
                      </button>
                    </div>
                  )}

                  {replies.length > 0 && (
                    <div
                      style={repliesBox}
                    >
                      {replies.map(
                        (reply) => (
                          <div
                            key={reply.id}
                            style={
                              replyCard
                            }
                          >
                            <img
                              src={
                                reply.avatar ||
                                DEFAULT_AVATAR
                              }
                              style={
                                avatarSmall
                              }
                            />

                            <div>
                              <strong
                                style={{
                                  color:
                                    "#00c6ff",
                                }}
                              >
                                {
                                  reply.username
                                }
                              </strong>

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
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b0f18",
  color: "#fff",
};

const btn: React.CSSProperties = {
  padding: "15px 20px",
  borderRadius: "16px",
  border: "none",
  color: "#fff",
  fontWeight: 900,
  background:
    "linear-gradient(135deg, #00c6ff, #0072ff)",
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
    "rgba(255,255,255,0.05)",
};

const avatar: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
};

const avatarSmall: React.CSSProperties = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

const dateText: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
};

const contentStyle: React.CSSProperties = {
  color: "#fff",
};

const reactionRow: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  marginTop: "10px",
};

const reactionBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "999px",
  padding: "6px 10px",
  background:
    "rgba(255,255,255,0.08)",
  color: "#fff",
  cursor: "pointer",
};

const reactionBtnActive: React.CSSProperties = {
  background:
    "rgba(0,198,255,0.3)",
};

const actionRow: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  marginTop: "10px",
};

const replyBtn: React.CSSProperties = {
  border: "none",
  background:
    "rgba(0,198,255,0.15)",
  color: "#67e8f9",
  borderRadius: "10px",
  padding: "6px 10px",
  cursor: "pointer",
};

const deleteBtn: React.CSSProperties = {
  border: "none",
  background:
    "rgba(255,0,0,0.15)",
  color: "#ffb4b4",
  borderRadius: "10px",
  padding: "6px 10px",
  cursor: "pointer",
};

const replyInputBox: React.CSSProperties = {
  marginTop: "12px",
  display: "flex",
  gap: "10px",
};

const repliesBox: React.CSSProperties = {
  marginTop: "14px",
  paddingLeft: "14px",
  borderLeft:
    "2px solid rgba(0,198,255,0.2)",
  display: "grid",
  gap: "10px",
};

const replyCard: React.CSSProperties = {
  display: "flex",
  gap: "10px",
};

const replyContent: React.CSSProperties = {
  color: "#fff",
  margin: 0,
};

const mentionsBox: React.CSSProperties = {
  position: "absolute",
  top: "62px",
  left: "0",
  width: "320px",
  background: "#1c1f26",
  borderRadius: "16px",
  padding: "8px",
  zIndex: 9999,
};

const mentionItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  cursor: "pointer",
};

const mentionAvatar: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
};
