export type MonthlyReportRow = {
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export type CategoryReportCondition = {
  startDate?: string;
  endDate?: string;
  type?: "INCOME" | "EXPENSE";
};

export type CategoryReportRow = {
  categoryId: number;
  categoryName: string;
  categoryType: "INCOME" | "EXPENSE" | "COMMON";
  totalAmount: number;
};
