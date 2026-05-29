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

    const { data, error } = await supabase
      .from("downloads")
      .select("link")
      .eq("id", movieId)
      .maybeSingle();

    if (error || !data?.link) {
      return NextResponse.json(
        { error: "Lien introuvable" },
        { status: 404 }
      );
    }

    // Comptage du clic téléchargement
    const { error: logError } = await supabase
      .from("download_logs")
      .insert({
        movie_id: movieId,
      });

    console.log("DOWNLOAD LOG:", logError);

    const finalLink = addAffiliate(data.link);

    return NextResponse.json({
      url: finalLink,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
