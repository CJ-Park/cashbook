import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "입출금 내역",
};

export default function TransactionsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
