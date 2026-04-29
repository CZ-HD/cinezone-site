"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function ActualitesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    checkAdmin();
    loadPosts();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      setIsAdmin(true);
    }
  }

  async function loadPosts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("actualites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setPosts([]);
    } else {
      setPosts(data || []);
    }

    setLoading(false);
  }

  async function addPost() {
    if (!title.trim() || !content.trim()) return;

    const { error } = await supabase.from("actualites").insert({
      title: title.trim(),
      content: content.trim(),
    });

    if (error) {
      alert("Erreur publication : " + error.message);
      return;
    }

    setTitle("");
    setContent("");
    loadPosts();
  }

  async function deletePost(id: string) {
    if (!confirm("Supprimer cette actualité ?")) return;

    const { error } = await supabase.from("actualites").delete().eq("id", id);

    if (error) {
      alert("Erreur suppression : " + error.message);
      return;
    }

    loadPosts();
  }

  function startEdit(post: Post) {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  }

  async function updatePost(id: string) {
    if (!editTitle.trim() || !editContent.trim()) return;

    const { error } = await supabase
      .from("actualites")
      .update({
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      .eq("id", id);

    if (error) {
      alert("Erreur modification : " + error.message);
      return;
    }

    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    loadPosts();
  }

  return (
    <main style={pageStyle}>
      <section style={containerStyle}>
        <div style={heroStyle}>
          <span style={badgeStyle}>📰 CineZone News</span>
          <h1 style={titleStyle}>Actualités CineZone</h1>
          <p style={subtitleStyle}>
            Retrouve ici les annonces, nouveautés et informations importantes.
          </p>

          <div style={statsStyle}>
            <span>📌 {posts.length} actualité{posts.length > 1 ? "s" : ""}</span>
            {isAdmin && <span>👑 Mode admin</span>}
          </div>
        </div>

        {isAdmin && (
          <div style={adminBox}>
            <h2 style={{ margin: 0 }}>👑 Ajouter une actualité</h2>

            <input
              placeholder="Titre de l’actualité"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder="Contenu de l’actualité"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={textareaStyle}
            />

            {(title || content) && (
              <div style={previewBox}>
                <span style={previewLabel}>Prévisualisation</span>
                <h3 style={{ margin: "8px 0" }}>{title || "Titre..."}</h3>
                <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.6 }}>
                  {content || "Contenu..."}
                </p>
              </div>
            )}

            <button onClick={addPost} style={btnStyle}>
              🚀 Publier
            </button>
          </div>
        )}

        <div style={listStyle}>
          {loading ? (
            <div style={emptyStyle}>Chargement des actualités...</div>
          ) : posts.length === 0 ? (
            <div style={emptyStyle}>
              <div style={{ fontSize: "42px" }}>🗞️</div>
              <h2>Aucune actualité</h2>
              <p>Les prochaines annonces apparaîtront ici.</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} style={cardStyle}>
                {editingId === post.id ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={inputStyle}
                    />

                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={textareaStyle}
                    />

                    <div style={actionsStyle}>
                      <button onClick={() => updatePost(post.id)} style={saveBtn}>
                        💾 Sauvegarder
                      </button>
                      <button onClick={() => setEditingId(null)} style={cancelBtn}>
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={cardHeaderStyle}>
                      <div>
                        <h2 style={cardTitleStyle}>{post.title}</h2>
                        <p style={dateStyle}>
                          🕒 {new Date(post.created_at).toLocaleString("fr-FR")}
                        </p>
                      </div>

                      {isAdmin && <span style={adminBadge}>ADMIN</span>}
                    </div>

                    <p style={contentStyle}>{post.content}</p>

                    {isAdmin && (
                      <div style={actionsStyle}>
                        <button onClick={() => startEdit(post)} style={editBtn}>
                          ✏️ Modifier
                        </button>
                        <button onClick={() => deletePost(post.id)} style={deleteBtn}>
                          🗑 Supprimer
                        </button>
                      </div>
                    )}
                  </>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "40px 20px",
  color: "#fff",
  background:
    "radial-gradient(circle at top, rgba(0,198,255,0.18), transparent 35%), linear-gradient(180deg, #020617, #000)",
  display: "flex",
  justifyContent: "center",
  fontFamily: "Arial, sans-serif",
};

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "900px",
};

const heroStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "28px",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.35)",
  color: "#67e8f9",
  fontWeight: 800,
};

const titleStyle: React.CSSProperties = {
  fontSize: "42px",
  margin: "18px 0 10px",
};

const subtitleStyle: React.CSSProperties = {
  color: "#cbd5e1",
  margin: 0,
};

const statsStyle: React.CSSProperties = {
  marginTop: "18px",
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  flexWrap: "wrap",
  color: "#93c5fd",
  fontWeight: 700,
};

const adminBox: React.CSSProperties = {
  padding: "22px",
  borderRadius: "24px",
  background: "rgba(8,13,22,0.82)",
  border: "1px solid rgba(0,198,255,0.35)",
  boxShadow: "0 25px 80px rgba(0,0,0,0.65), 0 0 45px rgba(0,198,255,0.12)",
  display: "grid",
  gap: "14px",
  marginBottom: "30px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.45)",
  color: "#fff",
  outline: "none",
  fontSize: "15px",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "120px",
  resize: "vertical",
};

const btnStyle: React.CSSProperties = {
  padding: "14px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 12px 35px rgba(0,114,255,0.35)",
};

const previewBox: React.CSSProperties = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const previewLabel: React.CSSProperties = {
  color: "#67e8f9",
  fontSize: "12px",
  fontWeight: 900,
  textTransform: "uppercase",
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: "18px",
};

const cardStyle: React.CSSProperties = {
  padding: "22px",
  borderRadius: "22px",
  background:
    "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(2,6,23,0.88))",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 18px 60px rgba(0,0,0,0.5)",
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start",
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "24px",
};

const dateStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
  margin: "8px 0 0",
};

const contentStyle: React.CSSProperties = {
  color: "#e5e7eb",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  marginTop: "18px",
};

const adminBadge: React.CSSProperties = {
  background: "linear-gradient(135deg, #ffe58a, #ffb300)",
  color: "#000",
  padding: "5px 10px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 900,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "16px",
};

const editBtn: React.CSSProperties = {
  padding: "10px 13px",
  borderRadius: "12px",
  border: "1px solid rgba(0,198,255,0.4)",
  background: "rgba(0,198,255,0.12)",
  color: "#67e8f9",
  fontWeight: 800,
  cursor: "pointer",
};

const deleteBtn: React.CSSProperties = {
  padding: "10px 13px",
  borderRadius: "12px",
  border: "1px solid rgba(255,90,90,0.45)",
  background: "rgba(255,70,70,0.15)",
  color: "#ffb3b3",
  fontWeight: 800,
  cursor: "pointer",
};

const saveBtn: React.CSSProperties = {
  ...editBtn,
  background: "rgba(34,197,94,0.18)",
  border: "1px solid rgba(34,197,94,0.45)",
  color: "#86efac",
};

const cancelBtn: React.CSSProperties = {
  ...deleteBtn,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#e5e7eb",
};

const emptyStyle: React.CSSProperties = {
  padding: "50px 20px",
  textAlign: "center",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.04)",
  border: "1px dashed rgba(255,255,255,0.18)",
  color: "#94a3b8",
};
