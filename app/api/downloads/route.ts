import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const {
      id,
      link,
      title,
      poster_path,
      backdrop_path,
      vote_average,
      release_date,
      release_year,
    } = await req.json();

    if (!id || !link) {
      return NextResponse.json(
        { error: "ID ou lien manquant" },
        { status: 400 }
      );
    }

    const finalReleaseYear =
      release_year ||
      (release_date ? Number(String(release_date).substring(0, 4)) : null);

    const { error } = await supabase.from("downloads").upsert(
      {
        id: Number(id),
        link,
        title,
        poster_path,
        backdrop_path,
        vote_average,
        release_date,
        release_year: finalReleaseYear,
      },
      { onConflict: "id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
