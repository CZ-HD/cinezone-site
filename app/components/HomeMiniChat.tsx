```tsx
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
          "linear-gradient(135deg, rgba(0,18,45,.92), rgba(0,35,70,.82))",
        border: "1px solid rgba(0,198,255,.25)",
        backdropFilter: "blur(12px)",
        boxShadow:
          "0 0 30px rgba(0,198,255,.10), inset 0 0 15px rgba(0,198,255,.03)",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
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
          <span style={{ fontSize: "22px" }}>💬</span>

          <span
            style={{
              color: "#67e8f9",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            Chat CineZone
          </span>
        </div>

        <div
          style={{
            color: "#4ade80",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          ● 1 connecté
        </div>
      </div>

      <Message
        letter="V"
        pseudo="Vadrox"
        color="#facc15"
        badge="ADMIN"
        message="Bienvenue sur CineZone !"
      />

      <Message
        letter="M"
        pseudo="Membre"
        color="#38bdf8"
        badge="MEMBRE"
        message="Merci pour le dernier upload 👍"
      />

      <Message
        letter="S"
        pseudo="Staff"
        color="#c084fc"
        badge="STAFF"
        message="Les nouveautés arrivent bientôt."
      />

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          disabled
          placeholder="Rejoindre la discussion..."
          style={{
            flex: 1,
            height: "38px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,.08)",
            background: "rgba(255,255,255,.05)",
            color: "#ffffff",
            padding: "0 14px",
            outline: "none",
            fontSize: "15px",
          }}
        />

        <Link
          href="/chat"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#00c6ff,#0072ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          ➜
        </Link>
      </div>
    </div>
  );
}

function Message({
  letter,
  pseudo,
  color,
  badge,
  message,
}: {
  letter: string;
  pseudo: string;
  color: string;
  badge: string;
  message: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#00c6ff,#0072ff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "18px",
          flexShrink: 0,
          boxShadow: "0 0 10px rgba(0,198,255,.25)",
        }}
      >
        {letter}
      </div>

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              color,
              fontWeight: 800,
              fontSize: "16px",
            }}
          >
            {pseudo}
          </span>

          <span
            style={{
              padding: "2px 7px",
              borderRadius: "6px",
              background: "rgba(255,255,255,.12)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: ".3px",
            }}
          >
            {badge}
          </span>
        </div>

        <div
          style={{
            color: "#dbeafe",
            marginTop: "2px",
            fontSize: "15px",
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
```
