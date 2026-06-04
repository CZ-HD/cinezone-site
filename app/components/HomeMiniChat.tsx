"use client";

import Link from "next/link";

export default function HomeMiniChat() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1050px",
        padding: "18px",
        borderRadius: "18px",
        background:
          "linear-gradient(135deg, rgba(0,18,45,.90), rgba(0,35,70,.80))",
        border: "1px solid rgba(0,198,255,.30)",
        backdropFilter: "blur(10px)",
        boxShadow:
          "0 0 30px rgba(0,198,255,.12), inset 0 0 15px rgba(0,198,255,.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
            color: "#67e8f9",
          }}
        >
          💬 Chat CineZone
        </div>

        <div
          style={{
            color: "#4ade80",
            fontWeight: 700,
          }}
        >
          ● 1 connecté
        </div>
      </div>

      <Message
        avatar="/avatar.png"
        pseudo="Vadrox"
        color="#facc15"
        badge="ADMIN"
        message="Bienvenue sur CineZone !"
      />

      <Message
        avatar="/avatar.png"
        pseudo="Membre"
        color="#38bdf8"
        badge="MEMBRE"
        message="Merci pour le dernier upload 👍"
      />

      <Message
        avatar="/avatar.png"
        pseudo="Staff"
        color="#c084fc"
        badge="STAFF"
        message="Les nouveautés arrivent bientôt."
      />

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          disabled
          placeholder="Tapez votre message..."
          style={{
            flex: 1,
            height: "42px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,.08)",
            background: "rgba(255,255,255,.05)",
            color: "#fff",
            padding: "0 15px",
          }}
        />

        <Link
          href="/chat"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "#00b7ff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            textDecoration: "none",
            fontSize: "20px",
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
  color,
  badge,
  message,
}: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "12px",
      }}
    >
      <img
        src={avatar}
        width={38}
        height={38}
        style={{
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(255,255,255,.15)",
        }}
      />

      <div>
        <div>
          <span
            style={{
              color,
              fontWeight: 800,
            }}
          >
            {pseudo}
          </span>

          <span
            style={{
              marginLeft: "8px",
              padding: "2px 6px",
              borderRadius: "6px",
              fontSize: "10px",
              background: "rgba(255,255,255,.12)",
            }}
          >
            {badge}
          </span>
        </div>

        <div
          style={{
            color: "#dbeafe",
            marginTop: "2px",
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
