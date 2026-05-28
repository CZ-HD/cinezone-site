import type { Metadata } from "next";
import Link from "next/link";
import AuthGuard from "./components/AuthGuard";
import AdminButton from "./components/AdminButton";
import ChatNavLink from "./components/ChatNavLink";
import MenuDropdown from "./components/MenuDropdown";
import PresenceTracker from "./components/PresenceTracker";
import UserMenu from "./components/UserMenu";
import "./globals.css";
import NotificationsBell from "./components/NotificationsBell";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cinezone-hd.fr"),

  title: "CineZone HD",
  description: "Films gratuits et catalogue CineZone HD",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
    apple: ["/apple-touch-icon.png"],
  },

  manifest: "/site.webmanifest",

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
    ["🎞️ Sagas", "/sagas"],
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
          <div style={topHeaderStyle}>
            {/* Logo */}
            <Link href="/" style={logoLinkStyle}>
              <div style={logoBoxStyle}>CZ</div>

              <span style={logoTextStyle}>CineZone</span>
            </Link>

            {/* Navbar */}
            <nav style={navWrapper}>
              {/* Navigation principale */}
              <div style={navCenter}>
                <MenuDropdown />

                {navLinks.map(([label, href]) => (
                  <Link key={href} href={href} style={navLinkStyle}>
                    {label}
                  </Link>
                ))}
              </div>

              {/* Actions */}
              <div style={navActions}>
                <ChatNavLink />
                <NotificationsBell />
              </div>

              {/* Profil */}
              <div style={profileSection}>
                <AdminButton />
                <UserMenu />
              </div>
            </nav>
          </div>

          {/* Bandeau */}
          <div style={marqueeContainer}>
            <div style={marqueeText}>
              👋 Bonjour et bienvenue sur CineZone HD ! Merci de prendre quelques secondes pour choisir un pseudo et un avatar dans votre profil afin que le staff puisse vous notifier et répondre plus facilement à vos demandes. Merci 🎭🔔
            </div>
          </div>
        </header>

        <AuthGuard>
          <div style={{ paddingTop: "118px" }}>
            {children}
          </div>

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
  background:
    "linear-gradient(180deg, rgba(2,8,18,0.94), rgba(0,0,0,0.72))",
  backdropFilter: "blur(22px)",
  borderBottom: "1px solid rgba(0,198,255,0.14)",
  boxShadow:
    "0 18px 55px rgba(0,0,0,0.82), 0 0 30px rgba(0,120,255,0.10)",
};

const topHeaderStyle: React.CSSProperties = {
  minHeight: "90px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 26px",
};

const navWrapper: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const navCenter: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "8px",
  borderRadius: "999px",
  background: `
    linear-gradient(
      135deg,
      rgba(0,198,255,0.08),
      rgba(10,18,35,0.88),
      rgba(138,43,226,0.08)
    )
  `,
  border: "1px solid rgba(120,220,255,0.14)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: `
    0 0 42px rgba(0,198,255,0.14),
    inset 0 0 18px rgba(255,255,255,0.03)
  `,
};

const navActions: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const profileSection: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const marqueeContainer: React.CSSProperties = {
  width: "100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  background:
    "linear-gradient(90deg, rgba(0,198,255,0.08), rgba(0,114,255,0.05), rgba(0,198,255,0.08))",
  borderTop: "1px solid rgba(0,198,255,0.12)",
  padding: "5px 0",
  color: "#67e8f9",
  fontWeight: 800,
  fontSize: "12px",
  textShadow: "0 0 6px rgba(0,198,255,0.35)",
};

const marqueeText: React.CSSProperties = {
  display: "inline-block",
  paddingLeft: "100%",
  animation: "marquee 75s linear infinite",
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
    "0 0 22px rgba(0,198,255,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
};

const logoTextStyle: React.CSSProperties = {
  fontWeight: 950,
  fontSize: "34px",
  letterSpacing: "-1px",
  background:
    "linear-gradient(135deg, #ffffff 0%, #b6e0ff 40%, #00c6ff 70%, #0072ff 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  filter: "drop-shadow(0 0 10px rgba(0,198,255,0.25))",
};

const navLinkStyle: React.CSSProperties = {
  color: "#fff",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 800,
  padding: "10px 18px",
  borderRadius: "999px",
  background:
    "linear-gradient(135deg, rgba(0,198,255,0.10), rgba(6,20,40,0.55), rgba(255,255,255,0.03))",
  border: "1px solid rgba(0,198,255,0.18)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 14px rgba(0,140,255,0.10)",
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
