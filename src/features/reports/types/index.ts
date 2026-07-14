export type MonthlyReportRow = {
  month: number;
  totalIncome: bigint;
  totalExpense: bigint;
  balance: bigint;
};

export type CategoryReportCondition = {
  startDate?: string;
  endDate?: string;
  type?: "INCOME" | "EXPENSE";
  validationError?: string;
};

export type CategoryReportRow = {
  categoryId: number;
  categoryName: string;
  categoryType: "INCOME" | "EXPENSE" | "COMMON";
  totalAmount: bigint;
};
