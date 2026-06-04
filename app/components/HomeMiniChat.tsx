"use client";

import Link from "next/link";

export default function HomeMiniChat() {
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
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "21px" }}>💬</span>

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

      <Message
        letter="V"
        pseudo="Vadrox"
        color="#ffd54a"
        badge="ADMIN"
        message="Bienvenue sur CineZone !"
      />

      <Message
        letter="M"
        pseudo="Membre"
        color="#47c7ff"
        badge="MEMBRE"
        message="Merci pour le dernier upload 👍"
      />

      <Message
        letter="S"
        pseudo="Staff"
        color="#d68dff"
        badge="STAFF"
        message="Les nouveautés arrivent bientôt."
      />

      <div
        style={{
          height: "1px",
          background: "rgba(255,255,255,.06)",
          margin: "10px 0 12px 0",
        }}
      />

      {/* BAS */}

      <div
        style={{
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
            border: "1px solid rgba(255,255,255,.06)",
            background: "rgba(255,255,255,.04)",
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
            background:
              "linear-gradient(135deg,#12c8ff,#1f7dff)",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            textDecoration: "none",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "20px",

            boxShadow: "0 0 15px rgba(0,180,255,.20)",
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
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg,#15c8ff,#1985ff)",

          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          color: "#fff",
          fontWeight: "bold",
          fontSize: "18px",

          flexShrink: 0,

          boxShadow:
            "0 0 12px rgba(0,180,255,.22)",
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
              background: "rgba(255,255,255,.10)",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
            }}
          >
            {badge}
          </span>
        </div>

        <div
          style={{
            color: "#e3eefc",
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
