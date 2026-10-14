"use client";

import { useState } from "react";

export default function InfoPopup() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const textStyle: React.CSSProperties = {
    fontSize: "12px",
    lineHeight: 1.55,
    color: "#e2e8f0",
    margin: "0 0 7px",
  };

  const sectionStyle: React.CSSProperties = {
    padding: "11px 12px",
    marginBottom: "11px",
    borderRadius: "13px",
  };

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
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          boxSizing: "border-box",
          padding: "16px",
          borderRadius: "21px",
          background:
            "linear-gradient(145deg, rgba(2,12,30,0.98), rgba(4,27,53,0.98))",
          border: "1.5px solid #00c6ff",
          boxShadow:
            "0 0 18px rgba(0,198,255,0.2), 0 12px 35px rgba(0,0,0,0.65)",
          color: "#fff",
          maxHeight: "82vh",
          overflowY: "auto",
        }}
      >
        {/* EN-TÊTE */}

        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Fermer l'annonce"
          style={{
            position: "absolute",
            top: "9px",
            right: "9px",
            width: "27px",
            height: "27px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.25)",
            background: "#152b43",
            color: "#fff",
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            paddingRight: "25px",
            marginBottom: "9px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "11px",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #00d4ff, #0066ff)",
              boxShadow: "0 0 14px rgba(0,198,255,0.3)",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            🎬
          </div>

          <strong
            style={{
              color: "#67e8f9",
              fontSize: "14px",
              fontWeight: 900,
            }}
          >
            📢 INFO CINEZONE PLAY
          </strong>
        </div>

        <div
          style={{
            color: "#a9bfd4",
            fontSize: "10px",
            marginBottom: "10px",
          }}
        >
          🗓️ 14 octobre 2026
        </div>

        <div
          style={{
            display: "inline-block",
            padding: "5px 9px",
            marginBottom: "11px",
            borderRadius: "7px",
            background: "linear-gradient(90deg, #0072ff, #00bde9)",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 900,
          }}
        >
          INFORMATION OFFICIELLE
        </div>

        {/* TITRE */}

        <div
          style={{
            textAlign: "center",
            padding: "12px 8px",
            marginBottom: "12px",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, rgba(0,198,255,0.12), rgba(0,40,100,0.35))",
            border: "1px solid rgba(0,198,255,0.45)",
          }}
        >
          <h2
            style={{
              margin: "0 0 5px",
              fontSize: "20px",
              lineHeight: 1.25,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            CINEZONE PLAY
          </h2>

          <div
            style={{
              color: "#ffca45",
              fontSize: "20px",
              lineHeight: 1.25,
              fontWeight: 900,
            }}
          >
            OUVERT AU PUBLIC !
          </div>

          <div
            style={{
              marginTop: "9px",
              padding: "7px 5px",
              borderRadius: "8px",
              background: "rgba(0,198,255,0.1)",
              border: "1px solid rgba(0,198,255,0.35)",
              color: "#a5f3fc",
              fontSize: "10px",
              fontWeight: 900,
            }}
          >
            🔓 ACCÈS LIBRE • SANS INSCRIPTION
          </div>
        </div>

        <p style={textStyle}>
          💙 Bonne nouvelle ! CineZone Play est désormais ouvert
          à tous. Consultez le catalogue et regardez directement
          les films disponibles en streaming, sans créer de compte.
        </p>

        {/* ACCÈS PUBLIC */}

        <section
          style={{
            ...sectionStyle,
            background:
              "linear-gradient(145deg, rgba(0,100,220,0.16), rgba(0,25,55,0.7))",
            border: "1px solid #00aaff",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              lineHeight: 1.3,
              fontWeight: 900,
              color: "#67e8f9",
              margin: "0 0 8px",
            }}
          >
            ▶️ ACCÈS LIBRE AU SITE
          </h3>

          <p style={textStyle}>✅ Consultation du catalogue public.</p>
          <p style={textStyle}>✅ Streaming dans le lecteur intégré.</p>
          <p style={textStyle}>✅ Aucun compte nécessaire pour regarder.</p>
          <p style={{ ...textStyle, marginBottom: 0 }}>
            ✅ Films disponibles accessibles à tous.
          </p>
        </section>

        {/* FONCTIONS RÉSERVÉES AUX MEMBRES */}

        <section
          style={{
            ...sectionStyle,
            background:
              "linear-gradient(145deg, rgba(120,0,30,0.18), rgba(35,5,20,0.7))",
            border: "1px solid #ff4268",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              lineHeight: 1.3,
              fontWeight: 900,
              color: "#ff718d",
              margin: "0 0 8px",
            }}
          >
            🔒 FONCTIONS RÉSERVÉES AUX MEMBRES
          </h3>

          <p style={textStyle}>
            🎞️ <strong>Demandes de films :</strong> inscription
            et connexion obligatoires pour proposer un film.
          </p>

          <p style={textStyle}>
            💬 <strong>Chat :</strong> connectez-vous ou créez
            un compte pour participer aux discussions.
          </p>

          <p style={{ ...textStyle, marginBottom: 0 }}>
            👤 <strong>Compte et favoris :</strong> ces fonctions
            restent réservées aux membres connectés.
          </p>
        </section>

        {/* INFORMATIONS IMPORTANTES */}

        <section
          style={{
            ...sectionStyle,
            background:
              "linear-gradient(145deg, rgba(120,65,0,0.18), rgba(45,25,0,0.7))",
            border: "1px solid #ffb000",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              lineHeight: 1.3,
              fontWeight: 900,
              color: "#ffca45",
              margin: "0 0 8px",
            }}
          >
            ⚠️ À SAVOIR
          </h3>

          <p style={textStyle}>
            🟠 Les liens directs de téléchargement seront
            progressivement supprimés.
          </p>

          <p style={textStyle}>
            🟠 Certains films resteront disponibles en streaming.
          </p>

          <p style={{ ...textStyle, marginBottom: 0 }}>
            🟠 D'autres films pourront être temporairement ou
            définitivement indisponibles pendant la transition.
          </p>
        </section>

        {/* MESSAGE FINAL */}

        <div
          style={{
            padding: "11px",
            borderRadius: "12px",
            background: "rgba(0,198,255,0.07)",
            border: "1px solid rgba(0,198,255,0.25)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#c9f4ff",
              fontSize: "11px",
              lineHeight: 1.55,
              margin: "0 0 7px",
            }}
          >
            ❤️ Merci pour votre fidélité, votre soutien et votre patience.
          </p>

          <strong
            style={{
              color: "#67e8f9",
              fontSize: "13px",
            }}
          >
            🎬 L'équipe CineZone Play
          </strong>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          aside {
            position: fixed !important;
            right: 12px !important;
            bottom: 12px !important;
            top: auto !important;
            transform: none !important;
            width: 370px !important;
            max-width: calc(100vw - 24px) !important;
          }
        }
      `}</style>
    </aside>
  );
}
