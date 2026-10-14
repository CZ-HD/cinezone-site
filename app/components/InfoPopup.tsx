
"use client";

import { useState } from "react";

export default function InfoPopup() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside
      aria-label="Information officielle CineZone Play"
      style={{
        position: "absolute",
        right: "24px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "370px",
        maxWidth: "calc(100% - 32px)",
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "22px",
          borderRadius: "22px",
          background:
            "linear-gradient(145deg, rgba(2,15,35,0.98), rgba(5,28,55,0.98))",
          border: "1px solid rgba(0,198,255,0.45)",
          boxShadow:
            "0 0 35px rgba(0,198,255,0.16), 0 18px 50px rgba(0,0,0,0.65)",
          color: "#fff",
          overflowY: "auto",
          maxHeight: "80vh",
        }}
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Fermer l'annonce"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.07)",
            color: "#ccc",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          ×
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            paddingRight: "24px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #00c6ff, #0072ff)",
              fontSize: "21px",
              flexShrink: 0,
            }}
          >
            🎬
          </div>

          <strong
            style={{
              color: "#67e8f9",
              fontSize: "15px",
              fontWeight: 900,
              letterSpacing: "0.3px",
            }}
          >
            📢 INFO CINEZONE PLAY
          </strong>
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: "11px",
            marginBottom: "12px",
          }}
        >
          🗓️ 14 octobre 2026
        </div>

        <div
          style={{
            display: "inline-block",
            padding: "4px 9px",
            marginBottom: "14px",
            borderRadius: "8px",
            background: "rgba(0,198,255,0.10)",
            border: "1px solid rgba(0,198,255,0.22)",
            color: "#67e8f9",
            fontSize: "11px",
            fontWeight: 900,
          }}
        >
          INFORMATION OFFICIELLE
        </div>

        <h2
          style={{
            fontSize: "20px",
            lineHeight: 1.3,
            margin: "0 0 14px",
            color: "#fff",
          }}
        >
          🎥 CineZone Play passe au streaming !
        </h2>

        <div
          style={{
            color: "#e2e8f0",
            fontSize: "13px",
            lineHeight: 1.7,
          }}
        >
          <p style={{ margin: "0 0 14px" }}>
            💙 Nous faisons actuellement évoluer le site vers un système de
            lecture directement intégré au lecteur vidéo.
          </p>

          <p style={{ margin: "0 0 8px", color: "#67e8f9", fontWeight: 800 }}>
            📺 Ce qui va changer :
          </p>

          <ul
            style={{
              paddingLeft: "19px",
              margin: "0 0 16px",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              Les liens directs de téléchargement seront progressivement
              supprimés.
            </li>
            <li style={{ marginBottom: "8px" }}>
              Les contenus disponibles pourront être visionnés directement
              sur CineZone Play.
            </li>
            <li>
              Certains films et épisodes resteront accessibles ; d'autres
              pourront être indisponibles pendant ou après la transition.
            </li>
          </ul>

          <div
            style={{
              padding: "13px",
              marginBottom: "14px",
              borderRadius: "12px",
              background: "rgba(0,198,255,0.08)",
              border: "1px solid rgba(0,198,255,0.2)",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#67e8f9",
                marginBottom: "6px",
              }}
            >
              🔓 Un accès libre pour tous !
            </strong>

            La navigation et le visionnage des contenus disponibles seront
            accessibles sans inscription.

            <p style={{ margin: "8px 0 0" }}>
              🔗 Un compte restera nécessaire uniquement pour les personnes
              souhaitant obtenir un lien direct vers une vidéo, selon les
              modalités qui seront mises en place.
            </p>
          </div>

          <p style={{ margin: "0 0 14px" }}>
            🙏 Merci pour votre fidélité, votre patience et votre soutien
            pendant cette évolution.
          </p>

          <strong style={{ color: "#67e8f9" }}>
            ❤️ L'équipe CineZone Play 🎬
          </strong>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          aside {
            position: fixed !important;
            right: 16px !important;
            bottom: 16px !important;
            top: auto !important;
            transform: none !important;
            width: 370px !important;
            max-width: calc(100vw - 32px) !important;
          }
        }
      `}</style>
    </aside>
  );
}
