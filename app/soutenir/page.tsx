"use client";

export default function SoutenirPage() {
  // =========================
  // CONFIGURATION
  // =========================

  const objectif = 130;
  const collecte = 0;

  const progression = Math.min((collecte / objectif) * 100, 100);

  const paypalUrl =
    "https://paypal.me/cinemovies?country.x=FR&locale.x=fr_FR";

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

            <span>
              <strong style={amount}>
                {collecte} €
              </strong>{" "}
              récoltés
            </span>

            <span style={percentage}>
              {progression.toFixed(1)} %
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
            <span>0 €</span>
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
            PAYPAL
        ========================= */}

        <a
          href={paypalUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={paypalButton}
        >
          ❤️ Soutenir CineZone
        </a>

        <p style={secureText}>
          🔒 Vous serez redirigé vers PayPal pour effectuer votre soutien.
        </p>

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

const amount: React.CSSProperties = {
  color: "#00c6ff",

  fontSize: "25px",

  textShadow:
    "0 0 12px rgba(0,198,255,0.5)",
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
   PAYPAL
========================================================= */

const paypalButton: React.CSSProperties = {
  display: "inline-flex",

  alignItems: "center",

  justifyContent: "center",

  minWidth: "300px",

  padding: "17px 32px",

  borderRadius: "999px",

  textDecoration: "none",

  color: "#fff",

  fontSize: "17px",

  fontWeight: 950,

  textTransform: "uppercase",

  letterSpacing: "0.5px",

  background:
    "linear-gradient(135deg, #0072ff 0%, #00a8ff 50%, #00c6ff 100%)",

  border:
    "1px solid rgba(103,232,249,0.65)",

  boxShadow:
    "0 0 30px rgba(0,198,255,0.38), inset 0 1px 0 rgba(255,255,255,0.25)",
};

const secureText: React.CSSProperties = {
  color: "#64748b",

  fontSize: "12px",

  marginTop: "13px",
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
      }
    `;

    document.head.appendChild(style);
  }
}
