"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  created_at: string;
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    setUser(data.user);
    await loadNotifications(data.user.id);

    const channel = supabase
      .channel("notifications-user")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const notif = payload.new as Notification & { user_id: string };

          if (notif.user_id === data.user.id) {
            setNotifications((prev) => [notif, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function loadNotifications(userId: string) {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    setNotifications(data || []);
  }

  async function markAsRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function markAllAsRead() {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={bellBtn}>
        🔔
        {unreadCount > 0 && <span style={badge}>{unreadCount}</span>}
      </button>

      {open && (
        <div style={dropdown}>
          <div style={top}>
            <strong>Notifications</strong>

            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={smallBtn}>
                Tout lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={empty}>Aucune notification.</p>
          ) : (
            <div style={list}>
              {notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || "/"}
                  style={{
                    ...notifCard,
                    opacity: notif.read ? 0.65 : 1,
                  }}
                  onClick={() => {
                    markAsRead(notif.id);
                    setOpen(false);
                  }}
                >
                  <strong>{notif.title}</strong>
                  <p>{notif.message}</p>
                  {!notif.read && <span style={newDot}>● Nouveau</span>}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const bellBtn: React.CSSProperties = {
  position: "relative",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: "999px",
  border: "1px solid rgba(0,198,255,0.35)",
  background: "rgba(0,198,255,0.14)",
  cursor: "pointer",
  fontWeight: 900,
};

const badge: React.CSSProperties = {
  position: "absolute",
  top: "-7px",
  right: "-7px",
  minWidth: "20px",
  height: "20px",
  padding: "0 6px",
  borderRadius: "999px",
  background: "#ff1744",
  color: "#fff",
  fontSize: "12px",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "48px",
  right: 0,
  width: "360px",
  maxHeight: "420px",
  overflowY: "auto",
  padding: "14px",
  borderRadius: "18px",
  background: "#060b16",
  border: "1px solid rgba(0,198,255,0.28)",
  boxShadow: "0 20px 70px rgba(0,0,0,0.8)",
  zIndex: 999999,
};

const top: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

const smallBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "10px",
  padding: "6px 9px",
  background: "rgba(0,198,255,0.16)",
  color: "#67e8f9",
  fontWeight: 800,
  cursor: "pointer",
};

const list: React.CSSProperties = {
  display: "grid",
  gap: "10px",
};

const notifCard: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  color: "#fff",
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const newDot: React.CSSProperties = {
  color: "#67e8f9",
  fontSize: "12px",
  fontWeight: 900,
};

const empty: React.CSSProperties = {
  color: "#9ca3af",
  margin: 0,
};
