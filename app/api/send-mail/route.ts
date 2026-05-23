import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

    const data = await resend.emails.send({
      from: "CineZone HD <noreply@cinezone-hd.fr>",

      to: body.to
        .split(",")
        .map((mail) => mail.trim()),

      subject: body.subject,

      html: `
        <div style="font-family: Arial; background:#020817; color:white; padding:30px;">
          
          <h1 style="color:#00c6ff;">
            🎬 CineZone HD
          </h1>

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

  } catch (error) {

    return Response.json({
      success: false,
      error,
    });

  }
}
