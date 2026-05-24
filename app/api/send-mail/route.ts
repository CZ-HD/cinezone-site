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
                box-shadow:0 0 35px rgba(0,198,255,0.12);
              ">

                <div style="
                  padding:30px;
                  background:linear-gradient(
                    to right,
                    #020617,
                    #071b34
                  );
                ">

                  <h1 style="
                    color:#00c6ff;
                    margin:0;
                    font-size:34px;
                  ">
                    🎬 CineZone HD
                  </h1>

                  <p style="
                    color:#94a3b8;
                    margin-top:10px;
                    font-size:15px;
                  ">
                    Plateforme communautaire cinéma
                  </p>

                </div>

                <div style="padding:35px;">

                  ${
                    body.email
                      ? `
                        <div style="
                          background:#0f172a;
                          padding:15px;
                          border-radius:12px;
                          margin-bottom:20px;
                          color:#cbd5e1;
                        ">
                          <b>Email du visiteur :</b>
                          ${body.email}
                        </div>
                      `
                      : ""
                  }

                  <div style="
                    background:#0b1730;
                    padding:25px;
                    border-radius:16px;
                    line-height:1.8;
                    color:white;
                    font-size:16px;
                  ">
                    ${body.message.replace(/\n/g, "<br>")}
                  </div>

                </div>

                <div style="
                  padding:25px;
                  text-align:center;
                  color:#64748b;
                  font-size:14px;
                  border-top:1px solid rgba(255,255,255,0.05);
                ">
                  Message envoyé depuis CineZone HD
                </div>

              </div>

            </div>
          `,
        }),
      }
    );

    const data = await response.json();

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
