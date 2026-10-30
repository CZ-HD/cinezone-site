
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

    // 2. Confirmation obligatoire
    let body: { confirmUpload?: boolean };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Confirmation JSON invalide." },
        { status: 400 }
      );
    }

    if (body.confirmUpload !== true) {
      return NextResponse.json(
        {
          success: false,
          error: "Confirmation de l'import manquante.",
          uploadStarted: false,
          databaseModified: false,
        },
        { status: 400 }
      );
    }

    // 3. Configuration Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Configuration Supabase manquante." },
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

    // 4. Vérifier l'utilisateur
    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    const user = userData?.user;

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Session Supabase invalide." },
        { status: 401 }
      );
    }

    // 5. Vérifier les droits administrateur
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

    // 6. Vérifier les clés API
    const fichierKey = process.env.FICHIER_API_KEY;
    const upboltKey = process.env.UPBOLT_API_KEY;

    if (!fichierKey || !upboltKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Une clé API est absente de Vercel.",
          diagnostic: {
            fichierKeyPresent: !!fichierKey,
            upboltKeyPresent: !!upboltKey,
          },
        },
        { status: 500 }
      );
    }

    // 7. Lire uniquement le film 9737
    const { data: film, error: filmError } = await supabase
      .from("downloads")
      .select("id,title,link,stream_link")
      .eq("id", FILM_ID)
      .maybeSingle();

    if (filmError) {
      return NextResponse.json(
        { success: false, error: "Lecture Supabase impossible." },
        { status: 500 }
      );
    }

    if (!film) {
      return NextResponse.json(
        { success: false, error: "Film 9737 introuvable." },
        { status: 404 }
      );
    }

    // 8. Ne jamais écraser un streaming existant
    if (
      typeof film.stream_link === "string" &&
      film.stream_link.trim() !== ""
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Un lien streaming existe déjà. Import annulé.",
        },
        { status: 409 }
      );
    }

    // 9. Vérifier le lien 1fichier
    let sourceUrl: URL;

    try {
      sourceUrl = new URL(film.link);
    } catch {
      return NextResponse.json(
        { success: false, error: "Lien 1fichier invalide." },
        { status: 400 }
      );
    }

    if (
      sourceUrl.hostname !== "1fichier.com" &&
      sourceUrl.hostname !== "www.1fichier.com"
    ) {
      return NextResponse.json(
        { success: false, error: "Domaine source incorrect." },
        { status: 400 }
      );
    }

    const fileCode = sourceUrl.searchParams.keys().next().value;

    if (fileCode !== EXPECTED_FILE_CODE) {
      return NextResponse.json(
        { success: false, error: "Le fichier ne correspond pas au test." },
        { status: 409 }
      );
    }

    const cleanSourceUrl = `https://1fichier.com/?${fileCode}`;

    // 10. Vérifier les informations 1fichier
    const fichierResponse = await fetch(
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

    const fichierText = await fichierResponse.text();

    let fichierData: any;

    try {
      fichierData = JSON.parse(fichierText);
    } catch {
      return NextResponse.json(
        { success: false, error: "Réponse 1fichier invalide." },
        { status: 502 }
      );
    }

    if (!fichierResponse.ok || fichierData.status === "KO") {
      return NextResponse.json(
        {
          success: false,
          error: "Vérification 1fichier refusée.",
          details: fichierData.message || "Erreur inconnue.",
        },
        { status: 502 }
      );
    }

    // 11. Obtenir le lien temporaire
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
        { success: false, error: "Réponse du téléchargement invalide." },
        { status: 502 }
      );
    }

    if (
      !tokenResponse.ok ||
      tokenData.status !== "OK" ||
      typeof tokenData.url !== "string" ||
      !tokenData.url.startsWith("https://")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Impossible d'obtenir le lien temporaire 1fichier.",
          details: tokenData.message || "Erreur inconnue.",
        },
        { status: 502 }
      );
    }

    // 12. Envoyer le fichier vers UpBolt
    const upboltUrl = new URL(
      "https://upbolt.to/api/upload/url"
    );

    upboltUrl.searchParams.set("key", upboltKey);
    upboltUrl.searchParams.set("url", tokenData.url);

    let uploadResponse: Response;

    try {
      uploadResponse = await fetch(upboltUrl.toString(), {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      });
    } catch (error) {
      console.error("ERREUR CONNEXION UPBOLT :", error);

      return NextResponse.json(
        {
          success: false,
          error: "Impossible de contacter UpBolt.",
          uploadStarted: false,
          databaseModified: false,
        },
        { status: 502 }
      );
    }

    // 13. Lire la réponse UpBolt
    const uploadText = await uploadResponse.text();

    let uploadData: any;

    try {
      uploadData = JSON.parse(uploadText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Réponse UpBolt invalide.",
          uploadStarted: false,
          databaseModified: false,
        },
        { status: 502 }
      );
    }

    if (!uploadResponse.ok || !uploadData.filecode) {
      console.error("ERREUR IMPORT UPBOLT :", {
        status: uploadResponse.status,
        message: uploadData.message,
      });

      return NextResponse.json(
        {
          success: false,
          error: "UpBolt n'a pas confirmé la création de l'import.",
          details: uploadData.message || "Erreur inconnue.",
          uploadStarted: false,
          databaseModified: false,
        },
        { status: 502 }
      );
    }

    // 14. Résultat
    return NextResponse.json(
      {
        success: true,
        message: "Import distant accepté par UpBolt.",
        film: {
          id: film.id,
          title: film.title,
          filename: fichierData.filename || fichierData.name || null,
          size: fichierData.size || fichierData.filesize || null,
        },
        upbolt: {
          fileCode: uploadData.filecode,
          importAccepted: true,
        },
        streamLinkEmpty: true,
        uploadStarted: true,
        databaseModified: false,
        nextStep:
          "Vérifier l'état de l'import UpBolt avant toute autre opération.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );

  } catch (error) {
    console.error("ERREUR IMPORT UPBOLT :", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne pendant le test d'import.",
        databaseModified: false,
      },
      { status: 500 }
    );
  }
}
