
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
        { success: false, error: "Jeton de connexion manquant." },
        { status: 401 }
      );
    }

    // 2. Vérifier la configuration Supabase
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

    // 5. Vérifier les clés API sans les afficher
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

    // 6. Lire uniquement le film 9737
    const { data: film, error: filmError } = await supabase
      .from("downloads")
      .select("id,title,link,stream_link")
      .eq("id", FILM_ID)
      .maybeSingle();

    if (filmError) {
      return NextResponse.json(
        {
          success: false,
          error: "Lecture du film impossible.",
          details: filmError.message,
        },
        { status: 500 }
      );
    }

    if (!film) {
      return NextResponse.json(
        { success: false, error: "Film 9737 introuvable." },
        { status: 404 }
      );
    }

    // 7. Ne jamais écraser un streaming existant
    if (
      typeof film.stream_link === "string" &&
      film.stream_link.trim() !== ""
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Un lien streaming existe déjà. Opération arrêtée.",
          film: {
            id: film.id,
            title: film.title,
            hasStreamLink: true,
          },
        },
        { status: 409 }
      );
    }

    // 8. Vérifier le lien 1fichier enregistré
    let fileCode = "";

    try {
      const sourceUrl = new URL(film.link);

      if (sourceUrl.hostname !== "1fichier.com" &&
          sourceUrl.hostname !== "www.1fichier.com") {
        throw new Error("Domaine incorrect");
      }

      fileCode = sourceUrl.search.slice(1).split("&")[0];
    } catch {
      return NextResponse.json(
        { success: false, error: "Lien 1fichier invalide dans Supabase." },
        { status: 400 }
      );
    }

    if (fileCode !== EXPECTED_FILE_CODE) {
      return NextResponse.json(
        {
          success: false,
          error: "Le lien enregistré ne correspond pas au lien fourni.",
          expectedFileCode: EXPECTED_FILE_CODE,
          databaseFileCode: fileCode,
        },
        { status: 409 }
      );
    }

    // 9. Préparation uniquement : aucun transfert et aucune écriture
    return NextResponse.json(
      {
        success: true,
        message: "Vérification préalable réussie. Aucun transfert lancé.",
        film: {
          id: film.id,
          title: film.title,
          source: "1fichier",
          fileCode,
          streamLinkEmpty: true,
        },
        apiKeys: {
          fichier: "Présente",
          upbolt: "Présente",
        },
        nextStep: "Vérifier la méthode officielle de récupération du lien direct 1fichier avant l'import UpBolt.",
        databaseModified: false,
        uploadStarted: false,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("ERREUR UPBOLT IMPORT TEST :", error);

    return NextResponse.json(
      { success: false, error: "Erreur interne pendant la vérification." },
      { status: 500 }
    );
  }
}

