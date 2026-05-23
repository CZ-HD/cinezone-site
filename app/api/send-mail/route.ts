export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  "api-key": process.env.BREVO_API_KEY || "",
},

      body: JSON.stringify({
        sender: {
          name: "CineZone HD",
          email: "onboarding@resend.dev",
        },

        to: body.to.split(",").map((email) => ({
          email: email.trim(),
        })),

        subject: body.subject,

        htmlContent: `
          <div style="background:#050816;padding:30px;color:white;font-family:Arial">
            <h1 style="color:#00c6ff;">🎬 CineZone HD</h1>

            <div style="
              background:#0f172a;
              padding:20px;
              border-radius:12px;
              margin-top:20px;
            ">
              ${body.message.replace(/\n/g, "<br>")}
            </div>

            <p style="margin-top:20px;color:#999;">
              Message envoyé par l'administration CineZone HD
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    return Response.json({
      success: true,
      data,
    });

  } catch (error) {

    return Response.json({
      success: false,
      error: error.message,
    });

  }
}
