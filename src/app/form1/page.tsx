"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header, SaveStatus } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { IntroView } from "@/components/IntroView";
import { CompletionView } from "@/components/CompletionView";
import {
  SECTIONS,
  REQUIRED_QUESTION_IDS,
  OTHER_OPTION_TEXT,
  Question,
} from "@/data/questions";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

// Generate unique form ID
function generateFormId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "tnf_";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function FormContent() {
  const searchParams = useSearchParams();

  // State
  const [formId, setFormId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(-1); // -1 = Intro, 0..11 = Sections, 12 = Completed
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [otherAnswers, setOtherAnswers] = useState<Record<string, string>>({});
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [validationErrors, setValidationErrors] = useState<number[]>([]);
  const [revision, setRevision] = useState<number>(1);
  const [updatedAt, setUpdatedAt] = useState<string>(new Date().toISOString());
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or recover form session
  useEffect(() => {
    const paramId = searchParams.get("id");
    const localId = typeof window !== "undefined" ? localStorage.getItem("tnf_form_id") : null;
    const activeId = paramId || localId || generateFormId();

    setFormId(activeId);
    if (typeof window !== "undefined") {
      localStorage.setItem("tnf_form_id", activeId);
    }

    // Attempt to restore previous answers from localStorage
    try {
      const savedLocal = localStorage.getItem(`tnf_data_${activeId}`);
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.otherAnswers) setOtherAnswers(parsed.otherAnswers);
        if (typeof parsed.currentStep === "number") setCurrentStep(parsed.currentStep);
        if (parsed.completedSections) setCompletedSections(parsed.completedSections);
        if (parsed.revision) setRevision(parsed.revision);
        if (parsed.updatedAt) setUpdatedAt(parsed.updatedAt);
      }
    } catch {
      // ignore
    }

    // Also fetch latest from server in background
    fetch(`/api/forms/${activeId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData?.data) {
          const serverData = resData.data;
          setAnswers((prev) => ({ ...serverData.answers, ...prev }));
          setOtherAnswers((prev) => ({ ...serverData.otherAnswers, ...prev }));
          if (serverData.revision) setRevision(serverData.revision);
          if (serverData.updatedAt) setUpdatedAt(serverData.updatedAt);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsInitialized(true);
      });
  }, [searchParams]);

  // Save to server & localStorage
  const saveToServer = useCallback(
    async (
      overrideAnswers?: Record<string, any>,
      overrideOthers?: Record<string, string>,
      stepToSave?: number,
      markSubmitted?: boolean
    ) => {
      if (!formId) return;

      const payloadAnswers = overrideAnswers || answers;
      const payloadOthers = overrideOthers || otherAnswers;
      const payloadStep = typeof stepToSave === "number" ? stepToSave : currentStep;

      // Update localStorage immediately
      try {
        localStorage.setItem(
          `tnf_data_${formId}`,
          JSON.stringify({
            formId,
            currentStep: payloadStep,
            answers: payloadAnswers,
            otherAnswers: payloadOthers,
            completedSections,
            revision,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore storage errors
      }

      setSaveStatus("saving");

      try {
        const res = await fetch("/api/forms/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formId,
            currentStep: payloadStep,
            isSubmitted: Boolean(markSubmitted),
            answers: payloadAnswers,
            otherAnswers: payloadOthers,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.revision) setRevision(data.revision);
          if (data.updatedAt) setUpdatedAt(data.updatedAt);
          setSaveStatus("saved");
          setTimeout(() => {
            setSaveStatus("idle");
          }, 3000);
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveStatus("error");
      }
    },
    [formId, answers, otherAnswers, currentStep, completedSections, revision]
  );

  // Trigger auto-save debounce on answer changes
  const triggerAutoSave = (
    newAnswers: Record<string, any>,
    newOthers: Record<string, string>
  ) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveToServer(newAnswers, newOthers);
    }, 2000);
  };

  // Change answer handlers
  const handleAnswerChange = (questionId: number, val: any) => {
    const qKey = String(questionId);
    const updated = { ...answers, [qKey]: val };
    setAnswers(updated);

    // Clear validation error if answered
    if (validationErrors.includes(questionId)) {
      setValidationErrors((prev) => prev.filter((id) => id !== questionId));
    }

    triggerAutoSave(updated, otherAnswers);
  };

  const handleOtherChange = (questionId: number, text: string) => {
    const qKey = String(questionId);
    const updatedOthers = { ...otherAnswers, [qKey]: text };
    setOtherAnswers(updatedOthers);
    triggerAutoSave(answers, updatedOthers);
  };

  // Validate section required questions
  const validateCurrentSection = (): boolean => {
    if (currentStep < 0 || currentStep >= SECTIONS.length) return true;

    const currentSec = SECTIONS[currentStep];
    const errors: number[] = [];

    currentSec.questions.forEach((q) => {
      if (q.required) {
        const ans = answers[String(q.id)];
        if (ans === undefined || ans === null || ans === "") {
          errors.push(q.id);
        } else if (Array.isArray(ans) && ans.length === 0) {
          errors.push(q.id);
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Navigation: Next Section
  const handleNextSection = async () => {
    const isValid = validateCurrentSection();
    if (!isValid) {
      // Scroll to first error
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }

    // Mark current section as completed
    if (!completedSections.includes(currentStep)) {
      setCompletedSections((prev) => [...prev, currentStep]);
    }

    const nextStep = currentStep + 1;
    const isFinal = nextStep >= SECTIONS.length;

    // Save state on step transition
    await saveToServer(answers, otherAnswers, isFinal ? 12 : nextStep, isFinal);

    if (isFinal) {
      setCurrentStep(12); // Completed view
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Navigation: Previous Section
  const handlePreviousSection = () => {
    if (currentStep <= 0) {
      setCurrentStep(-1); // Back to intro
    } else {
      setCurrentStep(currentStep - 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Section jumping via progress bar
  const handleSelectSection = (index: number) => {
    if (index === currentStep) return;
    setCurrentStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Start from intro
  const handleStart = () => {
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Review answers from completion view
  const handleReviewAnswers = () => {
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate total answered questions count
  const totalAnsweredCount = Object.keys(answers).filter((k) => {
    const val = answers[k];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== null && val !== "";
  }).length;

  const totalQuestionsCount = SECTIONS.reduce(
    (sum, sec) => sum + sec.questions.length,
    0
  );

  if (!isInitialized) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-iransans">
            در حال بارگذاری فرم...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        saveStatus={saveStatus}
        onRetrySave={() => saveToServer()}
        formId={formId}
        currentStep={currentStep + 1}
        totalSteps={SECTIONS.length}
      />

      {/* Intro View */}
      {currentStep === -1 && (
        <main className="flex-1">
          <IntroView onStart={handleStart} formId={formId} />
        </main>
      )}

      {/* Completion View */}
      {currentStep === 12 && (
        <main className="flex-1">
          <CompletionView
            formId={formId}
            revision={revision}
            updatedAt={updatedAt}
            totalQuestionsAnswered={totalAnsweredCount}
            totalQuestions={totalQuestionsCount}
            onReviewAnswers={handleReviewAnswers}
            answers={answers}
            otherAnswers={otherAnswers}
          />
        </main>
      )}

      {/* Active Section Form */}
      {currentStep >= 0 && currentStep < SECTIONS.length && (
        <main className="flex-1 pb-24 sm:pb-32">
          <ProgressBar
            currentSectionIndex={currentStep}
            totalSections={SECTIONS.length}
            onSelectSection={handleSelectSection}
            completedSectionIndices={completedSections}
          />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 animate-in fade-in duration-200">
            {/* Section Header */}
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-l from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800/80 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>فصل {currentStep + 1} از {SECTIONS.length}</span>
              </div>
              <h2 className="font-morabba font-bold text-xl sm:text-2xl text-white mb-2">
                {SECTIONS[currentStep].title}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-iransans">
                {SECTIONS[currentStep].description}
              </p>
            </div>

            {/* Validation warning banner if any error */}
            {validationErrors.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3 animate-in shake">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <span>
                  لطفاً به سؤالات الزامی مشخص‌شده با نشان قرمز پاسخ دهید تا بتوانید به مرحله بعد بروید.
                </span>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {SECTIONS[currentStep].questions.map((question, qIdx) => {
                const qKey = String(question.id);
                return (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    indexInForm={qIdx}
                    value={answers[qKey]}
                    otherValue={otherAnswers[qKey]}
                    onChange={(val) => handleAnswerChange(question.id, val)}
                    onOtherChange={(text) => handleOtherChange(question.id, text)}
                    showError={validationErrors.includes(question.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* Sticky Bottom Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-800/80 py-3.5 px-4 sm:px-6 shadow-2xl">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              {/* Previous button */}
              <button
                type="button"
                onClick={handlePreviousSection}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-medium transition-all flex items-center gap-2 group"
              >
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span>{currentStep === 0 ? "بازگشت به مقدمه" : "مرحله قبل"}</span>
              </button>

              {/* Center status message for desktop */}
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>پاسخ‌ها به صورت خودکار با رفتن به مرحله بعد ذخیره می‌شوند</span>
              </div>

              {/* Next / Submit button */}
              <button
                type="button"
                onClick={handleNextSection}
                className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-morabba font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>
                  {currentStep === SECTIONS.length - 1
                    ? "ثبت نهایی و دریافت کد پیگیری"
                    : "ذخیره و ادامه"}
                </span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default function FormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-iransans">
              در حال بارگذاری فرم...
            </span>
          </div>
        </div>
      }
    >
      <FormContent />
    </Suspense>
  );
}
