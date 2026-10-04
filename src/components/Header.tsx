"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface HeaderProps {
  saveStatus?: SaveStatus;
  onRetrySave?: () => void;
  formId?: string;
  currentStep?: number;
  totalSteps?: number;
}

export const Header: React.FC<HeaderProps> = ({
  saveStatus = "idle",
  onRetrySave,
  formId,
  currentStep,
  totalSteps,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Link href="/form1" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon.svg"
                  alt="TalentNet Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-morabba font-bold text-lg text-white tracking-wide">
                  TalentNet Form
                </span>
                <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  نیازسنجی پروژه
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-iransans">
                پلتفرم مشاوره روان‌شناسی آنلاین
              </span>
            </div>
          </Link>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-xs">
          {formId && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/60 text-slate-300 font-mono text-[11px]">
              <span className="text-slate-500 font-iransans">شناسه:</span>
              <span className="font-semibold text-indigo-300 tracking-wider">
                {formId.slice(0, 8)}...
              </span>
            </div>
          )}

          {/* Save Status Badge */}
          {saveStatus === "saving" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>در حال ذخیره...</span>
            </div>
          )}

          {saveStatus === "saved" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ذخیره شد ✓</span>
            </div>
          )}

          {saveStatus === "error" && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>ذخیره ناموفق</span>
              </div>
              {onRetrySave && (
                <button
                  onClick={onRetrySave}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition-colors"
                  title="تلاش مجدد برای ذخیره"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>تلاش مجدد</span>
                </button>
              )}
            </div>
          )}

          {/* Admin link shortcut */}
          <Link
            href="/form1/result"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-700/60"
            title="ورود به پنل نتایج مدیر"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline text-[11px]">پنل نتایج</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
