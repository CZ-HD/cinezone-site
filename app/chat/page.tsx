"use client";

import { useState } from "react";

export default function ChatPage() {
  const [hasNewMessage, setHasNewMessage] = useState(true);

  return (
    <main style={pageStyle}>
      {/* IMAGE DE FOND */}
      <div style={backgroundImageStyle} />

      {/* FILTRE SOMBRE */}
      <div style={darkOverlayStyle} />

      <div style={chatLayout}>
        <div style={chatBox}>
          {hasNewMessage && (
            <button
              onClick={() => setHasNewMessage(false)}
              style={newMessageBadge}
            >
              🔔 Nouveau message
            </button>
          )}

          <div style={headerStyle}>
            <h1 style={{ margin: 0 }}>💬 Chat CineZone</h1>
          </div>

          <div style={messagesBox}>
            <p style={{ color: "#888", textAlign: "center" }}>
              Aucun message pour le moment.
            </p>
          </div>

          <div style={inputBox}>
            <input
              placeholder="Écris ton message..."
              style={inputStyle}
            />
            <button style={btnStyle}>Envoyer</button>
          </div>
        </div>

        <aside style={onlinePanel}>
          <h2>🟢 En ligne</h2>
          <p style={{ color: "#888" }}>1 membre connecté</p>
        </aside>
      </div>
    </main>
  );
}

//////////////////////////////////////////////////
// 🎨 STYLES (UN SEUL DE CHAQUE = PAS D’ERREUR)
//////////////////////////////////////////////////

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const backgroundImageStyle: React.CSSProperties = {
  position: "absolute",
  inset: "-20px",
  backgroundImage: "url('/Tchat.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  filter: "blur(6px)",
  opacity: 0.25, // 👉 règle ici la visibilité
  zIndex: 0,
};

const darkOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at center, rgba(0,40,70,0.2), rgba(0,0,0,0.7))",
  zIndex: 1,
};

const chatLayout: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  width: "100%",
  maxWidth: "1100px",
  display: "grid",
  gridTemplateColumns: "1fr 260px",
  gap: "20px",
};

const chatBox: React.CSSProperties = {
  height: "70vh",
  background: "rgba(8,13,22,0.85)",
  backdropFilter: "blur(14px)",
  borderRadius: "20px",
  border: "1px solid rgba(0,198,255,0.3)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  padding: "20px",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

const messagesBox: React.CSSProperties = {
  flex: 1,
  padding: "20px",
};

const inputBox: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  padding: "15px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#0b0f18",
  color: "#fff",
};

const btnStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  color: "#fff",
  cursor: "pointer",
};

const onlinePanel: React.CSSProperties = {
  height: "70vh",
  background: "rgba(8,13,22,0.85)",
  backdropFilter: "blur(14px)",
  borderRadius: "20px",
  padding: "20px",
  border: "1px solid rgba(0,198,255,0.3)",
};

const newMessageBadge: React.CSSProperties = {
  position: "absolute",
  top: "80px",
  right: "20px",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "red",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};
