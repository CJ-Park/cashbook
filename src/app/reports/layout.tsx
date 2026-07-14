import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "통계",
};

export default function ReportsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
