"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/Boss.png";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🔥"];

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
        .select("id, username, avatar, role")
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
    const { data } = await supabase.from("comment_reactions").select("*");
    setReactions(data || []);
  };

  const createAdminNotification = async (content: string) => {
    if (profile?.role === "admin") return;

    const { data: admins } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (admins?.length) {
      await supabase.from("notifications").insert(
        admins.map((admin) => ({
          user_id: admin.id,
          type: "comment",
          title: "💬 Nouveau commentaire",
          message: content,
          link: `/movie/${itemId}`,
          read: false,
        }))
      );
    }
  };

  const sendComment = async () => {
    if (!text.trim() || !user) return;

    const content = text.trim();
    setText("");

    const { error } = await supabase.from("comments").insert({
      item_id: String(itemId),
      item_type: itemType,
      user_id: user.id,
      username: profile?.username || user.email,
      avatar: profile?.avatar || DEFAULT_AVATAR,
      role: profile?.role || "user",
      content,
      parent_id: null,
    });

    if (error) {
      alert("Erreur commentaire : " + error.message);
      return;
    }

    await createAdminNotification(content);
    await loadComments();
  };

  const sendReply = async () => {
    if (!replyText.trim() || !user || !replyTo) return;

    const content = replyText.trim();
    setReplyText("");

    const { error } = await supabase.from("comments").insert({
      item_id: String(itemId),
      item_type: itemType,
      user_id: user.id,
      username: profile?.username || user.email,
      avatar: profile?.avatar || DEFAULT_AVATAR,
      role: profile?.role || "user",
      content,
      parent_id: replyTo.id,
    });

    if (error) {
      alert("Erreur réponse : " + error.message);
      return;
    }

    setReplyTo(null);
    await createAdminNotification(content);
    await loadComments();
  };

  const deleteComment = async (commentId: string) => {
    if (profile?.role !== "admin") return;
    if (!confirm("Supprimer ce commentaire ?")) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      alert("Erreur suppression : " + error.message);
      return;
    }

    await loadComments();
    await loadReactions();
  };

  const toggleReaction = async (commentId: string, emoji: string) => {
    if (!user) return;

    const existing = reactions.find(
      (r) =>
        r.comment_id === commentId &&
        r.user_id === user.id &&
        r.emoji === emoji
    );

    if (existing) {
      const { error } = await supabase
        .from("comment_reactions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        alert("Erreur réaction : " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("comment_reactions").insert({
        comment_id: commentId,
        user_id: user.id,
        emoji,
      });

      if (error) {
        alert("Erreur réaction : " + error.message);
        return;
      }
    }

    await loadReactions();
  };

  const getReactionCount = (commentId: string, emoji: string) =>
    reactions.filter((r) => r.comment_id === commentId && r.emoji === emoji)
      .length;

  const hasReacted = (commentId: string, emoji: string) =>
    reactions.some(
      (r) =>
        r.comment_id === commentId &&
        r.user_id === user?.id &&
        r.emoji === emoji
    );

  const parentComments = comments.filter((comment) => !comment.parent_id);

  const getReplies = (commentId: string) =>
    comments
      .filter((comment) => comment.parent_id === commentId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

  return (
    <section style={box}>
      <div style={header}>
        <div>
          <h2 style={{ margin: 0 }}>💬 Commentaires</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca9bd" }}>
            {comments.length} commentaire{comments.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div style={inputBox}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendComment();
          }}
          placeholder={
            user ? "Écrire un commentaire..." : "Connecte-toi pour commenter..."
          }
          disabled={!user}
          style={input}
        />

        <button onClick={sendComment} disabled={!user} style={btn}>
          Envoyer
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#aaa" }}>Chargement...</p>
      ) : parentComments.length === 0 ? (
        <p style={empty}>Aucun commentaire pour le moment.</p>
      ) : (
        <div style={list}>
          {parentComments.map((comment) => {
            const replies = getReplies(comment.id);
            const isAdmin = comment.role === "admin";

            return (
              <div key={comment.id}>
                <div style={card}>
                  <img
                    src={comment.avatar || DEFAULT_AVATAR}
                    alt="avatar"
                    style={avatar}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={topRow}>
                      <strong style={{ color: isAdmin ? "gold" : "#00c6ff" }}>
                        {comment.username || "Utilisateur"}
                        {isAdmin && <span style={adminBadge}>ADMIN</span>}
                      </strong>

                      <span style={dateText}>
                        {new Date(comment.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>

                    <p style={content}>{comment.content}</p>

                    <div style={reactionRow}>
                      {REACTION_EMOJIS.map((emoji) => {
                        const count = getReactionCount(comment.id, emoji);
                        const active = hasReacted(comment.id, emoji);

                        return (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(comment.id, emoji)}
                            style={{
                              ...reactionBtn,
                              ...(active ? reactionBtnActive : {}),
                            }}
                          >
                            <span>{emoji}</span>
                            {count > 0 && <span>{count}</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div style={actionRow}>
                      <button onClick={() => setReplyTo(comment)} style={replyBtn}>
                        ↩️ Répondre
                      </button>

                      {profile?.role === "admin" && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          style={deleteBtn}
                        >
                          🗑 Supprimer
                        </button>
                      )}
                    </div>

                    {replyTo?.id === comment.id && (
                      <div style={replyInputBox}>
                        <div style={replyingTo}>
                          Réponse à {comment.username || "Utilisateur"}
                          <button
                            onClick={() => {
                              setReplyTo(null);
                              setReplyText("");
                            }}
                            style={cancelReplyBtn}
                          >
                            Annuler
                          </button>
                        </div>

                        <div style={inputBox}>
                          <input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") sendReply();
                            }}
                            placeholder="Écrire une réponse..."
                            style={input}
                          />
                          <button onClick={sendReply} style={btn}>
                            Répondre
                          </button>
                        </div>
                      </div>
                    )}

                    {replies.length > 0 && (
                      <div style={repliesBox}>
                        {replies.map((reply) => {
                          const replyIsAdmin = reply.role === "admin";

                          return (
                            <div key={reply.id} style={replyCard}>
                              <img
                                src={reply.avatar || DEFAULT_AVATAR}
                                alt="avatar"
                                style={avatarSmall}
                              />

                              <div style={{ flex: 1 }}>
                                <div style={topRow}>
                                  <strong
                                    style={{
                                      color: replyIsAdmin ? "gold" : "#00c6ff",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {reply.username || "Utilisateur"}
                                    {replyIsAdmin && (
                                      <span style={adminBadge}>ADMIN</span>
                                    )}
                                  </strong>

                                  <span style={dateText}>
                                    {new Date(
                                      reply.created_at
                                    ).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>

                                <p style={replyContent}>{reply.content}</p>

                                {profile?.role === "admin" && (
                                  <button
                                    onClick={() => deleteComment(reply.id)}
                                    style={smallDeleteBtn}
                                  >
                                    🗑 Supprimer
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
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
  border: "1px solid rgba(0,198,255,0.22)",
  boxShadow: "0 20px 70px rgba(0,0,0,0.65)",
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
  marginBottom: "0",
};

const input: React.CSSProperties = {
  flex: 1,
  padding: "15px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.14)",
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
  background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
  boxShadow: "0 10px 28px rgba(0,114,255,0.35)",
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
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const avatar: React.CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.55)",
  boxShadow: "0 0 14px rgba(0,198,255,0.35)",
};

const avatarSmall: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid rgba(0,198,255,0.35)",
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
};

const adminBadge: React.CSSProperties = {
  marginLeft: "7px",
  padding: "3px 7px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #ffe58a, #ffb300)",
  color: "#000",
  fontSize: "10px",
  fontWeight: 900,
};

const dateText: React.CSSProperties = {
  color: "#7f8da3",
  fontSize: "12px",
};

const content: React.CSSProperties = {
  color: "#f1f5ff",
  lineHeight: 1.55,
  margin: "8px 0",
};

const reactionRow: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "10px",
};

const reactionBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  padding: "6px 10px",
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.07)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 800,
};

const reactionBtnActive: React.CSSProperties = {
  background: "rgba(0,198,255,0.2)",
  border: "1px solid rgba(0,198,255,0.7)",
  boxShadow: "0 0 14px rgba(0,198,255,0.35)",
};

const actionRow: React.CSSProperties = {
  marginTop: "10px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const replyBtn: React.CSSProperties = {
  padding: "7px 11px",
  borderRadius: "10px",
  border: "1px solid rgba(0,198,255,0.35)",
  background: "rgba(0,198,255,0.1)",
  color: "#67e8f9",
  cursor: "pointer",
  fontWeight: 800,
};

const deleteBtn: React.CSSProperties = {
  padding: "7px 11px",
  borderRadius: "10px",
  border: "1px solid rgba(255,80,80,0.45)",
  background: "rgba(255,40,40,0.15)",
  color: "#ffabab",
  cursor: "pointer",
  fontWeight: 800,
};

const smallDeleteBtn: React.CSSProperties = {
  ...deleteBtn,
  marginTop: "6px",
  padding: "5px 9px",
  fontSize: "12px",
};

const replyInputBox: React.CSSProperties = {
  marginTop: "14px",
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(0,198,255,0.06)",
  border: "1px solid rgba(0,198,255,0.16)",
};

const replyingTo: React.CSSProperties = {
  color: "#9ca9bd",
  fontSize: "13px",
  marginBottom: "10px",
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
};

const cancelReplyBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#ffabab",
  cursor: "pointer",
  fontWeight: 800,
};

const repliesBox: React.CSSProperties = {
  marginTop: "14px",
  paddingLeft: "14px",
  display: "grid",
  gap: "10px",
  borderLeft: "2px solid rgba(0,198,255,0.22)",
};

const replyCard: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(0,0,0,0.24)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const replyContent: React.CSSProperties = {
  color: "#e5edff",
  lineHeight: 1.5,
  margin: "6px 0 0",
  fontSize: "14px",
};

const empty: React.CSSProperties = {
  color: "#8b98aa",
  textAlign: "center",
  padding: "20px",
};
