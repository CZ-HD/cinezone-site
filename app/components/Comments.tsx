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

type MentionUser = {
  id: string;
  username?: string | null;
  email?: string | null;
  avatar?: string | null;
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

  const [replyTo, setReplyTo] =
    useState<Comment | null>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [mentionResults, setMentionResults] =
    useState<MentionUser[]>([]);

  const [showMentions, setShowMentions] =
    useState(false);

  const [mentionTarget, setMentionTarget] =
    useState<"comment" | "reply">(
      "comment"
    );

  const isAdmin =
    profile?.role === "admin" ||
    CREATOR_EMAILS.includes(
      user?.email || ""
    );

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

    const reactionsChannel = supabase
      .channel("reactions-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comment_reactions",
        },
        async () => {
          await loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        commentsChannel
      );

      supabase.removeChannel(
        reactionsChannel
      );
    };
  }, [itemId, itemType]);

  async function init() {
    const { data } =
      await supabase.auth.getUser();

    if (!data.user) {
      setLoading(false);
      return;
    }

    setUser(data.user);

    const { data: profileData } =
      await supabase
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
      .order("created_at", {
        ascending: true,
      });

    setComments(data || []);
  };

  const loadReactions = async () => {
    const { data } = await supabase
      .from("comment_reactions")
      .select("*");

    setReactions(data || []);
  };

  // SEARCH USERS
  const searchMentions = async (
    query: string
  ) => {
    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      setMentionResults([]);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select(
        "id, username, email, avatar"
      )
      .or(
        `username.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%`
      )
      .limit(10);

    const formatted =
      (data || []).map((member) => ({
        ...member,
        username:
          member.username ||
          member.email?.split("@")[0] ||
          "membre",
      }));

    setMentionResults(formatted);
  };

  // CREATE NOTIFICATIONS
  const createMentionNotifications =
    async (
      content: string
    ) => {
      if (!user || !profile) return;

      const matches = [
        ...content.matchAll(
          /@([a-zA-Z0-9._@-]+)/g
        ),
      ];

      if (matches.length === 0)
        return;

      const alreadyMentioned =
        new Set<string>();

      const notifications: any[] = [];

      for (const match of matches) {
        const value =
          match[1].trim();

        if (!value) continue;

        const { data: member } =
          await supabase
            .from("profiles")
            .select(
              "id, username, email"
            )
            .or(
              `username.eq.${value},email.eq.${value}`
            )
            .maybeSingle();

        if (!member?.id) continue;

        if (member.id === user.id)
          continue;

        if (
          alreadyMentioned.has(
            member.id
          )
        )
          continue;

        alreadyMentioned.add(
          member.id
        );

        notifications.push({
          user_id: member.id,
          type: "comment_mention",
          title:
            "🔔 Mention dans un commentaire",
          message: `${
            profile?.username ||
            user.email
          } vous a mentionné.`,
          link: `/movie/${itemId}`,
          read: false,
        });
      }

      if (notifications.length > 0) {
        await supabase
          .from("notifications")
          .insert(notifications);
      }
    };

  // SEND COMMENT
  const sendComment = async () => {
    if (!text.trim() || !user)
      return;

    const content =
      text.trim();

    const { error } =
      await supabase
        .from("comments")
        .insert({
          item_id: String(itemId),
          item_type: itemType,
          user_id: user.id,
          username:
            profile?.username ||
            user.email,
          avatar:
            profile?.avatar ||
            DEFAULT_AVATAR,
          role:
            profile?.role || "user",
          content,
          parent_id: null,
        });

    if (error) {
      alert(error.message);
      return;
    }

    await createMentionNotifications(
      content
    );

    setText("");
    setShowMentions(false);

    await loadComments();
  };

  // SEND REPLY
  const sendReply = async () => {
    if (
      !replyText.trim() ||
      !replyTo ||
      !user
    )
      return;

    const content =
      replyText.trim();

    const { error } =
      await supabase
        .from("comments")
        .insert({
          item_id: String(itemId),
          item_type: itemType,
          user_id: user.id,
          username:
            profile?.username ||
            user.email,
          avatar:
            profile?.avatar ||
            DEFAULT_AVATAR,
          role:
            profile?.role || "user",
          content,
          parent_id: replyTo.id,
        });

    if (error) {
      alert(error.message);
      return;
    }

    await createMentionNotifications(
      content
    );

    setReplyText("");
    setReplyTo(null);
    setShowMentions(false);

    await loadComments();
  };

  // DELETE
  const deleteComment = async (
    commentId: string
  ) => {
    if (!isAdmin) return;

    const confirmDelete =
      confirm(
        "Supprimer ce commentaire ?"
      );

    if (!confirmDelete) return;

    await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    await loadComments();
  };

  // REACTIONS
  const toggleReaction = async (
    commentId: string,
    emoji: string
  ) => {
    if (!user) return;

    const existing =
      reactions.find(
        (r) =>
          r.comment_id ===
            commentId &&
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
        r.comment_id ===
          commentId &&
        r.emoji === emoji
    ).length;

  const hasReacted = (
    commentId: string,
    emoji: string
  ) =>
    reactions.some(
      (r) =>
        r.comment_id ===
          commentId &&
        r.user_id === user?.id &&
        r.emoji === emoji
    );

  // COMMENTS
  const parentComments =
    comments.filter(
      (comment) =>
        !comment.parent_id
    );

  const getReplies = (
    commentId: string
  ) =>
    comments.filter(
      (comment) =>
        comment.parent_id ===
        commentId
    );

  // INSERT MENTION
  const insertMention = (
    member: MentionUser
  ) => {
    const mentionValue =
      member.username ||
      member.email ||
      "membre";

    if (
      mentionTarget === "comment"
    ) {
      setText((prev) =>
        prev.replace(
          /@([a-zA-Z0-9._@-]*)$/,
          `@${mentionValue} `
        )
      );
    } else {
      setReplyText((prev) =>
        prev.replace(
          /@([a-zA-Z0-9._@-]*)$/,
          `@${mentionValue} `
        )
      );
    }

    setShowMentions(false);
  };

  return (
    <section style={box}>
      <h2 style={{ color: "#fff" }}>
        💬 Commentaires (
        {comments.length})
      </h2>

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
            const value =
              e.target.value;

            setText(value);

            const match =
              value.match(
                /@([a-zA-Z0-9._@-]*)$/
              );

            if (match) {
              setMentionTarget(
                "comment"
              );

              setShowMentions(
                true
              );

              await searchMentions(
                match[1]
              );
            } else {
              setShowMentions(
                false
              );
            }
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter"
            ) {
              sendComment();
            }
          }}
          placeholder="Écrire un commentaire..."
          style={input}
        />

        {/* MENTIONS */}
        {showMentions &&
          mentionResults.length >
            0 && (
            <div
              style={
                mentionsBox
              }
            >
              {mentionResults.map(
                (member) => (
                  <div
                    key={
                      member.id
                    }
                    style={
                      mentionItem
                    }
                    onClick={() =>
                      insertMention(
                        member
                      )
                    }
                  >
                    <img
                      src={
                        member.avatar ||
                        DEFAULT_AVATAR
                      }
                      style={
                        mentionAvatar
                      }
                    />

                    <div>
                      <div
                        style={{
                          color:
                            "#fff",
                          fontWeight:
                            700,
                        }}
                      >
                        @
                        {member.username ||
                          member.email}
                      </div>

                      {member.email && (
                        <div
                          style={{
                            color:
                              "#94a3b8",
                            fontSize:
                              "12px",
                          }}
                        >
                          {
                            member.email
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

        <button
          onClick={
            sendComment
          }
          style={btn}
        >
          Envoyer
        </button>
      </div>

      {/* COMMENTS */}
      {loading ? (
        <p
          style={{
            color: "#aaa",
          }}
        >
          Chargement...
        </p>
      ) : (
        <div style={list}>
          {parentComments.map(
            (comment) => {
              const replies =
                getReplies(
                  comment.id
                );

              return (
                <div
                  key={
                    comment.id
                  }
                  style={card}
                >
                  <img
                    src={
                      comment.avatar ||
                      DEFAULT_AVATAR
                    }
                    style={avatar}
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
                            comment.role ===
                            "admin"
                              ? "gold"
                              : "#00c6ff",
                        }}
                      >
                        {
                          comment.username
                        }
                      </strong>

                      <span
                        style={
                          dateText
                        }
                      >
                        {new Date(
                          comment.created_at
                        ).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>

                    <p
                      style={
                        contentStyle
                      }
                    >
                      {
                        comment.content
                      }
                    </p>

                    {/* REACTIONS */}
                    <div
                      style={
                        reactionRow
                      }
                    >
                      {REACTION_EMOJIS.map(
                        (
                          emoji
                        ) => (
                          <button
                            key={
                              emoji
                            }
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
                            ) ||
                              ""}
                          </button>
                        )
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div
                      style={
                        actionRow
                      }
                    >
                      <button
                        style={
                          replyBtn
                        }
                        onClick={() =>
                          setReplyTo(
                            comment
                          )
                        }
                      >
                        Répondre
                      </button>

                      {isAdmin && (
                        <button
                          style={
                            deleteBtn
                          }
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

                    {/* REPLY INPUT */}
                    {replyTo?.id ===
                      comment.id && (
                      <div
                        style={
                          replyInputBox
                        }
                      >
                        <input
                          value={
                            replyText
                          }
                          onChange={async (
                            e
                          ) => {
                            const value =
                              e
                                .target
                                .value;

                            setReplyText(
                              value
                            );

                            const match =
                              value.match(
                                /@([a-zA-Z0-9._@-]*)$/
                              );

                            if (
                              match
                            ) {
                              setMentionTarget(
                                "reply"
                              );

                              setShowMentions(
                                true
                              );

                              await searchMentions(
                                match[1]
                              );
                            } else {
                              setShowMentions(
                                false
                              );
                            }
                          }}
                          style={
                            input
                          }
                          placeholder="Réponse..."
                        />

                        <button
                          onClick={
                            sendReply
                          }
                          style={
                            btn
                          }
                        >
                          Envoyer
                        </button>
                      </div>
                    )}

                    {/* REPLIES */}
                    {replies.length >
                      0 && (
                      <div
                        style={
                          repliesBox
                        }
                      >
                        {replies.map(
                          (
                            reply
                          ) => (
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
                                style={
                                  avatarSmall
                                }
                              />

                              <div>
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
            }
          )}
        </div>
      )}
    </section>
  );
}

// STYLES

const box: React.CSSProperties =
  {
    marginTop: "44px",
    padding: "24px",
    borderRadius: "24px",
    background:
      "linear-gradient(180deg, rgba(12,18,30,0.88), rgba(5,8,14,0.92))",
  };

const inputBox: React.CSSProperties =
  {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  };

const input: React.CSSProperties =
  {
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
    "linear-gradient(135deg, #00c6ff, #0072ff)",
  cursor: "pointer",
};

const list: React.CSSProperties =
  {
    display: "grid",
    gap: "14px",
    marginTop: "22px",
  };

const card: React.CSSProperties =
  {
    display: "flex",
    gap: "14px",
    padding: "16px",
    borderRadius: "18px",
    background:
      "rgba(255,255,255,0.05)",
  };

const avatar: React.CSSProperties =
  {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
  };

const avatarSmall: React.CSSProperties =
  {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    objectFit: "cover",
  };

const topRow: React.CSSProperties =
  {
    display: "flex",
    justifyContent:
      "space-between",
  };

const dateText: React.CSSProperties =
  {
    color: "#94a3b8",
    fontSize: "12px",
  };

const contentStyle: React.CSSProperties =
  {
    color: "#fff",
  };

const reactionRow: React.CSSProperties =
  {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
  };

const reactionBtn: React.CSSProperties =
  {
    border: "none",
    borderRadius: "999px",
    padding: "6px 10px",
    background:
      "rgba(255,255,255,0.08)",
    color: "#fff",
    cursor: "pointer",
  };

const reactionBtnActive: React.CSSProperties =
  {
    background:
      "rgba(0,198,255,0.3)",
  };

const actionRow: React.CSSProperties =
  {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  };

const replyBtn: React.CSSProperties =
  {
    border: "none",
    background:
      "rgba(0,198,255,0.15)",
    color: "#67e8f9",
    borderRadius: "10px",
    padding: "6px 10px",
    cursor: "pointer",
  };

const deleteBtn: React.CSSProperties =
  {
    border: "none",
    background:
      "rgba(255,0,0,0.15)",
    color: "#ffb4b4",
    borderRadius: "10px",
    padding: "6px 10px",
    cursor: "pointer",
  };

const replyInputBox: React.CSSProperties =
  {
    marginTop: "12px",
    display: "flex",
    gap: "10px",
  };

const repliesBox: React.CSSProperties =
  {
    marginTop: "14px",
    paddingLeft: "14px",
    borderLeft:
      "2px solid rgba(0,198,255,0.2)",
    display: "grid",
    gap: "10px",
  };

const replyCard: React.CSSProperties =
  {
    display: "flex",
    gap: "10px",
  };

const replyContent: React.CSSProperties =
  {
    color: "#fff",
    margin: 0,
  };

const mentionsBox: React.CSSProperties =
  {
    position: "absolute",
    top: "62px",
    left: "0",
    width: "320px",
    maxHeight: "260px",
    overflowY: "auto",
    background: "#1c1f26",
    borderRadius: "16px",
    padding: "8px",
    zIndex: 9999,
    boxShadow:
      "0 20px 50px rgba(0,0,0,0.5)",
  };

const mentionItem: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "12px",
    cursor: "pointer",
  };

const mentionAvatar: React.CSSProperties =
  {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
  };
