import { NextRequest, NextResponse } from "next/server";
import { getOperationStatus } from "@/lib/veo-client";

export async function GET(request: NextRequest) {
  const operationName = request.nextUrl.searchParams.get("name");

  if (!operationName) {
    return NextResponse.json(
      { error: { code: "MISSING_NAME", message: "Operation 이름이 필요합니다." } },
      { status: 400 }
    );
  }

  try {
    const status = await getOperationStatus(operationName);
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
