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
          <div style="
            background:#0f172a;
            padding:20px;
            border-radius:12px;
            border:1px solid rgba(255,255,255,0.1);
          ">
            ${body.message.replace(/\n/g, "<br>")}
          </div>

          <p style="margin-top:20px; opacity:0.7;">
            © CineZone HD
          </p>

        </div>
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
