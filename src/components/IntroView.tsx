"use client";

import React from "react";
import Image from "next/image";
import { FORM_META } from "@/data/questions";
import {
  ArrowLeft,
  Sparkles,
  Layers,
  ShieldAlert,
  DollarSign,
  Video,
  Bot,
  Globe2,
  Users2,
  FileCheck2,
} from "lucide-react";

interface IntroViewProps {
  onStart: () => void;
  formId: string;
}

export const IntroView: React.FC<IntroViewProps> = ({ onStart, formId }) => {
  const highlightIcons = [
    Globe2,
    Users2,
    DollarSign,
    Bot,
    FileCheck2,
    Video,
    Sparkles,
    ShieldAlert,
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-300">
      {/* Hero Badge */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>تهیه و استخراج بلوپرینت پلتفرم آنلاین</span>
        </div>

        <h1 className="font-morabba font-bold text-2xl sm:text-4xl text-white mb-3 tracking-tight leading-snug">
          {FORM_META.title}
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-iransans">
          {FORM_META.subtitle}
        </p>

        {/* Quick specs pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>۱۲ بخش تخصصی</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>۵۸ سؤال کاربردی و دقیق</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>ذخیره خودکار مرحله‌به‌مرحله</span>
          </div>
        </div>
      </div>

      {/* Competitor Benchmark Card (Simiaroom) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
            ۱
          </div>
          <div>
            <h2 className="font-morabba font-bold text-lg text-slate-100">
              تحلیل و بنچ‌مارک پلتفرم رقیب (Simiaroom - سیمیاروم)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              یافته‌های کلیدی تیم تحقیق جهت بررسی موقعیت و تمایز محصول شما
            </p>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-6 font-iransans">
          {FORM_META.introParagraphs[0]}
        </p>

        {/* Bullet points grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {FORM_META.introBullets.map((bullet, idx) => {
            const Icon = highlightIcons[idx % highlightIcons.length];
            const [boldPart, ...rest] = bullet.split(":");
            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-3.5 flex items-start gap-3 hover:border-slate-700/80 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex-shrink-0 flex items-center justify-center mt-0.5 text-indigo-400">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs sm:text-[13px] leading-relaxed text-slate-300 font-iransans">
                  <span className="font-semibold text-slate-100">{boldPart}:</span>
                  {rest.join(":")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary note */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 border border-indigo-500/30 rounded-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <p className="font-iransans font-medium text-indigo-200 mb-1">
            📌 راهنمای پاسخ‌دهی:
          </p>
          <p className="text-slate-300 leading-relaxed font-iransans">
            {FORM_META.introConclusion}
          </p>
        </div>
      </div>

      {/* Start Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="text-right">
          <div className="text-sm font-semibold text-white">
            آماده شروع هستید؟
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            پاسخ‌های شما با رفتن به هر مرحله به شکل امن و ابری ذخیره خواهند شد.
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-morabba font-bold text-base shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>شروع تکمیل پرسش‌نامه</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
