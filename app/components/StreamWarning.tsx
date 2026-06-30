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
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "rgba(0,220,140,.18)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 22,
          }}
        >
          ▶️
        </div>

        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 22,
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
            background: "rgba(0,0,0,.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
          }}
        >
          <div
            style={{
              width: "700px",
              maxWidth: "95%",
              background: "#101827",
              borderRadius: "20px",
              padding: "35px",
              color: "#fff",
              border: "1px solid rgba(0,198,255,.25)",
              boxShadow: "0 0 60px rgba(0,0,0,.6)",
            }}
          >
            <h1
              style={{
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              🎬 CineZone HD
            </h1>

            <h2
              style={{
                textAlign: "center",
                marginBottom: 25,
              }}
            >
              Avant de lancer votre film
            </h2>

            <p
              style={{
                textAlign: "center",
                color: "#cbd5e1",
                lineHeight: 1.6,
              }}
            >
              Une publicité peut s'ouvrir avant le lecteur.
              <br />
              Fermez-la simplement puis revenez sur CineZone HD.
            </p>

            <div
              style={{
                marginTop: 30,
                padding: 20,
                background: "#1f2937",
                borderRadius: 15,
              }}
            >
              <h3 style={{ color: "#4ade80" }}>
                ✅ À faire
              </h3>

              <p>• Fermez la publicité si elle apparaît.</p>
              <p>• Revenez sur CineZone HD.</p>
              <p>• Cliquez à nouveau sur Regarder si nécessaire.</p>

              <br />

              <h3 style={{ color: "#f87171" }}>
                ❌ À ne pas faire
              </h3>

              <p>• Ne cliquez sur aucun bouton de la publicité.</p>
              <p>• Ne téléchargez aucun fichier.</p>
              <p>• Ne scannez aucun QR Code.</p>
              <p>• N'autorisez aucune notification.</p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 30,
              }}
            >
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: "14px 25px",
                  borderRadius: 12,
                  background: "#374151",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  window.location.href = `/player/${movieId}`;
                }}
                style={{
                  padding: "14px 25px",
                  borderRadius: 12,
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
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
