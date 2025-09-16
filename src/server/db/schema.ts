import {
  pgTable, serial, integer, varchar, text, timestamp, numeric, boolean, jsonb
} from "drizzle-orm/pg-core";

export const runtime = 'nodejs';

/** ---------- Clients (minimal actuel) ---------- */
// export const clients = pgTable("clients", {
//   id: serial("id").primaryKey(),
//   nom: varchar("nom", { length: 255 }).notNull(),
//   email: varchar("email", { length: 255 }),
//   cree_le: timestamp("cree_le").defaultNow().notNull(),
// });
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
  tva: numeric("tva", { precision: 5, scale: 2 }).default('20.00').notNull(),
  montant_ttc: numeric("montant_ttc", { precision: 12, scale: 2 }).notNull(),
  statut_paiement: varchar("statut_paiement", { length: 32 }).default('draft').notNull(),
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

/** ---------- Providers paiement + Prélèvements (pour /paiements) ---------- */
export const payment_providers = pgTable("payment_providers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  settings: jsonb("settings"),
});

export const prelevements = pgTable("prelevements", {
  id: serial("id").primaryKey(),
  facture_id: integer("facture_id").notNull(),
  provider_id: integer("provider_id").notNull(),
  montant: numeric("montant", { precision: 12, scale: 2 }).notNull(),
  devise: text("devise").default("EUR").notNull(),
  statut: varchar("statut", { length: 32 }).default('created').notNull(),
  provider_event_id: text("provider_event_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
