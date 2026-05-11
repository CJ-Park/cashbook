import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "cashbook",
  description: "어머니 전용 개인 입출금 장부",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
