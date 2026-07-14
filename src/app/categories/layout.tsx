import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "카테고리 관리",
};

export default function CategoriesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
