DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM "transactions" WHERE "user_id" IS NULL) THEN
		RAISE EXCEPTION 'transactions.user_id contains NULL rows; assign an owner before migration';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "transactions" AS "transaction"
		INNER JOIN "categories" AS "category"
			ON "category"."id" = "transaction"."category_id"
		WHERE "category"."user_id" IS NULL
	) THEN
		RAISE EXCEPTION 'an ownerless category is referenced by a transaction; resolve it before migration';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "transactions" AS "transaction"
		INNER JOIN "categories" AS "category"
			ON "category"."id" = "transaction"."category_id"
		WHERE "category"."user_id" IS DISTINCT FROM "transaction"."user_id"
	) THEN
		RAISE EXCEPTION 'a transaction and its category have different owners; resolve them before migration';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "categories" AS "category"
		LEFT JOIN "profiles" AS "profile" ON "profile"."id" = "category"."user_id"
		WHERE "category"."user_id" IS NOT NULL AND "profile"."id" IS NULL
	) THEN
		RAISE EXCEPTION 'categories.user_id contains an unknown profile; resolve it before migration';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "transactions" AS "transaction"
		LEFT JOIN "profiles" AS "profile" ON "profile"."id" = "transaction"."user_id"
		WHERE "profile"."id" IS NULL
	) THEN
		RAISE EXCEPTION 'transactions.user_id contains an unknown profile; resolve it before migration';
	END IF;

	IF EXISTS (SELECT 1 FROM "transactions" WHERE "amount" > 999999999999) THEN
		RAISE EXCEPTION 'transactions.amount exceeds the supported maximum; resolve it before migration';
	END IF;

	-- Legacy default categories have no owner and are invisible to every signed-in user.
	-- Only unreferenced rows reach this statement because of the guard above.
	DELETE FROM "categories" WHERE "user_id" IS NULL;
END $$;--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_id_user_unique" ON "categories" USING btree ("id","user_id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_owner_fk" FOREIGN KEY ("category_id","user_id") REFERENCES "public"."categories"("id","user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP INDEX "idx_transactions_user_date";--> statement-breakpoint
CREATE INDEX "idx_transactions_user_date_id_desc" ON "transactions" USING btree ("user_id","transaction_date" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_amount_safe_check" CHECK ("transactions"."amount" <= 999999999999);
