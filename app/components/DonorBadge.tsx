"use client";

export default function DonorBadge() {
  return (
    <span
      title="Membre donateur de CineZone HD"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        marginLeft: "7px",
        padding: "3px 8px",
        borderRadius: "999px",
        background:
          "linear-gradient(135deg, rgba(255,193,7,0.18), rgba(255,140,0,0.12))",
        border: "1px solid rgba(255,193,7,0.55)",
        color: "#ffd54a",
        fontSize: "10px",
        fontWeight: 950,
        letterSpacing: "0.3px",
        boxShadow:
          "0 0 10px rgba(255,193,7,0.25), inset 0 0 8px rgba(255,193,7,0.06)",
        whiteSpace: "nowrap",
        verticalAlign: "middle",
      }}
    >
      🏆 DONATEUR
    </span>
  );
}
