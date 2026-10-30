
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

// Récupération des détails d'une erreur réseau
function getErrorDetails(error: unknown) {
  const details: Record<string, string | number> = {};

  let current: unknown = error;
  let level = 0;

  while (current && level < 4) {
    if (typeof current !== "object") break;

    const item = current as Record<string, unknown>;

    if (typeof item.name === "string") {
      details[`level${level}_name`] = item.name;
    }

    if (typeof item.message === "string") {
      details[`level${level}_message`] = item.message;
    }

    if (typeof item.code === "string") {
      details[`level${level}_code`] = item.code;
    }

    if (typeof item.syscall === "string") {
      details[`level${level}_syscall`] = item.syscall;
    }

    if (typeof item.hostname === "string") {
      details[`level${level}_hostname`] = item.hostname;
    }

    if (typeof item.port === "number") {
      details[`level${level}_port`] = item.port;
    }

    current = item.cause;
    level++;
  }

  return details;
}

export async function POST(request: Request) {
  try {
    // 1. Vérifier la session administrateur

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Connexion administrateur requise.",
        },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice(7).trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Jeton de connexion manquant.",
        },
        { status: 401 }
      );
    }

    // 2. Vérifier la configuration Supabase

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration Supabase manquante.",
          diagnostic: {
            urlPresent: !!supabaseUrl,
            publishableKeyPresent: !!supabaseKey,
          },
        },
        { status: 500 }
      );
    }

    // 3. Vérifier la validité de l'adresse Supabase

    try {
      new URL(supabaseUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Adresse Supabase incorrecte.",
        },
        { status: 500 }
      );
    }

    // 4. Créer le client Supabase

    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            "X-Client-Info": "cinezone-upbolt-test",
          },
        },
      }
    );

    // 5. Vérifier le compte utilisateur auprès de Supabase

    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    const user = userData?.user;

    if (authError || !user) {
      const diagnostic = getErrorDetails(authError);

      console.error("DIAGNOSTIC AUTHENTIFICATION SUPABASE :", {
        message: authError?.message,
        diagnostic,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Impossible de vérifier la session Supabase.",
          details: authError?.message || "Utilisateur introuvable.",
          diagnostic,
        },
        { status: 502 }
      );
    }

    // 6. Vérifier les droits administrateur

    const userEmail = user.email?.toLowerCase();

    let isAdmin =
      !!userEmail &&
      CREATOR_EMAILS.includes(userEmail);

    if (!isAdmin) {
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role,status")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "ERREUR VÉRIFICATION PROFIL :",
          profileError.message
        );

        return NextResponse.json(
          {
            success: false,
            error: "Impossible de vérifier les droits administrateur.",
          },
          { status: 500 }
        );
      }

      isAdmin =
        profile?.role === "admin" &&
        profile?.status === "approved";
    }

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Accès administrateur refusé.",
        },
        { status: 403 }
      );
    }

    // 7. Vérifier la présence de la clé API UpBolt

    const apiKey = process.env.UPBOLT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "UPBOLT_API_KEY absente de Vercel.",
        },
        { status: 500 }
      );
    }

    // 8. Interroger UpBolt en lecture seule

    const upboltUrl = new URL(
      "https://upbolt.to/api/account/info"
    );

    upboltUrl.searchParams.set("key", apiKey);

    let upboltResponse: Response;

    try {
      upboltResponse = await fetch(upboltUrl.toString(), {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      const diagnostic = getErrorDetails(error);

      console.error("ERREUR CONNEXION UPBOLT :", diagnostic);

      return NextResponse.json(
        {
          success: false,
          error: "Impossible de contacter UpBolt.",
          diagnostic,
        },
        { status: 502 }
      );
    }

    // 9. Lire la réponse UpBolt

    const responseText = await upboltResponse.text();

    let account: unknown;

    try {
      account = JSON.parse(responseText);
    } catch {
      account = {
        message: responseText.slice(0, 1000),
      };
    }

    // 10. Retourner le résultat

    return NextResponse.json(
      {
        success: upboltResponse.ok,
        httpStatus: upboltResponse.status,
        message: upboltResponse.ok
          ? "Connexion UpBolt réussie."
          : "UpBolt a répondu avec une erreur.",
        account,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

  } catch (error) {
    const diagnostic = getErrorDetails(error);

    console.error("ERREUR GÉNÉRALE TEST UPBOLT :", diagnostic);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne pendant le test.",
        diagnostic,
      },
      { status: 500 }
    );
  }
}
