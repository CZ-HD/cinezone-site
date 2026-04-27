"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState<any>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ================= INIT =================
  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .order("created_at");

      const { data: reacts } = await supabase
        .from("message_reactions")
        .select("*");

      setMessages(msgs || []);
      setReactions(reacts || []);
    }

    init();

    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", table: "messages", schema: "public" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", table: "message_reactions", schema: "public" },
        (payload) => {
          setReactions((prev) => [...prev, payload.new]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", table: "message_reactions", schema: "public" },
        (payload) => {
          setReactions((prev) =>
            prev.filter((r) => r.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= SEND =================
  const sendMessage = async () => {
    if (!text.trim()) return;

    await supabase.from("messages").insert({
      content: text,
      user_id: user.id,
    });

    setText("");
  };

  // ================= REACTIONS =================
  const toggleReaction = async (messageId: string, emoji: string) => {
    const existing = reactions.find(
      (r) =>
        r.message_id === messageId &&
        r.user_id === user.id &&
        r.emoji === emoji
    );

    if (existing) {
      await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase.from("message_reactions").insert({
        message_id: messageId,
        user_id: user.id,
        emoji,
      });
    }
  };

  const getReactions = (messageId: string) => {
    return reactions.filter((r) => r.message_id === messageId);
  };

  // ================= UI =================
  return (
    <main style={page}>
      <div style={chatBox}>
        <div style={messagesBox}>
          {messages.map((msg) => {
            const msgReacts = getReactions(msg.id);

            return (
              <div key={msg.id} style={msgBox}>
                <div>{msg.content}</div>

                {/* REACTIONS */}
                <div style={reactionRow}>
                  {EMOJIS.map((emoji) => {
                    const count = msgReacts.filter(
                      (r) => r.emoji === emoji
                    ).length;

                    const active = msgReacts.some(
                      (r) =>
                        r.emoji === emoji && r.user_id === user?.id
                    );

                    return (
                      <button
                        key={emoji}
                        onClick={() => toggleReaction(msg.id, emoji)}
                        style={{
                          ...reactionBtn,
                          transform: active ? "scale(1.2)" : "scale(1)",
                          boxShadow: active
                            ? "0 0 10px #00c6ff"
                            : "none",
                        }}
                      >
                        {emoji} {count > 0 && count}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <div style={inputBox}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message..."
            style={input}
          />

          <button onClick={sendMessage} style={btn}>
            Envoyer
          </button>
        </div>
      </div>
    </main>
  );
}

// ================= STYLE =================
const page = {
  minHeight: "100vh",
  background: "#000",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const chatBox = {
  width: "600px",
  height: "80vh",
  background: "#0a0f1a",
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column" as const,
};

const messagesBox = {
  flex: 1,
  padding: "20px",
  overflowY: "auto" as const,
};

const msgBox = {
  background: "#111827",
  padding: "12px",
  borderRadius: "12px",
  marginBottom: "12px",
  color: "#fff",
};

const reactionRow = {
  display: "flex",
  gap: "6px",
  marginTop: "8px",
  flexWrap: "wrap" as const,
};

const reactionBtn = {
  background: "rgba(255,255,255,0.1)",
  border: "none",
  borderRadius: "999px",
  padding: "4px 8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  color: "#fff",
};

const inputBox = {
  display: "flex",
  padding: "10px",
  gap: "10px",
};

const input = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "none",
};

const btn = {
  padding: "10px 16px",
  borderRadius: "10px",
  background: "#0072ff",
  color: "#fff",
  border: "none",
};
