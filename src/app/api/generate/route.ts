import { NextResponse } from "next/server";
import {
  generateVideo,
  QuotaExceededError,
  RateLimitError,
} from "@/lib/veo-client";

const MAX_PROMPT_LENGTH = 4096;
// base64 이미지 최대 크기: 20MB
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { prompt, resolution, duration, aspectRatio, modelType, image } =
      body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        {
          error: {
            code: "EMPTY_PROMPT",
            message: "프롬프트를 입력해주세요.",
          },
        },
        { status: 400 }
      );
    }

    // Gap Fix: 프롬프트 길이 제한
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        {
          error: {
            code: "PROMPT_TOO_LONG",
            message: `프롬프트는 ${MAX_PROMPT_LENGTH}자를 초과할 수 없습니다. (현재: ${prompt.length}자)`,
          },
        },
        { status: 400 }
      );
    }

    const validResolutions = ["720p", "1080p", "4k"];
    const validDurations = ["4", "6", "8"];
    const validAspectRatios = ["16:9", "9:16"];
    const validModelTypes = ["standard", "fast"];

    if (!validResolutions.includes(resolution)) {
      return NextResponse.json(
        { error: { code: "INVALID_RESOLUTION", message: "잘못된 해상도입니다." } },
        { status: 400 }
      );
    }
    if (!validDurations.includes(duration)) {
      return NextResponse.json(
        { error: { code: "INVALID_DURATION", message: "잘못된 길이입니다." } },
        { status: 400 }
      );
    }
    if (!validAspectRatios.includes(aspectRatio)) {
      return NextResponse.json(
        { error: { code: "INVALID_ASPECT", message: "잘못된 화면비입니다." } },
        { status: 400 }
      );
    }
    if (!validModelTypes.includes(modelType)) {
      return NextResponse.json(
        { error: { code: "INVALID_MODEL", message: "잘못된 모델 타입입니다." } },
        { status: 400 }
      );
    }

    // 1080p/4k는 8초만 가능
    if ((resolution === "1080p" || resolution === "4k") && duration !== "8") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_COMBO",
            message: "1080p/4K 해상도는 8초 길이만 지원됩니다.",
          },
        },
        { status: 400 }
      );
    }

    // 이미지 유효성 검사
    let imageParam: { imageBytes: string; mimeType: string } | undefined;
    if (image) {
      const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validMimeTypes.includes(image.mimeType)) {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_IMAGE_TYPE",
              message: "지원하지 않는 이미지 형식입니다. (JPEG, PNG, WebP만 가능)",
            },
          },
          { status: 400 }
        );
      }
      if (!image.base64 || typeof image.base64 !== "string") {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_IMAGE_DATA",
              message: "이미지 데이터가 올바르지 않습니다.",
            },
          },
          { status: 400 }
        );
      }
      // base64 크기 검사 (base64는 원본의 ~1.37배)
      if (image.base64.length > MAX_IMAGE_SIZE * 1.37) {
        return NextResponse.json(
          {
            error: {
              code: "IMAGE_TOO_LARGE",
              message: "이미지 크기가 20MB를 초과합니다.",
            },
          },
          { status: 400 }
        );
      }
      imageParam = {
        imageBytes: image.base64,
        mimeType: image.mimeType,
      };
    }

    const result = await generateVideo({
      prompt: prompt.trim(),
      resolution,
      duration,
      aspectRatio,
      modelType,
      personGeneration: body.personGeneration || undefined,
      image: imageParam,
    });

    return NextResponse.json({
      operationName: result.operationName,
      keyIndex: result.keyIndex,
      startedAt: Date.now(),
    });
  } catch (error) {
    console.error("Generate error:", error);

    if (error instanceof QuotaExceededError) {
      return NextResponse.json(
        {
          error: {
            code: "QUOTA_EXCEEDED",
            message: error.message,
          },
        },
        { status: 429 }
      );
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: error.message,
            retryAfterMs: error.retryAfterMs,
          },
        },
        { status: 429 }
      );
    }

    const message =
      error instanceof Error ? error.message : "동영상 생성에 실패했습니다.";

    return NextResponse.json(
      {
        error: {
          code: "GENERATION_FAILED",
          message,
        },
      },
      { status: 500 }
    );
  }
}
