import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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
    } = body;

    const hasDownloadLink = Object.prototype.hasOwnProperty.call(body, "link");
    const hasStreamLink = Object.prototype.hasOwnProperty.call(body, "stream_link");

    const downloadLink =
      typeof link === "string" ? link.trim() : "";

    const streamingLink =
      typeof stream_link === "string" ? stream_link.trim() : "";

    if (!downloadLink && !streamingLink && !id && !title) {
      return NextResponse.json(
        { error: "ID TMDB ou titre manuel obligatoire." },
        { status: 400 }
      );
    }

    if (!id && !title) {
      return NextResponse.json(
        { error: "ID TMDB ou titre manuel obligatoire." },
        { status: 400 }
      );
    }

    const finalId = id ? Number(id) : Date.now();

    if (!Number.isSafeInteger(finalId) || finalId <= 0) {
      return NextResponse.json(
        { error: "Identifiant TMDB invalide." },
        { status: 400 }
      );
    }

    const { data: existingMovie, error: lookupError } = await supabase
      .from("downloads")
      .select("id, link, stream_link")
      .eq("id", finalId)
      .maybeSingle();

    if (lookupError) {
      console.error("Erreur lecture du film :", lookupError);

      return NextResponse.json(
        { error: "Impossible de lire les liens existants." },
        { status: 500 }
      );
    }

    // Un champ vide ne doit jamais effacer un lien déjà enregistré.
    const finalDownloadLink =
      downloadLink ||
      (hasDownloadLink ? existingMovie?.link : existingMovie?.link) ||
      null;

    const finalStreamLink =
      streamingLink ||
      (hasStreamLink ? existingMovie?.stream_link : existingMovie?.stream_link) ||
      null;

    if (!finalDownloadLink && !finalStreamLink) {
      return NextResponse.json(
        {
          error:
            "Ajoute au moins un lien de téléchargement ou de streaming.",
        },
        { status: 400 }
      );
    }

    const finalReleaseYear =
      release_year ||
      (release_date
        ? Number(String(release_date).substring(0, 4))
        : null);

    const cleanImdbId = imdb_id
      ? String(imdb_id).match(/tt\d+/)?.[0] || imdb_id
      : null;

    const movieData: Record<string, unknown> = {
      id: finalId,
      link: finalDownloadLink,
      stream_link: finalStreamLink,
      codec: codec || "H264",
      audio: audio || "VF",
    };

    // Ne pas écraser les métadonnées existantes avec des valeurs absentes.
    if (title) movieData.title = title;
    if (poster_path) movieData.poster_path = poster_path;
    if (backdrop_path) movieData.backdrop_path = backdrop_path;
    if (vote_average != null) movieData.vote_average = vote_average;
    if (release_date) movieData.release_date = release_date;
    if (finalReleaseYear != null) movieData.release_year = finalReleaseYear;
    if (cleanImdbId) movieData.imdb_id = cleanImdbId;

    const { error: saveError } = await supabase
      .from("downloads")
      .upsert(movieData, { onConflict: "id" });

    if (saveError) {
      console.error("Erreur enregistrement du film :", saveError);

      return NextResponse.json(
        { error: saveError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: finalId,
      link: finalDownloadLink,
      stream_link: finalStreamLink,
    });
  } catch (err: unknown) {
    console.error("Erreur API downloads :", err);

    return NextResponse.json(
      { error: "Erreur interne lors de l'enregistrement du film." },
      { status: 500 }
    );
  }
}
