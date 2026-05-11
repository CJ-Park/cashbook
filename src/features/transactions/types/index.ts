export type TransactionType = "INCOME" | "EXPENSE";

export type TransactionSearchCondition = {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: number;
  keyword?: string;
};

export type TransactionRow = {
  id: number;
  transactionDate: string;
  type: TransactionType;
  categoryId: number;
  categoryName: string;
  title: string;
  amount: number;
  memo: string | null;
  paymentMethod: string | null;
};

export type TransactionSearchResult = {
  transactions: TransactionRow[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
};
