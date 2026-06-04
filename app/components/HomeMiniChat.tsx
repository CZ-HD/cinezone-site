"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MessageType = {
  id: string;
  username: string;
  avatar: string;
  content: string;
};

const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/adult-7.png";

export default function HomeMiniChat() {
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select("id, username, avatar, content")
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) {
      setMessages(data.reverse());
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1050px",
        padding: "16px",
        borderRadius: "18px",
        background:
          "linear-gradient(135deg, rgba(0,20,50,.62), rgba(0,35,70,.52))",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(0,198,255,.22)",
        boxShadow:
          "0 0 30px rgba(0,198,255,.08), inset 0 0 20px rgba(255,255,255,.02)",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "22px" }}>💬</span>

          <span
            style={{
              color: "#69eaff",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            Chat CineZone
          </span>
        </div>

        <div
          style={{
            color: "#58f28b",
            fontSize: "15px",
            fontWeight: 700,
          }}
        >
          🟢 Communauté active
        </div>
      </div>

      {/* Messages */}

      {messages.length === 0 ? (
        <div
          style={{
            color: "#94a3b8",
            textAlign: "center",
            padding: "18px 0",
          }}
        >
          Aucun message pour le moment.
        </div>
      ) : (
        messages.map((msg) => (
          <Message
            key={msg.id}
            avatar={msg.avatar}
            pseudo={msg.username}
            message={msg.content}
          />
        ))
      )}

      <div
        style={{
          height: "1px",
          background: "rgba(255,255,255,.06)",
          margin: "14px 0",
        }}
      />

      {/* Zone d'accès au chat */}

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          disabled
          placeholder="Cliquez sur ➜ pour participer..."
          style={{
            flex: 1,
            height: "42px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,.08)",
            background: "rgba(255,255,255,.04)",
            color: "#94a3b8",
            padding: "0 14px",
            outline: "none",
            fontSize: "15px",
          }}
        />

        <Link
          href="/chat"
          style={{
            width: "48px",
            height: "42px",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textDecoration: "none",
            background:
              "linear-gradient(135deg,#00b7ff,#2563eb)",
            color: "#fff",
            fontSize: "24px",
            fontWeight: "bold",
            boxShadow: "0 0 18px rgba(0,198,255,.35)",
          }}
        >
          ➜
        </Link>
      </div>
    </div>
  );
}

function Message({
  avatar,
  pseudo,
  message,
}: {
  avatar: string;
  pseudo: string;
  message: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "14px",
      }}
    >
      <img
        src={avatar || DEFAULT_AVATAR}
        alt={pseudo}
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(255,255,255,.12)",
          flexShrink: 0,
        }}
      />

      <div
        style={{
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            color: "#67e8f9",
            fontWeight: 800,
            fontSize: "16px",
            marginBottom: "3px",
          }}
        >
          {pseudo}
        </div>

        <div
          style={{
            color: "#dbeafe",
            fontSize: "14px",
            lineHeight: "20px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
