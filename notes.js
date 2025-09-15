// README

// Draft Mercuriale des Chartes
// Mercuriale des Chartes
// Cartulaire : évoque la tradition médiévale, les registres d’actes, chartes et titres. Cela inspire sérieux, enracinement, mémoire. Idéal pour un site qui veut se poser comme gardien et ordonnateur de documents.
// Concordancier : renvoie à l’outil d’indexation des mots dans un corpus, mais aussi à l’idée d’harmonie (concordia). Plus technique, moins chaleureux, mais efficace si l’accent est mis sur recherche et analyse.
// Présenter et défendre le choix des technologies employées
// Présenter les fonctionnalités développées et les potentielles fonctionnalités à développer prochainement (?).

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

// ### Paiements (GoCardless)

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

