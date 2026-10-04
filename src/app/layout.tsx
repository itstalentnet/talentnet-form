import type { Metadata } from "next";
import { iranSans, morabba } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentNet Form | شفاف‌سازی پروژه پلتفرم مشاوره روان‌شناسی",
  description: "سامانه پرسش‌نامه آنلاین و مرحله‌به‌مرحله استخراج نیازمندی‌های محصولی و فنی",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={`dark ${iranSans.variable} ${morabba.variable}`}>
      <body className="font-iransans bg-[#0b0f19] text-slate-100 min-h-screen selection:bg-indigo-600 selection:text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <div className="relative flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
