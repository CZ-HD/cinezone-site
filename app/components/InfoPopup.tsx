
"use client";

import { useState } from "react";

export default function InfoPopup() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const sectionTitle: React.CSSProperties = {
    fontSize: "17px",
    fontWeight: 900,
    lineHeight: 1.35,
    margin: "0 0 10px",
  };

  const itemStyle: React.CSSProperties = {
    margin: "0 0 8px",
    paddingLeft: "2px",
  };

  return (
    <aside
      aria-label="Information officielle CineZone Play"
      style={{
        position: "absolute",
        right: "24px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "410px",
        maxWidth: "calc(100% - 32px)",
        zIndex: 20,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "24px",
          borderRadius: "24px",
          background:
            "linear-gradient(145deg, rgba(2,12,30,0.99), rgba(4,27,53,0.99))",
          border: "2px solid #00c6ff",
          boxShadow:
            "0 0 12px rgba(0,198,255,0.45), 0 0 38px rgba(0,198,255,0.22), 0 20px 55px rgba(0,0,0,0.75)",
          color: "#fff",
          maxHeight: "85vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {/* BOUTON FERMER */}

        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Fermer l'annonce"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.25)",
            background: "#152b43",
            color: "#fff",
            cursor: "pointer",
            fontSize: "21px",
            fontWeight: 700,
            display: "grid",
            placeItems: "center",
          }}
        >
          ×
        </button>

        {/* EN-TÊTE */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            paddingRight: "28px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #00d4ff, #0066ff)",
              boxShadow: "0 0 22px rgba(0,198,255,0.4)",
              fontSize: "25px",
              flexShrink: 0,
            }}
          >
            🎬
          </div>

          <strong
            style={{
              color: "#67e8f9",
              fontSize: "17px",
              fontWeight: 900,
              letterSpacing: "0.4px",
            }}
          >
            📢 INFO CINEZONE PLAY
          </strong>
        </div>

        <div
          style={{
            color: "#a9bfd4",
            fontSize: "12px",
            marginBottom: "14px",
          }}
        >
          🗓️ 14 octobre 2026
        </div>

        <div
          style={{
            display: "inline-block",
            padding: "6px 11px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: "linear-gradient(90deg, #0072ff, #00bde9)",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "0.5px",
            boxShadow: "0 0 16px rgba(0,150,255,0.3)",
          }}
        >
          INFORMATION OFFICIELLE
        </div>

        {/* TITRE PRINCIPAL */}

        <div
          style={{
            textAlign: "center",
            padding: "18px 10px",
            marginBottom: "16px",
            borderRadius: "15px",
            background:
              "linear-gradient(135deg, rgba(0,198,255,0.16), rgba(0,40,100,0.4))",
            border: "1px solid rgba(0,198,255,0.5)",
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "25px",
              lineHeight: 1.25,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            CINEZONE PLAY
          </h2>

          <div
            style={{
              color: "#ffcf45",
              fontSize: "25px",
              lineHeight: 1.2,
              fontWeight: 1000,
              textShadow: "0 0 16px rgba(255,160,0,0.25)",
            }}
          >
            OUVERT AU PUBLIC !
          </div>

          <div
            style={{
              marginTop: "12px",
              padding: "9px 8px",
              borderRadius: "9px",
              background: "rgba(0,198,255,0.12)",
              border: "1px solid rgba(0,198,255,0.4)",
              color: "#a5f3fc",
              fontSize: "12px",
              fontWeight: 900,
            }}
          >
            🔓 ACCÈS LIBRE • AUCUNE INSCRIPTION REQUISE
          </div>
        </div>

        <p
          style={{
            color: "#e2e8f0",
            fontSize: "14px",
            lineHeight: 1.65,
            margin: "0 0 18px",
          }}
        >
          💙 CineZone Play s'ouvre à tous ! Consultez le catalogue et regardez
          directement les films disponibles en streaming sur le site, sans
          avoir besoin de créer un compte.
        </p>

        {/* SECTION STREAMING */}

        <section
          style={{
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "16px",
            background:
              "linear-gradient(145deg, rgba(0,120,255,0.15), rgba(0,25,55,0.75))",
            border: "1px solid #00aaff",
            boxShadow: "inset 0 0 20px rgba(0,160,255,0.07)",
          }}
        >
          <h3 style={{ ...sectionTitle, color: "#67e8f9" }}>
            ▶️ VISIONNAGE EN STREAMING
          </h3>

          <p style={itemStyle}>✅ Accès libre au site pour tous.</p>
          <p style={itemStyle}>
            ✅ Lecture directement dans le lecteur intégré.
          </p>
          <p style={itemStyle}>
            ✅ Aucune inscription pour regarder les films disponibles.
          </p>
          <p style={{ ...itemStyle, marginBottom: 0 }}>
            ✅ Une partie du catalogue restera accessible.
          </p>
        </section>

        {/* SECTION LIENS DIRECTS */}

        <section
          style={{
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "16px",
            background:
              "linear-gradient(145deg, rgba(120,0,30,0.2), rgba(35,5,20,0.75))",
            border: "1px solid #ff4268",
            boxShadow: "inset 0 0 20px rgba(255,40,90,0.06)",
          }}
        >
          <h3 style={{ ...sectionTitle, color: "#ff718d" }}>
            🔗 LIENS DIRECTS
            <span style={{ fontSize: "12px" }}> (CAS PARTICULIERS)</span>
          </h3>

          <p
            style={{
              margin: "0 0 10px",
              fontSize: "13px",
              lineHeight: 1.65,
            }}
          >
            Certains membres pourront souhaiter récupérer un lien direct vers
            un film pour un usage personnel.
          </p>

          <p
            style={{
              margin: 0,
              fontSize: "13px",
              lineHeight: 1.65,
              color: "#ffd1dc",
            }}
          >
            <strong style={{ color: "#ff718d" }}>
              ⚠️ Une inscription sera alors nécessaire
            </strong>{" "}
            pour les personnes souhaitant obtenir ces liens, selon les
            modalités qui seront mises en place.
          </p>
        </section>

        {/* SECTION À SAVOIR */}

        <section
          style={{
            padding: "16px",
            marginBottom: "17px",
            borderRadius: "16px",
            background:
              "linear-gradient(145deg, rgba(120,65,0,0.2), rgba(45,25,0,0.75))",
            border: "1px solid #ffb000",
            boxShadow: "inset 0 0 20px rgba(255,170,0,0.05)",
          }}
        >
          <h3 style={{ ...sectionTitle, color: "#ffca45" }}>
            ⚠️ À SAVOIR
          </h3>

          <p style={itemStyle}>
            🟠 Les liens directs de téléchargement seront progressivement
            supprimés.
          </p>

          <p style={itemStyle}>
            🟠 Certains films resteront disponibles en streaming.
          </p>

          <p style={{ ...itemStyle, marginBottom: 0 }}>
            🟠 D'autres films pourront devenir temporairement ou définitivement
            indisponibles pendant ou après la transition.
          </p>
        </section>

        {/* MESSAGE DE FIN */}

        <div
          style={{
            padding: "15px",
            borderRadius: "14px",
            background: "rgba(0,198,255,0.08)",
            border: "1px solid rgba(0,198,255,0.25)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#c9f4ff",
              fontSize: "13px",
              lineHeight: 1.65,
              margin: "0 0 12px",
            }}
          >
            ❤️ Merci à toute la communauté pour votre fidélité, votre soutien
            et votre patience pendant cette évolution.
          </p>

          <strong
            style={{
              color: "#67e8f9",
              fontSize: "15px",
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
            right: 16px !important;
            bottom: 16px !important;
            top: auto !important;
            transform: none !important;
            width: 410px !important;
            max-width: calc(100vw - 32px) !important;
          }
        }
      `}</style>
    </aside>
  );
}
