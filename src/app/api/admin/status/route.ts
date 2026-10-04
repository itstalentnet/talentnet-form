import { NextRequest, NextResponse } from "next/server";
import { testGitHubConnection } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret") || req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.ADMIN_ACCESS_SECRET || "admin123456";

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json(
      { success: false, error: "دسترسی غیرمجاز. احراز هویت الزامی است." },
      { status: 401 }
    );
  }

  const githubStatus = await testGitHubConnection();

  return NextResponse.json({
    success: true,
    github: githubStatus,
    adminConfigured: Boolean(process.env.ADMIN_ACCESS_SECRET),
  });
}
