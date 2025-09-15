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

