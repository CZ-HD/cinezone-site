"use client";

export default function SoutenirPage() {
  const objectif = 130;
  const collecte = 0;

  const progression = Math.min((collecte / objectif) * 100, 100);

  const paypalUrl =
    "https://paypal.me/cinemovies?country.x=FR&locale.x=fr_FR";

  return (
    <main style={pageStyle}>
      <section style={supportCard}>
        {/* Titre */}
        <div style={heart}>❤️</div>

        <h1 style={title}>Soutenir CineZone</h1>

        <p style={intro}>
          CineZone est avant tout une aventure portée par la passion du cinéma.
          Si vous appréciez le site et souhaitez nous aider à poursuivre
          l'aventure, vous pouvez participer librement à nos frais de
          fonctionnement.
        </p>

        {/* Objectif */}
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
              <strong style={amount}>{collecte} €</strong> récoltés
            </span>

            <span>{progression.toFixed(1)} %</span>
          </div>

          {/* Barre */}
          <div style={progressOuter}>
            <div
              style={{
                ...progressInner,
                width: `${progression}%`,
              }}
            >
              {progression > 8 && (
                <span style={progressGlow}>{progression.toFixed(0)} %</span>
              )}
            </div>
          </div>

          <div style={goalFooter}>
            <span>0 €</span>
            <span>{objectif} €</span>
          </div>
        </div>

        {/* Remerciement */}
        <div style={thanksBox}>
          <div style={thanksTitle}>💙 Chaque geste compte</div>

          <p style={thanksText}>
            Il n'y a aucune obligation de participer. Votre présence et votre
            fidélité à CineZone comptent déjà énormément pour nous.
          </p>
        </div>

        {/* PayPal */}
        <a
          href={paypalUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={paypalButton}
        >
          ❤️ Soutenir CineZone
        </a>

        <p style={secureText}>
          🔒 Paiement effectué sur la plateforme PayPal
        </p>

        <div style={signature}>
          <span style={signatureMain}>Merci infiniment !</span>
          <span style={signatureSub}>
            L'équipe CineZone vous remercie pour votre soutien ❤️
          </span>
        </div>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "55px 20px 90px",
  background:
    "radial-gradient(circle at 50% 0%, rgba(0,198,255,0.14), transparent 32%), #02050a",
};

const supportCard: React.CSSProperties = {
  maxWidth: "850px",
  margin: "0 auto",
  padding: "45px",
  borderRadius: "28px",
  textAlign: "center",
  background:
    "linear-gradient(145deg, rgba(5,17,35,0.96), rgba(0,5,14,0.98))",
  border: "1px solid rgba(0,198,255,0.28)",
  boxShadow:
    "0 0 60px rgba(0,153,255,0.13), inset 0 1px 0 rgba(255,255,255,0.05)",
};

const heart: React.CSSProperties = {
  fontSize: "46px",
  filter: "drop-shadow(0 0 14px rgba(255,40,80,0.7))",
};

const title: React.CSSProperties = {
  margin: "8px 0 15px",
  fontSize: "42px",
  fontWeight: 950,
  background:
    "linear-gradient(90deg, #ffffff 0%, #67e8f9 45%, #00c6ff 70%, #0072ff 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  filter: "drop-shadow(0 0 12px rgba(0,198,255,0.25))",
};

const intro: React.CSSProperties = {
  maxWidth: "680px",
  margin: "0 auto 35px",
  color: "#cbd5e1",
  fontSize: "16px",
  lineHeight: 1.75,
};

const goalBox: React.CSSProperties = {
  padding: "26px",
  borderRadius: "20px",
  background:
    "linear-gradient(145deg, rgba(0,198,255,0.07), rgba(0,114,255,0.03))",
  border: "1px solid rgba(0,198,255,0.22)",
  boxShadow: "inset 0 0 25px rgba(0,198,255,0.04)",
  textAlign: "left",
};

const goalHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  color: "#fff",
  fontSize: "19px",
  fontWeight: 900,
};

const goalDescription: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: "9px 0 25px",
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
  fontSize: "24px",
  textShadow: "0 0 12px rgba(0,198,255,0.45)",
};

const progressOuter: React.CSSProperties = {
  height: "22px",
  width: "100%",
  borderRadius: "999px",
  overflow: "hidden",
  background: "rgba(0,0,0,0.7)",
  border: "1px solid rgba(0,198,255,0.22)",
  boxShadow:
    "inset 0 0 12px rgba(0,0,0,0.9), 0 0 15px rgba(0,198,255,0.08)",
};

const progressInner: React.CSSProperties = {
  height: "100%",
  borderRadius: "999px",
  background:
    "linear-gradient(90deg, #0072ff 0%, #00c6ff 55%, #67e8f9 100%)",
  boxShadow: "0 0 22px rgba(0,198,255,0.8)",
  transition: "width 1s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
};

const progressGlow: React.CSSProperties = {
  paddingRight: "8px",
  color: "#fff",
  fontSize: "11px",
  fontWeight: 900,
};

const goalFooter: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "8px",
  color: "#64748b",
  fontSize: "12px",
};

const thanksBox: React.CSSProperties = {
  margin: "25px 0",
  padding: "20px",
  borderRadius: "17px",
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const thanksTitle: React.CSSProperties = {
  color: "#67e8f9",
  fontSize: "18px",
  fontWeight: 900,
  marginBottom: "8px",
};

const thanksText: React.CSSProperties = {
  color: "#94a3b8",
  margin: 0,
  lineHeight: 1.6,
  fontSize: "14px",
};

const paypalButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "280px",
  padding: "16px 28px",
  borderRadius: "999px",
  textDecoration: "none",
  color: "#fff",
  fontSize: "17px",
  fontWeight: 950,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  background:
    "linear-gradient(135deg, #0072ff 0%, #00a8ff 50%, #00c6ff 100%)",
  border: "1px solid rgba(103,232,249,0.6)",
  boxShadow:
    "0 0 28px rgba(0,198,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
};

const secureText: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  marginTop: "13px",
};

const signature: React.CSSProperties = {
  marginTop: "35px",
  paddingTop: "25px",
  borderTop: "1px solid rgba(0,198,255,0.12)",
  display: "flex",
  flexDirection: "column",
  gap: "7px",
};

const signatureMain: React.CSSProperties = {
  color: "#fff",
  fontSize: "25px",
  fontWeight: 900,
  fontStyle: "italic",
  textShadow: "0 0 12px rgba(0,198,255,0.45)",
};

const signatureSub: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
};
