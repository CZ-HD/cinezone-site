"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const addAffiliate = (url: string) => {
  const affiliate = "af=5257374";

  if (!url.includes("1fichier.com")) return url;
  if (url.includes("af=")) return url;

  return url.includes("?") ? `${url}&${affiliate}` : `${url}?${affiliate}`;
};

export default function DownloadButton({ movieId }: { movieId: number }) {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    async function getDownloadLink() {
      const { data, error } = await supabase
        .from("downloads")
        .select("link")
        .eq("id", movieId)
        .maybeSingle();

      setLink(error ? null : data?.link ?? null);
      setLoading(false);
    }

    getDownloadLink();
  }, [movieId]);

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    padding: "10px 22px",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "0.4px",
    textDecoration: "none",
    transition: "all 0.25s ease",
  };

  if (loading) {
    return (
      <button
        disabled
        style={{
          ...baseStyle,
          background: "rgba(255,255,255,0.07)",
          color: "#aaa",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        Chargement...
      </button>
    );
  }

  if (!link) {
    return (
      <button
        disabled
        style={{
          ...baseStyle,
          background: "rgba(255,255,255,0.06)",
          color: "#777",
          border: "1px solid rgba(255,255,255,0.12)",
          cursor: "not-allowed",
        }}
      >
        ⬇ Indisponible
      </button>
    );
  }

  const finalLink = addAffiliate(link);

  return (
    <a
      href={finalLink}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...baseStyle,
        color: "#fff",
        background:
          "linear-gradient(135deg, rgba(0,198,255,0.45), rgba(0,114,255,0.45), rgba(138,43,226,0.45))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(120,220,255,0.6)",
        boxShadow: hover
          ? "0 0 22px rgba(0,198,255,0.75), 0 0 42px rgba(138,43,226,0.45)"
          : "0 0 14px rgba(0,198,255,0.42)",
        transform: hover ? "translateY(-1px) scale(1.04)" : "scale(1)",
      }}
    >
      <span>⬇</span>
      <span>TÉLÉCHARGER</span>
    </a>
  );
}