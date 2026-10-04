"use client";

import React from "react";
import { SECTIONS } from "@/data/questions";
import { Check } from "lucide-react";

interface ProgressBarProps {
  currentSectionIndex: number;
  totalSections: number;
  onSelectSection: (index: number) => void;
  completedSectionIndices: number[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentSectionIndex,
  totalSections,
  onSelectSection,
  completedSectionIndices,
}) => {
  const currentSection = SECTIONS[currentSectionIndex];
  const progressPercent = Math.round(
    ((currentSectionIndex + 1) / totalSections) * 100
  );
  const remainingSections = totalSections - (currentSectionIndex + 1);

  return (
    <div className="w-full bg-[#0d1322] border-b border-slate-800/80 sticky top-16 z-30 py-3 shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top line: Chapter counter and remaining info */}
        <div className="flex items-center justify-between text-xs sm:text-sm mb-2 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs font-mono">
              فصل {currentSectionIndex + 1} از {totalSections}
            </span>
            <span className="font-morabba font-semibold text-slate-100 text-sm sm:text-base hidden sm:inline">
              {currentSection.title.replace(/^بخش \d+:\s*/, "")}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              {remainingSections === 0
                ? "مرحله نهایی"
                : `${remainingSections} بخش باقی‌مانده`}
            </span>
            <span className="font-mono text-indigo-400 font-semibold">
              {progressPercent}٪
            </span>
          </div>
        </div>

        {/* Continuous progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Micro-steps bar for mobile/desktop scrolling */}
        <div className="flex items-center justify-between gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
          {SECTIONS.map((sec, idx) => {
            const isCurrent = idx === currentSectionIndex;
            const isCompleted = completedSectionIndices.includes(idx);
            const canNavigate = isCompleted || idx <= currentSectionIndex;

            return (
              <button
                key={sec.id}
                type="button"
                disabled={!canNavigate}
                onClick={() => onSelectSection(idx)}
                title={`${sec.title}`}
                className={`flex-1 min-w-[24px] sm:min-w-[28px] h-6 rounded-md flex items-center justify-center text-[10px] sm:text-xs font-mono transition-all ${
                  isCurrent
                    ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 scale-105 border border-indigo-400"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                    : "bg-slate-800/60 text-slate-500 border border-slate-800 hover:text-slate-400"
                } ${!canNavigate ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
