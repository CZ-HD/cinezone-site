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

  // MENTIONS FACEBOOK
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);

  const isAdmin =
    profile?.role === "admin" || CREATOR_EMAILS.includes(user?.email || "");

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

  // RECHERCHE MENTIONS
  const searchMentions = async (query: string) => {
    if (!query.trim()) {
      setMentionResults([]);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar")
      .ilike("username", `%${query}%`)
      .limit(6);

    setMentionResults(data || []);
  };

  const resolveMentions = async (
    content: string
  ): Promise<ResolvedMentions> => {
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
          mentionedUser.username
            ? `@${mentionedUser.username}`
            : "@membre"
        );
      }
    }

    return { safeContent, mentionedUsers };
  };

  const createMentionNotifications = async (
    mentionedUsers: MentionProfile[],
    content: string
  ) => {
    if (!user || !profile || mentionedUsers.length === 0) return;

    await supabase.from("notifications").insert(
      mentionedUsers.map((member) => ({
        user_id: member.id,
        type: "comment_mention",
        title: "🔔 Mention dans un commentaire",
        message: `${
          profile?.username || user.email
        } t’a mentionné dans un commentaire.`,
        link: `/movie/${itemId}`,
        read: false,
        read_at: null,
      }))
    );
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
          read_at: null,
        }))
      );
    }
  };

  const sendComment = async () => {
    if (!text.trim() || !user) return;

    const originalContent = text.trim();

    setText("");

    const { safeContent, mentionedUsers } =
      await resolveMentions(originalContent);

    const { error } = await supabase.from("comments").insert({
      item_id: String(itemId),
      item_type: itemType,
      user_id: user.id,
      username: profile?.username || user.email,
      avatar: profile?.avatar || DEFAULT_AVATAR,
      role: profile?.role || "user",
      content: safeContent,
      parent_id: null,
    });

    if (error) {
      alert("Erreur commentaire : " + error.message);

      setText(originalContent);

      return;
    }

    await createAdminNotification(safeContent);

    await createMentionNotifications(
      mentionedUsers,
      safeContent
    );

    await loadComments();
  };

  const sendReply = async () => {
    if (!replyText.trim() || !user || !replyTo) return;

    const originalContent = replyText.trim();

    setReplyText("");

    const { safeContent, mentionedUsers } =
      await resolveMentions(originalContent);

    const { error } = await supabase.from("comments").insert({
      item_id: String(itemId),
      item_type: itemType,
      user_id: user.id,
      username: profile?.username || user.email,
      avatar: profile?.avatar || DEFAULT_AVATAR,
      role: profile?.role || "user",
      content: safeContent,
      parent_id: replyTo.id,
    });

    if (error) {
      alert("Erreur réponse : " + error.message);

      setReplyText(originalContent);

      return;
    }

    setReplyTo(null);

    await createAdminNotification(safeContent);

    await createMentionNotifications(
      mentionedUsers,
      safeContent
    );

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
      const { error } = await supabase
        .from("comment_reactions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        alert("Erreur réaction : " + error.message);

        return;
      }
    } else {
      const { error } = await supabase
        .from("comment_reactions")
        .insert({
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
        (comment) => comment.parent_id === commentId
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
          <h2 style={{ margin: 0 }}>💬 Commentaires</h2>

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

      {/* INPUT COMMENTAIRE */}
      <div style={{ ...inputBox, position: "relative" }}>
        <input
          value={text}
          onChange={async (e) => {
            const value = e.target.value;

            setText(value);

            const match = value.match(/@(\w*)$/);

            if (match) {
              setShowMentions(true);

              await searchMentions(match[1]);
            } else {
              setShowMentions(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendComment();
          }}
          placeholder={
            user
              ? isAdmin
                ? "Écrire un commentaire... (@pseudo)"
                : "Écrire un commentaire..."
              : "Connecte-toi pour commenter..."
          }
          disabled={!user}
          style={input}
        />

        {/* POPUP FACEBOOK */}
        {showMentions &&
          mentionResults.length > 0 && (
            <div style={mentionsBox}>
              {mentionResults.map((member) => (
                <div
                  key={member.id}
                  style={mentionItem}
                  onClick={() => {
                    const updated = text.replace(
                      /@(\w*)$/,
                      `@${member.username} `
                    );

                    setText(updated);

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
                    <strong
                      style={{
                        color: "#fff",
                        fontSize: "14px",
                      }}
                    >
                      {member.username}
                    </strong>

                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "12px",
                      }}
                    >
                      @{member.username}
                    </div>
                  </div>
                </div>
              ))}
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
  background:
    "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
  boxShadow:
    "0 10px 28px rgba(0,114,255,0.35)",
  cursor: "pointer",
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
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
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
  border: "2px solid rgba(0,198,255,0.4)",
};
