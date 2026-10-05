"use client";

import React, { useState } from "react";
import { Question, OTHER_OPTION_TEXT, CONSULTATION_OPTION_TEXT } from "@/data/questions";
import { Check, Edit3, HelpCircle, CheckSquare, Square } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  indexInForm: number;
  value: any;
  otherValue?: string;
  onChange: (value: any) => void;
  onOtherChange?: (val: string) => void;
  showError?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  indexInForm,
  value,
  otherValue = "",
  onChange,
  onOtherChange,
  showError = false,
}) => {
  // Build options list
  const baseOptions = question.options ? [...question.options] : [];

  // Check if consultation option should be present and is not already in base
  if (
    question.hasConsultationOption &&
    !baseOptions.includes(CONSULTATION_OPTION_TEXT)
  ) {
    baseOptions.push(CONSULTATION_OPTION_TEXT);
  }

  // Check if other option should be present and is not already in base
  if (question.hasOther && !baseOptions.includes(OTHER_OPTION_TEXT)) {
    baseOptions.push(OTHER_OPTION_TEXT);
  }

  // Handling single choice (T)
  const handleSingleSelect = (option: string) => {
    onChange(option);
  };

  // Handling multiple choice (M)
  const handleMultipleSelect = (option: string) => {
    const currentList: string[] = Array.isArray(value) ? [...value] : [];
    const exists = currentList.includes(option);

    if (exists) {
      onChange(currentList.filter((item) => item !== option));
    } else {
      onChange([...currentList, option]);
    }
  };

  const isOtherSelected =
    question.type === "T"
      ? value === OTHER_OPTION_TEXT
      : Array.isArray(value) && value.includes(OTHER_OPTION_TEXT);

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 border ${
        showError
          ? "bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/20"
          : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80"
      }`}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center mt-0.5">
            {question.subId ? question.subId : question.id}
          </span>
          <div className="flex flex-col flex-1">
            <h3 className="font-iransans font-medium text-slate-100 text-sm sm:text-base leading-relaxed">
              {question.title}
              {question.required && (
                <span className="text-rose-400 font-bold mr-1.5" title="پاسخ به این سؤال الزامی است">
                  *
                </span>
              )}
            </h3>
            <span className="text-[11px] text-slate-400 mt-0.5">
              {question.type === "T" && "یک گزینه را انتخاب کنید"}
              {question.type === "M" && "امکان انتخاب چند گزینه هم‌زمان"}
              {question.type === "OPEN" && "پاسخ تشریحی (اختیاری)"}
            </span>

            {question.description && (
              <div className="flex items-start gap-2.5 mt-2.5 p-3 rounded-xl bg-indigo-950/25 border border-indigo-500/15 text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span className="font-iransans leading-relaxed">{question.description}</span>
              </div>
            )}
          </div>
        </div>

        {question.required && (
          <span className="flex-shrink-0 text-[11px] px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium">
            الزامی
          </span>
        )}
      </div>

      {/* Question Body: Type = T (Single Choice) */}
      {question.type === "T" && (
        <div className="space-y-2.5 mt-3">
          {baseOptions.map((opt, optIdx) => {
            const isSelected = value === opt;
            const isConsultation = opt === CONSULTATION_OPTION_TEXT;
            const isOther = opt === OTHER_OPTION_TEXT;

            return (
              <div key={optIdx} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleSingleSelect(opt)}
                  className={`w-full text-right p-3.5 sm:p-4 rounded-xl border text-sm transition-all flex items-center justify-between group ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500 text-indigo-100 shadow-sm shadow-indigo-500/10"
                      : isConsultation
                      ? "bg-amber-500/5 border-amber-500/20 text-amber-200/90 hover:bg-amber-500/10"
                      : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-indigo-400 bg-indigo-600 text-white"
                          : "border-slate-600 bg-slate-800/80 group-hover:border-slate-500"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="font-iransans">{opt}</span>
                  </div>

                  {isConsultation && (
                    <HelpCircle className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                  )}
                </button>

                {/* Inline text input for "Other" */}
                {isOther && isSelected && onOtherChange && (
                  <div className="mt-2.5 mr-8">
                    <input
                      type="text"
                      value={otherValue}
                      onChange={(e) => onOtherChange(e.target.value)}
                      placeholder="لطفاً پاسخ یا توضیح خود را بنویسید..."
                      className="w-full bg-slate-800/90 border border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Question Body: Type = M (Multiple Choice) */}
      {question.type === "M" && (
        <div className="space-y-2.5 mt-3">
          {baseOptions.map((opt, optIdx) => {
            const isSelected = Array.isArray(value) && value.includes(opt);
            const isConsultation = opt === CONSULTATION_OPTION_TEXT;
            const isOther = opt === OTHER_OPTION_TEXT;

            return (
              <div key={optIdx} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleMultipleSelect(opt)}
                  className={`w-full text-right p-3.5 sm:p-4 rounded-xl border text-sm transition-all flex items-center justify-between group ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500 text-indigo-100 shadow-sm shadow-indigo-500/10"
                      : isConsultation
                      ? "bg-amber-500/5 border-amber-500/20 text-amber-200/90 hover:bg-amber-500/10"
                      : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-indigo-400 bg-indigo-600 text-white"
                          : "border-slate-600 bg-slate-800/80 group-hover:border-slate-500"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="font-iransans">{opt}</span>
                  </div>

                  {isConsultation && (
                    <HelpCircle className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
                  )}
                </button>

                {/* Inline text input for "Other" */}
                {isOther && isSelected && onOtherChange && (
                  <div className="mt-2.5 mr-8">
                    <input
                      type="text"
                      value={otherValue}
                      onChange={(e) => onOtherChange(e.target.value)}
                      placeholder="لطفاً پاسخ یا گزینه‌های مورد نظر خود را بنویسید..."
                      className="w-full bg-slate-800/90 border border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Question Body: Type = OPEN (Paragraph) */}
      {question.type === "OPEN" && (
        <div className="mt-3">
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            placeholder={question.placeholder || "پاسخ یا توضیحات تکمیلی خود را در اینجا بنویسید..."}
            className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-y leading-relaxed"
          />
          <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-500">
            <span>توضیح شفاف و آزاد</span>
            <span>{typeof value === "string" ? value.length : 0} کاراکتر</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {showError && (
        <p className="text-xs text-rose-400 mt-2.5 font-medium flex items-center gap-1.5">
          <span>⚠️ لطفاً به این سؤال الزامی پاسخ دهید تا بتوانید ادامه دهید.</span>
        </p>
      )}
    </div>
  );
};
