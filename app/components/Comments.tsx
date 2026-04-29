"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/Boss.png";

const EMOJIS = ["👍", "❤️", "😂", "🔥"];

export default function Comments({ itemId, itemType }: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    init();
  }, [itemId]);

  async function init() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    setUser(data.user);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    setProfile(profileData);

    loadComments();
    loadReactions();
  }

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("item_id", String(itemId))
      .eq("item_type", itemType)
      .order("created_at", { ascending: false });

    setComments(data || []);
  }

  async function loadReactions() {
    const { data } = await supabase
      .from("comment_reactions")
      .select("*");

    setReactions(data || []);
  }

  async function sendComment() {
    if (!text.trim()) return;

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
    });

    if (error) return alert(error.message);

    // 🔔 notif admin
    const { data: admins } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (admins) {
      for (const admin of admins) {
        await supabase.from("notifications").insert({
          user_id: admin.id,
          type: "comment",
          title: "💬 Nouveau commentaire",
          message: content,
        });
      }
    }

    loadComments();
  }

  async function toggleReaction(commentId: string, emoji: string) {
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
      await supabase.from("comment_reactions").insert({
        comment_id: commentId,
        user_id: user.id,
        emoji,
      });
    }

    loadReactions();
  }

  function countReactions(commentId: string, emoji: string) {
    return reactions.filter(
      (r) => r.comment_id === commentId && r.emoji === emoji
    ).length;
  }

  return (
    <section style={{ marginTop: 40 }}>
      <h2>💬 Commentaires</h2>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire..."
          style={{ flex: 1 }}
        />
        <button onClick={sendComment}>Envoyer</button>
      </div>

      {comments.map((c) => (
        <div key={c.id} style={{ marginTop: 20 }}>
          <b>{c.username}</b>
          <p>{c.content}</p>

          {/* REACTIONS */}
          <div style={{ display: "flex", gap: 10 }}>
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(c.id, emoji)}
              >
                {emoji} {countReactions(c.id, emoji)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
