"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ChatNavLink() {
  const pathname = usePathname();
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("cinezone_chat_unread");
    setHasNewMessage(saved === "true");

    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (pathname === "/chat") {
      setHasNewMessage(false);
      localStorage.setItem("cinezone_chat_unread", "false");
    }
  }, [pathname]);

  useEffect(() => {
    const channel = supabase
      .channel("chat-nav-notification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg: any = payload.new;

          if (msg.user_id === currentUserId) return;

          if (pathname !== "/chat") {
            setHasNewMessage(true);
            localStorage.setItem("cinezone_chat_unread", "true");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname, currentUserId]);

  return (
    <Link
      href="/chat"
      style={linkStyle}
      onClick={() => {
        setHasNewMessage(false);
        localStorage.setItem("cinezone_chat_unread", "false");
      }}
    >
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
  top: "-10px",
  right: "-14px",
  width: "14px",
  height: "14px",
  borderRadius: "50%",
  background: "#ff0033",
  boxShadow: "0 0 0 4px rgba(255,0,51,0.25), 0 0 18px #ff0033",
  border: "2px solid #02050a",
  zIndex: 999,
};
