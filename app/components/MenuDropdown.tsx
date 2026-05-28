"use client";

import Link from "next/link";
import { useState } from "react";

export default function MenuDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={menuBtn}
      >
        <span style={{ fontSize: "18px" }}>☰</span>

        <span>Menu</span>

        <span
          style={{
            fontSize: "12px",
            color: "#8be9ff",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "0.25s ease",
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div style={dropdown}>
          <Link
            href="/"
            style={item}
            onClick={() => setOpen(false)}
          >
            <div style={leftSide}>
              <div
                style={{
                  ...iconBubble,
                  boxShadow:
                    "0 0 18px rgba(0,198,255,0.25)",
                }}
              >
                🏠
              </div>

              <span>Accueil</span>
            </div>

            <span style={arrow}>›</span>
          </Link>

          <Link
            href="/favoris"
            style={item}
            onClick={() => setOpen(false)}
          >
            <div style={leftSide}>
              <div
                style={{
                  ...iconBubble,
                  boxShadow:
                    "0 0 18px rgba(255,200,0,0.22)",
                }}
              >
                ⭐
              </div>

              <span>Favoris</span>
            </div>

            <span style={arrow}>›</span>
          </Link>

          <Link
            href="/actualites"
            style={item}
            onClick={() => setOpen(false)}
          >
            <div style={leftSide}>
              <div
                style={{
                  ...iconBubble,
                  boxShadow:
                    "0 0 18px rgba(170,120,255,0.22)",
                }}
              >
                📰
              </div>

              <span>Actualités</span>
            </div>

            <span style={arrow}>›</span>
          </Link>

          <Link
            href="/contact"
            style={item}
            onClick={() => setOpen(false)}
          >
            <div style={leftSide}>
              <div
                style={{
                  ...iconBubble,
                  boxShadow:
                    "0 0 18px rgba(255,120,255,0.22)",
                }}
              >
                ✉️
              </div>

              <span>Contactez-nous</span>
            </div>

            <span style={arrow}>›</span>
          </Link>
        </div>
      )}
    </div>
  );
}

const menuBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "12px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: 800,
  padding: "13px 24px",
  borderRadius: "999px",
  background: `
    linear-gradient(
      135deg,
      rgba(0,198,255,0.14),
      rgba(10,18,35,0.88),
      rgba(138,43,226,0.16)
    )
  `,
  border: "1px solid rgba(120,220,255,0.28)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  boxShadow: `
    inset 0 0 14px rgba(255,255,255,0.04),
    0 0 22px rgba(0,198,255,0.16)
  `,
  cursor: "pointer",
  transition: "all 0.25s ease",
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "62px",
  right: 0,
  minWidth: "320px",
  padding: "16px",
  borderRadius: "30px",
  background: "rgba(5,10,20,0.94)",
  border: "1px solid rgba(120,220,255,0.22)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  boxShadow: `
    0 35px 90px rgba(0,0,0,0.88),
    0 0 40px rgba(0,198,255,0.12),
    inset 0 0 22px rgba(255,255,255,0.03)
  `,
  zIndex: 9999,
};

const item: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "18px",
  marginBottom: "12px",
  borderRadius: "24px",
  textDecoration: "none",
  color: "#fff",
  fontWeight: 800,
  fontSize: "17px",
  background: `
    linear-gradient(
      135deg,
      rgba(0,198,255,0.08),
      rgba(255,255,255,0.02)
    )
  `,
  border: "1px solid rgba(255,255,255,0.04)",
  boxShadow: "0 0 20px rgba(0,198,255,0.08)",
  transition: "all 0.22s ease",
};

const leftSide: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const iconBubble: React.CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `
    linear-gradient(
      135deg,
      rgba(255,255,255,0.06),
      rgba(255,255,255,0.02)
    )
  `,
  border: "1px solid rgba(255,255,255,0.05)",
  fontSize: "24px",
};

const arrow: React.CSSProperties = {
  color: "#72e3ff",
  fontSize: "28px",
  fontWeight: 300,
};
