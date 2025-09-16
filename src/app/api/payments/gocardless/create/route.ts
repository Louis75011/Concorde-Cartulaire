export const runtime = "nodejs";
export async function POST() {
  const r = await fetch("https://api-sandbox.gocardless.com/redirect_flows", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GOCARDLESS_TOKEN}`,
      "GoCardless-Version": "2015-07-06",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      redirect_flows: {
        description: "Mandat test",
        session_token: crypto.randomUUID(),
        success_redirect_url: `${process.env.ORIGIN}/payments/success`,
      },
    }),
  }).then(r => r.json());
  return Response.json(r);
}
