
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

function get1fichierCode(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (
      host !== "1fichier.com" &&
      host !== "www.1fichier.com"
    ) {
      return null;
    }

    for (const key of url.searchParams.keys()) {
      if (key !== "af") return key;
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    // 1. Vérification de la session
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Connexion administrateur requise." },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice(7).trim();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !publishableKey || !secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration Supabase incomplète.",
        },
        { status: 500 }
      );
    }

    const authClient = createClient(
      supabaseUrl,
      publishableKey,
      { auth: { persistSession: false } }
    );

    const { data: userData, error: authError } =
      await authClient.auth.getUser(accessToken);

    const user = userData?.user;

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Session invalide." },
        { status: 401 }
      );
    }

    // 2. Vérification administrateur
    let isAdmin = CREATOR_EMAILS.includes(
      (user.email || "").toLowerCase()
    );

    if (!isAdmin) {
      const { data: profile, error } = await authClient
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { success: false, error: "Vérification administrateur impossible." },
          { status: 500 }
        );
      }

      isAdmin =
        profile?.role === "admin" &&
        profile?.status === "approved";
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Accès refusé." },
        { status: 403 }
      );
    }

    // 3. Client serveur sécurisé : lecture uniquement
    const adminClient = createClient(
      supabaseUrl,
      secretKey,
      { auth: { persistSession: false } }
    );

    let allMovies: Array<{
      id: number;
      title: string | null;
      link: string | null;
      stream_link: string | null;
    }> = [];

    const pageSize = 1000;
    let from = 0;

    while (true) {
      const { data, error } = await adminClient
        .from("downloads")
        .select("id,title,link,stream_link")
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Migration preview:", error);

        return NextResponse.json(
          {
            success: false,
            error: "Impossible de lire la table downloads.",
          },
          { status: 500 }
        );
      }

      allMovies = allMovies.concat(data || []);

      if (!data || data.length < pageSize) break;

      from += pageSize;
    }

    // 4. Classement des films, sans aucune modification
    const alreadyStreaming = allMovies.filter(
      (movie) => movie.stream_link?.trim()
    );

    const withoutStream = allMovies.filter(
      (movie) => !movie.stream_link?.trim()
    );

    const withoutDownloadLink = withoutStream.filter(
      (movie) => !movie.link?.trim()
    );

    const withDownloadLink = withoutStream.filter(
      (movie) => !!movie.link?.trim()
    );

    const candidates = withDownloadLink.filter(
      (movie) => get1fichierCode(movie.link!) !== null
    );

    const otherHosts = withDownloadLink.filter(
      (movie) => get1fichierCode(movie.link!) === null
    );

    // 5. Détection des fichiers déjà présents plusieurs fois
    const groups = new Map<string, typeof candidates>();

    for (const movie of candidates) {
      const code = get1fichierCode(movie.link!)!;

      const group = groups.get(code) || [];
      group.push(movie);
      groups.set(code, group);
    }

    const duplicateGroups = Array.from(groups.entries())
      .filter(([, movies]) => movies.length > 1)
      .map(([fileCode, movies]) => ({
        fileCode,
        count: movies.length,
        movies: movies.map((movie) => ({
          id: movie.id,
          title: movie.title,
        })),
      }));

    const uniqueFiles = groups.size;

    return NextResponse.json(
      {
        success: true,
        message: "Analyse terminée. Aucune donnée modifiée.",

        statistics: {
          totalMovies: allMovies.length,
          alreadyStreaming: alreadyStreaming.length,
          withoutStream: withoutStream.length,
          withoutDownloadLink: withoutDownloadLink.length,
          otherHosts: otherHosts.length,
          eligibleMovies: candidates.length,
          uniqueFiles,
          duplicateGroups: duplicateGroups.length,
          duplicateExtraRows: candidates.length - uniqueFiles,
        },

        duplicateGroups,

        sample: candidates.slice(0, 10).map((movie) => ({
          id: movie.id,
          title: movie.title,
          fileCode: get1fichierCode(movie.link!),
        })),

        databaseModified: false,
        uploadsStarted: false,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("UPBOLT MIGRATION PREVIEW:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur pendant la préparation de la migration.",
        databaseModified: false,
        uploadsStarted: false,
      },
      { status: 500 }
    );
  }
}
