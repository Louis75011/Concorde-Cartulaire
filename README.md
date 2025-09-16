# Concorde Cartulaire (Draft V0.5) — Gestion Clients / Contrats / Prestataires
# Alias la Mercuriale des Chartes

> **Un projet de back-office moderne, enraciné dans la tradition des cartulaires médiévaux, et pensé pour répondre aux besoins concrets d’administration des contrats, factures, clients et prestataires, dans un cadre sécurisé, extensible et intégrable.**

---

## 1. Choix techniques et architecture

Le projet repose sur une **stack moderne** choisie avec soin pour combiner robustesse, performance, gratuité des environnements de préproduction et respect des standards de sécurité actuels.

### Frontend
- **Next.js 15** (React 19, App Router) : framework universel, optimisé pour SEO, performances et SSR/ISR.
- **React 19** : la version stable la plus récente, garantissant compatibilité avec l’écosystème et support long terme.
- **Material UI v6 (MUI)** : librairie UI robuste, intégrée avec Emotion, pour un rendu accessible et moderne.
- **SCSS / CSS-in-JS** : flexibilité entre global styles et composants isolés.
- **DataGrid (MUI X)** : pour les CRUD (Clients, Contrats, Factures, etc.) avec filtrage, export CSV, pagination.

### Backend
- **Next.js API Routes** : gestion des endpoints RESTful (`/api/clients`, `/api/contrats`, `/api/factures`, etc.).
- **PostgreSQL (Neon)** : base de données relationnelle robuste, hébergée gratuitement en mode serverless.
- **Drizzle ORM** : typage fort, migrations simples, compatible TypeScript.

### Sécurité
- **Content-Security-Policy (CSP)** durcie avec `nonce`, `strict-dynamic`, HSTS preload.
- **FIDO2 / Passkeys (SimpleWebAuthn)** : authentification moderne, sans mot de passe.
- **TOTP** (One-Time Password) : second facteur, secret chiffré en AES-256.
- **JWT en cookie HttpOnly** : gestion des sessions.

### Intégrations externes (pré-sélection)
- **Paiement / Abonnements** : GoCardless (sandbox), SlimPay.
- **Signature électronique** : DocuSeal (API, webhooks, archivage PDF).
- **Comptabilité** : GnuCash (open source), export CSV/JSON.
- **E-mails transactionnels** : Resend (API, sandbox).
- **CRM** (optionnel) : HubSpot (cloud), Dolibarr (open source), ou implémentation interne.

### Infrastructure
- **Hébergement** : Vercel (front + API), gratuit et optimisé pour Next.js.
- **Base de données** : Neon (PostgreSQL serverless).
- **Outils DB** : DBeaver / DbVisualizer pour modélisation.
- **DevOps** : pipeline CI/CD simplifié (GitHub → Vercel → Neon).

---

## 2. Fonctionnalités déjà développées

### Base de données (Neon + Drizzle)
- Tables créées : `clients`, `contrats`, `factures`, `prestataires`, `collaborateurs`, `affectations`.
- Colonnes enrichies : `tel`, `secteur`, `entreprise`, `date_creation` pour Clients.
- Migrations cohérentes et traçables.

### API Routes
- `GET /api/clients` : liste filtrable.
- `POST /api/clients` : création d’un client.
- CRUD en place pour `clients`, extensible aux autres entités.
- Endpoints stubs pour :
  - Auth (WebAuthn, TOTP),
  - Paiements GoCardless (`mandate`, `webhook`),
  - Signatures DocuSeal (`create`, `webhook`),
  - Export comptable (`/api/accounting/export`).

### Frontend
- Page **Clients** avec DataGrid :
  - Filtrage,
  - Export CSV,
  - Création via modal.
- Navigation principale : Tableau de bord, Clients, Contrats, Factures, Prestataires, Collaborateurs, Paiements, Signatures, Paramètres.
- Design cohérent (MUI + thème bleu marine).

### Sécurité
- **CSP fonctionnelle** (avec `nonce`, `unsafe-eval` seulement en dev).
- Middleware Next.js pour injecter les headers de sécurité :
  - CSP,
  - Referrer-Policy,
  - X-Content-Type-Options,
  - Permissions-Policy,
  - HSTS preload.

### Déploiement
- **Préproduction Vercel** fonctionnelle, reliée à Neon.
- `.env.example` clair, prêt pour adaptation.

---

## 3. Fonctionnalités à développer prochainement

1. **Authentification complète**
   - Persistance WebAuthn (stockage `user_passkeys`).
   - Flux TOTP complet (QR code + validation).
   - Session JWT (login/logout).

2. **CRUD étendus**
   - Contrats : statuts (brouillon, actif, clos).
   - Factures : statut de paiement.
   - Prestataires : typologie (dev, intégrateur, sécurité).
   - Collaborateurs : rôles et droits.

3. **Intégrations externes**
   - GoCardless : mandat et prélèvement sandbox.
   - DocuSeal : création d’un document, suivi webhook, archivage.
   - Export comptable : GnuCash, CSV automatisé.
   - E-mails transactionnels via Resend.

4. **Conformité**
   - RGPD : gestion des droits d’accès et consentement.
   - Audit log (table `audit`).

5. **Administration avancée**
   - Dashboard avec KPI (contrats actifs, factures en attente, etc.).
   - Paramétrage des intégrations (clé API depuis l’UI).
   - Export global CSV/Excel.

---

## 4. Pourquoi ce nom : « Concorde Cartulaire » ?

Le choix du nom n’est pas anodin : il porte un **sens historique et symbolique**.

- **Cartulaire** : dans la tradition médiévale, un cartulaire est un recueil de chartes, titres et actes fondateurs d’une institution (abbaye, seigneurie, commune). Il incarne la **mémoire juridique** et l’**authenticité des documents**.
- **Concorde** : du latin *concordia* (harmonie), il évoque l’idée d’**équilibre, d’organisation cohérente et de paix civile**. Il traduit l’ambition du projet : rétablir l’ordre dans la gestion des données clients/contrats.

👉 **« Concorde Cartulaire »** devient ainsi une **Mercuriale des Chartes numériques** : un outil moderne mais enraciné, garant de sérieux, de sécurité et de mémoire.

---

## 5. Utilité du site

Ce projet vise à offrir un **back-office intégré** et **sécurisé** aux entreprises, associations ou institutions :

- **Centraliser** : clients, contrats, factures, prestataires, collaborateurs.
- **Automatiser** : facturation, paiements (GoCardless), signatures électroniques (DocuSeal).
- **Sécuriser** : authentification forte (FIDO2, TOTP), conformité RGPD, traçabilité.
- **Ouvrir** : intégrations possibles avec CRM (HubSpot, Dolibarr), comptabilité (GnuCash), marketplace.
- **Simplifier** : une interface admin claire (MUI DataGrid), exports rapides, filtres, statistiques.

---

## 6. Positionnement et valeur ajoutée

- **Technique** : stack moderne, gratuite en préprod, extensible.
- **Fonctionnelle** : déjà opérationnel sur les clients, prêt à étendre aux contrats/factures.
- **Sécurité** : CSP stricte, FIDO2, TOTP, HSTS preload.
- **Symbolique** : un projet qui assume une dimension **culturelle et sérieuse**, rappelant l’authenticité des cartulaires.

👉 C’est à la fois un **outil pratique** et un **projet conceptuellement fort**, qui associe **mémoire historique** et **innovation numérique**.

---

## 7. Annexes

- Diagramme DB (export DBeaver).
- Screenshots : Dashboard, Clients.
- Lien préprod : *(à insérer)*.
- `.env.example` fourni.

---

## 8. Licence

Projet draft, non publié sous licence open source pour l’instant.
