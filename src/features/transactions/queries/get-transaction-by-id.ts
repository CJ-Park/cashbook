import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { transactions } from "@/db/schema";

export async function getTransactionById(userId: string, id: number) {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1);

  return transaction;
}
