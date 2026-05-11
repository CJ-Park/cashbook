CREATE TABLE "categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_type_check" CHECK ("categories"."type" in ('INCOME', 'EXPENSE', 'COMMON'))
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL REFERENCES auth.users(id),
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"transaction_date" date NOT NULL,
	"type" text NOT NULL,
	"category_id" bigint NOT NULL,
	"title" text NOT NULL,
	"amount" bigint NOT NULL,
	"memo" text,
	"payment_method" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "transactions_type_check" CHECK ("transactions"."type" in ('INCOME', 'EXPENSE')),
	CONSTRAINT "transactions_amount_check" CHECK ("transactions"."amount" >= 0)
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_name_type_unique" ON "categories" USING btree ("name","type");--> statement-breakpoint
CREATE INDEX "idx_transactions_date" ON "transactions" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "idx_transactions_type_date" ON "transactions" USING btree ("type","transaction_date");--> statement-breakpoint
CREATE INDEX "idx_transactions_category_date" ON "transactions" USING btree ("category_id","transaction_date");--> statement-breakpoint
CREATE INDEX "idx_transactions_date_id_desc" ON "transactions" USING btree ("transaction_date" DESC NULLS LAST,"id" DESC NULLS LAST);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
