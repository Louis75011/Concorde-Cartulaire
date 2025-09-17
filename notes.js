// README

// Propositions / Precisions supplementaires & solution intégrée pour gérer : Clients (données, contrats, facturation) Collaborateurs (accès, rôles, affectations) Prestataires (typologie, missions, suivi) Processus contrat vendeur ↔ demandeur Paiement et suivi via outils tiers (GoCardless, SlimPay, CRM, GnuCash ; authentification moins forte mais similaire si autre est gratuit, idem pour paiement). Typologie des gens. 

// Choix techniques utilisés, listés et pourquoi (postgre next neon drizzle etc)

// Draft Mercuriale des Chartes
// Mercuriale des Chartes
// Cartulaire : évoque la tradition médiévale, les registres d’actes, chartes et titres. Cela inspire sérieux, enracinement, mémoire. Idéal pour un site qui veut se poser comme gardien et ordonnateur de documents.
// Concordancier : renvoie à l’outil d’indexation des mots dans un corpus, mais aussi à l’idée d’harmonie (concordia). Plus technique, moins chaleureux, mais efficace si l’accent est mis sur recherche et analyse.
// Présenter et défendre le choix des technologies employées
// Présenter les fonctionnalités développées et les potentielles fonctionnalités à développer prochainement (?).

// WebAuthn / Passkey est effectivement bien plus pro que le combo email/mot de passe :
// 🔒 Sécurité forte : cryptographie asymétrique, sans mot de passe stocké en base.
// 💻 Expérience fluide : l’utilisateur clique → empreinte digitale / FaceID / clé FIDO → connexion directe.
// 📱 Interopérable : fonctionne sur mobile et desktop, avec synchronisation iCloud Keychain, Google Password Manager, etc.

// DANS QUEL MESURE AIJE UTILISER QUARKUS POSTGRE DBVISUALISER-NEON

// Support / Relation client : assistance

// 3. Typologie des prestataires Techniques : dev front (React/TS), back (Quarkus), DevOps (Proxmox, Debian, IaC). Fonctionnels : CRM, facturation, intégration marketplace. Support / Relation client : assistance, formation, suivi qualité. Juridique : gestion contrats, cession de droits, conformité RGPD.

// 4. Pré-sélection d’outils Paiement / Abonnements : GoCardless, SlimPay. Comptabilité : GnuCash (open source) ou équivalent SaaS. CRM : HubSpot (cloud), Dolibarr (open source), ou déeloppement interne connecté à la BDD. Infra : Proxmox (VM), PostgreSQL (BDD), Debian (OS). Sécurité : FIDO2 (auth forte), OTP SMS (signature).

// 5. Proposition / Positionnement Mise en place d’une base SQL PostgreSQL modélisée (diagrammes DBeaver). 
// Développement d’une interface admin (gestion clients, contrats, factures, prestataires). Intégration progressive des briques externes (paiement, CRM, comptabilité). Signature électronique sécurisée (OTP SMS). Fixation d’un prix → soit forfait par lot fonctionnel, soit TJM en régie.


// PAIEMENT GOCARDLESS OU SLIMPAY, FACTURATION CRM GENERE INTE MARKETPLACE (?)
// EXPLI BASE INTERFACES STYLISE (gestion clients, contrats, factures, prestataires & TABLES RESPECTIVES ET LIAISIONS)


//  Explication notebookLm
// Impressions écrans api / pages

// Génération de PDF

// Corrections erreur de tout l'IDE

// Voici la liste des routes API pouvant êtres appelées directement depuis un navigateur ou Postman à l’adresse `http://localhost:3000/` :

// ## 🌐 Vos endpoints disponibles

// ### Authentification

// * `POST /api/auth/totp/enroll` → génère un secret TOTP + QR code (SVG).

// * `POST /api/auth/totp/verify` → vérifie et active le TOTP.

// * `POST /api/auth/webauthn/register/options` → génère les options d’inscription WebAuthn.

// * `POST /api/auth/webauthn/register/verify` → finalise l’inscription d’une passkey.

// * `POST /api/auth/webauthn/auth/options` → génère les options de connexion WebAuthn.

// * `POST /api/auth/webauthn/auth/verify` → finalise la connexion avec passkey.

// ---

// ### Clients

// * `GET /api/clients` → liste les clients (+ recherche `?q=` possible).
// * `POST /api/clients` → crée un client.
// * `GET /api/clients/[id]` → récupère un client par ID.
// * `PATCH /api/clients/[id]` → modifie un client.
// * `DELETE /api/clients/[id]` → supprime un client.

// ---

// ### Collaborateurs

// * `GET /api/collaborateurs`
// * `POST /api/collaborateurs`
//   *(selon votre implémentation dans `route.ts`)*

// ---

// ### Contrats

// * `GET /api/contrats`
// * `POST /api/contrats`
// * `GET /api/contrats/options`
// * `POST /api/contrats/options`

// ---

// ### Factures

// * `GET /api/factures`
// * `POST /api/factures`
// * `GET /api/factures/options`
// * `POST /api/factures/options`

// ---

// ### Prestataires

// * `GET /api/prestataires`
// * `POST /api/prestataires`

// ---

// ### payments (GoCardless)

// * `POST /api/payments/gocardless/mandate`
// * `POST /api/payments/gocardless/ping`
// * `POST /api/payments/gocardless/webhook`

// ---

// ### Signatures (DocuSeal)

// * `POST /api/signature/docuseal/create`
// * `POST /api/signature/docuseal/ping`
// * `POST /api/signature/docuseal/webhook`

// ---

// ### Comptabilité

// * `POST /api/accounting/export`

// ---

// ## 📌 Exemple d’appels rapides

// ```bash
// # Lister les clients ou les collaborateurs
// curl http://localhost:3000/api/clients
// curl http://localhost:3000/api/collaborateurs

// # Créer un client
// Utiliser Invoke-RestMethod (PowerShell natif)
// Invoke-RestMethod -Uri "http://localhost:3000/api/clients" `
//   -Method Post `
//   -Headers @{ "Content-Type" = "application/json" } `
//   -Body '{"nom":"Dupont","email":"dupont@example.com"}'

