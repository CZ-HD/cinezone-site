"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ActualitesPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

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
    const { data } = await supabase
      .from("actualites")
      .select("*")
      .order("created_at", { ascending: false });

    setPosts(data || []);
  }

  async function addPost() {
    if (!title || !content) return;

    await supabase.from("actualites").insert({
      title,
      content,
    });

    setTitle("");
    setContent("");
    loadPosts();
  }

  async function deletePost(id: string) {
    await supabase.from("actualites").delete().eq("id", id);
    loadPosts();
  }

  return (
    <main style={pageStyle}>
      <h1>📰 Actualités CineZone</h1>

      {/* ADMIN PANEL */}
      {isAdmin && (
        <div style={adminBox}>
          <h2>👑 Ajouter une actualité</h2>

          <input
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Contenu"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={inputStyle}
          />

          <button onClick={addPost} style={btnStyle}>
            Publier
          </button>
        </div>
      )}

      {/* LISTE */}
      <div style={{ marginTop: "30px", display: "grid", gap: "20px" }}>
        {posts.length === 0 ? (
          <p style={{ color: "#888" }}>Aucune actualité.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={cardStyle}>
              <h2>{post.title}</h2>
              <p style={{ color: "#aaa", fontSize: "14px" }}>
                {new Date(post.created_at).toLocaleString()}
              </p>
              <p>{post.content}</p>

              {isAdmin && (
                <button
                  onClick={() => deletePost(post.id)}
                  style={deleteBtn}
                >
                  🗑 Supprimer
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "40px",
  color: "#fff",
  background:
    "radial-gradient(circle at top, rgba(0,120,255,0.18), #000 60%)",
};

const adminBox: React.CSSProperties = {
  padding: "20px",
  borderRadius: "16px",
  background: "rgba(0,0,0,0.5)",
  border: "1px solid rgba(0,198,255,0.3)",
  display: "grid",
  gap: "10px",
  maxWidth: "600px",
};

const inputStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#111",
  color: "#fff",
};

const btnStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#00c6ff",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  padding: "20px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const deleteBtn: React.CSSProperties = {
  marginTop: "10px",
  padding: "8px",
  background: "#ff4444",
  border: "none",
  borderRadius: "8px",
  color: "#fff",
  cursor: "pointer",
};
