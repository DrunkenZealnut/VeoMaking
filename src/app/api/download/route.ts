import { NextRequest, NextResponse } from "next/server";
import { getDownloadUrl } from "@/lib/veo-client";
import { isAuthenticated } from "@/lib/auth";

const ALLOWED_URI_PREFIX = "https://generativelanguage.googleapis.com/";

export async function GET(request: NextRequest) {
  // GAP-02: 서버 측 인증 확인
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "인증이 필요합니다." } },
      { status: 401 }
    );
  }

  const uri = request.nextUrl.searchParams.get("uri");
  const keyIndexParam = request.nextUrl.searchParams.get("keyIndex");

  if (!uri) {
    return NextResponse.json(
      { error: { code: "MISSING_URI", message: "비디오 URI가 필요합니다." } },
      { status: 400 }
    );
  }

  // GAP-01: SSRF 방지 — Google API 도메인만 허용
  if (!uri.startsWith(ALLOWED_URI_PREFIX)) {
    return NextResponse.json(
      { error: { code: "INVALID_URI", message: "허용되지 않는 URI입니다." } },
      { status: 400 }
    );
  }

  const parsedKeyIndex = keyIndexParam != null ? parseInt(keyIndexParam) : undefined;
  // GAP-15: NaN 검증
  const keyIndex = parsedKeyIndex !== undefined && isNaN(parsedKeyIndex) ? 0 : parsedKeyIndex;

  try {
    const downloadUrl = getDownloadUrl(uri, keyIndex);

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: { code: "DOWNLOAD_FAILED", message: "다운로드에 실패했습니다." } },
        { status: 500 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="veo-generated-${Date.now()}.mp4"`,
        "Content-Length": String(arrayBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    const message =
      error instanceof Error ? error.message : "다운로드에 실패했습니다.";
    return NextResponse.json(
      { error: { code: "DOWNLOAD_FAILED", message } },
      { status: 500 }
    );
  }
}
