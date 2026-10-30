import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const CREATOR_EMAILS = [
  "blackph4tom@gmail.com",
  "lafooteusedu54@hotmail.fr",
];

export async function POST(request: Request) {
  try {
    // 1. Vérifier la session Supabase
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Connexion administrateur requise." },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice(7);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Configuration Supabase manquante." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    const user = userData?.user;

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Session invalide." },
        { status: 401 }
      );
    }

    // 2. Vérifier les droits administrateur
    let isAdmin = !!user.email &&
      CREATOR_EMAILS.includes(user.email);

    if (!isAdmin) {
      const { data: profile } = await supabase
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

    // 3. Vérifier la présence de la clé UpBolt
    const apiKey = process.env.UPBOLT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "UPBOLT_API_KEY absente de Vercel." },
        { status: 500 }
      );
    }

    // 4. Interroger UpBolt en lecture seule
    const url = new URL("https://upbolt.to/api/account/info");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    const responseText = await response.text();

    let result: unknown;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText.slice(0, 1000) };
    }

    return NextResponse.json({
      success: response.ok,
      httpStatus: response.status,
      message: response.ok
        ? "Réponse reçue depuis UpBolt."
        : "UpBolt a répondu avec une erreur.",
      account: result,
    });
  } catch (error) {
    console.error("Erreur test UpBolt :", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Erreur inconnue pendant le test.",
      },
      { status: 500 }
    );
  }
}
