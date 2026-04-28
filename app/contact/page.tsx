export default function ContactPage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1>📩 Contactez-nous</h1>

        <p style={{ color: "#aab6c8" }}>
          Une question, une demande ou un problème ? Contacte l’équipe CineZone.
        </p>

        <form style={{ display: "grid", gap: "14px", marginTop: "22px" }}>
          <input placeholder="Ton email" style={inputStyle} />
          <input placeholder="Sujet" style={inputStyle} />
          <textarea placeholder="Ton message" rows={6} style={inputStyle} />

          <button type="button" style={buttonStyle}>
            Envoyer
          </button>
        </form>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "40px",
  color: "#fff",
  background: "radial-gradient(circle at top, rgba(0,120,255,0.18), #000 60%)",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "700px",
  margin: "0 auto",
  padding: "28px",
  borderRadius: "24px",
  background: "rgba(10,15,25,0.9)",
  border: "1px solid rgba(0,198,255,0.25)",
};

const inputStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  background: "linear-gradient(135deg, #00c6ff, #0072ff, #3a00ff)",
};
