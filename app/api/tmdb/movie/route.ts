import { NextResponse } from "next/server";

const TMDB_API_KEY = "783698341437f0c7827887dbd9a2b426";

function extractMovieId(value: string) {
  const match = value.match(/movie\/(\d+)/);

  if (match?.[1]) {
    return match[1];
  }

  if (/^\d+$/.test(value.trim())) {
    return value.trim();
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const input = searchParams.get("id");

    if (!input) {
      return NextResponse.json(
        { error: "ID manquant" },
        { status: 400 }
      );
    }

    const movieId = extractMovieId(input);

    if (!movieId) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=fr-FR`,
      {
        next: {
          revalidate: 86400,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Film introuvable" },
        { status: 404 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      id: data.id,
      title: data.title,
      poster: data.poster_path
        ? `https://image.tmdb.org/t/p/w300${data.poster_path}`
        : null,
      backdrop: data.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${data.backdrop_path}`
        : null,
      year: data.release_date?.split("-")[0] || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur TMDB" },
      { status: 500 }
    );
  }
}
