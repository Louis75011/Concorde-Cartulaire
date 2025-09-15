import type { Metadata } from 'next';
import './globals.scss';
import ThemeRegistry from './ThemeRegistry';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Cartulaire — Back-office',
  description: 'Gestion Clients/Contrats/Prestataires avec auth forte, paiements, e-signature.',
  applicationName: 'Cartulaire',
};

export const viewport = {
  themeColor: '#0d47a1',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers();
  const nonce = hdrs.get('x-nonce') ?? undefined;

  return (
    <html lang="fr">
      <body>
        <ThemeRegistry nonce={nonce}>{children}</ThemeRegistry>
      </body>
    </html>
  );
}