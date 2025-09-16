import { headers } from "next/headers";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const nonce = h.get("x-nonce") ?? undefined;

  return (
    <html lang="fr">
      <head>{nonce && <meta name="csp-nonce" content={nonce} />}</head>
      <body>{children}</body>
    </html>
  );
}
