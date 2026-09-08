"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SoutenirPage() {
  // =========================
  // CONFIGURATION
  // =========================

  const objectif = 130;

  const [collecte, setCollecte] = useState(0);
  const [nombreContributeurs, setNombreContributeurs] = useState(0);
  const [chargement, setChargement] = useState(true);

  const progression = Math.min((collecte / objectif) * 100, 100);

  const paypalUrl =
    "https://paypal.me/cinemovies?country.x=FR&locale.x=fr_FR";

  // =========================
  // CHARGEMENT DES SOUTIENS
  // =========================

  useEffect(() => {
    async function chargerSoutiens() {
      try {
        const { data, error } = await supabase
          .from("soutiens")
          .select("montant")
          .eq("statut", "confirme");

        if (error) {
          console.error(
            "Erreur lors du chargement des soutiens :",
            error.message
          );
          return;
        }

        const soutiens = data || [];

        const total = soutiens.reduce(
          (somme, soutien) => somme + Number(soutien.montant || 0),
          0
        );

        setCollecte(total);
        setNombreContributeurs(soutiens.length);
      } catch (error) {
        console.error(
          "Erreur inattendue lors du chargement des soutiens :",
          error
        );
      } finally {
        setChargement(false);
      }
    }

    chargerSoutiens();

    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(() => {
      chargerSoutiens();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main style={pageStyle}>
      <section style={supportCard}>

        {/* =========================
            BANNIÈRE
        ========================= */}

        <div style={bannerWrapper}>
          <img
            src="/cinezone-merci-banner.png"
            alt="Merci infiniment pour votre soutien à CineZone"
            style={bannerImage}
          />
        </div>

        {/* =========================
            TITRE
        ========================= */}

        <div style={heart}>❤️</div>

        <h1 style={title}>
          Soutenir CineZone
        </h1>

        <p style={intro}>
          CineZone est une aventure portée par la passion du cinéma.
          Si vous appréciez le site et souhaitez participer volontairement
          à ses frais de fonctionnement, vous pouvez apporter votre soutien.
        </p>

        {/* =========================
            POURQUOI LE SOUTIEN ?
        ========================= */}

        <div style={whyBox}>
          <div style={whyTitle}>
            🎬 Pourquoi avons-nous besoin de votre soutien ?
          </div>

          <p style={whyText}>
            CineZone évolue progressivement et nous mettons tout en œuvre
            pour maintenir le site, améliorer son fonctionnement et continuer
            à développer ses services.
          </p>

          <p style={whyText}>
            Le fonctionnement du site entraîne différents frais, notamment
            liés à <strong>l'hébergement, aux serveurs et au stockage</strong>
            nécessaires à son bon fonctionnement.
          </p>

          <p style={whyText}>
            Notre objectif actuel est de réunir{" "}
            <strong style={{ color: "#67e8f9" }}>130 €</strong>{" "}
            afin de contribuer à ces frais.
          </p>

          <div style={transparencyBox}>
            🔎 <strong>Transparence :</strong> une fois l'objectif atteint,
            une preuve du renouvellement et/ou du paiement concerné sera
            publiée sur CineZone afin de montrer que l'objectif annoncé
            a bien été réalisé.
          </div>

          <p style={privacyText}>
            🔒 Les éventuelles informations personnelles ou données sensibles
            présentes sur un justificatif seront masquées avant publication.
          </p>
        </div>

        {/* =========================
            OBJECTIF
        ========================= */}

        <div style={goalBox}>

          <div style={goalHeader}>
            <span>🎯 Objectif actuel</span>

            <strong>
              {objectif} €
            </strong>
          </div>

          <div style={costsLine}>
            💾 Hébergement
            <span>•</span>
            🖥️ Serveurs
            <span>•</span>
            📦 Stockage
            <span>•</span>
            ⚙️ Fonctionnement
          </div>

          <p style={goalDescription}>
            Votre soutien contribue volontairement aux frais nécessaires
            au fonctionnement de CineZone.
          </p>

          {/* =========================
              MONTANTS
          ========================= */}

          <div style={amountRow}>

            <div style={amountLeft}>

              <div style={contributors}>
                👥{" "}
                <strong>
                  {chargement ? "..." : nombreContributeurs}
                </strong>{" "}
                {nombreContributeurs === 1
                  ? "membre a contribué"
                  : "membres ont contribué"}
              </div>

            </div>

            <span style={percentage}>
              {chargement ? "..." : `${progression.toFixed(1)} %`}
            </span>

          </div>

          {/* =========================
              BARRE
          ========================= */}

          <div
            style={progressOuter}
            aria-label={`Progression : ${progression.toFixed(1)} %`}
          >
            <div
              style={{
                ...progressInner,
                width: `${progression}%`,
              }}
            >
              {progression >= 8 && (
                <span style={progressGlow}>
                  {progression.toFixed(0)} %
                </span>
              )}
            </div>
          </div>

          {/* =========================
              ÉCHELLE
          ========================= */}

          <div style={goalFooter}>
            <span>
              {chargement ? "..." : `${collecte.toFixed(2)} €`}
            </span>
            <span>{objectif} €</span>
          </div>

        </div>

        {/* =========================
            OBJECTIF ATTEINT
        ========================= */}

        {progression >= 100 && (
          <div style={successBox}>
            <div style={successTitle}>
              🎉 Objectif atteint !
            </div>

            <p style={successText}>
              Merci à toutes les personnes qui ont participé.
              Une preuve du renouvellement et/ou du paiement concerné
              sera publiée sur CineZone, avec les informations personnelles
              masquées si nécessaire.
            </p>
          </div>
        )}

        {/* =========================
            CHAQUE GESTE COMPTE
        ========================= */}

        <div style={thanksBox}>

          <div style={thanksTitle}>
            💙 Chaque geste compte
          </div>

          <p style={thanksText}>
            Il n'y a aucune obligation de participer.
            Votre présence, votre fidélité et votre soutien à CineZone
            comptent déjà énormément pour nous.
          </p>

          <p style={thanksText}>
            Même une petite contribution peut aider à atteindre l'objectif.
            Merci également à celles et ceux qui font simplement vivre
            la communauté au quotidien. ❤️
          </p>

        </div>

        {/* =========================
            MOYENS DE SOUTIEN
        ========================= */}

        <div style={paymentSection}>

          <div style={paymentTitle}>
            💙 Choisissez votre moyen de soutien
          </div>

          <p style={paymentIntro}>
            Soutenez CineZone HD avec la méthode qui vous convient le mieux.
          </p>

          <div className="cinezone-payment-grid" style={paymentGrid}>

            {/* PAYPAL */}
            <div style={paymentCard}>
              <div style={paymentIcon}>🅿️</div>

              <div style={paymentCardTitle}>
                PayPal
              </div>

              <p style={paymentCardText}>
                Soutenez directement CineZone HD avec votre compte PayPal.
              </p>

              <a
                href={paypalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={paypalButton}
              >
                🅿️ Soutenir avec PayPal
              </a>

              <div style={paymentSecure}>
                🔒 Paiement sécurisé via PayPal
              </div>
            </div>

            {/* KO-FI */}
            <div style={paymentCard}>
              <div style={paymentIcon}>☕</div>

              <div style={paymentCardTitle}>
                Ko-fi
              </div>

              <p style={paymentCardText}>
                PayPal ou carte bancaire. Aucun compte PayPal n'est nécessaire
                pour choisir le paiement par carte.
              </p>

              <a
                href="https://ko-fi.com/cinezonehd"
                target="_blank"
                rel="noopener noreferrer"
                style={kofiButton}
              >
                💙 Soutenir avec Ko-fi
              </a>

              <div style={paymentSecure}>
                🔒 PayPal ou carte bancaire
              </div>
            </div>

          </div>

          <p style={paymentNote}>
            ❤️ Chaque contribution est volontaire et aide CineZone HD à
            financer son stockage, ses serveurs et son fonctionnement.
          </p>

        </div>

        {/* =========================
            REMERCIEMENT FINAL
        ========================= */}

        <div style={signature}>

          <span style={signatureMain}>
            Merci infiniment ! ❤️
          </span>

          <span style={signatureSub}>
            L'équipe CineZone vous remercie sincèrement pour votre soutien.
          </span>

        </div>

      </section>
    </main>
  );
}

/* =========================================================
   PAGE
========================================================= */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",

  padding: "45px 20px 90px",

  background:
    "radial-gradient(circle at 50% 0%, rgba(0,198,255,0.16), transparent 32%), #02050a",
};

/* =========================================================
   CARTE PRINCIPALE
========================================================= */

const supportCard: React.CSSProperties = {
  width: "100%",

  maxWidth: "900px",

  margin: "0 auto",

  padding: "30px",

  boxSizing: "border-box",

  borderRadius: "30px",

  textAlign: "center",

  background:
    "linear-gradient(145deg, rgba(5,17,35,0.97), rgba(0,5,14,0.99))",

  border:
    "1px solid rgba(0,198,255,0.28)",

  boxShadow:
    "0 0 70px rgba(0,153,255,0.14), inset 0 1px 0 rgba(255,255,255,0.05)",
};

/* =========================================================
   BANNIÈRE
========================================================= */

const bannerWrapper: React.CSSProperties = {
  width: "100%",

  overflow: "hidden",

  borderRadius: "22px",

  marginBottom: "30px",

  border:
    "1px solid rgba(0,198,255,0.28)",

  boxShadow:
    "0 0 35px rgba(0,198,255,0.18)",
};

const bannerImage: React.CSSProperties = {
  display: "block",

  width: "100%",

  height: "auto",
};

/* =========================================================
   TITRE
========================================================= */

const heart: React.CSSProperties = {
  fontSize: "42px",

  filter:
    "drop-shadow(0 0 14px rgba(255,40,80,0.75))",

  marginBottom: "3px",
};

const title: React.CSSProperties = {
  margin: "6px 0 15px",

  fontSize: "42px",

  fontWeight: 950,

  background:
    "linear-gradient(90deg, #ffffff 0%, #67e8f9 45%, #00c6ff 70%, #0072ff 100%)",

  WebkitBackgroundClip: "text",

  WebkitTextFillColor: "transparent",

  filter:
    "drop-shadow(0 0 12px rgba(0,198,255,0.25))",
};

const intro: React.CSSProperties = {
  maxWidth: "700px",

  margin: "0 auto 32px",

  color: "#cbd5e1",

  fontSize: "16px",

  lineHeight: 1.75,
};

/* =========================================================
   POURQUOI
========================================================= */

const whyBox: React.CSSProperties = {
  padding: "26px",

  marginBottom: "25px",

  borderRadius: "22px",

  textAlign: "left",

  background:
    "linear-gradient(145deg, rgba(0,198,255,0.07), rgba(138,43,226,0.035))",

  border:
    "1px solid rgba(0,198,255,0.22)",

  boxShadow:
    "inset 0 0 25px rgba(0,198,255,0.035)",
};

const whyTitle: React.CSSProperties = {
  color: "#67e8f9",

  fontSize: "20px",

  fontWeight: 950,

  marginBottom: "17px",

  textShadow:
    "0 0 10px rgba(0,198,255,0.3)",
};

const whyText: React.CSSProperties = {
  color: "#cbd5e1",

  fontSize: "14px",

  lineHeight: 1.7,

  margin:
    "0 0 13px",
};

const transparencyBox: React.CSSProperties = {
  marginTop: "18px",

  padding: "17px",

  borderRadius: "15px",

  color: "#e0f2fe",

  fontSize: "14px",

  lineHeight: 1.65,

  background:
    "rgba(0,198,255,0.07)",

  border:
    "1px solid rgba(0,198,255,0.22)",

  boxShadow:
    "0 0 18px rgba(0,198,255,0.06)",
};

const privacyText: React.CSSProperties = {
  color: "#64748b",

  fontSize: "12px",

  lineHeight: 1.55,

  margin:
    "12px 0 0",
};

/* =========================================================
   OBJECTIF
========================================================= */

const goalBox: React.CSSProperties = {
  padding: "28px",

  borderRadius: "22px",

  background:
    "linear-gradient(145deg, rgba(0,198,255,0.08), rgba(0,114,255,0.025))",

  border:
    "1px solid rgba(0,198,255,0.24)",

  boxShadow:
    "inset 0 0 25px rgba(0,198,255,0.04)",

  textAlign: "left",
};

const goalHeader: React.CSSProperties = {
  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  gap: "15px",

  color: "#fff",

  fontSize: "20px",

  fontWeight: 900,
};

const costsLine: React.CSSProperties = {
  display: "flex",

  flexWrap: "wrap",

  gap: "7px",

  alignItems: "center",

  marginTop: "14px",

  color: "#67e8f9",

  fontSize: "12px",

  fontWeight: 800,
};

const goalDescription: React.CSSProperties = {
  color: "#94a3b8",

  fontSize: "14px",

  lineHeight: 1.6,

  margin:
    "15px 0 25px",
};

/* =========================================================
   MONTANTS
========================================================= */

const amountRow: React.CSSProperties = {
  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  gap: "15px",

  marginBottom: "10px",

  color: "#b6e0ff",

  fontSize: "14px",

  fontWeight: 800,
};

const amountLeft: React.CSSProperties = {
  display: "flex",

  flexDirection: "column",

  gap: "5px",
};

const amount: React.CSSProperties = {
  color: "#00c6ff",

  fontSize: "25px",

  textShadow:
    "0 0 12px rgba(0,198,255,0.5)",
};

const contributors: React.CSSProperties = {
  color: "#94a3b8",

  fontSize: "13px",

  fontWeight: 700,

  textShadow:
    "0 0 8px rgba(0,198,255,0.12)",
};

const percentage: React.CSSProperties = {
  color: "#67e8f9",

  fontSize: "16px",

  fontWeight: 950,

  textShadow:
    "0 0 10px rgba(0,198,255,0.45)",
};

/* =========================================================
   BARRE
========================================================= */

const progressOuter: React.CSSProperties = {
  height: "24px",

  width: "100%",

  borderRadius: "999px",

  overflow: "hidden",

  background:
    "rgba(0,0,0,0.75)",

  border:
    "1px solid rgba(0,198,255,0.25)",

  boxShadow:
    "inset 0 0 12px rgba(0,0,0,0.9), 0 0 18px rgba(0,198,255,0.08)",
};

const progressInner: React.CSSProperties = {
  height: "100%",

  minWidth: "0",

  borderRadius: "999px",

  background:
    "linear-gradient(90deg, #0072ff 0%, #00c6ff 55%, #67e8f9 100%)",

  boxShadow:
    "0 0 25px rgba(0,198,255,0.85)",

  transition:
    "width 1s ease",

  display: "flex",

  alignItems: "center",

  justifyContent: "flex-end",
};

const progressGlow: React.CSSProperties = {
  paddingRight: "9px",

  color: "#fff",

  fontSize: "11px",

  fontWeight: 950,

  textShadow:
    "0 0 7px rgba(255,255,255,0.8)",
};

const goalFooter: React.CSSProperties = {
  display: "flex",

  justifyContent: "space-between",

  marginTop: "8px",

  color: "#64748b",

  fontSize: "12px",
};

/* =========================================================
   OBJECTIF ATTEINT
========================================================= */

const successBox: React.CSSProperties = {
  marginTop: "25px",

  padding: "22px",

  borderRadius: "18px",

  background:
    "linear-gradient(135deg, rgba(0,198,255,0.10), rgba(0,114,255,0.05))",

  border:
    "1px solid rgba(0,198,255,0.35)",

  boxShadow:
    "0 0 25px rgba(0,198,255,0.12)",
};

const successTitle: React.CSSProperties = {
  color: "#67e8f9",

  fontSize: "21px",

  fontWeight: 950,

  marginBottom: "8px",
};

const successText: React.CSSProperties = {
  margin: 0,

  color: "#cbd5e1",

  fontSize: "14px",

  lineHeight: 1.65,
};

/* =========================================================
   MESSAGE
========================================================= */

const thanksBox: React.CSSProperties = {
  margin: "25px 0",

  padding: "22px",

  borderRadius: "18px",

  background:
    "linear-gradient(135deg, rgba(0,198,255,0.04), rgba(255,255,255,0.02))",

  border:
    "1px solid rgba(255,255,255,0.07)",
};

const thanksTitle: React.CSSProperties = {
  color: "#67e8f9",

  fontSize: "19px",

  fontWeight: 900,

  marginBottom: "8px",

  textShadow:
    "0 0 10px rgba(0,198,255,0.3)",
};

const thanksText: React.CSSProperties = {
  color: "#94a3b8",

  margin:
    "0 0 9px",

  lineHeight: 1.65,

  fontSize: "14px",
};

/* =========================================================
   MOYENS DE SOUTIEN
========================================================= */

const paymentSection: React.CSSProperties = {
  marginTop: "30px",
  padding: "28px",
  borderRadius: "24px",
  background:
    "linear-gradient(145deg, rgba(0,198,255,0.07), rgba(138,43,226,0.045))",
  border:
    "1px solid rgba(0,198,255,0.24)",
  boxShadow:
    "0 0 35px rgba(0,198,255,0.08), inset 0 0 25px rgba(255,255,255,0.02)",
};

const paymentTitle: React.CSSProperties = {
  color: "#fff",
  fontSize: "22px",
  fontWeight: 950,
  textAlign: "center",
  textShadow: "0 0 12px rgba(0,198,255,0.35)",
};

const paymentIntro: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: 1.6,
  textAlign: "center",
  margin: "8px auto 22px",
};

const paymentGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "18px",
};

const paymentCard: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "24px 18px",
  borderRadius: "20px",
  background:
    "linear-gradient(145deg, rgba(5,17,35,0.96), rgba(0,5,14,0.98))",
  border:
    "1px solid rgba(103,232,249,0.16)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 22px rgba(0,120,255,0.06)",
  textAlign: "center",
};

const paymentIcon: React.CSSProperties = {
  fontSize: "34px",
  marginBottom: "8px",
};

const paymentCardTitle: React.CSSProperties = {
  color: "#67e8f9",
  fontSize: "19px",
  fontWeight: 950,
  marginBottom: "8px",
};

const paymentCardText: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: "13px",
  lineHeight: 1.6,
  minHeight: "62px",
  margin: "0 0 18px",
};

const paypalButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  boxSizing: "border-box",
  padding: "15px 18px",
  borderRadius: "999px",
  textDecoration: "none",
  color: "#fff",
  fontSize: "15px",
  fontWeight: 950,
  letterSpacing: "0.2px",
  background:
    "linear-gradient(135deg, #0072ff 0%, #00a8ff 50%, #00c6ff 100%)",
  border:
    "1px solid rgba(103,232,249,0.65)",
  boxShadow:
    "0 0 25px rgba(0,198,255,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
};

const kofiButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  boxSizing: "border-box",
  padding: "15px 18px",
  borderRadius: "999px",
  textDecoration: "none",
  color: "#fff",
  fontSize: "15px",
  fontWeight: 950,
  letterSpacing: "0.2px",
  background:
    "linear-gradient(135deg, #0072ff 0%, #5b5ce2 50%, #8a2be2 100%)",
  border:
    "1px solid rgba(167,139,250,0.65)",
  boxShadow:
    "0 0 25px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
};

const paymentSecure: React.CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  marginTop: "11px",
};

const paymentNote: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: 1.6,
  textAlign: "center",
  margin: "20px 0 0",
};

/* =========================================================
   SIGNATURE
========================================================= */

const signature: React.CSSProperties = {
  marginTop: "35px",

  paddingTop: "25px",

  borderTop:
    "1px solid rgba(0,198,255,0.12)",

  display: "flex",

  flexDirection: "column",

  gap: "8px",
};

const signatureMain: React.CSSProperties = {
  color: "#fff",

  fontSize: "27px",

  fontWeight: 900,

  fontStyle: "italic",

  textShadow:
    "0 0 14px rgba(0,198,255,0.5)",
};

const signatureSub: React.CSSProperties = {
  color: "#94a3b8",

  fontSize: "13px",
};

/* =========================================================
   MOBILE
========================================================= */

if (typeof document !== "undefined") {
  const styleId = "cinezone-soutenir-mobile";

  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");

    style.id = styleId;

    style.textContent = `
      @media (max-width: 600px) {
        main {
          padding-left: 10px !important;
          padding-right: 10px !important;
        }

        h1 {
          font-size: 32px !important;
        }

        a {
          min-width: 0 !important;
          width: 100%;
          box-sizing: border-box;
        }

        .cinezone-payment-grid {
          grid-template-columns: 1fr !important;
        }

        .cinezone-contributors {
          font-size: 12px !important;
        }
      }
    `;

    document.head.appendChild(style);
  }
}
