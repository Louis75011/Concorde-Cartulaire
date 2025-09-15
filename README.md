# Draft V0.5 — Gestion Clients / Contrats / Prestataires

Pile : Next.js 15 + React 19 + MUI v6, Drizzle ORM + Neon (Postgres), Auth Passkeys (FIDO2) + TOTP, GoCardless (sandbox), DocuSeal, export GnuCash.

## Prérequis
- Node.js 22 LTS
- Compte Neon (Postgres serverless) + DATABASE_URL
- Clés sandbox : GoCardless ; DocuSeal ; (option) Resend.

## Installation
```bash
pnpm i
cp .env.example .env
# Renseignez DATABASE_URL, WEBAUTHN_*, etc.
pnpm dev
```

## Sécurité & scores
- En-têtes stricts (CSP, HSTS preload, Referrer, XFO, XCTO, Permissions-Policy).
- `/.well-known/security.txt` présent.
- A11y & sémantique (MUI + balises HTML correctes).
- Pour améliorer la CSP (retirer 'unsafe-inline'), ajouter un `nonce` aux styles Emotion & scripts.

## Déploiement préprod
- Vercel (Hobby) : ajoutez les variables `.env` dans le projet.
- Neon : activez le pooler (PgBouncer) côté connexion.

## TODO
- Compléter la persistance WebAuthn (stockage credentials) & TOTP.
- Implémenter intégralement les webhooks et rapprochement payments.
- Écrans CRUD complets + DataGrid.
