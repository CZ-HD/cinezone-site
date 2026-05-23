import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",

      to: Array.isArray(body.to)
        ? body.to
        : [body.to],

      subject: body.subject,

      html: `
        <h1>CineZone HD</h1>
        <p>${body.message}</p>
      `,
    });

    return Response.json({
      success: true,
      data,
    });

  } catch (error: any) {

    return Response.json({
      success: false,
      error: error.message,
    });

  }
}
