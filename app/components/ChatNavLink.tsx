"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ChatNavLink() {
  const pathname = usePathname();
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (pathname === "/chat") {
      setHasNewMessage(false);
    }

    const channel = supabase
      .channel("chat-notification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          if (pathname !== "/chat") {
            setHasNewMessage(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname]);

  return (
    <Link href="/chat" style={linkStyle} onClick={() => setHasNewMessage(false)}>
      <span style={{ position: "relative", display: "inline-flex" }}>
        💬 Chat

        {hasNewMessage && <span style={redDotStyle} />}
      </span>
    </Link>
  );
}

const linkStyle: React.CSSProperties = {
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

const redDotStyle: React.CSSProperties = {
  position: "absolute",
  top: "-8px",
  right: "-12px",
  width: "11px",
  height: "11px",
  borderRadius: "50%",
  background: "#ff1744",
  boxShadow: "0 0 12px #ff1744",
  border: "2px solid #02050a",
};
