"use client";

import { useState } from "react";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/send-mail", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Message envoyé ✅");

        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        console.error(data);

        alert("Erreur lors de l'envoi ❌");
      }

    } catch (error) {

      console.error(error);

      alert("Erreur serveur ❌");

    } finally {

      setLoading(false);

    }
  };

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "12px",
  }}
>
  <img
    src="https://i.imgur.com/8Km9tLL.png"
    alt="CineZone HD"
    style={{
      width: "68px",
      height: "68px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "2px solid rgba(0,198,255,0.35)",
      boxShadow: "0 0 20px rgba(0,198,255,0.25)",
      background: "#111827",
    }}
  />

  <div>
    <h1
      style={{
        margin: 0,
        fontSize: "34px",
        color: "white",
      }}
    >
      📩 Contactez-nous
    </h1>

    <p
      style={{
        color: "#aab6c8",
        marginTop: "8px",
      }}
    >
      Une question, une demande ou un problème ? Contacte l’équipe CineZone HD.
    </p>
  </div>
</div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "14px",
            marginTop: "22px",
          }}
        >
          <input
            type="email"
            placeholder="Ton email"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Sujet"
            style={inputStyle}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <textarea
            placeholder="Ton message"
            rows={6}
            style={inputStyle}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <button
            type="submit"
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "40px",
  color: "#fff",
  background:
    "radial-gradient(circle at top, rgba(0,120,255,0.18), #000 60%)",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "700px",
  margin: "0 auto",
  padding: "28px",
  borderRadius: "24px",
  background: "rgba(10,15,25,0.9)",
  border: "1px solid rgba(0,198,255,0.25)",

  backdropFilter: "blur(14px)",
  boxShadow: "0 0 40px rgba(0,198,255,0.12)",
};

const inputStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
};
