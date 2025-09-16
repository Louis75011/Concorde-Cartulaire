import type { Metadata, Viewport } from "next";
import "./globals.scss";
import ThemeRegistry from "./ThemeRegistry";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Concorde Cartulaire",
  description: "Back-office Concorde Cartulaire",
  applicationName: "Concorde Cartulaire",
};

export const viewport: Viewport = {
  themeColor: "#0d47a1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // @ts-ignore
  const nonce = headers().get("x-nonce") ?? undefined;
  return (
    <html lang="fr">
      <head>{nonce && <meta property="csp-nonce" content={nonce} />}</head>
      <body>
        <ThemeRegistry nonce={nonce}>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
