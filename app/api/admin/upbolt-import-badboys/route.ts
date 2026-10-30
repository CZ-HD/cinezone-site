
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
    // 1. Vérifier la session
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Connexion administrateur requise." },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice(7).trim();

    // 2. Configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const fichierKey = process.env.FICHIER_API_KEY;
    const upboltKey = process.env.UPBOLT_API_KEY;

    if (
      !supabaseUrl ||
      !publishableKey ||
      !serviceKey ||
      !fichierKey ||
      !upboltKey
    ) {
      return NextResponse.json(
        { success: false, error: "Configuration serveur incomplète." },
        { status: 500 }
      );
    }

    const authClient = createClient(supabaseUrl, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // 3. Authentification
    const { data: userData, error: authError } =
      await authClient.auth.getUser(accessToken);

    const user = userData?.user;

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Session invalide." },
        { status: 401 }
      );
    }

    let isAdmin =
      !!user.email &&
      CREATOR_EMAILS.includes(user.email.toLowerCase());

    if (!isAdmin) {
      const { data: profile } = await authClient
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .maybeSingle();

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

    // 4. Client serveur en lecture seule pour ce test
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: film, error: filmError } = await adminClient
      .from("downloads")
      .select("id,title,link,stream_link")
      .eq("id", FILM_ID)
      .maybeSingle();

    if (filmError || !film) {
      return NextResponse.json(
        { success: false, error: "Bad Boys introuvable." },
        { status: 404 }
      );
    }

    // 5. Vérifications strictes
    if (film.stream_link?.trim()) {
      return NextResponse.json(
        { success: false, error: "Un streaming existe déjà. Test annulé." },
        { status: 409 }
      );
    }

    const sourceUrl = new URL(film.link);

    if (
      !["1fichier.com", "www.1fichier.com"].includes(sourceUrl.hostname)
    ) {
      return NextResponse.json(
        { success: false, error: "Lien 1fichier incorrect." },
        { status: 400 }
      );
    }

    const fileCode = sourceUrl.searchParams.keys().next().value;

    if (fileCode !== EXPECTED_FILE_CODE) {
      return NextResponse.json(
        { success: false, error: "Code fichier incorrect." },
        { status: 409 }
      );
    }

    const cleanSourceUrl = `https://1fichier.com/?${fileCode}`;

    // 6. Vérifier les anciens imports UpBolt.
    // Ne jamais créer un doublon automatiquement.
    const statusUrl = new URL(
      "https://upbolt.to/api/file/url_uploads"
    );
    statusUrl.searchParams.set("key", upboltKey);

    const statusResponse = await fetch(statusUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    const statusText = await statusResponse.text();
    const statusData = JSON.parse(statusText);

    if (!statusResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Lecture des imports UpBolt impossible." },
        { status: 502 }
      );
    }

    const uploads = Array.isArray(statusData.result)
      ? statusData.result
      : Array.isArray(statusData.result?.uploads)
        ? statusData.result.uploads
        : [];

    const previousImport = uploads.find((item: any) =>
      String(item.remote_url || "").includes(EXPECTED_FILE_CODE)
    );

    if (previousImport) {
      return NextResponse.json(
        {
          success: false,
          error: "Un ancien import Bad Boys existe déjà chez UpBolt.",
          previousStatus: previousImport.status ?? null,
          previousProgress: previousImport.progress ?? null,
          action: "Aucun nouvel import lancé. Vérification manuelle nécessaire.",
          databaseModified: false,
          newUploadStarted: false,
        },
        { status: 409 }
      );
    }

    // 7. Vérifier le fichier chez 1fichier
    const infoResponse = await fetch(
      "https://api.1fichier.com/v1/file/info.cgi",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${fichierKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: cleanSourceUrl,
          pretty: 1,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );

    const infoData = await infoResponse.json();

    if (!infoResponse.ok || infoData.status === "KO") {
      return NextResponse.json(
        { success: false, error: "Vérification 1fichier refusée." },
        { status: 502 }
      );
    }

    // 8. Obtenir une URL temporaire 1fichier
    const tokenResponse = await fetch(
      "https://api.1fichier.com/v1/download/get_token.cgi",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${fichierKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: cleanSourceUrl,
          single: 1,
          pretty: 1,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );

    const tokenData = await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      tokenData.status !== "OK" ||
      typeof tokenData.url !== "string" ||
      !tokenData.url.startsWith("https://")
    ) {
      return NextResponse.json(
        { success: false, error: "Lien temporaire 1fichier indisponible." },
        { status: 502 }
      );
    }

    // 9. Envoyer uniquement Bad Boys à UpBolt
    const importUrl = new URL("https://upbolt.to/api/upload/url");
    importUrl.searchParams.set("key", upboltKey);
    importUrl.searchParams.set("url", tokenData.url);

    const importResponse = await fetch(importUrl, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });

    const importText = await importResponse.text();

    let importData: any;

    try {
      importData = JSON.parse(importText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Réponse UpBolt invalide." },
        { status: 502 }
      );
    }

    const upboltFileCode = importData.result?.filecode;

    if (
      !importResponse.ok ||
      importData.status !== 200 ||
      !upboltFileCode
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "UpBolt n'a pas confirmé l'import.",
          apiResponse: importData,
          databaseModified: false,
        },
        { status: 502 }
      );
    }

    // 10. Aucun changement dans Supabase
    return NextResponse.json(
      {
        success: true,
        message: "Import Bad Boys accepté par UpBolt.",
        film: {
          id: film.id,
          title: film.title,
        },
        upbolt: {
          fileCode: upboltFileCode,
          status: "accepted",
        },
        databaseModified: false,
        streamLinkModified: false,
        originalLinkPreserved: true,
        nextStep: "Contrôler la disponibilité réelle du fichier chez UpBolt.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("TEST IMPORT BAD BOYS :", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur pendant le test Bad Boys.",
        databaseModified: false,
      },
      { status: 500 }
    );
  }
}
