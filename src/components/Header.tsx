"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, RefreshCw, ShieldCheck, Check, Copy } from "lucide-react";

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
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (!formId) return;
    navigator.clipboard.writeText(formId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0e17]/85 backdrop-blur-xl border-b border-white/[0.06] transition-all">
      {/* Subtle top edge glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand: Pure Logo & Elegant Typography */}
        <Link
          href="/form1"
          className="flex items-center gap-3.5 group select-none"
        >
          {/* Pure SVG Logo with natural soft aura, completely borderless */}
          <div className="relative flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-105">
            <Image
              src="/icon.svg"
              alt="TalentNet Logo"
              width={34}
              height={34}
              className="w-8 h-8 sm:w-[34px] sm:h-[34px] object-contain drop-shadow-[0_2px_12px_rgba(223,45,216,0.35)] group-hover:drop-shadow-[0_4px_18px_rgba(223,45,216,0.55)] transition-all duration-300"
              priority
            />
          </div>

          {/* Clean Typography */}
          <div className="flex items-baseline gap-2">
            <span className="font-morabba font-bold text-lg sm:text-xl text-white tracking-wide">
              TalentNet
            </span>
            <span className="text-xs sm:text-sm font-light text-indigo-400 font-mono tracking-wider">
              Form
            </span>
            <span className="hidden md:inline-block text-[11px] text-slate-500 font-iransans border-r border-slate-800 pr-2 mr-1">
              پرسش‌نامه شفاف‌سازی پروژه
            </span>
          </div>
        </Link>

        {/* Right side: Minimalist Status & Controls */}
        <div className="flex items-center gap-4 text-xs font-iransans">
          {/* Form ID Minimal Tag */}
          {formId && (
            <button
              type="button"
              onClick={handleCopyId}
              title="برای کپی شناسه کلیک کنید"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-white/[0.05] transition-all cursor-pointer group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 group-hover:bg-indigo-300" />
              <span className="font-mono text-[11px] text-slate-300">
                {formId.slice(0, 10)}
              </span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400 mr-0.5" />
              ) : (
                <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300 mr-0.5" />
              )}
            </button>
          )}

          {/* Live Auto-Save Ambient Indicator */}
          <div className="flex items-center">
            {saveStatus === "saving" && (
              <div className="flex items-center gap-2 text-amber-300/90 text-xs">
                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                <span className="text-[11px] hidden sm:inline">در حال ذخیره...</span>
              </div>
            )}

            {saveStatus === "saved" && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                </span>
                <span className="text-[11px] text-slate-300">ذخیره شد</span>
              </div>
            )}

            {saveStatus === "error" && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[11px] text-rose-300">خطا در ذخیره</span>
                {onRetrySave && (
                  <button
                    onClick={onRetrySave}
                    className="p-1 text-slate-400 hover:text-rose-300 transition-colors"
                    title="تلاش دوباره"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {saveStatus === "idle" && (
              <div className="hidden sm:flex items-center gap-1.5 text-slate-500 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>همگام با سرور</span>
              </div>
            )}
          </div>

          {/* Admin Result Link */}
          <Link
            href="/form1/result"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all text-xs border border-transparent hover:border-white/[0.06]"
            title="ورود به پنل نتایج مدیر"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline text-[11px]">پنل نتایج</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
