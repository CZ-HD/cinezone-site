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
            alt="Merci pour votre soutien à CineZone"
            style={bannerImage}
          />
        </div>

        {/* =========================
            TITRE
        ========================= */}

        <div style={heart}>❤️</div>

        <h1 style={title}>Soutenir CineZone</h1>

        <p style={intro}>
          CineZone est une aventure portée par la passion du cinéma.
          Si vous appréciez le site et souhaitez participer volontairement
          à ses frais de fonctionnement, vous pouvez apporter votre soutien.
        </p>

        {/* =========================
            OBJECTIF
        ========================= */}

        <div style={goalBox}>

          <div style={goalHeader}>
            <span>🎯 Objectif actuel</span>
            <strong>{objectif} €</strong>
          </div>

          <p style={goalDescription}>
            Participation aux frais nécessaires au fonctionnement de CineZone.
          </p>

          {/* Montants */}

          <div style={amountRow}>
            <span>
              <strong style={amount}>{collecte} €</strong>{" "}
              récoltés
            </span>

            <span style={percentage}>
              {progression.toFixed(1)} %
            </span>
          </div>

          {/* Barre */}

          <div style={progressOuter}>
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

          {/* Échelle */}

          <div style={goalFooter}>
            <span>0 €</span>
            <span>{objectif} €</span>
          </div>
        </div>

        {/* =========================
            MESSAGE
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
        </div>

        {/* =========================
            BOUTON PAYPAL
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
            REMERCIEMENT
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
   STYLES
========================================================= */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "45px 20px 90px",
  background:
    "radial-gradient(circle at 50% 0%, rgba(0,198,255,0.16), transparent 32%), #02050a",
};

const supportCard: React.CSSProperties = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "30px",
  borderRadius: "30px",
  textAlign: "center",

  background:
    "linear-gradient(145deg, rgba(5,17,35,0.97), rgba(0,5,14,0.99))",

  border: "1px solid rgba(0,198,255,0.28)",

  boxShadow:
    "0 0 70px rgba(0,153,255,0.14), inset 0 1px 0 rgba(255,255,255,0.05)",
};

/* =========================
   BANNIÈRE
========================= */

const bannerWrapper: React.CSSProperties = {
  width: "100%",
  overflow: "hidden",
  borderRadius: "22px",
  marginBottom: "30px",

  border: "1px solid rgba(0,198,255,0.28)",

  boxShadow:
    "0 0 35px rgba(0,198,255,0.18)",
};

const bannerImage: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
};

/* =========================
   TITRE
========================= */

const heart: React.CSSProperties = {
  fontSize: "42px",
  filter:
    "drop-shadow(0 0 14px rgba(255,40,80,0.75))",
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
  margin: "0 auto 35px",

  color: "#cbd5e1",
  fontSize: "16px",
  lineHeight: 1.75,
};

/* =========================
   OBJECTIF
========================= */

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

const goalDescription: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "14px",

  margin:
    "9px 0 25px",
};

const amountRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

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

/* =========================
   BARRE
========================= */

const progressOuter: React.CSSProperties = {
  height: "24px",
  width: "100%",

  borderRadius: "999px",
  overflow: "hidden",

  background: "rgba(0,0,0,0.75)",

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

/* =========================
   MESSAGE
========================= */

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

  margin: 0,

  lineHeight: 1.65,

  fontSize: "14px",
};

/* =========================
   PAYPAL
========================= */

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

  transition:
    "transform 0.2s ease, box-shadow 0.2s ease",
};

const secureText: React.CSSProperties = {
  color: "#64748b",

  fontSize: "12px",

  marginTop: "13px",
};

/* =========================
   SIGNATURE
========================= */

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
