
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

const EXPECTED_FILE_CODE = "vb11zvss1e5m";
const EXPECTED_SOURCE_CODE = "udfaignd1kg2xzk48218";

export async function POST(request: Request) {
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

    // 2. Configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const upboltKey = process.env.UPBOLT_API_KEY;

    if (!supabaseUrl || !publishableKey || !serviceKey || !upboltKey) {
      return NextResponse.json(
        { success: false, error: "Configuration serveur incomplète." },
        { status: 500 }
      );
    }

    // 3. Authentification
    const authClient = createClient(supabaseUrl, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

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

    // 4. Vérifier la présence de Bad Boys dans Supabase
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: film, error: filmError } = await adminClient
      .from("downloads")
      .select("id,title,link,stream_link")
      .eq("id", 9737)
      .maybeSingle();

    if (filmError || !film) {
      return NextResponse.json(
        { success: false, error: "Bad Boys introuvable." },
        { status: 404 }
      );
    }

    if (film.stream_link?.trim()) {
      return NextResponse.json(
        { success: false, error: "Un streaming existe déjà. Diagnostic arrêté." },
        { status: 409 }
      );
    }

    const sourceUrl = new URL(film.link);
    const sourceCode = sourceUrl.searchParams.keys().next().value;

    if (sourceCode !== EXPECTED_SOURCE_CODE) {
      return NextResponse.json(
        { success: false, error: "Le lien source ne correspond pas à Bad Boys." },
        { status: 409 }
      );
    }

    // 5. Lire les imports URL chez UpBolt
    const uploadsUrl = new URL(
      "https://upbolt.to/api/file/url_uploads"
    );
    uploadsUrl.searchParams.set("key", upboltKey);

    const uploadsResponse = await fetch(uploadsUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    const uploadsText = await uploadsResponse.text();

    let uploadsData: any;

    try {
      uploadsData = JSON.parse(uploadsText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Réponse de la liste UpBolt invalide." },
        { status: 502 }
      );
    }

    if (!uploadsResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Lecture des imports UpBolt impossible." },
        { status: 502 }
      );
    }

    const uploads = Array.isArray(uploadsData.result)
      ? uploadsData.result
      : Array.isArray(uploadsData.result?.uploads)
        ? uploadsData.result.uploads
        : [];

    const matchingImport = uploads.find((item: any) =>
      String(item.file_code || "") === EXPECTED_FILE_CODE ||
      String(item.remote_url || "").includes("q2230344162")
    );

    if (!matchingImport) {
      return NextResponse.json(
        {
          success: true,
          found: false,
          message: "Import correspondant introuvable dans la liste UpBolt.",
          expectedFileCode: EXPECTED_FILE_CODE,
          databaseModified: false,
          newUploadStarted: false,
        },
        { status: 200 }
      );
    }

    // 6. Préparer les informations de l'import
    const importDetails = {
      status: matchingImport.status ?? null,
      progress: matchingImport.progress ?? null,
      file_code: matchingImport.file_code ?? null,
      fld_id: matchingImport.fld_id ?? null,
      remote_url: matchingImport.remote_url ?? null,
      error: matchingImport.error ?? null,
      message: matchingImport.message ?? null,
      msg: matchingImport.msg ?? null,
      reason: matchingImport.reason ?? null,
      created: matchingImport.created ?? null,
    };

    // 7. Vérifier les informations du fichier UpBolt
    let fileInfo: any = null;
    let fileInfoHTTP: number | null = null;
    let fileInfoError: string | null = null;

    const infoUrl = new URL("https://upbolt.to/api/file/info");
    infoUrl.searchParams.set("key", upboltKey);
    infoUrl.searchParams.set("file_code", EXPECTED_FILE_CODE);

    try {
      const infoResponse = await fetch(infoUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      fileInfoHTTP = infoResponse.status;

      const infoText = await infoResponse.text();

      try {
        fileInfo = JSON.parse(infoText);
      } catch {
        fileInfoError = "Réponse JSON invalide.";
      }
    } catch (error) {
      fileInfoError =
        error instanceof Error ? error.message : "Erreur réseau.";
    }

    // 8. Résultat en lecture seule
    return NextResponse.json(
      {
        success: true,
        found: true,
        film: {
          id: film.id,
          title: film.title,
        },
        upboltImport: importDetails,
        upboltFileInfo: {
          httpStatus: fileInfoHTTP,
          data: fileInfo,
          error: fileInfoError,
        },
        databaseModified: false,
        newUploadStarted: false,
        actionsPerformed: [
          "Lecture de la liste des imports UpBolt",
          "Recherche du nouvel import Bad Boys",
          "Lecture des informations du fichier UpBolt",
        ],
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("DIAGNOSTIC IMPORT UPBOLT :", error);

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
