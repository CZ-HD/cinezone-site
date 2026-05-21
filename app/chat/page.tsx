"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_AVATAR =
"https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/adult-7.png";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🔥"];const CHAT_EMOJIS = [

  "👍", "❤️", "🔥", "😂", "😎", "🎬",

  "🍿", "👑", "🙏", "💯", "⭐", "🚀",

  "😍", "😅", "🤣", "😱", "🤔", "👀",

  "😈", "🥶", "💀", "👌", "👏", "🙌",

  "🎉", "✨", "⚡", "💎", "🎭", "📽️","🍕", "☕", "🫡", "🤝", "✅", "❌"

];

const CREATOR_EMAILS = [
"[blackph4tom@gmail.com](mailto:blackph4tom@gmail.com)",
"[lafooteusedu54@hotmail.fr](mailto:lafooteusedu54@hotmail.fr)",
];

type Message = {
id: string;
room_id?: string;
user_id: string;
username: string;
avatar: string;
role: string;
content: string;
created_at: string;
parent_id?: string | null;
};

type MessageReaction = {
id: string;
message_id: string;
user_id: string;
emoji: string;
};

type MentionProfile = {
id: string;
username?: string | null;
email?: string | null;
avatar?: string | null;
};

export default function ChatPage() {
const [messages, setMessages] = useState<Message[]>([]);
const [reactions, setReactions] = useState<MessageReaction[]>([]);

const [text, setText] = useState("");
const [replyText, setReplyText] = useState("");

const [replyTo, setReplyTo] = useState<Message | null>(null);

const [user, setUser] = useState(null);
const [profile, setProfile] = useState(null);

const [loading, setLoading] = useState(true);

const [mentionResults, setMentionResults] = useState<any[]>([]);
const [showMentions, setShowMentions] = useState(false);

const isAdmin =
profile?.role === "admin" ||
CREATOR_EMAILS.includes(user?.email || "");

useEffect(() => {
init();

```
const messagesChannel = supabase
  .channel("chat-live")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "chat_messages",
    },
    async () => {
      await loadMessages();
    }
  )
  .subscribe();

return () => {
  supabase.removeChannel(messagesChannel);
};
```

}, []);

async function init() {
const { data } = await supabase.auth.getUser();

```
if (!data.user) {
  setLoading(false);
  return;
}

setUser(data.user);

const { data: profileData } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", data.user.id)
  .single();

setProfile(profileData);

await loadMessages();
await loadReactions();

setLoading(false);
```

}

const loadMessages = async () => {
const { data } = await supabase
.from("chat_messages")
.select("*")
.order("created_at", {
ascending: true,
});

```
setMessages(data || []);
```

};

const loadReactions = async () => {
const { data } = await supabase
.from("chat_reactions")
.select("*");

```
setReactions(data || []);
```

};

// MENTIONS COMPLETES
const searchMentions = async (query: string) => {
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, email, avatar")
      .limit(20);

    setMentionResults(data || []);
    return;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, username, email, avatar")
    .or(
      `username.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%`
    )
    .limit(20);

  setMentionResults(data || []);
};

const createMentionNotifications = async (
mentionedUsers: MentionProfile[]
) => {
if (
!user ||
!profile ||
mentionedUsers.length === 0
)
return;

```
await supabase.from("notifications").insert(
  mentionedUsers.map((member) => ({
    user_id: member.id,
    type: "chat_mention",
    title: "💬 Mention dans le chat",
    message: `${
      profile?.username || user.email
    } vous a mentionné.`,
    link: "/chat",
    read: false,
  }))
);
```

};

const resolveMentions = async (
content: string
) => {
const matches = [
...content.matchAll(
/@([a-zA-Z0-9._@-]+)/g
),
];

```
if (matches.length === 0) {
  return {
    safeContent: content,
    mentionedUsers: [],
  };
}

const mentionedUsers: MentionProfile[] = [];

const alreadyMentioned = new Set<string>();

for (const match of matches) {
  const value = match[1].trim();

  if (!value) continue;

  const { data: mentionedUser } =
    await supabase
      .from("profiles")
      .select(
        "id, username, email"
      )
      .or(
        `username.eq.${value},email.eq.${value}`
      )
      .maybeSingle();

  if (!mentionedUser?.id) continue;

  if (
    alreadyMentioned.has(
      mentionedUser.id
    )
  )
    continue;

  alreadyMentioned.add(
    mentionedUser.id
  );

  mentionedUsers.push(
    mentionedUser
  );
}

return {
  safeContent: content,
  mentionedUsers,
};
```

};

const sendMessage = async () => {
if (!text.trim() || !user)
return;

```
const content = text.trim();

setText("");

const {
  safeContent,
  mentionedUsers,
} = await resolveMentions(
  content
);

const { error } = await supabase
  .from("chat_messages")
  .insert({
    user_id: user.id,
    username:
      profile?.username ||
      user.email,
    avatar:
      profile?.avatar ||
      DEFAULT_AVATAR,
    role:
      profile?.role ||
      "user",
    content: safeContent,
    parent_id: null,
  });

if (error) {
  alert(error.message);
  setText(content);
  return;
}

await createMentionNotifications(
  mentionedUsers
);

await loadMessages();
```

};

const sendReply = async () => {
if (
!replyText.trim() ||
!replyTo ||
!user
)
return;

```
const content =
  replyText.trim();

setReplyText("");

const {
  safeContent,
  mentionedUsers,
} = await resolveMentions(
  content
);

const { error } = await supabase
  .from("chat_messages")
  .insert({
    user_id: user.id,
    username:
      profile?.username ||
      user.email,
    avatar:
      profile?.avatar ||
      DEFAULT_AVATAR,
    role:
      profile?.role ||
      "user",
    content: safeContent,
    parent_id: replyTo.id,
  });

if (error) {
  alert(error.message);
  return;
}

setReplyTo(null);

await createMentionNotifications(
  mentionedUsers
);

await loadMessages();
```

};

const deleteMessage = async (
messageId: string
) => {
if (!isAdmin) return;

```
const confirmDelete =
  confirm(
    "Supprimer ce message ?"
  );

if (!confirmDelete) return;

await supabase
  .from("chat_messages")
  .delete()
  .eq("id", messageId);

await loadMessages();
```

};

const toggleReaction = async (
messageId: string,
emoji: string
) => {
if (!user) return;

```
const existing =
  reactions.find(
    (r) =>
      r.message_id ===
        messageId &&
      r.user_id ===
        user.id &&
      r.emoji === emoji
  );

if (existing) {
  await supabase
    .from("chat_reactions")
    .delete()
    .eq("id", existing.id);
} else {
  await supabase
    .from("chat_reactions")
    .insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    });
}

await loadReactions();
```

};

const getReactionCount = (
messageId: string,
emoji: string
) =>
reactions.filter(
(r) =>
r.message_id ===
messageId &&
r.emoji === emoji
).length;

const hasReacted = (
messageId: string,
emoji: string
) =>
reactions.some(
(r) =>
r.message_id ===
messageId &&
r.user_id ===
user?.id &&
r.emoji === emoji
);

const parentMessages =
messages.filter(
(message) =>
!message.parent_id
);

const getReplies = (
messageId: string
) =>
messages.filter(
(message) =>
message.parent_id ===
messageId
);

return (

<h2 style={{ color: "#fff" }}>
💬 Chat ({messages.length})\

```
  <div
    style={{
      ...inputBox,
      position: "relative",
    }}
  >
    <input
      value={text}
      onChange={async (e) => {
        const value =
          e.target.value;

        setText(value);

        const match =
          value.match(
            /@([a-zA-Z0-9._@-]*)$/
          );

        if (match) {
          setShowMentions(
            true
          );

          await searchMentions(
            match[1]
          );
        } else {
          setShowMentions(
            false
          );
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter")
          sendMessage();
      }}
      placeholder="Écrire un message..."
      style={input}
    />

    {showMentions &&
      mentionResults.length >
        0 && (
        <div style={mentionsBox}>
          {mentionResults.map(
            (member) => (
              <div
                key={member.id}
                style={
                  mentionItem
                }
                onClick={() => {
                  const name =
                    member.username ||
                    member.email;

                  setText(
                    text.replace(
                      /@([a-zA-Z0-9._@-]*)$/,
                      `@${name} `
                    )
                  );

                  setShowMentions(
                    false
                  );
                }}
              >
                <img
                  src={
                    member.avatar ||
                    DEFAULT_AVATAR
                  }
                  style={
                    mentionAvatar
                  }
                />

                <div>
                  <div
                    style={{
                      color:
                        "#fff",
                    }}
                  >
                    {member.username ||
                      "Sans pseudo"}
                  </div>

                  <div
                    style={{
                      color:
                        "#94a3b8",
                      fontSize:
                        "12px",
                    }}
                  >
                    {
                      member.email
                    }
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

    <button
      onClick={sendMessage}
      style={btn}
    >
      Envoyer
    </button>
  </div>

  {loading ? (
    <p style={{ color: "#aaa" }}>
      Chargement...
    </p>
  ) : (
    <div style={list}>
      {parentMessages.map(
        (message) => {
          const replies =
            getReplies(
              message.id
            );

          return (
            <div
              key={message.id}
              style={card}
            >
              <img
                src={
                  message.avatar ||
                  DEFAULT_AVATAR
                }
                style={avatar}
              />

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={topRow}
                >
                  <strong
                    style={{
                      color:
                        message.role ===
                        "admin"
                          ? "gold"
                          : "#00c6ff",
                    }}
                  >
                    {
                      message.username
                    }
                  </strong>

                  <span
                    style={
                      dateText
                    }
                  >
                    {new Date(
                      message.created_at
                    ).toLocaleDateString(
                      "fr-FR"
                    )}
                  </span>
                </div>

                <p
                  style={
                    contentStyle
                  }
                >
                  {
                    message.content
                  }
                </p>

                <div
                  style={
                    reactionRow
                  }
                >
                  {REACTION_EMOJIS.map(
                    (
                      emoji
                    ) => (
                      <button
                        key={
                          emoji
                        }
                        onClick={() =>
                          toggleReaction(
                            message.id,
                            emoji
                          )
                        }
                        style={{
                          ...reactionBtn,
                          ...(hasReacted(
                            message.id,
                            emoji
                          )
                            ? reactionBtnActive
                            : {}),
                        }}
                      >
                        {emoji}{" "}
                        {getReactionCount(
                          message.id,
                          emoji
                        ) || ""}
                      </button>
                    )
                  )}
                </div>

                <div
                  style={
                    actionRow
                  }
                >
                  <button
                    style={
                      replyBtn
                    }
                    onClick={() =>
                      setReplyTo(
                        message
                      )
                    }
                  >
                    Répondre
                  </button>

                  {isAdmin && (
                    <button
                      style={
                        deleteBtn
                      }
                      onClick={() =>
                        deleteMessage(
                          message.id
                        )
                      }
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                {replyTo?.id ===
                  message.id && (
                  <div
                    style={
                      replyInputBox
                    }
                  >
                    <input
                      value={
                        replyText
                      }
                      onChange={(
                        e
                      ) =>
                        setReplyText(
                          e
                            .target
                            .value
                        )
                      }
                      style={
                        input
                      }
                      placeholder="Réponse..."
                    />

                    <button
                      onClick={
                        sendReply
                      }
                      style={btn}
                    >
                      Envoyer
                    </button>
                  </div>
                )}

                {replies.length >
                  0 && (
                  <div
                    style={
                      repliesBox
                    }
                  >
                    {replies.map(
                      (
                        reply
                      ) => (
                        <div
                          key={
                            reply.id
                          }
                          style={
                            replyCard
                          }
                        >
                          <img
                            src={
                              reply.avatar ||
                              DEFAULT_AVATAR
                            }
                            style={
                              avatarSmall
                            }
                          />

                          <div>
                            <strong
                              style={{
                                color:
                                  "#00c6ff",
                              }}
                            >
                              {
                                reply.username
                              }
                            </strong>

                            <p
                              style={
                                replyContent
                              }
                            >
                              {
                                reply.content
                              }
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }
      )}
    </div>
  )}
</section>
```

);
}

const box: React.CSSProperties = {
marginTop: "44px",
padding: "24px",
borderRadius: "24px",
background:
"linear-gradient(180deg, rgba(12,18,30,0.88), rgba(5,8,14,0.92))",
};

const inputBox: React.CSSProperties = {
display: "flex",
gap: "10px",
marginTop: "20px",
};

const input: React.CSSProperties = {
flex: 1,
padding: "15px",
borderRadius: "16px",
border:
"1px solid rgba(255,255,255,0.14)",
background: "#0b0f18",
color: "#fff",
};

const btn: React.CSSProperties = {
padding: "15px 20px",
borderRadius: "16px",
border: "none",
color: "#fff",
fontWeight: 900,
background:
"linear-gradient(135deg, #00c6ff, #0072ff)",
cursor: "pointer",
};

const list: React.CSSProperties = {
display: "grid",
gap: "14px",
marginTop: "22px",
};

const card: React.CSSProperties = {
display: "flex",
gap: "14px",
padding: "16px",
borderRadius: "18px",
background:
"rgba(255,255,255,0.05)",
};

const avatar: React.CSSProperties = {
width: "42px",
height: "42px",
borderRadius: "50%",
};

const avatarSmall: React.CSSProperties = {
width: "30px",
height: "30px",
borderRadius: "50%",
};

const topRow: React.CSSProperties = {
display: "flex",
justifyContent: "space-between",
};

const dateText: React.CSSProperties = {
color: "#94a3b8",
fontSize: "12px",
};

const contentStyle: React.CSSProperties = {
color: "#fff",
};

const reactionRow: React.CSSProperties = {
display: "flex",
gap: "8px",
marginTop: "10px",
};

const reactionBtn: React.CSSProperties = {
border: "none",
borderRadius: "999px",
padding: "6px 10px",
background:
"rgba(255,255,255,0.08)",
color: "#fff",
cursor: "pointer",
};

const reactionBtnActive: React.CSSProperties = {
background:
"rgba(0,198,255,0.3)",
};

const actionRow: React.CSSProperties = {
display: "flex",
gap: "10px",
marginTop: "10px",
};

const replyBtn: React.CSSProperties = {
border: "none",
background:
"rgba(0,198,255,0.15)",
color: "#67e8f9",
borderRadius: "10px",
padding: "6px 10px",
cursor: "pointer",
};

const deleteBtn: React.CSSProperties = {
border: "none",
background:
"rgba(255,0,0,0.15)",
color: "#ffb4b4",
borderRadius: "10px",
padding: "6px 10px",
cursor: "pointer",
};

const replyInputBox: React.CSSProperties = {
marginTop: "12px",
display: "flex",
gap: "10px",
};

const repliesBox: React.CSSProperties = {
marginTop: "14px",
paddingLeft: "14px",
borderLeft:
"2px solid rgba(0,198,255,0.2)",
display: "grid",
gap: "10px",
};

const replyCard: React.CSSProperties = {
display: "flex",
gap: "10px",
};

const replyContent: React.CSSProperties = {
color: "#fff",
margin: 0,
};

const mentionsBox: React.CSSProperties = {
position: "absolute",
top: "62px",
left: "0",
width: "340px",
maxHeight: "320px",
overflowY: "auto",
background: "#1c1f26",
borderRadius: "16px",
padding: "8px",
zIndex: 9999,
};

const mentionItem: React.CSSProperties = {
display: "flex",
alignItems: "center",
gap: "10px",
padding: "10px",
cursor: "pointer",
};

const mentionAvatar: React.CSSProperties = {
width: "36px",
height: "36px",
borderRadius: "50%",
};
