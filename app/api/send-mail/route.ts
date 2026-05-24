export async function POST(req: Request) {
  try {
    const body = await req.json();

    const emails = body.to
      ? Array.isArray(body.to)
        ? body.to
        : body.to.split(",")
      : [];

    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY || "",
        },

        body: JSON.stringify({
          sender: {
            name: "CineZone HD",
            email: "contact@cinezone-hd.fr",
          },

          to: [
            {
              email: "contact@cinezone-hd.fr",
            },
          ],

          bcc: emails.map((email: string) => ({
            email: email.trim(),
          })),

          subject: body.subject,

          htmlContent: `
            <div style="
              background:#020617;
              padding:40px;
              font-family:Arial,sans-serif;
              color:white;
            ">

              <div style="
                max-width:700px;
                margin:auto;
                background:#071226;
                border-radius:20px;
                overflow:hidden;
                border:1px solid rgba(0,198,255,0.15);
              ">

                <div style="padding:30px;">

                  <h1 style="
                    color:#00c6ff;
                    margin-top:0;
                  ">
                    🎬 CineZone HD
                  </h1>

                  <div style="
                    background:#0b1730;
                    padding:25px;
                    border-radius:16px;
                    line-height:1.8;
                    color:white;
                  ">
                    ${body.message.replace(/\n/g, "<br>")}
                  </div>

                </div>

              </div>

            </div>
          `,
        }),
      }
    );

    const data = await response.json();

    return Response.json(data);

  } catch (error: any) {

    return Response.json({
      success: false,
      error: error.message,
    });

  }
}
