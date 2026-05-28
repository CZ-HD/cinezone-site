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
        <span style={{ fontSize: "15px" }}>☰</span>

        <span>Menu</span>

        <span
          style={{
            fontSize: "10px",
            color: "#8be9ff",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "0.25s ease",
          }}
        >
          ▲
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
                    "0 0 14px rgba(0,198,255,0.18)",
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
                    "0 0 14px rgba(255,200,0,0.18)",
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
                    "0 0 14px rgba(170,120,255,0.18)",
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
                    "0 0 14px rgba(255,120,255,0.18)",
                }}
              >
                ✉️
              </div>

              <span>Contact</span>
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
  gap: "10px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 800,
  padding: "11px 20px",
  borderRadius: "999px",
  background: `
    linear-gradient(
      135deg,
      rgba(0,198,255,0.12),
      rgba(10,18,35,0.90),
      rgba(138,43,226,0.12)
    )
  `,
  border: "1px solid rgba(120,220,255,0.22)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: `
    inset 0 0 10px rgba(255,255,255,0.03),
    0 0 14px rgba(0,198,255,0.10)
  `,
  cursor: "pointer",
  transition: "all 0.25s ease",
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "56px",
  right: 0,
  minWidth: "220px",
  padding: "10px",
  borderRadius: "20px",
  background: "rgba(5,10,20,0.95)",
  border: "1px solid rgba(120,220,255,0.18)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow: `
    0 25px 60px rgba(0,0,0,0.82),
    0 0 28px rgba(0,198,255,0.08),
    inset 0 0 14px rgba(255,255,255,0.02)
  `,
  zIndex: 9999,
};

const item: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "11px",
  marginBottom: "8px",
  borderRadius: "14px",
  textDecoration: "none",
  color: "#fff",
  fontWeight: 800,
  fontSize: "13px",
  background: `
    linear-gradient(
      135deg,
      rgba(0,198,255,0.06),
      rgba(255,255,255,0.015)
    )
  `,
  border: "1px solid rgba(255,255,255,0.03)",
  boxShadow: "0 0 10px rgba(0,198,255,0.04)",
  transition: "all 0.22s ease",
};

const leftSide: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const iconBubble: React.CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `
    linear-gradient(
      135deg,
      rgba(255,255,255,0.05),
      rgba(255,255,255,0.015)
    )
  `,
  border: "1px solid rgba(255,255,255,0.04)",
  fontSize: "15px",
};

const arrow: React.CSSProperties = {
  color: "#72e3ff",
  fontSize: "22px",
  fontWeight: 300,
};
