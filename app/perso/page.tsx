import Link from "next/link";

const filmsPerso = [
  {
    id: 2135,
    titre: "La Machine à explorer le temps",
    annee: "2002",
    jaquette: "https://image.tmdb.org/t/p/w500/9QB6wIc6XOtoi02uUCLSvY0onSL.jpg",
    fond: "https://image.tmdb.org/t/p/original/6p2lYhS6rXn2C9b0tG6HjV5Zc5K.jpg",
    page: "/movie/2135",
    download: "https://1fichier.com/?m6ysu2mk8o3vuoccsj4t&af=5257374",
  },
];

export default function PersoPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(63,197,255,0.18), #000 45%)",
        color: "#fff",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "8px" }}>
        🎬 Mes films perso
      </h1>

      <p style={{ color: "#aaa", marginBottom: "30px" }}>
        Ma collection privée avec téléchargement direct.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "24px",
        }}
      >
        {filmsPerso.map((film) => (
          <div
            key={film.id}
            style={{
              background: "linear-gradient(180deg, #151515, #070707)",
              borderRadius: "18px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
            }}
          >
            <img
              src={film.jaquette}
              alt={film.titre}
              style={{
                width: "100%",
                height: "330px",
                objectFit: "contain",
                background: "#111",
                display: "block",
              }}
            />

            <div style={{ padding: "16px" }}>
              <h2 style={{ fontSize: "18px", margin: "0 0 6px" }}>
                {film.titre}
              </h2>

              <p style={{ color: "#3fc5ff", margin: "0 0 14px" }}>
                {film.annee}
              </p>

              <Link href={film.page} style={{ textDecoration: "none" }}>
                <button
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#fff",
                    color: "#000",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    marginBottom: "10px",
                  }}
                >
                  ▶ Voir
                </button>
              </Link>

              <a
                href={film.download}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#e50914",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  ⬇ Télécharger
                </button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}