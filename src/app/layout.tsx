// 文件路径: src/app/layout.tsx
import type { Metadata } from "next";
// 导入 Geist Sans 字体
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clash Subscription Hub",
  description: "Create & update persistent subscription links for Clash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 将字体应用到整个应用 */}
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}