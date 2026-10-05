import { NextRequest, NextResponse } from "next/server";
import { getFormData } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;
    if (!formId) {
      return NextResponse.json({ success: false, error: "شناسه فرم الزامی است." }, { status: 400 });
    }

    const data = await getFormData(formId);
    if (!data) {
      return NextResponse.json({ success: true, data: null, exists: false }, { status: 200 });
    }

    return NextResponse.json({ success: true, data, exists: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "خطا در دریافت اطلاعات فرم." }, { status: 500 });
  }
}
