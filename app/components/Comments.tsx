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

      {/* INPUT PRINCIPAL */}
      <div style={inputBox}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendComment()}
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
                {/* COMMENT PRINCIPAL */}
                <div style={card}>
                  <img
                    src={comment.avatar || DEFAULT_AVATAR}
                    style={avatar}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={topRow}>
                      <strong
                        style={{ color: isAdmin ? "gold" : "#00c6ff" }}
                      >
                        {comment.username}
                        {isAdmin && <span style={adminBadge}>ADMIN</span>}
                      </strong>

                      <span style={dateText}>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={content}>{comment.content}</p>

                    {/* RÉACTIONS */}
                    <div style={reactionRow}>
                      {REACTION_EMOJIS.map((emoji) => {
                        const count = getReactionCount(comment.id, emoji);
                        const active = hasReacted(comment.id, emoji);

                        return (
                          <button
                            key={emoji}
                            onClick={() =>
                              toggleReaction(comment.id, emoji)
                            }
                            style={{
                              ...reactionBtn,
                              ...(active ? reactionBtnActive : {}),
                            }}
                          >
                            {emoji} {count || ""}
                          </button>
                        );
                      })}
                    </div>

                    {/* ACTIONS */}
                    <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                      <button
                        onClick={() => setReplyTo(comment)}
                        style={replyBtn}
                      >
                        Répondre
                      </button>

                      {profile?.role === "admin" && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          style={deleteBtn}
                        >
                          🗑
                        </button>
                      )}
                    </div>

                    {/* INPUT RÉPONSE */}
                    {replyTo?.id === comment.id && (
                      <div style={{ marginTop: 10 }}>
                        <input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Répondre..."
                          style={input}
                        />
                        <button onClick={sendReply} style={btn}>
                          Envoyer
                        </button>
                      </div>
                    )}

                    {/* RÉPONSES */}
                    {replies.map((reply) => (
                      <div key={reply.id} style={replyCard}>
                        <img src={reply.avatar} style={avatarSmall} />

                        <div>
                          <strong style={{ color: "#00c6ff" }}>
                            {reply.username}
                          </strong>
                          <p style={content}>{reply.content}</p>
                        </div>
                      </div>
                    ))}
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

/* ================== STYLES ================== */

const box = {
  marginTop: 44,
  padding: 24,
  borderRadius: 24,
  background:
    "linear-gradient(180deg, rgba(12,18,30,0.88), rgba(5,8,14,0.92))",
};

const header = {
  marginBottom: 18,
};

const inputBox = {
  display: "flex",
  gap: 10,
  marginBottom: 20,
};

const input = {
  flex: 1,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#0b0f18",
  color: "#fff",
};

const btn = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "#0072ff",
  color: "#fff",
  cursor: "pointer",
};

const list = {
  display: "grid",
  gap: 16,
};

const card = {
  display: "flex",
  gap: 12,
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,0.05)",
};

const replyCard = {
  display: "flex",
  gap: 10,
  marginTop: 10,
  paddingLeft: 20,
};

const avatar = {
  width: 42,
  height: 42,
  borderRadius: "50%",
};

const avatarSmall = {
  width: 30,
  height: 30,
  borderRadius: "50%",
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
};

const adminBadge = {
  marginLeft: 6,
  fontSize: 10,
  background: "gold",
  color: "#000",
  padding: "2px 6px",
  borderRadius: 999,
};

const dateText = {
  fontSize: 12,
  color: "#aaa",
};

const content = {
  marginTop: 6,
  color: "#fff",
};

const reactionRow = {
  display: "flex",
  gap: 6,
  marginTop: 8,
};

const reactionBtn = {
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
};

const reactionBtnActive = {
  background: "#00c6ff",
};

const replyBtn = {
  fontSize: 12,
  background: "transparent",
  border: "none",
  color: "#00c6ff",
  cursor: "pointer",
};

const deleteBtn = {
  fontSize: 12,
  background: "transparent",
  border: "none",
  color: "red",
  cursor: "pointer",
};

const empty = {
  textAlign: "center",
  color: "#aaa",
};
