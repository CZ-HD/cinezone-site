  borderRadius: "18px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};
      
const cardStyle: React.CSSProperties = {
  maxWidth: "1100px",
  marginBottom: "28px",
  padding: "24px",
  borderRadius: "22px",
  background: "rgba(20,20,25,0.78)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
};

const twoColumns: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "150px",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#111",
  color: "#fff",
  boxSizing: "border-box",
  resize: "vertical",
};

const memberHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const searchInput: React.CSSProperties = {
  minWidth: "260px",
  padding: "13px",
  borderRadius: "14px",
  border: "1px solid rgba(0,198,255,0.25)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
};

const memberGrid: React.CSSProperties = {
  width: "100%",
  borderRadius: "22px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(10,15,25,0.72)",
};

const rolePill: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.28)",
  color: "#67e8f9",
  fontSize: "11px",
  fontWeight: 900,
};

const creatorBadge: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #ff4fd8, #7c3aed)",
  color: "#fff",
  fontSize: "10px",
  fontWeight: 900,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#111",
  color: "#fff",
  boxSizing: "border-box",
};

const baseBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "10px 13px",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const btnBlue: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
};

const btnPurple: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #8e2de2, #4a00e0)",
};

const btnGreen: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #00c853, #009624)",
};

const btnOrange: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ff9800, #e65100)",
};

const btnGold: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ffd76a, #b8860b)",
  color: "#111",
};

const btnRed: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ff1744, #b00020)",
};

const copyIdBtn: React.CSSProperties = {
  width: "52px",
  height: "48px",
  borderRadius: "12px",
  border: "1px solid rgba(0,198,255,0.35)",
  background: "rgba(0,198,255,0.16)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "20px",
};

const sagaPanelStyle: React.CSSProperties = {
  marginTop: "22px",
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(0,0,0,0.24)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const sagaListStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
  maxHeight: "520px",
  overflowY: "auto",
  paddingRight: "5px",
};

const movieManageRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const miniPosterStyle: React.CSSProperties = {
  width: "46px",
  height: "68px",
  objectFit: "cover",
  borderRadius: "8px",
};

const miniPosterFallback: React.CSSProperties = {
  width: "46px",
  height: "68px",
  display: "grid",
  placeItems: "center",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.08)",
};
