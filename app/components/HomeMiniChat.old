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
        padding: "18px",
        borderRadius: "22px",
        background:
          "linear-gradient(135deg, rgba(0,15,35,.42), rgba(0,30,55,.32))",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "1px solid rgba(0,198,255,.18)",
        boxShadow:
          "0 0 25px rgba(0,198,255,.08), inset 0 0 15px rgba(255,255,255,.02)",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "24px" }}>💬</span>

          <span
            style={{
              color: "#74eaff",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            Chat CineZone
          </span>
        </div>

        <div
          style={{
            color: "#62f39c",
            fontWeight: 700,
            fontSize: "15px",
          }}
        >
          🟢 Communauté active
        </div>
      </div>

      {/* Messages */}

      {messages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#94a3b8",
            padding: "20px 0",
          }}
        >
          Aucun message.
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
          marginTop: "14px",
          marginBottom: "14px",
          height: "1px",
          background: "rgba(255,255,255,.05)",
        }}
      />

      {/* BARRE CLIQUABLE */}

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <Link
          href="/chat"
          style={{
            flex: 1,
            height: "44px",
            borderRadius: "14px",
            background: "rgba(255,255,255,.035)",
            border: "1px solid rgba(255,255,255,.06)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            color: "#94a3b8",
            fontSize: "15px",
            transition: ".2s",
          }}
        >
          Cliquez ici ou sur ➜ pour participer...
        </Link>

        <Link
          href="/chat"
          style={{
            width: "50px",
            height: "44px",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg,#18bfff,#2563eb)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textDecoration: "none",
            color: "#fff",
            fontSize: "24px",
            fontWeight: "bold",
            boxShadow:
              "0 0 15px rgba(0,198,255,.25)",
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
        marginBottom: "15px",
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
          border: "2px solid rgba(255,255,255,.10)",
          flexShrink: 0,
        }}
        onError={(e) => {
          e.currentTarget.src = DEFAULT_AVATAR;
        }}
      />

      <div style={{ flex: 1 }}>
        <div
          style={{
            color: "#69eaff",
            fontWeight: 800,
            fontSize: "17px",
            marginBottom: "2px",
          }}
        >
          {pseudo}
        </div>

        <div
          style={{
            color: "#dbeafe",
            lineHeight: "21px",
            fontSize: "14px",
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
