import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { transactions } from "@/db/schema";

export async function getTransactionById(id: number) {
  const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);

  return transaction;
}
