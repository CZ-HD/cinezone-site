"use client";

import { useState } from "react";

interface Props {
  movieId: number;
}

export default function StreamWarning({ movieId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bouton Regarder */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "14px",
          width: "230px",
          height: "62px",
          padding: "0 18px",
          borderRadius: "16px",
          border: "1px solid rgba(0,220,140,.35)",
          background:
            "linear-gradient(180deg,#1f3a63 0%,#162847 100%)",
          color: "#fff",
          cursor: "pointer",
          boxShadow:
            "0 0 18px rgba(0,220,140,.20), inset 0 1px 0 rgba(255,255,255,.08)",
          transition: "all .25s ease",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "rgba(0,220,140,.18)",
            border: "1px solid rgba(0,220,140,.30)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          ▶️
        </div>

        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: ".3px",
            }}
          >
            REGARDER
          </div>

          <div
            style={{
              color: "#8fffd1",
              fontSize: 13,
            }}
          >
            Streaming HD
          </div>
        </div>
      </button>

      {/* Fenêtre */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.82)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
          }}
        >
          <div
            style={{
              width: "760px",
              maxWidth: "95%",
              background: "#131d2f",
              borderRadius: "22px",
              padding: "38px",
              color: "#fff",
              border: "1px solid rgba(0,198,255,.25)",
              boxShadow: "0 30px 80px rgba(0,0,0,.65)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: "46px",
                marginBottom: "10px",
              }}
            >
              🛡️
            </div>

            <h1
              style={{
                textAlign: "center",
                margin: 0,
                fontSize: "34px",
                color: "#67e8f9",
                fontWeight: 800,
              }}
            >
              🎬 CineZone HD
            </h1>

            <h2
              style={{
                textAlign: "center",
                marginTop: "12px",
                marginBottom: "22px",
                fontSize: "24px",
                fontWeight: 700,
              }}
            >
              🍿 Votre film est presque prêt !
            </h2>

            <p
              style={{
                textAlign: "center",
                color: "#d1d5db",
                lineHeight: 1.8,
                fontSize: "17px",
                marginBottom: "28px",
              }}
            >
              Afin de garder <strong>CineZone HD gratuit</strong>, une publicité
              peut s'ouvrir avant le lecteur vidéo.
              <br />
              Il suffit simplement de la fermer puis de revenir sur CineZone HD
              pour continuer votre visionnage.
            </p>

            <div
              style={{
                background: "#172033",
                border: "1px solid rgba(0,198,255,.15)",
                borderRadius: "18px",
                padding: "24px",
              }}
            >
              <h3
                style={{
                  color: "#4ade80",
                  marginTop: 0,
                  marginBottom: "12px",
                }}
              >
                ✅ Ce qu'il faut faire
              </h3>

              <p>• Fermez simplement la publicité si elle apparaît.</p>
              <p>• Revenez ensuite sur CineZone HD.</p>
              <p>• Cliquez à nouveau sur « Regarder » si nécessaire.</p>

              <br />

              <h3
                style={{
                  color: "#fb7185",
                  marginBottom: "12px",
                }}
              >
                ❌ Ce qu'il ne faut pas faire
              </h3>

              <p>• Ne cliquez sur aucun bouton de la publicité.</p>
              <p>• Ne téléchargez aucun fichier.</p>
              <p>• Ne scannez aucun QR Code.</p>
              <p>• N'autorisez aucune notification.</p>

              <div
                style={{
                  marginTop: "22px",
                  paddingTop: "18px",
                  borderTop: "1px solid rgba(255,255,255,.08)",
                  color: "#9ca3af",
                  textAlign: "center",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                🔒 <strong>CineZone HD</strong> ne vous demandera jamais
                d'installer un logiciel, de télécharger une application ou de
                créer un compte pour regarder un film.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "30px",
                gap: "15px",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: "14px 28px",
                  borderRadius: "12px",
                  background: "#2d3748",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = `/player/${movieId}`;
                }}
                style={{
                  padding: "14px 30px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "17px",
                  boxShadow: "0 0 20px rgba(34,197,94,.35)",
                }}
              >
                ▶ Continuer vers le lecteur
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
