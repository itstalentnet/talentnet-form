"use client";

import React, { useState } from "react";
import { FORM_META } from "@/data/questions";
import { CheckCircle2, Copy, Check, Download, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface CompletionViewProps {
  formId: string;
  revision: number;
  updatedAt: string;
  totalQuestionsAnswered: number;
  totalQuestions: number;
  onReviewAnswers: () => void;
  answers: Record<string, any>;
  otherAnswers: Record<string, string>;
}

export const CompletionView: React.FC<CompletionViewProps> = ({
  formId,
  revision,
  updatedAt,
  totalQuestionsAnswered,
  totalQuestions,
  onReviewAnswers,
  answers,
  otherAnswers,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(formId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const dataToExport = {
      formId,
      revision,
      updatedAt,
      answers,
      otherAnswers,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talentnet-form-${formId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center animate-in zoom-in-95 duration-300">
      {/* Success Badge & Icon */}
      <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span>ثبت نهایی و ذخیره‌سازی ابری تأیید شد</span>
      </div>

      <h1 className="font-morabba font-bold text-2xl sm:text-3xl text-white mb-4">
        اطلاعات با موفقیت ذخیره شد
      </h1>

      {/* Official Confirmation message */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-indigo-500/30 text-slate-200 text-base sm:text-lg font-iransans leading-relaxed mb-8 max-w-2xl mx-auto">
        <p className="font-medium text-indigo-100">
          «{FORM_META.confirmationMessage}»
        </p>
      </div>

      {/* Form Tracking Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8 text-right max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <span className="text-xs text-slate-400">کد پیگیری و شناسه فرم</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            نسخه {revision}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-3">
          <span className="font-mono text-indigo-300 text-sm tracking-widest break-all select-all">
            {formId}
          </span>
          <button
            type="button"
            onClick={handleCopyId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-iransans transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی کد</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-slate-400">
          <div>
            <span>تعداد پاسخ‌های ثبت‌شده: </span>
            <span className="text-slate-200 font-semibold font-mono">
              {totalQuestionsAnswered} از {totalQuestions}
            </span>
          </div>
          <div className="text-left">
            <span>تاریخ ثبت: </span>
            <span className="text-slate-200 font-mono text-[11px]">
              {new Date(updatedAt).toLocaleDateString("fa-IR")}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReviewAnswers}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازبینی و ویرایش پاسخ‌ها</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadJson}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-sm font-medium border border-indigo-500/30 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>دانلود فایل نسخه پشتیبان (JSON)</span>
        </button>
      </div>
    </div>
  );
};
