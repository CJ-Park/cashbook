import { relations, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: text("name").notNull(),
    type: text("type", { enum: ["INCOME", "EXPENSE", "COMMON"] }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("categories_type_check", sql`${table.type} in ('INCOME', 'EXPENSE', 'COMMON')`),
    uniqueIndex("idx_categories_name_type_unique").on(table.name, table.type),
  ],
);

export const transactions = pgTable(
  "transactions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    transactionDate: date("transaction_date").notNull(),
    type: text("type", { enum: ["INCOME", "EXPENSE"] }).notNull(),
    categoryId: bigint("category_id", { mode: "number" })
      .notNull()
      .references(() => categories.id),
    title: text("title").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    memo: text("memo"),
    paymentMethod: text("payment_method"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    check("transactions_type_check", sql`${table.type} in ('INCOME', 'EXPENSE')`),
    check("transactions_amount_check", sql`${table.amount} >= 0`),
    index("idx_transactions_date").on(table.transactionDate),
    index("idx_transactions_type_date").on(table.type, table.transactionDate),
    index("idx_transactions_category_date").on(table.categoryId, table.transactionDate),
    index("idx_transactions_date_id_desc").on(table.transactionDate.desc(), table.id.desc()),
  ],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
