import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlayerPage({ params }: any) {
  const { data: movie } = await supabase
    .from("downloads")
    .select("title, stream_link")
    .eq("id", Number(params.id))
    .single();

  if (!movie || !movie.stream_link) {
    return (
      <main
        style={{
          background: "#000",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <h1>Vidéo introuvable</h1>

        <Link
          href={`/movie/${params.id}`}
          style={{
            color: "#00c6ff",
            marginTop: "20px",
          }}
        >
          ← Retour au film
        </Link>
      </main>
    );
  }

  return (
    <main
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "25px",
        }}
      >
        <Link
          href={`/movie/${params.id}`}
          style={{
            color: "#00c6ff",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Retour au film
        </Link>

        <h1
          style={{
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          {movie.title}
        </h1>

        <iframe
          src={movie.stream_link}
          allowFullScreen
          style={{
            width: "100%",
            height: "80vh",
            border: "none",
            borderRadius: "16px",
            background: "#000",
          }}
        />
      </div>
    </main>
  );
}
