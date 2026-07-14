export type TransactionType = "INCOME" | "EXPENSE";

export type TransactionSearchCondition = {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: number;
  keyword?: string;
  validationError?: string;
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
  createdAt: Date;
};

export type TransactionCursor = {
  transactionDate: string;
  id: number;
};

export type TransactionPage = {
  transactions: TransactionRow[];
  nextCursor: TransactionCursor | null;
};

export type TransactionSearchResult = {
  transactions: TransactionRow[];
  nextCursor: TransactionCursor | null;
  totalCount: number;
  totalIncome: bigint;
  totalExpense: bigint;
  balance: bigint;
};
