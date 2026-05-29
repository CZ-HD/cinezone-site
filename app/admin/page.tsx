"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const API_KEY = "783698341437f0c7827887dbd9a2b426";
const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];
const DEFAULT_AVATAR =
  "https://kafxrsktznrbuvwlkdeg.supabase.co/storage/v1/object/public/avatars/adult-7.png";

type Profile = {
  id: string;
  email?: string;
  username?: string;
  avatar?: string;
  role?: string;
  role_color?: string;
  status?: string;
  status_text?: string;
  created_at?: string;
};

type Presence = {
  user_id: string;
  email?: string;
  username?: string;
  avatar?: string;
  role?: string;
  current_page?: string;
  last_seen?: string;
};

type Saga = {
  id: string;
  title: string;
  slug: string;
  poster?: string | null;
  backdrop?: string | null;
  description?: string | null;
  created_at?: string;
};

type DownloadMovie = {
  id: number;
  title?: string | null;
  poster_path?: string | null;
  release_year?: number | null;
  saga_id?: string | null;
};

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  created_at: string;
  read_at?: string | null;
  profiles?: {
    username?: string | null;
    email?: string | null;
    avatar?: string | null;
  } | null;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [id, setId] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");

  const [bulkInput, setBulkInput] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const [manualTitle, setManualTitle] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [manualPoster, setManualPoster] = useState("");
  const [manualBackdrop, setManualBackdrop] = useState("");
  const [manualVote, setManualVote] = useState("");
  const [manualImdb, setManualImdb] = useState("");
  const [manualLink, setManualLink] = useState("");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [searchMember, setSearchMember] = useState("");

  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [notificationFilter, setNotificationFilter] = useState("all");

  const [sagas, setSagas] = useState<Saga[]>([]);
  const [adminMovies, setAdminMovies] = useState<DownloadMovie[]>([]);
  const [sagaTitle, setSagaTitle] = useState("");
  const [sagaSlug, setSagaSlug] = useState("");
  const [sagaPoster, setSagaPoster] = useState("");
  const [sagaBackdrop, setSagaBackdrop] = useState("");
  const [sagaDescription, setSagaDescription] = useState("");
  const [selectedSagaId, setSelectedSagaId] = useState("");
  const [filmSearch, setFilmSearch] = useState("");
  const [sagaLoading, setSagaLoading] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    loadPresence();
    loadUsers();
    loadSagas();
    loadAdminMovies();
    loadNotifications();

    const timer = setInterval(() => {
      loadPresence();
      loadUsers();
      loadNotifications();
    }, 15000);

    return () => clearInterval(timer);
  }, [isAdmin]);

  const addAffiliate = (url: string) => {
    const affiliate = "af=5257374";
    if (!url.includes("1fichier.com")) return url;
    if (url.includes("af=")) return url;
    return url.includes("?") ? `${url}&${affiliate}` : `${url}?${affiliate}`;
  };

  const cleanImdb = (value: string) => {
    const found = value.match(/tt\d+/);
    return found ? found[0] : value.trim();
  };

  const makeSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (user.email && CREATOR_EMAILS.includes(user.email)) {
      setIsAdmin(true);
      setLoading(false);
      loadUsers();
      loadNotifications();
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "admin" || profile.status !== "approved") {
      window.location.href = "/";
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    loadUsers();
    loadNotifications();
  };

  const loadNotifications = async () => {
  setMessage("");

  const { data: notifData, error: notifError } = await supabase
    .from("notifications")
    .select("id,user_id,type,title,message,link,read,created_at,read_at")
    .order("created_at", { ascending: false });

  if (notifError) {
    setMessage("❌ Erreur notifications : " + notifError.message);
    return;
  }

  const notificationsList = notifData || [];

  if (notificationsList.length === 0) {
    setNotifications([]);
    return;
  }

  const userIds = [
    ...new Set(
      notificationsList
        .map((n) => n.user_id)
        .filter(Boolean)
    ),
  ];

  if (userIds.length === 0) {
    setNotifications(
      notificationsList.map((notif) => ({
        ...notif,
        profiles: null,
      })) as NotificationRow[]
    );
    return;
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, email, avatar")
    .in("id", userIds);

  if (profileError) {
    setMessage("❌ Erreur profils notifications : " + profileError.message);
    return;
  }

  const profilesMap = new Map(
    (profileData || []).map((profile) => [profile.id, profile])
  );

  const finalData = notificationsList.map((notif) => ({
    ...notif,
    profiles: profilesMap.get(notif.user_id) || null,
  }));

  setNotifications(finalData as NotificationRow[]);
};
const deleteReadNotifications = async () => {
  if (!confirm("Supprimer toutes les notifications lues ?")) return;

  const { data, error } = await supabase
    .from("notifications")
    .delete()
    .is("read", true)
    .select("id");

  if (error) {
    alert("Erreur suppression : " + error.message);
    return;
  }

 await loadNotifications();

  alert(`${data?.length || 0} notification(s) lue(s) supprimée(s)`);
};

const deleteAllNotifications = async () => {
  if (!confirm("Supprimer toutes les notifications ?")) return;

  const { data, error } = await supabase
    .from("notifications")
    .delete()
    .not("id", "is", null)
    .select("id");

  if (error) {
    alert("Erreur suppression : " + error.message);
    return;
  }

  await loadNotifications();

  alert(`${data?.length || 0} notification(s) supprimée(s)`);
};
  const loadUsers = async () => {
    const { data, error, count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("❌ Erreur chargement membres : " + error.message);
      return;
    }

    setProfiles(data || []);
    setMemberCount(count || 0);
  };

  const loadPresence = async () => {
    const { data } = await supabase.from("user_presence").select("*");
    setPresences(data || []);
  };

  const loadSagas = async () => {
    const { data, error } = await supabase
      .from("sagas")
      .select("*")
      .order("title", { ascending: true });

    if (error) {
      setMessage("❌ Erreur chargement sagas : " + error.message);
      return;
    }

    setSagas(data || []);
  };

  const loadAdminMovies = async () => {
  let allMovies: DownloadMovie[] = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("downloads")
      .select("id,title,poster_path,release_year,saga_id")
      .order("title", { ascending: true })
      .range(from, from + step - 1);

    if (error) {
      setMessage("❌ Erreur chargement films : " + error.message);
      return;
    }

    allMovies = [...allMovies, ...(data || [])];

    if (!data || data.length < step) {
      break;
    }

    from += step;
  }

  setAdminMovies(allMovies);
};

  const createSaga = async () => {
    if (!sagaTitle.trim()) {
      setMessage("❌ Ajoute un titre de saga.");
      return;
    }

    const finalSlug = sagaSlug.trim() || makeSlug(sagaTitle);

    if (!finalSlug) {
      setMessage("❌ Slug invalide.");
      return;
    }

    setSagaLoading(true);

    const { error } = await supabase.from("sagas").insert({
      title: sagaTitle.trim(),
      slug: finalSlug,
      poster: sagaPoster.trim() || null,
      backdrop: sagaBackdrop.trim() || null,
      description: sagaDescription.trim() || null,
    });

    setSagaLoading(false);

    if (error) {
      setMessage("❌ Erreur création saga : " + error.message);
      return;
    }

    setMessage("✅ Saga créée !");
    setSagaTitle("");
    setSagaSlug("");
    setSagaPoster("");
    setSagaBackdrop("");
    setSagaDescription("");
    loadSagas();
  };

  const attachMovieToSaga = async (movieId: number, sagaId: string) => {
    if (!sagaId) {
      setMessage("❌ Choisis une saga d’abord.");
      return;
    }

    const { error } = await supabase
      .from("downloads")
      .update({ saga_id: sagaId })
      .eq("id", movieId);

    if (error) {
      setMessage("❌ Erreur association saga : " + error.message);
      return;
    }

    setMessage("✅ Film ajouté à la saga.");
    loadAdminMovies();
  };

  const detachMovieFromSaga = async (movieId: number) => {
    const { error } = await supabase
      .from("downloads")
      .update({ saga_id: null })
      .eq("id", movieId);

    if (error) {
      setMessage("❌ Erreur retrait saga : " + error.message);
      return;
    }

    setMessage("✅ Film retiré de la saga.");
    loadAdminMovies();
  };

  const createSagaAndAttachSearchResults = async () => {
    const title = filmSearch.trim();

    if (!title) {
      setMessage("❌ Écris le nom de la saga dans la recherche. Exemple : Retour vers le futur");
      return;
    }

    const moviesToAttach = adminMovies.filter((movie) =>
      (movie.title || "").toLowerCase().includes(title.toLowerCase())
    );

    if (moviesToAttach.length === 0) {
      setMessage("❌ Aucun film trouvé avec cette recherche.");
      return;
    }

    setSagaLoading(true);

    const slug = makeSlug(title);

    let sagaId = "";

    const { data: existingSaga } = await supabase
      .from("sagas")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    const firstMovie = moviesToAttach[0];
    const autoPoster = firstMovie?.poster_path
      ? firstMovie.poster_path.startsWith("http")
        ? firstMovie.poster_path
        : `https://image.tmdb.org/t/p/w600_and_h900_bestv2${firstMovie.poster_path}`
      : null;

    const autoBackdrop = null;

    if (existingSaga?.id) {
      sagaId = existingSaga.id;

      await supabase
        .from("sagas")
        .update({
          poster: autoPoster,
          backdrop: autoBackdrop,
        })
        .eq("id", sagaId);
    } else {
      const { data: newSaga, error: sagaError } = await supabase
        .from("sagas")
        .insert({
          title,
          slug,
          poster: autoPoster,
          backdrop: autoBackdrop,
          description: `Tous les films ${title} regroupés sur CineZone HD`,
        })
        .select("id")
        .single();

      if (sagaError || !newSaga?.id) {
        setSagaLoading(false);
        setMessage("❌ Erreur création saga : " + (sagaError?.message || "inconnue"));
        return;
      }

      sagaId = newSaga.id;
    }

    const ids = moviesToAttach.map((movie) => movie.id);

    const { error } = await supabase
      .from("downloads")
      .update({ saga_id: sagaId })
      .in("id", ids);

    setSagaLoading(false);

    if (error) {
      setMessage("❌ Erreur association automatique : " + error.message);
      return;
    }

    setMessage(`✅ Saga prête : ${moviesToAttach.length} film(s) ajouté(s) dans ${title}.`);
    setSelectedSagaId(sagaId);
    loadSagas();
    loadAdminMovies();
  };

  const getPresence = (userId: string) =>
    presences.find((presence) => presence.user_id === userId);

  const isOnline = (userId: string) => {
  return true;
};

  const seenAgo = (lastSeen?: string) => {
    if (!lastSeen) return "Jamais vu";

    const seconds = Math.floor(
      (Date.now() - new Date(lastSeen).getTime()) / 1000
    );

    if (seconds < 60) return "Vu à l’instant";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Vu il y a ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Vu il y a ${hours} h`;

    const days = Math.floor(hours / 24);
    return `Vu il y a ${days} j`;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";

    return new Date(value).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const saveDownload = async () => {
    if (!id || !link) {
      setMessage("Remplis l'ID TMDB et le lien.");
      return;
    }

    setMessage("Ajout du film en cours...");

    try {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=fr-FR`
      );

      if (!movieRes.ok) {
        setMessage("❌ ID TMDB introuvable. Utilise l’ajout manuel.");
        return;
      }

      const movie = await movieRes.json();

      const res = await fetch("/api/downloads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(id),
          link: addAffiliate(link),
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
          release_year: movie.release_date
            ? Number(movie.release_date.substring(0, 4))
            : null,
          imdb_id: movie.imdb_id || null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage("❌ Erreur : " + result.error);
        return;
      }

      setMessage("✅ Film ajouté automatiquement avec TMDB !");
      setId("");
      setLink("");
      loadAdminMovies();
    } catch {
      setMessage("❌ Erreur lors de l'ajout du film.");
    }
  };

  const saveBulkDownloads = async () => {
    if (!bulkInput.trim()) {
      setMessage("❌ Ajoute au moins une ligne.");
      return;
    }

    setBulkLoading(true);
    setMessage("📦 Ajout multiple en cours...");

    const lines = bulkInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let success = 0;
    let errors = 0;

    for (const line of lines) {
      let tmdbId = "";
      let downloadLink = "";

      if (line.includes("|")) {
        const parts = line.split("|");
        tmdbId = parts[0]?.trim();
        downloadLink = parts[1]?.trim();
      } else {
        const parts = line.trim().split(/\s+/);
        tmdbId = parts[0];
        downloadLink = parts.slice(1).join(" ");
      }

      if (!tmdbId || !downloadLink) {
        errors++;
        continue;
      }

      try {
        const movieRes = await fetch(
          `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}&language=fr-FR`
        );

        if (!movieRes.ok) {
          errors++;
          continue;
        }

        const movie = await movieRes.json();

        const res = await fetch("/api/downloads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: Number(tmdbId),
            link: addAffiliate(downloadLink),
            title: movie.title,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            release_year: movie.release_date
              ? Number(movie.release_date.substring(0, 4))
              : null,
            imdb_id: movie.imdb_id || null,
          }),
        });

        if (res.ok) {
          success++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }

    setBulkLoading(false);
    setBulkInput("");
    setMessage(
      `✅ Ajout terminé : ${success} film(s) ajouté(s), ${errors} erreur(s).`
    );
    loadAdminMovies();
  };

  const saveManualDownload = async () => {
    if (!manualTitle || !manualYear || !manualPoster || !manualLink) {
      setMessage("❌ Remplis au minimum : titre, année, affiche et lien.");
      return;
    }

    setMessage("Ajout manuel du film en cours...");

    const res = await fetch("/api/downloads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        link: addAffiliate(manualLink),
        title: manualTitle,
        poster_path: manualPoster,
        backdrop_path: manualBackdrop || manualPoster,
        vote_average: manualVote ? Number(manualVote) : null,
        release_date: `${manualYear}-01-01`,
        release_year: Number(manualYear),
        imdb_id: manualImdb ? cleanImdb(manualImdb) : null,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setMessage("❌ Erreur : " + result.error);
      return;
    }

    setMessage("✅ Film ajouté manuellement !");
    setManualTitle("");
    setManualYear("");
    setManualPoster("");
    setManualBackdrop("");
    setManualVote("");
    setManualImdb("");
    setManualLink("");
    loadAdminMovies();
  };

  const updateAllMovies = async () => {
    setMessage("🔄 Mise à jour des affiches en cours...");

    const { data: movies, error } = await supabase
      .from("downloads")
      .select("id");

    if (error || !movies) {
      setMessage("❌ Aucun film trouvé.");
      return;
    }

    for (const movie of movies) {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=fr-FR`
        );

        if (!res.ok) continue;

        const tmdb = await res.json();

        await supabase
          .from("downloads")
          .update({
            title: tmdb.title,
            poster_path: tmdb.poster_path,
            backdrop_path: tmdb.backdrop_path,
            vote_average: tmdb.vote_average,
            release_date: tmdb.release_date,
            release_year: tmdb.release_date
              ? Number(tmdb.release_date.substring(0, 4))
              : null,
            imdb_id: tmdb.imdb_id || null,
          })
          .eq("id", movie.id);
      } catch {
        console.log("Erreur film", movie.id);
      }
    }

    setMessage("✅ Toutes les affiches ont été mises à jour !");
    loadAdminMovies();
  };

  const updateUser = async (userId: string, values: Partial<Profile>) => {
    const { error } = await supabase
      .from("profiles")
      .update(values)
      .eq("id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    loadUsers();
  };

  const deleteProfile = async (userId: string) => {
    if (!confirm("Supprimer ce profil ?")) return;

    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    loadUsers();
  };

  const filteredProfiles = profiles.filter((profile) => {
    const q = searchMember.toLowerCase();

    return (
      (profile.email || "").toLowerCase().includes(q) ||
      (profile.username || "").toLowerCase().includes(q) ||
      (profile.role || "").toLowerCase().includes(q) ||
      (profile.status || "").toLowerCase().includes(q)
    );
  });

  const filteredNotifications = notifications.filter((notif) => {
    if (notificationFilter === "read") return notif.read;
    if (notificationFilter === "unread") return !notif.read;
    return true;
  });

  const readNotifications = notifications.filter((n) => n.read).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const filteredAdminMovies = useMemo(() => {
    const q = filmSearch.toLowerCase().trim();
    if (!q) return adminMovies.slice(0, 60);

    return adminMovies
      .filter((movie) => (movie.title || "").toLowerCase().includes(q))
      .slice(0, 80);
  }, [adminMovies, filmSearch]);

  if (loading) {
    return (
      <main style={pageStyle}>
        <p>Chargement admin...</p>
      </main>
    );
  }

  if (!isAdmin) return null;

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
  <span style={badgeStyle}>👑 Administration</span>

  <h1 style={titleStyle}>Admin CineZone HD</h1>

  <p style={subText}>
    Gestion des films, des membres, des sagas et des accès.
  </p>

  <div style={{ marginTop: "18px" }}>
    <a
      href="/admin/mail"
      style={{
        display: "inline-block",
        padding: "12px 18px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #00c6ff, #0072ff)",
        color: "#fff",
        fontWeight: 800,
        textDecoration: "none",
        boxShadow: "0 10px 30px rgba(0,198,255,0.35)",
      }}
    >
      📧 Envoyer un mail
    </a>
  </div>
</div>

        <div style={counterStyle}>
          <strong>{memberCount}</strong>
          <span>membres inscrits</span>
        </div>
      </section>

      <section style={cardStyle}>
        <h2>🎬 Ajout automatique TMDB</h2>
        <p style={subText}>
          Utilise ton système actuel : ID TMDB + lien. L’affiliation reste automatique.
        </p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ID TMDB du film"
            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
          />

          <button
            type="button"
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              const found = text.match(/\/movie\/(\d+)/) || text.match(/^(\d+)/);

              if (found) {
                setId(found[1]);
              } else {
                alert("Aucun ID TMDB trouvé");
              }
            }}
            style={copyIdBtn}
          >
            📋
          </button>
        </div>

        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Lien de téléchargement"
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={saveDownload} style={btnBlue}>
            💾 Enregistrer avec TMDB
          </button>

          <button onClick={updateAllMovies} style={btnPurple}>
            🔄 Mettre à jour toutes les affiches
          </button>
        </div>

        {message && <p style={{ marginTop: "16px" }}>{message}</p>}
      </section>

      <section style={cardStyle}>
        <h2>📦 Ajout multiple TMDB</h2>
        <p style={subText}>
          Format : ID TMDB | lien de téléchargement. Un film par ligne.
        </p>

        <textarea
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          placeholder={`12345 | https://lien-film-1.com\n67890 | https://lien-film-2.com\n11223 | https://lien-film-3.com`}
          style={textareaStyle}
        />

        <button
          onClick={saveBulkDownloads}
          style={{
            ...btnBlue,
            opacity: bulkLoading ? 0.6 : 1,
            cursor: bulkLoading ? "not-allowed" : "pointer",
          }}
          disabled={bulkLoading}
        >
          {bulkLoading ? "📦 Ajout en cours..." : "📦 Ajouter plusieurs films"}
        </button>
      </section>

      <section style={cardStyle}>
        <h2>✍️ Ajout manuel</h2>
        <p style={subText}>
          À utiliser seulement si TMDB ne trouve pas le film. IMDb est optionnel.
        </p>

        <input
          value={manualTitle}
          onChange={(e) => setManualTitle(e.target.value)}
          placeholder="Titre du film"
          style={inputStyle}
        />

        <div style={twoColumns}>
          <input
            value={manualYear}
            onChange={(e) => setManualYear(e.target.value)}
            placeholder="Année ex: 2026"
            style={inputStyle}
          />

          <input
            value={manualVote}
            onChange={(e) => setManualVote(e.target.value)}
            placeholder="Note ex: 7.5"
            style={inputStyle}
          />
        </div>

        <input
          value={manualPoster}
          onChange={(e) => setManualPoster(e.target.value)}
          placeholder="URL affiche / poster"
          style={inputStyle}
        />

        <input
          value={manualBackdrop}
          onChange={(e) => setManualBackdrop(e.target.value)}
          placeholder="URL image de fond optionnelle"
          style={inputStyle}
        />

        <input
          value={manualImdb}
          onChange={(e) => setManualImdb(e.target.value)}
          placeholder="ID IMDb optionnel ex: tt0111161"
          style={inputStyle}
        />

        <input
          value={manualLink}
          onChange={(e) => setManualLink(e.target.value)}
          placeholder="Lien de téléchargement"
          style={inputStyle}
        />

        <button onClick={saveManualDownload} style={btnGreen}>
          ✅ Enregistrer manuellement
        </button>
      </section>

      <section style={cardStyle}>
        <h2>🎞️ Gestion des sagas</h2>
        <p style={subText}>
          Crée une saga et range tes films sans passer par Supabase. Les films gardent leur fonctionnement actuel.
        </p>

        <div style={twoColumns}>
          <input
            value={sagaTitle}
            onChange={(e) => {
              setSagaTitle(e.target.value);
              if (!sagaSlug) setSagaSlug(makeSlug(e.target.value));
            }}
            placeholder="Nom de la saga ex: Harry Potter"
            style={inputStyle}
          />

          <input
            value={sagaSlug}
            onChange={(e) => setSagaSlug(makeSlug(e.target.value))}
            placeholder="slug ex: harry-potter"
            style={inputStyle}
          />
        </div>

        <input
          value={sagaPoster}
          onChange={(e) => setSagaPoster(e.target.value)}
          placeholder="URL poster saga"
          style={inputStyle}
        />

        <input
          value={sagaBackdrop}
          onChange={(e) => setSagaBackdrop(e.target.value)}
          placeholder="URL image de fond saga"
          style={inputStyle}
        />

        <textarea
          value={sagaDescription}
          onChange={(e) => setSagaDescription(e.target.value)}
          placeholder="Description de la saga"
          style={{ ...textareaStyle, minHeight: "100px" }}
        />

        <button
          onClick={createSaga}
          style={{
            ...btnPurple,
            opacity: sagaLoading ? 0.6 : 1,
            cursor: sagaLoading ? "not-allowed" : "pointer",
          }}
          disabled={sagaLoading}
        >
          {sagaLoading ? "Création..." : "🎞️ Créer la saga"}
        </button>

        <div style={sagaPanelStyle}>
          <div>
            <h3 style={{ marginTop: 0 }}>Associer un film à une saga</h3>
            <p style={subText}>Choisis une saga, cherche un film, puis clique sur “Ajouter”.</p>
          </div>

          <div style={twoColumns}>
            <select
              value={selectedSagaId}
              onChange={(e) => setSelectedSagaId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Choisir une saga</option>
              {sagas.map((saga) => (
                <option key={saga.id} value={saga.id}>
                  {saga.title}
                </option>
              ))}
            </select>

            <input
              value={filmSearch}
              onChange={(e) => setFilmSearch(e.target.value)}
              placeholder="Rechercher un film... ex: Retour vers le futur"
              style={inputStyle}
            />
          </div>

          <button
            onClick={createSagaAndAttachSearchResults}
            style={{
              ...btnGreen,
              marginBottom: "14px",
              opacity: sagaLoading ? 0.6 : 1,
              cursor: sagaLoading ? "not-allowed" : "pointer",
            }}
            disabled={sagaLoading}
          >
            ⚡ Créer la saga + ajouter tous les films trouvés
          </button>

          {sagas.length === 0 ? (
            <p style={{ color: "#aaa" }}>Aucune saga créée pour le moment.</p>
          ) : (
            <div style={sagaListStyle}>
              {filteredAdminMovies.map((movie) => {
                const currentSaga = sagas.find((saga) => saga.id === movie.saga_id);
                const posterUrl = movie.poster_path
                  ? movie.poster_path.startsWith("http")
                    ? movie.poster_path
                    : `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                  : "";

                return (
                  <div key={movie.id} style={movieManageRow}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", minWidth: 0 }}>
                      {posterUrl ? (
                        <img src={posterUrl} alt="poster" style={miniPosterStyle} />
                      ) : (
                        <div style={miniPosterFallback}>🎬</div>
                      )}

                      <div style={{ minWidth: 0 }}>
                        <strong style={{ color: "#fff" }}>{movie.title || `Film ${movie.id}`}</strong>
                        <p style={{ margin: "5px 0 0", color: "#9ca3af", fontSize: "13px" }}>
                          {movie.release_year || "-"} · {currentSaga ? `Saga : ${currentSaga.title}` : "Aucune saga"}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        style={btnBlue}
                        onClick={() => attachMovieToSaga(movie.id, selectedSagaId)}
                      >
                        ➕ Ajouter
                      </button>

                      {movie.saga_id && (
                        <button
                          style={btnRed}
                          onClick={() => detachMovieFromSaga(movie.id)}
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section style={cardStyle}>
        <div style={memberHeader}>
          <div>
            <h2 style={{ margin: 0 }}>🔔 Suivi des notifications</h2>
           <p style={subText}>Voir qui a reçu, lu ou pas encore ouvert les notifications.</p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select
              value={notificationFilter}
              onChange={(e) => setNotificationFilter(e.target.value)}
              style={searchInput}
            >
              <option value="all">Toutes</option>
              <option value="read">Lues</option>
              <option value="unread">Non lues</option>
            </select>

           <button
  type="button"
  onClick={async () => {
    console.log("refresh notifications");
    await loadNotifications();
    alert("Notifications actualisées");
  }}
  style={{
    ...btnBlue,
    position: "relative",
    zIndex: 20,
    pointerEvents: "auto",
  }}
>
  🔄 Actualiser
</button>

<button
  type="button"
  onClick={deleteReadNotifications}
  style={btnRed}
>
  🗑 Supprimer lues
</button>

<button
  type="button"
  onClick={deleteAllNotifications}
  style={btnRed}
>
  🗑 Tout supprimer
</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "18px" }}>
          <span style={rolePill}>Total : {notifications.length}</span>
          <span style={{ ...rolePill, color: "#4ade80" }}>Lues : {readNotifications}</span>
          <span style={{ ...rolePill, color: "#fb7185" }}>Non lues : {unreadNotifications}</span>
        </div>

        <div style={memberGrid}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 2fr 1fr 1fr 1fr",
              padding: "16px 14px",
              background: "rgba(255,255,255,0.04)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              fontWeight: 800,
              color: "#dbeafe",
              gap: "12px",
            }}
          >
            <div>Membre</div>
            <div>Notification</div>
            <div>Envoyée</div>
            <div>Statut</div>
            <div>Lue le</div>
          </div>

          {filteredNotifications.length === 0 ? (
            <p style={{ color: "#aaa", padding: "18px" }}>Aucune notification trouvée.</p>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  padding: "16px 14px",
                  display: "grid",
                  gridTemplateColumns: "1.6fr 2fr 1fr 1fr 1fr",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={notif.profiles?.avatar || DEFAULT_AVATAR}
                    alt="avatar"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(0,198,255,0.45)",
                    }}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                  />

                  <div>
                    <strong style={{ color: "#00d2ff" }}>
                      {notif.profiles?.username || "Membre"}
                    </strong>
                    <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "12px" }}>
                      {notif.profiles?.email || "Email inconnu"}
                    </p>
                  </div>
                </div>

                <div>
                  <strong>{notif.title}</strong>
                  <p style={{ margin: "5px 0 0", color: "#cbd5e1", fontSize: "13px" }}>
                    {notif.message}
                  </p>
                  <p style={{ margin: "5px 0 0", color: "#67e8f9", fontSize: "12px" }}>
                    {notif.type} {notif.link ? `· ${notif.link}` : ""}
                  </p>
                </div>

                <div style={{ color: "#cbd5e1", fontSize: "13px" }}>
                  {formatDate(notif.created_at)}
                </div>

                <div>
                  {notif.read ? (
                    <span style={{ ...rolePill, color: "#4ade80" }}>✅ Lu</span>
                  ) : (
                    <span style={{ ...rolePill, color: "#fb7185" }}>⏳ Non lu</span>
                  )}
                </div>

                <div style={{ color: "#cbd5e1", fontSize: "13px" }}>
                  {formatDate(notif.read_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section style={cardStyle}>
        <div style={memberHeader}>
          <div>
            <h2 style={{ margin: 0 }}>👥 Membres inscrits</h2>
            <p style={subText}>Statut réel, page actuelle et dernière activité.</p>
          </div>

          <input
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            placeholder="Rechercher un membre..."
            style={searchInput}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1.2fr 1fr 80px",
            padding: "18px 14px",
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontWeight: 800,
            color: "#dbeafe",
            gap: "12px",
          }}
        >
          <div>Membre</div>
          <div>Rôle</div>
          <div>Statut</div>
          <div>Page actuelle</div>
          <div>Dernière activité</div>
          <div>Inscrit le</div>
          <div>Actions</div>
        </div>

        {filteredProfiles.length === 0 ? (
          <p style={{ color: "#aaa" }}>Aucun membre trouvé.</p>
        ) : (
          <div style={memberGrid}>
            {filteredProfiles.map((member) => {
              const presence = getPresence(member.id);
              const connected = isOnline(member.id);
              const isCreator = !!member.email && CREATOR_EMAILS.includes(member.email);
              const isMemberAdmin = member.role === "admin";

              return (
                <div
                  key={member.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    padding: "18px 14px",
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1.2fr 1fr 80px",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={member.avatar || DEFAULT_AVATAR}
                      alt="avatar"
                      style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: connected
                          ? "2px solid #22c55e"
                          : "2px solid rgba(255,255,255,0.15)",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR;
                      }}
                    />

                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#00d2ff",
                          fontSize: "18px",
                        }}
                      >
                        {member.username || "Nouveau membre"}
                      </div>

                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: "13px",
                          marginTop: "4px",
                        }}
                      >
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={rolePill}>{member.role || "user"}</span>
                    {isCreator && <span style={creatorBadge}>CRÉATEUR</span>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontWeight: 700,
                        fontSize: "12px",
                        width: "fit-content",
                        background:
                          member.status === "approved"
                            ? "rgba(34,197,94,0.18)"
                            : member.status === "blocked"
                            ? "rgba(255,80,80,0.18)"
                            : "rgba(255,215,0,0.18)",
                        color:
                          member.status === "approved"
                            ? "#4ade80"
                            : member.status === "blocked"
                            ? "#ff9b9b"
                            : "#facc15",
                      }}
                    >
                      {member.status || "pending"}
                    </span>

                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontWeight: 700,
                        fontSize: "12px",
                        width: "fit-content",
                        background: connected
                          ? "rgba(34,197,94,0.18)"
                          : "rgba(255,80,80,0.14)",
                        color: connected ? "#4ade80" : "#ff9b9b",
                      }}
                    >
                      {connected ? "🟢 En ligne" : "🔴 Hors ligne"}
                    </span>
                  </div>

                  <div style={{ color: "#d1d5db", fontSize: "14px" }}>
                    {presence?.current_page || "/"}
                  </div>

                  <div
                    style={{
                      color: connected ? "#4ade80" : "#cbd5e1",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    {connected ? "Actif maintenant" : seenAgo(presence?.last_seen)}
                  </div>

                  <div style={{ color: "#cbd5e1", fontSize: "14px" }}>
                    {member.created_at
                      ? new Date(member.created_at).toLocaleDateString("fr-FR")
                      : "-"}
                  </div>

                  <div style={{ position: "relative" }}>
                    <details>
                      <summary
                        style={{
                          cursor: "pointer",
                          listStyle: "none",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "20px",
                        }}
                      >
                        ⋮
                      </summary>

                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "50px",
                          width: "180px",
                          background: "#060b16",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "16px",
                          padding: "10px",
                          zIndex: 50,
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                        }}
                      >
                        <button
                          style={btnGreen}
                          onClick={() => updateUser(member.id, { status: "approved" })}
                        >
                          ✅ Valider
                        </button>

                        <button
                          style={btnOrange}
                          onClick={() => updateUser(member.id, { status: "blocked" })}
                        >
                          🚫 Bannir
                        </button>

                        {!isCreator && (
                          <button
                            style={btnGold}
                            onClick={() =>
                              updateUser(member.id, {
                                role: isMemberAdmin ? "user" : "admin",
                              })
                            }
                          >
                            👑 Admin
                          </button>
                        )}

                        {!isCreator && (
                          <button style={btnRed} onClick={() => deleteProfile(member.id)}>
                            🗑 Supprimer
                          </button>
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, rgba(0,120,255,0.2), #000 62%)",
  color: "#fff",
  padding: "34px",
  fontFamily: "Arial, sans-serif",
};

const heroStyle: React.CSSProperties = {
  maxWidth: "1100px",
  padding: "26px",
  borderRadius: "24px",
  marginBottom: "28px",
  background: "rgba(10,15,25,0.78)",
  border: "1px solid rgba(0,198,255,0.25)",
  boxShadow: "0 20px 70px rgba(0,0,0,0.55)",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  flexWrap: "wrap",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 13px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.35)",
  color: "#67e8f9",
  fontWeight: 900,
};

const titleStyle: React.CSSProperties = {
  fontSize: "38px",
  margin: "14px 0 8px",
};

const subText: React.CSSProperties = {
  color: "#9ca3af",
  margin: "8px 0 14px",
};

const counterStyle: React.CSSProperties = {
  minWidth: "130px",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  display: "grid",
  placeItems: "center",
  textAlign: "center",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "1100px",
  marginBottom: "28px",
  padding: "24px",
  borderRadius: "22px",
  background: "rgba(20,20,25,0.78)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
};

const twoColumns: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "150px",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#111",
  color: "#fff",
  boxSizing: "border-box",
  resize: "vertical",
};

const memberHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const searchInput: React.CSSProperties = {
  minWidth: "260px",
  padding: "13px",
  borderRadius: "14px",
  border: "1px solid rgba(0,198,255,0.25)",
  background: "#0b0f18",
  color: "#fff",
  outline: "none",
};

const memberGrid: React.CSSProperties = {
  width: "100%",
  borderRadius: "22px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(10,15,25,0.72)",
};

const rolePill: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "999px",
  background: "rgba(0,198,255,0.12)",
  border: "1px solid rgba(0,198,255,0.28)",
  color: "#67e8f9",
  fontSize: "11px",
  fontWeight: 900,
};

const creatorBadge: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #ff4fd8, #7c3aed)",
  color: "#fff",
  fontSize: "10px",
  fontWeight: 900,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#111",
  color: "#fff",
  boxSizing: "border-box",
};

const baseBtn: React.CSSProperties = {
  border: "none",
  borderRadius: "12px",
  padding: "10px 13px",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const btnBlue: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #00c6ff, #0072ff)",
};

const btnPurple: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #8e2de2, #4a00e0)",
};

const btnGreen: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #00c853, #009624)",
};

const btnOrange: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ff9800, #e65100)",
};

const btnGold: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ffd76a, #b8860b)",
  color: "#111",
};

const btnRed: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #ff1744, #b00020)",
};

const copyIdBtn: React.CSSProperties = {
  width: "52px",
  height: "48px",
  borderRadius: "12px",
  border: "1px solid rgba(0,198,255,0.35)",
  background: "rgba(0,198,255,0.16)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "20px",
};

const sagaPanelStyle: React.CSSProperties = {
  marginTop: "22px",
  padding: "18px",
  borderRadius: "18px",
  background: "rgba(0,0,0,0.24)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const sagaListStyle: React.CSSProperties = {
  display: "grid",
  gap: "10px",
  maxHeight: "520px",
  overflowY: "auto",
  paddingRight: "5px",
};

const movieManageRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const miniPosterStyle: React.CSSProperties = {
  width: "46px",
  height: "68px",
  objectFit: "cover",
  borderRadius: "8px",
};

const miniPosterFallback: React.CSSProperties = {
  width: "46px",
  height: "68px",
  display: "grid",
  placeItems: "center",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.08)",
};
