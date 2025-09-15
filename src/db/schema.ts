import { pgTable, serial, integer, text, timestamp, numeric, boolean, jsonb, primaryKey } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  email: text("email").notNull().unique(),
  tel: text("tel"),
  entreprise: text("entreprise"),
  secteur: text("secteur"),
  date_creation: timestamp("date_creation", { mode: "date" }).defaultNow().notNull(),
});

export const contrats = pgTable("contrats", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  type_contrat: text("type_contrat").notNull(),
  date_debut: timestamp("date_debut", { mode: "date" }).notNull(),
  date_fin: timestamp("date_fin", { mode: "date" }),
  montant: numeric("montant", { precision: 12, scale: 2 }).notNull(),
  statut: text("statut").$type<'brouillon'|'actif'|'suspendu'|'clos'>().default('brouillon').notNull(),
});

export const factures = pgTable("factures", {
  id: serial("id").primaryKey(),
  contrat_id: integer("contrat_id").notNull().references(() => contrats.id, { onDelete: "cascade" }),
  date_emission: timestamp("date_emission", { mode: "date" }).defaultNow().notNull(),
  date_echeance: timestamp("date_echeance", { mode: "date" }),
  date_paiement: timestamp("date_paiement", { mode: "date" }),
  montant_ht: numeric("montant_ht", { precision: 12, scale: 2 }).notNull(),
  tva: numeric("tva", { precision: 5, scale: 2 }).default('20.00').notNull(),
  montant_ttc: numeric("montant_ttc", { precision: 12, scale: 2 }).notNull(),
  statut_paiement: text("statut_paiement").$type<'draft'|'envoyee'|'payee'|'en_retard'|'annulee'>().default('draft').notNull(),
});

export const collaborateurs = pgTable("collaborateurs", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  droits_acces: jsonb("droits_acces").$type<Record<string, boolean>>().default({}),
});

export const prestataires = pgTable("prestataires", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // dev_front|dev_back|devops|integrateur|securite|...
  statut: text("statut").default("actif").notNull(),
  contact_email: text("contact_email"),
  secteur: text("secteur"),
});

export const affectations = pgTable("affectations", {
  id: serial("id").primaryKey(),
  collaborateur_id: integer("collaborateur_id").notNull().references(() => collaborateurs.id, { onDelete: "cascade" }),
  client_id: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  role: text("role").$type<'responsable'|'support'|'commercial'>().notNull(),
  date_debut: timestamp("date_debut", { mode: "date" }).defaultNow().notNull(),
  date_fin: timestamp("date_fin", { mode: "date" }),
});

export const payment_providers = pgTable("payment_providers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // gocardless|slimpay|test
  enabled: boolean("enabled").default(false).notNull(),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({})
});

export const mandats = pgTable("mandats", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  provider_id: integer("provider_id").notNull().references(() => payment_providers.id),
  reference_provider: text("reference_provider").notNull(),
  statut: text("statut").$type<'pending'|'active'|'revoked'>().default('pending').notNull(),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const prelevements = pgTable("prelevements", {
  id: serial("id").primaryKey(),
  facture_id: integer("facture_id").notNull().references(() => factures.id, { onDelete: "cascade" }),
  provider_id: integer("provider_id").notNull().references(() => payment_providers.id),
  montant: numeric("montant", { precision: 12, scale: 2 }).notNull(),
  devise: text("devise").default("EUR").notNull(),
  statut: text("statut").$type<'created'|'submitted'|'paid'|'failed'|'cancelled'>().default('created').notNull(),
  provider_event_id: text("provider_event_id"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const bank_connections = pgTable("bank_connections", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  provider: text("provider").default("powens").notNull(),
  external_id: text("external_id").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  title: text("title"),
  kind: text("kind").$type<'contrat'|'facture'|'autre'>().default('autre').notNull()
});

export const sign_requests = pgTable("sign_requests", {
  id: serial("id").primaryKey(),
  document_id: integer("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  provider: text("provider").default("docuseal").notNull(),
  external_id: text("external_id").notNull(),
  statut: text("statut").$type<'created'|'sent'|'completed'|'declined'|'error'>().default('created').notNull(),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  collaborator_id: integer("collaborator_id").references(() => collaborateurs.id, { onDelete: "set null" }),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash"),
  // passkeys only or password+TOTP hybrid
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const user_passkeys = pgTable("user_passkeys", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  credential_id: text("credential_id").notNull().unique(),
  public_key: text("public_key").notNull(),
  counter: integer("counter").default(0).notNull(),
  transports: text("transports"),
});

export const user_totp = pgTable("user_totp", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  secret_enc: text("secret_enc").notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const audit_logs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actor_user_id: integer("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  target_table: text("target_table"),
  target_id: integer("target_id"),
  meta: jsonb("meta"),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
