#!/usr/bin/env bash
set -euo pipefail

echo "== Cartulaire V0.6 overlay =="
root="."
mkdir -p "$root"

# ---------- Patch tsconfig for @ alias ----------
if [ -f tsconfig.json ]; then
  node - <<'NODE'
const fs = require('fs');
const p = 'tsconfig.json';
const j = JSON.parse(fs.readFileSync(p,'utf8'));
j.compilerOptions = j.compilerOptions || {};
j.compilerOptions.baseUrl = '.';
j.compilerOptions.paths = Object.assign({"@/*":["src/*"]}, j.compilerOptions.paths||{});
fs.writeFileSync(p, JSON.stringify(j,null,2));
console.log('Patched tsconfig.json with baseUrl="." and paths @/* -> src/*');
NODE
else
  cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022","DOM"],
    "strict": true,
    "noEmit": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["next-env.d.ts","**/*.ts","**/*.tsx"],
  "exclude": ["node_modules"]
}
JSON
  echo "Created tsconfig.json with @ alias"
fi

# ---------- Middleware CSP with nonce ----------
cat > middleware.ts <<'TS'
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function genNonce(len = 16) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Buffer.from(bytes).toString('base64');
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const nonce = genNonce();
  res.headers.set('x-nonce', nonce);

  const dev = process.env.NODE_ENV !== 'production';
  const scriptSrc = ["'self'", `'nonce-${nonce}'`];
  if (dev) scriptSrc.push("'unsafe-eval'"); // tolerated only in dev

  const styleSrc = ["'self'", `'nonce-${nonce}'`];
  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' https:`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
TS

# ---------- Theme registry with Emotion nonce ----------
mkdir -p src/app
cat > src/app/ThemeRegistry.tsx <<'TSX'
'use client';
import * as React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

export default function ThemeRegistry({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  const [cache] = React.useState(() => createCache({ key: 'mui', nonce }));
  const theme = React.useMemo(() => createTheme({
    palette: { mode: 'light', primary: { main: '#0d47a1' }, secondary: { main: '#00695c' } },
  }), []);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
TSX

cat > src/app/layout.tsx <<'TSX'
import type { Metadata } from 'next';
import './globals.scss';
import ThemeRegistry from './ThemeRegistry';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Cartulaire — Back-office',
  description: 'Gestion Clients/Contrats/Prestataires avec auth forte, paiements, e-signature.',
  applicationName: 'Cartulaire',
  themeColor: '#0d47a1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = headers();
  const nonce = hdrs.get('x-nonce') ?? undefined;

  return (
    <html lang="fr">
      <body>
        <ThemeRegistry nonce={nonce}>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
TSX

# ---------- Sessions (JWT) & crypto (AES-GCM) ----------
mkdir -p src/lib
cat > src/lib/session.ts <<'TS'
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  cookies().set('sid', token, { httpOnly: true, secure: true, sameSite: 'strict', path: '/' });
}

export async function getSession(): Promise<{ uid: number } | null> {
  const cookie = cookies().get('sid')?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, secret);
    return { uid: Number(payload.uid) };
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().set('sid', '', { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 0 });
}
TS

cat > src/lib/crypto.ts <<'TS'
import crypto from 'crypto';
const encKey = (process.env.TOTP_ENCRYPTION_KEY || '').padEnd(32, '0').slice(0,32);
export function seal(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encKey), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}
export function unseal(token: string): string {
  const buf = Buffer.from(token, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(encKey), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}
TS

# ---------- WebAuthn server helpers & challenge store ----------
mkdir -p src/lib/auth
cat > src/lib/auth/webauthn-server.ts <<'TS'
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { db } from '@/db/client';
import { users, user_passkeys } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const rpID = process.env.WEBAUTHN_RP_ID!;
export const rpName = process.env.WEBAUTHN_RP_NAME!;
export const origin = process.env.WEBAUTHN_ORIGIN!;

export async function startRegistration(email: string) {
  let [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) {
    const inserted = await db.insert(users).values({ email }).returning();
    u = inserted[0];
  }
  const existing = await db.select().from(user_passkeys).where(eq(user_passkeys.user_id, u.id));
  const options = await generateRegistrationOptions({
    rpID, rpName,
    userID: String(u.id),
    userName: email,
    attestationType: 'none',
    excludeCredentials: existing.map((a) => ({
      id: Buffer.from(a.credential_id, 'base64url'),
      type: 'public-key' as const,
    })),
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
  });
  return { user: u, options };
}

export async function finishRegistration(userId: number, expectedChallenge: string, response: any) {
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
  });
  const { verified, registrationInfo } = verification;
  if (verified && registrationInfo) {
    const { credentialPublicKey, credentialID, counter, transports } = registrationInfo;
    await db.insert(user_passkeys).values({
      user_id: userId,
      credential_id: Buffer.from(credentialID).toString('base64url'),
      public_key: Buffer.from(credentialPublicKey).toString('base64'),
      counter: counter ?? 0,
      transports: transports?.join(',') ?? null as any,
    });
  }
  return verification;
}

export async function startAuth(email: string) {
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u) throw new Error('Utilisateur inconnu');
  const authenticators = await db.select().from(user_passkeys).where(eq(user_passkeys.user_id, u.id));
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    allowCredentials: authenticators.map(a => ({
      id: Buffer.from(a.credential_id, 'base64url'),
      type: 'public-key' as const,
    })),
  });
  return { user: u, options };
}

export async function finishAuth(userId: number, expectedChallenge: string, response: any) {
  const [auth] = await db.select().from(user_passkeys).where(eq(user_passkeys.user_id, userId)).limit(1);
  if (!auth) throw new Error('Aucun passkey');
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: Buffer.from(auth.credential_id, 'base64url'),
      credentialPublicKey: Buffer.from(auth.public_key, 'base64'),
      counter: auth.counter,
      transports: auth.transports?.split(',') as any,
    },
    requireUserVerification: false,
  });
  if (verification.verified) {
    await db.update(user_passkeys).set({ counter: verification.authenticationInfo.newCounter ?? (auth.counter + 1) }).where(eq(user_passkeys.id, auth.id));
  }
  return verification;
}
TS

cat > src/lib/auth/challenges.ts <<'TS'
const reg = new Map<string, string>();
const auth = new Map<string, string>();

export function setRegChallenge(email: string, c: string){ reg.set(email, c); }
export function getRegChallenge(email: string){ return reg.get(email) || ''; }
export function setAuthChallenge(email: string, c: string){ auth.set(email, c); }
export function getAuthChallenge(email: string){ return auth.get(email) || ''; }
TS

# ---------- API routes: WebAuthn register/auth ----------
mkdir -p src/app/api/auth/webauthn/register/options
cat > src/app/api/auth/webauthn/register/options/route.ts <<'TS'
import { NextRequest, NextResponse } from 'next/server';
import { startRegistration } from '@/lib/auth/webauthn-server';
import { setRegChallenge } from '@/lib/auth/challenges';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const { user, options } = await startRegistration(email);
  setRegChallenge(email, options.challenge);
  return NextResponse.json({ userId: user.id, options });
}
TS

mkdir -p src/app/api/auth/webauthn/register/verify
cat > src/app/api/auth/webauthn/register/verify/route.ts <<'TS'
import { NextRequest, NextResponse } from 'next/server';
import { finishRegistration } from '@/lib/auth/webauthn-server';
import { getRegChallenge } from '@/lib/auth/challenges';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email: string = body.email;
  const userId: number = body.userId;
  const expected = getRegChallenge(email);
  if (!expected) return new NextResponse('Challenge manquant', { status: 400 });
  const verification = await finishRegistration(userId, expected, body.response);
  if (verification.verified) {
    await createSession(userId);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
TS

mkdir -p src/app/api/auth/webauthn/auth/options
cat > src/app/api/auth/webauthn/auth/options/route.ts <<'TS'
import { NextRequest, NextResponse } from 'next/server';
import { startAuth } from '@/lib/auth/webauthn-server';
import { setAuthChallenge } from '@/lib/auth/challenges';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const { user, options } = await startAuth(email);
  setAuthChallenge(email, options.challenge);
  return NextResponse.json({ userId: user.id, options });
}
TS

mkdir -p src/app/api/auth/webauthn/auth/verify
cat > src/app/api/auth/webauthn/auth/verify/route.ts <<'TS'
import { NextRequest, NextResponse } from 'next/server';
import { finishAuth } from '@/lib/auth/webauthn-server';
import { getAuthChallenge } from '@/lib/auth/challenges';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email: string = body.email;
  const userId: number = body.userId;
  const expected = getAuthChallenge(email);
  if (!expected) return new NextResponse('Challenge manquant', { status: 400 });
  const verification = await finishAuth(userId, expected, body.response);
  if (verification.verified) {
    await createSession(userId);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
TS

# ---------- API routes: TOTP ----------
mkdir -p src/app/api/auth/totp/enroll
cat > src/app/api/auth/totp/enroll/route.ts <<'TS'
import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { seal } from '@/lib/crypto';
import { db } from '@/db/client';
import { user_totp } from '@/db/schema';
import { getSession } from '@/lib/session';

export async function POST() {
  const session = await getSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(String(session.uid), 'Cartulaire', secret);
  const svg = await QRCode.toString(otpauth, { type: 'svg' });

  const enc = seal(secret);
  await db.insert(user_totp).values({ user_id: session.uid, secret_enc: enc, enabled: false });

  return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}
TS

mkdir -p src/app/api/auth/totp/verify
cat > src/app/api/auth/totp/verify/route.ts <<'TS'
import { NextRequest, NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import { db } from '@/db/client';
import { user_totp } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { unseal } from '@/lib/crypto';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { token } = await req.json();
  const rows = await db.select().from(user_totp).where(eq(user_totp.user_id, session.uid)).orderBy(desc(user_totp.id)).limit(1);
  if (!rows.length) return new NextResponse('No TOTP', { status: 404 });
  const secret = unseal(rows[0].secret_enc);
  const ok = authenticator.check(token, secret);
  if (!ok) return new NextResponse('Invalid TOTP', { status: 400 });
  await db.update(user_totp).set({ enabled: true }).where(eq(user_totp.id, rows[0].id));
  return NextResponse.json({ ok: true });
}
TS

# ---------- CRUD Clients API + page ----------
mkdir -p src/app/api/clients
cat > src/app/api/clients/route.ts <<'TS'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { clients } from '@/db/schema';
import { ilike, asc, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const order = searchParams.get('order') || 'id.desc';
  const [_, dir] = order.split('.');
  const where = q ? ilike(clients.nom, `%${q}%`) : undefined as any;
  const rows = await db.select().from(clients).where(where).orderBy(dir === 'desc' ? desc(clients.id) : asc(clients.id)).limit(200);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const inserted = await db.insert(clients).values({
    nom: body.nom, email: body.email, tel: body.tel, entreprise: body.entreprise, secteur: body.secteur
  }).returning();
  return NextResponse.json(inserted[0], { status: 201 });
}
TS

mkdir -p src/app/api/clients/[id]
cat > src/app/api/clients/[id]/route.ts <<'TS'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { clients } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [row] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  if (!row) return new NextResponse('Not found', { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await db.update(clients).set(body).where(eq(clients.id, id)).returning();
  return NextResponse.json(updated[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await db.delete(clients).where(eq(clients.id, id));
  return new NextResponse(null, { status: 204 });
}
TS

cat > src/app/clients/page.tsx <<'TSX'
'use client';
import { useEffect, useState, useMemo } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Container, Typography, Paper, Stack, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Nav } from '../../components/Nav';

interface Client { id:number; nom:string; email:string; tel?:string; entreprise?:string; secteur?:string; date_creation:string; }

export default function ClientsPage() {
  const [rows, setRows] = useState<Client[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({ nom:'', email:'' });

  const load = async () => {
    const r = await fetch('/api/clients?q=' + encodeURIComponent(q));
    setRows(await r.json());
  };
  useEffect(() => { load(); }, []);

  const cols = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'nom', headerName: 'Nom', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'tel', headerName: 'Téléphone', width: 160 },
    { field: 'entreprise', headerName: 'Entreprise', flex: 1 },
    { field: 'secteur', headerName: 'Secteur', width: 160 },
  ], []);

  const onCreate = async () => {
    await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(form) });
    setOpen(false);
    setForm({ nom:'', email:'' });
    await load();
  };

  return (
    <>
      <Nav />
      <Container sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Clients</Typography>
        <Paper sx={{ p:2, mb:2 }}>
          <Stack direction="row" spacing={2}>
            <TextField size="small" label="Recherche" value={q} onChange={e=>setQ(e.target.value)} />
            <Button variant="outlined" onClick={load}>Filtrer</Button>
            <Button variant="contained" onClick={()=>setOpen(true)}>Nouveau client</Button>
          </Stack>
        </Paper>
        <div style={{ height: 520, width: '100%' }}>
          <DataGrid rows={rows} columns={cols} slots={{ toolbar: GridToolbar }} disableRowSelectionOnClick />
        </div>

        <Dialog open={open} onClose={()=>setOpen(false)}>
          <DialogTitle>Nouveau client</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt:1 }}>
              <TextField label="Nom" value={form.nom||''} onChange={e=>setForm({ ...form, nom: e.target.value })} />
              <TextField label="Email" value={form.email||''} onChange={e=>setForm({ ...form, email: e.target.value })} />
              <TextField label="Téléphone" value={form.tel||''} onChange={e=>setForm({ ...form, tel: e.target.value })} />
              <TextField label="Entreprise" value={form.entreprise||''} onChange={e=>setForm({ ...form, entreprise: e.target.value })} />
              <TextField label="Secteur" value={form.secteur||''} onChange={e=>setForm({ ...form, secteur: e.target.value })} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpen(false)}>Annuler</Button>
            <Button onClick={onCreate} variant="contained">Créer</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
TSX

# ---------- Paiements: webhook + vue ----------
mkdir -p src/app/api/payments/gocardless/webhook
cat > src/app/api/payments/gocardless/webhook/route.ts <<'TS'
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db/client';
import { prelevements } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const secret = process.env.GOCARDLESS_WEBHOOK_SECRET;
  if (!secret) return new NextResponse('Missing GOCARDLESS_WEBHOOK_SECRET', { status: 500 });

  const raw = await req.text();
  const signature = req.headers.get('Webhook-Signature');
  if (!signature) return new NextResponse('Missing signature', { status: 400 });

  const computed = crypto.createHmac('sha256', secret).update(raw, 'utf8').digest('hex');
  if (computed !== signature) return new NextResponse('Invalid signature', { status: 400 });

  const payload = JSON.parse(raw);
  for (const ev of payload.events ?? []) {
    const provider_event_id = ev.id;
    const statut = ev?.details?.cause === 'payment_paid' || ev.action === 'paid' ? 'paid'
                  : ev.action === 'failed' ? 'failed'
                  : ev.action === 'cancelled' ? 'cancelled' : 'submitted';

    const found = await db.select().from(prelevements).where(eq(prelevements.provider_event_id, provider_event_id)).limit(1);
    if (found.length) {
      await db.update(prelevements).set({ statut }).where(eq(prelevements.id, found[0].id));
    } else {
      await db.insert(prelevements).values({
        facture_id: 0,
        provider_id: 1,
        montant: '0.00',
        devise: 'EUR',
        statut,
        provider_event_id,
      });
    }
  }
  return NextResponse.json({ ok: true });
}
TS

mkdir -p src/app/paiements
cat > src/app/paiements/page.tsx <<'TSX'
import { Container, Typography, Grid, Paper } from '@mui/material';
import { Nav } from '../components/Nav';
import { db } from '@/db/client';
import { prelevements } from '@/db/schema';

export const dynamic = 'force-dynamic';

async function getData() {
  const rows = await db.select().from(prelevements).limit(100);
  const totals = { created:0, submitted:0, paid:0, failed:0, cancelled:0 } as Record<string, number>;
  rows.forEach(r => { totals[r.statut] = (totals[r.statut]||0)+1; });
  return { rows, totals };
}

export default async function PaiementsPage() {
  const { rows, totals } = await getData();
  return (
    <>
      <Nav />
      <Container sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Paiements</Typography>
        <Grid container spacing={2}>
          {Object.entries(totals).map(([k,v]) => (
            <Grid key={k} item xs={12} md={2}><Paper sx={{ p:2 }}><Typography variant="h6">{k}</Typography><Typography>{v}</Typography></Paper></Grid>
          ))}
        </Grid>
        <Paper sx={{ p:2, mt:2 }}>
          <Typography variant="h6">Derniers événements</Typography>
          <pre style={{ overflow:'auto' }}>{JSON.stringify(rows.slice(0,20), null, 2)}</pre>
        </Paper>
      </Container>
    </>
  );
}
TSX

# ---------- Signatures: webhook + vue ----------
mkdir -p src/app/api/signature/docuseal/webhook
cat > src/app/api/signature/docuseal/webhook/route.ts <<'TS'
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { sign_requests, documents } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const event = payload.event || payload.status;
  const external_id = payload.submission_id || payload.id;
  const download_url = payload.download_url;

  const newStatut = event === 'completed' ? 'completed'
                  : event === 'declined' ? 'declined'
                  : 'sent';

  const updated = await db.update(sign_requests).set({ statut: newStatut }).where(eq(sign_requests.external_id, external_id)).returning();
  if (download_url && updated.length) {
    await db.insert(documents).values({ client_id: null as any, url: download_url, title: 'Contrat signé', kind: 'contrat' as any });
  }
  return NextResponse.json({ ok: true });
}
TS

mkdir -p src/app/signatures
cat > src/app/signatures/page.tsx <<'TSX'
import { Container, Typography, Grid, Paper } from '@mui/material';
import { Nav } from '../components/Nav';
import { db } from '@/db/client';
import { sign_requests, documents } from '@/db/schema';

export const dynamic = 'force-dynamic';

async function getData() {
  const reqs = await db.select().from(sign_requests).limit(50);
  const docs = await db.select().from(documents).limit(50);
  return { reqs, docs };
}

export default async function SignaturesPage() {
  const { reqs, docs } = await getData();
  return (
    <>
      <Nav />
      <Container sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Signatures</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><Paper sx={{ p:2 }}><Typography variant="h6">Demandes</Typography><pre>{JSON.stringify(reqs, null, 2)}</pre></Paper></Grid>
          <Grid item xs={12} md={6}><Paper sx={{ p:2 }}><Typography variant="h6">Documents archivés</Typography><pre>{JSON.stringify(docs, null, 2)}</pre></Paper></Grid>
        </Grid>
      </Container>
    </>
  );
}
TSX

# ---------- Nav update ----------
mkdir -p src/components
cat > src/components/Nav.tsx <<'TSX'
'use client';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export function Nav() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Cartulaire</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="inherit" component={Link} href="/">Tableau de bord</Button>
          <Button color="inherit" component={Link} href="/clients">Clients</Button>
          <Button color="inherit" component={Link} href="/contrats">Contrats</Button>
          <Button color="inherit" component={Link} href="/factures">Factures</Button>
          <Button color="inherit" component={Link} href="/prestataires">Prestataires</Button>
          <Button color="inherit" component={Link} href="/collaborateurs">Collaborateurs</Button>
          <Button color="inherit" component={Link} href="/paiements">Paiements</Button>
          <Button color="inherit" component={Link} href="/signatures">Signatures</Button>
          <Button color="inherit" component={Link} href="/settings">Paramètres</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
TSX

# ---------- README V0.6 ----------
cat > README.V06.md <<'MD'
# Cartulaire — Mise à niveau V0.6

## Nouvelles fonctionnalités
- **CSP par nonce** (middleware) + Emotion nonce (MUI) → suppression de `'unsafe-inline'`.
- **Passkeys WebAuthn** persistants (inscription/connexion) + **TOTP** (enrôlement/validation).
- **CRUD** Clients avec **MUI DataGrid** (recherche + création).
- **Paiements** : réconciliation webhook GoCardless → `prelevements`.
- **Signature** : webhook DocuSeal → `sign_requests` + archivage (URL) dans `documents`.
- **Vues** `/paiements` et `/signatures` (états, debug).

## Installation
```bash
pnpm add @mui/x-data-grid
pnpm dev

