export default function ActualitesPage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1>📰 Actualités CineZone</h1>
        <p>
          Les actualités seront publiées ici par l’administration.
        </p>
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
  maxWidth: "900px",
  margin: "0 auto",
  padding: "28px",
  borderRadius: "24px",
  background: "rgba(10,15,25,0.9)",
  border: "1px solid rgba(0,198,255,0.25)",
};
