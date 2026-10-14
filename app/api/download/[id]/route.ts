import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const addAffiliate = (url: string) => {
  const affiliate = "af=5257374";

  if (!url.includes("1fichier.com")) return url;
  if (url.includes("af=")) return url;

  return url.includes("?")
    ? `${url}&${affiliate}`
    : `${url}?${affiliate}`;
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = Number(params.id);

    if (!Number.isInteger(movieId) || movieId <= 0) {
      return NextResponse.json(
        { error: "Identifiant du film invalide" },
        { status: 400 }
      );
    }

    // Lire uniquement le lien de téléchargement.
    const { data, error } = await supabase
      .from("downloads")
      .select("id, link")
      .eq("id", movieId)
      .maybeSingle();

    // Diagnostic temporaire : vérifier la valeur réellement lue.
    console.log("VÉRIFICATION SUPABASE :", {
      movieId,
      linkLu: data?.link ?? null,
      erreur: error?.message ?? null,
    });

    if (error) {
      console.error("ERREUR SUPABASE DOWNLOAD :", error);

      return NextResponse.json(
        { error: "Erreur lors de la recherche du lien de téléchargement" },
        { status: 500 }
      );
    }

    if (!data?.link || typeof data.link !== "string") {
      console.error("LIEN DE TÉLÉCHARGEMENT ABSENT :", movieId);

      return NextResponse.json(
        { error: "Lien de téléchargement introuvable" },
        { status: 404 }
      );
    }

    const downloadUrl = data.link.trim();

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(downloadUrl);
    } catch {
      return NextResponse.json(
        { error: "Le lien de téléchargement est invalide" },
        { status: 500 }
      );
    }

    if (
      parsedUrl.protocol !== "https:" &&
      parsedUrl.protocol !== "http:"
    ) {
      return NextResponse.json(
        { error: "Protocole du lien de téléchargement non autorisé" },
        { status: 400 }
      );
    }

    // Ajouter l'affiliation uniquement aux liens 1fichier.
    const finalLink = addAffiliate(downloadUrl);

    // Enregistrer le clic sans bloquer le téléchargement si le journal échoue.
    const { error: logError } = await supabase
      .from("download_logs")
      .insert({ movie_id: movieId });

    if (logError) {
      console.error("ERREUR JOURNAL TÉLÉCHARGEMENT :", logError);
    }

    console.log("TÉLÉCHARGEMENT :", {
      movieId,
      linkFromDatabase: downloadUrl,
      finalLink,
    });

    return NextResponse.json(
      { url: finalLink },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err: unknown) {
    console.error("ERREUR API DOWNLOAD :", err);

    return NextResponse.json(
      { error: "Erreur interne lors du téléchargement" },
      { status: 500 }
    );
  }
}
