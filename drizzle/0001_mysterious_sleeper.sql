CREATE TABLE "prelevements" (
	"id" serial PRIMARY KEY NOT NULL,
	"facture_id" integer,
	"provider_id" integer,
	"montant" integer,
	"devise" varchar(10),
	"statut" varchar(50),
	"provider_event_id" varchar(255),
	"created_at" timestamp DEFAULT now()
);
