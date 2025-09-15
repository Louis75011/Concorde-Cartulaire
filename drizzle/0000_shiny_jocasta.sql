CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(255) NOT NULL,
	"email" varchar(255),
	"cree_le" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contrats" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"titre" varchar(255) NOT NULL,
	"cree_le" timestamp DEFAULT now() NOT NULL
);
