import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  numeric,
  boolean,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
// import { users } from "./users";

export const runtime = "nodejs";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  tel: varchar("tel", { length: 20 }),
  entreprise: varchar("entreprise", { length: 255 }),
  secteur: varchar("secteur", { length: 255 }),
  cree_le: timestamp("cree_le").defaultNow().notNull(),
  date_creation: timestamp("date_creation").defaultNow(),
});

/** ---------- Contrats (minimal actuel) ---------- */
export const contrats = pgTable("contrats", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").notNull(),
  titre: varchar("titre", { length: 255 }).notNull(),
  cree_le: timestamp("cree_le").defaultNow().notNull(),
});

/** ---------- Factures ---------- */
export const factures = pgTable("factures", {
  id: serial("id").primaryKey(),
  contrat_id: integer("contrat_id").notNull(),
  date_emission: timestamp("date_emission").defaultNow().notNull(),
  date_echeance: timestamp("date_echeance"),
  date_paiement: timestamp("date_paiement"),
  montant_ht: numeric("montant_ht", { precision: 12, scale: 2 }).notNull(),
  tva: numeric("tva", { precision: 5, scale: 2 }).default("20.00").notNull(),
  montant_ttc: numeric("montant_ttc", { precision: 12, scale: 2 }).notNull(),
  statut_paiement: varchar("statut_paiement", { length: 32 })
    .default("draft")
    .notNull(),
});

/** ---------- Prestataires ---------- */
export const prestataires = pgTable("prestataires", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  statut: text("statut").default("actif").notNull(),
  contact_email: text("contact_email"),
  secteur: text("secteur"),
});

/** ---------- Collaborateurs ---------- */
export const collaborateurs = pgTable("collaborateurs", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  droits_acces: jsonb("droits_acces"),
});

/** ---------- Affectations (collab ↔ client) ---------- */
export const affectations = pgTable("affectations", {
  id: serial("id").primaryKey(),
  collaborateur_id: integer("collaborateur_id").notNull(),
  client_id: integer("client_id").notNull(),
  role: text("role").notNull(),
  date_debut: timestamp("date_debut").defaultNow().notNull(),
  date_fin: timestamp("date_fin"),
});

/** ---------- Providers paiement + Mandates + Prélèvements (pour /paiements) ---------- */
export const payment_providers = pgTable("payment_providers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  settings: jsonb("settings"),
});

export const gcMandates = pgTable("gc_mandates", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),              // FK logique → clients.id (à relier si vous avez la FK)
  gcMandateId: varchar("gc_mandate_id", { length: 100 }).notNull().unique(),
  scheme: varchar("scheme", { length: 32 }),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),            // FK logique → factures.id
  provider: varchar("provider", { length: 32 }).default("gocardless").notNull(),
  providerPaymentId: varchar("provider_payment_id", { length: 100 }),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  status: varchar("status", { length: 32 }).default("created").notNull(), // created|submitted|confirmed|failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prelevements = pgTable("prelevements", {
  id: serial("id").primaryKey(),
  facture_id: integer("facture_id").notNull(),
  provider_id: integer("provider_id").notNull(),
  montant: numeric("montant", { precision: 12, scale: 2 }).notNull(),
  devise: text("devise").default("EUR").notNull(),
  statut: varchar("statut", { length: 32 }).default("created").notNull(),
  provider_event_id: text("provider_event_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// UTILISATEURS
/** TABLE users – une seule déclaration/export */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  display_name: varchar("display_name", { length: 255 }), // 🔑 identifiant WebAuthn persistant (base64url)
  webauthn_user_id: varchar("webauthn_user_id", { length: 128 }),
  is_admin: boolean("is_admin").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

/** TABLE credentials – on stocke en base64url (string) */
export const credentials = pgTable(
  "credentials",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    credentialID: text("credential_id").notNull().unique(), // base64url
    publicKey: text("public_key").notNull(), // base64url
    counter: integer("counter").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    credIdUnique: uniqueIndex("credentials_credential_id_uq").on(
      t.credentialID
    ),
  })
);

export const user_passkeys = pgTable("user_passkeys", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  credential_id: varchar("credential_id", { length: 512 }).notNull().unique(),
  public_key: text("public_key").notNull(),
  counter: integer("counter").default(0).notNull(),
  transports: varchar("transports", { length: 255 }), // csv
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const user_totp = pgTable("user_totp", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().unique(),
  secret_enc: text("secret_enc").notNull(), // secret TOTP chiffré
  enabled: boolean("enabled").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const auth_challenges = pgTable("auth_challenges", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  type: varchar("type", { length: 32 }).notNull(), // 'webauthn-reg' | 'webauthn-auth'
  challenge: varchar("challenge", { length: 255 }).notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  url: text("url").notNull(),
  title: text("title"),
  kind: text("kind")
    .$type<"contrat" | "facture" | "autre">()
    .default("autre")
    .notNull(),
});

export const sign_requests = pgTable("sign_requests", {
  id: serial("id").primaryKey(),
  document_id: integer("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  provider: text("provider").default("docuseal").notNull(),
  external_id: text("external_id").notNull(),
  statut: text("statut")
    .$type<"created" | "sent" | "completed" | "declined" | "error">()
    .default("created")
    .notNull(),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
