import type { Metadata } from "next";
import Link from "next/link";
import AuthGuard from "./components/AuthGuard";
import AdminButton from "./components/AdminButton";
import ChatNavLink from "./components/ChatNavLink";
import MenuDropdown from "./components/MenuDropdown";
import PresenceTracker from "./components/PresenceTracker";
import UserMenu from "./components/UserMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineZone HD",
  description: "Films gratuits et catalogue CineZone HD",

  icons: {
    icon: "/download.svg",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  verification: {
    google: "iKzI4FL0MlAnHucVSprcOLlCgxowMTB2DJENXsljGpE",
  },

  openGraph: {
    title: "CineZone HD",
    description:
      "Plateforme communautaire gratuite pour les passionnés de cinéma.",
    url: "https://cinezone-hd.fr",
    siteName: "CineZone HD",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "CineZone HD",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const showSeries = false;

  const navLinks = [
    ["Films", "/films"],
    ...(showSeries ? [["Séries", "/series"]] : []),
    ["🎬 Demande film", "/demande-film"],
  ];

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{
          margin: 0,
          background:
            "radial-gradient(circle at top, #061528 0%, #02050a 45%, #000 100%)",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <PresenceTracker />

        <header style={headerStyle}>
          <Link href="/" style={logoLinkStyle}>
            <div style={logoBoxStyle}>CZ</div>

            <span style={logoTextStyle}>CineZone</span>
          </Link>

          <nav style={navStyle}>
            <MenuDropdown />

            {navLinks.map(([label, href]) => (
              <Link key={href} href={href} style={navLinkStyle}>
                {label}
              </Link>
            ))}

            <ChatNavLink />

            <AdminButton />

            <UserMenu />
          </nav>
        </header>

        <AuthGuard>
          <div style={{ paddingTop: "76px" }}>{children}</div>

          <footer style={footerStyle}>
            <h2 style={footerTitle}>CineZone HD</h2>

            <p style={footerSubtitle}>
              Plateforme communautaire gratuite pour les passionnés de cinéma.
            </p>

            <div style={footerLinks}>
              <Link href="/actualites" style={footerLink}>
                Actualités
              </Link>

              <span style={{ color: "#4b5563" }}>/</span>

              <Link href="/contact" style={footerLink}>
                Contactez-nous
              </Link>
            </div>

            <p style={footerLegal}>
              Made with ❤️ by CineZone — 2026. 
            </p>
          </footer>
        </AuthGuard>
      </body>
    </html>
  );
}

const headerStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  height: "76px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 34px",
  background:
    "linear-gradient(180deg, rgba(3,10,22,0.96), rgba(0,0,0,0.78))",
  backdropFilter: "blur(18px)",
  borderBottom: "1px solid rgba(0,198,255,0.25)",
  boxShadow:
    "0 12px 45px rgba(0,0,0,0.85), 0 0 28px rgba(0,120,255,0.15)",
};

const logoLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const logoBoxStyle: React.CSSProperties = {
  width: "44px",
  height: "44px",
  borderRadius: "14px",
  background:
    "linear-gradient(135deg, #00c6ff 0%, #0072ff 50%, #001f4d 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: 950,
  fontSize: "18px",
  boxShadow:
    "0 0 25px rgba(0,198,255,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
};

const logoTextStyle: React.CSSProperties = {
  fontWeight: 950,
  fontSize: "28px",
  letterSpacing: "-0.8px",
  background:
    "linear-gradient(135deg, #ffffff 0%, #b6e0ff 40%, #00c6ff 70%, #0072ff 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  filter: "drop-shadow(0 0 12px rgba(0,198,255,0.35))",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
};

const navLinkStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 800,
  padding: "10px 18px",
  borderRadius: "999px",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.16), rgba(6,20,40,0.72), rgba(255,255,255,0.05))",
  border: "1px solid rgba(0,198,255,0.28)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 16px rgba(0,140,255,0.2)",
};

const footerStyle: React.CSSProperties = {
  padding: "45px 20px 28px",
  textAlign: "center",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(0,0,0,0.45)",
  color: "#8b95a7",
};

const footerTitle: React.CSSProperties = {
  margin: 0,
  color: "#ff2b2b",
  fontSize: "28px",
  fontWeight: 900,
};

const footerSubtitle: React.CSSProperties = {
  marginTop: "10px",
  fontSize: "16px",
};

const footerLinks: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "18px",
  marginTop: "18px",
  flexWrap: "wrap",
};

const footerLink: React.CSSProperties = {
  color: "#dbeafe",
  textDecoration: "none",
  fontWeight: 700,
};

const footerLegal: React.CSSProperties = {
  marginTop: "26px",
  fontSize: "14px",
  lineHeight: 1.6,
};
