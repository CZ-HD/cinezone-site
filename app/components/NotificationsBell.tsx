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
  read_at?: string | null;
  created_at: string;
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || cancelled || !data.user) return;

        const currentUser = data.user;
        setUser(currentUser);

        const { data: notificationData, error: notificationsError } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", currentUser.id)
          .eq("read", false)
          .order("created_at", { ascending: false })
          .limit(20);

        if (cancelled) return;
        if (notificationsError) {
          console.error("Erreur de chargement des notifications :", notificationsError);
        }
        setNotifications(notificationData || []);

        channel = supabase
          .channel(`notifications-user-${currentUser.id}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications" },
            (payload) => {
              const notif = payload.new as Notification & { user_id: string };
              if (notif.user_id === currentUser.id && !notif.read) {
                setNotifications((prev) => [notif, ...prev.filter((item) => item.id !== notif.id)]);
              }
            }
          )
          .subscribe();
      } catch (error) {
        if (!cancelled) console.error("Erreur d'initialisation des notifications :", error);
      }
    }

    void init();

    // Le nettoyage est retourné directement par useEffect afin que React ferme bien le canal.
    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  async function markAsRead(id: string) {
    await supabase
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", id);

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  async function markAllAsRead() {
    if (!user) return;

    await supabase
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotifications([]);
  }

  const unreadCount = notifications.length;

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
                  style={notifCard}
                  onClick={() => {
                    markAsRead(notif.id);
                    setOpen(false);
                  }}
                >
                  <strong>{notif.title}</strong>
                  <p>{notif.message}</p>
                  <span style={newDot}>● Nouveau</span>
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
