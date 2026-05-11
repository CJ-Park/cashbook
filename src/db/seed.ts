import { categories } from "./schema";
import { closeDbConnection, db } from "./client";

const defaultCategories: Array<{
  name: string;
  type: "INCOME" | "EXPENSE";
  sortOrder: number;
}> = [
  { name: "판매수입", type: "INCOME", sortOrder: 10 },
  { name: "계좌이체", type: "INCOME", sortOrder: 20 },
  { name: "현금입금", type: "INCOME", sortOrder: 30 },
  { name: "환불", type: "INCOME", sortOrder: 40 },
  { name: "기타입금", type: "INCOME", sortOrder: 50 },
  { name: "재료비", type: "EXPENSE", sortOrder: 10 },
  { name: "택배비", type: "EXPENSE", sortOrder: 20 },
  { name: "임대료", type: "EXPENSE", sortOrder: 30 },
  { name: "인건비", type: "EXPENSE", sortOrder: 40 },
  { name: "광고비", type: "EXPENSE", sortOrder: 50 },
  { name: "식비", type: "EXPENSE", sortOrder: 60 },
  { name: "교통비", type: "EXPENSE", sortOrder: 70 },
  { name: "소모품비", type: "EXPENSE", sortOrder: 80 },
  { name: "통신비", type: "EXPENSE", sortOrder: 90 },
  { name: "세금", type: "EXPENSE", sortOrder: 100 },
  { name: "기타출금", type: "EXPENSE", sortOrder: 110 },
];

async function seed() {
  await db
    .insert(categories)
    .values(defaultCategories)
    .onConflictDoNothing({
      target: [categories.name, categories.type],
    });
}

seed()
  .then(async () => {
    await closeDbConnection();
    console.log("Seed completed.");
  })
  .catch(async (error) => {
    await closeDbConnection();
    console.error(error);
    process.exit(1);
  });
