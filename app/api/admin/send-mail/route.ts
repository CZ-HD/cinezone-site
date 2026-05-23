import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { to, subject, message } = body;

    // Vérification admin
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Non connecté" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }

    // Envoi mail
    const data = await resend.emails.send({
      from: "CineZone HD <noreply@cinezone-hd.fr>",
      to,
      subject,
      html: `
        <div style="font-family:sans-serif">
          <h2>🎬 CineZone HD</h2>

          <p>${message}</p>

          <hr />

          <small>
            Message envoyé depuis le panneau admin CineZone HD
          </small>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur inconnue",
    });
  }
}
