
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

const FILM_ID = 9737;
const EXPECTED_FILE_CODE = "udfaignd1kg2xzk48218";

export async function POST(request: Request) {
  try {
    // 1. Vérifier la session administrateur
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Connexion administrateur requise." },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice(7).trim();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Jeton manquant." },
        { status: 401 }
      );
    }

    // 2. Configuration Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    const upboltKey = process.env.UPBOLT_API_KEY;

    if (!supabaseUrl || !supabaseKey || !upboltKey) {
      return NextResponse.json(
        { success: false, error: "Configuration API ou Supabase manquante." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    // 3. Vérifier l'utilisateur
    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    const user = userData?.user;

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Session Supabase invalide." },
        { status: 401 }
      );
    }

    // 4. Vérifier les droits administrateur
    const userEmail = user.email?.toLowerCase();

    let isAdmin =
      !!userEmail && CREATOR_EMAILS.includes(userEmail);

    if (!isAdmin) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { success: false, error: "Vérification du profil impossible." },
          { status: 500 }
        );
      }

      isAdmin =
        profile?.role === "admin" &&
        profile?.status === "approved";
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Accès administrateur refusé." },
        { status: 403 }
      );
    }

    // 5. Vérifier le film dans Supabase (lecture uniquement)
    const { data: film, error: filmError } = await supabase
      .from("downloads")
      .select("id,title,link,stream_link")
      .eq("id", FILM_ID)
      .maybeSingle();

    if (filmError || !film) {
      return NextResponse.json(
        { success: false, error: "Film de test introuvable." },
        { status: 404 }
      );
    }

    const sourceUrl = new URL(film.link);
    const fileCode = sourceUrl.searchParams.keys().next().value;

    if (
      sourceUrl.hostname !== "1fichier.com" &&
      sourceUrl.hostname !== "www.1fichier.com"
    ) {
      return NextResponse.json(
        { success: false, error: "Lien source incorrect." },
        { status: 400 }
      );
    }

    if (fileCode !== EXPECTED_FILE_CODE) {
      return NextResponse.json(
        { success: false, error: "Le fichier ne correspond pas au test." },
        { status: 409 }
      );
    }

    // 6. Consulter les imports URL existants chez UpBolt.
    // IMPORTANT : cette route ne lance aucun nouvel import.
    const statusUrl = new URL(
      "https://upbolt.to/api/file/url_uploads"
    );

    statusUrl.searchParams.set("key", upboltKey);

    const response = await fetch(statusUrl.toString(), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    const responseText = await response.text();

    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Réponse UpBolt invalide.",
          databaseModified: false,
          newUploadStarted: false,
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Impossible de consulter les imports UpBolt.",
          httpStatus: response.status,
          databaseModified: false,
          newUploadStarted: false,
        },
        { status: 502 }
      );
    }

    // 7. Rechercher uniquement l'import correspondant au fichier testé.
    const uploads = Array.isArray(data.result)
      ? data.result
      : Array.isArray(data.result?.uploads)
        ? data.result.uploads
        : [];

    const matchingUploads = uploads
      .filter((item: any) => {
        const remoteUrl = String(item.remote_url || "");
        const code = String(item.file_code || "");

        return (
          remoteUrl.includes(EXPECTED_FILE_CODE) ||
          code === EXPECTED_FILE_CODE
        );
      })
      .map((item: any) => ({
        status: item.status ?? null,
        progress: item.progress ?? null,
        fileCode: item.file_code ?? null,
      }));

    return NextResponse.json(
      {
        success: true,
        message: "Consultation des imports UpBolt terminée.",
        film: {
          id: film.id,
          title: film.title,
        },
        upbolt: {
          matchingImports: matchingUploads,
          matchingCount: matchingUploads.length,
          apiStatus: data.status ?? null,
          apiMessage: data.msg ?? data.message ?? null,
        },
        streamLinkEmpty: !film.stream_link,
        databaseModified: false,
        newUploadStarted: false,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("DIAGNOSTIC UPBOLT :", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur pendant le diagnostic UpBolt.",
        databaseModified: false,
        newUploadStarted: false,
      },
      { status: 500 }
    );
  }
}
