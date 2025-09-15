import type { Metadata, Viewport } from 'next';
import './globals.scss';
import ThemeRegistry from './ThemeRegistry';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Concorde Cartulaire',
  description: 'Back-office Concorde Cartulaire',
  applicationName: 'Concorde Cartulaire',
};

export const viewport: Viewport = {
  themeColor: '#0d47a1',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // attendre les headers
  const hdrs = await headers();
  const nonce = hdrs.get('x-nonce') ?? undefined;

  return (
    <html lang="fr">
      <body>
        {/* passer le nonce au ThemeRegistry */}
        <ThemeRegistry nonce={nonce}>{children}</ThemeRegistry>
      </body>
    </html>
  );
}