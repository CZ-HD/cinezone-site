"use client";

import { useState } from "react";
import Link from "next/link";

export default function MenuDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={menuBtn}>
        ☰ Menu ▾
      </button>

      {open && (
        <div style={dropdown}>
          <Link href="/" style={item} onClick={() => setOpen(false)}>
            🏠 Accueil
          </Link>

          <Link href="/favoris" style={item} onClick={() => setOpen(false)}>
            ⭐ Favoris
          </Link>

          <Link href="/actualites" style={item} onClick={() => setOpen(false)}>
            📰 Actualités
          </Link>

          <Link href="/contact" style={item} onClick={() => setOpen(false)}>
            ✉️ Contactez-nous
          </Link>
        </div>
      )}
    </div>
  );
}

const menuBtn: React.CSSProperties = {
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
  cursor: "pointer",
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "48px",
  right: 0,
  minWidth: "240px",
  padding: "10px",
  borderRadius: "18px",
  background: "rgba(8,13,22,0.96)",
  border: "1px solid rgba(0,198,255,0.32)",
  boxShadow: "0 22px 70px rgba(0,0,0,0.85), 0 0 35px rgba(0,198,255,0.18)",
  backdropFilter: "blur(14px)",
  zIndex: 9999,
};

const item: React.CSSProperties = {
  display: "block",
  padding: "13px 14px",
  color: "#fff",
  textDecoration: "none",
  borderRadius: "13px",
  fontWeight: 800,
};
