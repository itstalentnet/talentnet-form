"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SECTIONS, REQUIRED_QUESTION_IDS } from "@/data/questions";
import {
  ShieldCheck,
  Lock,
  Search,
  RefreshCw,
  FileText,
  Clock,
  ArrowRight,
  Download,
  CheckCircle,
  AlertCircle,
  Layers,
  ChevronLeft,
  KeyRound,
  ExternalLink,
} from "lucide-react";

interface FormSummary {
  formId: string;
  updatedAt: string;
  revision: number;
  isSubmitted: boolean;
}

interface FormDetail {
  formId: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
  currentStep: number;
  isSubmitted: boolean;
  answers: Record<string, any>;
  otherAnswers: Record<string, string>;
}

export default function AdminResultPage() {
  const [secret, setSecret] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [formsList, setFormsList] = useState<FormSummary[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedFormData, setSelectedFormData] = useState<FormDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusInfo, setStatusInfo] = useState<any>(null);

  // Auto-login from sessionStorage if already entered
  useEffect(() => {
    const savedSecret = sessionStorage.getItem("tnf_admin_secret");
    if (savedSecret) {
      setSecret(savedSecret);
      verifyAndLoad(savedSecret);
    }
  }, []);

  const verifyAndLoad = async (passcode: string) => {
    setLoading(true);
    setAuthError("");

    try {
      // Test auth and fetch status
      const statusRes = await fetch("/api/admin/status", {
        headers: { "x-admin-secret": passcode },
      });

      if (!statusRes.ok) {
        setIsAuthenticated(false);
        setAuthError("رمز عبور مدیر صحیح نیست.");
        sessionStorage.removeItem("tnf_admin_secret");
        setLoading(false);
        return;
      }

      const statusData = await statusRes.json();
      setStatusInfo(statusData);
      setIsAuthenticated(true);
      sessionStorage.setItem("tnf_admin_secret", passcode);

      // Load forms list
      const formsRes = await fetch("/api/admin/forms", {
        headers: { "x-admin-secret": passcode },
      });
      if (formsRes.ok) {
        const data = await formsRes.json();
        setFormsList(data.forms || []);
        if (data.forms?.length > 0 && !selectedFormId) {
          loadFormDetail(data.forms[0].formId, passcode);
        }
      }
    } catch (err: any) {
      setAuthError("خطا در برقراری ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      setAuthError("لطفاً رمز عبور مدیر را وارد کنید.");
      return;
    }
    verifyAndLoad(secret.trim());
  };

  const loadFormDetail = async (id: string, activeSecret = secret) => {
    setSelectedFormId(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/forms?formId=${id}`, {
        headers: { "x-admin-secret": activeSecret },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedFormData(data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = () => {
    if (!selectedFormData) return;
    const blob = new Blob([JSON.stringify(selectedFormData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `form-result-${selectedFormData.formId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("tnf_admin_secret");
    setIsAuthenticated(false);
    setSecret("");
    setSelectedFormData(null);
    setSelectedFormId(null);
  };

  const filteredForms = formsList.filter((f) =>
    f.formId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-iransans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full bg-[#0a0e17]/85 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/form1" className="flex items-center gap-2.5 group select-none">
            <Image
              src="/icon.svg"
              alt="TalentNet Logo"
              width={30}
              height={30}
              className="w-7 h-7 object-contain drop-shadow-[0_2px_10px_rgba(223,45,216,0.35)] group-hover:scale-105 transition-all"
            />
            <span className="font-morabba font-bold text-base text-white">
              TalentNet
            </span>
            <span className="text-xs font-mono text-indigo-400">
              Admin
            </span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />
          <Link
            href="/form1"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">بازگشت به فرم</span>
          </Link>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => verifyAndLoad(secret)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="بروزرسانی داده‌ها"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs border border-rose-500/30 transition-colors"
            >
              خروج
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {!isAuthenticated ? (
        /* Login Screen */
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h1 className="font-morabba font-bold text-xl text-center text-white mb-2">
              احراز هویت امن مدیر
            </h1>
            <p className="text-xs text-slate-400 text-center mb-6">
              جهت مشاهده نتایج و پاسخ‌های ثبت‌شده، کلید امنیتی (ADMIN_ACCESS_SECRET) را وارد کنید.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">
                  رمز عبور یا کلید دسترسی مدیر
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="رمز عبور مدیر را وارد کنید..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-morabba font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>ورود به پنل نتایج</span>
                )}
              </button>
            </form>
          </div>
        </main>
      ) : (
        /* Authenticated Dashboard */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar: Forms List (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Storage status banner */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 font-medium">وضعیت ذخیره‌سازی ابری:</span>
                {statusInfo?.github?.connected ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>متصل به گیت‌هاب</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>محلی / بدون توکن گیت‌هاب</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {statusInfo?.github?.owner}/{statusInfo?.github?.repo} ({statusInfo?.github?.branch})
              </div>
              {statusInfo?.github?.error && (
                <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-900/50">
                  {statusInfo.github.error}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو با شناسه فرم..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>

            {/* List */}
            <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-2 overflow-y-auto max-h-[600px] space-y-1.5">
              <div className="text-[11px] text-slate-500 px-3 py-1">
                تعداد کل فرم‌ها: {formsList.length}
              </div>

              {filteredForms.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  فرمی یافت نشد.
                </div>
              ) : (
                filteredForms.map((item) => {
                  const isSelected = item.formId === selectedFormId;
                  return (
                    <button
                      key={item.formId}
                      onClick={() => loadFormDetail(item.formId)}
                      className={`w-full text-right p-3 rounded-xl transition-all border ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 text-white"
                          : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-300">
                          {item.formId}
                        </span>
                        {item.isSubmitted ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ارسال نهایی
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            پیش‌نویس
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>نسخه: {item.revision}</span>
                        <span>{new Date(item.updatedAt).toLocaleDateString("fa-IR")}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Details Panel: Form Content (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 overflow-y-auto max-h-[800px]">
            {!selectedFormData ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-slate-500">
                <FileText className="w-12 h-12 mb-3 text-slate-600" />
                <p className="text-sm">یک فرم را از ستون کناری انتخاب کنید تا جزئیات پاسخ‌ها نمایش داده شود.</p>
              </div>
            ) : (
              <div>
                {/* Form Detail Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-morabba font-bold text-xl text-white">
                        جزئیات فرم:
                      </h2>
                      <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 text-sm">
                        {selectedFormData.formId}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                      <span>ایجاد: {new Date(selectedFormData.createdAt).toLocaleString("fa-IR")}</span>
                      <span>آخرین ذخیره: {new Date(selectedFormData.updatedAt).toLocaleString("fa-IR")}</span>
                      <span>نسخه: {selectedFormData.revision}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportJson}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>خروجی JSON</span>
                    </button>
                    <Link
                      href={`/form1?id=${selectedFormData.formId}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs border border-indigo-500/30 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>مشاهده در فرم</span>
                    </Link>
                  </div>
                </div>

                {/* Answers by Section */}
                <div className="space-y-8">
                  {SECTIONS.map((sec) => {
                    const secQuestions = sec.questions;
                    const answeredInSec = secQuestions.filter(
                      (q) => selectedFormData.answers[String(q.id)] !== undefined
                    ).length;

                    return (
                      <div key={sec.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-2">
                          <h3 className="font-morabba font-bold text-base text-indigo-200">
                            {sec.title}
                          </h3>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {answeredInSec} از {secQuestions.length} سؤال پاسخ داده شده
                          </span>
                        </div>

                        <div className="space-y-4">
                          {secQuestions.map((q) => {
                            const qKey = String(q.id);
                            const answerVal = selectedFormData.answers[qKey];
                            const otherVal = selectedFormData.otherAnswers[qKey];
                            const isAnswered =
                              answerVal !== undefined &&
                              answerVal !== null &&
                              answerVal !== "" &&
                              !(Array.isArray(answerVal) && answerVal.length === 0);

                            return (
                              <div
                                key={q.id}
                                className={`p-3.5 rounded-lg border text-xs sm:text-sm ${
                                  isAnswered
                                    ? "bg-slate-900/60 border-slate-800"
                                    : "bg-slate-900/20 border-slate-900 text-slate-500"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <span className="font-medium text-slate-300 font-iransans">
                                    <span className="font-mono text-indigo-400 ml-1">
                                      #{q.subId || q.id}
                                    </span>{" "}
                                    {q.title}
                                  </span>
                                  {q.required && (
                                    <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                                      الزامی
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 text-xs">
                                  {!isAnswered ? (
                                    <span className="text-slate-600 italic">
                                      (پاسخ داده نشده است)
                                    </span>
                                  ) : (
                                    <div className="bg-slate-950/80 p-2.5 rounded-md border border-slate-800/80 text-emerald-300 leading-relaxed font-iransans">
                                      {Array.isArray(answerVal) ? (
                                        <div className="flex flex-wrap gap-1.5">
                                          {answerVal.map((item, i) => (
                                            <span
                                              key={i}
                                              className="bg-indigo-950/60 text-indigo-200 border border-indigo-800/60 px-2 py-0.5 rounded"
                                            >
                                              {item}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span>{String(answerVal)}</span>
                                      )}

                                      {otherVal && (
                                        <div className="mt-1 text-slate-300 border-t border-slate-800 pt-1">
                                          <span className="text-slate-500">توضیح سایر: </span>
                                          <span>{otherVal}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
