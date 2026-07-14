import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "살림장부",
  title: {
    default: "살림장부",
    template: "%s | 살림장부",
  },
  description: "입금과 출금을 쉽고 편하게 기록하는 우리 가족 장부",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4f7f9",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
