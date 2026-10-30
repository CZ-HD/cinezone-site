
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
    // 1. Authentification
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Connexion administrateur requise." },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice(7).trim();

    // 2. Configuration Supabase
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

    // 3. Vérification utilisateur
    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    const user = userData?.user;

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Session Supabase invalide." },
        { status: 401 }
      );
    }

    // 4. Vérification administrateur
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

    // 5. Vérification de la clé 1fichier
    const fichierKey = process.env.FICHIER_API_KEY;

    if (!fichierKey) {
      return NextResponse.json(
        { success: false, error: "FICHIER_API_KEY absente de Vercel." },
        { status: 500 }
      );
    }

    // 6. Lecture du seul film 9737
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

    // 7. Protection contre l'écrasement d'un streaming
    if (
      typeof film.stream_link === "string" &&
      film.stream_link.trim() !== ""
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Un lien streaming existe déjà. Opération arrêtée.",
        },
        { status: 409 }
      );
    }

    // 8. Vérifier le lien source
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
        { success: false, error: "Le domaine source n'est pas 1fichier." },
        { status: 400 }
      );
    }

    const fileCode = sourceUrl.searchParams.keys().next().value;

    if (fileCode !== EXPECTED_FILE_CODE) {
      return NextResponse.json(
        { success: false, error: "Le lien ne correspond pas au film de test." },
        { status: 409 }
      );
    }

    // Retirer les paramètres d'affiliation
    const cleanSourceUrl = `https://1fichier.com/?${fileCode}`;

    // 9. Interroger l'API officielle 1fichier
    let fichierResponse: Response;

    try {
      fichierResponse = await fetch(
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
    } catch (error) {
      console.error("ERREUR CONNEXION 1FICHIER :", error);

      return NextResponse.json(
        { success: false, error: "Impossible de contacter l'API 1fichier." },
        { status: 502 }
      );
    }

    // 10. Lire la réponse
    const responseText = await fichierResponse.text();

    let fichierData: any;

    try {
      fichierData = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Réponse 1fichier non valide.",
          httpStatus: fichierResponse.status,
        },
        { status: 502 }
      );
    }

    if (!fichierResponse.ok || fichierData.status === "KO") {
      return NextResponse.json(
        {
          success: false,
          error: "1fichier a refusé la vérification.",
          httpStatus: fichierResponse.status,
          details: fichierData.message || "Erreur API 1fichier.",
        },
        { status: 502 }
      );
    }

    
    // 11. Demander un lien temporaire à 1fichier
    let tokenResponse: Response;

    try {
      tokenResponse = await fetch(
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
    } catch (error) {
      console.error("ERREUR TOKEN 1FICHIER :", error);

      return NextResponse.json(
        {
          success: false,
          error: "Impossible de demander le lien temporaire à 1fichier.",
        },
        { status: 502 }
      );
    }

    // 12. Lire la réponse du service
    const tokenText = await tokenResponse.text();

    let tokenData: any;

    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Réponse du service de téléchargement invalide.",
          httpStatus: tokenResponse.status,
        },
        { status: 502 }
      );
    }

    if (
      !tokenResponse.ok ||
      tokenData.status !== "OK" ||
      typeof tokenData.url !== "string" ||
      !tokenData.url.startsWith("https://")
    ) {
      console.error("ERREUR TOKEN 1FICHIER :", {
        httpStatus: tokenResponse.status,
        status: tokenData.status,
        message: tokenData.message,
      });

      return NextResponse.json(
        {
          success: false,
          error: "1fichier n'a pas fourni de lien temporaire valide.",
          httpStatus: tokenResponse.status,
          details: tokenData.message || "Erreur inconnue.",
        },
        { status: 502 }
      );
    }

    // 13. Résultat : ne jamais afficher le lien temporaire
    return NextResponse.json(
      {
        success: true,
        message: "Lien temporaire 1fichier obtenu.",
        film: {
          id: film.id,
          title: film.title,
          filename: fichierData.filename || fichierData.name || null,
          size: fichierData.size || fichierData.filesize || null,
        },
        fichier: {
          infoVerified: true,
          downloadTokenObtained: true,
        },
        streamLinkEmpty: true,
        databaseModified: false,
        uploadStarted: false,
        nextStep: "Vérifier le lien temporaire puis préparer son transfert vers UpBolt.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("ERREUR TEST 1FICHIER :", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne pendant le test.",
      },
      { status: 500 }
    );
  }
}
