import { NextRequest, NextResponse } from "next/server";
import { listAllForms, getFormData } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret") || req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.ADMIN_ACCESS_SECRET || "admin123456";

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json(
      { success: false, error: "دسترسی غیرمجاز. احراز هویت الزامی است." },
      { status: 401 }
    );
  }

  const formId = req.nextUrl.searchParams.get("formId");

  if (formId) {
    const formData = await getFormData(formId);
    if (!formData) {
      return NextResponse.json({ success: false, error: "فرم پیدا نشد." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: formData });
  }

  const forms = await listAllForms();
  return NextResponse.json({ success: true, forms });
}
