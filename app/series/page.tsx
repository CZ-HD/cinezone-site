export default function SeriesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(0,120,255,0.25), #000 60%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          padding: "40px",
          borderRadius: "24px",
          background: "rgba(20,20,30,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "16px",
            background:
              "linear-gradient(135deg, #00c6ff, #0072ff, #ffd76a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🚧 Séries bientôt disponibles
        </h1>

        <p style={{ opacity: 0.8, fontSize: "16px" }}>
          Cette section est en cours de développement.
          <br />
          Reviens bientôt 👀
        </p>

        <div
          style={{
            marginTop: "30px",
            fontSize: "40px",
            opacity: 0.6,
          }}
        >
          🎬✨
        </div>
      </div>
    </main>
  );
}