DROP INDEX "idx_categories_name_type_unique";--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "user_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_user_name_type_unique" ON "categories" USING btree ("user_id","name","type");--> statement-breakpoint
CREATE INDEX "idx_categories_user_active" ON "categories" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_date" ON "transactions" USING btree ("user_id","transaction_date");