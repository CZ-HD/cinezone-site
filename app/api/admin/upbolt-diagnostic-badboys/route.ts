
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const fichierKey = process.env.FICHIER_API_KEY;

    if (!supabaseUrl || !publishableKey || !serviceKey || !fichierKey) {
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

    // 2. Vérifier l'utilisateur
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

    // 3. Lire uniquement Bad Boys
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

    if (film.stream_link?.trim()) {
      return NextResponse.json(
        { success: false, error: "Un streaming existe déjà. Diagnostic arrêté." },
        { status: 409 }
      );
    }

    const sourceUrl = new URL(film.link);

    if (
      !["1fichier.com", "www.1fichier.com"].includes(sourceUrl.hostname)
    ) {
      return NextResponse.json(
        { success: false, error: "Domaine 1fichier incorrect." },
        { status: 400 }
      );
    }

    const fileCode = sourceUrl.searchParams.keys().next().value;

    if (fileCode !== EXPECTED_FILE_CODE) {
      return NextResponse.json(
        { success: false, error: "Le code du fichier ne correspond pas." },
        { status: 409 }
      );
    }

    const cleanSourceUrl = `https://1fichier.com/?${fileCode}`;

    // 4. Vérifier les informations du fichier chez 1fichier
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

    const infoText = await infoResponse.text();
    let infoData: any;

    try {
      infoData = JSON.parse(infoText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Réponse file/info 1fichier invalide." },
        { status: 502 }
      );
    }

    const infoOK =
      infoResponse.ok &&
      infoData.status !== "KO";

    // 5. Demander une URL temporaire
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

    const tokenText = await tokenResponse.text();
    let tokenData: any;

    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Réponse get_token 1fichier invalide." },
        { status: 502 }
      );
    }

    const temporaryUrl =
      typeof tokenData.url === "string" ? tokenData.url : "";

    const tokenOK =
      tokenResponse.ok &&
      tokenData.status === "OK" &&
      temporaryUrl.startsWith("https://");

    if (!tokenOK) {
      return NextResponse.json(
        {
          success: true,
          film: { id: film.id, title: film.title },
          fichier: {
            infoHTTP: infoResponse.status,
            infoStatus: infoData.status ?? null,
            infoMessage: infoData.message ?? null,
            tokenHTTP: tokenResponse.status,
            tokenStatus: tokenData.status ?? null,
            tokenMessage: tokenData.message ?? null,
            temporaryUrlObtained: false,
          },
          databaseModified: false,
          upboltContacted: false,
        },
        { status: 200 }
      );
    }

    // 6. Vérifier uniquement les en-têtes avec HEAD.
    // Ne pas télécharger le contenu vidéo.
    let headResult: any = {
      attempted: true,
      httpStatus: null,
      contentType: null,
      contentLength: null,
      acceptRanges: null,
      error: null,
    };

    try {
      const headResponse = await fetch(temporaryUrl, {
        method: "HEAD",
        redirect: "follow",
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });

      headResult = {
        attempted: true,
        httpStatus: headResponse.status,
        contentType: headResponse.headers.get("content-type"),
        contentLength: headResponse.headers.get("content-length"),
        acceptRanges: headResponse.headers.get("accept-ranges"),
        finalHost: (() => {
          try {
            return new URL(headResponse.url).hostname;
          } catch {
            return null;
          }
        })(),
        error: null,
      };

      headResponse.body?.cancel().catch(() => {});
    } catch (error) {
      headResult.error =
        error instanceof Error ? error.message : "Erreur réseau";
    }

    // 7. Résultat : aucune écriture, aucun transfert
    return NextResponse.json(
      {
        success: true,
        film: {
          id: film.id,
          title: film.title,
          sourceFileCode: EXPECTED_FILE_CODE,
        },
        fichier: {
          infoHTTP: infoResponse.status,
          infoStatus: infoData.status ?? null,
          filename: infoData.filename ?? infoData.name ?? null,
          size: infoData.size ?? infoData.filesize ?? null,
          tokenHTTP: tokenResponse.status,
          tokenStatus: tokenData.status ?? null,
          temporaryUrlObtained: true,
          temporaryUrlHost: (() => {
            try {
              return new URL(temporaryUrl).hostname;
            } catch {
              return null;
            }
          })(),
          head: headResult,
        },
        databaseModified: false,
        upboltContacted: false,
        warning:
          "Le contrôle HEAD vérifie les en-têtes HTTP, pas le téléchargement complet. Selon le serveur, cette méthode peut être refusée ou limitée.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("DIAGNOSTIC BAD BOYS :", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur pendant le diagnostic Bad Boys.",
        databaseModified: false,
        upboltContacted: false,
      },
      { status: 500 }
    );
  }
}
