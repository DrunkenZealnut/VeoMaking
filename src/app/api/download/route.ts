import { NextRequest, NextResponse } from "next/server";
import { getDownloadUrl } from "@/lib/veo-client";

export async function GET(request: NextRequest) {
  const uri = request.nextUrl.searchParams.get("uri");
  const keyIndexParam = request.nextUrl.searchParams.get("keyIndex");

  if (!uri) {
    return NextResponse.json(
      { error: { code: "MISSING_URI", message: "비디오 URI가 필요합니다." } },
      { status: 400 }
    );
  }

  const keyIndex = keyIndexParam != null ? parseInt(keyIndexParam) : undefined;

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
