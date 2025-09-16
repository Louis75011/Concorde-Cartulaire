export const runtime = "nodejs";
export async function POST() {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Concorde <onboarding@resend.dev>",
      to: ["you@example.com"],
      subject: "Essai Concorde",
      html: "<p>Bonjour, ceci est un test.</p>",
    }),
  }).then(r => r.json());
  return Response.json(res);
}
