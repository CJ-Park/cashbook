export type CategoryType = "INCOME" | "EXPENSE" | "COMMON";

export type CategoryRow = {
  id: number;
  name: string;
  type: CategoryType;
  sortOrder: number;
  isActive: boolean;
  transactionCount: number;
};
