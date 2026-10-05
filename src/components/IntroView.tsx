"use client";

import React from "react";
import { PROJECT_INTRO } from "@/data/questions";
import {
  ArrowLeft,
  Sparkles,
  Compass,
  Target,
  Workflow,
  CheckCircle2,
  FileCheck2,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface IntroViewProps {
  onStart: () => void;
  formId: string;
}

export const IntroView: React.FC<IntroViewProps> = ({ onStart }) => {
  const getSectionIcon = (id: string) => {
    switch (id) {
      case "positioning":
        return <Compass className="w-5 h-5 text-indigo-400" />;
      case "audience-strategy":
        return <Target className="w-5 h-5 text-emerald-400" />;
      case "product-cycle":
        return <Workflow className="w-5 h-5 text-amber-400" />;
      case "summary":
        return <CheckCircle2 className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-300">
      {/* Header Badge & Hero Title */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{PROJECT_INTRO.headerBadge}</span>
        </div>

        <h1 className="font-morabba font-bold text-2xl sm:text-4xl text-white mb-3 tracking-tight leading-snug">
          {PROJECT_INTRO.greeting}
        </h1>

        {/* Quick specs pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-slate-300 font-iransans">
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

      {/* Greeting & Project Intent Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-6 border border-indigo-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-b from-indigo-950/20 via-slate-900/60 to-slate-900/80">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 text-slate-200 text-sm sm:text-[15px] leading-relaxed font-iransans text-justify">
          {PROJECT_INTRO.introParagraphs.map((p, idx) => (
            <p key={idx} className="leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Structured Sections (Positioning, Target, Cycle, Summary) */}
      <div className="space-y-6 mb-8">
        {PROJECT_INTRO.sections.map((sec) => (
          <div
            key={sec.id}
            className="glass-panel rounded-2xl p-6 sm:p-7 border border-slate-800/90 shadow-xl relative overflow-hidden hover:border-slate-700/70 transition-all bg-slate-900/60"
          >
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-4 border-b border-white/[0.06] pb-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                {getSectionIcon(sec.id)}
              </div>
              <h2 className="font-morabba font-bold text-lg sm:text-xl text-white">
                {sec.title}
              </h2>
            </div>

            {/* Paragraphs */}
            <div className="space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed font-iransans text-justify">
              {sec.paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Directions in Summary */}
            {sec.directions && sec.directions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-2.5">
                {sec.directions.map((direction, dIdx) => (
                  <div
                    key={dIdx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-100 text-xs sm:text-sm font-iransans font-medium"
                  >
                    <ArrowUpRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>{direction}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Start Action Button Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl sticky bottom-4 z-20 backdrop-blur-lg">
        <div className="text-right">
          <div className="text-sm font-semibold text-white font-morabba">
            آماده شروع هستید؟
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-iransans">
            پاسخ‌های شما با رفتن به هر مرحله به شکل امن و ابری ذخیره خواهند شد.
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-morabba font-bold text-base shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>شروع تکمیل پرسش‌نامه</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
