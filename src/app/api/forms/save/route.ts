import { NextRequest, NextResponse } from "next/server";
import { saveFormData } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formId, currentStep, isSubmitted, answers, otherAnswers } = body;

    if (!formId || typeof formId !== "string" || formId.length < 6) {
      return NextResponse.json(
        { success: false, error: "شناسه فرم نامعتبر است." },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "ساختار پاسخ‌ها معتبر نیست." },
        { status: 400 }
      );
    }

    const result = await saveFormData({
      formId,
      currentStep: typeof currentStep === "number" ? currentStep : 0,
      isSubmitted: Boolean(isSubmitted),
      answers,
      otherAnswers: otherAnswers || {},
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Save form error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در برقراری ارتباط یا ذخیره‌سازی داده در سرور.",
      },
      { status: 500 }
    );
  }
}
