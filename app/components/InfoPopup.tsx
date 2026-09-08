"use client";

import { useEffect, useState } from "react";

export default function InfoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const showPopup = () => {
      setVisible(true);

      hideTimer = setTimeout(() => {
        setVisible(false);
      }, 12000);
    };

    // Première apparition après 5 secondes
    const firstTimer = setTimeout(showPopup, 5000);

    // Réapparition toutes les 2 minutes
    const interval = setInterval(showPopup, 120000);

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
        right: "90px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "300px",
        maxWidth: "calc(100% - 40px)",
        zIndex: 10,
        animation: "cinezoneInfoIn 0.45s ease forwards",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "20px",
          borderRadius: "20px",
          background:
            "linear-gradient(145deg, rgba(2,15,35,0.97), rgba(5,28,55,0.94))",
          border: "1px solid rgba(0,198,255,0.42)",
          boxShadow:
            "0 0 30px rgba(0,198,255,0.20), 0 15px 45px rgba(0,0,0,0.65), inset 0 0 20px rgba(0,198,255,0.04)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          color: "#fff",
        }}
      >
        {/* Bouton fermer */}
        <button
          onClick={() => setVisible(false)}
          aria-label="Fermer"
          style={{
            position: "absolute",
            top: "9px",
            right: "10px",
            width: "27px",
            height: "27px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.06)",
            color: "#aaa",
            cursor: "pointer",
            fontSize: "17px",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Titre */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            paddingRight: "25px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "11px",
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(135deg, #00c6ff, #0072ff)",
              boxShadow: "0 0 18px rgba(0,198,255,0.35)",
              fontSize: "18px",
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
              letterSpacing: "0.4px",
            }}
          >
            INFO CINEZONE HD
          </strong>
        </div>

        {/* Message */}
        <div
          style={{
            color: "#dbeafe",
            fontSize: "13px",
            lineHeight: 1.65,
          }}
        >
          Les liens reviennent tout doucement grâce au soutien de nos premiers
          membres. ❤️

          <br />
          <br />

          📢 Pensez à partager <strong>CineZone HD</strong> autour de vous !

          <br />
          <br />

          <span
            style={{
              color: "#67e8f9",
              fontWeight: 800,
            }}
          >
            Plus nous serons nombreux, plus nous pourrons ajouter de films et
            de nouveautés. 🎬
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes cinezoneInfoIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(25px) scale(0.96);
          }

          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
          }
        }

        @media (max-width: 1100px) {
          div {
            right: 35px !important;
            width: 270px !important;
          }
        }

        @media (max-width: 800px) {
          div {
            position: fixed !important;
            right: 16px !important;
            bottom: 20px !important;
            top: auto !important;
            width: 300px !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
