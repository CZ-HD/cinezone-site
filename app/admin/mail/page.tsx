"use client";

import { useState } from "react";

export default function AdminMailPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sendMail = async () => {
    const res = await fetch("/api/send-mail", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        to,
        subject,
        message,
      }),
    });

    const data = await res.json();

    if (data.messageId || data.success) {
      alert("✅ Mail envoyé !");
    } else {
      alert(JSON.stringify(data, null, 2));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",

        background: `
          radial-gradient(circle at top left, rgba(0,198,255,0.15), transparent 25%),
          radial-gradient(circle at bottom right, rgba(59,130,246,0.18), transparent 30%),
          linear-gradient(to bottom, #020617, #030b1d, #000000)
        `,

        overflow: "hidden",
        position: "relative",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        padding: "40px",
      }}
    >
      {/* Glow haut gauche */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background: "rgba(0,198,255,0.12)",
          filter: "blur(120px)",
          borderRadius: "50%",
          top: "-120px",
          left: "-120px",
        }}
      />

      {/* Glow bas droite */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "rgba(59,130,246,0.12)",
          filter: "blur(120px)",
          borderRadius: "50%",
          bottom: "-100px",
          right: "-100px",
        }}
      />

      {/* Particules */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.2,
        }}
      />

      {/* Carte */}
      <div
        style={{
          width: "100%",
          maxWidth: "760px",

          background: "rgba(10,15,30,0.82)",

          border: "1px solid rgba(0,198,255,0.25)",

          borderRadius: "28px",

          padding: "40px",

          backdropFilter: "blur(16px)",

          boxShadow: `
            0 0 50px rgba(0,198,255,0.12),
            inset 0 0 30px rgba(255,255,255,0.02)
          `,

          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Ligne glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "2px",
            background:
              "linear-gradient(to right, transparent, #00c6ff, transparent)",
          }}
        />

        <h1
          style={{
            color: "white",
            fontSize: "42px",
            fontWeight: "bold",
            marginBottom: "10px",
            textShadow: "0 0 20px rgba(0,198,255,0.35)",
          }}
        >
          🎬 Centre Mail Admin
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: "35px",
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          Envoyez des annonces, alertes et notifications aux membres
          CineZone HD avec un système mail moderne et immersif.
        </p>

        <input
          type="text"
          placeholder="Emails séparés par des virgules"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Sujet"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Votre message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={10}
          style={{
            ...inputStyle,
            resize: "none",
            paddingTop: "18px",
          }}
        />

        <button
          onClick={sendMail}
          style={{
            width: "100%",
            marginTop: "28px",

            padding: "18px",

            borderRadius: "18px",
            border: "none",

            cursor: "pointer",

            background:
              "linear-gradient(135deg, #06b6d4, #3b82f6, #2563eb)",

            color: "white",

            fontSize: "18px",
            fontWeight: "bold",

            transition: "0.25s",

            boxShadow: `
              0 0 30px rgba(59,130,246,0.45),
              0 0 60px rgba(0,198,255,0.15)
            `,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          🚀 Envoyer le mail
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",

  background: "rgba(2,6,23,0.85)",

  border: "1px solid rgba(0,198,255,0.25)",

  borderRadius: "16px",

  padding: "16px",

  color: "white",

  fontSize: "16px",

  marginBottom: "18px",

  outline: "none",

  transition: "0.25s",

  boxShadow: "inset 0 0 12px rgba(0,0,0,0.35)",
};
