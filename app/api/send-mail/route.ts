import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = await resend.emails.send({
      from: "CineZone HD <noreply@cinezone-hd.fr>",
      to: body.to,
      subject: body.subject,
      html: body.html,
    });

    return Response.json({
      success: true,
      data,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
}
