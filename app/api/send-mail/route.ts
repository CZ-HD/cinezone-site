import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: "CineZone HD <noreply@cinezone-hd.fr>",
      to: "VOTREMAIL@gmail.com",
      subject: "Test CineZone",
      html: "<h1>Test réussi ✅</h1>",
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
