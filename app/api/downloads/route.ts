import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const {
      id,
      link,
      stream_link,
      codec,
      audio,
      title,
      poster_path,
      backdrop_path,
      vote_average,
      release_date,
      release_year,
      imdb_id,
    } = await req.json();

    if (!link && !stream_link) {
      return NextResponse.json(
        {
          error:
            "Au moins un lien est obligatoire (téléchargement ou streaming).",
        },
        { status: 400 }
      );
    }

    if (!id && !title) {
      return NextResponse.json(
        { error: "ID TMDB ou titre manuel obligatoire" },
        { status: 400 }
      );
    }

    const finalId = id ? Number(id) : Date.now();

    const finalReleaseYear =
      release_year ||
      (release_date
        ? Number(String(release_date).substring(0, 4))
        : null);

    const cleanImdbId = imdb_id
      ? String(imdb_id).match(/tt\d+/)?.[0] || imdb_id
      : null;

    // 🔥 Récupère les données existantes
    const { data: existingMovie } = await supabase
      .from("downloads")
      .select("link, stream_link")
      .eq("id", finalId)
      .maybeSingle();

    const { error } = await supabase
      .from("downloads")
      .upsert(
        {
          id: finalId,

          // Conserve l'ancien lien s'il n'est pas modifié
          link:
            link && link.trim() !== ""
              ? link
              : existingMovie?.link || null,

          // Conserve l'ancien streaming s'il n'est pas modifié
          stream_link:
            stream_link && stream_link.trim() !== ""
              ? stream_link
              : existingMovie?.stream_link || null,

          codec: codec || "H264",
          audio: audio || "VF",
          title: title || "Film sans titre",
          poster_path: poster_path || null,
          backdrop_path: backdrop_path || null,
          vote_average: vote_average || null,
          release_date: release_date || null,
          release_year: finalReleaseYear,
          imdb_id: cleanImdbId,
        },
        { onConflict: "id" }
      );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
