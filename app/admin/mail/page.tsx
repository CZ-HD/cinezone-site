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
        background:
          "linear-gradient(to bottom, #020617, #030b1d, #000000)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "750px",
          background: "rgba(10,15,30,0.85)",
          border: "1px solid rgba(0,198,255,0.25)",
          borderRadius: "24px",
          padding: "35px",
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 40px rgba(0,198,255,0.15)",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "38px",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          🎬 Centre Mail Admin
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: "30px",
          }}
        >
          Envoyez des notifications et annonces aux membres CineZone HD.
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
            marginTop: "25px",
            padding: "18px",
            borderRadius: "16px",
            border: "none",
            cursor: "pointer",
            background:
              "linear-gradient(to right, #06b6d4, #3b82f6)",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            transition: "0.25s",
            boxShadow: "0 0 25px rgba(59,130,246,0.35)",
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
  background: "#020617",
  border: "1px solid rgba(0,198,255,0.25)",
  borderRadius: "14px",
  padding: "16px",
  color: "white",
  fontSize: "16px",
  marginBottom: "18px",
  outline: "none",
};
