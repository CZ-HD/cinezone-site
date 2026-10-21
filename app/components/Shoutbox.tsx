
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

type ShoutMessage = {
  id: string;
  user_id: string;
  email?: string | null;
  content: string;
  created_at: string;
  username?: string | null;
  avatar?: string | null;
  role?: string | null;
  role_color?: string | null;
  status_text?: string | null;
  pinned?: boolean | null;
  reply_to?: string | null;
};

type ChatUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
} | null;

const MAX_MESSAGES = 50;
const MAX_LENGTH = 1000;

export default function Shoutbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ShoutMessage[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<ChatUser>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [unread, setUnread] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userRef = useRef<ChatUser>(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = isOpen;
    if (isOpen) setUnread(0);

    // La shoutbox se trouve juste sous la navbar fixe.
    // La variable permet au contenu de commencer après le panneau, ouvert ou fermé.
    document.documentElement.style.setProperty(
      "--cz-shoutbox-height",
      isOpen ? "170px" : "38px"
    );

    return () => {
      document.documentElement.style.removeProperty("--cz-shoutbox-height");
    };
  }, [isOpen]);

  const loadMessages = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("messages")
      .select(
        "id,user_id,email,content,created_at,username,avatar,role,role_color,status_text,pinned,reply_to"
      )
      .order("created_at", { ascending: false })
      .limit(MAX_MESSAGES);

    if (queryError) {
      console.error("Shoutbox:", queryError.message);
      setError("Impossible de charger les messages. Vérifie les accès Supabase.");
      setLoading(false);
      return;
    }

    setMessages(((data || []) as ShoutMessage[]).reverse());
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data, error: authError } = await supabase.auth.getUser();

      if (!active) return;

      if (authError) console.error("Shoutbox auth:", authError.message);

      userRef.current = data.user;
      setUser(data.user);
      await loadMessages();
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      userRef.current = session?.user ?? null;
      setUser(session?.user ?? null);
    });

    const channel = supabase
      .channel("cinezone-shoutbox-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new as ShoutMessage;
          if (!message?.id) return;

          setMessages((current) => {
            if (current.some((item) => item.id === message.id)) {
              return current;
            }
            return [...current, message].slice(-MAX_MESSAGES);
          });

          if (
            userRef.current &&
            message.user_id !== userRef.current.id
          ) {
            if (!openRef.current) {
              setUnread((count) => count + 1);
            }

            if (soundEnabled) {
              try {
                const AudioContextClass = window.AudioContext;
                if (AudioContextClass) {
                  const context = new AudioContextClass();
                  const oscillator = context.createOscillator();
                  const gain = context.createGain();

                  oscillator.frequency.value = 880;
                  gain.gain.setValueAtTime(0.04, context.currentTime);
                  gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    context.currentTime + 0.12
                  );

                  oscillator.connect(gain);
                  gain.connect(context.destination);
                  oscillator.start();
                  oscillator.stop(context.currentTime + 0.12);
                  oscillator.onended = () => void context.close();
                }
              } catch {
                // Le navigateur peut bloquer le son.
              }
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("Shoutbox Realtime:", status);
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [loadMessages, soundEnabled]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const content = input.trim();
    const currentUser = userRef.current;

    if (!content || sending) return;

    if (!currentUser) {
      setError("Connecte-toi pour envoyer un message.");
      return;
    }

    if (content.length > MAX_LENGTH) {
      setError(`Maximum ${MAX_LENGTH} caractères.`);
      return;
    }

    setSending(true);
    setError("");

    const metadata = currentUser.user_metadata || {};

    const username =
      (typeof metadata.username === "string" && metadata.username) ||
      (typeof metadata.user_name === "string" && metadata.user_name) ||
      currentUser.email?.split("@")[0] ||
      "Membre";

    const avatar =
      (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
      (typeof metadata.avatar === "string" && metadata.avatar) ||
      null;

    // Ces valeurs ne constituent pas une autorisation de sécurité.
    // Les vrais rôles doivent être validés côté serveur/Supabase.
    const name = username.toLowerCase();
    const role =
      name === "vadrox"
        ? "DEV"
        : name === "athena"
          ? "ADMIN"
          : typeof metadata.role === "string"
            ? metadata.role
            : "MEMBER";

    const { error: insertError } = await supabase
      .from("messages")
      .insert({
        user_id: currentUser.id,
        email: currentUser.email || "",
        content,
        username,
        avatar,
        role,
        role_color:
          role.toUpperCase() === "ADMIN"
            ? "#fb7185"
            : role.toUpperCase() === "DEV"
              ? "#c084fc"
              : null,
        status_text: null,
        pinned: false,
        reply_to: null,
      });

    setSending(false);

    if (insertError) {
      console.error("Shoutbox insert:", insertError.message);
      setError(
        "Envoi impossible. Vérifie les politiques RLS et les colonnes obligatoires de messages."
      );
      return;
    }

    setInput("");
    inputRef.current?.focus();
  }

  function formatTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--:--";

    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getBadge(message: ShoutMessage) {
    const name = (message.username || "").trim().toLowerCase();
    const role = (message.role || "").trim().toUpperCase();

    if (name === "vadrox" || role === "DEV") {
      return { label: "DEV", color: "#c084fc" };
    }
    if (name === "athena" || role === "ADMIN") {
      return { label: "ADMIN", color: "#fb7185" };
    }
    if (role === "VIP") return { label: "VIP", color: "#facc15" };
    if (role === "UPLOADER") {
      return { label: "UPLOADER", color: "#60a5fa" };
    }
    if (role === "LIFETIME") {
      return { label: "LIFETIME", color: "#34d399" };
    }

    return null;
  }

  const lastMessage = messages[messages.length - 1];

  return (
    <section style={styles.wrapper} aria-label="Shoutbox CineZone Play">
      <div style={styles.topBar}>
        <button
          type="button"
          style={styles.toggle}
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Réduire la shoutbox" : "Ouvrir la shoutbox"}
        >
          <span style={styles.chatIcon} aria-hidden="true">▢</span>
          Shoutbox
          <span>{isOpen ? "⌃" : "⌄"}</span>

          {!isOpen && unread > 0 && (
            <span style={styles.unreadBadge}>
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        {!isOpen && (
          <button
            type="button"
            style={styles.preview}
            onClick={() => setIsOpen(true)}
            title="Ouvrir la shoutbox"
          >
            {lastMessage ? (
              <>
                <strong style={styles.previewName}>
                  {lastMessage.username || "Membre"} :
                </strong>{" "}
                {lastMessage.content}
              </>
            ) : (
              <span style={{ color: "#8494ad" }}>
                Discute avec la communauté…
              </span>
            )}
          </button>
        )}

        <span style={styles.rightHint}>
          {isOpen ? "CineZone Play" : "Cliquer pour ouvrir"}
        </span>
      </div>

      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.sectionLabel}>SHOUTBOX</span>

            <span style={styles.live}>
              <span style={styles.liveDot} />
              En direct
            </span>

            <button
              type="button"
              style={styles.iconButton}
              onClick={() => setSoundEnabled((value) => !value)}
              title={soundEnabled ? "Désactiver le son" : "Activer le son"}
              aria-label={soundEnabled ? "Désactiver le son" : "Activer le son"}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>

            <button
              type="button"
              style={styles.iconButton}
              onClick={() => setIsOpen(false)}
              aria-label="Réduire la shoutbox"
              title="Réduire"
            >
              −
            </button>
          </div>

          <div
            ref={listRef}
            style={styles.messageList}
            aria-live="polite"
            aria-relevant="additions"
          >
            {loading ? (
              <div style={styles.empty}>Chargement des messages…</div>
            ) : messages.length === 0 ? (
              <div style={styles.empty}>
                Aucun message pour le moment. Lance la conversation ! 👋
              </div>
            ) : (
              messages.map((message) => {
                const badge = getBadge(message);

                return (
                  <div key={message.id} style={styles.messageRow}>
                    <time
                      style={styles.time}
                      dateTime={message.created_at}
                    >
                      {formatTime(message.created_at)}
                    </time>

                    {message.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={message.avatar}
                        alt=""
                        style={styles.avatar}
                        loading="lazy"
                      />
                    ) : (
                      <div style={styles.avatarFallback} aria-hidden="true">
                        {(message.username || "M").charAt(0).toUpperCase()}
                      </div>
                    )}

                    {badge && (
                      <span
                        style={{
                          ...styles.badge,
                          color: badge.color,
                          borderColor: `${badge.color}66`,
                          background: `${badge.color}1a`,
                        }}
                      >
                        {badge.label}
                      </span>
                    )}

                    <span
                      style={{
                        ...styles.username,
                        color:
                          message.role_color || badge?.color || "#67e8f9",
                      }}
                    >
                      {message.username || "Membre"} :
                    </span>

                    <span style={styles.messageContent}>
                      {message.content}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <form
            style={styles.composer}
            onSubmit={(event) => void sendMessage(event)}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                user
                  ? "Discute avec la communauté… (Entrée pour envoyer)"
                  : "Connecte-toi pour participer à la discussion"
              }
              maxLength={MAX_LENGTH}
              disabled={!user || sending}
              style={styles.input}
              aria-label="Ton message"
            />

            <button
              type="submit"
              disabled={!user || sending || !input.trim()}
              style={{
                ...styles.sendButton,
                opacity: !user || sending || !input.trim() ? 0.55 : 1,
                cursor:
                  !user || sending || !input.trim()
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {sending ? "Envoi…" : "➤ Envoyer"}
            </button>
          </form>

          {error && (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "fixed",
    top: "112px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 90,
    width: "calc(100% - 36px)",
    maxWidth: "1180px",
    boxSizing: "border-box",
    color: "#e2e8f0",
    background: "rgba(5, 12, 27, 0.97)",
    border: "1px solid rgba(0, 198, 255, 0.28)",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35), 0 0 18px rgba(0, 198, 255, 0.07)",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  },
  topBar: {
    minHeight: 34,
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "0 12px",
    boxSizing: "border-box",
    background: "linear-gradient(90deg, rgba(8, 15, 32, 0.98), rgba(13, 25, 46, 0.98))",
  },
  toggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    position: "relative",
    border: 0,
    padding: "5px 0",
    background: "transparent",
    color: "#ff922b",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
  },
  chatIcon: {
    width: 15,
    height: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid #ff922b",
    borderRadius: 4,
    fontSize: 0,
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: -13,
    minWidth: 15,
    height: 15,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 3px",
    borderRadius: 99,
    background: "#ef4444",
    color: "#fff",
    fontSize: 9,
    fontWeight: 900,
  },
  preview: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    textAlign: "left",
    border: 0,
    background: "transparent",
    color: "#d4dbe8",
    fontSize: 12,
    cursor: "pointer",
  },
  previewName: {
    color: "#facc15",
  },
  rightHint: {
    color: "#64748b",
    fontSize: 10,
    whiteSpace: "nowrap",
  },
  panel: {
    padding: "0 10px 8px",
  },
  panelHeader: {
    height: 16,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  sectionLabel: {
    color: "#53637d",
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: 800,
  },
  live: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    color: "#67e8f9",
    fontSize: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#22c55e",
  },
  iconButton: {
    marginLeft: "auto",
    border: "1px solid #24344e",
    borderRadius: 6,
    background: "#0d172a",
    color: "#cbd5e1",
    padding: "2px 7px",
    cursor: "pointer",
  },
  messageList: {
    height: 78,
    overflowY: "auto",
    border: "1px solid #1b2940",
    borderRadius: 6,
    background: "rgba(2, 8, 22, 0.82)",
    padding: "3px 7px",
    boxSizing: "border-box",
  },
  messageRow: {
    minHeight: 17,
    display: "flex",
    alignItems: "center",
    gap: 7,
    borderBottom: "1px solid rgba(100, 116, 139, 0.08)",
    fontSize: 11,
    lineHeight: 1.35,
  },
  time: {
    width: 34,
    flexShrink: 0,
    color: "#64748b",
    fontSize: 10,
    fontVariantNumeric: "tabular-nums",
  },
  avatar: {
    width: 16,
    height: 16,
    flexShrink: 0,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #34445d",
  },
  avatarFallback: {
    width: 16,
    height: 16,
    flexShrink: 0,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#12334b",
    color: "#67e8f9",
    fontSize: 10,
    fontWeight: 800,
  },
  badge: {
    flexShrink: 0,
    border: "1px solid",
    borderRadius: 4,
    padding: "1px 4px",
    fontSize: 8,
    lineHeight: 1.4,
    fontWeight: 900,
  },
  username: {
    flexShrink: 0,
    fontWeight: 800,
  },
  messageContent: {
    minWidth: 0,
    overflowWrap: "anywhere",
    color: "#d1d9e6",
  },
  empty: {
    padding: 16,
    color: "#8291a9",
    fontSize: 12,
    textAlign: "center",
  },
  composer: {
    display: "flex",
    gap: 8,
    marginTop: 4,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 32,
    boxSizing: "border-box",
    padding: "0 10px",
    borderRadius: 6,
    border: "1px solid #263853",
    background: "#080f20",
    color: "#fff",
    outline: "none",
    fontSize: 12,
  },
  sendButton: {
    flexShrink: 0,
    padding: "0 12px",
    borderRadius: 6,
    border: "1px solid #009de0",
    background: "linear-gradient(135deg, #00a8e8, #0755c9)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 12,
  },
  error: {
    margin: "5px 0 0",
    color: "#fb7185",
    fontSize: 11,
  },
};
