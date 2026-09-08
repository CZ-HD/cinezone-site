"use client";

import { useEffect, useState } from "react";

const FIRST_DELAY = 35000;    // Première apparition : 35 secondes
const VISIBLE_TIME = 10000;   // Visible : 10 secondes
const REAPPEAR_TIME = 50000;  // Réapparaît : toutes les 50 secondes

export default function InfoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const showPopup = () => {
      setVisible(true);

      if (hideTimer) clearTimeout(hideTimer);

      hideTimer = setTimeout(() => {
        setVisible(false);
      }, VISIBLE_TIME);
    };

    const firstTimer = setTimeout(showPopup, FIRST_DELAY);
    const interval = setInterval(showPopup, REAPPEAR_TIME);

    return () => {
      clearTimeout(firstTimer);
      if (hideTimer) clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: "75px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "370px",
        maxWidth: "calc(100% - 40px)",
        zIndex: 10,
        animation: "cinezoneInfoIn 0.45s ease forwards",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "24px",
          borderRadius: "22px",
          background:
            "linear-gradient(145deg, rgba(2,15,35,0.98), rgba(5,28,55,0.95))",
          border: "1px solid rgba(0,198,255,0.45)",
          boxShadow:
            "0 0 35px rgba(0,198,255,0.22), 0 18px 50px rgba(0,0,0,0.70), inset 0 0 24px rgba(0,198,255,0.05)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          color: "#fff",
        }}
      >
        <button
          onClick={() => setVisible(false)}
          aria-label="Fermer"
          style={{
            position: "absolute",
            top: "10px",
            right: "11px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.07)",
            color: "#aaa",
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
            gap: "12px",
            paddingRight: "35px",
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
              background:
                "linear-gradient(135deg, #00c6ff, #0072ff)",
              boxShadow: "0 0 20px rgba(0,198,255,0.40)",
              fontSize: "21px",
              flexShrink: 0,
            }}
          >
            🎬
          </div>

          <strong
            style={{
              color: "#67e8f9",
              fontSize: "16px",
              fontWeight: 900,
              letterSpacing: "0.5px",
            }}
          >
            📢 INFO CINEZONE HD
          </strong>
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: "11px",
            marginBottom: "14px",
          }}
        >
          🕒 08/09/2026 12:16:00
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
            letterSpacing: "0.4px",
          }}
        >
          ADMIN
        </div>

        <div
          style={{
            color: "#e2e8f0",
            fontSize: "14px",
            lineHeight: 1.65,
          }}
        >
          Les liens de téléchargement commencent à revenir tout doucement sur
          CineZone HD ! ❤️
          <br />
          Grâce au soutien de <strong>deux membres</strong>, nous avons déjà
          pu relancer une partie des liens et commencer à remettre le catalogue
          en ordre. 🙏

          <br />
          <br />

          Mais malheureusement, cela ne suffit pas encore pour remplir le
          catalogue avec beaucoup de nouveautés. Le stockage et l'ajout de
          nouveaux films représentent un coût important.

          <br />
          <br />

          <span style={{ color: "#b6e0ff", fontWeight: 700 }}>
            💙 Si vous appréciez CineZone HD et souhaitez voir revenir davantage
            de films et de nouveautés, chaque soutien peut vraiment faire la
            différence.
          </span>

          <br />
          <br />

          📢 Pensez également à partager{" "}
          <strong style={{ color: "#fff" }}>CineZone HD</strong> autour de vous,
          le plus possible !
          <br />
          <span style={{ color: "#67e8f9", fontWeight: 900 }}>
            Plus nous serons nombreux, plus nous pourrons faire grandir la
            communauté et plus nous pourrons ajouter de films et de nouveautés
            au catalogue. 🎬🔥
          </span>

          <br />
          <br />

          🙏 Un énorme merci aux <strong>deux premiers membres</strong> qui nous
          ont déjà soutenus ❤️ et merci à toute la communauté pour votre
          fidélité et votre patience.

          <br />
          <br />

          🎥 Les liens reviennent progressivement… mais avec votre aide, nous
          pourrons accélérer les choses !

          <br />
          <br />

          <strong style={{ color: "#67e8f9" }}>
            ❤️ L'équipe CineZone HD 🎬
          </strong>
        </div>
      </div>

      <style jsx>{`
        @keyframes cinezoneInfoIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(30px) scale(0.94);
          }

          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
          }
        }

        @media (max-width: 1200px) {
          div {
            right: 45px !important;
            width: 340px !important;
          }
        }

        @media (max-width: 900px) {
          div {
            position: fixed !important;
            right: 18px !important;
            bottom: 20px !important;
            top: auto !important;
            width: 340px !important;
            max-width: calc(100vw - 36px) !important;
            transform: none !important;
          }
        }

        @media (max-width: 500px) {
          div {
            width: calc(100vw - 28px) !important;
            right: 14px !important;
            bottom: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
