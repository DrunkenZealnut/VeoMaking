import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { password } = await request.json();
  const correctPassword = process.env.ACCESS_PASSWORD;

  if (!correctPassword) {
    return NextResponse.json(
      { error: "서버에 ACCESS_PASSWORD가 설정되지 않았습니다." },
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
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
