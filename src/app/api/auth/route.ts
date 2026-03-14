import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getSessionCookieConfig } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  const correctPassword = process.env.ACCESS_PASSWORD;

  if (!correctPassword) {
    return NextResponse.json(
      { error: { code: "AUTH_MISSING_CONFIG", message: "서버에 ACCESS_PASSWORD가 설정되지 않았습니다." } },
      { status: 500 }
    );
  }

  const success = password === correctPassword;

  // Supabase에 로그인 기록
  try {
    const supabase = getSupabase();
    const userAgent = request.headers.get("user-agent") ?? "";
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    await supabase.from("DDMVote2026").insert({
      action: "login",
      success,
      ip_address: ip,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Supabase logging failed:", e);
  }

  if (!success) {
    return NextResponse.json(
      { error: { code: "AUTH_FAILED", message: "비밀번호가 올바르지 않습니다." } },
      { status: 401 }
    );
  }

  // GAP-02: 세션 쿠키 설정
  const response = NextResponse.json({ ok: true });
  const cookieConfig = getSessionCookieConfig();
  response.cookies.set(cookieConfig.name, cookieConfig.value, {
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    path: cookieConfig.path,
    maxAge: cookieConfig.maxAge,
  });
  return response;
}
