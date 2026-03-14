import { NextRequest, NextResponse } from "next/server";
import { getOperationStatus } from "@/lib/veo-client";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // GAP-02: 서버 측 인증 확인
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "인증이 필요합니다." } },
      { status: 401 }
    );
  }

  const operationName = request.nextUrl.searchParams.get("name");
  const keyIndexParam = request.nextUrl.searchParams.get("keyIndex");

  if (!operationName) {
    return NextResponse.json(
      { error: { code: "MISSING_NAME", message: "Operation 이름이 필요합니다." } },
      { status: 400 }
    );
  }

  const parsedKeyIndex = keyIndexParam != null ? parseInt(keyIndexParam) : undefined;
  // GAP-15: NaN 검증
  const keyIndex = parsedKeyIndex !== undefined && isNaN(parsedKeyIndex) ? 0 : parsedKeyIndex;

  try {
    const status = await getOperationStatus(operationName, keyIndex);
    return NextResponse.json(status);
  } catch (error) {
    console.error("Status check error:", error);
    const message =
      error instanceof Error ? error.message : "상태 조회에 실패했습니다.";
    return NextResponse.json(
      { error: { code: "STATUS_FAILED", message } },
      { status: 500 }
    );
  }
}
