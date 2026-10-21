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

type MentionProfile = {
  id: string;
  username: string | null;
  email?: string | null;
  avatar?: string | null;
};

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [mentionProfiles, setMentionProfiles] = useState<MentionProfile[]>([]);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLElement>(null);
  const userRef = useRef<ChatUser>(null);
  const openRef = useRef(false);

  // Réduit la shoutbox quand on clique en dehors de son panneau.
  // Les clics dans la shoutbox (saisie, suggestions, boutons) restent inchangés.
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !wrapperRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    openRef.current = isOpen;
    if (isOpen) setUnread(0);

    // La shoutbox se trouve juste sous la navbar fixe.
    // La variable permet au contenu de commencer après le panneau, ouvert ou fermé.
    document.documentElement.style.setProperty(
      "--cz-shoutbox-height",
      isOpen ? "190px" : "38px"
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

    const loadedMessages = ((data || []) as ShoutMessage[]).reverse();

    // Récupère les pseudos et avatars depuis les profils, sans utiliser les e-mails.
    const userIds = [...new Set(loadedMessages.map((message) => message.user_id).filter(Boolean))];

    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id,username,avatar,role,role_color,status_text")
        .in("id", userIds);

      if (profilesError) {
        console.warn("Shoutbox profils:", profilesError.message);
        setMessages(
          loadedMessages.map((message) => ({
            ...message,
            username: message.username || "Membre",
          }))
        );
      } else {
        const profilesById = new Map(
          (profiles || []).map((profile) => [profile.id, profile])
        );

        setMessages(
          loadedMessages.map((message) => {
            const profile = profilesById.get(message.user_id);
            return {
              ...message,
              username: profile?.username || message.username || "Membre",
              avatar: profile?.avatar || message.avatar || null,
              role: profile?.role || message.role || null,
              role_color: profile?.role_color || message.role_color || null,
              status_text: profile?.status_text || message.status_text || null,
            };
          })
        );
      }
    } else {
      setMessages(loadedMessages.map((message) => ({
        ...message,
        username: message.username || "Membre",
      })));
    }

    setLoading(false);
  }, []);

  const refreshMentionPermissions = useCallback(async (currentUser: ChatUser) => {
    setIsAdmin(false);
    setMentionProfiles([]);
    if (!currentUser) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (profileError) {
      console.warn("Shoutbox droits de mention:", profileError.message);
      return;
    }

    const isApproved = String(profile?.status || "").toLowerCase() === "approved";
    const admin =
      String(profile?.role || "").toLowerCase() === "admin" && isApproved;

    setIsAdmin(admin);
    // Tous les membres approuvés peuvent mentionner individuellement.
    // Seuls les administrateurs peuvent utiliser @toutlemonde.
    if (!isApproved) return;

    const { data: members, error: membersError } = await supabase
      .from("profiles")
      .select("id,username,email,avatar")
      .eq("status", "approved")
      .order("username", { ascending: true });

    if (membersError) {
      console.warn("Shoutbox liste des mentions:", membersError.message);
      return;
    }

    setMentionProfiles(
      (members || []).filter((member) => member.id && member.username)
    );
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data, error: authError } = await supabase.auth.getUser();

      if (!active) return;

      if (authError) console.error("Shoutbox auth:", authError.message);

      userRef.current = data.user;
      setUser(data.user);
      await Promise.all([loadMessages(), refreshMentionPermissions(data.user)]);
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      userRef.current = nextUser;
      setUser(nextUser);
      void refreshMentionPermissions(nextUser);
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

          // Recharge les messages pour associer le vrai pseudo du profil,
          // même si l'événement Realtime ne contient que les données du message.
          void loadMessages();

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
  }, [loadMessages, refreshMentionPermissions, soundEnabled]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const mentionMatch = input.match(/(?:^|\s)@([^\s@]*)$/);
  const mentionQuery = mentionMatch?.[1]?.toLocaleLowerCase("fr") || "";
  const mentionSuggestions = user && mentionMatch
    ? mentionProfiles.filter((member) =>
        member.id !== user?.id &&
        (member.username || "").toLocaleLowerCase("fr").includes(mentionQuery)
      )
    : [];

  function chooseMention(member: MentionProfile | "everyone") {
    const match = input.match(/(?:^|\s)@([^\s@]*)$/);
    if (!match || match.index === undefined) return;
    const prefix = input.slice(0, match.index);
    const whitespace = match[0].startsWith(" ") ? " " : "";
    const mention = member === "everyone" ? "@toutlemonde" : `@${member.username}`;
    if (member !== "everyone" && !member.username) return;
    setInput(`${prefix}${whitespace}${mention} `);
    inputRef.current?.focus();
  }

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    let content = input.trim();
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username,avatar,role,role_color,status_text")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (profileError) {
      console.warn("Shoutbox profil utilisateur:", profileError.message);
    }

    const mentionedMembers: MentionProfile[] = [];
    let mentionEveryone = false;
    const alreadyMentioned = new Set<string>();
    content = content.replace(/@([^\s@]+)/g, (rawMention, rawName: string) => {
      const value = rawName.toLocaleLowerCase("fr");
      if (["toutlemonde", "everyone"].includes(value)) {
        // @toutlemonde reste strictement réservé aux administrateurs.
        if (isAdmin) {
          mentionEveryone = true;
          return "@toutlemonde";
        }
        return rawMention;
      }
      const member = mentionProfiles.find(
        (candidate) => (candidate.username || "").toLocaleLowerCase("fr") === value
      );
      if (!member || member.id === currentUser.id || alreadyMentioned.has(member.id)) {
        return rawMention;
      }
      alreadyMentioned.add(member.id);
      mentionedMembers.push(member);
      return `@${member.username}`;
    });

    const username =
      profile?.username ||
      (typeof metadata.username === "string" && metadata.username) ||
      (typeof metadata.user_name === "string" && metadata.user_name) ||
      "Membre";

    const avatar =
      profile?.avatar ||
      (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
      (typeof metadata.avatar === "string" && metadata.avatar) ||
      null;

    // Le rôle affiché provient d'abord du profil Supabase.
    // Les permissions réelles doivent rester contrôlées côté Supabase/serveur.
    const name = username.trim().toLowerCase();
    const profileRole = typeof profile?.role === "string" ? profile.role : "";
    const role =
      name === "vadrox"
        ? "DEV"
        : name === "athéna." || name === "athena"
          ? "ADMIN"
          : profileRole || (typeof metadata.role === "string" ? metadata.role : "MEMBER");

    const roleColor =
      profile?.role_color ||
      (role.toUpperCase() === "ADMIN"
        ? "#fb7185"
        : role.toUpperCase() === "DEV"
          ? "#c084fc"
          : null);

    const { error: insertError } = await supabase
      .from("messages")
      .insert({
        user_id: currentUser.id,
        email: currentUser.email || "",
        content,
        username,
        avatar,
        role,
        role_color: roleColor,
        status_text: profile?.status_text || null,
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

    // Recharge immédiatement la liste après l'envoi, sans attendre Realtime ni un F5.
    void loadMessages();

    if (mentionedMembers.length > 0 || (isAdmin && mentionEveryone)) {
      let recipients = mentionedMembers;
      if (mentionEveryone) {
        const { data: allMembers, error: allMembersError } = await supabase
          .from("profiles")
          .select("id,username,email,avatar")
          .eq("status", "approved")
          .neq("id", currentUser.id);
        if (allMembersError) {
          console.error("Shoutbox mention everyone:", allMembersError.message);
          setError("Message envoyé, mais la liste des notifications n'a pas pu être chargée.");
          return;
        }
        recipients = allMembers || [];
      }

      if (recipients.length > 0) {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert(
            recipients.map((member) => ({
              user_id: member.id,
              type: "mention",
              title: "🔔 Mention dans la shoutbox",
              message: `${username} t'a mentionné dans la shoutbox.`,
              link: "/",
              read: false,
              read_at: null,
              created_at: new Date().toISOString(),
            }))
          );

        if (notificationError) {
          console.error("Shoutbox notifications:", notificationError.message);
          setError("Message envoyé, mais notification impossible : vérifie les droits Supabase.");
        }
      }
    }
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
    <section ref={wrapperRef} style={styles.wrapper} aria-label="Shoutbox CineZone Play">
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

          <div style={styles.composerWrap}>
            {user && mentionMatch && (mentionSuggestions.length > 0 || (isAdmin && "toutlemonde".includes(mentionQuery))) && (
              <div style={styles.mentionList} role="listbox" aria-label="Membres à mentionner">
                {"toutlemonde".includes(mentionQuery) && (
                  <button
                    key="everyone"
                    type="button"
                    style={styles.mentionOption}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseMention("everyone")}
                  >
                    <span style={styles.mentionAvatarFallback} aria-hidden="true">🌐</span>
                    <span style={styles.mentionDetails}>
                      <strong>@toutlemonde</strong>
                      <span style={styles.mentionEmail}>Notifier tous les membres</span>
                    </span>
                  </button>
                )}
                {mentionSuggestions.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    style={styles.mentionOption}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseMention(member)}
                  >
                    {member.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.avatar} alt="" style={styles.mentionAvatar} loading="lazy" />
                    ) : (
                      <span style={styles.mentionAvatarFallback} aria-hidden="true">
                        {(member.username || "M").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span style={styles.mentionDetails}>
                      <strong>@{member.username}</strong>
                      <span style={styles.mentionEmail}>{member.email || "Membre"}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
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
                    ? "Discute avec la communauté… (Tape @ pour mentionner)"
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
          </div>

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
    position: "relative",
    zIndex: 20,
    width: "calc(100% - 40px)",
    maxWidth: "1120px",
    margin: "10px auto 14px",
    boxSizing: "border-box",
    color: "#e2e8f0",
    background: "rgba(5, 12, 27, 0.98)",
    border: "1px solid rgba(0, 198, 255, 0.32)",
    borderBottom: "2px solid rgba(0, 198, 255, 0.75)",
    borderRadius: "10px",
    boxShadow: "0 7px 24px rgba(0, 0, 0, 0.28), 0 0 16px rgba(0, 198, 255, 0.06)",
    overflow: "visible",
    fontFamily: "Arial, sans-serif",
  },
  topBar: {
    minHeight: 40,
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "0 16px",
    boxSizing: "border-box",
    borderBottom: "1px solid rgba(100, 116, 139, 0.22)",
    background: "linear-gradient(90deg, rgba(8, 15, 32, 0.99), rgba(13, 25, 46, 0.99))",
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
    fontSize: 13,
    lineHeight: 1.5,
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
    padding: "4px 10px 9px",
  },
  panelHeader: {
    height: 22,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  sectionLabel: {
    color: "#91a4c2",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: 800,
  },
  live: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    color: "#67e8f9",
    fontSize: 11,
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
    height: 132,
    overflowY: "auto",
    border: "1px solid #1b2940",
    borderRadius: 6,
    background: "rgba(2, 8, 22, 0.82)",
    padding: "5px 9px",
    boxSizing: "border-box",
  },
  messageRow: {
    minHeight: 22,
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderBottom: "1px solid rgba(100, 116, 139, 0.14)",
    fontSize: 13,
    lineHeight: 1.5,
  },
  time: {
    width: 40,
    flexShrink: 0,
    color: "#91a4c2",
    fontSize: 11,
    fontVariantNumeric: "tabular-nums",
  },
  avatar: {
    width: 19,
    height: 19,
    flexShrink: 0,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #34445d",
  },
  avatarFallback: {
    width: 19,
    height: 19,
    flexShrink: 0,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#12334b",
    color: "#67e8f9",
    fontSize: 11,
    fontWeight: 800,
  },
  badge: {
    flexShrink: 0,
    border: "1px solid",
    borderRadius: 4,
    padding: "2px 5px",
    fontSize: 9,
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
  composerWrap: {
    position: "relative",
    marginTop: 4,
  },
  mentionList: {
    position: "absolute",
    left: 0,
    bottom: "calc(100% + 6px)",
    zIndex: 1000,
    width: "min(340px, calc(100vw - 32px))",
    maxHeight: "min(320px, 55vh)",
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: 6,
    border: "1px solid rgba(0, 198, 255, 0.55)",
    borderRadius: 9,
    background: "#071225",
    boxShadow: "0 12px 28px rgba(0,0,0,.55)",
  },
  mentionOption: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: "8px 10px",
    border: 0,
    borderRadius: 6,
    background: "transparent",
    color: "#e2e8f0",
    cursor: "pointer",
    textAlign: "left",
    fontSize: 12,
  },
  mentionAvatar: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid rgba(0, 198, 255, 0.5)",
    background: "#172554",
  },
  mentionAvatarFallback: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#1d4ed8",
    color: "#fff",
    fontSize: 16,
    fontWeight: 800,
  },
  mentionDetails: {
    display: "flex",
    minWidth: 0,
    flexDirection: "column",
    gap: 2,
    overflowWrap: "anywhere",
  },
  mentionEmail: {
    color: "#8494ad",
    fontSize: 10,
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
    fontSize: 13,
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
